CREATE TYPE "AssignmentSubmissionStatus" AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'CHANGES_REQUESTED',
  'GRADED'
);

CREATE TABLE "AssignmentSubmission" (
  "id" TEXT NOT NULL,
  "assignmentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "AssignmentSubmissionStatus" NOT NULL DEFAULT 'DRAFT',
  "content" TEXT,
  "submissionUrl" TEXT,
  "fileUrl" TEXT,
  "score" DOUBLE PRECISION,
  "maxScore" DOUBLE PRECISION,
  "feedback" TEXT,
  "submittedAt" TIMESTAMP(3),
  "reviewedAt" TIMESTAMP(3),
  "reviewedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AssignmentSubmission_pkey"
    PRIMARY KEY ("id"),

  CONSTRAINT "AssignmentSubmission_assignmentId_fkey"
    FOREIGN KEY ("assignmentId")
    REFERENCES "Assignment"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT "AssignmentSubmission_userId_fkey"
    FOREIGN KEY ("userId")
    REFERENCES "User"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT "AssignmentSubmission_reviewedById_fkey"
    FOREIGN KEY ("reviewedById")
    REFERENCES "User"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AssignmentSubmission_assignmentId_userId_key"
  ON "AssignmentSubmission"("assignmentId", "userId");

CREATE INDEX "AssignmentSubmission_assignmentId_idx"
  ON "AssignmentSubmission"("assignmentId");

CREATE INDEX "AssignmentSubmission_userId_idx"
  ON "AssignmentSubmission"("userId");

CREATE INDEX "AssignmentSubmission_status_idx"
  ON "AssignmentSubmission"("status");

CREATE INDEX "AssignmentSubmission_reviewedById_idx"
  ON "AssignmentSubmission"("reviewedById");

CREATE INDEX "AssignmentSubmission_submittedAt_idx"
  ON "AssignmentSubmission"("submittedAt");
