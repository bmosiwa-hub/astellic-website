import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createRecurringExpense } from "@/lib/recurring-actions";

export const metadata = {
  title: "New Recurring Expense | Astellic Finance",
  robots: { index: false, follow: false },
};

const FREQUENCIES = [
  { value: "WEEKLY",      label: "Weekly" },
  { value: "FORTNIGHTLY", label: "Fortnightly" },
  { value: "MONTHLY",     label: "Monthly" },
  { value: "QUARTERLY",   label: "Quarterly" },
  { value: "SEMI_ANNUAL", label: "Semi-annual (every 6 months)" },
  { value: "ANNUAL",      label: "Annual" },
];

export default async function NewRecurringExpensePage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-navy">New Recurring Expense</h1>
        <Link href="/astelfin_26/recurring" className="text-sm text-brand-gold hover:underline font-semibold">
          ← Back
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form action={createRecurringExpense} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Name / Description <span className="text-red-500">*</span>
              </label>
              <input
                name="name" required
                placeholder="e.g. Office Rent, Internet Subscription…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Vendor / Payee</label>
              <input
                name="vendor"
                placeholder="e.g. Skyband, Landlord…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <input
                name="category"
                placeholder="e.g. Utilities, Rent, Subscriptions…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                name="amount" type="number" step="0.01" min="0" required
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Currency</label>
              <select
                name="currency"
                defaultValue="MWK"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                {["MWK", "USD", "EUR", "GBP", "ZAR"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Frequency <span className="text-red-500">*</span>
              </label>
              <select
                name="frequency" required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="">Select frequency…</option>
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Budget Line</label>
              <input
                name="budgetLine"
                placeholder="e.g. Admin, Project XYZ…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                First Payment Date <span className="text-red-500">*</span>
              </label>
              <input
                name="startDate" type="date" required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                End Date{" "}
                <span className="text-gray-400 font-normal">(leave blank for ongoing)</span>
              </label>
              <input
                name="endDate" type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
              <textarea
                name="description" rows={2}
                placeholder="Any additional notes…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold resize-none"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Payment entries will be automatically generated in Accounts Payable for each due date.
            Finance Manager will receive a reminder email 7 days before each payment.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/astelfin_26/recurring"
              className="px-5 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Create Recurring Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
