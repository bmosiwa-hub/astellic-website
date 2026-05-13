import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { redirect, notFound } from "next/navigation";
import { calculateNetPay, formatCurrency, formatDate } from "@/lib/finance-utils";
import { getEffectivePermissions } from "@/lib/permissions";
import Link from "next/link";
import bcrypt from "bcryptjs";
import PermissionEditor from "@/components/finance/PermissionEditor";

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

const LEVELS = [
  "Executive",
  "Senior Manager",
  "Manager",
  "Officer",
  "Support Staff",
];

const DEPARTMENTS = [
  "Administration",
  "Business Development",
  "Finance",
  "Human Resources",
  "Projects",
  "Senior Management",
  "Support Staff",
];

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

  const employeeId   = formData.get("employeeId") as string;
  const contractType = formData.get("contractType") as string;
  const startDateRaw = formData.get("startDate") as string;
  const endDateRaw   = formData.get("endDate") as string;
  const startDate    = startDateRaw ? new Date(startDateRaw) : undefined;
  const endDate      = endDateRaw ? new Date(endDateRaw) : null;

  const grossSalaryRaw = formData.get("grossSalary") as string;
  const grossSalary    = grossSalaryRaw ? parseFloat(grossSalaryRaw) : undefined;
  const departments    = formData.getAll("departments").map(String).filter(Boolean);
  const email          = (formData.get("email") as string) || null;
  const position       = (formData.get("position") as string) || undefined;
  const level          = (formData.get("level") as string) || null;
  const supervisorId   = (formData.get("supervisorId") as string) || null;

  await prisma.employee.update({
    where: { id: employeeId },
    data:  {
      contractType,
      ...(startDate ? { startDate } : {}),
      endDate,
      departments,
      ...(grossSalary !== undefined ? { grossSalary } : {}),
      ...(position ? { position } : {}),
      level,
      email,
      supervisorId,
    },
  });

  await auditLog({
    userId:   session.user.id,
    action:   "UPDATE",
    entity:   "Employee",
    entityId: employeeId,
    detail:   `Contract updated: ${contractType}${startDate ? `, starts ${startDate.toISOString().slice(0, 10)}` : ""}${endDate ? `, ends ${endDate.toISOString().slice(0, 10)}` : ""}`,
  });

  redirect(`/astelfin_26/employees/${employeeId}?success=terms_updated`);
}

async function updateUserPermissions(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const userId      = formData.get("userId") as string;
  const permsJson   = formData.get("permissions") as string;

  let permissions: object;
  try { permissions = JSON.parse(permsJson); }
  catch { redirect(`/astelfin_26/employees/${formData.get("employeeId") as string}?error=bad_perms`); }

  await prisma.user.update({ where: { id: userId }, data: { permissions } });

  await auditLog({
    userId:   session.user.id,
    action:   "UPDATE",
    entity:   "User",
    entityId: userId,
    detail:   "Permissions updated by CEO",
  });
}

async function terminateContract(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const employeeId = formData.get("employeeId") as string;
  const reason     = (formData.get("reason") as string) || null;

  await prisma.employee.update({
    where: { id: employeeId },
    data:  { active: false, endDate: new Date() },
  });

  await auditLog({
    userId:   session.user.id,
    action:   "TERMINATE",
    entity:   "Employee",
    entityId: employeeId,
    detail:   reason ? `Contract terminated: ${reason}` : "Contract terminated by CEO",
  });

  redirect(`/astelfin_26/employees/${employeeId}?success=terminated`);
}

async function reinstateEmployee(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const employeeId = formData.get("employeeId") as string;
  const employee   = await prisma.employee.findUnique({ where: { id: employeeId }, select: { name: true } });

  await prisma.employee.update({
    where: { id: employeeId },
    data:  { active: true, endDate: null },
  });

  await auditLog({
    userId:   session.user.id,
    action:   "UPDATE",
    entity:   "Employee",
    entityId: employeeId,
    detail:   `Contract reinstated: ${employee?.name}`,
  });

  redirect(`/astelfin_26/employees/${employeeId}?success=reinstated`);
}

