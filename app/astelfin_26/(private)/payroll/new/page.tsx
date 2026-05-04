import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { calculateNetPay, formatCurrency } from "@/lib/finance-utils";
import { buildRateMap } from "@/lib/currency-utils";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Run Payroll | Astelfin",
  robots: { index: false, follow: false },
};

async function runPayroll(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const employeeId = formData.get("employeeId") as string;
  const employee   = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) return;

  const grossSalary     = parseFloat(formData.get("grossSalary") as string);
  const otherDeductions = parseFloat((formData.get("otherDeductions") as string) || "0");

  // Look up the RBM middle rate for this employee's currency
  let middleRate = 1;
  if (employee.currency !== "MWK") {
    const rate = await prisma.exchangeRate.findUnique({ where: { currency: employee.currency } });
    middleRate = rate?.middleRate ?? 0;
    if (middleRate === 0) {
      // Cannot compute — redirect with error
      redirect("/astelfin_26/payroll/new?error=no_rate&currency=" + employee.currency);
    }
  }

  const { paye, nssfEmployee, nssfEmployer, pension, netPay,
          payeMWK, nssfEmployeeMWK, nssfEmployerMWK, pensionMWK, netPayMWK, grossMWK } =
    calculateNetPay(grossSalary, 0.03, employee.pensionRate, middleRate);

  const data = {
    employeeId,
    period:         formData.get("period") as string,
    grossSalary,
    // Store PAYE & NSSF in MWK (these are remitted to MRA/NSSF in Kwacha)
    paye:           payeMWK,
    nssfEmployee:   nssfEmployeeMWK,
    nssfEmployer:   nssfEmployerMWK,
    otherDeductions,
    // Net is converted back to the employee's quoted currency
    netPay:         Math.max(0, netPay - otherDeductions),
    currency:       employee.currency,
    paidDate:       formData.get("paidDate") ? new Date(formData.get("paidDate") as string) : null,
    status:         (formData.get("status") as "PENDING" | "PAID") || "PENDING",
    notes:          (formData.get("notes") as string) || null,
  };

  const record = await prisma.payroll.create({ data });

  const netDisplay = employee.currency === "MWK"
    ? `MWK ${data.netPay.toFixed(2)}`
    : `${employee.currency} ${data.netPay.toFixed(2)} (MWK ${netPayMWK.toFixed(2)})`;

  await auditLog({
    userId:   session.user.id,
    action:   "CREATE",
    entity:   "Payroll",
    entityId: record.id,
    detail:   `${employee.name} — ${data.period} — Net ${netDisplay}`,
  });

  // Suppress unused var warning — these are available for audit/logging
  void (grossMWK + paye + nssfEmployee + nssfEmployer + pension + pensionMWK);

  redirect("/astelfin_26/payroll");
}

export default async function NewPayrollPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; currency?: string }>;
}) {
  const { error, currency: errorCurrency } = await searchParams;

  const [employees, exchangeRates] = await Promise.all([
    prisma.employee.findMany({
      where:   { active: true },
      orderBy: { name: "asc" },
      select:  { id: true, name: true, position: true, grossSalary: true, currency: true, pensionRate: true },
    }),
    prisma.exchangeRate.findMany({ select: { currency: true, middleRate: true } }),
  ]);

  const rateMap = buildRateMap(exchangeRates);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Run Payroll</h1>
        <p className="text-gray-500 text-sm mt-1">
          PAYE and NSSF are calculated on the MWK equivalent of the gross salary.
          Net is converted back to the employee&apos;s quoted currency.
        </p>
      </div>

      {error === "no_rate" && errorCurrency && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          No exchange rate on file for <strong>{errorCurrency}</strong>. Please{" "}
          <a href="/astelfin_26/exchange-rates" className="underline font-semibold">update exchange rates</a>{" "}
          before running payroll for this employee.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <form action={runPayroll} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Employee <span className="text-red-500">*</span>
              </label>
              <select name="employeeId" required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
                <option value="">— Select employee —</option>
                {employees.map((e) => {
                  const isForeign = e.currency !== "MWK";
                  const rate = isForeign ? rateMap[e.currency] : null;
                  const grossMWK = rate ? e.grossSalary * rate : null;
                  return (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.position}) —{" "}
                      {formatCurrency(e.grossSalary, e.currency)}
                      {grossMWK ? ` ≈ ${formatCurrency(grossMWK, "MWK")}` : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Pay Period <span className="text-red-500">*</span>
              </label>
              <input name="period" required placeholder="e.g. 2026-05"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Gross Salary <span className="text-red-500">*</span>
              </label>
              <input name="grossSalary" type="number" step="0.01" min="0" required
                placeholder="Pre-filled from employee record — override if adjusted"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Other Deductions</label>
              <input name="otherDeductions" type="number" step="0.01" min="0" defaultValue="0"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Paid</label>
              <input name="paidDate" type="date"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select name="status"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
              <textarea name="notes" rows={2}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
            </div>
          </div>

          {/* Tax info box */}
          <div className="bg-brand-light rounded-xl p-4 text-sm text-brand-navy space-y-1.5">
            <p className="font-semibold">Malawi PAYE Bands (monthly, on MWK equivalent)</p>
            <p className="text-gray-500 text-xs">
              MWK 0–14,167: 0% · MWK 14,167–130,833: 30% · MWK 130,833–833,333: 35% · Above: 40%
            </p>
            <p className="text-gray-500 text-xs">NSSF: 3% of gross · Pension: per employee record</p>
            <p className="text-gray-500 text-xs font-medium">
              For foreign-currency employees, PAYE &amp; NSSF are stored in MWK (the amount remitted
              to MRA/NSSF). Net salary is converted back to the employee&apos;s currency at the current RBM rate.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              Save Payroll
            </button>
            <a href="/astelfin_26/payroll"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
