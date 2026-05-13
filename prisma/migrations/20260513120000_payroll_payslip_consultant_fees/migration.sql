-- Payroll: add pension, additions, notes columns
ALTER TABLE "Payroll" ADD COLUMN "pension"         DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Payroll" ADD COLUMN "pensionEmployer" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Payroll" ADD COLUMN "otherAdditions"  DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Payroll" ADD COLUMN "additionNote"    TEXT;
ALTER TABLE "Payroll" ADD COLUMN "deductionNote"   TEXT;

-- Consultant: professional fee breakdown and WHT rate
ALTER TABLE "Consultant" ADD COLUMN "totalProfessionalFees" DOUBLE PRECISION;
ALTER TABLE "Consultant" ADD COLUMN "otherFees"             DOUBLE PRECISION;
ALTER TABLE "Consultant" ADD COLUMN "withholdingTaxRate"    DOUBLE PRECISION NOT NULL DEFAULT 20;

-- Submission: liquidation deadline (14 days after last activity day)
ALTER TABLE "Submission" ADD COLUMN "liquidationDeadline" TIMESTAMP(3);

-- OverspendingRefund: tracks overspent amounts pending CEO approval for payroll reimbursement
CREATE TABLE "OverspendingRefund" (
    "id"            TEXT             NOT NULL,
    "liquidationId" TEXT             NOT NULL,
    "employeeName"  TEXT             NOT NULL,
    "employeeId"    TEXT,
    "amount"        DOUBLE PRECISION NOT NULL,
    "currency"      TEXT             NOT NULL DEFAULT 'MWK',
    "status"        TEXT             NOT NULL DEFAULT 'PENDING_CEO',
    "ceoNote"       TEXT,
    "payrollId"     TEXT,
    "createdAt"     TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OverspendingRefund_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "OverspendingRefund" ADD CONSTRAINT "OverspendingRefund_liquidationId_fkey"
    FOREIGN KEY ("liquidationId") REFERENCES "Liquidation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OverspendingRefund" ADD CONSTRAINT "OverspendingRefund_payrollId_fkey"
    FOREIGN KEY ("payrollId") REFERENCES "Payroll"("id") ON DELETE SET NULL ON UPDATE CASCADE;
