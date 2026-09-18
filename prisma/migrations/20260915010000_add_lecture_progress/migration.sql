CREATE TABLE "LectureProgress" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3),
    "lastViewedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LectureProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LectureProgress_enrollmentId_lessonId_key"
ON "LectureProgress"("enrollmentId", "lessonId");

CREATE INDEX "LectureProgress_enrollmentId_idx"
ON "LectureProgress"("enrollmentId");

CREATE INDEX "LectureProgress_lessonId_idx"
ON "LectureProgress"("lessonId");

CREATE INDEX "LectureProgress_completed_idx"
ON "LectureProgress"("completed");

ALTER TABLE "LectureProgress"
ADD CONSTRAINT "LectureProgress_enrollmentId_fkey"
FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LectureProgress"
ADD CONSTRAINT "LectureProgress_lessonId_fkey"
FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
