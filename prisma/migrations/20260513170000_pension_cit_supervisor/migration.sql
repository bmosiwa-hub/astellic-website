-- Add pension status to Payroll
ALTER TABLE "Payroll" ADD COLUMN "pensionStatus" TEXT NOT NULL DEFAULT 'OUTSTANDING';

-- Add pensionIds array to TaxRemittance
ALTER TABLE "TaxRemittance" ADD COLUMN "pensionIds" TEXT[] NOT NULL DEFAULT '{}';

-- Add supervisorId to Consultant
ALTER TABLE "Consultant" ADD COLUMN "supervisorId" TEXT;
ALTER TABLE "Consultant" ADD CONSTRAINT "Consultant_supervisorId_fkey"
  FOREIGN KEY ("supervisorId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
