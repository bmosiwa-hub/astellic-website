import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Add Employee | Astellic Finance",
  robots: { index: false, follow: false },
};

async function createEmployee(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/finance/login");

  const data = {
    name: formData.get("name") as string,
    email: (formData.get("email") as string) || null,
    position: formData.get("position") as string,
    department: (formData.get("department") as string) || null,
    grossSalary: parseFloat(formData.get("grossSalary") as string),
    currency: (formData.get("currency") as string) || "MWK",
    taxPin: (formData.get("taxPin") as string) || null,
    nssf: (formData.get("nssf") as string) || null,
    startDate: new Date(formData.get("startDate") as string),
    notes: (formData.get("notes") as string) || null,
  };

  const record = await prisma.employee.create({ data });
  await auditLog({
    userId: session.user.id,
    action: "CREATE",
    entity: "Employee",
    entityId: record.id,
    detail: `${data.name} — ${data.position}`,
  });

  redirect("/finance/employees");
}

export default function NewEmployeePage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Add Employee</h1>
        <p className="text-gray-500 text-sm mt-1">Register a new employee.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <form action={createEmployee} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Position <span className="text-red-500">*</span>
              </label>
              <input
                name="position"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
              <input
                name="department"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Gross Monthly Salary <span className="text-red-500">*</span>
              </label>
              <input
                name="grossSalary"
                type="number"
                step="0.01"
                min="0"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
              <select
                name="currency"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="MWK">MWK</option>
                <option value="USD">USD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">MRA Tax PIN</label>
              <input
                name="taxPin"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">NSSF No.</label>
              <input
                name="nssf"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                name="startDate"
                type="date"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
              <textarea
                name="notes"
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Save Employee
            </button>
            <a
              href="/finance/employees"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
