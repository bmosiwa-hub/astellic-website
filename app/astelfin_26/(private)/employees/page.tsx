import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateNetPay, formatCurrency, formatDate } from "@/lib/finance-utils";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Employees | Astelfin",
  robots: { index: false, follow: false },
};

async function backfillEmployeeNumbers() {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO" && session.user.role !== "FINANCE_MANAGER") {
    redirect("/astelfin_26/dashboard");
  }

  // Fetch employees without a number, ordered by startDate then createdAt
  const unNumbered = await prisma.employee.findMany({
    where:   { employeeNumber: null },
    orderBy: [{ startDate: "asc" }, { createdAt: "asc" }],
    select:  { id: true },
  });

  // Find current highest number to continue from
  const maxRecord = await prisma.employee.findFirst({
    where:   { employeeNumber: { not: null } },
    orderBy: { employeeNumber: "desc" },
    select:  { employeeNumber: true },
  });

  let counter = 0;
  if (maxRecord?.employeeNumber) {
    const match = maxRecord.employeeNumber.match(/EMP-(\d+)/);
    if (match) counter = parseInt(match[1], 10);
  }

  for (const emp of unNumbered) {
    counter++;
    await prisma.employee.update({
      where: { id: emp.id },
      data:  { employeeNumber: `EMP-${String(counter).padStart(3, "0")}` },
    });
  }

  redirect("/astelfin_26/employees");
}

export default async function EmployeesPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  // Fetch employees with their linked user accounts
  const employees = await prisma.employee.findMany({
    where:   { active: true },
    orderBy: [{ employeeNumber: "asc" }, { name: "asc" }],
  });

  // Map employee id → whether they have a linked user
  const linkedUserIds = await prisma.user.findMany({
    where:  { employeeId: { in: employees.map((e) => e.id) } },
    select: { employeeId: true },
  });
  const linkedSet = new Set(linkedUserIds.map((u) => u.employeeId));

  const isCEO = role === "CEO";
  const unnumberedCount = employees.filter((e) => !e.employeeNumber).length;

  function getNet(e: (typeof employees)[number]) {
    const isMWK = e.currency === "MWK";
    const rate  = isMWK ? 1 : (e.salaryExchangeRate ?? 0);
    if (rate === 0) return null;
    return calculateNetPay(e.grossSalary, e.pensionRate, rate);
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

      {/* Backfill banner for employees without numbers */}
      {unnumberedCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center justify-between gap-4">
          <p className="text-sm text-amber-800">
            <span className="font-bold">{unnumberedCount} employee{unnumberedCount !== 1 ? "s" : ""}</span>
            {" "}without an employment number. Click to auto-assign sequential numbers.
          </p>
          <form action={backfillEmployeeNumbers}>
            <button type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors">
              Assign Numbers Now
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {employees.length === 0 ? (
          <p className="text-center py-12 text-gray-400">No employees registered yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left  px-5 py-3 font-semibold text-gray-600">Emp No.</th>
                <th className="text-left  px-5 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left  px-5 py-3 font-semibold text-gray-600">Position / Dept</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Gross</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">PAYE (MWK)</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Net Pay</th>
                <th className="text-center px-5 py-3 font-semibold text-gray-600">User</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map((e) => {
                const net    = getNet(e);
                const isMWK  = e.currency === "MWK";
                const noRate = !isMWK && !e.salaryExchangeRate;
                const hasUser = linkedSet.has(e.id);

                return (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold text-brand-navy bg-brand-navy/5 px-2 py-0.5 rounded">
                        {e.employeeNumber ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-brand-navy">{e.name}</p>
                      {e.email && <p className="text-xs text-gray-400">{e.email}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-gray-700">{e.position}</p>
                      <p className="text-xs text-gray-400">{e.department ?? "—"} · {e.contractType}</p>
                    </td>

                    {/* Gross */}
                    <td className="px-5 py-3 text-right">
                      <p className="font-semibold text-brand-navy">{formatCurrency(e.grossSalary, e.currency)}</p>
                      {!isMWK && e.salaryExchangeRate && (
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          @ {e.salaryExchangeRate.toLocaleString("en-MW", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                        </p>
                      )}
                      {noRate && <span className="text-xs text-amber-500">no rate</span>}
                    </td>

                    {/* PAYE */}
                    <td className="px-5 py-3 text-right">
                      {net ? (
                        <p className="text-sm text-orange-600 font-semibold">{formatCurrency(net.payeMWK, "MWK")}</p>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* Net */}
                    <td className="px-5 py-3 text-right">
                      {net ? (
                        <>
                          <p className="font-semibold text-green-700">{formatCurrency(net.netPay, e.currency)}</p>
                          {!isMWK && (
                            <p className="text-xs text-gray-400 mt-0.5">≈ {formatCurrency(net.netPayMWK, "MWK")}</p>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* User linked badge */}
                    <td className="px-5 py-3 text-center">
                      {hasUser ? (
                        <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Linked</span>
                      ) : isCEO ? (
                        <Link href={`/astelfin_26/employees/${e.id}`}
                          className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full hover:bg-amber-200 transition-colors">
                          Assign
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-5 py-3 text-right">
                      <Link href={`/astelfin_26/employees/${e.id}`}
                        className="text-xs text-brand-gold font-semibold hover:underline">
                        View →
                      </Link>
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
