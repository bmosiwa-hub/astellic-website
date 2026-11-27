import Link from "next/link";
import { notFound } from "next/navigation";
import DocumentForm from "@/components/hp-hub/admin/DocumentForm";
import { PageHeader, Panel, Pill, STATUS_TONE, fmtDate, Flash, btnPrimary, btnSecondary, btnDanger, inputCls, Notice } from "@/components/hp-hub/admin/ui";
import { prisma } from "@/lib/prisma";
import { requireHpPage } from "@/lib/hp-hub/auth";
import { addRelated, changeStatus, deleteDocument, removeRelated, setSuperseded, setVerification } from "@/lib/hp-hub/admin/document-actions";
import { taxonomyOptions, uploadConfig } from "@/lib/hp-hub/admin/options";
import { STATUS_LABELS, VERIFICATION_LABELS } from "@/lib/hp-hub/constants";
import { can, canEditDocument, canTransition } from "@/lib/hp-hub/permissions";
import { formatFileSize } from "@/lib/hp-hub/text";

export const metadata = { title: "Edit document" };

const TRANSITIONS: { to: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED"; label: string; from: string[] }[] = [
  { to: "PENDING_REVIEW", label: "Submit for review", from: ["DRAFT"] },
  { to: "DRAFT", label: "Return to draft", from: ["PENDING_REVIEW"] },
  { to: "PUBLISHED", label: "Publish", from: ["DRAFT", "PENDING_REVIEW", "ARCHIVED"] },
  { to: "DRAFT", label: "Unpublish (back to draft)", from: ["PUBLISHED"] },
  { to: "ARCHIVED", label: "Archive", from: ["PUBLISHED", "DRAFT", "PENDING_REVIEW"] },
];

