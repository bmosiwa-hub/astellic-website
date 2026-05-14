import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Grant Detail | Astelfin IMS",
  robots: { index: false, follow: false },
};

function fmtMoney(n: number, currency = "MWK") {
  return new Intl.NumberFormat("en-MW", {
    style: "currency", currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function GrantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const role    = session?.user?.role ?? "";
  if (!["CEO","FINANCE_MANAGER"].includes(role)) redirect("/astelfin_26/dashboard");

  const { id } = await params;

  const grant = await prisma.donorGrant.findUnique({
    where:   { id },
    include: {
      budgetLines: {
        orderBy: [{ active: "desc" }, { name: "asc" }],
        include: { project: { select: { name: true } } },
      },
      income: {
        where:   { deletedAt: null },
        orderBy: { receivedDate: "desc" },
        select:  { id: true, description: true, amount: true, currency: true, receivedDate: true, source: true },
      },
    },
  });

  if (!grant) notFound();

  // ── Compute utilisation ───────────────────────────────────────────────────
  const blNames = grant.budgetLines.map((bl) => bl.name);

  const [liquidGroups, payableGroups] = await Promise.all([
    blNames.length > 0
      ? prisma.liquidation.groupBy({
          by:    ["budgetLine"],
          where: { budgetLine: { in: blNames }, status: "FM_APPROVED", deletedAt: null },
          _sum:  { fundsAccountedFor: true },
        })
      : Promise.resolve([]),
    blNames.length > 0
      ? prisma.accountPayable.groupBy({
          by:    ["budgetLine"],
          where: { budgetLine: { in: blNames }, status: "PAID" },
          _sum:  { amount: true },
        })
      : Promise.resolve([]),
  ]);

  const spendByBL: Record<string, number> = {};
  for (const g of liquidGroups)  spendByBL[g.budgetLine] = (spendByBL[g.budgetLine] ?? 0) + (g._sum.fundsAccountedFor ?? 0);
  for (const g of payableGroups) if (g.budgetLine) spendByBL[g.budgetLine] = (spendByBL[g.budgetLine] ?? 0) + (g._sum.amount ?? 0);

  const totalReceived = grant.income.reduce((s, r) => s + r.amount, 0);
  const totalSpent    = Object.values(spendByBL).reduce((a, b) => a + b, 0);
  const totalAwarded  = grant.totalAmount;
  const utilPct       = totalAwarded > 0 ? Math.min(100, (totalSpent / totalAwarded) * 100) : 0;
  const recvPct       = totalAwarded > 0 ? Math.min(100, (totalReceived / totalAwarded) * 100) : 0;
  const isOver        = totalSpent > totalAwarded;
  const daysLeft      = grant.endDate
    ? Math.ceil((new Date(grant.endDate).getTime() - Date.now()) / 86_400_000)
    : null;

  const STATUS_COLORS: Record<string, string> = {
    ACTIVE:    "bg-green-100 text-green-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    SUSPENDED: "bg-amber-100 text-amber-700",
    CANCELLED: "bg-red-100 text-red-600",
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/astelfin_26/grants"
          className="text-gray-400 hover:text-brand-navy mt-1 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-brand-navy">{grant.name}</h1>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[grant.status] ?? "bg-gray-100 text-gray-600"}`}>
              {grant.status}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-0.5">
            {grant.donorName}
            {grant.grantNumber && <span className="font-mono ml-2 text-gray-300">· {grant.grantNumber}</span>}
            {" · "}{fmtDate(grant.startDate)}
            {grant.endDate && ` – ${fmtDate(grant.endDate)}`}
            {grant.reportingPeriod && ` · ${grant.reportingPeriod} reporting`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a href={`/api/finance/grants/${grant.id}/export`}
            className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-semibold transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            CSV
          </a>
          <Link href={`/astelfin_26/grants/${grant.id}/report`}
            className="flex items-center gap-1 text-xs bg-brand-navy hover:bg-brand-navy/90 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Report
          </Link>
          <Link href={`/astelfin_26/grants?edit=${grant.id}`}
            className="text-sm text-brand-gold font-semibold hover:underline">
            Edit →
          </Link>
        </div>
      </div>

      {/* Countdown / notes */}
      {(daysLeft != null || grant.notes) && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {daysLeft != null && (
            <div className={`rounded-xl border px-5 py-3 text-sm ${
              daysLeft < 0 ? "bg-red-50 border-red-200 text-red-700" :
              daysLeft < 90 ? "bg-amber-50 border-amber-200 text-amber-700" :
              "bg-green-50 border-green-200 text-green-700"
            }`}>
              <span className="font-semibold">
                {daysLeft < 0 ? `Ended ${Math.abs(daysLeft)} days ago` :
                 daysLeft === 0 ? "Ends today" :
                 `${daysLeft} days remaining`}
              </span>
              {" — end date: "}{fmtDate(grant.endDate!)}
            </div>
          )}
          {grant.notes && (
            <div className="rounded-xl border border-gray-100 bg-brand-light px-5 py-3 text-sm text-gray-600">
              {grant.notes}
            </div>
          )}
        </div>
      )}

      {/* Utilisation cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Award",   value: fmtMoney(totalAwarded, grant.currency),  sub: "contracted amount" },
          { label: "Funds Received",value: fmtMoney(totalReceived),                 sub: `${recvPct.toFixed(1)}% of award received`, pct: recvPct, color: "bg-blue-400" },
          { label: "Funds Spent",   value: fmtMoney(totalSpent),                    sub: `${utilPct.toFixed(1)}% utilised${isOver ? " — OVER BUDGET" : ""}`, pct: utilPct, color: isOver ? "bg-red-500" : utilPct >= 80 ? "bg-amber-400" : "bg-brand-gold", warn: isOver },
        ].map(({ label, value, sub, pct, color, warn }) => (
          <div key={label} className={`rounded-xl border px-5 py-4 ${warn ? "border-red-200 bg-red-50" : "border-gray-100 bg-white shadow-sm"}`}>
            <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${warn ? "text-red-500" : "text-gray-400"}`}>{label}</p>
            <p className={`text-xl font-bold ${warn ? "text-red-700" : "text-brand-navy"}`}>{value}</p>
            {pct != null && (
              <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                <div className={`${color} h-1.5 rounded-full`} style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
            )}
            <p className={`text-xs mt-1 ${warn ? "text-red-500" : "text-gray-400"}`}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Budget Lines */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-brand-navy">
            Budget Lines ({grant.budgetLines.length})
          </h2>
          <Link href={`/astelfin_26/budget`}
            className="text-xs text-brand-gold font-semibold hover:underline">
            Manage budget lines →
          </Link>
        </div>
        {grant.budgetLines.length === 0 ? (
          <p className="py-8 text-center text-gray-400 text-sm">
            No budget lines linked.{" "}
            <Link href="/astelfin_26/budget" className="text-brand-gold hover:underline">
              Go to Budget Lines
            </Link>{" "}
            to link this grant to a budget line.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Budget Line</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Project</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Ceiling</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Spent</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 w-28">Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {grant.budgetLines.map((bl) => {
                const spent  = spendByBL[bl.name] ?? 0;
                const pct    = bl.ceiling ? Math.min(100, (spent / bl.ceiling) * 100) : null;
                const over   = bl.ceiling != null && spent > bl.ceiling;
                return (
                  <tr key={bl.id} className={`hover:bg-gray-50 ${!bl.active ? "opacity-50" : ""}`}>
                    <td className="px-5 py-3 font-medium text-brand-navy">{bl.name}</td>
                    <td className="px-5 py-3 text-xs text-gray-400 hidden md:table-cell">{bl.project?.name ?? "Org-wide"}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-gray-500">
                      {bl.ceiling != null ? fmtMoney(bl.ceiling, bl.currency) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className={`px-5 py-3 text-right font-mono text-xs font-semibold ${over ? "text-red-600" : "text-gray-700"}`}>
                      {fmtMoney(spent, bl.currency)}
                    </td>
                    <td className="px-5 py-3">
                      {pct != null ? (
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className={`${over ? "bg-red-500" : pct >= 80 ? "bg-amber-400" : "bg-brand-gold"} h-2 rounded-full`}
                            style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Income receipts */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-brand-navy">
            Income Receipts ({grant.income.length})
          </h2>
          <Link href="/astelfin_26/income/new"
            className="text-xs text-brand-gold font-semibold hover:underline">
            + Record receipt
          </Link>
        </div>
        {grant.income.length === 0 ? (
          <p className="py-8 text-center text-gray-400 text-sm">
            No income records linked to this grant.{" "}
            <Link href="/astelfin_26/income/new" className="text-brand-gold hover:underline">
              Record a receipt
            </Link>{" "}
            and assign it to this grant.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Description</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Source</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Amount</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {grant.income.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-700">{r.description}</td>
                  <td className="px-5 py-3 text-xs text-gray-400 hidden md:table-cell">{r.source ?? "—"}</td>
                  <td className="px-5 py-3 text-right font-mono text-xs font-semibold text-green-700">
                    {fmtMoney(r.amount, r.currency)}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">{fmtDate(r.receivedDate)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-100">
              <tr>
                <td colSpan={2} className="px-5 py-3 text-xs font-semibold text-gray-500">Total received</td>
                <td className="px-5 py-3 text-right font-mono text-sm font-bold text-green-700">
                  {fmtMoney(totalReceived, grant.currency)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
