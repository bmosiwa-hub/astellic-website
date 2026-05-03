import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import Link from "next/link";

export const metadata = {
  title: "Employees | Astellic Finance",
  robots: { index: false, follow: false },
};

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-navy">Employees</h1>
        <Link
          href="/finance/employees/new"
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
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Start Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-brand-navy">{e.name}</p>
                    {e.email && <p className="text-xs text-gray-400">{e.email}</p>}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{e.position}</td>
                  <td className="px-5 py-3 text-gray-500">{e.department ?? "—"}</td>
                  <td className="px-5 py-3 text-right font-semibold text-brand-navy">
                    {formatCurrency(e.grossSalary, e.currency)}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{formatDate(e.startDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
