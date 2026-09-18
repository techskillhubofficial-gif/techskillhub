import { NextResponse } from "next/server";
import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fs from "node:fs/promises";
import path from "node:path";
import { Buffer } from "node:buffer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const COLORS = {
  navy: rgb(0.035, 0.14, 0.32),
  blue: rgb(0.08, 0.34, 0.88),
  blueSoft: rgb(0.94, 0.97, 1),
  green: rgb(0.06, 0.52, 0.34),
  greenSoft: rgb(0.93, 0.98, 0.95),
  text: rgb(0.08, 0.10, 0.14),
  slate: rgb(0.31, 0.36, 0.45),
  muted: rgb(0.48, 0.52, 0.59),
  border: rgb(0.84, 0.87, 0.92),
  light: rgb(0.97, 0.98, 0.99),
  white: rgb(1, 1, 1),
};

function money(value: number) {
  return `Rs. ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Math.max(0, value))}`;
}

function amountInWords(value: number) {
  const number = Math.max(0, Math.round(value));

  if (number === 0) return "Zero Rupees Only";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function twoDigits(n: number): string {
    if (n < 20) return ones[n];
    return `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ""}`;
  }

  function underThousand(n: number): string {
    const parts: string[] = [];
    if (n >= 100) {
      parts.push(`${ones[Math.floor(n / 100)]} Hundred`);
      n %= 100;
    }
    if (n > 0) parts.push(twoDigits(n));
    return parts.join(" ");
  }

  let remaining = number;
  const parts: string[] = [];

  const crore = Math.floor(remaining / 10_000_000);
  remaining %= 10_000_000;

  const lakh = Math.floor(remaining / 100_000);
  remaining %= 100_000;

  const thousand = Math.floor(remaining / 1_000);
  remaining %= 1_000;

  if (crore) parts.push(`${underThousand(crore)} Crore`);
  if (lakh) parts.push(`${underThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${underThousand(thousand)} Thousand`);
  if (remaining) parts.push(underThousand(remaining));

  return `${parts.join(" ")} Rupees Only`;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function label(value: string | null | undefined) {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function paymentMode(value: string) {
  switch (value) {
    case "UPI":
      return "UPI";
    case "BANK_TRANSFER":
      return "Bank Transfer";
    case "RAZORPAY":
      return "Razorpay";
    case "STRIPE":
      return "Stripe";
    case "CASH":
      return "Cash";
    default:
      return "Other";
  }
}

function paymentType(value: string) {
  switch (value) {
    case "REGISTRATION_FEE":
      return "Registration Fee";
    case "COURSE_FEE":
      return "Course Fee";
    case "INSTALLMENT":
      return "Installment";
    case "EMI":
      return "EMI";
    default:
      return "Other";
  }
}

function truncateText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
) {
  const value = String(text || "—");
  if (font.widthOfTextAtSize(value, size) <= maxWidth) return value;

  const suffix = "...";
  let result = value;
  while (
    result.length > 1 &&
    font.widthOfTextAtSize(`${result}${suffix}`, size) > maxWidth
  ) {
    result = result.slice(0, -1);
  }

  return `${result}${suffix}`;
}

function drawTextRight(
  page: PDFPage,
  text: string,
  rightX: number,
  y: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>,
) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: rightX - width, y, size, font, color });
}

function drawSectionHeader(
  page: PDFPage,
  title: string,
  y: number,
  boldFont: PDFFont,
) {
  page.drawText(title.toUpperCase(), {
    x: MARGIN,
    y,
    size: 8.5,
    font: boldFont,
    color: COLORS.blue,
  });

  page.drawLine({
    start: { x: MARGIN + 112, y: y + 2 },
    end: { x: PAGE_WIDTH - MARGIN, y: y + 2 },
    thickness: 0.6,
    color: COLORS.border,
  });

  return y - 20;
}

function drawField(
  page: PDFPage,
  labelText: string,
  value: string,
  x: number,
  y: number,
  width: number,
  regularFont: PDFFont,
  boldFont: PDFFont,
) {
  page.drawText(labelText.toUpperCase(), {
    x,
    y,
    size: 6.7,
    font: boldFont,
    color: COLORS.muted,
  });

  page.drawText(
    truncateText(value, regularFont, 8.8, width),
    {
      x,
      y: y - 14,
      size: 8.8,
      font: regularFont,
      color: COLORS.text,
    },
  );
}

