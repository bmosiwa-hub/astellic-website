import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/finance-utils";
import { auditLog } from "@/lib/audit";
import { writeApprovalRecord } from "@/lib/approval-record";
import { assertNotSelfApproval } from "@/lib/self-approval";
import { checkCEOAuth, delegateNote } from "@/lib/delegation";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import DocumentsPanel from "@/components/finance/DocumentsPanel";

export const metadata = {
  title: "Review Tax Remittance | Astelfin",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PENDING_CEO:  { bg: "bg-blue-50 border-blue-200",   text: "text-blue-700",   label: "Pending CEO Approval" },
  CEO_APPROVED: { bg: "bg-green-50 border-green-200", text: "text-green-700",  label: "CEO Approved" },
  CEO_REJECTED: { bg: "bg-red-50 border-red-200",     text: "text-red-700",    label: "CEO Rejected" },
};

async function astelfinApproveRemittance(formData: FormData) {
  "use server";
  const session = await auth();
  const ceoAuth = await checkCEOAuth(session);
  if (!ceoAuth.authorized) redirect("/astelfin_26/home");

  const remittanceId = formData.get("remittanceId") as string;
  const ceoNote      = (formData.get("ceoNote") as string) || null;

  const remittance = await prisma.taxRemittance.findUnique({ where: { id: remittanceId } });
  if (!remittance) redirect("/astelfin_26/astelfin/tax");

  assertNotSelfApproval(session!.user!.id!, remittance.submittedById, "tax remittance");

  await prisma.taxRemittance.update({
    where: { id: remittanceId },
    data:  { status: "CEO_APPROVED", ceoNote, reviewedById: session!.user!.id!, reviewedAt: new Date() },
  });

  const finalStatus = remittance.remittanceType === "WAIVED" ? "WAIVED" : "REMITTED";
  if (remittance.payrollIds.length > 0) {
    await prisma.payroll.updateMany({ where: { id: { in: remittance.payrollIds } }, data: { payeStatus: finalStatus } });
  }
  if (remittance.pensionIds.length > 0) {
    await prisma.payroll.updateMany({ where: { id: { in: remittance.pensionIds } }, data: { pensionStatus: finalStatus } });
  }

  await auditLog({
    userId:   session!.user!.id!,
    action:   "APPROVE",
    entity:   "TaxRemittance",
    entityId: remittanceId,
    detail:   (ceoNote || `CEO approved ${remittance.taxType} remittance`) + delegateNote(ceoAuth),
  });

  await writeApprovalRecord({
    entityType:     "TaxRemittance",
    entityId:       remittanceId,
    decidedById:    session!.user!.id!,
    decidedByEmail: session!.user!.email ?? "",
    decidedByName:  session!.user!.name  ?? "",
    decidedByRole:  session!.user!.role,
    previousStatus: remittance.status,
    newStatus:      "CEO_APPROVED",
    decision:       "APPROVED",
    comments:       ceoNote,
  });

  redirect(`/astelfin_26/astelfin/tax/remittances/${remittanceId}?success=approved`);
}

async function astelfinRejectRemittance(formData: FormData) {
  "use server";
  const session = await auth();
  const ceoAuth = await checkCEOAuth(session);
  if (!ceoAuth.authorized) redirect("/astelfin_26/home");

  const remittanceId = formData.get("remittanceId") as string;
  const ceoNote      = (formData.get("ceoNote") as string) || null;

  const remittance = await prisma.taxRemittance.findUnique({ where: { id: remittanceId } });
  if (!remittance) redirect("/astelfin_26/astelfin/tax");

  assertNotSelfApproval(session!.user!.id!, remittance.submittedById, "tax remittance");

  await prisma.taxRemittance.update({
    where: { id: remittanceId },
    data:  { status: "CEO_REJECTED", ceoNote, reviewedById: session!.user!.id!, reviewedAt: new Date() },
  });

  if (remittance.payrollIds.length > 0) {
    await prisma.payroll.updateMany({ where: { id: { in: remittance.payrollIds } }, data: { payeStatus: "OUTSTANDING" } });
  }
  if (remittance.pensionIds.length > 0) {
    await prisma.payroll.updateMany({ where: { id: { in: remittance.pensionIds } }, data: { pensionStatus: "OUTSTANDING" } });
  }

  await auditLog({
    userId:   session!.user!.id!,
    action:   "REJECT",
    entity:   "TaxRemittance",
    entityId: remittanceId,
    detail:   (ceoNote || `CEO rejected ${remittance.taxType} remittance`) + delegateNote(ceoAuth),
  });

  await writeApprovalRecord({
    entityType:     "TaxRemittance",
    entityId:       remittanceId,
    decidedById:    session!.user!.id!,
    decidedByEmail: session!.user!.email ?? "",
    decidedByName:  session!.user!.name  ?? "",
    decidedByRole:  session!.user!.role,
    previousStatus: remittance.status,
    newStatus:      "CEO_REJECTED",
    decision:       "REJECTED",
    comments:       ceoNote,
  });

  redirect(`/astelfin_26/astelfin/tax/remittances/${remittanceId}?success=rejected`);
}

