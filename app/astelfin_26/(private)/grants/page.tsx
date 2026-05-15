import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { buildRateMap, toMWK, fmtMWK } from "@/lib/fx";
import { getActiveOrgId, orgWhere } from "@/lib/org";
import { LAUNCH_DATE } from "@/lib/constants";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const metadata = {
  title: "Donor Grants | Astelfin IMS",
  robots: { index: false, follow: false },
};

// ── Constants ─────────────────────────────────────────────────────────────────

const DONOR_TYPES = [
  { value: "BILATERAL",      label: "Bilateral (Government-to-Government)" },
  { value: "MULTILATERAL",   label: "Multilateral (UN, World Bank, etc.)" },
  { value: "FOUNDATION",     label: "Foundation / Trust" },
  { value: "CORPORATE",      label: "Corporate / Private Sector" },
  { value: "GOVERNMENT",     label: "Domestic Government" },
  { value: "OTHER",          label: "Other" },
];

const REPORTING_PERIODS = [
  { value: "MONTHLY",       label: "Monthly" },
  { value: "QUARTERLY",     label: "Quarterly" },
  { value: "SEMI-ANNUAL",   label: "Semi-Annual" },
  { value: "ANNUAL",        label: "Annual" },
];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:     "bg-green-100 text-green-700",
  COMPLETED:  "bg-blue-100 text-blue-700",
  SUSPENDED:  "bg-amber-100 text-amber-700",
  CANCELLED:  "bg-red-100 text-red-600",
};

