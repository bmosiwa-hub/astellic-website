-- CreateEnum
CREATE TYPE "IncomeType" AS ENUM ('GRANT', 'PRIVATE_SERVICE', 'DONATION');

-- AlterTable
ALTER TABLE "Income" ADD COLUMN     "incomeType" "IncomeType" NOT NULL DEFAULT 'GRANT';
