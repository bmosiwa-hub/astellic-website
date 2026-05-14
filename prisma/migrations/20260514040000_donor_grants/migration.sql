-- Phase 6: Donor grant tracking

CREATE TABLE "DonorGrant" (
  "id"              TEXT             NOT NULL,
  "name"            TEXT             NOT NULL,
  "grantNumber"     TEXT,
  "donorName"       TEXT             NOT NULL,
  "donorType"       TEXT             NOT NULL DEFAULT 'BILATERAL',
  "totalAmount"     DOUBLE PRECISION NOT NULL,
  "currency"        TEXT             NOT NULL DEFAULT 'MWK',
  "startDate"       TIMESTAMP(3)     NOT NULL,
  "endDate"         TIMESTAMP(3),
  "reportingPeriod" TEXT,
  "status"          TEXT             NOT NULL DEFAULT 'ACTIVE',
  "notes"           TEXT,
  "createdAt"       TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "DonorGrant_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DonorGrant_status_idx"    ON "DonorGrant"("status");
CREATE INDEX "DonorGrant_donorName_idx" ON "DonorGrant"("donorName");

-- Link Income to DonorGrant
ALTER TABLE "Income"
  ADD COLUMN "grantId" TEXT;

ALTER TABLE "Income"
  ADD CONSTRAINT "Income_grantId_fkey"
    FOREIGN KEY ("grantId") REFERENCES "DonorGrant"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Link BudgetLine to DonorGrant
ALTER TABLE "BudgetLine"
  ADD COLUMN "grantId" TEXT;

ALTER TABLE "BudgetLine"
  ADD CONSTRAINT "BudgetLine_grantId_fkey"
    FOREIGN KEY ("grantId") REFERENCES "DonorGrant"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "BudgetLine_grantId_idx" ON "BudgetLine"("grantId");