async function rehireEmployee(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const employeeId     = formData.get("employeeId") as string;
  const contractType   = formData.get("contractType") as string;
  const startDateRaw   = formData.get("startDate") as string;
  const endDateRaw     = formData.get("endDate") as string;
  const grossSalaryRaw = formData.get("grossSalary") as string;

  const startDate  = startDateRaw ? new Date(startDateRaw) : new Date();
  const endDate    = endDateRaw   ? new Date(endDateRaw)   : null;
  const grossSalary = grossSalaryRaw ? parseFloat(grossSalaryRaw) : undefined;

  const employee = await prisma.employee.findUnique({ where: { id: employeeId }, select: { name: true } });

  await prisma.employee.update({
    where: { id: employeeId },
    data:  {
      active: true,
      contractType,
      startDate,
      endDate,
      ...(grossSalary !== undefined ? { grossSalary } : {}),
    },
  });

  await auditLog({
    userId:   session.user.id,
    action:   "UPDATE",
    entity:   "Employee",
    entityId: employeeId,
    detail:   `Employee rehired: ${employee?.name}, new contract starts ${startDate.toISOString().slice(0, 10)}`,
  });

  redirect(`/astelfin_26/employees/${employeeId}?success=rehired`);
}

async function updateTaxesBenefits(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const employeeId       = formData.get("employeeId") as string;
  const payeExempt       = formData.get("payeExempt") === "true";
  const pensionRateRaw   = formData.get("pensionRate") as string;
  const pensionRate      = pensionRateRaw ? parseFloat(pensionRateRaw) : 5;
  const nssfApplicable   = formData.get("nssfApplicable") === "true";
  const nssfEmployeeRate = parseFloat((formData.get("nssfEmployeeRate") as string) || "3");
  const nssfEmployerRate = parseFloat((formData.get("nssfEmployerRate") as string) || "3");

  await prisma.employee.update({
    where: { id: employeeId },
    data:  { payeExempt, pensionRate, nssfApplicable, nssfEmployeeRate, nssfEmployerRate },
  });

  await auditLog({
    userId:   session.user.id,
    action:   "UPDATE",
    entity:   "Employee",
    entityId: employeeId,
    detail:   `Taxes & benefits updated: PAYE ${payeExempt ? "exempt" : "applies"}, pension ${pensionRate}%, NSSF ${nssfApplicable ? `yes (EE ${nssfEmployeeRate}% / ER ${nssfEmployerRate}%)` : "no"}`,
  });

  redirect(`/astelfin_26/employees/${employeeId}?success=taxes_updated`);
}

async function deleteEmployee(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const employeeId = formData.get("employeeId") as string;
  const employee   = await prisma.employee.findUnique({ where: { id: employeeId }, select: { name: true, active: true } });

  // Safety: only allow deleting inactive employees
  if (employee?.active) redirect(`/astelfin_26/employees/${employeeId}?error=still_active`);

  // Unlink any user accounts first
  await prisma.user.updateMany({
    where: { employeeId },
    data:  { employeeId: null },
  });

  await prisma.employee.delete({ where: { id: employeeId } });

  await auditLog({
    userId:   session.user.id,
    action:   "DELETE",
    entity:   "Employee",
    entityId: employeeId,
    detail:   `Employee permanently deleted: ${employee?.name}`,
  });

  redirect("/astelfin_26/employees");
}

/* ── Page ────────────────────────────────────────────────────── */

