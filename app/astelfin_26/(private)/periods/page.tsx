import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { writeApprovalRecord } from "@/lib/approval-record";
import { toPeriodKey, periodLabel } from "@/lib/period-lock";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createHash } from "crypto";
import Link from "next/link";

export const metadata = {
  title: "Financial Periods | Astelfin IMS",
  robots: { index: false, follow: false },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-MW", {
    style: "currency", currency: "MWK",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
}

// ── Period checksum ───────────────────────────────────────────────────────────
// Deterministic hash of all financial records in a given YYYY-MM period.

async function buildPeriodChecksum(periodKey: string): Promise<string> {
  const [yearStr, monthStr] = periodKey.split("-");
  const year  = parseInt(yearStr);
  const month = parseInt(monthStr);
  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 1);

  const [income, expenses, liquidations, payroll] = await Promise.all([
    prisma.income.findMany({
      where:   { receivedDate: { gte: start, lt: end }, deletedAt: null },
      select:  { id: true, amount: true, currency: true, receivedDate: true },
      orderBy: { id: "asc" },
    }),
    prisma.expense.findMany({
      where:   { paidDate: { gte: start, lt: end }, deletedAt: null },
      select:  { id: true, amount: true, currency: true, paidDate: true },
      orderBy: { id: "asc" },
    }),
    prisma.liquidation.findMany({
      where:   { liquidationDate: { gte: start, lt: end }, status: "FM_APPROVED", deletedAt: null },
      select:  { id: true, fundsAccountedFor: true, currency: true, liquidationDate: true },
      orderBy: { id: "asc" },
    }),
    prisma.payroll.findMany({
      where:   { period: periodKey },
      select:  { id: true, netPay: true },
      orderBy: { id: "asc" },
    }),
  ]);

  const payload = JSON.stringify({ periodKey, income, expenses, liquidations, payroll });
  return createHash("sha256").update(payload).digest("hex");
}

// ── Server Actions ────────────────────────────────────────────────────────────

async function closePeriod(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || !["CEO","FINANCE_MANAGER"].includes(session.user.role!))
    redirect("/astelfin_26/dashboard");

  const periodKey = formData.get("periodKey") as string;
  const notes     = (formData.get("notes") as string) || null;
  const [yearStr, monthStr] = periodKey.split("-");

  await prisma.financialPeriod.upsert({
    where:  { periodKey },
    create: {
      periodKey, year: parseInt(yearStr), month: parseInt(monthStr),
      status: "CLOSED", closedAt: new Date(), closedById: session.user.id!, notes,
    },
    update: { status: "CLOSED", closedAt: new Date(), closedById: session.user.id!, notes },
  });

  await auditLog({
    userId:   session.user.id!, action: "CLOSE_PERIOD",
    entity:   "FinancialPeriod",  entityId: periodKey,
    detail:   `Period ${periodKey} closed by ${session.user.role}`,
  });

  revalidatePath("/astelfin_26/periods");
}

async function lockPeriod(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const periodKey = formData.get("periodKey") as string;
  const notes     = (formData.get("notes") as string) || null;
  const [yearStr, monthStr] = periodKey.split("-");

  const checksum = await buildPeriodChecksum(periodKey);

  await prisma.financialPeriod.upsert({
    where:  { periodKey },
    create: {
      periodKey, year: parseInt(yearStr), month: parseInt(monthStr),
      status: "LOCKED", closedAt: new Date(), closedById: session.user.id!,
      lockedAt: new Date(), lockedById: session.user.id!, checksum, notes,
    },
    update: {
      status: "LOCKED", lockedAt: new Date(), lockedById: session.user.id!, checksum, notes,
    },
  });

  const locker = await prisma.user.findUnique({ where: { id: session.user.id! }, select: { name: true, email: true, role: true } });
  await writeApprovalRecord({
    entityType:     "FinancialPeriod",
    entityId:       periodKey,
    decidedById:    session.user.id!,
    decidedByEmail: locker?.email ?? "",
    decidedByName:  locker?.name  ?? "",
    decidedByRole:  locker?.role  ?? "CEO",
    decision:       "APPROVED",
    previousStatus: "CLOSED",
    newStatus:      "LOCKED",
    comments:       `Period locked for donor submission — checksum: ${checksum.slice(0, 16)}…`,
  });

  await auditLog({
    userId:   session.user.id!, action: "LOCK_PERIOD",
    entity:   "FinancialPeriod",  entityId: periodKey,
    detail:   `Period ${periodKey} locked — checksum ${checksum.slice(0,16)}…`,
  });

  revalidatePath("/astelfin_26/periods");
}

