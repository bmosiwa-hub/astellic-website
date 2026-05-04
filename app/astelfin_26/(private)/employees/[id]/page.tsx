import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { redirect, notFound } from "next/navigation";
import { calculateNetPay, formatCurrency, formatDate } from "@/lib/finance-utils";
import Link from "next/link";
import bcrypt from "bcryptjs";

export const metadata = {
  title: "Employee | Astelfin IMS",
  robots: { index: false, follow: false },
};

const CONTRACT_LABELS: Record<string, string> = {
  PERMANENT:   "Permanent",
  CONTRACT:    "Fixed-Term Contract",
  CONSULTANCY: "Consultancy",
  INTERNSHIP:  "Internship",
  VOLUNTEER:   "Volunteer",
};

const CONTRACT_TYPES = [
  { value: "PERMANENT",   label: "Permanent" },
  { value: "CONTRACT",    label: "Fixed-Term Contract" },
  { value: "CONSULTANCY", label: "Consultancy" },
  { value: "INTERNSHIP",  label: "Internship" },
  { value: "VOLUNTEER",   label: "Volunteer" },
];

const FIXED_TERM_TYPES = new Set(["CONTRACT", "CONSULTANCY", "INTERNSHIP", "VOLUNTEER"]);

/* ── Server Actions ──────────────────────────────────────────── */

async function createUserForEmployee(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const employeeId = formData.get("employeeId") as string;
  const email      = formData.get("email") as string;
  const password   = formData.get("password") as string;
  const role       = (formData.get("role") as string) || "STAFF";

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) redirect("/astelfin_26/employees");

  // Check email not already taken
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect(`/astelfin_26/employees/${employeeId}?error=email_taken`);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name:       employee.name,
      email,
      passwordHash,
      role:       role as "CEO" | "FINANCE_MANAGER" | "PROJECT_MANAGER" | "STAFF" | "CONSULTANT",
      employeeId: employee.id,
    },
  });

  await auditLog({
    userId:   session.user.id,
    action:   "CREATE",
    entity:   "User",
    entityId: user.id,
    detail:   `System user created for employee ${employee.name} (${role})`,
  });

  redirect(`/astelfin_26/employees/${employeeId}?success=user_created`);
}

async function linkExistingUser(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const employeeId = formData.get("employeeId") as string;
  const userId     = formData.get("userId") as string;

  await prisma.user.update({
    where: { id: userId },
    data:  { employeeId },
  });

  await auditLog({
    userId:   session.user.id,
    action:   "UPDATE",
    entity:   "User",
    entityId: userId,
    detail:   `Linked to employee ${employeeId}`,
  });

  redirect(`/astelfin_26/employees/${employeeId}?success=user_linked`);
}

async function unlinkUser(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const userId = formData.get("userId") as string;

  await prisma.user.update({
    where: { id: userId },
    data:  { employeeId: null },
  });

  const employeeId = formData.get("employeeId") as string;
  redirect(`/astelfin_26/employees/${employeeId}?success=user_unlinked`);
}

async function updateEmploymentTerms(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const employeeId             = formData.get("employeeId") as string;
  const contractType           = formData.get("contractType") as string;
  const contractLengthRaw      = formData.get("contractLengthMonths") as string;
  const contractLengthMonths   = contractLengthRaw ? parseInt(contractLengthRaw) || null : null;

  // Recalculate end date from startDate + new contract length
  const employee = await prisma.employee.findUnique({ where: { id: employeeId }, select: { startDate: true } });
  let endDate: Date | null = null;
  if (employee && contractLengthMonths && contractLengthMonths > 0) {
    endDate = new Date(employee.startDate);
    endDate.setMonth(endDate.getMonth() + contractLengthMonths);
  }

  await prisma.employee.update({
    where: { id: employeeId },
    data:  { contractType, contractLengthMonths, endDate },
  });

  await auditLog({
    userId:   session.user.id,
    action:   "UPDATE",
    entity:   "Employee",
    entityId: employeeId,
    detail:   `Employment terms updated: ${contractType}${contractLengthMonths ? `, ${contractLengthMonths} months` : ""}`,
  });

  redirect(`/astelfin_26/employees/${employeeId}?success=terms_updated`);
}

/* ── Page ────────────────────────────────────────────────────── */

