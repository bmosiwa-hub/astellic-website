# HP-Hub: deployment, operations and known limitations

## Environment variables

These are already set in Vercel for the main site:

- `DATABASE_URL`
- `AUTH_SECRET` (or `NEXTAUTH_SECRET`)
- `BLOB_READ_WRITE_TOKEN`

HP-Hub adds the following. All are optional; see `.env.example`.

| Variable | Default | Purpose |
|---|---|---|
| `HP_HUB_BLOB_TOKEN` | falls back to `BLOB_READ_WRITE_TOKEN` | Token for a dedicated HP-Hub Blob store (recommended) |
| `HP_HUB_BLOB_ACCESS` | `private` | Set `public` only if the store can't hold private blobs |
| `HP_HUB_INDEXING` | off | Set `true` at launch to allow indexing and add HP-Hub to the sitemap |
| `HP_HUB_SHOW_SYNTHETIC` | off | Development only: show synthetic test records |

Never commit `.env.local` or `.vercel`.

## First deployment

0. **Storage.** The existing Blob store (`BLOB_READ_WRITE_TOKEN`) is **public-only**: testing showed it rejects private files. Choose one:
   - **Recommended:** create a new Blob store with *private* access in Vercel (Storage → Create → Blob) and set its token as `HP_HUB_BLOB_TOKEN`. Leave `HP_HUB_BLOB_ACCESS` unset.
   - Or set `HP_HUB_BLOB_ACCESS=public` to use the existing store. Files then have long random URLs that HP-Hub never reveals, but anyone who obtained a URL could download that file. Avoid this for restricted documents.
1. **Back up production.** Create a Neon branch or snapshot of the production database.

   Note that the existing migration history does **not** match the schema. The 25 migrations create about 48 of the schema's 91 tables, because most tables were created with `prisma db push`. So don't rely on `prisma migrate deploy` without checking first.
   1. Run `npx prisma migrate status` against production.
   2. If it lists only `20261127000000_hp_hub` as pending, `npx prisma migrate deploy` is fine.
   3. Otherwise, apply the HP-Hub SQL directly, then record it as applied:
      ```
      DATABASE_URL=<production url> npx prisma db execute --file prisma/migrations/20261127000000_hp_hub/migration.sql
      DATABASE_URL=<production url> npx prisma migrate resolve --applied 20261127000000_hp_hub
      ```

   The SQL only adds things: `Hp*` tables and enums, `CREATE EXTENSION IF NOT EXISTS pg_trgm` (supported by Neon), search indexes, the `hp_document_refresh_search` function, and the `User.astelfinAccess` column with default `true`, so existing users keep Astelfin access.

   For a database built with `prisma db push` (as in development), also run `prisma db execute --file prisma/hp-hub-search.sql`. `db push` can't create the search function or indexes.
2. **Seed the reference data** and make yourself a Super Admin. The seed can be run again safely:
   ```
   DATABASE_URL=<production url> npm run hp-hub:seed -- --grant you@astellic.com
   ```
   This seeds 5 countries (only Malawi live), 21 themes, 24 document types, the 6 Malawi tracker records and one request template.
3. **Merge the `hp-hub` branch** into `master`. Vercel deploys it. Pages that need the new tables fail until step 1 is done, so run the migration first.
4. Sign in at `/hp-hub/admin/login`, catalogue the first documents, and give colleagues roles under **Members & access**.
5. **At launch:**
   - set `HP_HUB_INDEXING=true` in Vercel and redeploy
   - add links to HP-Hub from the main navigation or footer
   - submit `https://www.astellic.com/sitemap.xml` in Google Search Console

The build (`prisma generate && next build`) doesn't need the database: HP-Hub pages render on request.

## Backups and maintenance

- **Database:** Neon keeps point-in-time history (the retention depends on the plan). HP-Hub tables are also included in Postgres-level dumps, for example `pg_dump --table='"Hp*"'`.

  The existing `/api/finance/backup` export covers finance data only and **doesn't include HP-Hub**. A scheduled `pg_dump` (for example a GitHub Action, weekly, stored off-site) is recommended.
- **Files:** Vercel Blob has no built-in versioned backup. Recommended options:
  - a monthly job that copies `hp-hub/prod/` to a second provider (Cloudflare R2, S3)
  - or at least keeping the original files the team received in a shared drive

  Database records hold each file's name, type and size, so a restore can be checked.
- **Routine work:**
  - weekly: clear the submissions and reports queues, and handle takedown requests within days
  - monthly: review overdue tracker follow-ups
  - quarterly: check external source links for rot (mark broken ones in the tracker)
- **Audit:** every HP-Hub change is written to `AuditEvent`, which is visible per document in the admin portal.
- **Search index:** it updates automatically. Use *Taxonomy → Rebuild search index* only after direct database edits.

## Estimated running costs

These estimates are approximate. Check current Vercel and Neon pricing before budgeting.

- **Vercel:** no new project. HP-Hub runs in the existing Astellic project, so its cost is a small increase in function time and bandwidth on the current plan.
- **Database (Neon):** catalogue metadata is small. Even 10,000 records with search indexes stay well under 1 GB, so the existing database plan should absorb it.
- **File storage (Vercel Blob):** the main variable cost. Health policy PDFs average 1–5 MB, so 2,000 hosted files are roughly 2–10 GB. That costs a few dollars a month for storage, plus download transfer. Downloads stream through the app, so they also count as function bandwidth. At typical repository traffic (hundreds to low thousands of downloads a month) expect single-digit to low tens of dollars per month.
- **Not used:** paid search services, AI APIs or CAPTCHA services.

## Known limitations (Version 1)

- **Database distance:** pages and saves make several sequential database queries. Tested from Malawi against a London database (about 300 ms per query), an admin save took about 30 seconds and pages took 5–7 seconds. On Vercel this is fast only if the functions run in the same region as the Neon database. Check that the Vercel project's function region matches the production database region.
- **Orphaned uploads:** if someone uploads a file and then abandons the form, the file stays in storage unused. A periodic cleanup of `hp-hub/*/documents/` blobs not referenced by any record would tidy this up.

- **Rate limiting** is per server instance (in memory), so it slows naive abuse but isn't a global limit. For stronger protection, add a Vercel WAF rule or Upstash Redis, which `lib/simple-rate-limit.ts` explains.
- **No CAPTCHA** on public forms. They rely on a honeypot, a minimum fill time, rate limits and a review queue. Add Cloudflare Turnstile if spam becomes a problem.
- **HP-Hub doesn't send email.** Submitters and requesters aren't notified automatically, and acquisition requests are sent from your own mailbox.
- **Two-factor sign-in:** Astelfin's 2FA check applies to Astelfin routes only. HP-Hub uses password login with lockout.

  Separately, the existing middleware 2FA check reads the user's role and 2FA flag from a session object that doesn't contain them, so the middleware-level 2FA redirect may not run for Astelfin either. This predates HP-Hub; check whether 2FA is enforced elsewhere.
- **Search** covers metadata and abstracts, not the full text inside PDFs (the design allows adding it later).
- **Admin idle timeout** relies on the 31-minute server session. There's no on-screen countdown like Astelfin's.
- **Analytics** country data depends on Vercel's geolocation header, which isn't present in local development.
- **Download streaming:** downloads stream through a serverless function. Very large files (over about 100 MB) or heavy traffic may need direct signed URLs from storage instead.
