import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createAccountPayable } from "@/lib/recurring-actions";
import { LAUNCH_DATE } from "@/lib/constants";

export const metadata = {
  title: "New Payable | Astellic Finance",
  robots: { index: false, follow: false },
};

export default async function NewPayablePage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-navy">Add Payable</h1>
        <Link href="/astelfin_26/payables" className="text-sm text-brand-gold hover:underline font-semibold">
          ← Back
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form action={createAccountPayable} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              name="description" required
              placeholder="What is this payment for?"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Vendor / Payee</label>
              <input
                name="vendor"
                placeholder="Who is being paid?"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Budget Line</label>
              <input
                name="budgetLine"
                placeholder="e.g. Admin, Project…"
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
                name="currency" defaultValue="MWK"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                {["MWK", "USD", "EUR", "GBP", "ZAR"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                name="dueDate" type="date" required
                min={LAUNCH_DATE}
                defaultValue={LAUNCH_DATE}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Note</label>
              <input
                name="note"
                placeholder="Any reference or note…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/astelfin_26/payables"
              className="px-5 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Add Payable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
