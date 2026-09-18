-- CreateEnum
CREATE TYPE "TgnMemberType" AS ENUM ('TEAM_LEADER', 'EXECUTIVE');

-- CreateEnum
CREATE TYPE "TgnMemberStatus" AS ENUM ('PENDING', 'ONBOARDING', 'ORIENTATION', 'ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TgnTeamStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TgnApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'APPROVED', 'REJECTED', 'ONBOARDING', 'ORIENTATION', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TgnAuditAction" AS ENUM ('APPLICATION_SUBMITTED', 'APPLICATION_REVIEWED', 'APPLICATION_APPROVED', 'APPLICATION_REJECTED', 'MEMBER_CREATED', 'MEMBER_STATUS_CHANGED', 'TEAM_CREATED', 'TEAM_UPDATED', 'MEMBER_ASSIGNED', 'MEMBER_REASSIGNED', 'MEMBER_REMOVED', 'LEAD_ASSIGNED', 'LEAD_REASSIGNED', 'LEAD_SOURCE_RECORDED');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "tgnOwnerId" TEXT,
ADD COLUMN     "tgnSourceMemberId" TEXT;

-- AlterTable
ALTER TABLE "LeadActivity" ALTER COLUMN "description" SET NOT NULL;

-- CreateTable
CREATE TABLE "TgnMemberProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "memberType" "TgnMemberType" NOT NULL,
    "status" "TgnMemberStatus" NOT NULL DEFAULT 'PENDING',
    "managerId" TEXT,
    "teamId" TEXT,
    "referralCode" TEXT,
    "isNetworkManager" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TgnMemberProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TgnTeam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "status" "TgnTeamStatus" NOT NULL DEFAULT 'ACTIVE',
    "leaderMemberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TgnTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TgnApplication" (
    "id" TEXT NOT NULL,
    "applicationNo" TEXT NOT NULL,
    "memberType" "TgnMemberType" NOT NULL,
    "status" "TgnApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "education" TEXT,
    "occupation" TEXT,
    "organization" TEXT,
    "experience" TEXT,
    "availability" TEXT,
    "workingMode" TEXT,
    "leadershipExperience" TEXT,
    "previousTeamSize" INTEGER,
    "expectedTeamSize" INTEGER,
    "linkedinUrl" TEXT,
    "instagramUrl" TEXT,
    "portfolioUrl" TEXT,
    "responsibilitiesAccepted" BOOLEAN NOT NULL DEFAULT false,
    "declarationsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "marketingPolicyAccepted" BOOLEAN NOT NULL DEFAULT false,
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "declarationSnapshot" JSONB,
    "sourceMemberId" TEXT,
    "userId" TEXT,
    "reviewedById" TEXT,
    "reviewNotes" TEXT,
    "rejectionReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TgnApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TgnAuditEvent" (
    "id" TEXT NOT NULL,
    "action" "TgnAuditAction" NOT NULL,
    "applicationId" TEXT,
    "actorUserId" TEXT,
    "memberId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TgnAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TgnMemberProfile_userId_key" ON "TgnMemberProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TgnMemberProfile_referralCode_key" ON "TgnMemberProfile"("referralCode");

-- CreateIndex
CREATE INDEX "TgnMemberProfile_memberType_idx" ON "TgnMemberProfile"("memberType");

-- CreateIndex
CREATE INDEX "TgnMemberProfile_status_idx" ON "TgnMemberProfile"("status");

-- CreateIndex
CREATE INDEX "TgnMemberProfile_managerId_idx" ON "TgnMemberProfile"("managerId");

-- CreateIndex
CREATE INDEX "TgnMemberProfile_teamId_idx" ON "TgnMemberProfile"("teamId");

-- CreateIndex
CREATE INDEX "TgnMemberProfile_isNetworkManager_idx" ON "TgnMemberProfile"("isNetworkManager");

-- CreateIndex
CREATE UNIQUE INDEX "TgnTeam_leaderMemberId_key" ON "TgnTeam"("leaderMemberId");

-- CreateIndex
CREATE INDEX "TgnTeam_status_idx" ON "TgnTeam"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TgnTeam_code_key" ON "TgnTeam"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TgnApplication_applicationNo_key" ON "TgnApplication"("applicationNo");

-- CreateIndex
CREATE INDEX "TgnApplication_memberType_idx" ON "TgnApplication"("memberType");

-- CreateIndex
CREATE INDEX "TgnApplication_status_idx" ON "TgnApplication"("status");

-- CreateIndex
CREATE INDEX "TgnApplication_email_idx" ON "TgnApplication"("email");

-- CreateIndex
CREATE INDEX "TgnApplication_phone_idx" ON "TgnApplication"("phone");

-- CreateIndex
CREATE INDEX "TgnApplication_sourceMemberId_idx" ON "TgnApplication"("sourceMemberId");

-- CreateIndex
CREATE INDEX "TgnApplication_userId_idx" ON "TgnApplication"("userId");

-- CreateIndex
CREATE INDEX "TgnApplication_reviewedById_idx" ON "TgnApplication"("reviewedById");

-- CreateIndex
CREATE INDEX "TgnApplication_createdAt_idx" ON "TgnApplication"("createdAt");

-- CreateIndex
CREATE INDEX "TgnAuditEvent_applicationId_createdAt_idx" ON "TgnAuditEvent"("applicationId", "createdAt");

-- CreateIndex
CREATE INDEX "TgnAuditEvent_actorUserId_createdAt_idx" ON "TgnAuditEvent"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "TgnAuditEvent_memberId_createdAt_idx" ON "TgnAuditEvent"("memberId", "createdAt");

-- CreateIndex
CREATE INDEX "TgnAuditEvent_action_idx" ON "TgnAuditEvent"("action");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_tgnOwnerId_fkey" FOREIGN KEY ("tgnOwnerId") REFERENCES "TgnMemberProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_tgnSourceMemberId_fkey" FOREIGN KEY ("tgnSourceMemberId") REFERENCES "TgnMemberProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TgnMemberProfile" ADD CONSTRAINT "TgnMemberProfile_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "TgnMemberProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TgnMemberProfile" ADD CONSTRAINT "TgnMemberProfile_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "TgnTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TgnMemberProfile" ADD CONSTRAINT "TgnMemberProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TgnTeam" ADD CONSTRAINT "TgnTeam_leaderMemberId_fkey" FOREIGN KEY ("leaderMemberId") REFERENCES "TgnMemberProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TgnApplication" ADD CONSTRAINT "TgnApplication_sourceMemberId_fkey" FOREIGN KEY ("sourceMemberId") REFERENCES "TgnMemberProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TgnApplication" ADD CONSTRAINT "TgnApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TgnApplication" ADD CONSTRAINT "TgnApplication_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TgnAuditEvent" ADD CONSTRAINT "TgnAuditEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "TgnApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TgnAuditEvent" ADD CONSTRAINT "TgnAuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TgnAuditEvent" ADD CONSTRAINT "TgnAuditEvent_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "TgnMemberProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

