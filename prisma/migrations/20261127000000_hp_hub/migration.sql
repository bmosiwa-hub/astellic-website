-- CreateEnum
CREATE TYPE "HpRole" AS ENUM ('SUPER_ADMIN', 'REPO_ADMIN', 'EDITOR', 'CONTRIBUTOR');

-- CreateEnum
CREATE TYPE "HpPublicationStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "HpVerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING_VERIFICATION', 'VERIFIED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "HpAccessType" AS ENUM ('HOSTED', 'EXTERNAL', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "HpPermissionStatus" AS ENUM ('UNKNOWN', 'NOT_REQUIRED', 'REQUESTED', 'GRANTED', 'OPEN_LICENSE', 'DENIED');

-- CreateEnum
CREATE TYPE "HpAcquisitionStatus" AS ENUM ('ACQUIRED', 'MISSING', 'NEEDS_VERIFICATION', 'BROKEN_LINK', 'PERMISSION_REQUIRED', 'NEEDS_UPDATING');

-- CreateEnum
CREATE TYPE "HpSubmissionStatus" AS ENUM ('NEW', 'IN_REVIEW', 'ACCEPTED', 'REJECTED', 'DUPLICATE');

-- CreateEnum
CREATE TYPE "HpFeedbackType" AS ENUM ('CORRECTION', 'BROKEN_LINK', 'TAKEDOWN', 'ACCESS_REQUEST', 'OTHER');

-- CreateEnum
CREATE TYPE "HpFeedbackStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "HpActivityKind" AS ENUM ('NOTE', 'OUTREACH', 'EVIDENCE', 'STATUS_CHANGE', 'TASK');

-- CreateEnum
CREATE TYPE "HpRecipientType" AS ENUM ('MINISTRY', 'GOVERNMENT_INSTITUTION', 'RESEARCHER', 'UNIVERSITY', 'NGO', 'DONOR', 'IMPLEMENTING_PARTNER', 'OTHER');

-- CreateEnum
CREATE TYPE "HpOutreachStatus" AS ENUM ('DRAFT', 'SENT', 'AWAITING_RESPONSE', 'RESPONDED', 'DOCUMENT_RECEIVED', 'DECLINED', 'NO_RESPONSE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "astelfinAccess" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "HpMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "HpRole" NOT NULL DEFAULT 'CONTRIBUTOR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "grantedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HpMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HpCountry" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isoCode" TEXT NOT NULL,
    "intro" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HpCountry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HpTheme" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "HpTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HpDocumentType" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HpDocumentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HpPublisher" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT,
    "website" TEXT,
    "countryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HpPublisher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HpKeyword" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "HpKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HpDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "documentTypeId" TEXT NOT NULL,
    "publisherId" TEXT NOT NULL,
    "primaryThemeId" TEXT,
    "authors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "publicationYear" INTEGER,
    "publicationDate" TIMESTAMP(3),
    "startYear" INTEGER,
    "endYear" INTEGER,
    "description" TEXT,
    "abstract" TEXT,
    "language" TEXT NOT NULL DEFAULT 'English',
    "version" TEXT,
    "edition" TEXT,
    "citationText" TEXT,
    "notes" TEXT,
    "sourceUrl" TEXT,
    "storageProvider" TEXT,
    "storagePath" TEXT,
    "fileName" TEXT,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "accessType" "HpAccessType" NOT NULL DEFAULT 'EXTERNAL',
    "rightsStatement" TEXT,
    "rightsHolder" TEXT,
    "permissionStatus" "HpPermissionStatus" NOT NULL DEFAULT 'UNKNOWN',
    "status" "HpPublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "verificationStatus" "HpVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "verificationNotes" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isSynthetic" BOOLEAN NOT NULL DEFAULT false,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "supersededById" TEXT,
    "createdById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "searchVector" tsvector,

    CONSTRAINT "HpDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HpDocumentTheme" (
    "documentId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,

    CONSTRAINT "HpDocumentTheme_pkey" PRIMARY KEY ("documentId","themeId")
);

-- CreateTable
CREATE TABLE "HpDocumentKeyword" (
    "documentId" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,

    CONSTRAINT "HpDocumentKeyword_pkey" PRIMARY KEY ("documentId","keywordId")
);

-- CreateTable
CREATE TABLE "HpRelatedDocument" (
    "documentId" TEXT NOT NULL,
    "relatedId" TEXT NOT NULL,

    CONSTRAINT "HpRelatedDocument_pkey" PRIMARY KEY ("documentId","relatedId")
);

-- CreateTable
CREATE TABLE "HpDocumentVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "versionLabel" TEXT,
    "storageProvider" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "note" TEXT,
    "replacedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "replacedById" TEXT,

    CONSTRAINT "HpDocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HpDownloadEvent" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "day" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "country" TEXT,
    "referrerHost" TEXT,
    "visitorHash" TEXT NOT NULL,

    CONSTRAINT "HpDownloadEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HpSubmission" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "countryId" TEXT,
    "publisherName" TEXT,
    "documentTypeName" TEXT,
    "year" INTEGER,
    "sourceUrl" TEXT,
    "storageProvider" TEXT,
    "storagePath" TEXT,
    "fileName" TEXT,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "submitterName" TEXT NOT NULL,
    "submitterEmail" TEXT NOT NULL,
    "info" TEXT,
    "status" "HpSubmissionStatus" NOT NULL DEFAULT 'NEW',
    "reviewNotes" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "documentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HpSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HpFeedback" (
    "id" TEXT NOT NULL,
    "documentId" TEXT,
    "type" "HpFeedbackType" NOT NULL,
    "message" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "organisation" TEXT,
    "status" "HpFeedbackStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HpFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HpAcquisitionItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "publisherId" TEXT,
    "publisherName" TEXT,
    "documentTypeId" TEXT,
    "year" INTEGER,
    "evidence" TEXT,
    "sourceUrl" TEXT,
    "status" "HpAcquisitionStatus" NOT NULL DEFAULT 'MISSING',
    "unavailableReason" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "ownerId" TEXT,
    "nextAction" TEXT,
    "nextActionDue" TIMESTAMP(3),
    "notes" TEXT,
    "documentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HpAcquisitionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HpAcquisitionActivity" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "kind" "HpActivityKind" NOT NULL,
    "body" TEXT NOT NULL,
    "attachmentPath" TEXT,
    "attachmentName" TEXT,
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HpAcquisitionActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HpRequestTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HpRequestTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HpOutreachRequest" (
    "id" TEXT NOT NULL,
    "itemId" TEXT,
    "templateId" TEXT,
    "recipientName" TEXT NOT NULL,
    "recipientOrg" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "recipientType" "HpRecipientType" NOT NULL DEFAULT 'OTHER',
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "HpOutreachStatus" NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "reminderDueAt" TIMESTAMP(3),
    "remindersSent" INTEGER NOT NULL DEFAULT 0,
    "responseAt" TIMESTAMP(3),
    "responseSummary" TEXT,
    "permissionOutcome" "HpPermissionStatus",
    "outcome" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HpOutreachRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HpMember_userId_key" ON "HpMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HpCountry_slug_key" ON "HpCountry"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "HpCountry_name_key" ON "HpCountry"("name");

-- CreateIndex
CREATE UNIQUE INDEX "HpCountry_isoCode_key" ON "HpCountry"("isoCode");

-- CreateIndex
CREATE UNIQUE INDEX "HpTheme_slug_key" ON "HpTheme"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "HpTheme_name_key" ON "HpTheme"("name");

-- CreateIndex
CREATE UNIQUE INDEX "HpDocumentType_slug_key" ON "HpDocumentType"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "HpDocumentType_name_key" ON "HpDocumentType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "HpPublisher_slug_key" ON "HpPublisher"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "HpPublisher_name_key" ON "HpPublisher"("name");

-- CreateIndex
CREATE UNIQUE INDEX "HpKeyword_name_key" ON "HpKeyword"("name");

-- CreateIndex
CREATE UNIQUE INDEX "HpDocument_slug_key" ON "HpDocument"("slug");

-- CreateIndex
CREATE INDEX "HpDocument_countryId_status_idx" ON "HpDocument"("countryId", "status");

-- CreateIndex
CREATE INDEX "HpDocument_documentTypeId_idx" ON "HpDocument"("documentTypeId");

-- CreateIndex
CREATE INDEX "HpDocument_publisherId_idx" ON "HpDocument"("publisherId");

-- CreateIndex
CREATE INDEX "HpDocument_publicationYear_idx" ON "HpDocument"("publicationYear");

-- CreateIndex
CREATE INDEX "HpDocument_status_createdAt_idx" ON "HpDocument"("status", "createdAt");

-- CreateIndex
CREATE INDEX "HpDocument_downloadCount_idx" ON "HpDocument"("downloadCount");

-- CreateIndex
CREATE INDEX "HpDocumentTheme_themeId_idx" ON "HpDocumentTheme"("themeId");

-- CreateIndex
CREATE INDEX "HpDocumentKeyword_keywordId_idx" ON "HpDocumentKeyword"("keywordId");

-- CreateIndex
CREATE INDEX "HpDocumentVersion_documentId_idx" ON "HpDocumentVersion"("documentId");

-- CreateIndex
CREATE INDEX "HpDownloadEvent_createdAt_idx" ON "HpDownloadEvent"("createdAt");

-- CreateIndex
CREATE INDEX "HpDownloadEvent_documentId_idx" ON "HpDownloadEvent"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "HpDownloadEvent_documentId_method_day_visitorHash_key" ON "HpDownloadEvent"("documentId", "method", "day", "visitorHash");

-- CreateIndex
CREATE INDEX "HpSubmission_status_createdAt_idx" ON "HpSubmission"("status", "createdAt");

-- CreateIndex
CREATE INDEX "HpFeedback_status_createdAt_idx" ON "HpFeedback"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "HpAcquisitionItem_documentId_key" ON "HpAcquisitionItem"("documentId");

-- CreateIndex
CREATE INDEX "HpAcquisitionItem_countryId_status_idx" ON "HpAcquisitionItem"("countryId", "status");

-- CreateIndex
CREATE INDEX "HpAcquisitionItem_nextActionDue_idx" ON "HpAcquisitionItem"("nextActionDue");

-- CreateIndex
CREATE INDEX "HpAcquisitionActivity_itemId_createdAt_idx" ON "HpAcquisitionActivity"("itemId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "HpRequestTemplate_name_key" ON "HpRequestTemplate"("name");

-- CreateIndex
CREATE INDEX "HpOutreachRequest_status_reminderDueAt_idx" ON "HpOutreachRequest"("status", "reminderDueAt");

-- AddForeignKey
ALTER TABLE "HpMember" ADD CONSTRAINT "HpMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpPublisher" ADD CONSTRAINT "HpPublisher_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "HpCountry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpDocument" ADD CONSTRAINT "HpDocument_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "HpCountry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpDocument" ADD CONSTRAINT "HpDocument_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "HpDocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpDocument" ADD CONSTRAINT "HpDocument_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "HpPublisher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpDocument" ADD CONSTRAINT "HpDocument_primaryThemeId_fkey" FOREIGN KEY ("primaryThemeId") REFERENCES "HpTheme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpDocument" ADD CONSTRAINT "HpDocument_supersededById_fkey" FOREIGN KEY ("supersededById") REFERENCES "HpDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpDocument" ADD CONSTRAINT "HpDocument_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "HpMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpDocumentTheme" ADD CONSTRAINT "HpDocumentTheme_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "HpDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpDocumentTheme" ADD CONSTRAINT "HpDocumentTheme_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "HpTheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpDocumentKeyword" ADD CONSTRAINT "HpDocumentKeyword_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "HpDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpDocumentKeyword" ADD CONSTRAINT "HpDocumentKeyword_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "HpKeyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpRelatedDocument" ADD CONSTRAINT "HpRelatedDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "HpDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpRelatedDocument" ADD CONSTRAINT "HpRelatedDocument_relatedId_fkey" FOREIGN KEY ("relatedId") REFERENCES "HpDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpDocumentVersion" ADD CONSTRAINT "HpDocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "HpDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpDocumentVersion" ADD CONSTRAINT "HpDocumentVersion_replacedById_fkey" FOREIGN KEY ("replacedById") REFERENCES "HpMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpDownloadEvent" ADD CONSTRAINT "HpDownloadEvent_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "HpDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpSubmission" ADD CONSTRAINT "HpSubmission_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "HpCountry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpSubmission" ADD CONSTRAINT "HpSubmission_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "HpMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpSubmission" ADD CONSTRAINT "HpSubmission_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "HpDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpFeedback" ADD CONSTRAINT "HpFeedback_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "HpDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpFeedback" ADD CONSTRAINT "HpFeedback_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "HpMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpAcquisitionItem" ADD CONSTRAINT "HpAcquisitionItem_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "HpCountry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpAcquisitionItem" ADD CONSTRAINT "HpAcquisitionItem_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "HpPublisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpAcquisitionItem" ADD CONSTRAINT "HpAcquisitionItem_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "HpDocumentType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpAcquisitionItem" ADD CONSTRAINT "HpAcquisitionItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "HpMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpAcquisitionItem" ADD CONSTRAINT "HpAcquisitionItem_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "HpDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpAcquisitionActivity" ADD CONSTRAINT "HpAcquisitionActivity_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "HpAcquisitionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpAcquisitionActivity" ADD CONSTRAINT "HpAcquisitionActivity_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "HpMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpOutreachRequest" ADD CONSTRAINT "HpOutreachRequest_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "HpAcquisitionItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpOutreachRequest" ADD CONSTRAINT "HpOutreachRequest_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "HpRequestTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HpOutreachRequest" ADD CONSTRAINT "HpOutreachRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "HpMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ── HP-Hub full-text search (hand-written; Prisma cannot express these) ─────

-- Trigram matching for partial / misspelt title searches.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "HpDocument_searchVector_idx" ON "HpDocument" USING GIN ("searchVector");
CREATE INDEX "HpDocument_title_trgm_idx" ON "HpDocument" USING GIN ("title" gin_trgm_ops);

-- Rebuilds one document's weighted search vector from its own fields and its
-- related publisher, themes and keywords. Called by the application after
-- every write that touches a document or its relations.
--   A: title            B: keywords, themes, document type
--   C: publisher, authors   D: abstract, description
CREATE OR REPLACE FUNCTION hp_document_refresh_search(doc_id TEXT) RETURNS VOID AS $$
  UPDATE "HpDocument" d SET "searchVector" =
      setweight(to_tsvector('english', coalesce(d."title", '')), 'A')
   || setweight(to_tsvector('english', coalesce((
        SELECT string_agg(k."name", ' ')
        FROM "HpDocumentKeyword" dk JOIN "HpKeyword" k ON k."id" = dk."keywordId"
        WHERE dk."documentId" = d."id"), '')), 'B')
   || setweight(to_tsvector('english', coalesce((
        SELECT string_agg(t."name", ' ')
        FROM "HpDocumentTheme" dt JOIN "HpTheme" t ON t."id" = dt."themeId"
        WHERE dt."documentId" = d."id"), '')), 'B')
   || setweight(to_tsvector('english', coalesce((
        SELECT ty."name" FROM "HpDocumentType" ty WHERE ty."id" = d."documentTypeId"), '')), 'B')
   || setweight(to_tsvector('english', coalesce((
        SELECT p."name" || ' ' || coalesce(p."acronym", '')
        FROM "HpPublisher" p WHERE p."id" = d."publisherId"), '')
        || ' ' || array_to_string(d."authors", ' ')), 'C')
   || setweight(to_tsvector('english',
        coalesce(d."abstract", '') || ' ' || coalesce(d."description", '')), 'D')
  WHERE d."id" = doc_id;
$$ LANGUAGE sql;
