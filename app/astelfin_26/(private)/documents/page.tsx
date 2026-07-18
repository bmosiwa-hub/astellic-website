import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { put } from "@vercel/blob";
import { formatDate } from "@/lib/finance-utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const metadata = {
  title: "Document Library | Astelfin IMS",
  robots: { index: false, follow: false },
};

// ── Constants ─────────────────────────────────────────────────────────────────

export const DOCUMENT_CATEGORIES = [
  { value: "RECEIPT",       label: "Receipt" },
  { value: "CONTRACT",      label: "Contract / Agreement" },
  { value: "REPORT",        label: "Donor / Financial Report" },
  { value: "CORRESPONDENCE",label: "Correspondence" },
  { value: "POLICY",        label: "Policy / Procedure" },
  { value: "EVIDENCE",      label: "Compliance Evidence" },
  { value: "MINUTES",       label: "Meeting Minutes" },
  { value: "DELIVERABLE",   label: "Project Deliverable" },
  { value: "OTHER",         label: "Other" },
] as const;

export const ENTITY_TYPES = [
  { value: "Submission",    label: "Invoice / Request" },
  { value: "Liquidation",   label: "Liquidation" },
  { value: "Procurement",   label: "Procurement" },
  { value: "TaxRemittance", label: "Tax Remittance" },
  { value: "Project",       label: "Project" },
  { value: "Payroll",       label: "Payroll" },
  { value: "Asset",         label: "Asset" },
] as const;

const RETENTION_OPTIONS = [
  { value: "",  label: "Indefinite" },
  { value: "3", label: "3 years" },
  { value: "5", label: "5 years" },
  { value: "7", label: "7 years (USAID standard)" },
  { value: "10",label: "10 years" },
];

