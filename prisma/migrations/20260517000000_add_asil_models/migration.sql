-- CreateEnum
CREATE TYPE "PilotPhase" AS ENUM ('DESIGN', 'IMPLEMENTATION', 'EVALUATION', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "PilotDomain" AS ENUM ('HEALTH', 'GOVERNANCE', 'EDUCATION', 'CLIMATE');

-- CreateEnum
CREATE TYPE "EthicsClearance" AS ENUM ('NOT_REQUIRED', 'PENDING', 'SUBMITTED', 'CLEARED');

-- CreateEnum
CREATE TYPE "KnowledgeProductType" AS ENUM ('LEARNING_REPORT', 'INTELLIGENCE_BRIEF', 'ANNUAL_REVIEW', 'PRACTICE_NOTE', 'WORKING_PAPER');

-- CreateEnum
CREATE TYPE "KnowledgeProductStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "IntelConfidence" AS ENUM ('HIGH', 'MEDIUM', 'PROVISIONAL');

-- CreateEnum
CREATE TYPE "IntelType" AS ENUM ('ADVISORY_IMPLICATION', 'METHODOLOGY_FINDING', 'GOVERNANCE_PATTERN', 'POLITICAL_ECONOMY', 'IMPLEMENTATION_RISK');

-- CreateEnum
CREATE TYPE "IntelTransfer" AS ENUM ('INTERNAL', 'TRANSFERRED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "PilotProfile" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "pilotCode" TEXT NOT NULL,
    "phase" "PilotPhase" NOT NULL DEFAULT 'DESIGN',
    "domain" "PilotDomain" NOT NULL,
    "learningQuestions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "theoryOfChange" TEXT,
    "ethicsClearance" "EthicsClearance" NOT NULL DEFAULT 'NOT_REQUIRED',
    "ethicsClearanceRef" TEXT,
    "implementationSites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "methodologyNotes" TEXT,
    "dataQualityProtocol" TEXT,
    "politicalEconomyNotes" TEXT,
    "adaptiveManagementLog" JSONB NOT NULL DEFAULT '[]',
    "advisoryImplications" TEXT,
    "nullResultsNote" TEXT,
    "context" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PilotProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeProduct" (
    "id" TEXT NOT NULL,
    "pilotId" TEXT,
    "title" TEXT NOT NULL,
    "productType" "KnowledgeProductType" NOT NULL,
    "domain" "PilotDomain" NOT NULL,
    "description" TEXT,
    "advisoryImplications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keyLearnings" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "KnowledgeProductStatus" NOT NULL DEFAULT 'DRAFT',
    "isPublicFacing" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "targetAudience" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "citationRef" TEXT,
    "fileUrl" TEXT,
    "filename" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntelligenceEntry" (
    "id" TEXT NOT NULL,
    "pilotId" TEXT,
    "type" "IntelType" NOT NULL,
    "domain" "PilotDomain" NOT NULL,
    "content" TEXT NOT NULL,
    "confidence" "IntelConfidence" NOT NULL DEFAULT 'PROVISIONAL',
    "geography" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "transferStatus" "IntelTransfer" NOT NULL DEFAULT 'INTERNAL',
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntelligenceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PilotProfile_projectId_key" ON "PilotProfile"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "PilotProfile_pilotCode_key" ON "PilotProfile"("pilotCode");

-- CreateIndex
CREATE INDEX "IntelligenceEntry_domain_type_idx" ON "IntelligenceEntry"("domain", "type");

-- CreateIndex
CREATE INDEX "IntelligenceEntry_transferStatus_idx" ON "IntelligenceEntry"("transferStatus");

-- AddForeignKey
ALTER TABLE "PilotProfile" ADD CONSTRAINT "PilotProfile_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeProduct" ADD CONSTRAINT "KnowledgeProduct_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "PilotProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntelligenceEntry" ADD CONSTRAINT "IntelligenceEntry_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "PilotProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
