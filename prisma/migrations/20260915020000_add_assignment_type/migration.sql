CREATE TYPE "AssignmentType" AS ENUM (
  'THEORY',
  'PRACTICAL',
  'PROJECT',
  'CASE_STUDY'
);

ALTER TABLE "Assignment"
ADD COLUMN "type" "AssignmentType" NOT NULL DEFAULT 'PRACTICAL';