export default async function EditDocumentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  const actor = await requireHpPage("document.create");
  const { id } = await params;
  const sp = await searchParams;
  const doc = await prisma.hpDocument.findUnique({
    where: { id },
    include: {
      themes: true,
      keywords: { include: { keyword: true } },
      versions: { orderBy: { replacedAt: "desc" }, include: { replacedBy: { include: { user: { select: { name: true } } } } } },
      related: { include: { related: { select: { id: true, title: true, status: true } } } },
      supersededBy: { select: { id: true, title: true, slug: true } },
      createdBy: { include: { user: { select: { name: true } } } },
      acquisition: { select: { id: true, title: true, status: true } },
    },
  });
  if (!doc) notFound();

  const [options, history] = await Promise.all([
    taxonomyOptions(),
    prisma.auditEvent.findMany({
      where: { entityType: "HpDocument", entityId: id },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: { id: true, createdAt: true, userName: true, action: true, changedFields: true, detail: true },
    }),
  ]);
  const editable = canEditDocument(actor.role, actor.memberId, doc);
  const transitions = TRANSITIONS.filter((t) => t.from.includes(doc.status) && canTransition(actor.role, doc.status, t.to));
  const ownOrEditor = can(actor.role, "document.editAny") || doc.createdById === actor.memberId;

  return (
    <div>
      <PageHeader
        title={doc.title}
        back={{ href: "/hp-hub/admin/documents", label: "Documents" }}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Pill tone={STATUS_TONE[doc.status]}>{STATUS_LABELS[doc.status]}</Pill>
            <Pill tone={STATUS_TONE[doc.verificationStatus]}>{VERIFICATION_LABELS[doc.verificationStatus]}</Pill>
            {doc.isSynthetic && <Pill tone="red">Synthetic test record</Pill>}
            <span>
              Added {fmtDate(doc.createdAt)} by {doc.createdBy?.user.name ?? "import"} · updated {fmtDate(doc.updatedAt, true)}
            </span>
          </span>
        }
        actions={
          doc.status === "PUBLISHED" ? (
            <Link href={`/hp-hub/documents/${doc.slug}`} target="_blank" className={btnSecondary}>
              View public page ↗
            </Link>
          ) : undefined
        }
      />
      <Flash ok={sp.ok} err={sp.err} />

      <div className="grid xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <div className="min-w-0">
          {editable ? (
            <DocumentForm
              values={{
                id: doc.id,
                title: doc.title,
                countryId: doc.countryId,
                documentTypeId: doc.documentTypeId,
                publisherId: doc.publisherId,
                publicationYear: doc.publicationYear,
                publicationDate: doc.publicationDate?.toISOString().slice(0, 10),
                startYear: doc.startYear,
                endYear: doc.endYear,
                authors: doc.authors.join("; "),
                description: doc.description,
                abstract: doc.abstract,
                language: doc.language,
                version: doc.version,
                edition: doc.edition,
                themeIds: doc.themes.map((t) => t.themeId),
                primaryThemeId: doc.primaryThemeId,
                keywords: doc.keywords.map((k) => k.keyword.name).join(", "),
                sourceUrl: doc.sourceUrl,
                citationText: doc.citationText,
                notes: doc.notes,
                accessType: doc.accessType,
                permissionStatus: doc.permissionStatus,
                rightsHolder: doc.rightsHolder,
                rightsStatement: doc.rightsStatement,
                verificationStatus: doc.verificationStatus,
                verificationNotes: doc.verificationNotes,
                isFeatured: doc.isFeatured,
                currentFile: doc.storagePath
                  ? { name: doc.fileName ?? "file", size: doc.fileSize, previewHref: `/api/hp-hub/admin/file?kind=document&id=${doc.id}` }
                  : null,
              }}
              {...options}
              canVerify={can(actor.role, "document.verify")}
              canFeature={can(actor.role, "document.publish")}
              upload={uploadConfig("documents")}
            />
          ) : (
            <Notice tone="info">
              You can view this record but not edit it. Contributors can edit only their own drafts; ask an editor for changes.
            </Notice>
          )}
        </div>

        <div className="space-y-5 xl:sticky xl:top-6">
          <Panel title="Workflow">
            {transitions.length && ownOrEditor ? (
              <div className="flex flex-col gap-2">
                {transitions.map((t) => (
                  <form key={t.label} action={changeStatus}>
                    <input type="hidden" name="id" value={doc.id} />
                    <input type="hidden" name="to" value={t.to} />
                    <button type="submit" className={`${t.to === "PUBLISHED" ? btnPrimary : btnSecondary} w-full`}>
                      {t.label}
                    </button>
                  </form>
                ))}
              </div>
            ) : (
              <p className="text-sm text-brand-muted">No status changes available to your role.</p>
            )}
            <p className="text-xs text-brand-muted mt-3">Draft → Pending review → Published → Archived. Only Repository Administrators publish.</p>
          </Panel>

          {can(actor.role, "document.verify") && (
            <Panel title="Verification">
              <form action={setVerification} className="space-y-3">
                <input type="hidden" name="id" value={doc.id} />
                <select name="verificationStatus" defaultValue={doc.verificationStatus} className={inputCls} aria-label="Verification status">
                  {Object.entries(VERIFICATION_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <textarea name="verificationNotes" defaultValue={doc.verificationNotes ?? ""} rows={2} placeholder="How was it verified?" className={`${inputCls} h-auto py-2`} aria-label="Verification notes" />
                <button className={`${btnSecondary} w-full`}>Update verification</button>
              </form>
            </Panel>
          )}

          {doc.acquisition && (
            <Panel title="Tracker record">
              <Link href={`/hp-hub/admin/tracker/${doc.acquisition.id}`} className="text-sm font-semibold text-brand-teal">
                {doc.acquisition.title}
              </Link>
            </Panel>
          )}

          <Panel title="File versions">
            {doc.storagePath && (
              <p className="text-sm mb-2">
                <a href={`/api/hp-hub/admin/file?kind=document&id=${doc.id}`} target="_blank" rel="noopener" className="font-semibold text-brand-teal">
                  Current: {doc.fileName}
                </a>{" "}
                <span className="text-xs text-brand-muted">{formatFileSize(doc.fileSize)}</span>
              </p>
            )}
            {doc.versions.length ? (
              <ul className="space-y-2">
                {doc.versions.map((v) => (
                  <li key={v.id} className="text-sm">
                    <a href={`/api/hp-hub/admin/file?kind=version&id=${v.id}`} target="_blank" rel="noopener" className="text-brand-navy hover:text-brand-teal">
                      {v.fileName}
                    </a>
                    <p className="text-xs text-brand-muted">
                      Replaced {fmtDate(v.replacedAt)}
                      {v.replacedBy ? ` by ${v.replacedBy.user.name}` : ""}
                      {v.versionLabel ? ` · v${v.versionLabel}` : ""}
                      {v.note ? ` · ${v.note}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-brand-muted">{doc.storagePath ? "No earlier versions." : "No file uploaded."}</p>
            )}
          </Panel>

          {can(actor.role, "document.editAny") && (
            <>
              <Panel title="Superseded by">
                {doc.supersededBy && (
                  <p className="text-sm mb-3">
                    <Link href={`/hp-hub/admin/documents/${doc.supersededBy.id}`} className="font-semibold text-brand-teal">
                      {doc.supersededBy.title}
                    </Link>
                  </p>
                )}
                <form action={setSuperseded} className="flex gap-2">
                  <input type="hidden" name="id" value={doc.id} />
                  <input name="supersededBy" placeholder="Newer document's slug or ID" className={inputCls} aria-label="Superseding document" defaultValue={doc.supersededBy?.slug ?? ""} />
                  <button className={btnSecondary}>Set</button>
                </form>
                <p className="text-xs text-brand-muted mt-2">Leave blank and press Set to clear.</p>
              </Panel>

              <Panel title="Related documents">
                {doc.related.length > 0 && (
                  <ul className="space-y-1.5 mb-3">
                    {doc.related.map((r) => (
                      <li key={r.relatedId} className="flex items-start justify-between gap-2 text-sm">
                        <Link href={`/hp-hub/admin/documents/${r.relatedId}`} className="text-brand-navy hover:text-brand-teal">
                          {r.related.title}
                        </Link>
                        <form action={removeRelated}>
                          <input type="hidden" name="id" value={doc.id} />
                          <input type="hidden" name="relatedId" value={r.relatedId} />
                          <button className="text-xs text-red-700 hover:underline">Remove</button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}
                <form action={addRelated} className="flex gap-2">
                  <input type="hidden" name="id" value={doc.id} />
                  <input name="related" placeholder="Slug or ID" className={inputCls} aria-label="Related document" required />
                  <button className={btnSecondary}>Link</button>
                </form>
              </Panel>
            </>
          )}

          <Panel title="History">
            {history.length ? (
              <ol className="space-y-2">
                {history.map((h) => (
                  <li key={h.id} className="text-xs">
                    <span className="font-semibold text-brand-navy">{h.action}</span> by {h.userName} · {fmtDate(h.createdAt, true)}
                    {h.changedFields.length > 0 && <span className="block text-brand-muted">{h.changedFields.join(", ")}</span>}
                    {h.detail && <span className="block text-brand-muted">{h.detail}</span>}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-brand-muted">No recorded changes.</p>
            )}
          </Panel>

          {can(actor.role, "document.delete") && doc.status !== "PUBLISHED" && (
            <Panel title="Delete permanently">
              <form action={deleteDocument} className="space-y-2">
                <input type="hidden" name="id" value={doc.id} />
                <p className="text-xs text-brand-muted">Deletes the record, its files and earlier versions. This can&rsquo;t be undone. Prefer archiving.</p>
                <input name="confirm" placeholder="Type DELETE" className={inputCls} aria-label="Type DELETE to confirm" autoComplete="off" />
                <button className={`${btnDanger} w-full`}>Delete document</button>
              </form>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
