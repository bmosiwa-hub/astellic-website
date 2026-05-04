import { prisma } from "@/lib/prisma";
import { calculateNetPay, formatCurrency, formatDate } from "@/lib/finance-utils";
import { buildRateMap } from "@/lib/currency-utils";
import Link from "next/link";

export const metadata = {
  title: "Employees | Astelfin",
  robots: { index: false, follow: false },
};

export default async function EmployeesPage() {
  const [employees, exchangeRates] = await Promise.all([
    prisma.employee.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.exchangeRate.findMany({ select: { currency: true, middleRate: true } }),
  ]);

  const rateMap = buildRateMap(exchangeRates);

  function getNetInfo(e: (typeof employees)[number]) {
    const middleRate = e.currency === "MWK" ? 1 : (rateMap[e.currency] ?? 0);
    if (middleRate === 0) return null; // no rate available
    return calculateNetPay(e.grossSalary, 0.03, e.pensionRate, middleRate);
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
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Position</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Department</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Gross Salary</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">PAYE (MWK)</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Net Salary</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Start Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map((e) => {
                const net = getNetInfo(e);
                const isForeign = e.currency !== "MWK";
                return (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-brand-navy">{e.name}</p>
                      {e.email && <p className="text-xs text-gray-400">{e.email}</p>}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{e.position}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{e.department ?? "—"}</td>
                    <td className="px-5 py-3 text-right">
                      <p className="font-semibold text-brand-navy">
                        {formatCurrency(e.grossSalary, e.currency)}
                      </p>
                      {isForeign && net && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          ≈ {formatCurrency(net.grossMWK, "MWK")}
                        </p>
                      )}
                      {isForeign && !net && (
                        <p className="text-xs text-amber-500 mt-0.5">no rate</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {net ? (
                        <p className="text-sm font-semibold text-gray-700">
                          {formatCurrency(net.payeMWK, "MWK")}
                        </p>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {net ? (
                        <>
                          <p className="font-semibold text-green-700">
                            {formatCurrency(net.netPay, e.currency)}
                          </p>
                          {isForeign && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              ≈ {formatCurrency(net.netPayMWK, "MWK")}
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(e.startDate)}</td>
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
