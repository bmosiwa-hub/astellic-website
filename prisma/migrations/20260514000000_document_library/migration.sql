-- Phase 2: Centralised Document Library
-- Creates the Document table with full-text search indexes.

CREATE TABLE "Document" (
  "id"              TEXT        NOT NULL,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- File metadata
  "title"           TEXT        NOT NULL,
  "filename"        TEXT        NOT NULL,
  "url"             TEXT        NOT NULL,
  "fileSize"        INTEGER,
  "mimeType"        TEXT,

  -- Classification
  "category"        TEXT        NOT NULL,
  "description"     TEXT,
  "tags"            TEXT[]      NOT NULL DEFAULT ARRAY[]::TEXT[],

  -- Polymorphic entity link
  "entityType"      TEXT,
  "entityId"        TEXT,

  -- Uploader identity (denormalised)
  "uploadedById"    TEXT        NOT NULL,
  "uploadedByName"  TEXT        NOT NULL,
  "uploadedByEmail" TEXT        NOT NULL,
  "uploadedByRole"  TEXT        NOT NULL,

  -- Retention policy
  "retentionYears"  INTEGER,

  -- Soft delete
  "deletedAt"       TIMESTAMP(3),
  "deletedBy"       TEXT,

  CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- Lookup indexes
CREATE INDEX "Document_entityType_entityId_idx" ON "Document"("entityType", "entityId");
CREATE INDEX "Document_category_idx"            ON "Document"("category");
CREATE INDEX "Document_uploadedById_idx"        ON "Document"("uploadedById");
CREATE INDEX "Document_createdAt_idx"           ON "Document"("createdAt");
