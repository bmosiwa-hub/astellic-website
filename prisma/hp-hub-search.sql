
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
