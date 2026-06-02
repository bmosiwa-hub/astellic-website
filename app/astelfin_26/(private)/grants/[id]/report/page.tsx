import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { PrintButton } from "@/components/finance/PrintButton";

export const metadata = {
  title: "Grant Report | Astelfin IMS",
  robots: { index: false, follow: false },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtMoney(n: number, currency = "MWK") {
  return new Intl.NumberFormat("en-MW", {
    style: "currency", currency,
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n);
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

function fmtDateShort(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function pct(spent: number, total: number) {
  if (!total) return "—";
  return `${Math.min(((spent / total) * 100), 9999).toFixed(1)}%`;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function GrantReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!["CEO", "FINANCE_MANAGER"].includes(session?.user?.role ?? ""))
    redirect("/astelfin_26/dashboard");

  const { id } = await params;

  const grant = await prisma.donorGrant.findUnique({
    where: { id },
    include: {
      budgetLines: {
        orderBy: [{ active: "desc" }, { name: "asc" }],
        include: { project: { select: { name: true } } },
      },
      income: {
        where:   { deletedAt: null },
        orderBy: { receivedDate: "asc" },
        select:  { id: true, description: true, amount: true, currency: true, receivedDate: true, source: true, invoiceNumber: true },
      },
    },
  });

  if (!grant) notFound();

  const blNames = grant.budgetLines.map((bl) => bl.name);

  // Fetch expenditure detail
  const [liquidations, payables] = await Promise.all([
    blNames.length > 0
      ? prisma.liquidation.findMany({
          where:   { budgetLine: { in: blNames }, status: "FM_APPROVED", deletedAt: null },
          orderBy: { liquidationDate: "asc" },
          select:  { id: true, liquidationDate: true, activity: true, budgetLine: true, fundsAccountedFor: true, currency: true },
        })
      : Promise.resolve([]),
    blNames.length > 0
      ? prisma.accountPayable.findMany({
          where:   { budgetLine: { in: blNames }, status: "PAID", deletedAt: null },
          orderBy: { paidDate: "asc" },
          select:  { id: true, description: true, vendor: true, amount: true, currency: true, budgetLine: true, paidDate: true },
        })
      : Promise.resolve([]),
  ]);

  // Build spend map
  const spendByBL: Record<string, number> = {};
  for (const l of liquidations) spendByBL[l.budgetLine] = (spendByBL[l.budgetLine] ?? 0) + l.fundsAccountedFor;
  for (const p of payables) if (p.budgetLine) spendByBL[p.budgetLine] = (spendByBL[p.budgetLine] ?? 0) + p.amount;

  const totalReceived = grant.income.reduce((s, r) => s + r.amount, 0);
  const totalSpent    = Object.values(spendByBL).reduce((a, b) => a + b, 0);
  const totalAward    = grant.totalAmount;
  const balance       = totalAward - totalSpent;
  const utilPct       = totalAward > 0 ? (totalSpent / totalAward) * 100 : 0;

  const generatedAt   = new Date();
  const refCode       = `RPT-${grant.id.slice(-6).toUpperCase()}-${generatedAt.getFullYear()}${String(generatedAt.getMonth() + 1).padStart(2, "0")}`;

  return (
    <>
      {/* Print + screen-only controls */}
      <style>{`
        @media print {
          aside, .no-print { display: none !important; }
          main { padding: 0 !important; }
          .report-page { max-width: 100% !important; font-size: 11pt; }
          .page-break { page-break-before: always; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
        }
        @page { size: A4; margin: 18mm 15mm; }
      `}</style>

      <div className="report-page max-w-4xl space-y-8">

        {/* Screen-only nav bar */}
        <div className="no-print flex items-center justify-between pb-4 border-b border-gray-100">
          <Link href={`/astelfin_26/grants/${id}`}
            className="text-sm text-brand-gold hover:underline">
            ← Back to grant
          </Link>
          <div className="flex gap-3">
            <a href={`/api/finance/grants/${id}/export`}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download CSV
            </a>
            <PrintButton className="flex items-center gap-1.5 bg-brand-gold hover:bg-brand-gold/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors" />
          </div>
        </div>

        {/* ── Report header ──────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between border-b-2 border-brand-navy pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-1">Astellic — Donor Financial Report</p>
            <h1 className="text-2xl font-bold text-brand-navy">{grant.name}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{grant.donorName}{grant.grantNumber && <span className="ml-2 font-mono text-gray-400">· {grant.grantNumber}</span>}</p>
          </div>
          <div className="text-right text-xs text-gray-400 leading-relaxed">
            <p>Reference: <span className="font-mono text-gray-600">{refCode}</span></p>
            <p>Generated: {fmtDate(generatedAt)}</p>
            <p>Prepared by: {session?.user?.name ?? "Finance"}</p>
          </div>
        </div>

        {/* ── Grant summary ──────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wide text-brand-gold mb-3">1. Grant Information</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm border border-gray-200 rounded-xl p-5 bg-gray-50">
            {[
              ["Donor",            grant.donorName],
              ["Grant Number",     grant.grantNumber ?? "—"],
              ["Status",           grant.status],
              ["Currency",         grant.currency],
              ["Reporting Period", grant.reportingPeriod ?? "—"],
              ["Start Date",       fmtDate(grant.startDate)],
              ["End Date",         grant.endDate ? fmtDate(grant.endDate) : "—"],
              ["Total Award",      fmtMoney(totalAward, grant.currency)],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <span className="text-gray-500 w-36 shrink-0">{label}:</span>
                <span className="font-medium text-brand-navy">{value}</span>
              </div>
            ))}
            {grant.notes && (
              <div className="col-span-2 flex gap-2 mt-1 pt-2 border-t border-gray-200">
                <span className="text-gray-500 w-36 shrink-0">Notes:</span>
                <span className="text-gray-600">{grant.notes}</span>
              </div>
            )}
          </div>
        </section>

        {/* ── Utilisation summary ────────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wide text-brand-gold mb-3">2. Financial Summary</h2>
          <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-brand-navy text-white">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Item</th>
                <th className="text-right px-5 py-3 font-semibold">Amount ({grant.currency})</th>
                <th className="text-right px-5 py-3 font-semibold">% of Award</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="bg-white">
                <td className="px-5 py-3 font-medium">Total Award</td>
                <td className="px-5 py-3 text-right font-mono">{fmtMoney(totalAward, grant.currency)}</td>
                <td className="px-5 py-3 text-right text-gray-400">100.0%</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-5 py-3 font-medium">Total Received</td>
                <td className="px-5 py-3 text-right font-mono text-blue-700">{fmtMoney(totalReceived, grant.currency)}</td>
                <td className="px-5 py-3 text-right text-blue-600">{pct(totalReceived, totalAward)}</td>
              </tr>
              <tr className="bg-white">
                <td className="px-5 py-3 font-medium">Total Expenditure</td>
                <td className={`px-5 py-3 text-right font-mono font-bold ${utilPct > 100 ? "text-red-600" : "text-gray-800"}`}>
                  {fmtMoney(totalSpent, grant.currency)}
                </td>
                <td className={`px-5 py-3 text-right font-bold ${utilPct > 100 ? "text-red-600" : "text-gray-700"}`}>
                  {pct(totalSpent, totalAward)}
                </td>
              </tr>
              <tr className={`${balance < 0 ? "bg-red-50" : "bg-green-50"}`}>
                <td className={`px-5 py-3 font-bold ${balance < 0 ? "text-red-700" : "text-green-700"}`}>
                  {balance < 0 ? "Overspend" : "Unspent Balance"}
                </td>
                <td className={`px-5 py-3 text-right font-mono font-bold ${balance < 0 ? "text-red-600" : "text-green-700"}`}>
                  {fmtMoney(Math.abs(balance), grant.currency)}
                </td>
                <td className={`px-5 py-3 text-right font-bold ${balance < 0 ? "text-red-600" : "text-green-600"}`}>
                  {pct(Math.abs(balance), totalAward)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Utilisation bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Expenditure utilisation</span>
              <span className="font-semibold">{utilPct.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${utilPct >= 100 ? "bg-red-500" : utilPct >= 80 ? "bg-amber-400" : "bg-brand-gold"}`}
                style={{ width: `${Math.min(100, utilPct)}%` }}
              />
            </div>
          </div>
        </section>

        {/* ── Budget lines ───────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wide text-brand-gold mb-3">
            3. Budget Line Breakdown ({grant.budgetLines.length} lines)
          </h2>
          {grant.budgetLines.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No budget lines linked to this grant.</p>
          ) : (
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Budget Line</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-700 hidden md:table-cell">Project</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-700">Ceiling</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-700">Spent</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-700">Balance</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-700">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grant.budgetLines.map((bl) => {
                  const spent   = spendByBL[bl.name] ?? 0;
                  const cap     = bl.ceiling;
                  const bal     = cap != null ? cap - spent : null;
                  const over    = cap != null && spent > cap;
                  return (
                    <tr key={bl.id} className={`${!bl.active ? "opacity-50" : ""} hover:bg-gray-50`}>
                      <td className="px-4 py-2.5 font-medium text-brand-navy">{bl.name}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500 hidden md:table-cell">{bl.project?.name ?? "Org-wide"}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs">
                        {cap != null ? fmtMoney(cap, bl.currency) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className={`px-4 py-2.5 text-right font-mono text-xs font-semibold ${over ? "text-red-600" : "text-gray-700"}`}>
                        {fmtMoney(spent, bl.currency)}
                      </td>
                      <td className={`px-4 py-2.5 text-right font-mono text-xs ${bal != null ? (bal < 0 ? "text-red-600 font-semibold" : "text-green-700") : "text-gray-300"}`}>
                        {bal != null ? fmtMoney(bal, bl.currency) : "—"}
                      </td>
                      <td className={`px-4 py-2.5 text-right text-xs font-bold ${over ? "text-red-600" : "text-gray-600"}`}>
                        {cap != null && cap > 0 ? pct(spent, cap) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-100 border-t border-gray-200">
                <tr>
                  <td colSpan={3} className="px-4 py-2.5 text-xs font-bold text-gray-600">Total expenditure</td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm font-bold text-gray-800">
                    {fmtMoney(totalSpent, grant.currency)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          )}
        </section>

        {/* ── Income receipts ────────────────────────────────────────────────── */}
        <section className="page-break">
          <h2 className="text-sm font-bold uppercase tracking-wide text-brand-gold mb-3">
            4. Income Receipts ({grant.income.length})
          </h2>
          {grant.income.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No income receipts recorded.</p>
          ) : (
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Date</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Description</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-700 hidden md:table-cell">Source</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-700 hidden md:table-cell">Invoice</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-700">Currency</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grant.income.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{fmtDateShort(r.receivedDate)}</td>
                    <td className="px-4 py-2.5 text-gray-700">{r.description}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-400 hidden md:table-cell">{r.source ?? "—"}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-gray-400 hidden md:table-cell">{r.invoiceNumber ?? "—"}</td>
                    <td className="px-4 py-2.5 text-right text-xs text-gray-500">{r.currency}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs font-semibold text-green-700">{fmtMoney(r.amount, r.currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 border-t border-gray-200">
                <tr>
                  <td colSpan={4} className="px-4 py-2.5 text-xs font-bold text-gray-600">Total received</td>
                  <td className="px-4 py-2.5 text-right text-xs text-gray-500">{grant.currency}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm font-bold text-green-700">{fmtMoney(totalReceived, grant.currency)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </section>

        {/* ── Expenditure: Liquidations ──────────────────────────────────────── */}
        {liquidations.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide text-brand-gold mb-3">
              5a. Expenditure — Liquidations ({liquidations.length})
            </h2>
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Date</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Activity</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Budget Line</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-700">Accounted For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {liquidations.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{fmtDateShort(l.liquidationDate)}</td>
                    <td className="px-4 py-2.5 text-gray-700">{l.activity}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{l.budgetLine}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs font-semibold text-gray-700">{fmtMoney(l.fundsAccountedFor, l.currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 border-t border-gray-200">
                <tr>
                  <td colSpan={3} className="px-4 py-2.5 text-xs font-bold text-gray-600">Total liquidated</td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm font-bold text-gray-800">
                    {fmtMoney(liquidations.reduce((s, l) => s + l.fundsAccountedFor, 0), grant.currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>
        )}

        {/* ── Expenditure: Direct payments ───────────────────────────────────── */}
        {payables.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide text-brand-gold mb-3">
              5b. Expenditure — Direct Payments ({payables.length})
            </h2>
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Description</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Vendor</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Budget Line</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-gray-700">Date Paid</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payables.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-700">{p.description}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{p.vendor ?? "—"}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{p.budgetLine ?? "—"}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{p.paidDate ? fmtDateShort(p.paidDate) : "—"}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs font-semibold text-gray-700">{fmtMoney(p.amount, p.currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 border-t border-gray-200">
                <tr>
                  <td colSpan={4} className="px-4 py-2.5 text-xs font-bold text-gray-600">Total direct payments</td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm font-bold text-gray-800">
                    {fmtMoney(payables.reduce((s, p) => s + p.amount, 0), grant.currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>
        )}

        {/* ── Declaration / footer ───────────────────────────────────────────── */}
        <section className="border-t-2 border-gray-200 pt-6 text-xs text-gray-500 space-y-3">
          <p>
            This report was generated from the Astellic Finance Management System on{" "}
            <strong>{fmtDate(generatedAt)}</strong> by{" "}
            <strong>{session?.user?.name ?? "Finance"}</strong> ({session?.user?.role?.replace("_", " ")}).
            All figures are in {grant.currency} unless otherwise stated.
            Expenditure comprises FM-approved liquidations and PAID direct payments only.
          </p>
          <p className="font-mono text-gray-400">
            Ref: {refCode} · Grant ID: {grant.id}
          </p>

          {/* Signature lines for printed copies */}
          <div className="grid grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-200">
            {["Prepared by (Finance Manager)", "Approved by (Chief Executive Officer)"].map((role) => (
              <div key={role} className="space-y-6">
                <div className="border-b border-gray-400 h-12" />
                <div>
                  <p className="font-semibold text-gray-600">{role}</p>
                  <p className="text-gray-400 mt-0.5">Name: ___________________________</p>
                  <p className="text-gray-400 mt-0.5">Date:  ___________________________</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}
