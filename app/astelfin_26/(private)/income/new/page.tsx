import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { checkPeriodOpen } from "@/lib/period-lock";
import { getActiveOrgId, orgTag } from "@/lib/org";
import { LAUNCH_DATE } from "@/lib/constants";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Record Income | Astellic Finance",
  robots: { index: false, follow: false },
};

async function createIncome(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const receivedDate = new Date(formData.get("receivedDate") as string);
  const periodCheck  = await checkPeriodOpen(receivedDate);
  if (!periodCheck.open) redirect(`/astelfin_26/income/new?error=period_closed&period=${periodCheck.periodKey}`);

  const activeOrgId = await getActiveOrgId(session);

  const data = {
    incomeType: (formData.get("incomeType") as "GRANT" | "PRIVATE_SERVICE" | "DONATION") || "GRANT",
    description: formData.get("description") as string,
    amount: parseFloat(formData.get("amount") as string),
    currency: (formData.get("currency") as string) || "MWK",
    receivedDate,
    source: (formData.get("source") as string) || null,
    invoiceNumber: (formData.get("invoiceNumber") as string) || null,
    projectId: (formData.get("projectId") as string) || null,
    grantId: (formData.get("grantId") as string) || null,
    notes: (formData.get("notes") as string) || null,
    ...orgTag(activeOrgId),
  };

  const record = await prisma.income.create({ data });
  await auditLog({
    userId: session.user.id,
    action: "CREATE",
    entity: "Income",
    entityId: record.id,
    detail: `${data.description} — ${data.currency} ${data.amount}`,
  });

  redirect("/astelfin_26/income");
}

export default async function NewIncomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; period?: string }>;
}) {
  const { error, period } = await searchParams;
  const [projects, grants] = await Promise.all([
    prisma.project.findMany({ where: { status: "ACTIVE" }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.donorGrant.findMany({ where: { status: "ACTIVE" }, select: { id: true, name: true, donorName: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Record Income</h1>
        <p className="text-gray-500 text-sm mt-1">Add a new income entry.</p>
      </div>

      {error === "period_closed" && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          ⚠ The period <strong>{period}</strong> is closed or locked. No new entries may be dated within that month.
          Contact the Finance Manager or CEO to reopen the period if this was an error.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <form action={createIncome} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Income Type <span className="text-red-500">*</span>
              </label>
              <select
                name="incomeType"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="GRANT">Grant</option>
                <option value="PRIVATE_SERVICE">Private Service</option>
                <option value="DONATION">Donation</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                name="description"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="e.g. Q1 consulting fee — Health Systems project"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Currency
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date Received <span className="text-red-500">*</span>
              </label>
              <input
                name="receivedDate"
                type="date"
                required
                min={LAUNCH_DATE}
                defaultValue={LAUNCH_DATE}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Project (optional)
              </label>
              <select
                name="projectId"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="">— No project —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Donor Grant (optional)
              </label>
              <select name="grantId"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
                <option value="">— Not linked to a grant —</option>
                {grants.map((g) => (
                  <option key={g.id} value={g.id}>{g.name} ({g.donorName})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Source / Funder
              </label>
              <input
                name="source"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="e.g. USAID, World Bank"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Invoice / Reference No.
              </label>
              <input
                name="invoiceNumber"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="INV-001"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="Any additional notes…"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Save Income
            </button>
            <a
              href="/astelfin_26/income"
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
