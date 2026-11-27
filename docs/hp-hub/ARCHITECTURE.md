# HP-Hub: technical architecture

The Health Policy Intelligence Hub (HP-Hub) is part of the existing Astellic Next.js application. It is not a separate service. It uses the same Vercel project, Postgres database (Prisma), login system (next-auth) and Vercel Blob storage as the rest of the site.

## Routes

| Route | What it is |
|---|---|
| `/hp-hub` | Hub home: search, featured country, recent and most-downloaded documents, browse lists |
| `/hp-hub/[country]` | Country repository (e.g. `/hp-hub/malawi`). Live only when the country is marked *Live* |
| `/hp-hub/search` | Full-text search with filters, sorting and pagination (`noindex`) |
| `/hp-hub/themes`, `/hp-hub/themes/[slug]` | Theme browsing |
| `/hp-hub/types`, `/hp-hub/types/[slug]` | Document-type browsing |
| `/hp-hub/documents/[slug]` | Document page (SEO metadata, JSON-LD, citation, access panel, feedback form) |
| `/hp-hub/documents/[slug]/download` | File download: published HOSTED documents with hosting rights only |
| `/hp-hub/documents/[slug]/source` | Counts a visit to the original source, then redirects there |
| `/hp-hub/submit`, `/hp-hub/about` | Public submission form; repository policy, rights and takedown |
| `/hp-hub/admin/login` | HP-Hub sign-in (same accounts as Astelfin, but access is granted separately) |
| `/hp-hub/admin/…` | Admin portal: dashboard, documents, submissions, reports, tracker, acquisition requests, CSV import, analytics, taxonomy, members |
| `/api/hp-hub/upload` | Issues short-lived direct-upload tokens |
| `/api/hp-hub/admin/file` | Authenticated file preview for admins |

Code lives in:

- `app/hp-hub/(public)/…`: public pages, which use the site header and footer
- `app/hp-hub/admin/…`: the admin portal, with its own shell (`app/layout.tsx` treats `/hp-hub/admin` as standalone)
- `lib/hp-hub/…`: all business logic
- `components/hp-hub/…`: UI components

## Data model (`prisma/schema.prisma`, migration `20261127000000_hp_hub`)

Every table is prefixed `Hp`. The migration only adds things; finance tables are not touched. The only change to an existing table is a new column, `User.astelfinAccess` (default `true`).

- **HpCountry, HpTheme, HpDocumentType, HpPublisher, HpKeyword**: reference data. All are managed in the admin portal, not hard-coded. Every document belongs to a country through `countryId`, so adding Kenya means adding a row and marking it live.
- **HpDocument**: the catalogue record. It holds:
  - metadata
  - rights: `accessType`, `permissionStatus`, `rightsHolder` and `rightsStatement`
  - workflow: `status` (publication) and `verificationStatus`, kept separate on purpose
  - the current file (`storageProvider`, `storagePath`, `fileName`, `fileType`, `fileSize`)
  - `supersededById`, `isFeatured`, `isSynthetic` and `downloadCount`
  - `searchVector` (tsvector)
- **HpDocumentTheme / HpDocumentKeyword / HpRelatedDocument**: many-to-many links. A document can have several themes, plus an optional primary theme.
- **HpDocumentVersion**: earlier files, kept whenever a file is replaced or removed.
- **HpDownloadEvent**: one row per counted download or source visit, with no personal data. See *Analytics*.
- **HpSubmission, HpFeedback**: the public submission queue, and corrections, broken links, access and takedown requests.
- **HpAcquisitionItem, HpAcquisitionActivity, HpOutreachRequest, HpRequestTemplate**: the Missing Documents tracker and the acquisition programme.
- **HpMember**: a user's HP-Hub role. Its presence and `active` flag are what grant HP-Hub access.
- Audit trail: the existing tamper-evident `AuditEvent` table. HP-Hub events use the `Hp…` entity types and an `HP_<ROLE>` role.

## Authentication and authorisation

- **Shared accounts, separate access.** Astelfin access is controlled by `User.astelfinAccess`, which the CEO manages in Astelfin settings. HP-Hub access is an active `HpMember` row, managed by an HP-Hub Super Admin. The login form says which system it is for (`portal: "hphub"`), and `authorize()` rejects accounts without access to that system. Neither system can be reached by signing in to the other.
- **Middleware** (`middleware.ts`) is a coarse guard. It redirects `/hp-hub/admin/*` to the HP-Hub login without a session or HP-Hub role, and sends accounts without Astelfin access away from `/astelfin_26`.
- **Server-side checks are authoritative.** Every admin page calls `requireHpPage(capability)` and every server action or route calls `requireHp(capability)`. These re-read the member's role from the database on each request, so revoking access takes effect immediately.
- **Roles** (`lib/hp-hub/permissions.ts`):
  - Super Admin, Repository Administrator, Editor/Reviewer and Contributor
  - Contributors can't publish or verify, and edit only their own drafts
  - The capability matrix is unit-tested