function drawSummaryRow(
  page: PDFPage,
  labelText: string,
  value: string,
  y: number,
  regularFont: PDFFont,
  boldFont: PDFFont,
  emphasis = false,
) {
  page.drawText(labelText, {
    x: MARGIN + 14,
    y,
    size: emphasis ? 8.8 : 8.2,
    font: emphasis ? boldFont : regularFont,
    color: emphasis ? COLORS.navy : COLORS.slate,
  });

  drawTextRight(
    page,
    value,
    PAGE_WIDTH - MARGIN - 14,
    y,
    boldFont,
    emphasis ? 9.4 : 8.7,
    emphasis ? COLORS.navy : COLORS.text,
  );
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const paymentId = id?.trim();

    if (!paymentId) {
      return NextResponse.json(
        { success: false, message: "Payment ID is required." },
        { status: 400 },
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        admission: {
          include: {
            course: true,
            payments: {
              where: { status: PaymentStatus.VERIFIED },
              orderBy: { paymentDate: "asc" },
            },
          },
        },
        receipt: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment not found." },
        { status: 404 },
      );
    }

    if (payment.status !== PaymentStatus.VERIFIED) {
      return NextResponse.json(
        {
          success: false,
          message: "A receipt can only be generated for a verified payment.",
        },
        { status: 409 },
      );
    }

    if (!payment.receipt) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Receipt record is missing. Verify the payment again or repair the receipt record.",
        },
        { status: 409 },
      );
    }

    const verifiedPaid = payment.admission.payments.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const balance = Math.max(0, payment.admission.totalFee - verifiedPaid);
    const courseName = payment.admission.course?.title || payment.admission.program;
    const verifiedAt = payment.verifiedAt || payment.receipt.issuedAt;

    const pdf = await PDFDocument.create();
    const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
    const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

    // Subtle page frame.
    page.drawRectangle({
      x: 18,
      y: 18,
      width: PAGE_WIDTH - 36,
      height: PAGE_HEIGHT - 36,
      borderColor: COLORS.border,
      borderWidth: 0.6,
    });

    let y = PAGE_HEIGHT - 48;

    // -----------------------------------------------------------------------
    // Header
    // -----------------------------------------------------------------------
    const logoPath = path.join(process.cwd(), "public", "logo", "Full-logo.png");

    try {
      const logoBytes = await fs.readFile(logoPath);
      const logo = await pdf.embedPng(logoBytes);
      const scale = Math.min(168 / logo.width, 56 / logo.height);

      page.drawImage(logo, {
        x: MARGIN,
        y: y - logo.height * scale,
        width: logo.width * scale,
        height: logo.height * scale,
      });
    } catch {
      page.drawText("TechSkillHub", {
        x: MARGIN,
        y: y - 20,
        size: 21,
        font: boldFont,
        color: COLORS.navy,
      });
    }

    const metaX = 365;
    page.drawText("PAYMENT RECEIPT", {
      x: metaX,
      y: y - 2,
      size: 15,
      font: boldFont,
      color: COLORS.navy,
    });

    page.drawText("OFFICIAL PAYMENT ACKNOWLEDGEMENT", {
      x: metaX,
      y: y - 18,
      size: 6.7,
      font: boldFont,
      color: COLORS.muted,
    });

    page.drawText(`Receipt No. ${payment.receipt.receiptNumber}`, {
      x: metaX,
      y: y - 34,
      size: 7.7,
      font: regularFont,
      color: COLORS.slate,
    });

    page.drawText(`Issued ${formatDate(payment.receipt.issuedAt)}`, {
      x: metaX,
      y: y - 47,
      size: 7.7,
      font: regularFont,
      color: COLORS.slate,
    });

    page.drawRectangle({
      x: metaX,
      y: y - 69,
      width: 95,
      height: 18,
      color: COLORS.greenSoft,
      borderColor: rgb(0.75, 0.91, 0.82),
      borderWidth: 0.6,
    });
    page.drawText("PAYMENT VERIFIED", {
      x: metaX + 9,
      y: y - 63,
      size: 6.6,
      font: boldFont,
      color: COLORS.green,
    });

    y -= 88;

    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 1.3,
      color: COLORS.blue,
    });

    // -----------------------------------------------------------------------
    // Student / admission information
    // -----------------------------------------------------------------------
    y -= 25;
    y = drawSectionHeader(page, "Student & Admission", y, boldFont);

    const colGap = 22;
    const colWidth = (CONTENT_WIDTH - colGap) / 2;

    drawField(
      page,
      "Student Name",
      payment.admission.studentName,
      MARGIN,
      y,
      colWidth,
      regularFont,
      boldFont,
    );
    drawField(
      page,
      "Admission No.",
      payment.admission.admissionNo,
      MARGIN + colWidth + colGap,
      y,
      colWidth,
      regularFont,
      boldFont,
    );

    drawField(
      page,
      "Email",
      payment.admission.studentEmail,
      MARGIN,
      y - 36,
      colWidth,
      regularFont,
      boldFont,
    );
    drawField(
      page,
      "Phone",
      payment.admission.studentPhone,
      MARGIN + colWidth + colGap,
      y - 36,
      colWidth,
      regularFont,
      boldFont,
    );

    drawField(
      page,
      "Program / Course",
      courseName,
      MARGIN,
      y - 72,
      colWidth,
      regularFont,
      boldFont,
    );
    drawField(
      page,
      "Batch",
      payment.admission.batchName || "Not specified",
      MARGIN + colWidth + colGap,
      y - 72,
      colWidth,
      regularFont,
      boldFont,
    );

    y -= 111;

    // -----------------------------------------------------------------------
    // Payment information / amount received
    // -----------------------------------------------------------------------
    y = drawSectionHeader(page, "Payment Details", y, boldFont);

    page.drawRectangle({
      x: MARGIN,
      y: y - 72,
      width: CONTENT_WIDTH,
      height: 82,
      color: COLORS.blueSoft,
      borderColor: rgb(0.78, 0.85, 0.98),
      borderWidth: 0.7,
    });

    page.drawText("AMOUNT RECEIVED", {
      x: MARGIN + 15,
      y: y - 20,
      size: 6.8,
      font: boldFont,
      color: COLORS.blue,
    });
    page.drawText(money(payment.amount), {
      x: MARGIN + 15,
      y: y - 44,
      size: 18,
      font: boldFont,
      color: COLORS.navy,
    });

    const detailX = 240;
    const detailWidth = CONTENT_WIDTH - (detailX - MARGIN) - 15;

    drawField(
      page,
      "Payment Type",
      paymentType(payment.type),
      detailX,
      y - 16,
      detailWidth / 2 - 8,
      regularFont,
      boldFont,
    );
    drawField(
      page,
      "Payment Mode",
      paymentMode(payment.mode),
      detailX + detailWidth / 2,
      y - 16,
      detailWidth / 2,
      regularFont,
      boldFont,
    );

    drawField(
      page,
      "Payment Date",
      formatDate(payment.paymentDate),
      detailX,
      y - 49,
      detailWidth / 2 - 8,
      regularFont,
      boldFont,
    );
    drawField(
      page,
      "Verified On",
      formatDateTime(verifiedAt),
      detailX + detailWidth / 2,
      y - 49,
      detailWidth / 2,
      regularFont,
      boldFont,
    );

    y -= 101;

    // Reference row.
    page.drawRectangle({
      x: MARGIN,
      y: y - 31,
      width: CONTENT_WIDTH,
      height: 40,
      color: COLORS.white,
      borderColor: COLORS.border,
      borderWidth: 0.7,
    });

    page.drawText("TRANSACTION / PAYMENT REFERENCE", {
      x: MARGIN + 13,
      y: y - 15,
      size: 6.7,
      font: boldFont,
      color: COLORS.muted,
    });

    page.drawText(
      truncateText(
        payment.transactionId || "Not provided",
        regularFont,
        8.5,
        CONTENT_WIDTH - 185,
      ),
      {
        x: MARGIN + 175,
        y: y - 16,
        size: 8.5,
        font: regularFont,
        color: COLORS.text,
      },
    );

    y -= 52;

    // Amount in words.
    page.drawRectangle({
      x: MARGIN,
      y: y - 30,
      width: CONTENT_WIDTH,
      height: 38,
      color: COLORS.light,
      borderColor: COLORS.border,
      borderWidth: 0.6,
    });

    page.drawText("AMOUNT IN WORDS", {
      x: MARGIN + 13,
      y: y - 15,
      size: 6.7,
      font: boldFont,
      color: COLORS.muted,
    });

    page.drawText(
      truncateText(
        amountInWords(payment.amount),
        regularFont,
        8.2,
        CONTENT_WIDTH - 155,
      ),
      {
        x: MARGIN + 105,
        y: y - 16,
        size: 8.2,
        font: regularFont,
        color: COLORS.text,
      },
    );

    y -= 51;

    // -----------------------------------------------------------------------
    // Fee position
    // -----------------------------------------------------------------------
    y = drawSectionHeader(page, "Admission Fee Summary", y, boldFont);

    page.drawRectangle({
      x: MARGIN,
      y: y - 103,
      width: CONTENT_WIDTH,
      height: 112,
      color: COLORS.light,
      borderColor: COLORS.border,
      borderWidth: 0.7,
    });

    drawSummaryRow(
      page,
      "Total Program Fee",
      money(payment.admission.totalFee),
      y - 22,
      regularFont,
      boldFont,
    );
    drawSummaryRow(
      page,
      "Registration Fee",
      money(payment.admission.registrationFee),
      y - 43,
      regularFont,
      boldFont,
    );
    drawSummaryRow(
      page,
      "Total Verified Paid",
      money(verifiedPaid),
      y - 64,
      regularFont,
      boldFont,
      true,
    );

    page.drawLine({
      start: { x: MARGIN + 14, y: y - 74 },
      end: { x: PAGE_WIDTH - MARGIN - 14, y: y - 74 },
      thickness: 0.5,
      color: COLORS.border,
    });

    drawSummaryRow(
      page,
      "Outstanding Balance",
      money(balance),
      y - 94,
      regularFont,
      boldFont,
      true,
    );

    y -= 130;

    // -----------------------------------------------------------------------
    // Acknowledgement block
    // -----------------------------------------------------------------------
    page.drawRectangle({
      x: MARGIN,
      y: y - 70,
      width: CONTENT_WIDTH,
      height: 80,
      color: COLORS.greenSoft,
      borderColor: rgb(0.78, 0.91, 0.84),
      borderWidth: 0.7,
    });

    page.drawText("PAYMENT ACKNOWLEDGED", {
      x: MARGIN + 15,
      y: y - 21,
      size: 9.5,
      font: boldFont,
      color: COLORS.green,
    });

    page.drawText(
      "This payment has been verified and acknowledged by TechSkillHub.",
      {
        x: MARGIN + 15,
        y: y - 38,
        size: 8,
        font: regularFont,
        color: COLORS.slate,
      },
    );

    page.drawText(
      `Receipt issued on ${formatDateTime(payment.receipt.issuedAt)}.`,
      {
        x: MARGIN + 15,
        y: y - 53,
        size: 7.2,
        font: regularFont,
        color: COLORS.muted,
      },
    );

    page.drawText(
      "This receipt acknowledges the payment only; admission approval and enrollment remain subject to TechSkillHub verification.",
      {
        x: MARGIN + 15,
        y: y - 66,
        size: 6.5,
        font: regularFont,
        color: COLORS.muted,
      },
    );

    y -= 102;

    // -----------------------------------------------------------------------
    // Footer
    // -----------------------------------------------------------------------
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 0.7,
      color: COLORS.border,
    });

    page.drawText("TechSkillHub", {
      x: MARGIN,
      y: y - 19,
      size: 8.5,
      font: boldFont,
      color: COLORS.navy,
    });

    page.drawText("Building India's Future Workforce", {
      x: MARGIN,
      y: y - 32,
      size: 7,
      font: regularFont,
      color: COLORS.muted,
    });

    page.drawText(
      "techskillhub.online  |  techskillhubofficial@gmail.com",
      {
        x: MARGIN,
        y: y - 45,
        size: 6.7,
        font: regularFont,
        color: COLORS.muted,
      },
    );

    drawTextRight(
      page,
      "LEARN  |  BUILD  |  EARN",
      PAGE_WIDTH - MARGIN,
      y - 19,
      boldFont,
      7.5,
      COLORS.blue,
    );

    drawTextRight(
      page,
      "Computer-generated receipt · Signature not required",
      PAGE_WIDTH - MARGIN,
      y - 45,
      regularFont,
      6.8,
      COLORS.muted,
    );

    const bytes = await pdf.save();

    return new Response(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${payment.receipt.receiptNumber}.pdf"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("GET Payment Receipt Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate the payment receipt.",
      },
      { status: 500 },
    );
  }
}
