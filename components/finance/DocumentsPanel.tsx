/**
 * DocumentsPanel — server component
 *
 * Drop this into any entity detail page to show all documents linked to that entity
 * and let authorised users upload new ones directly from the detail view.
 *
 * Usage:
 *   import DocumentsPanel from "@/components/finance/DocumentsPanel";
 *
 *   <DocumentsPanel
 *     entityType="Procurement"
 *     entityId={proc.id}
 *     userId={session.user.id!}
 *     userName={session.user.name ?? ""}
 *     userEmail={session.user.email ?? ""}
 *     userRole={session.user.role}
 *   />
 */

import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { put } from "@vercel/blob";
import { auth } from "@/auth";
import { formatDate } from "@/lib/finance-utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DOCUMENT_CATEGORIES, ENTITY_TYPES } from "@/app/astelfin_26/(private)/documents/page";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(bytes: number | null | undefined) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  entityType: string;
  entityId:   string;
  /** Optionally override the revalidation path (defaults to the current entity URL) */
  revalidateTo?: string;
}

// ── Server Actions ────────────────────────────────────────────────────────────

async function uploadLinkedDocument(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const entityType = formData.get("entityType") as string;
  const entityId   = formData.get("entityId")   as string;
  const title      = (formData.get("title") as string)?.trim();
  const category   = formData.get("category") as string;
  const description= (formData.get("description") as string) || null;
  const file       = formData.get("file") as File | null;
  const back       = (formData.get("back") as string) || "/astelfin_26/documents";

  if (!title || !category || !file || file.size === 0) {
    redirect(`${back}?docError=missing`);
  }

  const blob = await put(
    `documents/${entityType.toLowerCase()}/${entityId}/${Date.now()}-${file!.name}`,
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
      entityType,
      entityId,
      uploadedById:    session.user.id!,
      uploadedByName:  session.user.name  ?? "",
      uploadedByEmail: session.user.email ?? "",
      uploadedByRole:  session.user.role,
      retentionYears:  null,
    },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "CREATE",
    entity:   "Document",
    entityId: doc.id,
    detail:   `"${title}" attached to ${entityType} ${entityId}`,
  });

  revalidatePath(back);
  redirect(`${back}?docSuccess=1`);
}

async function removeLinkedDocument(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || (session.user.role !== "CEO" && session.user.role !== "FINANCE_MANAGER")) {
    return;
  }

  const docId = formData.get("docId") as string;
  const back  = (formData.get("back") as string) || "/astelfin_26/documents";

  await prisma.document.update({
    where: { id: docId },
    data:  { deletedAt: new Date(), deletedBy: session.user.id! },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "DELETE",
    entity:   "Document",
    entityId: docId,
    detail:   "Document detached from entity",
  });

  revalidatePath(back);
  redirect(back);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default async function DocumentsPanel({ entityType, entityId, revalidateTo }: Props) {
  const session = await auth();
  if (!session?.user) return null;

  const backPath = revalidateTo ?? `/astelfin_26/${entityType.toLowerCase()}s/${entityId}`;
  const canDelete = session.user.role === "CEO" || session.user.role === "FINANCE_MANAGER";

  const documents = await prisma.document.findMany({
    where:   { entityType, entityId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
          <h3 className="font-semibold text-brand-navy text-sm">
            Supporting Documents
            {documents.length > 0 && (
              <span className="ml-1.5 text-xs font-normal text-gray-400">({documents.length})</span>
            )}
          </h3>
        </div>
      </div>

      {/* Existing documents */}
      {documents.length > 0 && (
        <div className="divide-y divide-gray-50">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-start gap-3 px-5 py-3 group hover:bg-gray-50">
              <svg className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="flex-1 min-w-0">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-brand-navy hover:text-brand-gold transition-colors"
                >
                  {doc.title}
                </a>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${CATEGORY_COLOURS[doc.category] ?? "bg-gray-100 text-gray-600"}`}>
                    {DOCUMENT_CATEGORIES.find((c) => c.value === doc.category)?.label ?? doc.category}
                  </span>
                  {doc.fileSize && <span className="text-xs text-gray-300">{fmt(doc.fileSize)}</span>}
                  <span className="text-xs text-gray-400">{formatDate(doc.createdAt)}</span>
                  <span className="text-xs text-gray-400">· {doc.uploadedByName}</span>
                </div>
                {doc.description && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{doc.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={doc.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-gold font-semibold hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Download
                </a>
                {canDelete && (
                  <form action={removeLinkedDocument}>
                    <input type="hidden" name="docId"  value={doc.id} />
                    <input type="hidden" name="back"   value={backPath} />
                    <button
                      type="submit"
                      className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove document"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {documents.length === 0 && (
        <p className="px-5 py-4 text-xs text-gray-400">No documents attached yet.</p>
      )}

      {/* Upload mini-form */}
      <details className="group border-t border-gray-100">
        <summary className="flex items-center gap-2 px-5 py-3 cursor-pointer select-none list-none text-xs font-semibold text-brand-gold hover:bg-gray-50 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Attach Document
        </summary>
        <form
          action={uploadLinkedDocument}
          encType="multipart/form-data"
          className="px-5 pb-4 pt-2 space-y-3 bg-gray-50/60"
        >
          <input type="hidden" name="entityType" value={entityType} />
          <input type="hidden" name="entityId"   value={entityId} />
          <input type="hidden" name="back"       value={backPath} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                name="title" required
                placeholder="Document title…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category" required defaultValue=""
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white"
              >
                <option value="" disabled>Select…</option>
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                File <span className="text-red-500">*</span>
              </label>
              <input
                type="file" name="file" required
                className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-brand-navy file:text-white file:text-xs file:font-semibold hover:file:bg-brand-navy/90 cursor-pointer"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <input
                name="description"
                placeholder="Optional notes…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-brand-navy hover:bg-brand-navy/90 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
          >
            Upload
          </button>
        </form>
      </details>
    </div>
  );
}