- **Session:** the existing 31-minute rolling JWT session, account lockout after 5 failures, and login event logging.
- New HP-Hub-only accounts get a random temporary password, shown once, and must change it at first sign-in.

## Search (`lib/hp-hub/search.ts`)

- **Index:** each document has a weighted `tsvector`, rebuilt by the SQL function `hp_document_refresh_search(id)` after every write. Weights, from highest:
  - A: title
  - B: keywords, themes and type
  - C: publisher and authors
  - D: abstract and description
- **Matching:**
  - every term is prefix-matched ("malar" finds malaria)
  - quoted phrases and `-exclusions` use `websearch_to_tsquery`
  - `pg_trgm` similarity on titles tolerates small typos
  - relevance ranking uses `ts_rank_cd` plus title similarity
  - highlighting uses `ts_headline`, escaped before display
- **Filters:** country, theme, type, publisher, year range, language, access and verification. They combine with AND across dimensions and OR within one. Facet counts leave out their own dimension.
- **Safety:** every filter is a parameterised `Prisma.sql` fragment, and user text never reaches SQL as raw text.
- **Future:** full-text PDF or OCR indexing needs only another weighted component (for example an `HpDocumentText` table with extracted text) folded into the refresh function.

## Storage (`lib/hp-hub/storage.ts`)

- Vercel Blob sits behind a small provider interface (`verifyUpload`, `openFile`, `deleteFile`), so S3, R2 or Azure can be added without touching callers. `storageProvider` is stored on each record.
- Uploads go **directly from the browser to Blob** using a token from `/api/hp-hub/upload`. That route checks the role (or rate-limits public uploads), the allowed types and the size. This avoids the serverless function body limit for large PDFs.
- After upload, the form's server action **re-verifies** the file:
  - it sits in the expected area (`hp-hub/<env>/<area>/`)
  - its size is within the limit
  - its leading bytes match its claimed type (PDF, OOXML or OLE)

  Mismatches are deleted.
- Blobs are stored `private` by default (`HP_HUB_BLOB_ACCESS`). Files are only ever **streamed through our routes**, which check access first. Blob URLs never reach browsers.
- Replacing or removing a file keeps the old one as an `HpDocumentVersion`.

## Rights and access

- `HOSTED` records can be published only with a file, a permission status of `GRANTED` or `OPEN_LICENSE`, and a rights holder or statement.
- `EXTERNAL` records need a source URL.
- `RESTRICTED` records never serve files publicly and show a request-access form instead.
- These rules are enforced in validation (`lib/hp-hub/validation.ts`), again at publish time (`changeStatus`), and again at download time (`isPubliclyDownloadable`).

## Analytics (`lib/hp-hub/analytics.ts`)

- No IP address, cookie or identifier is stored.
- A visitor hash (an HMAC of IP, user agent, document and UTC day, keyed with `AUTH_SECRET`) plus a unique constraint counts each visitor at most once per document per day. Hashes can't be linked across days.
- Bots, link previewers, scripted clients, prefetches and range continuations are ignored.
- Country comes from Vercel's `x-vercel-ip-country` header (country level only). The referrer is stored as a hostname only.

## Public form protection (`lib/hp-hub/public-actions.ts`)

- A hidden honeypot field and a minimum fill time.
- A per-IP rate limit, using the existing in-memory limiter. It is best effort per server instance.
- zod validation on the server.
- File signature checks, and a 25 MB limit for PDF or Word files only.
- Everything goes into a review queue; nothing is published automatically.

## SEO

- Per-page metadata (unique titles, descriptions, canonical URLs), Open Graph tags, Google Scholar `citation_*` meta tags, `schema.org/Report` and `BreadcrumbList` JSON-LD, and descriptive slugs.
- `app/robots.ts` disallows admin, API, search-result and download URLs.
- `app/sitemap.ts` adds hub, country, theme, type and published document URLs, regenerated hourly.
- Drafts, archived records and synthetic records are never listed. Synthetic records are `noindex`.
- **Launch switch:** until `HP_HUB_INDEXING=true`, HP-Hub pages are `noindex` and left out of the sitemap.

## Future AI features (prepared, not built)

Nothing in Version 1 calls an AI API. The design leaves room for:

- **Text extraction:** add `HpDocumentText(documentId, page, text)` populated by an extraction or OCR job. Page-level rows let future answers cite page numbers. Fold it into `hp_document_refresh_search`.
- **Embeddings and retrieval:** add an `HpDocumentChunk` table with pgvector embeddings (Neon supports pgvector), keyed to document and page.
- **Machine outputs:** store summaries, comparisons and extracted commitments in their own table. Each should carry:
  - `kind`, `model` and `promptVersion`
  - `sourceRefs` (document and page citations)
  - `confidence` and an `isMachineGenerated` flag (always true)
  - `reviewedById` and `reviewedAt` (set only after a qualified human review)

  The UI must label them as machine-generated, show citations, and keep them visually separate from Astellic's expert analysis.
- **Guard rails:** answers may only cite documents present in HP-Hub. Unverified or `DISPUTED` records should be flagged in any synthesis.
