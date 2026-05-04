import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { redirect } from "next/navigation";
import EmployeeForm from "@/components/finance/EmployeeForm";

export const metadata = {
  title: "Add Employee | Astelfin IMS",
  robots: { index: false, follow: false },
};

async function createEmployee(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const currency   = (formData.get("currency") as string) || "MWK";
  const rateRaw    = formData.get("salaryExchangeRate") as string;
  const salaryExchangeRate =
    currency === "MWK" || !rateRaw
      ? null
      : parseFloat(rateRaw) || null;

  // Auto-generate employee number: AST-{joinYear}-{sequential within that year}
  const startDate  = new Date(formData.get("startDate") as string);
  const joinYear   = startDate.getFullYear();
  const countInYear = await prisma.employee.count({
    where: { employeeNumber: { startsWith: `AST-${joinYear}-` } },
  });
  const employeeNumber = `AST-${joinYear}-${String(countInYear + 1).padStart(3, "0")}`;

  const contractType         = (formData.get("contractType") as string) || "PERMANENT";
  const contractLengthRaw    = formData.get("contractLengthMonths") as string;
  const contractLengthMonths = contractLengthRaw ? parseInt(contractLengthRaw) || null : null;

  // Prefer the explicit end date from the form; fall back to computing from months
  const endDateRaw = formData.get("endDate") as string;
  let endDate: Date | null = null;
  if (endDateRaw) {
    endDate = new Date(endDateRaw);
  } else if (contractLengthMonths && contractLengthMonths > 0) {
    endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + contractLengthMonths);
  }

  const data = {
    employeeNumber,
    name:                formData.get("name") as string,
    email:               (formData.get("email") as string)  || null,
    position:            formData.get("position") as string,
    department:          (formData.get("department") as string) || null,
    contractType,
    contractLengthMonths,
    grossSalary:         parseFloat(formData.get("grossSalary") as string),
    currency,
    salaryExchangeRate,
    taxPin:              (formData.get("taxPin") as string)  || null,
    nssf:                (formData.get("nssf") as string)    || null,
    pensionRate:         parseFloat(formData.get("pensionRate") as string) || 5,
    startDate,
    endDate,
    notes:               (formData.get("notes") as string)   || null,
  };

  const record = await prisma.employee.create({ data });
  await auditLog({
    userId:   session.user.id,
    action:   "CREATE",
    entity:   "Employee",
    entityId: record.id,
    detail:   `${data.name} — ${data.position} (${employeeNumber})`,
  });

  // Redirect to detail page so CEO can assign a system user
  redirect(`/astelfin_26/employees/${record.id}`);
}

export default async function NewEmployeePage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Add Employee</h1>
        <p className="text-gray-500 text-sm mt-1">
          For foreign-currency salaries, enter the current MWK middle rate.
          Taxes and deductions are calculated on the MWK equivalent; net is converted back to the quoted currency.
        </p>
      </div>
      <EmployeeForm action={createEmployee} />
    </div>
  );
}
