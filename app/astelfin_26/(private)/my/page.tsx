import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { calculateNetPay, formatCurrency, formatDate } from "@/lib/finance-utils";
import Link from "next/link";

export const metadata = {
  title: "My Page | Astelfin",
  robots: { index: false, follow: false },
};

const ROLE_LABELS: Record<string, string> = {
  CEO:             "Executive Director",
  FINANCE_MANAGER: "Finance Manager",
  PROJECT_MANAGER: "Project Manager",
  STAFF:           "Staff",
  CONSULTANT:      "Consultant",
};

const CONTRACT_LABELS: Record<string, string> = {
  PERMANENT: "Permanent",
  CONTRACT:  "Fixed-Term Contract",
  CASUAL:    "Casual / Part-Time",
  INTERN:    "Intern",
};

const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  PENDING_FM:              "Pending FM Review",
  FM_CHANGES_REQUESTED:    "FM Requested Changes",
  PENDING_CEO:             "Pending CEO Approval",
  CEO_CHANGES_REQUESTED:   "CEO Requested Changes",
  APPROVED:                "Approved — Awaiting Payment",
  PAID:                    "Paid",
  REJECTED:                "Rejected",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING_FM:            "bg-yellow-100 text-yellow-700",
  FM_CHANGES_REQUESTED:  "bg-orange-100 text-orange-700",
  PENDING_CEO:           "bg-blue-100 text-blue-700",
  CEO_CHANGES_REQUESTED: "bg-orange-100 text-orange-700",
  APPROVED:              "bg-green-100 text-green-700",
  PAID:                  "bg-green-100 text-green-700",
  REJECTED:              "bg-red-100 text-red-700",
};

