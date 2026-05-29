import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAstelfinOrg } from "@/lib/astelfin-org";
import Link from "next/link";

export const metadata = {
  title: "Astelfin | Payroll",
  robots: { index: false, follow: false },
};

function fmt(n: number, currency = "MWK") {
  return `${currency} ${n.toLocaleString("en-MW", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_STYLES: Record<string, string> = {
  PAID:    "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  FAILED:  "bg-rose-100 text-rose-700",
};

export default async function AstelfinPayrollPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO" && session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/home");

  const org = await getAstelfinOrg();

  // Get current period (YYYY-MM)
  const now   = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [employees, currentPayrolls, summary] = org
    ? await Promise.all([
        prisma.employee.findMany({
          where: { organisationId: org.id, active: true },
          orderBy: { name: "asc" },
        }),
        prisma.payroll.findMany({
          where: { organisationId: org.id, period, deletedAt: null },
          include: { employee: { select: { name: true, position: true } } },
          orderBy: { createdAt: "desc" },
        }),
        prisma.payroll.aggregate({
          where: { organisationId: org.id, period, deletedAt: null },
          _sum: { grossSalary: true, paye: true, pension: true, netPay: true },
        }),
      ])
    : [[], [], null];

  const totalGross = summary?._sum.grossSalary ?? 0;
  const totalPAYE  = summary?._sum.paye ?? 0;
  const totalNet   = summary?._sum.netPay ?? 0;

  const processed = (currentPayrolls as { id: string; status: string; grossSalary: number; netPay: number; currency: string; employee: { name: string; position: string } }[]).map((p) => p.employee.name);
  const unprocessed = (employees as { id: string; name: string; position: string; grossSalary: number; currency: string }[]).filter((e) => !processed.includes(e.name));

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em]">Astelfin</p>
          <h1 className="text-3xl font-bold text-brand-navy">Payroll</h1>
          <p className="text-brand-muted text-sm">Period: {period}</p>
        </div>
        <Link
          href="/astelfin_26/payroll/run"
          className="bg-brand-gold hover:bg-brand-gold/90 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          Run Payroll
        </Link>
      </div>

      {!org && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
          Astelfin organisation is not configured. Contact your system administrator.
        </div>
      )}

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-5">
        {[
          { label: "Total Gross",  value: fmt(totalGross), color: "text-brand-navy" },
          { label: "Total PAYE",   value: fmt(totalPAYE),  color: "text-amber-600" },
          { label: "Total Net Pay",value: fmt(totalNet),   color: "text-emerald-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-gray-100 rounded-2xl px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">{kpi.label}</p>
            <p className={`text-xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Processed this period */}
      {(currentPayrolls as { id: string; status: string; grossSalary: number; netPay: number; currency: string; employee: { name: string; position: string } }[]).length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">Processed — {period}</h2>
          <div className="space-y-2">
            {(currentPayrolls as { id: string; status: string; grossSalary: number; netPay: number; currency: string; employee: { name: string; position: string } }[]).map((p) => (
              <div key={p.id} className="bg-white border border-gray-100 rounded-xl px-5 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-brand-navy">{p.employee.name}</p>
                  <p className="text-xs text-brand-muted">{p.employee.position}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-brand-muted">Gross</p>
                    <p className="text-sm font-semibold text-brand-navy">{fmt(p.grossSalary, p.currency)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-brand-muted">Net</p>
                    <p className="text-sm font-semibold text-emerald-600">{fmt(p.netPay, p.currency)}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Not yet processed */}
      {unprocessed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">
            Awaiting Payroll — {unprocessed.length} staff
          </h2>
          <div className="space-y-2">
            {unprocessed.map((emp) => (
              <div key={emp.id} className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-3 flex items-center justify-between gap-3 opacity-70">
                <div>
                  <p className="font-semibold text-brand-navy">{emp.name}</p>
                  <p className="text-xs text-brand-muted">{emp.position}</p>
                </div>
                <span className="text-sm text-brand-muted">{fmt(emp.grossSalary, emp.currency)} gross</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {org && employees.length === 0 && (
        <div className="text-center py-10 text-brand-muted text-sm">
          No staff found for Astelfin.{" "}
          <Link href="/astelfin_26/astelfin/staff" className="text-brand-gold font-semibold hover:underline">Add staff first</Link>
        </div>
      )}
    </div>
  );
}
