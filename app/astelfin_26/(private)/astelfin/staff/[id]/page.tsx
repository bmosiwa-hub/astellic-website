import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import Link from "next/link";
import bcrypt from "bcryptjs";

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

// ── Server Actions ────────────────────────────────────────────────────────────

async function createUserForAstelfinStaff(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/home");

  const employeeId = formData.get("employeeId") as string;
  const email      = formData.get("email") as string;
  const password   = formData.get("password") as string;
  const role       = (formData.get("role") as string) || "STAFF";

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) redirect("/astelfin_26/astelfin/staff");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) redirect(`/astelfin_26/astelfin/staff/${employeeId}?error=email_taken`);

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name:               employee.name,
      email,
      passwordHash,
      role:               role as "CEO" | "FINANCE_MANAGER" | "PROJECT_MANAGER" | "STAFF" | "CONSULTANT",
      employeeId:         employee.id,
      mustChangePassword: true,
    },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "CREATE",
    entity:   "User",
    entityId: user.id,
    detail:   `System user created for Astelfin staff ${employee.name} (${role})`,
  });

  redirect(`/astelfin_26/astelfin/staff/${employeeId}?success=user_created`);
}

async function linkExistingUserToAstelfinStaff(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/home");

  const employeeId = formData.get("employeeId") as string;
  const userId     = formData.get("userId") as string;

  await prisma.user.update({
    where: { id: userId },
    data:  { employeeId },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "UPDATE",
    entity:   "User",
    entityId: userId,
    detail:   `Linked to Astelfin employee ${employeeId}`,
  });

  redirect(`/astelfin_26/astelfin/staff/${employeeId}?success=user_linked`);
}

async function unlinkUserFromAstelfinStaff(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/home");

  const userId     = formData.get("userId") as string;
  const employeeId = formData.get("employeeId") as string;

  await prisma.user.update({
    where: { id: userId },
    data:  { employeeId: null },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "UPDATE",
    entity:   "User",
    entityId: userId,
    detail:   `Unlinked from Astelfin employee ${employeeId}`,
  });

  redirect(`/astelfin_26/astelfin/staff/${employeeId}?success=user_unlinked`);
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AstelfinStaffDetailPage({
  params,
  searchParams,
}: {
  params:       Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO" && session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/home");

  const { id }              = await params;
  const { success, error }  = await searchParams;
  const isCEO               = session.user.role === "CEO";

  const [emp, linkedUsers, unlinkedUsers] = await Promise.all([
    prisma.employee.findUnique({
      where:   { id },
      include: {
        supervisor: { select: { id: true, name: true } },
        payrolls:   { orderBy: { period: "desc" }, take: 3 },
      },
    }),
    prisma.user.findMany({
      where:  { employeeId: id },
      select: { id: true, name: true, email: true, role: true },
    }),
    isCEO
      ? prisma.user.findMany({
          where:   { employeeId: null, active: true },
          orderBy: { name: "asc" },
          select:  { id: true, name: true, email: true, role: true },
        })
      : Promise.resolve([]),
  ]);

  if (!emp) notFound();

  const linkedUser = linkedUsers[0] ?? null;

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

      {/* Success/Error banners */}
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
      {success === "user_created" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          System user account created and linked successfully.
        </div>
      )}
      {success === "user_linked" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          Existing user account linked to this staff member.
        </div>
      )}
      {success === "user_unlinked" && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm">
          User account has been unlinked from this staff member.
        </div>
      )}
      {error === "email_taken" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          That email address is already in use. Choose a different one.
        </div>
      )}

      {/* Header card */}
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

      {/* Details */}
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

      {/* ── System User Account ─────────────────────────────────────────── */}
      <div className={`rounded-2xl border p-6 space-y-4 ${linkedUser ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${linkedUser ? "bg-green-200" : "bg-amber-200"}`}>
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
                ? `Linked — ${linkedUser.name} (${linkedUser.email}) · ${linkedUser.role}`
                : "No system user account linked to this staff member."}
            </p>
          </div>
        </div>

        {/* CEO: linked user actions */}
        {linkedUser && isCEO && (
          <div className="flex gap-3 items-center flex-wrap">
            <Link
              href={`/astelfin_26/settings?editUser=${linkedUser.id}`}
              className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
            >
              Edit User Account
            </Link>
            <form action={unlinkUserFromAstelfinStaff}>
              <input type="hidden" name="userId"     value={linkedUser.id} />
              <input type="hidden" name="employeeId" value={emp.id} />
              <button type="submit"
                className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-xs font-semibold transition-colors">
                Unlink User
              </button>
            </form>
          </div>
        )}

        {/* CEO: no linked user — create or link */}
        {!linkedUser && isCEO && (
          <div className="space-y-4 pt-2">
            {/* Create new */}
            <div className="bg-white rounded-xl border border-amber-200 p-4 space-y-3">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Create New System Account</p>
              <form action={createUserForAstelfinStaff} className="grid grid-cols-2 gap-3">
                <input type="hidden" name="employeeId" value={emp.id} />
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Login Email <span className="text-red-500">*</span>
                  </label>
                  <input name="email" type="email" required
                    defaultValue={emp.email ?? ""}
                    placeholder="user@astelfin.com"
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

            {/* Link existing */}
            {unlinkedUsers.length > 0 && (
              <div className="bg-white rounded-xl border border-amber-200 p-4 space-y-3">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Or Link Existing User Account</p>
                <form action={linkExistingUserToAstelfinStaff} className="flex gap-3 items-end">
                  <input type="hidden" name="employeeId" value={emp.id} />
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
            Ask the Chief Executive Officer to create or link a system user account for this staff member.
          </p>
        )}
      </div>

      {/* Recent Payroll */}
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
