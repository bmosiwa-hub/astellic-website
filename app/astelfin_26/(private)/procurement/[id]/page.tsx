import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { writeApprovalRecord } from "@/lib/approval-record";
import { assertNotSelfApproval } from "@/lib/self-approval";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import { notifyProcurementSubmitted } from "@/lib/mail";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import DocumentsPanel from "@/components/finance/DocumentsPanel";

export const metadata = {
  title: "Procurement Detail | Astelfin IMS",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT:            "bg-gray-100 text-gray-500",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  APPROVED:         "bg-green-100 text-green-700",
  REJECTED:         "bg-red-100 text-red-700",
  COMPLETED:        "bg-blue-100 text-blue-700",
  CANCELLED:        "bg-gray-100 text-gray-400",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT:            "Draft",
  PENDING_APPROVAL: "Pending CEO Approval",
  APPROVED:         "Approved",
  REJECTED:         "Rejected",
  COMPLETED:        "Completed",
  CANCELLED:        "Cancelled",
};

const CURRENCIES = ["MWK", "USD", "GBP", "EUR", "ZAR"];

// ── Server Actions ────────────────────────────────────────────────────────────

async function addQuotation(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  const procurementId = formData.get("procurementId") as string;
  const supplier      = formData.get("supplier") as string;
  const amount        = parseFloat(formData.get("amount") as string);
  const currency      = (formData.get("currency") as string) || "MWK";
  const documentUrl   = (formData.get("documentUrl") as string) || null;
  const notes         = (formData.get("notes") as string) || null;

  // Ensure procurement is in DRAFT
  const proc = await prisma.procurement.findUnique({ where: { id: procurementId }, select: { status: true, title: true } });
  if (!proc || proc.status !== "DRAFT") redirect(`/astelfin_26/procurement/${procurementId}`);

  await prisma.procurementQuotation.create({
    data: { procurementId, supplier, amount, currency, documentUrl, notes },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "CREATE",
    entity:   "ProcurementQuotation",
    entityId: procurementId,
    detail:   `Quotation added for "${proc.title}": ${supplier} — ${currency} ${amount.toLocaleString()}`,
  });

  redirect(`/astelfin_26/procurement/${procurementId}?success=quotation`);
}

async function removeQuotation(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  const quotationId    = formData.get("quotationId") as string;
  const procurementId  = formData.get("procurementId") as string;

  const q = await prisma.procurementQuotation.findUnique({ where: { id: quotationId } });
  if (q) {
    await prisma.procurementQuotation.delete({ where: { id: quotationId } });
    await auditLog({
      userId:   session.user.id!,
      action:   "DELETE",
      entity:   "ProcurementQuotation",
      entityId: procurementId,
      detail:   `Quotation removed: ${q.supplier}`,
    });
  }

  redirect(`/astelfin_26/procurement/${procurementId}`);
}

async function submitForApproval(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  const procurementId = formData.get("procurementId") as string;
  const proc = await prisma.procurement.findUnique({
    where: { id: procurementId },
    include: { quotations: { select: { id: true } } },
  });

  if (!proc || proc.status !== "DRAFT") redirect(`/astelfin_26/procurement/${procurementId}`);

  // Enforce quotation requirement dynamically from ProcurementThreshold table
  const thresholds = await prisma.procurementThreshold.findMany({ orderBy: { minAmount: "asc" } });
  let requiredQuotes = 1;
  for (const t of thresholds) {
    if (proc.estimatedCost >= t.minAmount && (t.maxAmount == null || proc.estimatedCost <= t.maxAmount)) {
      requiredQuotes = t.minQuotations;
    }
  }
  if (proc.quotations.length < requiredQuotes) {
    redirect(`/astelfin_26/procurement/${procurementId}?error=quotations`);
  }

  await prisma.procurement.update({
    where: { id: procurementId },
    data:  { status: "PENDING_APPROVAL" },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "UPDATE",
    entity:   "Procurement",
    entityId: procurementId,
    detail:   `Procurement submitted for CEO approval: ${proc.title}`,
  });

  await writeApprovalRecord({
    entityType:     "Procurement",
    entityId:       procurementId,
    decidedById:    session.user.id!,
    decidedByEmail: session.user.email ?? "",
    decidedByName:  session.user.name  ?? "",
    decidedByRole:  session.user.role,
    previousStatus: "DRAFT",
    newStatus:      "PENDING_APPROVAL",
    decision:       "SUBMITTED",
  });

  // Notify CEO (fire-and-forget)
  try {
    const ceos = await prisma.user.findMany({
      where: { role: "CEO", active: true },
      select: { email: true },
    });
    if (ceos.length > 0) {
      await notifyProcurementSubmitted({
        to:            ceos.map((u) => u.email),
        title:         proc.title,
        estimatedCost: proc.estimatedCost,
        currency:      proc.currency ?? "MWK",
        submittedBy:   session.user.name ?? session.user.email ?? "Finance Manager",
        procurementId,
        quotationCount: proc.quotations.length,
      });
    }
  } catch (e) { console.warn("[mail] procurement submission notification failed", e); }

  redirect(`/astelfin_26/procurement?success=submitted`);
}

