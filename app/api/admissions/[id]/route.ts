import { NextResponse } from "next/server";
import {
  AdmissionStatus,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  );
}

function isAdmissionStatus(value: unknown): value is AdmissionStatus {
  return (
    typeof value === "string" &&
    Object.values(AdmissionStatus).includes(value as AdmissionStatus)
  );
}

export async function GET(
  _req: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      return errorResponse("Admission ID is required.");
    }

    const admission = await prisma.admission.findUnique({
      where: {
        id: id.trim(),
      },
      include: {
        lead: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            interestedProgram: true,
            status: true,
          },
        },

        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            emailVerified: true,
          },
        },

        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            level: true,
            duration: true,
            price: true,
            published: true,
          },
        },

        payments: {
          orderBy: {
            paymentDate: "desc",
          },
          include: {
            receipt: {
              select: {
                id: true,
                receiptNumber: true,
                issuedAt: true,
                issuedBy: true,
              },
            },
          },
        },

        // IMPORTANT:
        // The admission detail API must return the same document
        // records that the Documents modal reads. Without this relation,
        // the parent admission state sees documents: [] and displays 0/0.
        documents: {
          orderBy: [
            {
              required: "desc",
            },
            {
              createdAt: "asc",
            },
          ],
        },
      },
    });

    if (!admission) {
      return errorResponse("Admission not found.", 404);
    }

    const verifiedPaid = admission.payments
      .filter((payment) => payment.status === PaymentStatus.VERIFIED)
      .reduce((sum, payment) => sum + payment.amount, 0);

    const pendingPayments = admission.payments
      .filter((payment) => payment.status === PaymentStatus.PENDING)
      .reduce((sum, payment) => sum + payment.amount, 0);

    const failedPayments = admission.payments
      .filter((payment) => payment.status === PaymentStatus.FAILED)
      .reduce((sum, payment) => sum + payment.amount, 0);

    const refundedPayments = admission.payments
      .filter((payment) => payment.status === PaymentStatus.REFUNDED)
      .reduce((sum, payment) => sum + payment.amount, 0);

    const requiredDocuments = admission.documents.filter(
      (document) => document.required,
    );

    const verifiedRequiredDocuments = requiredDocuments.filter(
      (document) => document.status === "VERIFIED",
    );

    return NextResponse.json({
      success: true,
      admission: {
        ...admission,
        documentStats: {
          required: requiredDocuments.length,
          verified: verifiedRequiredDocuments.length,
          allRequiredVerified:
            requiredDocuments.length > 0 &&
            verifiedRequiredDocuments.length === requiredDocuments.length,
        },
        financials: {
          totalFee: admission.totalFee,
          registrationFee: admission.registrationFee,
          verifiedPaid,
          pendingPayments,
          failedPayments,
          refundedPayments,
          balance: Math.max(admission.totalFee - verifiedPaid, 0),
        },
      },
    });
  } catch (error) {
    console.error("GET Admission Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load admission.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      return errorResponse("Admission ID is required.");
    }

    const admission = await prisma.admission.findUnique({
      where: {
        id: id.trim(),
      },
      include: {
        payments: true,
        documents: true,
      },
    });

    if (!admission) {
      return errorResponse("Admission not found.", 404);
    }

    const body = await req.json();

    const requestedStatus = body.status;

    const updateData: Prisma.AdmissionUpdateInput = {};

    if (body.courseId !== undefined) {
      const courseId =
        typeof body.courseId === "string"
          ? body.courseId.trim()
          : "";

      if (courseId) {
        const course = await prisma.course.findUnique({
          where: {
            id: courseId,
          },
          select: {
            id: true,
            title: true,
            price: true,
          },
        });

        if (!course) {
          return errorResponse("Selected course does not exist.", 404);
        }

        updateData.course = {
          connect: {
            id: course.id,
          },
        };

        if (
          !body.program ||
          typeof body.program !== "string"
        ) {
          updateData.program = course.title;
        }
      } else {
        updateData.course = {
          disconnect: true,
        };
      }
    }

    if (typeof body.program === "string") {
      const program = body.program.trim();

      if (program) {
        updateData.program = program;
      }
    }

    if (typeof body.batchName === "string") {
      updateData.batchName = body.batchName.trim() || null;
    }

    if (typeof body.counsellor === "string") {
      updateData.counsellor = body.counsellor.trim() || null;
    }

    if (typeof body.notes === "string") {
      updateData.notes = body.notes.trim() || null;
    }

    if (typeof body.rejectionReason === "string") {
      updateData.rejectionReason =
        body.rejectionReason.trim() || null;
    }

    if (requestedStatus !== undefined) {
      if (!isAdmissionStatus(requestedStatus)) {
        return errorResponse("Invalid admission status.");
      }

      if (
        requestedStatus === AdmissionStatus.ENROLLED
      ) {
        return errorResponse(
          "Enrollment must be completed through the enrollment workflow.",
        );
      }

      const verifiedPaid = admission.payments
        .filter(
          (payment) =>
            payment.status === PaymentStatus.VERIFIED,
        )
        .reduce(
          (sum, payment) => sum + payment.amount,
          0,
        );

      const pendingPayments = admission.payments
        .filter(
          (payment) =>
            payment.status === PaymentStatus.PENDING,
        )
        .reduce(
          (sum, payment) => sum + payment.amount,
          0,
        );

      if (
        requestedStatus ===
          AdmissionStatus.PAYMENT_VERIFICATION &&
        pendingPayments <= 0
      ) {
        return errorResponse(
          "There are no pending payments to verify.",
        );
      }

      if (
        requestedStatus ===
          AdmissionStatus.DOCUMENTS_PENDING &&
        verifiedPaid < admission.registrationFee
      ) {
        return errorResponse(
          `At least ${admission.registrationFee} must be verified before moving the admission to documents pending.`,
        );
      }

      if (
        requestedStatus === AdmissionStatus.APPROVED
      ) {
        if (verifiedPaid < admission.registrationFee) {
          return errorResponse(
            "Verify the registration payment before approving this admission.",
          );
        }

        const requiredDocuments =
          admission.documents.filter(
            (document) => document.required,
          );

        const verifiedRequiredDocuments =
          requiredDocuments.filter(
            (document) =>
              document.status === "VERIFIED",
          );

        if (
          requiredDocuments.length === 0 ||
          verifiedRequiredDocuments.length !==
            requiredDocuments.length
        ) {
          return errorResponse(
            "Every required admission document must be verified before approval.",
          );
        }
      }

      updateData.status = requestedStatus;

      if (requestedStatus === AdmissionStatus.APPROVED) {
        updateData.approvedAt = new Date();
        updateData.rejectedAt = null;
      }

      if (requestedStatus === AdmissionStatus.REJECTED) {
        updateData.rejectedAt = new Date();
        updateData.approvedAt = null;
      }
    }

    const updated = await prisma.admission.update({
      where: {
        id: admission.id,
      },
      data: updateData,
      include: {
        lead: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },

        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            emailVerified: true,
          },
        },

        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            price: true,
            duration: true,
            level: true,
            published: true,
          },
        },

        payments: {
          orderBy: {
            paymentDate: "desc",
          },
          include: {
            receipt: true,
          },
        },

        // Return documents after every admission update so the
        // parent detail state always has an authoritative checklist.
        documents: {
          orderBy: [
            {
              required: "desc",
            },
            {
              createdAt: "asc",
            },
          ],
        },
      },
    });

    const requiredDocuments = updated.documents.filter(
      (document) => document.required,
    );

    const verifiedRequiredDocuments =
      requiredDocuments.filter(
        (document) => document.status === "VERIFIED",
      );

    const verifiedPaid = updated.payments
      .filter(
        (payment) => payment.status === PaymentStatus.VERIFIED,
      )
      .reduce((sum, payment) => sum + payment.amount, 0);

    const pendingPayments = updated.payments
      .filter(
        (payment) => payment.status === PaymentStatus.PENDING,
      )
      .reduce((sum, payment) => sum + payment.amount, 0);

    const failedPayments = updated.payments
      .filter(
        (payment) => payment.status === PaymentStatus.FAILED,
      )
      .reduce((sum, payment) => sum + payment.amount, 0);

    const refundedPayments = updated.payments
      .filter(
        (payment) => payment.status === PaymentStatus.REFUNDED,
      )
      .reduce((sum, payment) => sum + payment.amount, 0);

    return NextResponse.json({
      success: true,
      message: "Admission updated successfully.",
      admission: {
        ...updated,
        documentStats: {
          required: requiredDocuments.length,
          verified: verifiedRequiredDocuments.length,
          allRequiredVerified:
            requiredDocuments.length > 0 &&
            verifiedRequiredDocuments.length ===
              requiredDocuments.length,
        },
        financials: {
          totalFee: updated.totalFee,
          registrationFee: updated.registrationFee,
          verifiedPaid,
          pendingPayments,
          failedPayments,
          refundedPayments,
          balance: Math.max(updated.totalFee - verifiedPaid, 0),
        },
      },
    });
  } catch (error) {
    console.error("PATCH Admission Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update admission.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      return errorResponse("Admission ID is required.");
    }

    const existing = await prisma.admission.findUnique({
      where: {
        id: id.trim(),
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!existing) {
      return errorResponse("Admission not found.", 404);
    }

    if (existing.status === AdmissionStatus.ENROLLED) {
      return errorResponse(
        "Enrolled admissions cannot be deleted.",
      );
    }

    await prisma.admission.delete({
      where: {
        id: existing.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Admission deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE Admission Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete admission.",
      },
      { status: 500 },
    );
  }
}
