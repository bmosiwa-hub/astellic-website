import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { getAstelfinOrg } from "@/lib/astelfin-org";
import EmployeeForm from "@/components/finance/EmployeeForm";

export const metadata = {
  title: "Add Staff | Astelfin",
  robots: { index: false, follow: false },
};

async function createAstelfinEmployee(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const org = await prisma.organisation.findFirst({ where: { shortCode: "ASTELFIN", active: true } });

  const currency = (formData.get("currency") as string) || "MWK";
  const rateRaw  = formData.get("salaryExchangeRate") as string;
  const salaryExchangeRate = currency === "MWK" || !rateRaw ? null : parseFloat(rateRaw) || null;

  const startDate   = new Date(formData.get("startDate") as string);
  const joinYear    = startDate.getFullYear();
  const prefix      = `ASF-${joinYear}-`;
  const countInYear = await prisma.employee.count({ where: { employeeNumber: { startsWith: prefix } } });
  const employeeNumber = `${prefix}${String(countInYear + 1).padStart(3, "0")}`;

  const contractType = (formData.get("contractType") as string) || "PERMANENT";
  const endDateRaw   = formData.get("endDate") as string;
  const endDate      = endDateRaw ? new Date(endDateRaw) : null;
  const departments  = formData.getAll("departments").map(String).filter(Boolean);
  const supervisorIdRaw = formData.get("supervisorId") as string;

  const data = {
    employeeNumber,
    organisationId:    org?.id ?? null,
    name:              formData.get("name") as string,
    email:             (formData.get("email") as string)    || null,
    position:          formData.get("position") as string,
    level:             (formData.get("level") as string)    || null,
    departments,
    contractType,
    grossSalary:       parseFloat(formData.get("grossSalary") as string),
    currency,
    salaryExchangeRate,
    taxPin:            (formData.get("taxPin") as string)   || null,
    nssf:              (formData.get("nssf") as string)     || null,
    pensionRate:       parseFloat(formData.get("pensionRate") as string) || 5,
    startDate,
    endDate,
    notes:             (formData.get("notes") as string)    || null,
    supervisorId:      supervisorIdRaw || null,
  };

  const record = await prisma.employee.create({ data });
  await auditLog({
    userId:   session.user.id!,
    action:   "CREATE",
    entity:   "Employee",
    entityId: record.id,
    detail:   `Astelfin: ${data.name} — ${data.position} (${employeeNumber})`,
  });

  redirect(`/astelfin_26/astelfin/staff/${record.id}`);
}

export default async function AstelfinStaffNewPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO" && session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/home");

  const org = await getAstelfinOrg();

  const supervisors = await prisma.employee.findMany({
    where:   { organisationId: org?.id, active: true },
    orderBy: { name: "asc" },
    select:  { id: true, name: true, position: true },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em]">Astelfin</p>
        <h1 className="text-2xl font-bold text-brand-navy mt-1">Add Staff Member</h1>
        <p className="text-brand-muted text-sm mt-1">
          This staff member will be assigned to the Astelfin organisation.
        </p>
      </div>
      <EmployeeForm action={createAstelfinEmployee} supervisors={supervisors} />
    </div>
  );
}
