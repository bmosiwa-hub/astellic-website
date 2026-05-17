CREATE TYPE "ConsultantQualification" AS ENUM ('BACHELORS', 'MASTERS', 'PHD', 'PROFESSIONAL_CERT', 'OTHER');

CREATE TABLE "ConsultantRoster" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "profileSummary" TEXT NOT NULL,
  "highestQualification" "ConsultantQualification" NOT NULL DEFAULT 'MASTERS',
  "areasOfExpertise" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "specialisation" TEXT,
  "nationality" TEXT,
  "notes" TEXT,
  "isAvailable" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "ConsultantRoster_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Consultant" ADD COLUMN "rosterProfileId" TEXT;

ALTER TABLE "Consultant" ADD CONSTRAINT "Consultant_rosterProfileId_fkey"
  FOREIGN KEY ("rosterProfileId") REFERENCES "ConsultantRoster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "ConsultantRoster_isAvailable_idx" ON "ConsultantRoster"("isAvailable");
CREATE INDEX "ConsultantRoster_highestQualification_idx" ON "ConsultantRoster"("highestQualification");
CREATE INDEX "Consultant_rosterProfileId_idx" ON "Consultant"("rosterProfileId");