const DONOR_TYPE_COLORS: Record<string, string> = {
  BILATERAL:    "bg-indigo-100 text-indigo-700",
  MULTILATERAL: "bg-purple-100 text-purple-700",
  FOUNDATION:   "bg-teal-100 text-teal-700",
  CORPORATE:    "bg-gray-100 text-gray-700",
  GOVERNMENT:   "bg-blue-100 text-blue-700",
  OTHER:        "bg-orange-100 text-orange-700",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtMoney(n: number, currency = "MWK") {
  return new Intl.NumberFormat("en-MW", {
    style: "currency", currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
}

// ── Server Actions ────────────────────────────────────────────────────────────

async function upsertGrant(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || !["CEO","FINANCE_MANAGER"].includes(session.user.role!))
    redirect("/astelfin_26/dashboard");

  const id              = (formData.get("id") as string) || null;
  const name            = (formData.get("name") as string).trim();
  const grantNumber     = (formData.get("grantNumber") as string) || null;
  const donorName       = (formData.get("donorName") as string).trim();
  const donorType       = (formData.get("donorType") as string) || "BILATERAL";
  const totalAmount     = parseFloat(formData.get("totalAmount") as string);
  const currency        = (formData.get("currency") as string) || "MWK";
  const startDate       = new Date(formData.get("startDate") as string);
  const endDateRaw      = formData.get("endDate") as string;
  const endDate         = endDateRaw ? new Date(endDateRaw) : null;
  const reportingPeriod = (formData.get("reportingPeriod") as string) || null;
  const status          = (formData.get("status") as string) || "ACTIVE";
  const notes           = (formData.get("notes") as string) || null;

  if (id) {
    await prisma.donorGrant.update({
      where: { id },
      data:  { name, grantNumber, donorName, donorType, totalAmount, currency, startDate, endDate, reportingPeriod, status, notes },
    });
    await auditLog({ userId: session.user.id!, action: "UPDATE", entity: "DonorGrant", entityId: id, detail: `Updated grant: ${name}` });
  } else {
    const grant = await prisma.donorGrant.create({
      data: { name, grantNumber, donorName, donorType, totalAmount, currency, startDate, endDate, reportingPeriod, status, notes },
    });
    await auditLog({ userId: session.user.id!, action: "CREATE", entity: "DonorGrant", entityId: grant.id, detail: `Created grant: ${name} (${donorName})` });
  }

  revalidatePath("/astelfin_26/grants");
  redirect("/astelfin_26/grants");
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function GrantsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; status?: string }>;
}) {
  const session = await auth();
  const role    = session?.user?.role ?? "";
  const canEdit = role === "CEO" || role === "FINANCE_MANAGER";

  const { edit: editId, status: filterStatus } = await searchParams;

  const activeOrgId = await getActiveOrgId(session);
  const orgFilter   = orgWhere(activeOrgId);

  const whereStatus = filterStatus && filterStatus !== "ALL" ? { status: filterStatus } : {};
  const grants = await prisma.donorGrant.findMany({
    where:   { ...whereStatus, ...orgFilter },
    orderBy: [{ status: "asc" }, { startDate: "desc" }],
    include: {
      _count: { select: { income: true, budgetLines: true } },
    },
  });

  // ── Exchange rates ────────────────────────────────────────────────────────
  const exchangeRates = await prisma.exchangeRate.findMany({
    select: { currency: true, middleRate: true, updatedAt: true },
  });
  const rateMap = buildRateMap(exchangeRates);

  // Aggregate received income per grant × currency (so we can convert to MWK)
  const incomeGroups = await prisma.income.groupBy({
    by:    ["grantId", "currency"],
    where: { grantId: { not: null }, deletedAt: null, ...orgFilter },
    _sum:  { amount: true },
  });
  const receivedMWKMap: Record<string, number> = {};
  for (const g of incomeGroups) {
    if (!g.grantId) continue;
    const mwk = toMWK(g._sum.amount ?? 0, g.currency, rateMap);
    receivedMWKMap[g.grantId] = (receivedMWKMap[g.grantId] ?? 0) + mwk;
  }

  // Aggregate spending per grant via linked budget lines × currency
  const linkedBudgetLines = await prisma.budgetLine.findMany({
    where:  { grantId: { not: null }, active: true },
    select: { id: true, name: true, grantId: true },
  });
  const blNamesByGrant: Record<string, string[]> = {};
  for (const bl of linkedBudgetLines) {
    if (bl.grantId) {
      if (!blNamesByGrant[bl.grantId]) blNamesByGrant[bl.grantId] = [];
      blNamesByGrant[bl.grantId].push(bl.name);
    }
  }

  const liquidGroups = await prisma.liquidation.groupBy({
    by:    ["budgetLine", "currency"],
    where: { status: "FM_APPROVED", deletedAt: null },
    _sum:  { fundsAccountedFor: true },
  });
  const payableGroups = await prisma.accountPayable.groupBy({
    by:    ["budgetLine", "currency"],
    where: { status: "PAID", budgetLine: { not: null }, deletedAt: null },
    _sum:  { amount: true },
  });

  // Build spendByBL in MWK
  const spendByBL: Record<string, number> = {};
  for (const g of liquidGroups) {
    const mwk = toMWK(g._sum.fundsAccountedFor ?? 0, g.currency, rateMap);
    spendByBL[g.budgetLine] = (spendByBL[g.budgetLine] ?? 0) + mwk;
  }
  for (const g of payableGroups) {
    if (!g.budgetLine) continue;
    const mwk = toMWK(g._sum.amount ?? 0, g.currency, rateMap);
    spendByBL[g.budgetLine] = (spendByBL[g.budgetLine] ?? 0) + mwk;
  }

  const spentMWKMap: Record<string, number> = {};
  for (const [grantId, blNames] of Object.entries(blNamesByGrant)) {
    spentMWKMap[grantId] = blNames.reduce((s, name) => s + (spendByBL[name] ?? 0), 0);
  }

  const editingGrant  = editId ? grants.find((g) => g.id === editId) : null;
  // Portfolio totals — all in MWK equivalent
  const totalAwardedMWK  = grants
    .filter((g) => g.status === "ACTIVE")
    .reduce((s, g) => s + toMWK(g.totalAmount, g.currency, rateMap), 0);
  const totalReceivedMWK = Object.values(receivedMWKMap).reduce((a, b) => a + b, 0);
  const totalSpentMWK    = Object.values(spentMWKMap).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Donor Grants</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Track funding awards, link income receipts, and monitor grant utilisation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {["ALL","ACTIVE","COMPLETED","SUSPENDED"].map((s) => (
            <Link key={s} href={`/astelfin_26/grants${s !== "ALL" ? `?status=${s}` : ""}`}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                (filterStatus ?? "ALL") === s
                  ? "bg-brand-navy text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {s}
            </Link>
          ))}
        </div>
      </div>

      {/* Summary */}
      {grants.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active Awards",  value: fmtMWK(totalAwardedMWK),  sub: `${grants.filter(g=>g.status==="ACTIVE").length} active grants · MWK equivalent` },
            { label: "Total Received", value: fmtMWK(totalReceivedMWK), sub: "linked income receipts · MWK equivalent" },
            { label: "Total Spent",    value: fmtMWK(totalSpentMWK),    sub: "approved liquidations + paid payables · MWK equiv." },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">{label}</p>
              <p className="text-2xl font-bold text-brand-navy">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit form */}
      {canEdit && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-brand-navy mb-4">
            {editingGrant ? `Edit: ${editingGrant.name}` : "Add Grant"}
          </h2>
          <form action={upsertGrant} className="grid grid-cols-2 gap-4">
            {editingGrant && <input type="hidden" name="id" value={editingGrant.id} />}

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Grant / Project Title <span className="text-red-500">*</span>
              </label>
              <input name="name" required defaultValue={editingGrant?.name}
                placeholder="e.g. EU Climate Resilience Project Phase II"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Donor Name <span className="text-red-500">*</span>
              </label>
              <input name="donorName" required defaultValue={editingGrant?.donorName}
                placeholder="e.g. European Union"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Donor Type</label>
              <select name="donorType" defaultValue={editingGrant?.donorType ?? "BILATERAL"}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
                {DONOR_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Grant / Contract Reference
              </label>
              <input name="grantNumber" defaultValue={editingGrant?.grantNumber ?? ""}
                placeholder="Donor-assigned contract number"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select name="status" defaultValue={editingGrant?.status ?? "ACTIVE"}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
                {["ACTIVE","COMPLETED","SUSPENDED","CANCELLED"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Total Award Amount <span className="text-red-500">*</span>
              </label>
              <input name="totalAmount" type="number" min="0" step="0.01" required
                defaultValue={editingGrant?.totalAmount}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
              <select name="currency" defaultValue={editingGrant?.currency ?? "MWK"}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
                {["MWK","USD","EUR","GBP","ZAR"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input name="startDate" type="date" required
                min={LAUNCH_DATE}
                defaultValue={editingGrant ? new Date(editingGrant.startDate).toISOString().split("T")[0] : LAUNCH_DATE}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                End Date (optional)
              </label>
              <input name="endDate" type="date"
                min={LAUNCH_DATE}
                defaultValue={editingGrant?.endDate ? new Date(editingGrant.endDate).toISOString().split("T")[0] : ""}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reporting Cycle</label>
              <select name="reportingPeriod" defaultValue={editingGrant?.reportingPeriod ?? ""}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
                <option value="">— Not specified —</option>
                {REPORTING_PERIODS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
              <input name="notes" defaultValue={editingGrant?.notes ?? ""}
                placeholder="Donor conditions, contact details, reporting deadlines…"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
            </div>

            <div className="col-span-2 flex gap-3">
              <button type="submit"
                className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                {editingGrant ? "Save Changes" : "Create Grant"}
              </button>
              {editingGrant && (
                <Link href="/astelfin_26/grants"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-semibold">
                  Cancel
                </Link>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Grants table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-brand-navy">
            {grants.length} grant{grants.length !== 1 ? "s" : ""}
            {filterStatus && filterStatus !== "ALL" && ` · ${filterStatus}`}
          </h2>
        </div>

        {grants.length === 0 ? (
          <p className="py-12 text-center text-gray-400 text-sm">
            No grants found.{canEdit && " Use the form above to add one."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Grant</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Donor</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Award</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Received <span className="font-normal text-gray-400 text-[10px]">MWK</span></th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 hidden lg:table-cell">Spent <span className="font-normal text-gray-400 text-[10px]">MWK</span></th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 w-32">Utilisation</th>
                <th className="px-5 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {grants.map((g) => {
                const receivedMWK = receivedMWKMap[g.id] ?? 0;
                const spentMWK    = spentMWKMap[g.id] ?? 0;
                const awardedMWK  = toMWK(g.totalAmount, g.currency, rateMap);
                const pct         = awardedMWK > 0 ? Math.min(100, (spentMWK / awardedMWK) * 100) : 0;
                const isOver      = spentMWK > awardedMWK;
                const isNear   = pct >= 80 && !isOver;
                const barColor = isOver ? "bg-red-500" : isNear ? "bg-amber-400" : "bg-brand-gold";
                const isEnding = g.endDate && g.status === "ACTIVE" &&
                  new Date(g.endDate).getTime() - Date.now() < 90 * 86_400_000;

                return (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/astelfin_26/grants/${g.id}`}
                          className="font-medium text-brand-navy hover:text-brand-gold transition-colors">
                          {g.name}
                        </Link>
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${STATUS_COLORS[g.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {g.status}
                        </span>
                        {isEnding && (
                          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            Ending soon
                          </span>
                        )}
                      </div>
                      {g.grantNumber && (
                        <div className="text-xs text-gray-400 mt-0.5 font-mono">{g.grantNumber}</div>
                      )}
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <div className="text-gray-700">{g.donorName}</div>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${DONOR_TYPE_COLORS[g.donorType] ?? "bg-gray-100 text-gray-600"}`}>
                        {g.donorType}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-xs font-semibold text-gray-700">
                      {fmtMoney(g.totalAmount, g.currency)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-green-700 hidden md:table-cell">
                      {receivedMWK > 0 ? fmtMWK(receivedMWK) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className={`px-5 py-3 text-right font-mono text-xs font-semibold hidden lg:table-cell ${isOver ? "text-red-600" : "text-gray-700"}`}>
                      {spentMWK > 0 ? fmtMWK(spentMWK) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      {spentMWK > 0 || awardedMWK > 0 ? (
                        <div className="space-y-1">
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className={`${barColor} h-2 rounded-full`} style={{ width: `${Math.min(100, pct)}%` }} />
                          </div>
                          <span className={`text-xs font-semibold ${isOver ? "text-red-600" : isNear ? "text-amber-600" : "text-gray-500"}`}>
                            {pct.toFixed(1)}%{isOver ? " OVER" : ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">0%</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-3">
                        <Link href={`/astelfin_26/grants/${g.id}`}
                          className="text-xs text-brand-navy hover:text-brand-gold font-semibold transition-colors">
                          View
                        </Link>
                        {canEdit && (
                          <Link href={`/astelfin_26/grants?edit=${g.id}`}
                            className="text-xs text-brand-gold font-semibold hover:underline">
                            Edit
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
