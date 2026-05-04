import { prisma } from "@/lib/prisma";
import { calculateNetPay, formatCurrency, formatDate } from "@/lib/finance-utils";
import Link from "next/link";

export const metadata = {
  title: "Employees | Astelfin",
  robots: { index: false, follow: false },
};

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    where:   { active: true },
    orderBy: { name: "asc" },
  });

  function getNet(e: (typeof employees)[number]) {
    const isMWK = e.currency === "MWK";
    const rate  = isMWK ? 1 : (e.salaryExchangeRate ?? 0);
    if (rate === 0) return null;
    return calculateNetPay(e.grossSalary, 0.03, e.pensionRate, rate);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-navy">Employees</h1>
        <Link
          href="/astelfin_26/employees/new"
          className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          + Add Employee
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {employees.length === 0 ? (
          <p className="text-center py-12 text-gray-400">No employees registered yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left  px-5 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left  px-5 py-3 font-semibold text-gray-600">Position</th>
                <th className="text-left  px-5 py-3 font-semibold text-gray-600">Department</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Gross Salary</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Gross (MWK)</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">PAYE (MWK)</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Net Salary</th>
                <th className="text-left  px-5 py-3 font-semibold text-gray-600">Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map((e) => {
                const net     = getNet(e);
                const isMWK   = e.currency === "MWK";
                const noRate  = !isMWK && !e.salaryExchangeRate;

                return (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-brand-navy">{e.name}</p>
                      {e.email && <p className="text-xs text-gray-400">{e.email}</p>}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{e.position}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{e.department ?? "—"}</td>

                    {/* Gross (original currency) */}
                    <td className="px-5 py-3 text-right">
                      <p className="font-semibold text-brand-navy">
                        {formatCurrency(e.grossSalary, e.currency)}
                      </p>
                      {!isMWK && e.salaryExchangeRate && (
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          @ {e.salaryExchangeRate.toLocaleString("en-MW", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                        </p>
                      )}
                    </td>

                    {/* Gross MWK equivalent */}
                    <td className="px-5 py-3 text-right">
                      {net ? (
                        <p className="text-sm text-gray-700">
                          {formatCurrency(net.grossMWK, "MWK")}
                        </p>
                      ) : noRate ? (
                        <span className="text-xs text-amber-500">no rate</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* PAYE in MWK */}
                    <td className="px-5 py-3 text-right">
                      {net ? (
                        <p className="text-sm font-semibold text-gray-700">
                          {formatCurrency(net.payeMWK, "MWK")}
                        </p>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* Net salary */}
                    <td className="px-5 py-3 text-right">
                      {net ? (
                        <>
                          <p className="font-semibold text-green-700">
                            {formatCurrency(net.netPay, e.currency)}
                          </p>
                          {!isMWK && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              ≈ {formatCurrency(net.netPayMWK, "MWK")}
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {formatDate(e.startDate)}
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
