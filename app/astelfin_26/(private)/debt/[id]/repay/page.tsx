import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { formatCurrency } from "@/lib/finance-utils";
import { redirect, notFound } from "next/navigation";

export const metadata = {
  title: "Record Repayment | Astellic Finance",
  robots: { index: false, follow: false },
};

async function createRepayment(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const debtId = formData.get("debtId") as string;
  const amount = parseFloat(formData.get("amount") as string);

  const repayment = await prisma.debtRepayment.create({
    data: {
      debtId,
      amount,
      currency: (formData.get("currency") as string) || "MWK",
      paidDate: new Date(formData.get("paidDate") as string),
      notes: (formData.get("notes") as string) || null,
    },
  });

  // Check if fully repaid and auto-update status
  const debt = await prisma.debt.findUnique({
    where: { id: debtId },
    include: { repayments: { select: { amount: true } } },
  });
  if (debt) {
    const totalRepaid = debt.repayments.reduce((s: number, r) => s + r.amount, 0);
    if (totalRepaid >= debt.principal) {
      await prisma.debt.update({ where: { id: debtId }, data: { status: "PAID_OFF" } });
    }
  }

  await auditLog({
    userId: session.user.id,
    action: "CREATE",
    entity: "DebtRepayment",
    entityId: repayment.id,
    detail: `Repayment of ${amount} on debt ${debtId}`,
  });

  redirect("/astelfin_26/debt");
}

export default async function RepayDebtPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const debt = await prisma.debt.findUnique({
    where: { id },
    include: { repayments: { select: { amount: true } } },
  });

  if (!debt) notFound();

  const totalRepaid = debt.repayments.reduce((s: number, r) => s + r.amount, 0);
  const outstanding = Math.max(0, debt.principal - totalRepaid);

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Record Repayment</h1>
        <p className="text-gray-500 text-sm mt-1">
          Loan from <span className="font-semibold text-brand-navy">{debt.lender}</span>
        </p>
      </div>

      {/* Debt summary */}
      <div className="bg-brand-light rounded-xl p-4 mb-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-500 mb-1">Principal</p>
          <p className="font-bold text-brand-navy">{formatCurrency(debt.principal, debt.currency)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Repaid</p>
          <p className="font-bold text-green-600">{formatCurrency(totalRepaid, debt.currency)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Outstanding</p>
          <p className="font-bold text-orange-600">{formatCurrency(outstanding, debt.currency)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <form action={createRepayment} className="space-y-5">
          <input type="hidden" name="debtId" value={debt.id} />

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Amount Paid <span className="text-red-500">*</span>
              </label>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                max={outstanding}
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
              <select
                name="currency"
                defaultValue={debt.currency}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="MWK">MWK</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div className="col-span-2">
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

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
              <textarea
                name="notes"
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="Reference number, bank details…"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400">
            If this payment clears the outstanding balance, the debt will automatically be marked as Paid Off.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Save Repayment
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
