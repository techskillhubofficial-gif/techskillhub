-- TechSkillHub LMS curriculum foundation
-- Additive migration only. No existing rows are deleted or rewritten.

CREATE TABLE "CourseModule" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseModule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LearningResource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'LINK',
    "order" INTEGER NOT NULL DEFAULT 1,
    "lessonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningResource_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Lesson"
    ADD COLUMN "moduleId" TEXT,
    ADD COLUMN "scheduledAt" TIMESTAMP(3),
    ADD COLUMN "endsAt" TIMESTAMP(3),
    ADD COLUMN "meetingUrl" TEXT,
    ADD COLUMN "presentationUrl" TEXT,
    ADD COLUMN "studyMaterialUrl" TEXT,
    ADD COLUMN "instructorNotes" TEXT;

ALTER TABLE "Assignment"
    ADD COLUMN "moduleId" TEXT,
    ADD COLUMN "lessonId" TEXT;

CREATE UNIQUE INDEX "CourseModule_courseId_order_key"
    ON "CourseModule"("courseId", "order");

CREATE INDEX "CourseModule_courseId_idx"
    ON "CourseModule"("courseId");

CREATE INDEX "LearningResource_lessonId_idx"
    ON "LearningResource"("lessonId");

CREATE INDEX "Lesson_moduleId_idx"
    ON "Lesson"("moduleId");

CREATE INDEX "Lesson_scheduledAt_idx"
    ON "Lesson"("scheduledAt");

CREATE INDEX "Assignment_moduleId_idx"
    ON "Assignment"("moduleId");

CREATE INDEX "Assignment_lessonId_idx"
    ON "Assignment"("lessonId");

ALTER TABLE "CourseModule"
    ADD CONSTRAINT "CourseModule_courseId_fkey"
    FOREIGN KEY ("courseId")
    REFERENCES "Course"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE "LearningResource"
    ADD CONSTRAINT "LearningResource_lessonId_fkey"
    FOREIGN KEY ("lessonId")
    REFERENCES "Lesson"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE "Lesson"
    ADD CONSTRAINT "Lesson_moduleId_fkey"
    FOREIGN KEY ("moduleId")
    REFERENCES "CourseModule"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;

ALTER TABLE "Assignment"
    ADD CONSTRAINT "Assignment_moduleId_fkey"
    FOREIGN KEY ("moduleId")
    REFERENCES "CourseModule"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;

ALTER TABLE "Assignment"
    ADD CONSTRAINT "Assignment_lessonId_fkey"
    FOREIGN KEY ("lessonId")
    REFERENCES "Lesson"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
