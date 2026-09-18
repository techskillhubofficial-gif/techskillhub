-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM (
    'UPCOMING',
    'ACTIVE',
    'COMPLETED',
    'ARCHIVED'
);

-- CreateTable
CREATE TABLE "CourseBatch" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "status" "BatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "instructorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseBatch_pkey" PRIMARY KEY ("id")
);

-- Add batch relation to enrollments
ALTER TABLE "Enrollment"
ADD COLUMN "batchId" TEXT;

-- Create indexes
CREATE INDEX "CourseBatch_courseId_idx"
ON "CourseBatch"("courseId");

CREATE INDEX "CourseBatch_status_idx"
ON "CourseBatch"("status");

CREATE INDEX "CourseBatch_instructorId_idx"
ON "CourseBatch"("instructorId");

CREATE UNIQUE INDEX "CourseBatch_courseId_code_key"
ON "CourseBatch"("courseId", "code");

CREATE INDEX "Enrollment_batchId_idx"
ON "Enrollment"("batchId");

-- Foreign keys
ALTER TABLE "CourseBatch"
ADD CONSTRAINT "CourseBatch_courseId_fkey"
FOREIGN KEY ("courseId")
REFERENCES "Course"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "CourseBatch"
ADD CONSTRAINT "CourseBatch_instructorId_fkey"
FOREIGN KEY ("instructorId")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Enrollment"
ADD CONSTRAINT "Enrollment_batchId_fkey"
FOREIGN KEY ("batchId")
REFERENCES "CourseBatch"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
