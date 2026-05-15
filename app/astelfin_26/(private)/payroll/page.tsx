import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { writeApprovalRecord } from "@/lib/approval-record";
import { checkCEOAuth, delegateNote } from "@/lib/delegation";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import { getActiveOrgId, orgWhere } from "@/lib/org";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Payroll | Astellic Finance",
  robots: { index: false, follow: false },
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
  PARTIAL: "bg-blue-100 text-blue-700",
};

// ── Server action: CEO locks all payroll records for a period ─────────────────

async function lockPayrollPeriod(formData: FormData) {
  "use server";
  const session = await auth();
  const ceoAuth = await checkCEOAuth(session);
  if (!ceoAuth.authorized) redirect("/astelfin_26/dashboard");

  const period = formData.get("period") as string;
  if (!period) return;

  // Check no records are already locked (idempotent guard)
  const alreadyLocked = await prisma.payroll.findFirst({
    where: { period, lockedAt: { not: null } },
    select: { id: true },
  });
  if (alreadyLocked) {
    revalidatePath("/astelfin_26/payroll");
    return;
  }

  const now = new Date();
  await prisma.payroll.updateMany({
    where:  { period },
    data:   { lockedAt: now, lockedBy: session!.user!.id! },
  });

  await auditLog({
    userId:   session!.user!.id!,
    action:   "LOCK",
    entity:   "Payroll",
    entityId: period,
    detail:   `Payroll period ${period} locked by CEO${delegateNote(ceoAuth)}`,
  });

  // Write one ApprovalRecord representing the CEO's approval of the entire period
  const firstRecord = await prisma.payroll.findFirst({ where: { period }, select: { id: true } });
  if (firstRecord) {
    await writeApprovalRecord({
      entityType:     "PayrollPeriod",
      entityId:       period,
      decidedById:    session!.user!.id!,
      decidedByEmail: session!.user!.email ?? "",
      decidedByName:  session!.user!.name  ?? "",
      decidedByRole:  session!.user!.role,
      previousStatus: "OPEN",
      newStatus:      "LOCKED",
      decision:       "APPROVED",
    });
  }

  revalidatePath("/astelfin_26/payroll");
}

