-- AlterTable: add per-employee tax and benefit configuration fields
ALTER TABLE "Employee" ADD COLUMN "payeExempt"       BOOLEAN          NOT NULL DEFAULT false;
ALTER TABLE "Employee" ADD COLUMN "nssfApplicable"   BOOLEAN          NOT NULL DEFAULT false;
ALTER TABLE "Employee" ADD COLUMN "nssfEmployeeRate" DOUBLE PRECISION NOT NULL DEFAULT 3;
ALTER TABLE "Employee" ADD COLUMN "nssfEmployerRate" DOUBLE PRECISION NOT NULL DEFAULT 3;
