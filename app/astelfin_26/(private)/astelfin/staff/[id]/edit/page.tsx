import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { getAstelfinOrg } from "@/lib/astelfin-org";
import { formatCurrency, calculateNetPay } from "@/lib/finance-utils";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Edit Staff | Astelfin",
  robots: { index: false, follow: false },
};

const CONTRACT_TYPES = [
  { value: "PERMANENT",   label: "Permanent" },
  { value: "CONTRACT",    label: "Fixed-Term Contract" },
  { value: "CONSULTANCY", label: "Consultancy" },
  { value: "INTERNSHIP",  label: "Internship" },
  { value: "VOLUNTEER",   label: "Volunteer" },
];

const LEVELS = ["Executive", "Senior Manager", "Manager", "Officer", "Support Staff"];

const DEPARTMENTS = [
  "Administration",
  "Business Development",
  "Finance",
  "Human Resources",
  "Projects",
  "Senior Management",
  "Support Staff",
];

// ── Server Actions ───────────────────────────────────────────────────────────

async function updateAstelfinStaff(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO" && session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/home");

  const employeeId   = formData.get("employeeId") as string;
  const position     = (formData.get("position") as string) || undefined;
  const level        = (formData.get("level") as string) || null;
  const contractType = formData.get("contractType") as string;
  const grossSalary  = parseFloat(formData.get("grossSalary") as string) || undefined;
  const startDateRaw = formData.get("startDate") as string;
  const endDateRaw   = formData.get("endDate") as string;
  const startDate    = startDateRaw ? new Date(startDateRaw) : undefined;
  const endDate      = endDateRaw ? new Date(endDateRaw) : null;
  const departments  = formData.getAll("departments").map(String).filter(Boolean);
  const email        = (formData.get("email") as string) || null;
  const supervisorId = (formData.get("supervisorId") as string) || null;

  await prisma.employee.update({
    where: { id: employeeId },
    data: {
      ...(position ? { position } : {}),
      level,
      contractType,
      ...(grossSalary !== undefined ? { grossSalary } : {}),
      ...(startDate ? { startDate } : {}),
      endDate,
      departments,
      email,
      supervisorId,
    },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "UPDATE",
    entity:   "Employee",
    entityId: employeeId,
    detail:   `Astelfin staff updated: ${contractType}${startDate ? `, from ${startDate.toISOString().slice(0, 10)}` : ""}`,
  });

  redirect(`/astelfin_26/astelfin/staff/${employeeId}?success=updated`);
}