export default async function PayrollPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const now = new Date();

  const activeOrgId = await getActiveOrgId(session);
  const orgFilter   = orgWhere(activeOrgId);

  const [payrolls, unliquidatedSubs, pendingRefunds] = await Promise.all([
    prisma.payroll.findMany({
      where:   { ...orgFilter },
      orderBy: [{ period: "desc" }, { createdAt: "desc" }],
      include: { employee: { select: { name: true, position: true } } },
    }),
    // Paid REQUEST submissions where liquidation is overdue (past 14-day deadline)
    prisma.submission.findMany({
      where: {
        status:              "PAID",
        type:                "REQUEST",
        liquidationDeadline: { lt: now },
        liquidations:        { none: { status: "FM_APPROVED" } },
        submitter:           { employeeId: { not: null } },
      },
      include: {
        submitter: { select: { name: true, employeeId: true } },
      },
      orderBy: { liquidationDeadline: "asc" },
    }),
    // CEO-approved overspending refunds not yet on payroll
    prisma.overspendingRefund.findMany({
      where: { status: "CEO_APPROVED" },
    }),
  ]);

  const totalNetPaid = payrolls
    .filter((p) => p.status === "PAID")
    .reduce((s: number, p) => s + p.netPay, 0);

  const totalPAYE = payrolls
    .filter((p) => p.status === "PAID")
    .reduce((s: number, p) => s + p.paye, 0);

  // Group payrolls by period (sorted newest first)
  const byPeriod = payrolls.reduce<Record<string, typeof payrolls>>((acc, p) => {
    if (!acc[p.period]) acc[p.period] = [];
    acc[p.period].push(p);
    return acc;
  }, {});
  const periods = Object.keys(byPeriod).sort().reverse();
  const ceoAuth = await checkCEOAuth(session);
  const isCEO = ceoAuth.authorized;

  // Group overdue liquidations by employee
  const unliqByEmployee = unliquidatedSubs.reduce<
    Record<string, { name: string; count: number; totalAmount: number; oldestDeadline: Date | null }>
  >((acc, sub) => {
    const name = sub.submitter.name ?? "Unknown";
    if (!acc[name]) acc[name] = { name, count: 0, totalAmount: 0, oldestDeadline: null };
    acc[name].count += 1;
    acc[name].totalAmount += sub.totalAmount;
    if (sub.liquidationDeadline) {
      if (!acc[name].oldestDeadline || sub.liquidationDeadline < acc[name].oldestDeadline!) {
        acc[name].oldestDeadline = sub.liquidationDeadline;
      }
    }
    return acc;
  }, {});

  const flaggedEmployees = Object.values(unliqByEmployee);
  const pendingRefundCount = pendingRefunds.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Payroll</h1>
          <p className="text-gray-500 text-sm mt-1">
            Total Net Paid:{" "}
            <span className="font-semibold text-brand-navy">{formatCurrency(totalNetPaid)}</span>
            {" · "}
            PAYE:{" "}
            <span className="font-semibold text-orange-600">{formatCurrency(totalPAYE)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/reports/export?type=payroll&year=${new Date().getFullYear()}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold border border-green-300 text-green-700 hover:bg-green-50 px-3 py-2.5 rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Excel
          </a>
          <Link
            href="/astelfin_26/payroll/new"
            className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            + Run Payroll
          </Link>
        </div>
      </div>

      {/* Overdue liquidations banner */}
      {flaggedEmployees.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-bold text-orange-800 mb-1">
                Overdue Liquidations — 14-Day Deadline Passed
              </p>
              <p className="text-xs text-orange-700 mb-3">
                The following employees have unliquidated funds where the 14-day liquidation period has expired.
                Deduct from salary in the next payroll run or grant more time.
              </p>
              <div className="space-y-2">
                {flaggedEmployees.map((emp) => (
                  <div key={emp.name} className="flex items-center justify-between bg-white border border-orange-100 rounded-xl px-4 py-2.5 text-sm">
                    <div>
                      <span className="font-semibold text-brand-navy">{emp.name}</span>
                      <span className="ml-2 text-orange-600 text-xs">
                        {emp.count} overdue submission{emp.count !== 1 ? "s" : ""}
                      </span>
                      {emp.oldestDeadline && (
                        <span className="ml-2 text-red-500 text-xs font-semibold">
                          · overdue since {formatDate(emp.oldestDeadline)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-orange-700">{formatCurrency(emp.totalAmount)}</span>
                      <Link href="/astelfin_26/liquidations" className="text-xs text-brand-gold font-semibold hover:underline">
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approved overspending refunds banner */}
      {pendingRefundCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-bold text-blue-800 mb-1">
                {pendingRefundCount} CEO-Approved Overspending Refund{pendingRefundCount !== 1 ? "s" : ""} to Add
              </p>
              <p className="text-xs text-blue-700">
                The CEO has approved overspending reimbursements for employees. Add these to the relevant employee payrolls in the next run.
              </p>
            </div>
          </div>
        </div>
      )}

      {payrolls.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          No payroll records yet.
        </div>
      ) : (
        <div className="space-y-4">
          {periods.map((period) => {
            const records   = byPeriod[period];
            const isLocked  = records.some((r) => r.lockedAt != null);
            const lockedBy  = records.find((r) => r.lockedAt != null);
            const periodNet = records.reduce((s, r) => s + r.netPay, 0);

            return (
              <div key={period} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Period header */}
                <div className={`flex items-center justify-between px-5 py-3 border-b ${isLocked ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-100"}`}>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-brand-navy">{period}</span>
                    {isLocked ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Locked by CEO{lockedBy?.lockedAt ? ` · ${formatDate(lockedBy.lockedAt)}` : ""}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">Open</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-brand-navy">
                      Net: {formatCurrency(periodNet)}
                    </span>
                    {isCEO && !isLocked && (
                      <form action={lockPayrollPeriod}>
                        <input type="hidden" name="period" value={period} />
                        <button
                          type="submit"
                          className="text-xs bg-brand-navy hover:bg-brand-navy/90 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
                          title="Lock this period — prevents any further payroll records from being added"
                        >
                          Lock Period
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* Records table for this period */}
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="text-left px-5 py-2.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Employee</th>
                      <th className="text-right px-5 py-2.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Gross</th>
                      <th className="text-right px-5 py-2.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">PAYE</th>
                      <th className="text-right px-5 py-2.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Net Pay</th>
                      <th className="text-left px-5 py-2.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                      <th className="px-5 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {records.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/60">
                        <td className="px-5 py-3">
                          <p className="font-medium text-brand-navy">{p.employee.name}</p>
                          <p className="text-xs text-gray-400">{p.employee.position}</p>
                        </td>
                        <td className="px-5 py-3 text-right text-gray-700">{formatCurrency(p.grossSalary, p.currency)}</td>
                        <td className="px-5 py-3 text-right text-orange-600">{formatCurrency(p.paye, p.currency)}</td>
                        <td className="px-5 py-3 text-right font-bold text-brand-navy">{formatCurrency(p.netPay, p.currency)}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <Link href={`/astelfin_26/payroll/${p.id}/payslip`}
                            className="text-xs text-brand-gold font-semibold hover:underline whitespace-nowrap">
                            Payslip →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
