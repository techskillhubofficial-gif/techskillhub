import { NextRequest, NextResponse } from "next/server";
import { AdmissionDocumentStatus } from "@prisma/client";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOCUMENT_TYPES = [
  {
    documentType: "GOVERNMENT_ID",
    label: "Aadhaar / Government ID",
    required: true,
  },
  {
    documentType: "PASSPORT_PHOTO",
    label: "Passport-size Photograph",
    required: true,
  },
  {
    documentType: "TENTH_MARKSHEET",
    label: "10th Marksheet",
    required: true,
  },
  {
    documentType: "TWELFTH_MARKSHEET",
    label: "12th Marksheet",
    required: true,
  },
  {
    documentType: "COLLEGE_DOCUMENT",
    label: "College / Graduation Document",
    required: true,
  },
  {
    documentType: "ADDRESS_PROOF",
    label: "Address Proof",
    required: true,
  },
  {
    documentType: "OTHER",
    label: "Other Document",
    required: false,
  },
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  );
}

async function requireSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return session;
}

async function getAdmission(id: string) {
  return prisma.admission.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      status: true,
      studentName: true,
      leadId: true,
    },
  });
}

async function ensureDefaultDocuments(admissionId: string) {
  await Promise.all(
    DOCUMENT_TYPES.map((definition) =>
      prisma.admissionDocument.upsert({
        where: {
          admissionId_documentType: {
            admissionId,
            documentType: definition.documentType,
          },
        },
        update: {
          label: definition.label,
          required: definition.required,
        },
        create: {
          admissionId,
          documentType: definition.documentType,
          label: definition.label,
          required: definition.required,
          status: AdmissionDocumentStatus.PENDING,
        },
      }),
    ),
  );
}

async function logDocumentActivity({
  admissionId,
  leadId,
  studentName,
  documentId,
  documentType,
  description,
  createdBy,
}: {
  admissionId: string;
  leadId: string | null;
  studentName: string;
  documentId: string;
  documentType: string;
  description: string;
  createdBy: string;
}) {
  if (!leadId) {
    return;
  }

  try {
    await prisma.leadActivity.create({
      data: {
        leadId,
        type: "UPDATED",
        title: "Admission document uploaded",
        description,
        createdBy,
        metadata: {
          admissionId,
          documentId,
          documentType,
        },
      },
    });
  } catch (error) {
    console.warn(
      "Admission document activity could not be recorded:",
      error,
    );
  }
}

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const session = await requireSession();

    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const { id } = await context.params;
    const admissionId = id?.trim();

    if (!admissionId) {
      return jsonError("Admission ID is required.");
    }

    const admission = await getAdmission(admissionId);

    if (!admission) {
      return jsonError("Admission not found.", 404);
    }

    await ensureDefaultDocuments(admissionId);

    const documents = await prisma.admissionDocument.findMany({
      where: {
        admissionId,
      },
      orderBy: [
        {
          required: "desc",
        },
        {
          createdAt: "asc",
        },
      ],
    });

    const requiredDocuments = documents.filter(
      (document) => document.required,
    );

    const verifiedRequiredDocuments = requiredDocuments.filter(
      (document) =>
        document.status === AdmissionDocumentStatus.VERIFIED,
    );

    return NextResponse.json({
      success: true,
      data: documents,
      documents,
      stats: {
        total: documents.length,
        required: requiredDocuments.length,
        verifiedRequired: verifiedRequiredDocuments.length,
        requiredVerified:
          requiredDocuments.length > 0 &&
          verifiedRequiredDocuments.length === requiredDocuments.length,
      },
    });
  } catch (error) {
    console.error("GET admission documents error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load admission documents.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const session = await requireSession();

    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const { id } = await context.params;
    const admissionId = id?.trim();

    if (!admissionId) {
      return jsonError("Admission ID is required.");
    }

    const admission = await getAdmission(admissionId);

    if (!admission) {
      return jsonError("Admission not found.", 404);
    }

    if (admission.status === "ENROLLED") {
      return jsonError(
        "Documents cannot be changed after the student is enrolled.",
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    const documentType = String(
      formData.get("documentType") ?? "",
    ).trim();

    const labelFromForm = String(
      formData.get("label") ?? "",
    ).trim();

    if (!(file instanceof File)) {
      return jsonError("Please select a document file.");
    }

    if (!documentType) {
      return jsonError("Document type is required.");
    }

    const documentDefinition = DOCUMENT_TYPES.find(
      (definition) =>
        definition.documentType === documentType,
    );

    if (!documentDefinition) {
      return jsonError("Invalid document type.");
    }

    if (file.size <= 0) {
      return jsonError("The selected file is empty.");
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonError("Document must be 10 MB or smaller.");
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return jsonError(
        "Only PDF, JPG, PNG or WEBP documents are supported.",
      );
    }

    await ensureDefaultDocuments(admissionId);

    const bytes = await file.arrayBuffer();

    const uploadResult = await uploadToCloudinary({
      buffer: Buffer.from(bytes),
      fileName: file.name,
      mimeType: file.type,
      folder: `techskillhub/admissions/${admissionId}`,
    });

    const document = await prisma.admissionDocument.upsert({
      where: {
        admissionId_documentType: {
          admissionId: admissionId,
          documentType,
        },
      },
      update: {
        label:
          labelFromForm ||
          documentDefinition.label,
        status: AdmissionDocumentStatus.UPLOADED,
        fileUrl: uploadResult.secureUrl,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        uploadedAt: new Date(),
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,
      },
      create: {
        admissionId: admissionId,
        documentType,
        label:
          labelFromForm ||
          documentDefinition.label,
        required: documentDefinition.required,
        status: AdmissionDocumentStatus.UPLOADED,
        fileUrl: uploadResult.secureUrl,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        uploadedAt: new Date(),
      },
    });

    await logDocumentActivity({
      admissionId,
      leadId: admission.leadId,
      studentName: admission.studentName,
      documentId: document.id,
      documentType,
      description: `${document.label} uploaded for ${admission.studentName}.`,
      createdBy: session.user.id,
    });

    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully.",
      data: document,
      document,
    });
  } catch (error) {
    console.error("POST admission document error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to upload document.",
      },
      { status: 500 },
    );
  }
}
