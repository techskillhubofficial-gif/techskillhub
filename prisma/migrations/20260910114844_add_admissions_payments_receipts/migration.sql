-- CreateEnum
CREATE TYPE "AdmissionStatus" AS ENUM ('PENDING', 'PAYMENT_VERIFICATION', 'DOCUMENTS_PENDING', 'APPROVED', 'REJECTED', 'ENROLLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('REGISTRATION_FEE', 'COURSE_FEE', 'INSTALLMENT', 'EMI', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('UPI', 'BANK_TRANSFER', 'CASH', 'RAZORPAY', 'STRIPE', 'OTHER');

-- AlterEnum
ALTER TYPE "LeadActivityType" ADD VALUE 'UPDATED';

-- CreateTable
CREATE TABLE "Admission" (
    "id" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "leadId" TEXT,
    "userId" TEXT,
    "courseId" TEXT,
    "studentName" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "studentPhone" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "totalFee" INTEGER NOT NULL,
    "registrationFee" INTEGER NOT NULL DEFAULT 5000,
    "batchName" TEXT,
    "counsellor" TEXT,
    "status" "AdmissionStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "admissionId" TEXT NOT NULL,
    "userId" TEXT,
    "amount" INTEGER NOT NULL,
    "type" "PaymentType" NOT NULL,
    "mode" "PaymentMode" NOT NULL,
    "transactionId" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "proofUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admission_admissionNo_key" ON "Admission"("admissionNo");

-- CreateIndex
CREATE INDEX "Admission_studentName_idx" ON "Admission"("studentName");

-- CreateIndex
CREATE INDEX "Admission_studentEmail_idx" ON "Admission"("studentEmail");

-- CreateIndex
CREATE INDEX "Admission_studentPhone_idx" ON "Admission"("studentPhone");

-- CreateIndex
CREATE INDEX "Admission_program_idx" ON "Admission"("program");

-- CreateIndex
CREATE INDEX "Admission_status_idx" ON "Admission"("status");

-- CreateIndex
CREATE INDEX "Admission_createdAt_idx" ON "Admission"("createdAt");

-- CreateIndex
CREATE INDEX "Admission_leadId_idx" ON "Admission"("leadId");

-- CreateIndex
CREATE INDEX "Admission_userId_idx" ON "Admission"("userId");

-- CreateIndex
CREATE INDEX "Payment_admissionId_idx" ON "Payment"("admissionId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_paymentDate_idx" ON "Payment"("paymentDate");

-- CreateIndex
CREATE INDEX "Payment_type_idx" ON "Payment"("type");

-- CreateIndex
CREATE INDEX "Payment_transactionId_idx" ON "Payment"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_receiptNumber_key" ON "Receipt"("receiptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_paymentId_key" ON "Receipt"("paymentId");

-- CreateIndex
CREATE INDEX "Receipt_issuedAt_idx" ON "Receipt"("issuedAt");

-- CreateIndex
CREATE INDEX "Enrollment_userId_idx" ON "Enrollment"("userId");

-- CreateIndex
CREATE INDEX "Enrollment_courseId_idx" ON "Enrollment"("courseId");

-- CreateIndex
CREATE INDEX "Enrollment_status_idx" ON "Enrollment"("status");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_phone_idx" ON "Lead"("phone");

-- CreateIndex
CREATE INDEX "LeadFollowUp_status_scheduledAt_idx" ON "LeadFollowUp"("status", "scheduledAt");

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "Admission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