function fmt(n: number) {
  return n.toLocaleString("en-MW", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const { tab = "general" } = await searchParams;

  // Load the current user with all linked data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) redirect("/astelfin_26/login");

  // Load linked employee record (if any)
  const employee = user.employeeId
    ? await prisma.employee.findUnique({ where: { id: user.employeeId } })
    : null;

  // Load submissions made by this user
  const submissions = await prisma.submission.findMany({
    where: { submittedBy: user.id },
    orderBy: { updatedAt: "desc" },
    take: 20,
    include: { project: { select: { name: true } } },
  });

  // Load projects this user is a member of (via ProjectMember email match)
  const projectMemberships = employee?.email || user.email
    ? await prisma.projectMember.findMany({
        where: { email: employee?.email ?? user.email },
        include: { project: { select: { id: true, name: true, status: true, client: true } } },
      })
    : [];

  // Salary calc (if employee linked)
  const salaryCalc = employee
    ? (() => {
        const rate = employee.currency === "MWK" ? 1 : (employee.salaryExchangeRate ?? 1);
        return calculateNetPay(employee.grossSalary, employee.pensionRate, rate);
      })()
    : null;

  // Pending requests counts
  const pendingCount   = submissions.filter((s) => !["PAID", "REJECTED"].includes(s.status)).length;
  const completedCount = submissions.filter((s) => s.status === "PAID").length;

  const tabs = [
    { key: "general",  label: "General" },
    { key: "finances", label: "Finances" },
    { key: "requests", label: "Requests" },
    { key: "projects", label: "Projects" },
  ];

  return (
    <div className="max-w-4xl space-y-6">

      {/* Profile header */}
      <div className="bg-brand-navy rounded-2xl p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-brand-gold flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          <p className="text-brand-gold text-sm font-medium mt-0.5">
            {ROLE_LABELS[user.role] ?? user.role}
            {employee?.department ? ` · ${employee.department}` : ""}
          </p>
          {employee && (
            <p className="text-white/50 text-xs mt-1">
              {employee.employeeNumber ?? "No employee number assigned"}
              {employee.contractType ? ` · ${CONTRACT_LABELS[employee.contractType] ?? employee.contractType}` : ""}
            </p>
          )}
        </div>
        {employee?.employeeNumber && (
          <div className="text-right shrink-0">
            <p className="text-white/40 text-xs">Employee No.</p>
            <p className="text-white font-bold text-lg">{employee.employeeNumber}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/astelfin_26/my?tab=${t.key}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-white text-brand-navy shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            {t.key === "requests" && pendingCount > 0 && (
              <span className="ml-1.5 bg-orange-400 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* ── GENERAL ─────────────────────────────────────────────────────── */}
      {tab === "general" && (
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-brand-navy text-sm uppercase tracking-wide">Account Details</h2>
            <InfoRow label="Full Name"    value={user.name} />
            <InfoRow label="Email"        value={user.email} />
            <InfoRow label="System Role"  value={ROLE_LABELS[user.role] ?? user.role} />
            <InfoRow label="Account Status" value={user.active ? "Active" : "Inactive"} valueClass={user.active ? "text-green-600" : "text-red-500"} />
          </div>

          {employee ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h2 className="font-bold text-brand-navy text-sm uppercase tracking-wide">Employment</h2>
              {employee.employeeNumber && (
                <InfoRow label="Employee Number" value={employee.employeeNumber} valueClass="font-bold text-brand-navy" />
              )}
              <InfoRow label="Position"      value={employee.position} />
              <InfoRow label="Department"    value={employee.department ?? "—"} />
              <InfoRow label="Contract Type" value={CONTRACT_LABELS[employee.contractType] ?? employee.contractType} />
              <InfoRow label="Start Date"    value={formatDate(employee.startDate)} />
              {employee.endDate && (
                <InfoRow label="End Date" value={formatDate(employee.endDate)} />
              )}
              {employee.taxPin && <InfoRow label="TPIN" value={employee.taxPin} />}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-5 flex items-center justify-center text-center">
              <div>
                <p className="text-gray-400 text-sm">No employee record linked to your account.</p>
                <p className="text-gray-400 text-xs mt-1">Contact the Executive Director to link your record.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FINANCES ────────────────────────────────────────────────────── */}
      {tab === "finances" && (
        <>
          {salaryCalc && employee ? (
            <div className="space-y-5">
              {/* Salary card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-brand-navy/5 border-b border-gray-100">
                  <h2 className="font-bold text-brand-navy text-sm">Monthly Salary Breakdown</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Based on your employee record · all PAYE calculated on MWK equivalent
                  </p>
                </div>
                <div className="divide-y divide-gray-50">
                  <SalaryRow
                    label={`Gross Salary (${employee.currency})`}
                    value={formatCurrency(employee.grossSalary, employee.currency)}
                    bold
                  />
                  {employee.currency !== "MWK" && (
                    <SalaryRow
                      label={`Gross MWK equivalent  ×  ${(employee.salaryExchangeRate ?? 1).toLocaleString("en-MW", { minimumFractionDigits: 4 })}`}
                      value={formatCurrency(salaryCalc.grossMWK, "MWK")}
                      muted
                    />
                  )}
                  <SalaryRow
                    label="PAYE (Income Tax)"
                    value={`− ${formatCurrency(salaryCalc.payeMWK, "MWK")}${employee.currency !== "MWK" ? `  /  − ${formatCurrency(salaryCalc.paye, employee.currency)}` : ""}`}
                    deduction
                  />
                  <SalaryRow
                    label={`Pension (${employee.pensionRate}%)`}
                    value={`− ${formatCurrency(salaryCalc.pensionMWK, "MWK")}${employee.currency !== "MWK" ? `  /  − ${formatCurrency(salaryCalc.pension, employee.currency)}` : ""}`}
                    deduction
                  />
                  <SalaryRow
                    label="Net Salary (MWK)"
                    value={formatCurrency(salaryCalc.netPayMWK, "MWK")}
                    bold
                    highlight
                  />
                  {employee.currency !== "MWK" && (
                    <SalaryRow
                      label={`Net Salary (${employee.currency})`}
                      value={formatCurrency(salaryCalc.netPay, employee.currency)}
                      bold
                      highlight
                    />
                  )}
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Gross" value={formatCurrency(employee.grossSalary, employee.currency)} sub={employee.currency} color="blue" />
                <StatCard label="PAYE" value={formatCurrency(salaryCalc.payeMWK, "MWK")} sub="per month" color="orange" />
                <StatCard label="Net Pay" value={formatCurrency(salaryCalc.netPayMWK, "MWK")} sub="take-home (MWK)" color="green" />
              </div>

              {/* Recent payroll */}
              <PayrollHistory userId={user.id} employeeId={employee.id} />
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <p className="text-gray-400 text-sm">No salary information available.</p>
              <p className="text-gray-400 text-xs mt-1">Your account must be linked to an employee record to view salary details.</p>
            </div>
          )}
        </>
      )}

      {/* ── REQUESTS ────────────────────────────────────────────────────── */}
      {tab === "requests" && (
        <div className="space-y-5">
          {/* Quick actions */}
          <div className="flex gap-3">
            <Link href="/astelfin_26/my/submissions/new"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              + Make a Request
            </Link>
            <Link href="/astelfin_26/my/submissions"
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              All My Requests
            </Link>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="Pending"
              value={String(submissions.filter((s) => !["PAID", "REJECTED"].includes(s.status)).length)}
              sub="awaiting action"
              color="orange"
            />
            <StatCard
              label="Paid"
              value={String(completedCount)}
              sub="completed"
              color="green"
            />
            <StatCard
              label="Rejected"
              value={String(submissions.filter((s) => s.status === "REJECTED").length)}
              sub="not approved"
              color="red"
            />
          </div>

          {/* Recent submissions */}
          {submissions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-400 text-sm">
              No requests submitted yet.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h2 className="font-bold text-brand-navy text-sm">Recent Requests</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Type</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Purpose / Project</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600">Amount</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {submissions.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {s.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {s.purpose ?? s.project?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-brand-navy">
                        {formatCurrency(s.totalAmount, s.currency)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {SUBMISSION_STATUS_LABELS[s.status] ?? s.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link href={`/astelfin_26/my/submissions/${s.id}`}
                          className="text-xs text-brand-gold font-semibold hover:underline">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── PROJECTS ────────────────────────────────────────────────────── */}
      {tab === "projects" && (
        <div className="space-y-4">
          {projectMemberships.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <p className="text-gray-400 text-sm">You are not listed as a member on any projects.</p>
              {(session.user.role === "CEO" || session.user.role === "PROJECT_MANAGER") && (
                <Link href="/astelfin_26/projects"
                  className="mt-4 inline-block text-brand-gold text-sm font-semibold hover:underline">
                  View All Projects →
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h2 className="font-bold text-brand-navy text-sm">My Projects ({projectMemberships.length})</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {projectMemberships.map((m) => (
                  <div key={m.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-brand-navy">{m.project.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{m.project.client} · {m.role}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      m.project.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                      m.project.status === "COMPLETED" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {m.project.status}
                    </span>
                    <Link href={`/astelfin_26/projects/${m.project.id}`}
                      className="text-xs text-brand-gold font-semibold hover:underline shrink-0">
                      View →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  valueClass = "text-gray-700",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className={`text-sm text-right ${valueClass}`}>{value}</span>
    </div>
  );
}

function SalaryRow({
  label,
  value,
  bold,
  muted,
  deduction,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  deduction?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-5 py-3 ${highlight ? "bg-brand-navy/5" : ""}`}>
      <span className={`text-sm ${muted ? "text-blue-600 text-xs" : "text-gray-600"}`}>{label}</span>
      <span className={`text-sm tabular-nums ${bold ? "font-bold text-brand-navy" : ""} ${deduction ? "text-red-600" : ""} ${muted ? "text-blue-800 text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: "blue" | "orange" | "green" | "red";
}) {
  const colors = {
    blue:   "bg-blue-50 text-blue-700 border-blue-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    green:  "bg-green-50 text-green-700 border-green-100",
    red:    "bg-red-50 text-red-700 border-red-100",
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
      <p className="text-xs opacity-60 mt-0.5">{sub}</p>
    </div>
  );
}

async function PayrollHistory({ employeeId }: { userId: string; employeeId: string }) {
  const payrolls = await prisma.payroll.findMany({
    where: { employeeId },
    orderBy: { period: "desc" },
    take: 6,
  });

  if (payrolls.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100">
        <h2 className="font-bold text-brand-navy text-sm">Recent Payroll</h2>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left px-5 py-3 font-semibold text-gray-600">Period</th>
            <th className="text-right px-5 py-3 font-semibold text-gray-600">Gross</th>
            <th className="text-right px-5 py-3 font-semibold text-gray-600">PAYE</th>
            <th className="text-right px-5 py-3 font-semibold text-gray-600">Net Pay</th>
            <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {payrolls.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-5 py-3 text-gray-600">{p.period}</td>
              <td className="px-5 py-3 text-right text-gray-700">{formatCurrency(p.grossSalary, p.currency)}</td>
              <td className="px-5 py-3 text-right text-orange-600">{formatCurrency(p.paye, "MWK")}</td>
              <td className="px-5 py-3 text-right font-bold text-brand-navy">{formatCurrency(p.netPay, p.currency)}</td>
              <td className="px-5 py-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.status === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {p.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Silence unused import warning
void fmt;
