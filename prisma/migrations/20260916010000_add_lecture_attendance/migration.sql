CREATE TYPE "AttendanceStatus" AS ENUM (
  'PRESENT',
  'ABSENT',
  'LATE',
  'EXCUSED'
);

CREATE TYPE "AttendanceSource" AS ENUM (
  'MANUAL',
  'GOOGLE_MEET'
);

CREATE TABLE "LectureAttendance" (
  "id" TEXT NOT NULL,
  "enrollmentId" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "status" "AttendanceStatus" NOT NULL DEFAULT 'ABSENT',
  "source" "AttendanceSource" NOT NULL DEFAULT 'MANUAL',
  "joinedAt" TIMESTAMP(3),
  "leftAt" TIMESTAMP(3),
  "durationMinutes" INTEGER,
  "notes" TEXT,
  "markedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "LectureAttendance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LectureAttendance_enrollmentId_lessonId_key"
ON "LectureAttendance"("enrollmentId", "lessonId");

CREATE INDEX "LectureAttendance_enrollmentId_idx"
ON "LectureAttendance"("enrollmentId");

CREATE INDEX "LectureAttendance_lessonId_idx"
ON "LectureAttendance"("lessonId");

CREATE INDEX "LectureAttendance_status_idx"
ON "LectureAttendance"("status");

CREATE INDEX "LectureAttendance_source_idx"
ON "LectureAttendance"("source");

CREATE INDEX "LectureAttendance_markedById_idx"
ON "LectureAttendance"("markedById");

ALTER TABLE "LectureAttendance"
ADD CONSTRAINT "LectureAttendance_enrollmentId_fkey"
FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LectureAttendance"
ADD CONSTRAINT "LectureAttendance_lessonId_fkey"
FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LectureAttendance"
ADD CONSTRAINT "LectureAttendance_markedById_fkey"
FOREIGN KEY ("markedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
