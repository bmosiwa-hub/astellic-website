# HP-Hub: guide for repository administrators

Sign in at **https://www.astellic.com/hp-hub/admin/login** with your Astellic account. HP-Hub access is granted separately from Astelfin: if sign-in fails, ask a Super Admin to give you a role.

## Roles

| Role | Can do |
|---|---|
| **Contributor** | Add draft records, edit their own drafts, submit them for review, update the Missing Documents tracker |
| **Editor / Reviewer** | Everything above, plus edit any record, set verification status, review public submissions and reports, run acquisition requests |
| **Repository Administrator** | Everything above, plus publish, unpublish, archive and delete; feature documents; manage countries, themes, types and publishers; import CSV |
| **Super Admin** | Everything, plus grant or remove HP-Hub access and create HP-Hub-only accounts |

## Cataloguing a document

1. Go to **Documents → Add document**.
2. Fill in the required fields: title, country, document type and publisher. Choose **+ Add a new publisher** if it isn't listed yet.
3. Upload the file (drag and drop works) and/or paste the original source URL.
4. Set **Rights and access**:
   - **External source** (default): we link to the publisher's copy. Use this unless we have the right to host.
   - **Hosted download**: only with *Permission granted* or *Open licence*. Record the rights holder or a rights statement (for example "Shared with permission of MoH, email of 3 May 2026").
   - **Restricted**: we know of the document but it can't be public. Visitors can request access.
5. Add themes, keywords, a short description (shown in search results) and the abstract.
6. **Save as draft**, or **Save and add another**. That keeps the country, type, publisher and rights settings, which speeds up bulk cataloguing.

### Publishing workflow

**Draft → Pending review → Published → Archived**

- Contributors use **Submit for review**.
- A Repository Administrator checks the record and presses **Publish**. Publishing is blocked if a hosted record lacks its file or hosting rights, or if an external record has no source URL.
- **Verification** is separate from publishing. Editors set it to *Verified* after checking the document against an authoritative source, and record how in the notes. The public page shows the verification status.
- **Unpublish** returns a record to draft. **Archive** hides it but keeps it. **Delete** is permanent, available only for non-published records, and needs you to type DELETE. Prefer archiving.

### Files and versions

Uploading a new file keeps the previous one under **File versions**, with an optional note. Use **Preview** to open any stored file, including drafts and restricted files. Previews aren't counted as downloads.

### Superseded and related documents

On a document's page in the admin portal:

- **Superseded by** takes the newer document's slug, which is the last part of its public URL. The old record then shows a notice linking to the new one.
- **Related documents** links two records both ways.

## Public submissions

**Submissions** lists documents suggested through `/hp-hub/submit`. For each one:

- Check the source. Treat attached files as untrusted; previews open in a sandbox.
- Check **Possible duplicates**.
- Then choose **Catalogue as a draft document**. The form is prefilled, and you can reuse the submitted file. Or choose **Add to Missing Documents tracker**.
- Otherwise mark the submission *Rejected* or *Duplicate* with a note.

## Reports and requests

**Reports & requests** collects corrections, broken links, access requests and takedown requests from document pages. **Handle takedown requests first.** Usually that means switching the record to *External* or *Restricted*, or archiving it. Then reply to the requester by email, and mark the item resolved with a note.

## Finding documents that aren't in HP-Hub

**Find documents** searches public repositories for health documents:
- **World Bank Documents & Reports:** analysis and policy material only. Project paperwork such as procurement plans and safeguard reviews is left out.
- **WHO IRIS:** includes each document's licence.
- **ReliefWeb:** NGO and UN reports, once it's enabled (see OPERATIONS.md).

How to use it:
1. Choose a **country** (any country in Taxonomy, live or not), add keywords if you like, and press **Search**.
2. Results are checked against the catalogue and the tracker. By default only documents **not in HP-Hub** are shown. Tick *Also show documents already in HP-Hub* to see the rest, labelled *In HP-Hub* or *In tracker*.
3. For each find you can:
   - **Catalogue:** opens Add document prefilled with the title, publisher, year, country, a suggested type, the source link and the licence. It's saved as a draft like any other.
   - **Add to tracker:** records it as *Needs verification*, with the source as evidence and a follow-up to check it's the official, current version.

Being listed in a repository doesn't make a file hostable. New finds start as **External source** with permission **Unknown**. Change that only when the licence or the rights holder allows hosting.

## Missing Documents tracker

Use the tracker for documents you know exist but don't have yet.

- **Update a record as it progresses; don't create a new one.** Adding a title that already exists for that country takes you to the existing record.
- **Statuses:** Acquired, Missing, Needs verification, Broken source link, Permission required, Needs updating.
- Each record has an owner, a next follow-up action and due date, and an activity log:
  - **Note**
  - **Outreach attempt**
  - **Evidence**, optionally with a file. This updates "last verified".
  - **Follow-up task**, with a due date. Overdue tasks appear on the dashboard.
- When the document is catalogued, enter its slug under **Repository record → Link**. This marks the tracker record *Acquired*.
- Filter by country, publisher, type, status, owner and follow-up date.

## Acquisition requests

1. From a tracker record, choose **Request this document**, or go to **Acquisition requests → New request**.
2. Pick a template. The placeholders `{{title}}`, `{{publisher}}`, `{{year}}`, `{{recipient}}` and `{{sender}}` are filled automatically. Then review the message.
3. HP-Hub doesn't send email. Use **Open in email app** or **Copy** and send it from your own mailbox, then choose **Record as sent**. A reminder date is set 14 days ahead unless you choose another.
4. Record reminders and the response, including any **permission outcome**. Everything is logged on the tracker record. When the document is received with permission granted or an open licence, the tracker record is marked acquired.

Templates are managed under **Acquisition requests → Templates**.

## CSV import

1. Go to **CSV import → Download template**. Fill one row per document and save it from Excel as **CSV UTF-8**.
2. Country, document type and themes must match existing names. Separate multiple themes with semicolons. Unknown publishers are created.
3. Import rows as `external` (the default) or `restricted`. Hosted files must be uploaded on each record afterwards.
4. **Check file** shows a preview with row-level errors and duplicates. **Import** creates drafts for the valid, non-duplicate rows only.

## Taxonomy

- Rename or describe themes and types, or add new ones. Their URL slugs don't change.
- Countries go live with **Live**. Add an introduction for the country page.
- Fix publisher names, acronyms and websites, and **merge** duplicate publishers. Merging moves all their records.
- **Rebuild search index** is needed only after direct database changes.

## Members and access (Super Admin)

- **Grant access to an existing account** by email and role. The person keeps (or doesn't have) Astelfin access independently.
- **Create an HP-Hub-only account** for external contributors. A temporary password is shown once. Share it securely, separately from the email address. The user must change it at first sign-in.
- Change roles or deactivate members from the table. HP-Hub always keeps at least one active Super Admin.
- To give an HP-Hub-only user Astelfin access, the Astelfin CEO uses **Grant Astelfin** in Astelfin settings.

## Synthetic test records

Development data created with `npm run hp-hub:seed -- --synthetic` is titled "SYNTHETIC …" and flagged `isSynthetic`. It never appears on the production site, and in development only when `HP_HUB_SHOW_SYNTHETIC=true`.
