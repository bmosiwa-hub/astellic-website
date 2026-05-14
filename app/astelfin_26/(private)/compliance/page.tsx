import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Compliance Dashboard | Astelfin IMS",
  robots: { index: false, follow: false },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtMoney(n: number, currency = "MWK") {
  return new Intl.NumberFormat("en-MW", {
    style: "currency", currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
}

function daysAgo(d: Date) {
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ComplianceDashboardPage() {
  const session = await auth();
  const role    = session?.user?.role ?? "";
  if (!["CEO","FINANCE_MANAGER"].includes(role)) redirect("/astelfin_26/dashboard");

  const now = new Date();

  // ── 1. Budget ceiling breaches / near-limit ───────────────────────────────
  const budgetLines = await prisma.budgetLine.findMany({
    where:   { active: true, ceiling: { not: null } },
    include: { project: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  const liquidGroups = await prisma.liquidation.groupBy({
    by:    ["budgetLine"],
    where: { status: "FM_APPROVED", deletedAt: null },
    _sum:  { fundsAccountedFor: true },
  });

  const payableGroups = await prisma.accountPayable.groupBy({
    by:    ["budgetLine"],
    where: { status: "PAID", budgetLine: { not: null } },
    _sum:  { amount: true },
  });

  const spendMap: Record<string, number> = {};
  for (const g of liquidGroups)  spendMap[g.budgetLine] = (spendMap[g.budgetLine] ?? 0) + (g._sum.fundsAccountedFor ?? 0);
  for (const g of payableGroups) if (g.budgetLine) spendMap[g.budgetLine] = (spendMap[g.budgetLine] ?? 0) + (g._sum.amount ?? 0);

  const budgetAlerts = budgetLines
    .map((bl) => {
      const spent = spendMap[bl.name] ?? 0;
      const pct   = bl.ceiling! > 0 ? (spent / bl.ceiling!) * 100 : 0;
      return { ...bl, spent, pct };
    })
    .filter((bl) => bl.pct >= 80)
    .sort((a, b) => b.pct - a.pct);

  // ── 2. Overdue liquidations ───────────────────────────────────────────────
  // Submissions that are PAID, past their liquidationDeadline, with no FM_APPROVED liquidation
  const paidSubmissions = await prisma.submission.findMany({
    where: {
      status:               "PAID",
      liquidationDeadline:  { lt: now },
      deletedAt:            null,
    },
    include: {
      submitter: { select: { name: true } },
      liquidations: {
        where: { status: "FM_APPROVED", deletedAt: null },
        select: { id: true },
      },
    },
    orderBy: { liquidationDeadline: "asc" },
  });

  const overdueLiquidations = paidSubmissions.filter(
    (s) => s.liquidations.length === 0
  );

  // ── 3. Procurement gaps (insufficient quotations per thresholds) ──────────
  const thresholds = await prisma.procurementThreshold.findMany({
    orderBy: { minAmount: "asc" },
  });

  const openProcurements = await prisma.procurement.findMany({
    where: {
      status:    { in: ["DRAFT", "PENDING_APPROVAL"] },
      deletedAt: null,
    },
    include: {
      requester:  { select: { name: true } },
      quotations: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  function requiredQuotations(amount: number): { min: number; tender: boolean; label: string } {
    let match = { min: 1, tender: false, label: "Direct Purchase" };
    for (const t of thresholds) {
      if (amount >= t.minAmount && (t.maxAmount == null || amount <= t.maxAmount)) {
        match = { min: t.minQuotations, tender: t.requiresTender, label: t.label };
      }
    }
    return match;
  }

  const procurementGaps = openProcurements
    .map((p) => {
      const req = requiredQuotations(p.estimatedCost);
      const has = (p as typeof p & { quotations: { id: string }[] }).quotations.length;
      return { ...p, req, has, gap: Math.max(0, req.min - has) };
    })
    .filter((p) => p.gap > 0);

  // ── 4. Unliquidated advances (PAID, no liquidation at all, not yet past deadline) ──
  const unliquidatedAdvances = await prisma.submission.findMany({
    where: {
      status:    "PAID",
      deletedAt: null,
      liquidations: { none: {} },
    },
    include: {
      submitter: { select: { name: true } },
    },
    orderBy: { updatedAt: "asc" },
  });

  // ── 5. Liquidations with no supporting documents (Phase 2) ───────────────
  const approvedLiquidations = await prisma.liquidation.findMany({
    where:   { status: "FM_APPROVED", deletedAt: null },
    select:  { id: true, activity: true, budgetLine: true, fundsAccountedFor: true, currency: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take:    200,
  });

  const docCounts = await prisma.document.groupBy({
    by:    ["entityId"],
    where: {
      entityType: "Liquidation",
      entityId:   { in: approvedLiquidations.map((l) => l.id) },
      deletedAt:  null,
    },
    _count: { id: true },
  });

  const docCountMap = Object.fromEntries(docCounts.map((d) => [d.entityId, d._count.id]));
  const missingDocs = approvedLiquidations.filter((l) => !docCountMap[l.id]);

  // ── Tally ─────────────────────────────────────────────────────────────────
  const totalIssues =
    budgetAlerts.length + overdueLiquidations.length +
    procurementGaps.length + missingDocs.length;

  const criticalIssues =
    budgetAlerts.filter((b) => b.pct >= 100).length + overdueLiquidations.length;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Compliance Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Live view of financial controls, policy compliance, and audit readiness.
          </p>
        </div>
        <Link href="/astelfin_26/budget"
          className="text-sm text-brand-gold font-semibold hover:underline">
          Budget Lines →
        </Link>
      </div>

      {/* Score bar */}
      <div className={`rounded-2xl border px-6 py-5 flex items-center gap-6 ${
        criticalIssues > 0
          ? "bg-red-50 border-red-200"
          : totalIssues > 0
          ? "bg-amber-50 border-amber-200"
          : "bg-green-50 border-green-200"
      }`}>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
          criticalIssues > 0 ? "bg-red-100" : totalIssues > 0 ? "bg-amber-100" : "bg-green-100"
        }`}>
          {criticalIssues > 0 || totalIssues > 0 ? (
            <svg className={`w-7 h-7 ${criticalIssues > 0 ? "text-red-600" : "text-amber-600"}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <p className={`font-bold text-lg ${criticalIssues > 0 ? "text-red-800" : totalIssues > 0 ? "text-amber-800" : "text-green-800"}`}>
            {totalIssues === 0
              ? "All controls passing — no issues detected"
              : `${totalIssues} issue${totalIssues !== 1 ? "s" : ""} detected${criticalIssues > 0 ? ` (${criticalIssues} critical)` : ""}`}
          </p>
          <p className={`text-sm mt-0.5 ${criticalIssues > 0 ? "text-red-600" : totalIssues > 0 ? "text-amber-600" : "text-green-600"}`}>
            {totalIssues === 0
              ? "Budget ceilings, liquidations, procurement, and documentation are all within policy."
              : "Review the sections below and resolve outstanding items before the next donor reporting period."}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center shrink-0">
          {[
            { n: budgetAlerts.length,       label: "Budget alerts",  color: budgetAlerts.length > 0 ? "text-red-700" : "text-gray-400" },
            { n: overdueLiquidations.length, label: "Overdue liq.",   color: overdueLiquidations.length > 0 ? "text-red-700" : "text-gray-400" },
            { n: procurementGaps.length,    label: "Proc. gaps",     color: procurementGaps.length > 0 ? "text-amber-700" : "text-gray-400" },
            { n: missingDocs.length,        label: "Missing docs",   color: missingDocs.length > 0 ? "text-amber-700" : "text-gray-400" },
          ].map(({ n, label, color }) => (
            <div key={label}>
              <p className={`text-2xl font-bold ${color}`}>{n}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 1: Budget Ceiling Alerts ─────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="font-bold text-brand-navy flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full inline-block ${budgetAlerts.length > 0 ? "bg-red-500" : "bg-green-400"}`} />
          Budget Ceiling Alerts
          <span className="text-sm font-normal text-gray-400 ml-1">
            ({budgetAlerts.length} line{budgetAlerts.length !== 1 ? "s" : ""} ≥ 80% utilised)
          </span>
        </h2>

        {budgetAlerts.length === 0 ? (
          <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-4 text-sm text-green-700">
            ✓ All budget lines with ceilings are within policy limits.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Budget Line</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Project</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Ceiling</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Spent</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 w-36">Utilisation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {budgetAlerts.map((bl) => {
                  const isOver  = bl.pct >= 100;
                  const barW    = Math.min(100, bl.pct);
                  const barCol  = isOver ? "bg-red-500" : "bg-amber-400";
                  return (
                    <tr key={bl.id} className={isOver ? "bg-red-50/40" : "bg-amber-50/30"}>
                      <td className="px-5 py-3 font-medium text-brand-navy">{bl.name}</td>
                      <td className="px-5 py-3 text-xs text-gray-500 hidden md:table-cell">{bl.project?.name ?? "Org-wide"}</td>
                      <td className="px-5 py-3 text-right font-mono text-xs">{fmtMoney(bl.ceiling!, bl.currency)}</td>
                      <td className={`px-5 py-3 text-right font-mono text-xs font-bold ${isOver ? "text-red-600" : "text-amber-600"}`}>
                        {fmtMoney(bl.spent, bl.currency)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                          <div className={`${barCol} h-2 rounded-full`} style={{ width: `${barW}%` }} />
                        </div>
                        <span className={`text-xs font-semibold ${isOver ? "text-red-600" : "text-amber-600"}`}>
                          {bl.pct.toFixed(1)}%{isOver ? " OVER" : ""}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Section 2: Overdue Liquidations ──────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="font-bold text-brand-navy flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full inline-block ${overdueLiquidations.length > 0 ? "bg-red-500" : "bg-green-400"}`} />
          Overdue Liquidations
          <span className="text-sm font-normal text-gray-400 ml-1">
            ({overdueLiquidations.length} advance{overdueLiquidations.length !== 1 ? "s" : ""} past deadline with no approved liquidation)
          </span>
        </h2>

        {overdueLiquidations.length === 0 ? (
          <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-4 text-sm text-green-700">
            ✓ All paid advances have been liquidated within the required period.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-red-50 border-b border-red-100">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Request</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Submitter</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Amount</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Deadline</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Days Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-50">
                {overdueLiquidations.map((s) => {
                  const days = s.liquidationDeadline ? daysAgo(s.liquidationDeadline) : 0;
                  return (
                    <tr key={s.id} className="bg-red-50/20">
                      <td className="px-5 py-3">
                        <Link href={`/astelfin_26/invoices/${s.id}`}
                          className="font-medium text-brand-navy hover:text-brand-gold transition-colors">
                          {s.purpose ?? s.milestone ?? `Request #${s.id.slice(-6).toUpperCase()}`}
                        </Link>
                        <div className="text-xs text-gray-400">{s.budgetLine ?? "—"}</div>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{s.submitter.name}</td>
                      <td className="px-5 py-3 text-right font-mono text-xs font-semibold text-gray-700">
                        {fmtMoney(s.totalAmount, s.currency)}
                      </td>
                      <td className="px-5 py-3 text-xs text-red-600">
                        {s.liquidationDeadline?.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          {days}d overdue
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Section 3: Procurement Gaps ──────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="font-bold text-brand-navy flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full inline-block ${procurementGaps.length > 0 ? "bg-amber-500" : "bg-green-400"}`} />
          Procurement Policy Gaps
          <span className="text-sm font-normal text-gray-400 ml-1">
            ({procurementGaps.length} open request{procurementGaps.length !== 1 ? "s" : ""} with insufficient quotations)
          </span>
        </h2>

        {procurementGaps.length === 0 ? (
          <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-4 text-sm text-green-700">
            ✓ All open procurement requests meet quotation requirements.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 border-b border-amber-100">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Request</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Requester</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Est. Cost</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Tier</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Quotations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {procurementGaps.map((p) => (
                  <tr key={p.id} className="bg-amber-50/20">
                    <td className="px-5 py-3">
                      <Link href={`/astelfin_26/procurement/${p.id}`}
                        className="font-medium text-brand-navy hover:text-brand-gold transition-colors">
                        {p.title}
                      </Link>
                      <div className="text-xs text-gray-400">{p.category ?? "—"}</div>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs">{(p as typeof p & { requester: { name: string } }).requester.name}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs font-semibold">
                      {fmtMoney(p.estimatedCost, p.currency)}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                        {p.req.label}
                        {p.req.tender && " (Tender required)"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-semibold text-amber-700">
                        {p.has}/{p.req.min} quotations
                      </span>
                      <span className="text-xs text-gray-400 ml-1">
                        ({p.gap} more needed)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Section 4: Unliquidated Advances ─────────────────────────────── */}
      {unliquidatedAdvances.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold text-brand-navy flex items-center gap-2">
            <span className="w-2 h-2 rounded-full inline-block bg-blue-400" />
            Unliquidated Advances
            <span className="text-sm font-normal text-gray-400 ml-1">
              ({unliquidatedAdvances.length} paid advance{unliquidatedAdvances.length !== 1 ? "s" : ""} awaiting liquidation)
            </span>
          </h2>
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 border-b border-blue-100">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Request</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Submitter</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Amount</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {unliquidatedAdvances.map((s) => {
                  const daysLeft = s.liquidationDeadline
                    ? Math.ceil((s.liquidationDeadline.getTime() - Date.now()) / 86_400_000)
                    : null;
                  return (
                    <tr key={s.id}>
                      <td className="px-5 py-3">
                        <Link href={`/astelfin_26/invoices/${s.id}`}
                          className="font-medium text-brand-navy hover:text-brand-gold transition-colors">
                          {s.purpose ?? s.milestone ?? `Request #${s.id.slice(-6).toUpperCase()}`}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{s.submitter.name}</td>
                      <td className="px-5 py-3 text-right font-mono text-xs font-semibold">
                        {fmtMoney(s.totalAmount, s.currency)}
                      </td>
                      <td className="px-5 py-3">
                        {daysLeft != null ? (
                          <span className={`text-xs font-semibold ${daysLeft <= 3 ? "text-red-600" : daysLeft <= 7 ? "text-amber-600" : "text-blue-600"}`}>
                            {daysLeft > 0 ? `${daysLeft}d remaining` : `${Math.abs(daysLeft)}d overdue`}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No deadline set</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Section 5: Approved Liquidations with No Documents ───────────── */}
      <section className="space-y-3">
        <h2 className="font-bold text-brand-navy flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full inline-block ${missingDocs.length > 0 ? "bg-amber-500" : "bg-green-400"}`} />
          Missing Supporting Documents
          <span className="text-sm font-normal text-gray-400 ml-1">
            ({missingDocs.length} approved liquidation{missingDocs.length !== 1 ? "s" : ""} with no attached receipts/documents)
          </span>
        </h2>

        {missingDocs.length === 0 ? (
          <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-4 text-sm text-green-700">
            ✓ All approved liquidations have at least one supporting document.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 border-b border-amber-100">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Activity</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Budget Line</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Amount</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {missingDocs.map((l) => (
                  <tr key={l.id} className="bg-amber-50/20">
                    <td className="px-5 py-3 font-medium text-brand-navy">{l.activity}</td>
                    <td className="px-5 py-3 text-xs text-gray-500">{l.budgetLine}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs font-semibold">
                      {fmtMoney(l.fundsAccountedFor, l.currency)}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {l.createdAt.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/astelfin_26/liquidations`}
                        className="text-xs text-brand-gold font-semibold hover:underline">
                        Attach docs →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Procurement Thresholds reference ─────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="font-bold text-brand-navy">Procurement Policy Reference</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Tier</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Amount Range (MWK)</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Min. Quotations</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Tender Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(await prisma.procurementThreshold.findMany({ orderBy: { minAmount: "asc" } })).map((t) => (
                <tr key={t.id}>
                  <td className="px-5 py-3 font-medium text-brand-navy">{t.label}</td>
                  <td className="px-5 py-3 text-xs text-gray-600 font-mono">
                    {fmtMoney(t.minAmount, t.currency)} – {t.maxAmount != null ? fmtMoney(t.maxAmount, t.currency) : "No limit"}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600">{t.minQuotations}</td>
                  <td className="px-5 py-3">
                    {t.requiresTender
                      ? <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Yes</span>
                      : <span className="text-xs text-gray-400">No</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-5 py-3 text-xs text-gray-400 border-t border-gray-50">
            Thresholds are managed in{" "}
            <Link href="/astelfin_26/settings" className="text-brand-gold hover:underline">Settings → Procurement Policy</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
