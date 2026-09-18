CREATE TYPE "TgnCommissionStatus" AS ENUM (
  'PENDING',
  'ELIGIBLE',
  'APPROVED',
  'PAID',
  'REJECTED'
);

CREATE TABLE "TgnCommission" (
  "id" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "leadId" TEXT,
  "admissionId" TEXT,
  "amount" DECIMAL(10,2) NOT NULL,
  "status" "TgnCommissionStatus" NOT NULL DEFAULT 'PENDING',
  "eligibilityReason" TEXT,
  "approvedAt" TIMESTAMP(3),
  "approvedById" TEXT,
  "paidAt" TIMESTAMP(3),
  "paidById" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TgnCommission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TgnCommission_memberId_idx"
  ON "TgnCommission"("memberId");

CREATE INDEX "TgnCommission_leadId_idx"
  ON "TgnCommission"("leadId");

CREATE INDEX "TgnCommission_admissionId_idx"
  ON "TgnCommission"("admissionId");

CREATE INDEX "TgnCommission_status_idx"
  ON "TgnCommission"("status");

CREATE INDEX "TgnCommission_createdAt_idx"
  ON "TgnCommission"("createdAt");

CREATE INDEX "TgnCommission_approvedById_idx"
  ON "TgnCommission"("approvedById");

CREATE INDEX "TgnCommission_paidById_idx"
  ON "TgnCommission"("paidById");

ALTER TABLE "TgnCommission"
  ADD CONSTRAINT "TgnCommission_memberId_fkey"
  FOREIGN KEY ("memberId")
  REFERENCES "TgnMemberProfile"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;
