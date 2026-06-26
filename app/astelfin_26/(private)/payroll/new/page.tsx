import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { writeApprovalRecord } from "@/lib/approval-record";
import { calculateNetPay, calculateEmployerPension, formatCurrency } from "@/lib/finance-utils";
import { getActiveBandSet } from "@/lib/paye";
import { getLiveSalaryRate } from "@/lib/payroll-rate";
import { excludeAstelfinWhere, getAstelfinOrg } from "@/lib/astelfin-org";
import { LAUNCH_PERIOD } from "@/lib/constants";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Run Payroll | Astelfin IMS",
  robots: { index: false, follow: false },
};

const EMPLOYER_PENSION_RATE = 10; // Malawi statutory employer pension = 10% of gross

/* ── Server action: process payroll for one employee ──────────── */

async function runPayrollForEmployee(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  const employeeId      = formData.get("employeeId") as string;
  const period          = formData.get("period") as string;
  const otherAdditions  = parseFloat((formData.get("otherAdditions") as string) || "0") || 0;
  const additionNote    = (formData.get("additionNote") as string) || null;
  const otherDeductions = parseFloat((formData.get("otherDeductions") as string) || "0") || 0;
  const deductionNote   = (formData.get("deductionNote") as string) || null;
  const refundIds       = formData.getAll("refundIds").map(String).filter(Boolean);
  const paidDate        = formData.get("paidDate") ? new Date(formData.get("paidDate") as string) : null;
  const status          = (formData.get("status") as "PENDING" | "PAID") || "PENDING";
  const notes           = (formData.get("notes") as string) || null;

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) return;

  // Astelfin staff are paid/taxed in their own room, never through Astellic payroll
  const astelfinOrg = await getAstelfinOrg();
  if (astelfinOrg && employee.organisationId === astelfinOrg.id) return;

  // Reject if this period has already been locked by CEO
  const lockedRecord = await prisma.payroll.findFirst({
    where: { period, lockedAt: { not: null } },
    select: { id: true },
  });
  if (lockedRecord) {
    redirect(`/astelfin_26/payroll/new?period=${encodeURIComponent(period)}&error=period_locked`);
  }

  // PAYE must use the prevailing system exchange rate, not a snapshot from hire time —
  // foreign-currency salaries' PAYE fluctuates with the rate.
  const rate = await getLiveSalaryRate(employee.currency);

  // Resolve the active PAYE band set for this period (e.g. "2025-01" → 2025-01-01)
  const [periodYear, periodMonth] = period.split("-").map(Number);
  const periodDate  = new Date(periodYear, (periodMonth || 1) - 1, 1);
  const bandSetInfo = await getActiveBandSet(periodDate);

  const calc = calculateNetPay(employee.grossSalary, employee.pensionRate, rate, {
    payeExempt:       employee.payeExempt,
    nssfApplicable:   employee.nssfApplicable,
    nssfEmployeeRate: employee.nssfEmployeeRate,
    nssfEmployerRate: employee.nssfEmployerRate,
    payeBands:        bandSetInfo?.bands,
  });

  const employerPensionMWK = calculateEmployerPension(calc.grossMWK, employee.pensionRate);

  // Net pay: gross − PAYE − pension (employee) − NSSF (employee) + additions − deductions
  // Additions from approved overspending refunds
  let refundAdditionNative = 0;
  if (refundIds.length > 0) {
    const refunds = await prisma.overspendingRefund.findMany({
      where: { id: { in: refundIds }, status: "CEO_APPROVED" },
    });
    // Sum refunds; convert MWK to employee currency if needed
    const totalRefundMWK = refunds.reduce((s, r) => s + r.amount, 0);
    refundAdditionNative = rate > 0 ? totalRefundMWK / rate : totalRefundMWK;
  }

  const totalAdditions   = otherAdditions + refundAdditionNative;
  const totalDeductions  = otherDeductions;
  const netPay           = Math.max(0, calc.netPay + totalAdditions - totalDeductions);

  const record = await prisma.payroll.create({
    data: {
      employeeId,
      period,
      grossSalary:     employee.grossSalary,
      paye:            calc.payeMWK,
      pension:         calc.pension,         // employee pension in native currency
      pensionEmployer: employerPensionMWK,   // employer pension in MWK
      nssfEmployee:    calc.nssfEmployee,
      nssfEmployer:    calc.nssfEmployer,
      otherAdditions:  totalAdditions,
      additionNote:    additionNote || (refundIds.length > 0 ? "Includes approved overspending refund" : null),
      otherDeductions: totalDeductions,
      deductionNote,
      netPay,
      currency:        employee.currency,
      paidDate,
      status,
      notes,
      // PAYE band versioning (snapshot stored as plain JSON)
      payeBandSetId:    bandSetInfo?.id ?? null,
      payeBandSnapshot: bandSetInfo?.snapshot
        ? (bandSetInfo.snapshot as unknown as import("@prisma/client").Prisma.InputJsonValue)
        : undefined,
    },
  });

  // Record the cash outflow so the dashboard balance reflects this payment
  if (status === "PAID") {
    await prisma.expense.create({
      data: {
        description: `Payroll — ${employee.name} — ${period}`,
        amount:      netPay,
        currency:    employee.currency,
        category:    "Payroll",
        paidDate:    paidDate ?? new Date(),
        vendor:      employee.name,
        notes:       `Auto-generated from payroll run (Payroll ID: ${record.id})`,
      },
    });
  }

  // Mark included overspending refunds as added to payroll
  if (refundIds.length > 0) {
    await prisma.overspendingRefund.updateMany({
      where: { id: { in: refundIds }, status: "CEO_APPROVED" },
      data:  { status: "PAYROLL_ADDED", payrollId: record.id },
    });
  }

  // Auto-create / update pension payable for this period (only if pension applies)
  if (employee.pensionRate > 0) {
    const pensionDesc = `Pension Contributions — ${period}`;
    const totalPensionMWK = calc.pensionMWK + employerPensionMWK; // 5% + 10% = 15%

    const existing = await prisma.accountPayable.findFirst({
      where: {
        description: pensionDesc,
        budgetLine:  "Pension",
        status:      { not: "PAID" },
      },
    });

    if (existing) {
      await prisma.accountPayable.update({
        where: { id: existing.id },
        data:  { amount: existing.amount + totalPensionMWK },
      });
    } else {
      // Due on last day of the pay period month
      const [year, month] = period.split("-").map(Number);
      const dueDate = new Date(year, (month || 1), 0); // last day of that month
      await prisma.accountPayable.create({
        data: {
          description: pensionDesc,
          vendor:      "Pension Fund",
          amount:      totalPensionMWK,
          currency:    "MWK",
          dueDate,
          budgetLine:  "Pension",
          status:      "UPCOMING",
          createdBy:   session.user.id!,
        },
      });
    }
  }

  await auditLog({
    userId:   session.user.id!,
    action:   "CREATE",
    entity:   "Payroll",
    entityId: record.id,
    detail:   `${employee.name} — ${period} — Net ${employee.currency} ${netPay.toFixed(2)}`,
  });

  redirect(`/astelfin_26/payroll/new?period=${encodeURIComponent(period)}&success=${employee.name}`);
}

