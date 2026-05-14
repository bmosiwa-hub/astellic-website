-- Phase 5: Financial period closing

CREATE TABLE "FinancialPeriod" (
  "id"         TEXT         NOT NULL,
  "periodKey"  TEXT         NOT NULL,
  "year"       INTEGER      NOT NULL,
  "month"      INTEGER      NOT NULL,
  "status"     TEXT         NOT NULL DEFAULT 'OPEN',
  "closedAt"   TIMESTAMP(3),
  "closedById" TEXT,
  "lockedAt"   TIMESTAMP(3),
  "lockedById" TEXT,
  "checksum"   TEXT,
  "notes"      TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "FinancialPeriod_pkey"       PRIMARY KEY ("id"),
  CONSTRAINT "FinancialPeriod_periodKey_key" UNIQUE ("periodKey")
);

ALTER TABLE "FinancialPeriod"
  ADD CONSTRAINT "FinancialPeriod_closedById_fkey"
    FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FinancialPeriod"
  ADD CONSTRAINT "FinancialPeriod_lockedById_fkey"
    FOREIGN KEY ("lockedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "FinancialPeriod_year_month_idx" ON "FinancialPeriod"("year", "month");
