-- Phase 4: Budget integrity & compliance
-- Adds BudgetLine and ProcurementThreshold models

CREATE TABLE "BudgetLine" (
  "id"          TEXT         NOT NULL,
  "name"        TEXT         NOT NULL,
  "description" TEXT,
  "category"    TEXT         NOT NULL DEFAULT 'OTHER',
  "projectId"   TEXT,
  "fiscalYear"  INTEGER      NOT NULL,
  "ceiling"     DOUBLE PRECISION,
  "currency"    TEXT         NOT NULL DEFAULT 'MWK',
  "active"      BOOLEAN      NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BudgetLine_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BudgetLine_name_key" UNIQUE ("name")
);

ALTER TABLE "BudgetLine"
  ADD CONSTRAINT "BudgetLine_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "BudgetLine_fiscalYear_idx" ON "BudgetLine"("fiscalYear");
CREATE INDEX "BudgetLine_projectId_idx"  ON "BudgetLine"("projectId");

-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE "ProcurementThreshold" (
  "id"             TEXT         NOT NULL,
  "label"          TEXT         NOT NULL,
  "minAmount"      DOUBLE PRECISION NOT NULL DEFAULT 0,
  "maxAmount"      DOUBLE PRECISION,
  "minQuotations"  INTEGER      NOT NULL DEFAULT 1,
  "requiresTender" BOOLEAN      NOT NULL DEFAULT false,
  "currency"       TEXT         NOT NULL DEFAULT 'MWK',
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProcurementThreshold_pkey" PRIMARY KEY ("id")
);

-- Seed default thresholds (MWK, matching common NGO procurement policies)
INSERT INTO "ProcurementThreshold" ("id","label","minAmount","maxAmount","minQuotations","requiresTender","currency","createdAt","updatedAt") VALUES
  ('thresh_1', 'Direct Purchase',          0,        99999.99,  1, false, 'MWK', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('thresh_2', 'Competitive Quotation',    100000,   999999.99, 3, false, 'MWK', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('thresh_3', 'Request for Proposals',    1000000,  NULL,      3, true,  'MWK', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