/* ── Page ──────────────────────────────────────────────────────── */

export default async function NewPayrollPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; success?: string; error?: string }>;
}) {
  const { period: qPeriod, success, error } = await searchParams;

  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  // Default period to launch month (June 2026) or later
  const currentPeriod = new Date().toISOString().slice(0, 7);
  const defaultPeriod = qPeriod || (currentPeriod >= LAUNCH_PERIOD ? currentPeriod : LAUNCH_PERIOD);

  // Fetch active employees — excludes Astelfin staff, who are paid/taxed in their own room
  const astelfinExclude = await excludeAstelfinWhere();
  const employees = await prisma.employee.findMany({
    where:   { active: true, ...astelfinExclude },
    orderBy: { name: "asc" },
  });

  // Live exchange rates for PAYE preview — same prevailing-rate rule used when payroll is actually run
  const liveRates = await prisma.exchangeRate.findMany({ select: { currency: true, middleRate: true } });
  const liveRateMap: Record<string, number> = {};
  for (const r of liveRates) liveRateMap[r.currency] = r.middleRate;

  // Payrolls already run for this period
  const existingPayrolls = qPeriod
    ? await prisma.payroll.findMany({
        where:  { period: qPeriod },
        select: { employeeId: true, id: true },
      })
    : [];
  const alreadyRun = new Set(existingPayrolls.map((p) => p.employeeId));

  const now = new Date();

  // Overdue liquidations (past deadline, no FM-approved liquidation)
  const overdueSubs = await prisma.submission.findMany({
    where: {
      status:              "PAID",
      liquidationDeadline: { lt: now },
      liquidations:        { none: { status: "FM_APPROVED" } },
      submitter:           { employeeId: { not: null } },
    },
    include: {
      submitter: { select: { name: true, employeeId: true } },
    },
  });

  // Group overdue by employeeId
  const overdueByEmployee: Record<string, { count: number; totalMWK: number; deadlines: Date[] }> = {};
  for (const s of overdueSubs) {
    const eid = s.submitter.employeeId!;
    if (!overdueByEmployee[eid]) overdueByEmployee[eid] = { count: 0, totalMWK: 0, deadlines: [] };
    overdueByEmployee[eid].count++;
    overdueByEmployee[eid].totalMWK += s.totalAmount; // stored in submission currency — MWK assumed
    if (s.liquidationDeadline) overdueByEmployee[eid].deadlines.push(s.liquidationDeadline);
  }

  // CEO-approved overspending refunds not yet added to payroll
  const pendingRefunds = await prisma.overspendingRefund.findMany({
    where: { status: "CEO_APPROVED" },
  });
  const refundsByEmployee: Record<string, typeof pendingRefunds> = {};
  for (const r of pendingRefunds) {
    if (!r.employeeId) continue;
    if (!refundsByEmployee[r.employeeId]) refundsByEmployee[r.employeeId] = [];
    refundsByEmployee[r.employeeId].push(r);
  }

  const inp   = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40";
  const isMWK = (cur: string) => cur === "MWK";

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Run Payroll</h1>
          <p className="text-gray-500 text-sm mt-1">
            Process payroll for each employee individually. Pension payable is created automatically.
          </p>
        </div>
        <Link href="/astelfin_26/payroll"
          className="text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium">
          ← Back to Payroll
        </Link>
      </div>

      {/* Period selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <form method="get" action="/astelfin_26/payroll/new" className="flex items-end gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-xs font-semibold text-brand-navy mb-1.5 uppercase tracking-wide">
              Pay Period
            </label>
            <input
              name="period"
              type="month"
              defaultValue={defaultPeriod}
              min={LAUNCH_PERIOD}
              className={inp}
            />
          </div>
          <button type="submit"
            className="bg-brand-navy text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-brand-navy/90 transition-colors">
            Load Period
          </button>
        </form>
      </div>

      {error === "period_locked" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>
            <strong>Period Locked.</strong> This payroll period has been approved and locked by the CEO.
            No further records can be added. Contact the CEO if an adjustment is needed.
          </span>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ✓ Payroll processed for <strong>{decodeURIComponent(success)}</strong>.
        </div>
      )}

      {/* PAYE bands info */}
      <div className="bg-brand-light rounded-xl px-4 py-3 text-xs text-brand-navy space-y-0.5">
        <p className="font-semibold">Malawi PAYE bands (monthly, on MWK equivalent)</p>
        <p className="text-gray-500">MWK 0–170,000: 0% · MWK 170,001–1,570,000: 30% · Above MWK 1,570,000: 35%</p>
        <p className="text-gray-500">Pension: employee 5% + employer 10% = 15% of gross. Auto-creates a pension payable for the period.</p>
      </div>

      {/* Employee cards */}
      {employees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          No active employees.
        </div>
      ) : (
        <div className="space-y-4">
          {employees.map((emp) => {
            const done    = alreadyRun.has(emp.id);
            const rate    = isMWK(emp.currency) ? 1 : (liveRateMap[emp.currency] ?? 1);
            const calc    = calculateNetPay(emp.grossSalary, emp.pensionRate, rate, {
              payeExempt:       emp.payeExempt,
              nssfApplicable:   emp.nssfApplicable,
              nssfEmployeeRate: emp.nssfEmployeeRate,
              nssfEmployerRate: emp.nssfEmployerRate,
            });
            const empPensionMWK  = calc.pensionMWK;
            const emplrPensionMWK = calculateEmployerPension(calc.grossMWK, emp.pensionRate);
            const overdue  = overdueByEmployee[emp.id];
            const refunds  = refundsByEmployee[emp.id] ?? [];
            const totalRefundMWK = refunds.reduce((s, r) => s + r.amount, 0);

            return (
              <div key={emp.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden
                  ${done ? "border-green-200 opacity-70" : overdue ? "border-orange-200" : "border-gray-100"}`}>

                {/* Card header */}
                <div className={`flex items-center justify-between px-5 py-3 border-b
                  ${done ? "bg-green-50 border-green-100" : overdue ? "bg-orange-50 border-orange-100" : "bg-gray-50 border-gray-100"}`}>
                  <div>
                    <span className="font-bold text-brand-navy">{emp.name}</span>
                    <span className="ml-2 text-xs text-gray-500">{emp.position}</span>
                    {emp.employeeNumber && (
                      <span className="ml-2 text-xs bg-brand-navy/10 text-brand-navy px-1.5 py-0.5 rounded font-mono">
                        {emp.employeeNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {done && (
                      <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        ✓ Done for {defaultPeriod}
                      </span>
                    )}
                    {overdue && !done && (
                      <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                        ⚠ {overdue.count} overdue liquidation{overdue.count !== 1 ? "s" : ""}
                      </span>
                    )}
                    {refunds.length > 0 && !done && (
                      <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        💳 {refunds.length} refund{refunds.length !== 1 ? "s" : ""} approved
                      </span>
                    )}
                  </div>
                </div>

                {/* Salary summary row */}
                <div className="grid grid-cols-5 gap-0 divide-x divide-gray-100 text-sm border-b border-gray-100">
                  <div className="px-4 py-2.5">
                    <p className="text-xs text-gray-400 mb-0.5">Gross</p>
                    <p className="font-semibold text-brand-navy">{formatCurrency(emp.grossSalary, emp.currency)}</p>
                    {!isMWK(emp.currency) && (
                      <p className="text-xs text-gray-400">≈ {formatCurrency(calc.grossMWK)}</p>
                    )}
                  </div>
                  <div className="px-4 py-2.5">
                    <p className="text-xs text-gray-400 mb-0.5">PAYE</p>
                    <p className={`font-semibold ${emp.payeExempt ? "text-amber-600 italic text-xs" : "text-red-600"}`}>
                      {emp.payeExempt ? "Exempt" : `− ${formatCurrency(calc.payeMWK)}`}
                    </p>
                  </div>
                  <div className="px-4 py-2.5">
                    <p className="text-xs text-gray-400 mb-0.5">Pension (EE {emp.pensionRate}%)</p>
                    <p className="font-semibold text-red-600">− {formatCurrency(empPensionMWK)}</p>
                  </div>
                  {emp.nssfApplicable && (
                    <div className="px-4 py-2.5">
                      <p className="text-xs text-gray-400 mb-0.5">NSSF EE</p>
                      <p className="font-semibold text-red-600">− {formatCurrency(calc.nssfEmployeeMWK)}</p>
                    </div>
                  )}
                  <div className={`px-4 py-2.5 ${emp.nssfApplicable ? "" : "col-span-2"}`}>
                    <p className="text-xs text-gray-400 mb-0.5">Net Pay</p>
                    <p className="font-bold text-brand-navy">{formatCurrency(calc.netPay, emp.currency)}</p>
                    {!isMWK(emp.currency) && (
                      <p className="text-xs text-gray-400">≈ {formatCurrency(calc.netPayMWK)}</p>
                    )}
                  </div>
                  <div className="px-4 py-2.5 bg-purple-50/40">
                    <p className="text-xs text-gray-400 mb-0.5">Employer Pension (10%)</p>
                    <p className="font-semibold text-purple-700">{formatCurrency(emplrPensionMWK)}</p>
                  </div>
                </div>

                {/* Flags */}
                {!done && overdue && (
                  <div className="px-5 py-3 bg-orange-50/60 border-b border-orange-100">
                    <p className="text-xs font-bold text-orange-700 mb-1">
                      ⚠ Overdue Liquidations — {overdue.count} submission{overdue.count !== 1 ? "s" : ""} not liquidated
                    </p>
                    <p className="text-xs text-orange-600 mb-2">
                      Total outstanding: <strong>{formatCurrency(overdue.totalMWK)}</strong>. Deduct below or leave for next period.
                    </p>
                  </div>
                )}

                {!done && refunds.length > 0 && (
                  <div className="px-5 py-3 bg-blue-50/60 border-b border-blue-100">
                    <p className="text-xs font-bold text-blue-700 mb-1">
                      💳 CEO-Approved Overspending Refunds
                    </p>
                    {refunds.map((r) => (
                      <p key={r.id} className="text-xs text-blue-700">
                        + {formatCurrency(r.amount, r.currency)} — overspending refund approved by CEO
                      </p>
                    ))}
                    <p className="text-xs text-blue-500 mt-1">Total: {formatCurrency(totalRefundMWK)} — will be added to pay automatically when you include these below.</p>
                  </div>
                )}

                {/* Per-employee payroll form */}
                {!done && (
                  <form action={runPayrollForEmployee} className="p-5 space-y-4">
                    <input type="hidden" name="employeeId" value={emp.id} />
                    <input type="hidden" name="period"     value={defaultPeriod} />
                    {refunds.map((r) => (
                      <input key={r.id} type="hidden" name="refundIds" value={r.id} />
                    ))}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Other Additions ({emp.currency})
                          <span className="ml-1 font-normal text-gray-400">— bonus, allowance, etc.</span>
                        </label>
                        <input name="otherAdditions" type="number" min="0" step="0.01" defaultValue="0" className={inp} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Addition Note</label>
                        <input name="additionNote" type="text" className={inp} placeholder="e.g. Performance bonus" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Other Deductions ({emp.currency})
                          <span className="ml-1 font-normal text-gray-400">— loan, overdue liquidation, etc.</span>
                        </label>
                        <input name="otherDeductions" type="number" min="0" step="0.01" defaultValue="0" className={inp} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Deduction Note</label>
                        <input name="deductionNote" type="text" className={inp}
                          placeholder={overdue ? "e.g. Overdue liquidation deduction" : "e.g. Staff loan repayment"} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Date Paid</label>
                        <input name="paidDate" type="date" className={inp} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                        <select name="status" className={`${inp} bg-white`}>
                          <option value="PENDING">Pending</option>
                          <option value="PAID">Paid</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                        <input name="notes" type="text" className={inp} />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <button type="submit"
                        className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
                        Process Payroll for {emp.name}
                      </button>
                      <Link href={`/astelfin_26/payroll/${existingPayrolls.find((p) => p.employeeId === emp.id)?.id ?? ""}/payslip`}
                        className={done ? "text-xs text-brand-gold hover:underline font-semibold" : "hidden"}>
                        View Payslip →
                      </Link>
                    </div>
                  </form>
                )}

                {done && (
                  <div className="px-5 py-3 flex items-center gap-4">
                    <span className="text-xs text-green-600 font-semibold">Payroll complete for this period.</span>
                    <Link
                      href={`/astelfin_26/payroll/${existingPayrolls.find((p) => p.employeeId === emp.id)?.id}/payslip`}
                      className="text-xs text-brand-gold hover:underline font-semibold">
                      View Payslip →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