const CATEGORY_COLOURS: Record<string, string> = {
  RECEIPT:        "bg-green-100 text-green-700",
  CONTRACT:       "bg-blue-100 text-blue-700",
  REPORT:         "bg-purple-100 text-purple-700",
  CORRESPONDENCE: "bg-yellow-100 text-yellow-700",
  POLICY:         "bg-indigo-100 text-indigo-700",
  EVIDENCE:       "bg-orange-100 text-orange-700",
  MINUTES:        "bg-pink-100 text-pink-700",
  DELIVERABLE:    "bg-teal-100 text-teal-700",
  OTHER:          "bg-gray-100 text-gray-600",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(bytes: number | null | undefined) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function categoryLabel(value: string) {
  return DOCUMENT_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

function entityLabel(value: string | null) {
  if (!value) return null;
  return ENTITY_TYPES.find((e) => e.value === value)?.label ?? value;
}

// ── Server Action: upload a document ─────────────────────────────────────────

async function uploadDocument(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const title         = (formData.get("title") as string)?.trim();
  const category      = formData.get("category") as string;
  const description   = (formData.get("description") as string) || null;
  const entityType    = (formData.get("entityType") as string) || null;
  const entityId      = (formData.get("entityId") as string)?.trim() || null;
  const retentionRaw  = formData.get("retentionYears") as string;
  const retentionYears = retentionRaw ? parseInt(retentionRaw) : null;
  const file          = formData.get("file") as File | null;

  if (!title || !category || !file || file.size === 0) {
    redirect("/astelfin_26/documents?error=missing_fields");
  }

  const blob = await put(
    `documents/${Date.now()}-${file!.name}`,
    file!,
    { access: "public", addRandomSuffix: true }
  );

  const doc = await prisma.document.create({
    data: {
      title,
      filename:        file!.name,
      url:             blob.url,
      fileSize:        file!.size,
      mimeType:        file!.type || null,
      category,
      description,
      entityType:      entityType || null,
      entityId:        (entityType && entityId) ? entityId : null,
      uploadedById:    session.user.id!,
      uploadedByName:  session.user.name  ?? "",
      uploadedByEmail: session.user.email ?? "",
      uploadedByRole:  session.user.role,
      retentionYears,
    },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "CREATE",
    entity:   "Document",
    entityId: doc.id,
    detail:   `"${title}" uploaded — ${category}${entityType ? ` linked to ${entityType}` : ""}`,
  });

  revalidatePath("/astelfin_26/documents");
  redirect("/astelfin_26/documents?success=uploaded");
}

// ── Server Action: soft-delete a document ────────────────────────────────────

async function deleteDocument(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || (session.user.role !== "CEO" && session.user.role !== "FINANCE_MANAGER")) {
    redirect("/astelfin_26/dashboard");
  }

  const docId = formData.get("docId") as string;

  await prisma.document.update({
    where: { id: docId },
    data:  { deletedAt: new Date(), deletedBy: session.user.id! },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "DELETE",
    entity:   "Document",
    entityId: docId,
    detail:   "Document soft-deleted from library",
  });

  revalidatePath("/astelfin_26/documents");
  redirect("/astelfin_26/documents?success=deleted");
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    entityType?: string;
    q?: string;
    success?: string;
    error?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  // All roles can view; STAFF & CONSULTANT can upload but not delete
  const canDelete = role === "CEO" || role === "FINANCE_MANAGER";

  const { category, entityType, q, success, error } = await searchParams;

  // Build filter
  const where = {
    deletedAt: null,
    ...(category   ? { category }   : {}),
    ...(entityType ? { entityType } : {}),
    ...(q ? {
      OR: [
        { title:       { contains: q, mode: "insensitive" as const } },
        { filename:    { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
      ],
    } : {}),
  };

  const [documents, totalCount] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take:    100,
    }),
    prisma.document.count({ where: { deletedAt: null } }),
  ]);

  const isFiltered = !!(category || entityType || q);

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Document Library</h1>
          <p className="text-gray-500 text-sm mt-1">
            Centralised evidence store for donor compliance, contracts, reports, and supporting documents.
            {" "}<span className="font-medium text-brand-navy">{totalCount}</span> document{totalCount !== 1 ? "s" : ""} stored.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {success === "uploaded" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          ✓ Document uploaded successfully.
        </div>
      )}
      {success === "deleted" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          ✓ Document removed from the library.
        </div>
      )}
      {error === "missing_fields" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          Please fill in all required fields and attach a file.
        </div>
      )}

      {/* Upload panel */}
      <details className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <summary className="flex items-center justify-between px-6 py-4 cursor-pointer select-none list-none hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <span className="font-semibold text-brand-navy text-sm">Upload Document</span>
          </div>
          <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </summary>

        <form action={uploadDocument} encType="multipart/form-data" className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Document Title <span className="text-red-500">*</span>
              </label>
              <input
                name="title" required
                placeholder="e.g. Q3 2025 Financial Report — USAID"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category" required defaultValue=""
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white"
              >
                <option value="" disabled>Select category…</option>
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* File */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                File <span className="text-red-500">*</span>
              </label>
              <input
                type="file" name="file" required
                className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-brand-navy file:text-white file:text-xs file:font-semibold hover:file:bg-brand-navy/90 cursor-pointer"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <input
                name="description"
                placeholder="Brief description of contents or purpose…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
              />
            </div>

            {/* Entity link */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Link to Entity <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <select
                name="entityType" defaultValue=""
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white"
              >
                <option value="">— Not linked —</option>
                {ENTITY_TYPES.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Entity ID <span className="text-gray-400 font-normal">(paste the record ID)</span>
              </label>
              <input
                name="entityId"
                placeholder="e.g. cm4x7a… (from the URL)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 font-mono"
              />
            </div>

            {/* Retention */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Retention Period</label>
              <select
                name="retentionYears" defaultValue=""
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white"
              >
                {RETENTION_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="bg-brand-navy hover:bg-brand-navy/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Upload Document
          </button>
        </form>
      </details>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 items-center">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search title, filename…"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 w-56"
        />
        <select
          name="category"
          defaultValue={category ?? ""}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white"
        >
          <option value="">All categories</option>
          {DOCUMENT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select
          name="entityType"
          defaultValue={entityType ?? ""}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white"
        >
          <option value="">All entity types</option>
          {ENTITY_TYPES.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
        <button type="submit" className="bg-brand-navy hover:bg-brand-navy/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          Filter
        </button>
        {isFiltered && (
          <Link href="/astelfin_26/documents" className="text-sm text-gray-400 hover:text-brand-navy transition-colors">
            Clear filters
          </Link>
        )}
      </form>

      {/* Document list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {documents.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            {isFiltered ? "No documents match your filters." : "No documents uploaded yet. Use the upload panel above to add your first document."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Title</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Category</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Linked to</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden lg:table-cell">Uploaded by</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden lg:table-cell">Date</th>
                <th className="px-5 py-3 hidden sm:table-cell"></th>
                {canDelete && <th className="px-5 py-3"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 group">
                  <td className="px-5 py-3.5">
                    <a
                      href={`/api/documents/proxy?type=library&id=${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-brand-navy hover:text-brand-gold transition-colors inline-flex items-center gap-1.5"
                    >
                      {/* File icon */}
                      <svg className="w-3.5 h-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {doc.title}
                    </a>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-400 truncate max-w-[240px]">{doc.filename}</p>
                      {doc.fileSize && <span className="text-xs text-gray-300">{fmt(doc.fileSize)}</span>}
                    </div>
                    {doc.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[300px]">{doc.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLOURS[doc.category] ?? "bg-gray-100 text-gray-600"}`}>
                      {categoryLabel(doc.category)}
                    </span>
                    {doc.retentionYears && (
                      <p className="text-xs text-gray-400 mt-1">{doc.retentionYears}yr retention</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    {doc.entityType ? (
                      <div>
                        <p className="text-xs font-medium text-gray-600">{entityLabel(doc.entityType)}</p>
                        {doc.entityId && (
                          <p className="text-xs text-gray-400 font-mono truncate max-w-[120px]">{doc.entityId}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <p className="text-xs font-medium text-gray-700">{doc.uploadedByName}</p>
                    <p className="text-xs text-gray-400">{doc.uploadedByRole}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 hidden lg:table-cell whitespace-nowrap">
                    {formatDate(doc.createdAt)}
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <a
                      href={`/api/documents/proxy?type=library&id=${doc.id}`}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-gold font-semibold hover:underline"
                    >
                      Download
                    </a>
                  </td>
                  {canDelete && (
                    <td className="px-5 py-3.5">
                      <form action={deleteDocument}>
                        <input type="hidden" name="docId" value={doc.id} />
                        <button
                          type="submit"
                          className="text-xs text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove document"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Info footer */}
      <p className="text-xs text-gray-400 text-center">
        Documents are stored securely on Vercel Blob. Soft-deleted documents are retained in the database for audit purposes.
        Retention periods follow USAID ADS 202 requirements (7 years minimum for financial records).
      </p>
    </div>
  );
}
