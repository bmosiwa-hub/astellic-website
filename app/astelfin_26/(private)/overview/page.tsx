import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Astellic | Overview",
  robots: { index: false, follow: false },
};

function fmt(n: number) {
  return "MWK " + n.toLocaleString("en-MW", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function AstellicOverviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role   = session.user.role;
  const isCEO  = role === "CEO";
  const isFM   = role === "FINANCE_MANAGER";
  const isPriv = isCEO || isFM;

  const now        = new Date();
  const yearStart  = new Date(now.getFullYear(), 0, 1);

  const [
    employeeCount,
    pendingForMe,
    pendingInvoices,
    ytdIncome,
    ytdExpenses,
    recentSubmissions,
    activeProjects,
  ] = await Promise.all([
    prisma.employee.count({ where: { active: true } }),
    isPriv
      ? prisma.submission.count({
          where: {
            deletedAt: null,
            status: { in: isFM ? ["PENDING_FM"] : ["PENDING_CEO", "APPROVED"] },
          },
        })
      : Promise.resolve(0),
    isPriv
      ? prisma.submission.count({ where: { deletedAt: null, status: "PENDING_FM" } })
      : Promise.resolve(0),
    isPriv
      ? prisma.income.aggregate({
          _sum: { amount: true },
          where: { deletedAt: null, receivedDate: { gte: yearStart } },
        })
      : Promise.resolve({ _sum: { amount: null } }),
    isPriv
      ? prisma.expense.aggregate({
          _sum: { amount: true },
          where: { deletedAt: null, paidDate: { gte: yearStart } },
        })
      : Promise.resolve({ _sum: { amount: null } }),
    isPriv
      ? prisma.submission.findMany({
          where:   { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take:    5,
          include: { submitter: { select: { name: true } } },
        })
      : Promise.resolve([]),
    prisma.project.count({ where: { status: "ACTIVE" } }),
  ]);

  const income  = ytdIncome._sum.amount  ?? 0;
  const expense = ytdExpenses._sum.amount ?? 0;
  const net     = income - expense;

  const sections = [
    { label: "Finance",       href: "/astelfin_26/dashboard",  icon: "💰", desc: "Income, expenses, payroll & reports" },
    { label: "Operations",    href: "/astelfin_26/invoices",   icon: "📋", desc: "Invoices, procurement & approvals" },
    { label: "Employees",     href: "/astelfin_26/employees",  icon: "👥", desc: "Staff directory & payroll" },
    { label: "Projects",      href: "/astelfin_26/projects",   icon: "🗂",  desc: "Active projects & deliverables" },
    { label: "Business Dev",  href: "/astelfin_26/bizdev",     icon: "📈", desc: "Opportunities & pipeline" },
    { label: "Astelfin Room", href: "/astelfin_26/astelfin",   icon: "🏢", desc: "Astelfin company operations" },
  ];

  const STATUS_LABEL: Record<string, string> = {
    PENDING_FM:            "Pending FM",
    PENDING_CEO:           "Pending CEO",
    FM_CHANGES_REQUESTED:  "Changes Requested",
    CEO_CHANGES_REQUESTED: "Changes Requested",
    APPROVED:              "Approved",
    PAID:                  "Paid",
    REJECTED:              "Rejected",
  };

  const STATUS_COLOR: Record<string, string> = {
    PENDING_FM:            "text-amber-600",
    PENDING_CEO:           "text-blue-600",
    FM_CHANGES_REQUESTED:  "text-orange-600",
    CEO_CHANGES_REQUESTED: "text-orange-600",
    APPROVED:              "text-green-600",
    PAID:                  "text-emerald-600",
    REJECTED:              "text-red-600",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Welcome back</p>
          <h1 className="text-3xl font-bold text-brand-navy mt-0.5">
            Astellic {isCEO ? "— CEO Dashboard" : isFM ? "— Finance" : ""}
          </h1>
          <p className="text-brand-muted text-sm mt-1">
            {now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Link href="/astelfin_26/home"
          className="text-sm text-brand-muted hover:text-brand-gold font-semibold transition-colors">
          Switch Room →
        </Link>
      </div>

      {/* KPI cards — CEO / FM only */}
      {isPriv && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">Pending My Review</p>
            <p className={`text-2xl font-bold ${pendingForMe > 0 ? "text-amber-600" : "text-gray-400"}`}>
              {pendingForMe}
            </p>
            <Link href="/astelfin_26/invoices?tab=pending" className="text-xs text-brand-gold hover:underline">
              View →
            </Link>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">Active Projects</p>
            <p className="text-2xl font-bold text-brand-navy">{activeProjects}</p>
            <Link href="/astelfin_26/projects" className="text-xs text-brand-gold hover:underline">
              View →
            </Link>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">Staff</p>
            <p className="text-2xl font-bold text-brand-navy">{employeeCount}</p>
            <Link href="/astelfin_26/employees" className="text-xs text-brand-gold hover:underline">
              View →
            </Link>
          </div>
          <div className={`border rounded-2xl px-5 py-4 space-y-1 ${net >= 0 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">Net Position YTD</p>
            <p className={`text-lg font-bold tabular-nums ${net >= 0 ? "text-green-700" : "text-red-600"}`}>
              {fmt(net)}
            </p>
            <Link href="/astelfin_26/dashboard" className="text-xs text-brand-gold hover:underline">
              Finance →
            </Link>
          </div>
        </div>
      )}

      {/* Quick nav */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-3">Quick Access</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {sections.map((s) => (
            <Link key={s.label} href={s.href}
              className="group bg-white border border-gray-100 hover:border-brand-gold/40 rounded-2xl px-5 py-4 transition-all hover:shadow-sm flex items-start gap-4">
              <span className="text-2xl mt-0.5">{s.icon}</span>
              <div>
                <p className="font-semibold text-brand-navy group-hover:text-brand-gold transition-colors text-sm">
                  {s.label}
                </p>
                <p className="text-xs text-brand-muted mt-0.5">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent submissions */}
      {isPriv && recentSubmissions.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-brand-navy text-sm">Recent Submissions</h2>
            <Link href="/astelfin_26/invoices" className="text-xs text-brand-gold font-semibold hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(recentSubmissions as { id: string; type: string; status: string; totalAmount: number; currency: string; purpose: string | null; milestone: string | null; createdAt: Date; submitter: { name: string } }[]).map((s) => (
              <Link key={s.id} href={`/astelfin_26/invoices/${s.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brand-navy group-hover:text-brand-gold transition-colors truncate">
                    {s.purpose ?? s.milestone ?? (s.type === "INVOICE" ? "Invoice" : "Request")}
                  </p>
                  <p className="text-xs text-brand-muted">
                    {s.submitter.name} · {new Date(s.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-bold text-brand-navy tabular-nums">
                    {s.currency} {s.totalAmount.toLocaleString()}
                  </p>
                  <p className={`text-xs font-semibold ${STATUS_COLOR[s.status] ?? "text-gray-500"}`}>
                    {STATUS_LABEL[s.status] ?? s.status}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