async function cancelRequest(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  const procurementId = formData.get("procurementId") as string;
  const proc = await prisma.procurement.findUnique({ where: { id: procurementId }, select: { title: true, status: true } });
  if (!proc || proc.status !== "DRAFT") redirect(`/astelfin_26/procurement/${procurementId}`);

  await prisma.procurement.update({
    where: { id: procurementId },
    data:  { status: "CANCELLED" },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "UPDATE",
    entity:   "Procurement",
    entityId: procurementId,
    detail:   `Procurement cancelled: ${proc.title}`,
  });

  redirect("/astelfin_26/procurement");
}

async function approveProcurement(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const procurementId = formData.get("procurementId") as string;
  const reviewNote    = (formData.get("reviewNote") as string) || null;

  const proc = await prisma.procurement.findUnique({ where: { id: procurementId }, select: { title: true, status: true, requestedBy: true } });
  if (!proc || proc.status !== "PENDING_APPROVAL") redirect(`/astelfin_26/procurement/${procurementId}`);

  assertNotSelfApproval(session.user.id!, proc.requestedBy, "procurement request");

  await prisma.procurement.update({
    where: { id: procurementId },
    data: {
      status:     "APPROVED",
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
      reviewNote,
    },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "APPROVED",
    entity:   "Procurement",
    entityId: procurementId,
    detail:   `Procurement approved: ${proc.title}${reviewNote ? ` — ${reviewNote}` : ""}`,
  });

  await writeApprovalRecord({
    entityType:     "Procurement",
    entityId:       procurementId,
    decidedById:    session.user.id!,
    decidedByEmail: session.user.email ?? "",
    decidedByName:  session.user.name  ?? "",
    decidedByRole:  session.user.role,
    previousStatus: "PENDING_APPROVAL",
    newStatus:      "APPROVED",
    decision:       "APPROVED",
    comments:       reviewNote,
  });

  redirect(`/astelfin_26/procurement/${procurementId}?success=approved`);
}

async function rejectProcurement(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const procurementId = formData.get("procurementId") as string;
  const reviewNote    = (formData.get("reviewNote") as string) || null;

  const proc = await prisma.procurement.findUnique({ where: { id: procurementId }, select: { title: true, status: true, requestedBy: true } });
  if (!proc || proc.status !== "PENDING_APPROVAL") redirect(`/astelfin_26/procurement/${procurementId}`);

  assertNotSelfApproval(session.user.id!, proc.requestedBy, "procurement request");

  await prisma.procurement.update({
    where: { id: procurementId },
    data: {
      status:     "REJECTED",
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
      reviewNote,
    },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "REJECTED",
    entity:   "Procurement",
    entityId: procurementId,
    detail:   `Procurement rejected: ${proc.title}${reviewNote ? ` — ${reviewNote}` : ""}`,
  });

  await writeApprovalRecord({
    entityType:     "Procurement",
    entityId:       procurementId,
    decidedById:    session.user.id!,
    decidedByEmail: session.user.email ?? "",
    decidedByName:  session.user.name  ?? "",
    decidedByRole:  session.user.role,
    previousStatus: "PENDING_APPROVAL",
    newStatus:      "REJECTED",
    decision:       "REJECTED",
    comments:       reviewNote,
  });

  redirect(`/astelfin_26/procurement/${procurementId}?success=rejected`);
}

