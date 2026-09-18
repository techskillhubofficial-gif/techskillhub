-- AlterTable
ALTER TABLE "Lead"
ADD COLUMN "source" TEXT,
ADD COLUMN "closedReason" TEXT,
ADD COLUMN "lastContactedAt" TIMESTAMP(3);

-- CreateEnum
CREATE TYPE "LeadActivityType" AS ENUM (
    'LEAD_CREATED',
    'LEAD_UPDATED',
    'STATUS_CHANGED',
    'NOTE_ADDED',
    'NOTE_UPDATED',
    'ASSIGNED',
    'CALL',
    'WHATSAPP',
    'EMAIL',
    'FOLLOW_UP_CREATED',
    'FOLLOW_UP_COMPLETED',
    'FOLLOW_UP_CANCELLED'
);

-- CreateEnum
CREATE TYPE "LeadFollowUpStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'CANCELLED'
);

-- CreateTable
CREATE TABLE "LeadActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "LeadActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadFollowUp" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" "LeadFollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_assignedTo_idx" ON "Lead"("assignedTo");

-- CreateIndex
CREATE INDEX "Lead_lastContactedAt_idx" ON "Lead"("lastContactedAt");

-- CreateIndex
CREATE INDEX "LeadActivity_leadId_createdAt_idx"
ON "LeadActivity"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "LeadActivity_type_idx"
ON "LeadActivity"("type");

-- CreateIndex
CREATE INDEX "LeadFollowUp_leadId_scheduledAt_idx"
ON "LeadFollowUp"("leadId", "scheduledAt");

-- CreateIndex
CREATE INDEX "LeadFollowUp_status_idx"
ON "LeadFollowUp"("status");

-- CreateIndex
CREATE INDEX "LeadFollowUp_assignedTo_idx"
ON "LeadFollowUp"("assignedTo");

-- AddForeignKey
ALTER TABLE "LeadActivity"
ADD CONSTRAINT "LeadActivity_leadId_fkey"
FOREIGN KEY ("leadId")
REFERENCES "Lead"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadFollowUp"
ADD CONSTRAINT "LeadFollowUp_leadId_fkey"
FOREIGN KEY ("leadId")
REFERENCES "Lead"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;