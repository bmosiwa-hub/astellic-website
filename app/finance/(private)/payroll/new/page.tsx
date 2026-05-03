import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { calculateNetPay, formatCurrency } from "@/lib/finance-utils";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Run Payroll | Astellic Finance",
  robots: { index: false, follow: false },
};

async function runPayroll(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/finance/login");

  const employeeId = formData.get("employeeId") as string;
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) return;

  const grossSalary = parseFloat(formData.get("grossSalary") as string);
  const otherDeductions = parseFloat((formData.get("otherDeductions") as string) || "0");
  const { paye, nssfEmployee, nssfEmployer, netPay } = calculateNetPay(grossSalary);

  const data = {
    employeeId,
    period: formData.get("period") as string,
    grossSalary,
    paye,
    nssfEmployee,
    nssfEmployer,
    otherDeductions,
    netPay: netPay - otherDeductions,
    currency: employee.currency,
    paidDate: formData.get("paidDate") ? new Date(formData.get("paidDate") as string) : null,
    status: (formData.get("status") as "PENDING" | "PAID") || "PENDING",
    notes: (formData.get("notes") as string) || null,
  };

  const record = await prisma.payroll.create({ data });
  await auditLog({
    userId: session.user.id,
    action: "CREATE",
    entity: "Payroll",
    entityId: record.id,
    detail: `${employee.name} — ${data.period} — Net ${data.currency} ${data.netPay.toFixed(2)}`,
  });

  redirect("/finance/payroll");
}

export default async function NewPayrollPage() {
  const employees = await prisma.employee.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, position: true, grossSalary: true, currency: true },
  });

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Run Payroll</h1>
        <p className="text-gray-500 text-sm mt-1">
          PAYE and NSSF are calculated automatically from the gross salary.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <form action={runPayroll} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                name="employeeId"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="">— Select employee —</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.position}) — {formatCurrency(e.grossSalary, e.currency)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Pay Period <span className="text-red-500">*</span>
              </label>
              <input
                name="period"
                required
                placeholder="e.g. 2026-05"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Gross Salary <span className="text-red-500">*</span>
              </label>
              <input
                name="grossSalary"
                type="number"
                step="0.01"
                min="0"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Other Deductions</label>
              <input
                name="otherDeductions"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Paid</label>
              <input
                name="paidDate"
                type="date"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                name="status"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
              <textarea
                name="notes"
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
          </div>

          <div className="bg-brand-light rounded-xl p-4 text-sm text-brand-navy space-y-1">
            <p className="font-semibold">Tax Calculation (Malawi PAYE bands)</p>
            <p className="text-gray-500 text-xs">MWK 0–100,000: 0% · MWK 100,001–350,000: 25% · MWK 350,001+: 35%</p>
            <p className="text-gray-500 text-xs">NSSF employee: 3% of gross · NSSF employer: 3% of gross</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Save Payroll
            </button>
            <a
              href="/finance/payroll"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