async function markCompleted(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const procurementId = formData.get("procurementId") as string;
  const proc = await prisma.procurement.findUnique({ where: { id: procurementId }, select: { title: true } });

  await prisma.procurement.update({
    where: { id: procurementId },
    data:  { status: "COMPLETED" },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "UPDATE",
    entity:   "Procurement",
    entityId: procurementId,
    detail:   `Procurement marked as completed: ${proc?.title}`,
  });

  redirect(`/astelfin_26/procurement/${procurementId}?success=completed`);
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ProcurementDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;

  const { id }      = await params;
  const { success, error } = await searchParams;
  const isCEO = role === "CEO";
  const isFM  = role === "FINANCE_MANAGER";

  const proc = await prisma.procurement.findUnique({
    where: { id },
    include: {
      requester: { select: { name: true } },
      reviewer:  { select: { name: true } },
      quotations: { orderBy: { uploadedAt: "asc" } },
    },
  });

  if (!proc) notFound();

  // Dynamic threshold lookup
  const thresholdRows = await prisma.procurementThreshold.findMany({ orderBy: { minAmount: "asc" } });
  let reqQuotes = 1;
  let reqTender = false;
  let tierLabel = "Direct Purchase";
  for (const t of thresholdRows) {
    if (proc.estimatedCost >= t.minAmount && (t.maxAmount == null || proc.estimatedCost <= t.maxAmount)) {
      reqQuotes = t.minQuotations;
      reqTender = t.requiresTender;
      tierLabel = t.label;
    }
  }
  const quotesCount  = proc.quotations.length;
  const needsQuotes  = reqQuotes > 1;
  const hasEnough    = quotesCount >= reqQuotes;
  const canSubmit    = proc.status === "DRAFT" && hasEnough;
  const canAddQuote  = isFM && proc.status === "DRAFT";
  const canReview    = isCEO && proc.status === "PENDING_APPROVAL";

  const successMessages: Record<string, { color: string; text: string }> = {
    created:   { color: "blue",  text: "Draft saved. Add quotations below, then submit for approval." },
    quotation: { color: "green", text: "Quotation added." },
    approved:  { color: "green", text: "Procurement approved." },
    rejected:  { color: "red",   text: "Procurement rejected." },
    completed: { color: "green", text: "Marked as completed." },
  };
  const alert = success ? successMessages[success] : null;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/astelfin_26/procurement"
          className="text-gray-400 hover:text-brand-navy transition-colors mt-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-brand-navy">{proc.title}</h1>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[proc.status] ?? "bg-gray-100 text-gray-500"}`}>
              {STATUS_LABELS[proc.status] ?? proc.status}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-0.5">
            Requested by {proc.requester.name} · {formatDate(proc.createdAt)}
            {proc.category ? ` · ${proc.category}` : ""}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {alert && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${
          alert.color === "green" ? "bg-green-50 border-green-200 text-green-700" :
          alert.color === "red"   ? "bg-red-50 border-red-200 text-red-700" :
          "bg-blue-50 border-blue-200 text-blue-700"
        }`}>
          {alert.text}
        </div>
      )}
      {error === "quotations" && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          ⚠ This request ({tierLabel}) requires at least {reqQuotes} supplier quotation{reqQuotes !== 1 ? "s" : ""} before it can be submitted for approval.
        </div>
      )}
      {needsQuotes && isFM && proc.status === "DRAFT" && !hasEnough && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
          📋 Tier: <strong>{tierLabel}</strong>
          {reqTender && <span className="ml-1">(Tender / RFP required)</span>}
          {" — "}<strong>{reqQuotes - quotesCount} more quotation{reqQuotes - quotesCount !== 1 ? "s" : ""}</strong> needed before submission.
        </div>
      )}

      {/* Detail card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Estimated Cost</p>
            <p className="mt-0.5 text-gray-800 font-semibold text-base">{formatCurrency(proc.estimatedCost, proc.currency)}</p>
          </div>
          {proc.category && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Category</p>
              <p className="mt-0.5 text-gray-800">{proc.category}</p>
            </div>
          )}
          {proc.description && (
            <div className="col-span-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Description / Justification</p>
              <p className="mt-0.5 text-gray-800 whitespace-pre-line">{proc.description}</p>
            </div>
          )}
          {proc.reviewedAt && proc.reviewer && (
            <>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Reviewed By</p>
                <p className="mt-0.5 text-gray-800">{proc.reviewer.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Review Date</p>
                <p className="mt-0.5 text-gray-800">{formatDate(proc.reviewedAt)}</p>
              </div>
              {proc.reviewNote && (
                <div className="col-span-2">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Review Note</p>
                  <p className="mt-0.5 text-gray-800">{proc.reviewNote}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Quotations */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-brand-navy">
            Supplier Quotations
            {needsQuotes && (
              <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                hasEnough ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600"
              }`}>
                {quotesCount}/3 required
              </span>
            )}
          </h2>
        </div>

        {proc.quotations.length === 0 ? (
          <p className="text-sm text-gray-400">No quotations added yet.</p>
        ) : (
          <div className="space-y-3">
            {proc.quotations.map((q, i) => (
              <div key={q.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-brand-gold/20 text-brand-gold text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm">{q.supplier}</p>
                  <p className="text-sm font-semibold text-brand-navy">{formatCurrency(q.amount, q.currency)}</p>
                  {q.documentUrl && (
                    <a href={q.documentUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-brand-gold hover:underline inline-flex items-center gap-1 mt-0.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Document
                    </a>
                  )}
                  {q.notes && <p className="text-xs text-gray-400 mt-0.5">{q.notes}</p>}
                </div>
                {canAddQuote && (
                  <form action={removeQuotation}>
                    <input type="hidden" name="quotationId" value={q.id} />
                    <input type="hidden" name="procurementId" value={proc.id} />
                    <button type="submit" className="text-gray-300 hover:text-red-400 transition-colors text-xs p-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add quotation form — FM only, DRAFT status */}
        {canAddQuote && (
          <details className="group" open={proc.quotations.length === 0}>
            <summary className="cursor-pointer text-sm font-semibold text-brand-gold hover:underline list-none flex items-center gap-1">
              <span>+ Add Quotation</span>
              <svg className="w-4 h-4 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </summary>

            <form action={addQuotation} className="mt-4 space-y-4 p-4 bg-gray-50 rounded-xl">
              <input type="hidden" name="procurementId" value={proc.id} />

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Supplier Name <span className="text-red-500">*</span>
                  </label>
                  <input name="supplier" required placeholder="e.g. Compu-Tech Malawi Ltd"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Quoted Amount <span className="text-red-500">*</span>
                  </label>
                  <input name="amount" type="number" required min="0" step="0.01" placeholder="0.00"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
                  <select name="currency" defaultValue="MWK"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white">
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Document URL
                    <span className="ml-1.5 font-normal text-gray-400">— paste link to quotation file (SharePoint, Google Drive, etc.)</span>
                  </label>
                  <input name="documentUrl" type="url" placeholder="https://…"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white" />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                  <input name="notes" placeholder="Optional notes about this quotation…"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white" />
                </div>
              </div>

              <button type="submit"
                className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
                Add Quotation
              </button>
            </form>
          </details>
        )}
      </div>

      {/* FM actions: Submit / Cancel */}
      {isFM && proc.status === "DRAFT" && (
        <div className="flex gap-3">
          <form action={submitForApproval}>
            <input type="hidden" name="procurementId" value={proc.id} />
            <button type="submit" disabled={!canSubmit}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors text-white ${
                canSubmit
                  ? "bg-brand-navy hover:bg-brand-navy/90"
                  : "bg-gray-300 cursor-not-allowed"
              }`}>
              Submit for Approval
              {!canSubmit && needsQuotes && ` (need ${3 - quotesCount} more quotation${3 - quotesCount !== 1 ? "s" : ""})`}
            </button>
          </form>
          <form action={cancelRequest}>
            <input type="hidden" name="procurementId" value={proc.id} />
            <button type="submit"
              className="px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancel Request
            </button>
          </form>
        </div>
      )}

      {/* CEO review panel — single form, two formAction buttons */}
      {canReview && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-brand-navy">Review Request</h2>

          {needsQuotes && !hasEnough && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              ⚠ Only {quotesCount} quotation{quotesCount !== 1 ? "s" : ""} provided. This request should have at least 3 for a procurement of this value.
            </div>
          )}

          <form className="space-y-4">
            <input type="hidden" name="procurementId" value={proc.id} />
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Review Note (optional)</label>
              <textarea name="reviewNote" rows={2}
                placeholder="Add a comment or reason for the Finance Manager…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 resize-none" />
            </div>
            <div className="flex gap-3">
              <button formAction={approveProcurement} type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                Approve
              </button>
              <button formAction={rejectProcurement} type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                Reject
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CEO: Mark completed (once approved) */}
      {isCEO && proc.status === "APPROVED" && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-3">
          <h2 className="font-semibold text-blue-800">Mark as Completed</h2>
          <p className="text-sm text-blue-700">Once the procurement has been fulfilled, mark it as completed.</p>
          <form action={markCompleted}>
            <input type="hidden" name="procurementId" value={proc.id} />
            <button type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
              Mark Completed
            </button>
          </form>
        </div>
      )}

      {/* Supporting documents */}
      <DocumentsPanel
        entityType="Procurement"
        entityId={id}
        revalidateTo={`/astelfin_26/procurement/${id}`}
      />
    </div>
  );
}