export default async function EmployeeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string; confirm?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  const { id } = await params;
  const { error, success, confirm } = await searchParams;
  const isCEO = role === "CEO";

  const [employee, allUsers, unlinkedUsers, allActiveEmployees] = await Promise.all([
    prisma.employee.findUnique({
      where: { id },
      include: {
        payrolls:   { orderBy: { period: "desc" }, take: 6 },
        supervisor: { select: { id: true, name: true } },
      },
    }),
    prisma.user.findMany({
      where:  { employeeId: id },
      select: { id: true, name: true, email: true, role: true, permissions: true },
    }),
    isCEO
      ? prisma.user.findMany({
          where:   { employeeId: null, active: true },
          orderBy: { name: "asc" },
          select:  { id: true, name: true, email: true, role: true },
        })
      : Promise.resolve([]),
    isCEO
      ? prisma.employee.findMany({
          where:   { active: true, id: { not: id } },
          orderBy: { name: "asc" },
          select:  { id: true, name: true, position: true },
        })
      : Promise.resolve([]),
  ]);

  if (!employee) notFound();

  const linkedUser = allUsers[0] ?? null;

  // Salary calc
  const rate = employee.currency === "MWK" ? 1 : (employee.salaryExchangeRate ?? 1);
  const calc = calculateNetPay(employee.grossSalary, employee.pensionRate, rate, {
    payeExempt:       employee.payeExempt,
    nssfApplicable:   employee.nssfApplicable,
    nssfEmployeeRate: employee.nssfEmployeeRate,
    nssfEmployerRate: employee.nssfEmployerRate,
  });

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40";

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
            <p className="text-gray-500 text-sm">
              {employee.position}
              {employee.departments.length > 0 ? ` · ${employee.departments.join(", ")}` : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {employee.employeeNumber && (
            <span className="bg-brand-navy text-white text-sm font-bold px-3 py-1 rounded-lg">
              {employee.employeeNumber}
            </span>
          )}
          <span className={`text-sm font-semibold px-3 py-1 rounded-lg ${employee.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {employee.active ? "Active" : "Former"}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {error === "email_taken" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          That email address is already in use by another system user. Choose a different email.
        </div>
      )}
      {error === "still_active" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          Cannot permanently delete an active employee. Terminate the contract first.
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
          Contract details updated successfully.
        </div>
      )}
      {success === "taxes_updated" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          Tax and benefit settings updated successfully.
        </div>
      )}
      {success === "terminated" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          Contract terminated. Employee marked as former.
        </div>
      )}
      {success === "reinstated" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          Employee reinstated. Contract is now active again.
        </div>
      )}
      {success === "rehired" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          Employee rehired successfully with a new contract.
        </div>
      )}

      <div className="grid grid-cols-2 gap-5">

        {/* Employment details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-brand-navy text-sm uppercase tracking-wide">Employment Details</h2>
          </div>
          <Field label="Employee Number"  value={employee.employeeNumber ?? "Not assigned"} />
          <Field label="Position"         value={employee.position} />
          {employee.level && <Field label="Level" value={employee.level} />}
          <Field label="Employment Type"  value={CONTRACT_LABELS[employee.contractType] ?? employee.contractType} />
          <Field label="Department(s)"    value={employee.departments.length > 0 ? employee.departments.join(", ") : "—"} />
          <Field label="Supervisor"       value={employee.supervisor?.name ?? "—"} />
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
            {employee.payeExempt ? (
              <SRow label="PAYE" value="Exempt" exempt />
            ) : (
              <SRow label="PAYE" value={`− ${formatCurrency(calc.payeMWK, "MWK")}`} deduction />
            )}
            <SRow label={`Pension (${employee.pensionRate}%)`} value={`− ${formatCurrency(calc.pensionMWK, "MWK")}`} deduction />
            {employee.nssfApplicable && (
              <SRow label={`NSSF Employee (${employee.nssfEmployeeRate}%)`} value={`− ${formatCurrency(calc.nssfEmployeeMWK, "MWK")}`} deduction />
            )}
            <SRow label="Net (MWK)" value={formatCurrency(calc.netPayMWK, "MWK")} bold />
            {employee.currency !== "MWK" && (
              <SRow label={`Net (${employee.currency})`} value={formatCurrency(calc.netPay, employee.currency)} bold />
            )}
            {employee.nssfApplicable && (
              <SRow label={`NSSF Employer (${employee.nssfEmployerRate}%) — employer cost`} value={formatCurrency(calc.nssfEmployerMWK, "MWK")} muted />
            )}
          </div>
        </div>
      </div>

      {/* ── Former Employee Actions (CEO only) ──────────────────── */}
      {isCEO && !employee.active && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div>
            <h2 className="font-bold text-brand-navy text-sm uppercase tracking-wide">Former Employee</h2>
            <p className="text-xs text-gray-500 mt-1">
              This employee&#39;s record is retained. Choose how to proceed.
            </p>
          </div>

          {/* Reinstate */}
          <div className="border border-green-200 rounded-xl p-4 space-y-2 bg-green-50">
            <p className="text-sm font-semibold text-green-800">Reinstate</p>
            <p className="text-xs text-green-700">
              Continue the existing contract as if termination never happened — active status restored, end date cleared.
            </p>
            <form action={reinstateEmployee}>
              <input type="hidden" name="employeeId" value={employee.id} />
              <button type="submit"
                className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors">
                Reinstate Employee
              </button>
            </form>
          </div>

          {/* Rehire */}
          <div className="border border-brand-gold/40 rounded-xl p-4 space-y-3 bg-brand-gold/5">
            <p className="text-sm font-semibold text-brand-navy">Rehire</p>
            <p className="text-xs text-gray-600">
              Start a new contract — retains the employee profile but sets a fresh start date and contract type.
            </p>
            <form action={rehireEmployee} className="grid grid-cols-2 gap-3">
              <input type="hidden" name="employeeId" value={employee.id} />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  New Start Date <span className="text-red-500">*</span>
                </label>
                <input name="startDate" type="date" required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contract Type</label>
                <select name="contractType" defaultValue={employee.contractType}
                  className={`${inp} bg-white`}>
                  {CONTRACT_TYPES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Contract End Date
                  <span className="ml-1.5 font-normal text-gray-400">— leave blank if open</span>
                </label>
                <input name="endDate" type="date" className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  New Gross Salary ({employee.currency})
                  <span className="ml-1.5 font-normal text-gray-400">— leave blank to keep current</span>
                </label>
                <input name="grossSalary" type="number" min="0" step="0.01"
                  placeholder={String(employee.grossSalary)}
                  className={inp} />
              </div>
              <div className="col-span-2">
                <button type="submit"
                  className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-colors">
                  Rehire with New Contract
                </button>
              </div>
            </form>
          </div>

          {/* Permanent delete (CEO only, with confirmation) */}
          {confirm === "delete" ? (
            <div className="border border-red-300 rounded-xl p-4 space-y-3 bg-red-50">
              <p className="text-sm font-bold text-red-700">⚠ Permanently Delete Employee Record?</p>
              <p className="text-xs text-red-600">
                This will permanently delete <strong>{employee.name}</strong> and all associated payroll records.
                This action <strong>cannot be undone</strong>.
              </p>
              <div className="flex gap-3">
                <form action={deleteEmployee}>
                  <input type="hidden" name="employeeId" value={employee.id} />
                  <button type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors">
                    Yes, Permanently Delete
                  </button>
                </form>
                <Link href={`/astelfin_26/employees/${employee.id}`}
                  className="px-5 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <Link
                href={`/astelfin_26/employees/${employee.id}?confirm=delete`}
                className="text-xs text-gray-400 hover:text-red-600 hover:underline transition-colors"
              >
                Permanently delete record…
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── Edit Contract Details (CEO only, active employees) ──── */}
      {isCEO && employee.active && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-brand-navy text-sm uppercase tracking-wide">Edit Contract Details</h2>
          <p className="text-xs text-gray-500">CEO-only. Changes are audit-logged.</p>
          <form action={updateEmploymentTerms} className="space-y-4">
            <input type="hidden" name="employeeId" value={employee.id} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Position / Job Title <span className="text-red-500">*</span>
                </label>
                <input name="position" required defaultValue={employee.position} className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Level</label>
                <select name="level" defaultValue={employee.level ?? ""} className={`${inp} bg-white`}>
                  <option value="">— Select Level —</option>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Employment Type</label>
                <select name="contractType" defaultValue={employee.contractType} className={`${inp} bg-white`}>
                  {CONTRACT_TYPES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Gross Monthly Salary ({employee.currency})</label>
                <input name="grossSalary" type="number" min="0" step="0.01"
                  defaultValue={employee.grossSalary} className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contract Start Date</label>
                <input name="startDate" type="date"
                  defaultValue={employee.startDate ? employee.startDate.toISOString().slice(0, 10) : ""}
                  className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Contract End Date
                  <span className="ml-1.5 font-normal text-gray-400">— leave blank for permanent</span>
                </label>
                <input name="endDate" type="date"
                  defaultValue={employee.endDate ? employee.endDate.toISOString().slice(0, 10) : ""}
                  className={inp} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Direct Supervisor</label>
                <select name="supervisorId" defaultValue={employee.supervisorId ?? ""} className={`${inp} bg-white`}>
                  <option value="">— No supervisor —</option>
                  {allActiveEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}{e.position ? ` (${e.position})` : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  The supervisor receives performance objective approval requests and timesheet reviews.
                </p>
              </div>
              <div className="col-span-2">
                <DeptCheckboxes current={employee.departments} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Email Address</label>
                <input name="email" type="email" defaultValue={employee.email ?? ""} className={inp} />
              </div>
            </div>
            <button type="submit"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* ── Taxes & Benefits (CEO only) ─────────────────────────── */}
      {isCEO && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div>
            <h2 className="font-bold text-brand-navy text-sm uppercase tracking-wide">Taxes &amp; Benefits</h2>
            <p className="text-xs text-gray-500 mt-1">CEO-only. Controls which statutory deductions apply to this employee. Changes are audit-logged.</p>
          </div>
          <form action={updateTaxesBenefits} className="space-y-5">
            <input type="hidden" name="employeeId" value={employee.id} />

            {/* PAYE */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">PAYE (Pay As You Earn)</p>
              <div className="flex gap-3">
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${!employee.payeExempt ? "border-brand-navy bg-brand-navy/5 text-brand-navy font-semibold" : "border-gray-200 text-gray-500"}`}>
                  <input type="radio" name="payeExempt" value="false" defaultChecked={!employee.payeExempt} className="accent-brand-navy" />
                  Applies
                </label>
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${employee.payeExempt ? "border-amber-500 bg-amber-50 text-amber-700 font-semibold" : "border-gray-200 text-gray-500"}`}>
                  <input type="radio" name="payeExempt" value="true" defaultChecked={employee.payeExempt} className="accent-amber-500" />
                  Exempt
                </label>
              </div>
              <p className="text-xs text-gray-400">Standard Malawi PAYE bands apply when not exempt. Set exempt for volunteers, interns, or PAYE-exempt staff.</p>
            </div>

            {/* Pension */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Pension</p>
              <div className="flex items-center gap-3">
                <label className="block text-xs font-medium text-gray-600 shrink-0">Employee contribution rate (%)</label>
                <input
                  name="pensionRate"
                  type="number" min="0" max="100" step="0.5"
                  defaultValue={employee.pensionRate}
                  className={`${inp} max-w-[120px]`}
                />
              </div>
              <p className="text-xs text-gray-400">Set to 0 to disable pension deduction. Default is 5%.</p>
            </div>

            {/* NSSF */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">NSSF (National Social Security Fund)</p>
              <div className="flex gap-3">
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${!employee.nssfApplicable ? "border-gray-200 text-gray-500" : "border-brand-teal bg-brand-teal/5 text-brand-teal font-semibold"}`}>
                  <input type="radio" name="nssfApplicable" value="true" defaultChecked={employee.nssfApplicable} className="accent-brand-teal" />
                  Applicable
                </label>
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${!employee.nssfApplicable ? "border-gray-200 bg-gray-50 text-gray-600 font-medium" : "border-gray-200 text-gray-500"}`}>
                  <input type="radio" name="nssfApplicable" value="false" defaultChecked={!employee.nssfApplicable} className="accent-gray-400" />
                  Not applicable
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Employee contribution (%)</label>
                  <input
                    name="nssfEmployeeRate"
                    type="number" min="0" max="100" step="0.5"
                    defaultValue={employee.nssfEmployeeRate}
                    className={inp}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Employer contribution (%)</label>
                  <input
                    name="nssfEmployerRate"
                    type="number" min="0" max="100" step="0.5"
                    defaultValue={employee.nssfEmployerRate}
                    className={inp}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">Malawi default: 3% employee, 3% employer. Employer NSSF is shown as an employer cost and not deducted from net pay.</p>
            </div>

            <button type="submit"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
              Save Tax &amp; Benefit Settings
            </button>
          </form>
        </div>
      )}

      {/* ── Terminate Contract (CEO only, active, with confirmation) */}
      {isCEO && employee.active && (
        confirm === "terminate" ? (
          /* Confirmation panel */
          <div className="bg-red-50 rounded-2xl border border-red-300 p-6 space-y-4">
            <div>
              <h2 className="font-bold text-red-700 text-sm uppercase tracking-wide">Confirm Termination</h2>
              <p className="text-xs text-red-600 mt-1">
                You are about to terminate <strong>{employee.name}</strong>&#39;s contract.
                Their profile will be retained as a former employee.
                This action is audit-logged.
              </p>
            </div>
            <form action={terminateContract} className="space-y-3">
              <input type="hidden" name="employeeId" value={employee.id} />
              <div>
                <label className="block text-xs font-medium text-red-700 mb-1">Reason for Termination</label>
                <input name="reason"
                  placeholder="e.g. End of contract, resignation, redundancy…"
                  className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Confirm Termination
                </button>
                <Link href={`/astelfin_26/employees/${employee.id}`}
                  className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        ) : (
          /* Terminate button — Link to ?confirm=terminate */
          <div className="bg-red-50 rounded-2xl border border-red-200 p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-red-700">Terminate Contract</p>
              <p className="text-xs text-red-500 mt-0.5">
                Marks the employee as former. Their record is kept and can be reinstated or rehired later.
              </p>
            </div>
            <Link
              href={`/astelfin_26/employees/${employee.id}?confirm=terminate`}
              className="shrink-0 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Terminate…
            </Link>
          </div>
        )
      )}

      {/* ── Access Permissions (CEO only, linked user only) ─────── */}
      {isCEO && linkedUser && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-brand-navy text-sm uppercase tracking-wide">Access Permissions</h2>
          <p className="text-xs text-gray-500">
            Control which tabs and functions {employee.name} can access.
            Changes take effect on their next page load.
          </p>
          <PermissionEditor
            userId={linkedUser.id}
            userName={employee.name}
            current={getEffectivePermissions(linkedUser.role, linkedUser.permissions as object | null)}
            saveAction={updateUserPermissions}
          />
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

function DeptCheckboxes({ current }: { current: string[] }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        Departments — select all that apply
      </label>
      <div className="grid grid-cols-2 gap-1.5">
        {DEPARTMENTS.map((d) => {
          const checked = current.includes(d);
          return (
            <label
              key={d}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors
                ${checked
                  ? "border-brand-gold bg-brand-gold/5 text-brand-navy font-medium"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"}`}
            >
              <input
                type="checkbox"
                name="departments"
                value={d}
                defaultChecked={checked}
                className="accent-[var(--brand-gold,#c9a84c)] w-3.5 h-3.5 shrink-0"
              />
              {d}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-right text-gray-700">{value}</span>
    </div>
  );
}

function SRow({
  label, value, bold, muted, deduction, exempt,
}: {
  label: string; value: string; bold?: boolean; muted?: boolean; deduction?: boolean; exempt?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-5 py-2.5 ${muted ? "bg-blue-50/40" : ""} ${exempt ? "bg-amber-50/40" : ""}`}>
      <span className={`${muted ? "text-xs text-blue-700" : exempt ? "text-sm text-amber-700" : "text-sm text-gray-600"}`}>{label}</span>
      <span className={`text-sm tabular-nums ${bold ? "font-bold text-brand-navy" : ""} ${deduction ? "text-red-600" : ""} ${muted ? "text-xs text-blue-800" : ""} ${exempt ? "text-xs font-medium text-amber-600 italic" : ""}`}>
        {value}
      </span>
    </div>
  );
}
