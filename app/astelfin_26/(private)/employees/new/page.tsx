import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { redirect } from "next/navigation";
import EmployeeForm from "@/components/finance/EmployeeForm";

export const metadata = {
  title: "Add Employee | Astelfin",
  robots: { index: false, follow: false },
};

async function createEmployee(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const data = {
    name:        formData.get("name") as string,
    email:       (formData.get("email") as string)      || null,
    position:    formData.get("position") as string,
    department:  (formData.get("department") as string) || null,
    grossSalary: parseFloat(formData.get("grossSalary") as string),
    currency:    (formData.get("currency") as string)   || "MWK",
    taxPin:      (formData.get("taxPin") as string)     || null,
    nssf:        (formData.get("nssf") as string)       || null,
    pensionRate: parseFloat(formData.get("pensionRate") as string) || 5,
    startDate:   new Date(formData.get("startDate") as string),
    notes:       (formData.get("notes") as string)      || null,
  };

  const record = await prisma.employee.create({ data });
  await auditLog({
    userId: session.user.id,
    action: "CREATE",
    entity: "Employee",
    entityId: record.id,
    detail: `${data.name} — ${data.position}`,
  });

  redirect("/astelfin_26/employees");
}

export default function NewEmployeePage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Add Employee</h1>
        <p className="text-gray-500 text-sm mt-1">Register a new employee and calculate their net salary.</p>
      </div>
      <EmployeeForm action={createEmployee} />
    </div>
  );
}
