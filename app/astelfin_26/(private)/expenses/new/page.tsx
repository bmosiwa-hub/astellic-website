import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { checkPeriodOpen } from "@/lib/period-lock";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Record Expense | Astellic Finance",
  robots: { index: false, follow: false },
};

const CATEGORIES = [
  "Travel", "Accommodation", "Meals", "Equipment", "Software",
  "Printing", "Communications", "Subcontracting", "Professional Fees",
  "Office Supplies", "Bank Charges", "Other",
];

async function createExpense(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const paidDate    = new Date(formData.get("paidDate") as string);
  const periodCheck = await checkPeriodOpen(paidDate);
  if (!periodCheck.open) redirect(`/astelfin_26/expenses/new?error=period_closed&period=${periodCheck.periodKey}`);

  const data = {
    description: formData.get("description") as string,
    amount: parseFloat(formData.get("amount") as string),
    currency: (formData.get("currency") as string) || "MWK",
    category: formData.get("category") as string,
    paidDate,
    vendor: (formData.get("vendor") as string) || null,
    receiptRef: (formData.get("receiptRef") as string) || null,
    projectId: (formData.get("projectId") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };

  const record = await prisma.expense.create({ data });
  await auditLog({
    userId: session.user.id,
    action: "CREATE",
    entity: "Expense",
    entityId: record.id,
    detail: `${data.description} — ${data.currency} ${data.amount}`,
  });

  redirect("/astelfin_26/expenses");
}

export default async function NewExpensePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; period?: string }>;
}) {
  const { error, period } = await searchParams;
  const projects = await prisma.project.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Record Expense</h1>
        <p className="text-gray-500 text-sm mt-1">Add a new expense entry.</p>
      </div>

      {error === "period_closed" && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          ⚠ The period <strong>{period}</strong> is closed or locked. No new entries may be dated within that month.
          Contact the Finance Manager or CEO to reopen the period if this was an error.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <form action={createExpense} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                name="description"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="e.g. Field travel to Lilongwe"
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="">— Select category —</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date Paid <span className="text-red-500">*</span>
              </label>
              <input
                name="paidDate"
                type="date"
                required
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
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Vendor / Supplier</label>
              <input
                name="vendor"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="e.g. Shoprite Malawi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Receipt / Ref No.</label>
              <input
                name="receiptRef"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="REC-001"
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
              Save Expense
            </button>
            <a
              href="/astelfin_26/expenses"
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
