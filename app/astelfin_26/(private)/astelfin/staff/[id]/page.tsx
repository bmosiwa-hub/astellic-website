import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Staff | Astelfin", robots: { index: false, follow: false } };

function levelBadge(level: string | null) {
  if (level === "Executive")      return "bg-amber-100 text-amber-800";
  if (level === "Senior Manager") return "bg-blue-100 text-blue-800";
  if (level === "Manager")        return "bg-blue-100 text-blue-800";
  return "bg-gray-100 text-gray-600";
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function fmt(n: number, cur = "MWK") {
  return cur + " " + n.toLocaleString("en-MW", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function AstelfinStaffDetailPage({
  params,
  searchParams,
}: {
  params:       Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO" && session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/home");

  const { id }      = await params;
  const { success } = await searchParams;
  const emp = await prisma.employee.findUnique({
    where: { id },
    include: {
      supervisor: { select: { id: true, name: true } },
      payrolls:   { orderBy: { period: "desc" }, take: 3 },
    },
  });

  if (!emp) notFound();

  const rows = [
    { label: "Employee No.", value: emp.employeeNumber ?? "Not set" },
    { label: "Position",     value: emp.position },
    { label: "Level",        value: emp.level ?? "Not set" },
    { label: "Contract",     value: emp.contractType },
    { label: "Departments",  value: emp.departments.join(", ") || "Not assigned" },
    { label: "Email",        value: emp.email ?? "Not set" },
    { label: "Start Date",   value: new Date(emp.startDate).toLocaleDateString("en-GB") },
    { label: "End Date",     value: emp.endDate ? new Date(emp.endDate).toLocaleDateString("en-GB") : "Ongoing" },
    { label: "Gross Salary", value: fmt(emp.grossSalary, emp.currency) },
    { label: "Tax PIN",      value: emp.taxPin ?? "Not set" },
    { label: "NSSF",         value: emp.nssf ?? "Not set" },
    { label: "Pension Rate", value: emp.pensionRate + "%" },
    { label: "Supervisor",   value: emp.supervisor?.name ?? "None" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link href="/astelfin_26/astelfin/staff" className="text-sm text-brand-muted hover:text-brand-gold transition-colors">
        &larr; Back to Staff Directory
      </Link>

      {success === "updated" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          Staff profile updated successfully.
        </div>
      )}
      {success === "taxes_updated" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          Tax and benefit settings updated.
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl p-7 flex items-start gap-6">
        <div className="w-16 h-16 rounded-full bg-brand-navy flex items-center justify-center text-white text-xl font-bold shrink-0">
          {initials(emp.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-brand-navy">{emp.name}</h1>
            {emp.level && (
              <span className={"text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full " + levelBadge(emp.level)}>
                {emp.level}
              </span>
            )}
            <span className={"text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full " + (emp.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400")}>
              {emp.active ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-brand-muted text-sm mt-1">{emp.position}</p>
          {emp.departments.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">{emp.departments.join(" · ")}</p>
          )}
        </div>
        <Link
          href={"/astelfin_26/astelfin/staff/" + emp.id + "/edit"}
          className="shrink-0 bg-gray-100 hover:bg-brand-gold hover:text-white text-brand-navy px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          Edit
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-7">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-5">Details</h2>
        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
          {rows.map((r) => (
            <div key={r.label}>
              <dt className="text-xs text-gray-400 font-medium">{r.label}</dt>
              <dd className="text-sm font-semibold text-brand-navy mt-0.5">{r.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {emp.payrolls.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-7">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-5">Recent Payroll</h2>
          <div className="space-y-3">
            {emp.payrolls.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-brand-navy font-medium">{p.period}</span>
                <span className="text-brand-muted">Gross: {fmt(p.grossSalary, p.currency)}</span>
                <span className="text-emerald-600 font-semibold">Net: {fmt(p.netPay, p.currency)}</span>
                <span className={"text-[10px] font-bold uppercase px-2 py-0.5 rounded-full " + (p.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
          <Link href="/astelfin_26/astelfin/payroll" className="text-xs text-brand-gold hover:underline font-medium mt-4 inline-block">
            View full payroll
          </Link>
        </div>
      )}
    </div>
  );
}