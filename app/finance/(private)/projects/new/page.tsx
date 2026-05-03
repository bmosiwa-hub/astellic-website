import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Add Project | Astellic Finance",
  robots: { index: false, follow: false },
};

async function createProject(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/finance/login");

  const data = {
    name: formData.get("name") as string,
    client: formData.get("client") as string,
    description: (formData.get("description") as string) || null,
    status: (formData.get("status") as "ACTIVE") || "ACTIVE",
    startDate: new Date(formData.get("startDate") as string),
    endDate: (formData.get("endDate") as string)
      ? new Date(formData.get("endDate") as string)
      : null,
    budget: formData.get("budget")
      ? parseFloat(formData.get("budget") as string)
      : null,
    currency: (formData.get("currency") as string) || "MWK",
  };

  const record = await prisma.project.create({ data });
  await auditLog({
    userId: session.user.id,
    action: "CREATE",
    entity: "Project",
    entityId: record.id,
    detail: `${data.name} — ${data.client}`,
  });

  redirect("/finance/projects");
}

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Add Project</h1>
        <p className="text-gray-500 text-sm mt-1">Register a new project or engagement.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <form action={createProject} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="e.g. Health Systems Strengthening — Phase II"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Client / Funder <span className="text-red-500">*</span>
              </label>
              <input
                name="client"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="e.g. Ministry of Health, UNICEF"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                name="description"
                rows={3}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
              <input
                name="endDate"
                type="date"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget</label>
              <input
                name="budget"
                type="number"
                step="0.01"
                min="0"
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
                <option value="MWK">MWK — Malawian Kwacha</option>
                <option value="USD">USD — US Dollar</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="EUR">EUR — Euro</option>
                <option value="ZAR">ZAR — South African Rand</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                name="status"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Save Project
            </button>
            <a
              href="/finance/projects"
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
