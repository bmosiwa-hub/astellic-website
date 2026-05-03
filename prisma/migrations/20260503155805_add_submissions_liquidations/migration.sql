-- CreateEnum
CREATE TYPE "SubmissionType" AS ENUM ('INVOICE', 'REQUEST');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING_FM', 'FM_CHANGES_REQUESTED', 'PENDING_CEO', 'CEO_CHANGES_REQUESTED', 'APPROVED', 'PAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReviewAction" AS ENUM ('APPROVED', 'CHANGES_REQUESTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LiquidationStatus" AS ENUM ('PENDING_FM', 'CHANGES_REQUESTED', 'FM_APPROVED', 'FM_REJECTED');

-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('RECEIPT', 'REFUND_PROOF', 'OVER_EXPENDITURE_PROOF', 'PRIOR_APPROVAL_PROOF');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'STAFF';
ALTER TYPE "Role" ADD VALUE 'CONSULTANT';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "consultantId" TEXT,
ADD COLUMN     "employeeId" TEXT;

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "submittedBy" TEXT NOT NULL,
    "type" "SubmissionType" NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING_FM',
    "projectId" TEXT,
    "milestone" TEXT,
    "purpose" TEXT,
    "requestDate" TIMESTAMP(3),
    "activityDate" TIMESTAMP(3),
    "budgetLine" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'MWK',
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionItem" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "description" TEXT,
    "activityDate" TIMESTAMP(3),
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionReview" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "reviewedBy" TEXT NOT NULL,
    "reviewerRole" TEXT NOT NULL,
    "action" "ReviewAction" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Liquidation" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "submittedBy" TEXT NOT NULL,
    "liquidationDate" TIMESTAMP(3) NOT NULL,
    "activity" TEXT NOT NULL,
    "budgetLine" TEXT NOT NULL,
    "fundsReceived" DOUBLE PRECISION NOT NULL,
    "fundsAccountedFor" DOUBLE PRECISION NOT NULL,
    "refundRequired" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MWK',
    "status" "LiquidationStatus" NOT NULL DEFAULT 'PENDING_FM',
    "fmNote" TEXT,
    "reviewedByName" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Liquidation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiquidationDocument" (
    "id" TEXT NOT NULL,
    "liquidationId" TEXT NOT NULL,
    "docType" "DocType" NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiquidationDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionItem" ADD CONSTRAINT "SubmissionItem_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionReview" ADD CONSTRAINT "SubmissionReview_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionReview" ADD CONSTRAINT "SubmissionReview_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liquidation" ADD CONSTRAINT "Liquidation_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liquidation" ADD CONSTRAINT "Liquidation_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiquidationDocument" ADD CONSTRAINT "LiquidationDocument_liquidationId_fkey" FOREIGN KEY ("liquidationId") REFERENCES "Liquidation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
