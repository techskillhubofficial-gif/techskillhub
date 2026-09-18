import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown) {
  return cleanString(value).toLowerCase();
}

function normalizePhone(value: unknown) {
  return cleanString(value).replace(/\D/g, "");
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const registrationNo = cleanString(
      searchParams.get("registrationNo")
    ).toUpperCase();

    const email = normalizeEmail(searchParams.get("email"));
    const phone = normalizePhone(searchParams.get("phone"));

    if (!registrationNo || (!email && !phone)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Registration number and applicant email or mobile number are required.",
        },
        { status: 400 }
      );
    }

    const payment = await prisma.registrationPayment.findUnique({
      where: {
        registrationNo,
      },
      select: {
        id: true,
        registrationNo: true,
        studentName: true,
        studentEmail: true,
        studentPhone: true,
        amount: true,
        mode: true,
        status: true,
        applicationId: true,
        submittedAt: true,
        verifiedAt: true,
        rejectionReason: true,
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message: "Registration payment could not be found.",
        },
        { status: 404 }
      );
    }

    const emailMatches =
      Boolean(email) &&
      payment.studentEmail.toLowerCase() === email;

    const phoneMatches =
      Boolean(phone) &&
      normalizePhone(payment.studentPhone) === phone;

    if (!emailMatches && !phoneMatches) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The registration details could not be verified.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        registrationNo: payment.registrationNo,
        studentName: payment.studentName,
        studentEmail: payment.studentEmail,
        studentPhone: payment.studentPhone,
        amount: payment.amount,
        mode: payment.mode,
        status: payment.status,
        applicationId: payment.applicationId,
        submittedAt: payment.submittedAt,
        verifiedAt: payment.verifiedAt,
        rejectionReason:
          payment.status === "FAILED"
            ? payment.rejectionReason
            : null,
        course: payment.course,
      },
    });
  } catch (error) {
    console.error("REGISTRATION_PAYMENT_STATUS_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to check the registration payment status right now.",
      },
      { status: 500 }
    );
  }
}