export default async function EmployeeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  const { id } = await params;
  const { error, success } = await searchParams;
  const isCEO = role === "CEO";

  const [employee, allUsers, unlinkedUsers] = await Promise.all([
    prisma.employee.findUnique({
      where: { id },
      include: {
        payrolls: { orderBy: { period: "desc" }, take: 6 },
      },
    }),
    // Users linked to this employee
    prisma.user.findMany({ where: { employeeId: id } }),
    // Users that have no employee linked (for CEO to link)
    isCEO
      ? prisma.user.findMany({
          where:   { employeeId: null, active: true },
          orderBy: { name: "asc" },
          select:  { id: true, name: true, email: true, role: true },
        })
      : Promise.resolve([]),
  ]);

  if (!employee) notFound();

  const linkedUser = allUsers[0] ?? null;

  // Salary calc
  const rate = employee.currency === "MWK" ? 1 : (employee.salaryExchangeRate ?? 1);
  const calc = calculateNetPay(employee.grossSalary, employee.pensionRate, rate);

  return (
    <div className="max-w-4xl space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/astelfin_26/employees" className="text-gray-400 hover:text-brand-navy transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">{employee.name}</h1>
            <p className="text-gray-500 text-sm">{employee.position}{employee.department ? ` · ${employee.department}` : ""}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {employee.employeeNumber && (
            <span className="bg-brand-navy text-white text-sm font-bold px-3 py-1 rounded-lg">
              {employee.employeeNumber}
            </span>
          )}
          <span className={`text-sm font-semibold px-3 py-1 rounded-lg ${employee.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {employee.active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {error === "email_taken" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          That email address is already in use by another system user. Choose a different email.
        </div>
      )}
      {success === "user_created" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          System user account created and linked successfully.
        </div>
      )}
      {success === "user_linked" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          Existing user account linked to this employee.
        </div>
      )}
      {success === "user_unlinked" && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm">
          User account has been unlinked from this employee.
        </div>
      )}
      {success === "terms_updated" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          Employment terms updated successfully.
        </div>
      )}

      <div className="grid grid-cols-2 gap-5">

        {/* Employment details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-brand-navy text-sm uppercase tracking-wide">Employment Details</h2>
          </div>
          <Field label="Employee Number"  value={employee.employeeNumber ?? "Not assigned"} />
          <Field label="Employment Type"  value={CONTRACT_LABELS[employee.contractType] ?? employee.contractType} />
          {employee.contractLengthMonths && (
            <Field label="Contract Length" value={`${employee.contractLengthMonths} months`} />
          )}
          <Field label="Department"       value={employee.department ?? "—"} />
          <Field label="Start Date"       value={formatDate(employee.startDate)} />
          {employee.endDate && <Field label="Contract Ends" value={formatDate(employee.endDate)} />}
          {employee.taxPin && <Field label="TPIN"    value={employee.taxPin} />}
          {employee.email  && <Field label="Email"   value={employee.email} />}
          {employee.notes  && <Field label="Notes"   value={employee.notes} />}
        </div>

        {/* Salary breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <h2 className="font-bold text-brand-navy text-sm uppercase tracking-wide">Salary</h2>
          </div>
          <div className="divide-y divide-gray-50 text-sm">
            <SRow label={`Gross (${employee.currency})`} value={formatCurrency(employee.grossSalary, employee.currency)} />
            {employee.currency !== "MWK" && (
              <SRow label={`Gross MWK  ×  ${(employee.salaryExchangeRate ?? 1).toFixed(4)}`} value={formatCurrency(calc.grossMWK, "MWK")} muted />
            )}
            <SRow label="PAYE" value={`− ${formatCurrency(calc.payeMWK, "MWK")}`} deduction />
            <SRow label={`Pension (${employee.pensionRate}%)`} value={`− ${formatCurrency(calc.pensionMWK, "MWK")}`} deduction />
            <SRow label="Net (MWK)" value={formatCurrency(calc.netPayMWK, "MWK")} bold />
            {employee.currency !== "MWK" && (
              <SRow label={`Net (${employee.currency})`} value={formatCurrency(calc.netPay, employee.currency)} bold />
            )}
          </div>
        </div>
      </div>

      {/* ── Employment Terms (CEO edit) ─────────────────────────── */}
      {isCEO && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-brand-navy text-sm uppercase tracking-wide">Edit Employment Terms</h2>
          <p className="text-xs text-gray-500">
            Only the Chief Executive Officer can change employment type and contract length.
            Updating contract length will automatically recalculate the contract end date.
          </p>
          <form action={updateEmploymentTerms} className="space-y-4">
            <input type="hidden" name="employeeId" value={employee.id} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Employment Type</label>
                <select name="contractType" defaultValue={employee.contractType}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white">
                  {CONTRACT_TYPES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Contract Length (months)
                  <span className="ml-1 font-normal text-gray-400">— leave blank for permanent</span>
                </label>
                <input
                  name="contractLengthMonths"
                  type="number" min="1" max="120" step="1"
                  defaultValue={employee.contractLengthMonths ?? ""}
                  placeholder="e.g. 12"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
                />
              </div>
            </div>
            {employee.endDate && (
              <p className="text-xs text-gray-500">
                Current contract end date: <span className="font-semibold text-amber-700">{formatDate(employee.endDate)}</span>
                {" "}— will be recalculated if you change the contract length above.
              </p>
            )}
            <button type="submit"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
              Save Employment Terms
            </button>
          </form>
        </div>
      )}

      {/* ── System User Account ─────────────────────────────────── */}
      <div className={`rounded-2xl border p-6 space-y-4 ${linkedUser ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${linkedUser ? "bg-green-200" : "bg-amber-200"}`}>
            {linkedUser ? (
              <svg className="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
              </svg>
            )}
          </div>
          <div>
            <h2 className={`font-bold text-sm ${linkedUser ? "text-green-800" : "text-amber-800"}`}>
              System User Account
            </h2>
            <p className={`text-xs ${linkedUser ? "text-green-600" : "text-amber-600"}`}>
              {linkedUser
                ? `Linked — ${linkedUser.name} (${linkedUser.email})`
                : "No system user account linked to this employee."}
            </p>
          </div>
        </div>

        {linkedUser && isCEO && (
          <div className="flex gap-3 items-center">
            <Link href={`/astelfin_26/settings?editUser=${linkedUser.id}`}
              className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors">
              Edit User Account
            </Link>
            <form action={unlinkUser}>
              <input type="hidden" name="userId"     value={linkedUser.id} />
              <input type="hidden" name="employeeId" value={employee.id} />
              <button type="submit"
                className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-xs font-semibold transition-colors">
                Unlink User
              </button>
            </form>
          </div>
        )}

        {!linkedUser && isCEO && (
          <div className="space-y-4 pt-2">
            {/* Create new user */}
            <div className="bg-white rounded-xl border border-amber-200 p-4 space-y-3">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Create New System Account</p>
              <form action={createUserForEmployee} className="grid grid-cols-2 gap-3">
                <input type="hidden" name="employeeId" value={employee.id} />
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Login Email <span className="text-red-500">*</span>
                  </label>
                  <input name="email" type="email" required
                    defaultValue={employee.email ?? ""}
                    placeholder="user@astellic.com"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Temporary Password <span className="text-red-500">*</span>
                  </label>
                  <input name="password" type="password" required minLength={8}
                    placeholder="Min 8 characters"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">System Role</label>
                  <select name="role"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white">
                    <option value="STAFF">Staff</option>
                    <option value="PROJECT_MANAGER">Project Manager</option>
                    <option value="FINANCE_MANAGER">Finance Manager</option>
                    <option value="CONSULTANT">Consultant</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button type="submit"
                    className="w-full bg-brand-gold hover:bg-brand-gold/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                    Create Account
                  </button>
                </div>
              </form>
            </div>

            {/* Or link existing user */}
            {unlinkedUsers.length > 0 && (
              <div className="bg-white rounded-xl border border-amber-200 p-4 space-y-3">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Or Link Existing User Account</p>
                <form action={linkExistingUser} className="flex gap-3 items-end">
                  <input type="hidden" name="employeeId" value={employee.id} />
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Select User</label>
                    <select name="userId"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white">
                      {unlinkedUsers.map((u) => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit"
                    className="bg-brand-navy hover:bg-brand-navy/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
                    Link User
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {!linkedUser && !isCEO && (
          <p className="text-xs text-amber-600">
            Ask the Chief Executive Officer to create or link a system user account for this employee.
          </p>
        )}
      </div>

      {/* ── Payroll history ─────────────────────────────────────── */}
      {employee.payrolls.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-brand-navy text-sm">Payroll History (recent)</h2>
            <Link href="/astelfin_26/payroll" className="text-xs text-brand-gold font-semibold hover:underline">
              View All →
            </Link>
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
              {employee.payrolls.map((p) => (
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
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-right text-gray-700">{value}</span>
    </div>
  );
}

function SRow({
  label, value, bold, muted, deduction,
}: {
  label: string; value: string; bold?: boolean; muted?: boolean; deduction?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-5 py-2.5 ${muted ? "bg-blue-50/40" : ""}`}>
      <span className={`${muted ? "text-xs text-blue-700" : "text-sm text-gray-600"}`}>{label}</span>
      <span className={`text-sm tabular-nums ${bold ? "font-bold text-brand-navy" : ""} ${deduction ? "text-red-600" : ""} ${muted ? "text-xs text-blue-800" : ""}`}>
        {value}
      </span>
    </div>
  );
}
