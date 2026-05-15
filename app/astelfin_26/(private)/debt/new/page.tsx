import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { LAUNCH_DATE } from "@/lib/constants";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Record Debt | Astellic Finance",
  robots: { index: false, follow: false },
};

async function createDebt(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const data = {
    lender: formData.get("lender") as string,
    description: formData.get("description") as string,
    principal: parseFloat(formData.get("principal") as string),
    currency: (formData.get("currency") as string) || "MWK",
    interestRate: formData.get("interestRate")
      ? parseFloat(formData.get("interestRate") as string)
      : null,
    disbursedDate: new Date(formData.get("disbursedDate") as string),
    dueDate: (formData.get("dueDate") as string)
      ? new Date(formData.get("dueDate") as string)
      : null,
    status: "ACTIVE" as const,
    notes: (formData.get("notes") as string) || null,
  };

  const record = await prisma.debt.create({ data });
  await auditLog({
    userId: session.user.id,
    action: "CREATE",
    entity: "Debt",
    entityId: record.id,
    detail: `${data.lender} — ${data.currency} ${data.principal}`,
  });

  redirect("/astelfin_26/debt");
}

export default function NewDebtPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Record Debt</h1>
        <p className="text-gray-500 text-sm mt-1">Log a new loan or borrowing.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <form action={createDebt} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Lender / Creditor <span className="text-red-500">*</span>
              </label>
              <input
                name="lender"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="e.g. National Bank of Malawi, OECD Fund"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description / Purpose <span className="text-red-500">*</span>
              </label>
              <input
                name="description"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="e.g. Working capital loan for project mobilisation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Principal Amount <span className="text-red-500">*</span>
              </label>
              <input
                name="principal"
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
                Interest Rate (% p.a.)
              </label>
              <input
                name="interestRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="e.g. 12.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date Disbursed <span className="text-red-500">*</span>
              </label>
              <input
                name="disbursedDate"
                type="date"
                required
                min={LAUNCH_DATE}
                defaultValue={LAUNCH_DATE}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Repayment Due Date
              </label>
              <input
                name="dueDate"
                type="date"
                min={LAUNCH_DATE}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
              <textarea
                name="notes"
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="Collateral, conditions, repayment schedule details…"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Save Debt
            </button>
            <a
              href="/astelfin_26/debt"
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
