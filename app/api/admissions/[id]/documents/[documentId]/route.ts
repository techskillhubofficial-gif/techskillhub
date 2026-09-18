import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = [
  "PENDING",
  "UPLOADED",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
] as const;

type DocumentStatus =
  (typeof VALID_STATUSES)[number];

export async function GET(
  _request: NextRequest,
  context: {
    params: Promise<{
      id: string;
      documentId: string;
    }>;
  },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const { id, documentId } =
      await context.params;

    const document =
      await prisma.admissionDocument.findFirst({
        where: {
          id: documentId,
          admissionId: id,
        },
      });

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: document,
      document,
    });
  } catch (error) {
    console.error(
      "GET admission document error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load document.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
      documentId: string;
    }>;
  },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const { id, documentId } =
      await context.params;

    const body = await request.json();

    const requestedStatus =
      String(body.status || "")
        .trim()
        .toUpperCase() as DocumentStatus;

    if (
      !VALID_STATUSES.includes(
        requestedStatus,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid document status.",
        },
        { status: 400 },
      );
    }

    const document =
      await prisma.admissionDocument.findFirst({
        where: {
          id: documentId,
          admissionId: id,
        },
      });

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found.",
        },
        { status: 404 },
      );
    }

    const admission =
      await prisma.admission.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          studentName: true,
          status: true,
          leadId: true,
        },
      });

    if (!admission) {
      return NextResponse.json(
        {
          success: false,
          message: "Admission not found.",
        },
        { status: 404 },
      );
    }

    if (admission.status === "ENROLLED") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Documents cannot be reviewed after enrollment.",
        },
        { status: 400 },
      );
    }

    if (
      requestedStatus === "VERIFIED" &&
      !document.fileUrl
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A document must be uploaded before it can be verified.",
        },
        { status: 400 },
      );
    }

    const rejectionReason = String(
      body.rejectionReason || "",
    ).trim();

    if (
      requestedStatus === "REJECTED" &&
      !rejectionReason
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A rejection reason is required.",
        },
        { status: 400 },
      );
    }

    const updateData: {
      status: DocumentStatus;
      reviewedAt?: Date | null;
      reviewedBy?: string | null;
      rejectionReason?: string | null;
    } = {
      status: requestedStatus,
    };

    if (
      requestedStatus === "VERIFIED"
    ) {
      updateData.reviewedAt =
        new Date();
      updateData.reviewedBy =
        session.user.id;
      updateData.rejectionReason =
        null;
    } else if (
      requestedStatus === "REJECTED"
    ) {
      updateData.reviewedAt =
        new Date();
      updateData.reviewedBy =
        session.user.id;
      updateData.rejectionReason =
        rejectionReason;
    } else {
      updateData.reviewedAt = null;
      updateData.reviewedBy = null;

      if (
        requestedStatus ===
        "UPLOADED"
      ) {
        updateData.rejectionReason =
          null;
      }
    }

    const updatedDocument =
      await prisma.admissionDocument.update({
        where: {
          id: document.id,
        },
        data: updateData,
      });

    // Record an activity only when the admission
    // has a linked lead.
    if (admission.leadId) {
      await prisma.leadActivity
        .create({
          data: {
            leadId:
              admission.leadId,
            type: "UPDATED",
            title:
              requestedStatus ===
              "VERIFIED"
                ? "Admission document verified"
                : requestedStatus ===
                    "REJECTED"
                  ? "Admission document rejected"
                  : "Admission document status updated",
            description:
              requestedStatus ===
              "REJECTED"
                ? `${document.label} rejected: ${rejectionReason}`
                : `${document.label} marked as ${requestedStatus.toLowerCase()}.`,
            createdBy:
              session.user.id,
            metadata: {
              admissionId: id,
              documentId:
                document.id,
              documentType:
                document.documentType,
              status:
                requestedStatus,
              rejectionReason:
                rejectionReason ||
                null,
            },
          },
        })
        .catch((error) => {
          console.error(
            "Document activity logging failed:",
            error,
          );
        });
    }

    return NextResponse.json({
      success: true,
      message:
        requestedStatus ===
        "VERIFIED"
          ? "Document verified successfully."
          : requestedStatus ===
              "REJECTED"
            ? "Document rejected successfully."
            : "Document status updated successfully.",
      data: updatedDocument,
      document: updatedDocument,
    });
  } catch (error) {
    console.error(
      "PATCH admission document error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update document.",
      },
      { status: 500 },
    );
  }
}