async function updateAstelfinTaxes(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO" && session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/home");

  const employeeId       = formData.get("employeeId") as string;
  const payeExempt       = formData.get("payeExempt") === "true";
  const pensionRate      = parseFloat((formData.get("pensionRate") as string) || "5");
  const nssfApplicable   = formData.get("nssfApplicable") === "true";
  const nssfEmployeeRate = parseFloat((formData.get("nssfEmployeeRate") as string) || "3");
  const nssfEmployerRate = parseFloat((formData.get("nssfEmployerRate") as string) || "3");

  await prisma.employee.update({
    where: { id: employeeId },
    data:  { payeExempt, pensionRate, nssfApplicable, nssfEmployeeRate, nssfEmployerRate },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "UPDATE",
    entity:   "Employee",
    entityId: employeeId,
    detail:   `Astelfin taxes updated: PAYE ${payeExempt ? "exempt" : "applies"}, pension ${pensionRate}%`,
  });

  redirect(`/astelfin_26/astelfin/staff/${employeeId}?success=taxes_updated`);
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AstelfinStaffEditPage({
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

  const org = await getAstelfinOrg();

  const [emp, allActiveStaff] = await Promise.all([
    prisma.employee.findUnique({
      where:   { id },
      include: { supervisor: { select: { id: true, name: true } } },
    }),
    prisma.employee.findMany({
      where:   { active: true, id: { not: id }, ...(org ? { organisationId: org.id } : {}) },
      orderBy: { name: "asc" },
      select:  { id: true, name: true, position: true },
    }),
  ]);

  if (!emp) notFound();

  // Verify this employee belongs to Astelfin
  if (org && emp.organisationId !== org.id) {
    redirect("/astelfin_26/astelfin/staff");
  }

  const rate = emp.currency === "MWK" ? 1 : (emp.salaryExchangeRate ?? 1);
  const calc = calculateNetPay(emp.grossSalary, emp.pensionRate, rate, {
    payeExempt:       emp.payeExempt,
    nssfApplicable:   emp.nssfApplicable,
    nssfEmployeeRate: emp.nssfEmployeeRate,
    nssfEmployerRate: emp.nssfEmployerRate,
  });

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white";

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/astelfin_26/astelfin/staff/${id}`}
            className="text-sm text-brand-muted hover:text-brand-gold transition-colors">
            &larr; Back to {emp.name}
          </Link>
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mt-3">Astelfin</p>
          <h1 className="text-2xl font-bold text-brand-navy mt-0.5">Edit Staff Profile</h1>
          <p className="text-brand-muted text-sm mt-1">{emp.name} · {emp.position}</p>
        </div>
      </div>

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

      {/* Salary preview */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Gross</p>
          <p className="text-lg font-bold text-brand-navy">{formatCurrency(emp.grossSalary, emp.currency)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">PAYE</p>
          <p className="text-lg font-bold text-orange-600">
            {emp.payeExempt ? "Exempt" : formatCurrency(calc.payeMWK, "MWK")}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Net Pay</p>
          <p className="text-lg font-bold text-emerald-600">{formatCurrency(calc.netPayMWK, "MWK")}</p>
        </div>
      </div>

      {/* ── Contract Details ─────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
        <h2 className="font-bold text-brand-navy text-sm uppercase tracking-wide">Contract Details</h2>
        <form action={updateAstelfinStaff} className="space-y-4">
          <input type="hidden" name="employeeId" value={emp.id} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Position / Job Title <span className="text-red-500">*</span>
              </label>
              <input name="position" required defaultValue={emp.position} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Level</label>
              <select name="level" defaultValue={emp.level ?? ""} className={inp}>
                <option value="">— Select Level —</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Employment Type</label>
              <select name="contractType" defaultValue={emp.contractType} className={inp}>
                {CONTRACT_TYPES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Gross Monthly Salary ({emp.currency})
              </label>
              <input name="grossSalary" type="number" min="0" step="0.01"
                defaultValue={emp.grossSalary} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contract Start Date</label>
              <input name="startDate" type="date"
                defaultValue={emp.startDate ? emp.startDate.toISOString().slice(0, 10) : ""}
                className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Contract End Date
                <span className="ml-1.5 font-normal text-gray-400">— blank for permanent</span>
              </label>
              <input name="endDate" type="date"
                defaultValue={emp.endDate ? emp.endDate.toISOString().slice(0, 10) : ""}
                className={inp} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Direct Supervisor</label>
              <select name="supervisorId" defaultValue={emp.supervisorId ?? ""} className={inp}>
                <option value="">— No supervisor —</option>
                {allActiveStaff.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}{e.position ? ` (${e.position})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Departments — select all that apply
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {DEPARTMENTS.map((d) => {
                  const checked = emp.departments.includes(d);
                  return (
                    <label key={d}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                        checked
                          ? "border-brand-gold bg-brand-gold/5 text-brand-navy font-medium"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}>
                      <input type="checkbox" name="departments" value={d} defaultChecked={checked}
                        className="accent-[var(--brand-gold,#c9a84c)] w-3.5 h-3.5 shrink-0" />
                      {d}
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Email Address</label>
              <input name="email" type="email" defaultValue={emp.email ?? ""} className={inp} />
            </div>
          </div>

          <button type="submit"
            className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            Save Contract Details
          </button>
        </form>
      </div>

      {/* ── Taxes & Benefits ─────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="font-bold text-brand-navy text-sm uppercase tracking-wide">Taxes &amp; Benefits</h2>
          <p className="text-xs text-gray-500 mt-1">Controls statutory deductions for this staff member.</p>
        </div>
        <form action={updateAstelfinTaxes} className="space-y-5">
          <input type="hidden" name="employeeId" value={emp.id} />

          {/* PAYE */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">PAYE</p>
            <div className="flex gap-3">
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${!emp.payeExempt ? "border-brand-navy bg-brand-navy/5 text-brand-navy font-semibold" : "border-gray-200 text-gray-500"}`}>
                <input type="radio" name="payeExempt" value="false" defaultChecked={!emp.payeExempt} className="accent-brand-navy" />
                Applies
              </label>
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${emp.payeExempt ? "border-amber-500 bg-amber-50 text-amber-700 font-semibold" : "border-gray-200 text-gray-500"}`}>
                <input type="radio" name="payeExempt" value="true" defaultChecked={emp.payeExempt} className="accent-amber-500" />
                Exempt
              </label>
            </div>
          </div>

          {/* Pension */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Pension</p>
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-gray-600 shrink-0">Employee contribution rate (%)</label>
              <input name="pensionRate" type="number" min="0" max="100" step="0.5"
                defaultValue={emp.pensionRate}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 max-w-[120px]" />
            </div>
            <p className="text-xs text-gray-400">Set to 0 to disable. Default is 5%.</p>
          </div>

          {/* NSSF */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">NSSF</p>
            <div className="flex gap-3">
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${emp.nssfApplicable ? "border-brand-navy bg-brand-navy/5 text-brand-navy font-semibold" : "border-gray-200 text-gray-500"}`}>
                <input type="radio" name="nssfApplicable" value="true" defaultChecked={emp.nssfApplicable} />
                Applicable
              </label>
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${!emp.nssfApplicable ? "border-gray-200 bg-gray-50 text-gray-600 font-medium" : "border-gray-200 text-gray-500"}`}>
                <input type="radio" name="nssfApplicable" value="false" defaultChecked={!emp.nssfApplicable} />
                Not applicable
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Employee rate (%)</label>
                <input name="nssfEmployeeRate" type="number" min="0" max="100" step="0.5"
                  defaultValue={emp.nssfEmployeeRate}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Employer rate (%)</label>
                <input name="nssfEmployerRate" type="number" min="0" max="100" step="0.5"
                  defaultValue={emp.nssfEmployerRate}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
              </div>
            </div>
          </div>

          <button type="submit"
            className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            Save Tax &amp; Benefit Settings
          </button>
        </form>
      </div>

    </div>
  );
}