-- Add payeStatus to Payroll
ALTER TABLE "Payroll" ADD COLUMN "payeStatus" TEXT NOT NULL DEFAULT 'OUTSTANDING';

-- Add whtStatus to ConsultantPayment
ALTER TABLE "ConsultantPayment" ADD COLUMN "whtStatus" TEXT NOT NULL DEFAULT 'OUTSTANDING';

-- Create TaxRemittance table
CREATE TABLE "TaxRemittance" (
    "id"                   TEXT NOT NULL,
    "taxType"              TEXT NOT NULL,
    "period"               TEXT NOT NULL,
    "amount"               DOUBLE PRECISION NOT NULL,
    "currency"             TEXT NOT NULL DEFAULT 'MWK',
    "remittanceType"       TEXT NOT NULL DEFAULT 'PAID',
    "proofUrl"             TEXT,
    "proofFilename"        TEXT,
    "status"               TEXT NOT NULL DEFAULT 'PENDING_CEO',
    "fmNote"               TEXT,
    "ceoNote"              TEXT,
    "submittedById"        TEXT NOT NULL,
    "reviewedById"         TEXT,
    "reviewedAt"           TIMESTAMP(3),
    "payrollIds"           TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "consultantPaymentIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxRemittance_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TaxRemittance_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TaxRemittance_reviewedById_fkey"  FOREIGN KEY ("reviewedById")  REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "TaxRemittance_submittedById_idx" ON "TaxRemittance"("submittedById");
CREATE INDEX "TaxRemittance_status_idx"        ON "TaxRemittance"("status");
CREATE INDEX "TaxRemittance_taxType_idx"       ON "TaxRemittance"("taxType");