export default async function AstelfinRemittanceReviewPage({
  params,
  searchParams,
}: {
  params:       Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { id }      = await params;
  const { success } = await searchParams;
  const session     = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/home");

  const remittance = await prisma.taxRemittance.findUnique({
    where:   { id },
    include: {
      submittedBy: { select: { name: true, email: true } },
      reviewedBy:  { select: { name: true } },
    },
  });
  if (!remittance) notFound();

  const payrollRecords = remittance.payrollIds.length > 0
    ? await prisma.payroll.findMany({
        where:   { id: { in: remittance.payrollIds } },
        include: { employee: { select: { name: true } } },
        orderBy: { period: "asc" },
      })
    : [];

  const pensionRecords = remittance.pensionIds.length > 0
    ? await prisma.payroll.findMany({
        where:   { id: { in: remittance.pensionIds } },
        include: { employee: { select: { name: true } } },
        orderBy: { period: "asc" },
      })
    : [];

  const statusStyle = STATUS_STYLES[remittance.status] ?? STATUS_STYLES.PENDING_CEO;
  const canReview   = remittance.status === "PENDING_CEO" && role === "CEO";
  const typeLabel   = remittance.remittanceType === "WAIVED" ? "MRA Remission / Waiver" : "Paid to MRA";

  return (
    <div className="max-w-3xl space-y-7">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em]">Astelfin</p>
          <h1 className="text-2xl font-bold text-brand-navy mt-1">Tax Remittance Review</h1>
          <p className="text-gray-500 text-sm mt-1">
            {remittance.taxType} · {remittance.period} · submitted by {remittance.submittedBy.name}
          </p>
        </div>
        <Link href="/astelfin_26/astelfin/tax"
          className="text-sm text-brand-gold hover:underline font-semibold">
          Back to Tax Dashboard
        </Link>
      </div>

      {success === "approved" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          Remittance approved. Records have been marked as {remittance.remittanceType === "WAIVED" ? "Waived" : "Remitted"}.
        </div>
      )}
      {success === "rejected" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          Remittance rejected. Records have been restored to Outstanding.
        </div>
      )}

      {/* Status banner */}
      <div className={`rounded-2xl border p-5 ${statusStyle.bg}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Status</p>
            <p className={`text-xl font-bold ${statusStyle.text}`}>{statusStyle.label}</p>
            {remittance.reviewedAt && remittance.reviewedBy && (
              <p className="text-xs text-gray-500 mt-1">
                Reviewed by {remittance.reviewedBy.name} on{" "}
                {remittance.reviewedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Amount</p>
            <p className="text-2xl font-bold text-brand-navy tabular-nums">{formatCurrency(remittance.amount)}</p>
            <p className="text-xs text-gray-500 mt-0.5">{typeLabel}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-brand-navy mb-4">Remittance Details</h2>
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <InfoRow label="Tax Type"     value={remittance.taxType} />
          <InfoRow label="Period"       value={remittance.period} />
          <InfoRow label="Type"         value={typeLabel} />
          <InfoRow label="Submitted"    value={remittance.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} />
          <InfoRow label="Submitted by" value={`${remittance.submittedBy.name} (${remittance.submittedBy.email})`} />
          {remittance.fmNote  && <InfoRow label="FM Note"  value={remittance.fmNote}  span />}
          {remittance.ceoNote && <InfoRow label="CEO Note" value={remittance.ceoNote} span />}
        </div>

        {remittance.proofUrl ? (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Proof Document</p>
            <a href={remittance.proofUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-brand-navy transition-colors">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              {remittance.proofFilename ?? "Download Proof"}
            </a>
          </div>
        ) : (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs text-red-500">No proof document uploaded.</p>
          </div>
        )}
      </div>

      {/* Covered records */}
      {(payrollRecords.length > 0 || pensionRecords.length > 0) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="font-bold text-brand-navy text-sm">
              Covered Records ({payrollRecords.length + pensionRecords.length})
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Employee</th>
                <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Period</th>
                <th className="text-right px-5 py-2.5 font-semibold text-gray-600">Amount</th>
                <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payrollRecords.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-2.5 font-medium text-brand-navy">{r.employee.name}</td>
                  <td className="px-5 py-2.5 text-gray-600">{r.period}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums text-orange-600 font-semibold">{formatCurrency(r.paye)}</td>
                  <td className="px-5 py-2.5"><StatusBadge status={r.payeStatus} /></td>
                </tr>
              ))}
              {pensionRecords.map((r) => (
                <tr key={r.id + "-pension"}>
                  <td className="px-5 py-2.5 font-medium text-brand-navy">{r.employee.name}</td>
                  <td className="px-5 py-2.5 text-gray-600">{r.period}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums text-orange-600 font-semibold">{formatCurrency(r.pension)}</td>
                  <td className="px-5 py-2.5"><StatusBadge status={r.pensionStatus} /></td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-gray-200 bg-gray-50">
              <tr>
                <td colSpan={2} className="px-5 py-2.5 font-bold text-brand-navy">Total</td>
                <td className="px-5 py-2.5 text-right font-bold tabular-nums text-orange-600">{formatCurrency(remittance.amount)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* CEO Approval Panel */}
      {canReview && (
        <div className="bg-amber-50 rounded-2xl border border-amber-300 p-6 space-y-5">
          <div>
            <h2 className="font-bold text-amber-800">CEO Approval Required</h2>
            <p className="text-xs text-amber-700 mt-1">
              Review the details and proof above, then approve or reject.
              On approval all listed records will be marked as{" "}
              {remittance.remittanceType === "WAIVED" ? <strong>Waived</strong> : <strong>Remitted</strong>}.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form action={astelfinApproveRemittance} className="space-y-2">
              <input type="hidden" name="remittanceId" value={id} />
              <textarea name="ceoNote" rows={2} placeholder="Approval note (optional)..."
                className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white resize-none" />
              <button type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                Approve — Mark as {remittance.remittanceType === "WAIVED" ? "Waived" : "Remitted"}
              </button>
            </form>
            <form action={astelfinRejectRemittance} className="space-y-2">
              <input type="hidden" name="remittanceId" value={id} />
              <textarea name="ceoNote" rows={2} required placeholder="Reason for rejection (required)..."
                className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white resize-none" />
              <button type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                Reject
              </button>
            </form>
          </div>
        </div>
      )}

      {!canReview && remittance.status === "PENDING_CEO" && role === "FINANCE_MANAGER" && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-800">
          <strong>Awaiting CEO approval.</strong> You will be notified once the CEO has reviewed this remittance.
        </div>
      )}

      <DocumentsPanel
        entityType="TaxRemittance"
        entityId={remittance.id}
        revalidateTo={`/astelfin_26/astelfin/tax/remittances/${remittance.id}`}
      />
    </div>
  );
}

function InfoRow({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <>
      <div className={span ? "col-span-2" : ""}>
        <span className="text-gray-400 text-xs">{label}: </span>
        <span className="text-gray-700">{value}</span>
      </div>
      {!span && <div />}
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OUTSTANDING: "bg-orange-100 text-orange-700",
    PENDING_CEO: "bg-blue-100 text-blue-700",
    REMITTED:    "bg-green-100 text-green-700",
    WAIVED:      "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status === "PENDING_CEO" ? "Pending CEO" : status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}