async function reopenPeriod(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const periodKey = formData.get("periodKey") as string;

  await prisma.financialPeriod.update({
    where: { periodKey },
    data:  { status: "OPEN", lockedAt: null, lockedById: null, checksum: null },
  });

  await auditLog({
    userId:   session.user.id!, action: "REOPEN_PERIOD",
    entity:   "FinancialPeriod",  entityId: periodKey,
    detail:   `Period ${periodKey} reopened by CEO (checksum invalidated)`,
  });

  revalidatePath("/astelfin_26/periods");
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PeriodsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const session = await auth();
  const role    = session?.user?.role ?? "";
  const isCEO   = role === "CEO";
  const isFM    = role === "FINANCE_MANAGER";
  if (!isCEO && !isFM) redirect("/astelfin_26/dashboard");

  const { year: yearStr } = await searchParams;
  const currentYear = new Date().getFullYear();
  const year        = parseInt(yearStr ?? String(currentYear)) || currentYear;

  // Fetch all period records for this year
  const periodRecords = await prisma.financialPeriod.findMany({
    where:   { year },
    include: { closedBy: { select: { name: true } }, lockedBy: { select: { name: true } } },
  });
  const periodMap = Object.fromEntries(periodRecords.map((p) => [p.periodKey, p]));

  // Fetch income & expense aggregates per month for this year
  const yearStart = new Date(year, 0, 1);
  const yearEnd   = new Date(year + 1, 0, 1);

  const [incomeGroups, expenseGroups] = await Promise.all([
    prisma.income.groupBy({
      by:    ["receivedDate"],
      where: { receivedDate: { gte: yearStart, lt: yearEnd }, deletedAt: null },
      _sum:  { amount: true },
      _count: { id: true },
    }),
    prisma.expense.groupBy({
      by:    ["paidDate"],
      where: { paidDate: { gte: yearStart, lt: yearEnd }, deletedAt: null },
      _sum:  { amount: true },
      _count: { id: true },
    }),
  ]);

  // Bucket by month
  const incomeByMonth: Record<number, { sum: number; count: number }> = {};
  const expenseByMonth: Record<number, { sum: number; count: number }> = {};

  for (const g of incomeGroups) {
    const m = new Date(g.receivedDate).getMonth() + 1;
    if (!incomeByMonth[m]) incomeByMonth[m] = { sum: 0, count: 0 };
    incomeByMonth[m].sum   += g._sum.amount ?? 0;
    incomeByMonth[m].count += g._count.id;
  }
  for (const g of expenseGroups) {
    const m = new Date(g.paidDate).getMonth() + 1;
    if (!expenseByMonth[m]) expenseByMonth[m] = { sum: 0, count: 0 };
    expenseByMonth[m].sum   += g._sum.amount ?? 0;
    expenseByMonth[m].count += g._count.id;
  }

  const fyOptions = [currentYear - 1, currentYear, currentYear + 1];

  const STATUS_BADGE: Record<string, string> = {
    OPEN:   "bg-green-100 text-green-700",
    CLOSED: "bg-amber-100 text-amber-700",
    LOCKED: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Financial Periods</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Close and lock monthly periods to prevent backdating.
            Locked periods generate a tamper-evident checksum for donor submission.
          </p>
        </div>
        <div className="flex items-center gap-1 text-sm border border-gray-200 rounded-lg overflow-hidden">
          {fyOptions.map((y) => (
            <Link key={y} href={`/astelfin_26/periods?year=${y}`}
              className={`px-3 py-1.5 font-medium transition-colors ${
                y === year ? "bg-brand-navy text-white" : "text-gray-500 hover:bg-gray-50"
              }`}>
              {y}
            </Link>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        {[
          { label: "Open — entries permitted", color: "bg-green-400" },
          { label: "Closed — no new entries (FM)", color: "bg-amber-400" },
          { label: "Locked — immutable checksum (CEO)", color: "bg-red-400" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full inline-block ${color}`} />
            {label}
          </div>
        ))}
      </div>

      {/* Periods table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Month</th>
              <th className="text-right px-5 py-3 font-semibold text-gray-600">Income</th>
              <th className="text-right px-5 py-3 font-semibold text-gray-600">Expenses</th>
              <th className="text-right px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Net</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden lg:table-cell">Locked by / Checksum</th>
              <th className="px-5 py-3 text-right font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MONTHS.map((monthName, idx) => {
              const month     = idx + 1;
              const key       = `${year}-${String(month).padStart(2, "0")}`;
              const record    = periodMap[key];
              const status    = record?.status ?? "OPEN";
              const inc       = incomeByMonth[month]  ?? { sum: 0, count: 0 };
              const exp       = expenseByMonth[month] ?? { sum: 0, count: 0 };
              const net       = inc.sum - exp.sum;
              const isPast    = new Date(year, month, 1) <= new Date();

              return (
                <tr key={key} className={`hover:bg-gray-50 ${status === "LOCKED" ? "bg-red-50/20" : status === "CLOSED" ? "bg-amber-50/20" : ""}`}>
                  <td className="px-5 py-3 font-medium text-brand-navy">{monthName} {year}</td>
                  <td className="px-5 py-3 text-right text-xs font-mono text-green-700">
                    {inc.sum > 0 ? fmtMoney(inc.sum) : <span className="text-gray-300">—</span>}
                    {inc.count > 0 && <span className="text-gray-400 ml-1">({inc.count})</span>}
                  </td>
                  <td className="px-5 py-3 text-right text-xs font-mono text-red-600">
                    {exp.sum > 0 ? fmtMoney(exp.sum) : <span className="text-gray-300">—</span>}
                    {exp.count > 0 && <span className="text-gray-400 ml-1">({exp.count})</span>}
                  </td>
                  <td className={`px-5 py-3 text-right text-xs font-mono font-semibold hidden md:table-cell ${net >= 0 ? "text-green-700" : "text-red-600"}`}>
                    {(inc.sum > 0 || exp.sum > 0) ? fmtMoney(net) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[status]}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400 hidden lg:table-cell">
                    {record?.lockedBy && (
                      <div>
                        <div className="font-medium text-gray-600">{record.lockedBy.name}</div>
                        {record.checksum && (
                          <div className="font-mono text-gray-300 text-[10px]" title={record.checksum}>
                            {record.checksum.slice(0, 20)}…
                          </div>
                        )}
                      </div>
                    )}
                    {!record?.lockedBy && record?.closedBy && (
                      <span className="text-gray-400">{record.closedBy.name}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-2 flex-wrap justify-end">
                      {/* Export (locked periods only) */}
                      {status === "LOCKED" && (
                        <a href={`/api/finance/export/period/${key}`} download
                          className="text-xs text-brand-gold font-semibold hover:underline">
                          Export ↓
                        </a>
                      )}

                      {/* Close (FM or CEO, OPEN → CLOSED) */}
                      {status === "OPEN" && isPast && (isFM || isCEO) && (
                        <form action={closePeriod} className="inline">
                          <input type="hidden" name="periodKey" value={key} />
                          <button type="submit"
                            className="text-xs font-semibold text-amber-600 hover:underline">
                            Close
                          </button>
                        </form>
                      )}

                      {/* Lock (CEO only, CLOSED → LOCKED) */}
                      {status === "CLOSED" && isCEO && (
                        <form action={lockPeriod} className="inline">
                          <input type="hidden" name="periodKey" value={key} />
                          <button type="submit"
                            className="text-xs font-semibold text-red-600 hover:underline">
                            Lock
                          </button>
                        </form>
                      )}

                      {/* Reopen (CEO only, CLOSED or LOCKED → OPEN) */}
                      {(status === "CLOSED" || status === "LOCKED") && isCEO && (
                        <form action={reopenPeriod} className="inline">
                          <input type="hidden" name="periodKey" value={key} />
                          <button type="submit"
                            className="text-xs font-semibold text-blue-500 hover:underline">
                            Reopen
                          </button>
                        </form>
                      )}

                      {/* Skip future open periods */}
                      {status === "OPEN" && !isPast && (
                        <span className="text-xs text-gray-300">Future</span>
                      )}
                      {status === "OPEN" && isPast && !isFM && !isCEO && (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Info panel */}
      <div className="bg-brand-light border border-brand-gold/20 rounded-xl px-5 py-4 text-xs text-gray-600 space-y-1">
        <p><strong>Close</strong> — FM or CEO. Prevents any new income/expense entries dated within the month. Existing records are read-only for edits.</p>
        <p><strong>Lock</strong> — CEO only. Generates a SHA-256 checksum over all income, expenses, approved liquidations, and payroll in the period. The checksum is stored immutably in the audit trail and included in the period export.</p>
        <p><strong>Reopen</strong> — CEO only. Invalidates the checksum and allows new entries. An audit record is written. Use only for genuine error correction.</p>
        <p><strong>Export</strong> — Available only for LOCKED periods. Downloads a structured JSON file containing all period records, the checksum, and metadata — suitable for donor submission and external audit.</p>
      </div>
    </div>
  );
}
