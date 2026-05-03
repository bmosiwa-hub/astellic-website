import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Edit Expense | Astellic Finance",
  robots: { index: false, follow: false },
};

async function submitEditRequest(expenseId: string, formData: FormData): Promise<void> {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const record = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!record) redirect("/astelfin_26/expenses");

  const proposed = {
    description: formData.get("description") as string,
    amount: parseFloat(formData.get("amount") as string),
    currency: formData.get("currency") as string,
    category: formData.get("category") as string,
    paidDate: formData.get("paidDate") as string,
    vendor: (formData.get("vendor") as string) || null,
    receiptRef: (formData.get("receiptRef") as string) || null,
    projectId: (formData.get("projectId") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };

  if (session.user.role === "CEO") {
    await prisma.expense.update({
      where: { id: expenseId },
      data: {
        description: proposed.description,
        amount: proposed.amount,
        currency: proposed.currency,
        category: proposed.category,
        paidDate: new Date(proposed.paidDate),
        vendor: proposed.vendor,
        receiptRef: proposed.receiptRef,
        projectId: proposed.projectId,
        notes: proposed.notes,
      },
    });
    await auditLog({
      userId: session.user.id!,
      action: "UPDATE",
      entity: "Expense",
      entityId: expenseId,
      detail: `${proposed.description} — ${proposed.currency} ${proposed.amount}`,
    });
    redirect("/astelfin_26/expenses");
  } else {
    const existing = await prisma.pendingChange.findFirst({
      where: { entityId: expenseId, entity: "Expense", status: "PENDING" },
    });
    if (existing) redirect("/astelfin_26/expenses?error=already_pending");

    const snapshot = { ...record } as object;
    await prisma.pendingChange.create({
      data: {
        entity: "Expense",
        entityId: expenseId,
        changeType: "EDIT",
        requestedBy: session.user.id!,
        snapshot,
        proposed: proposed as object,
      },
    });
    await auditLog({
      userId: session.user.id!,
      action: "REQUEST_EDIT",
      entity: "Expense",
      entityId: expenseId,
      detail: `Edit request — ${proposed.description} — ${proposed.currency} ${proposed.amount}`,
    });
    redirect("/astelfin_26/expenses?edit_requested=1");
  }
}

const CATEGORIES = [
  "Travel", "Accommodation", "Meals", "Equipment", "Software",
  "Printing", "Communications", "Subcontracting", "Professional Fees",
  "Office Supplies", "Bank Charges", "Other",
];

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const [record, projects, existingPending] = await Promise.all([
    prisma.expense.findUnique({
      where: { id },
      include: { project: { select: { name: true } } },
    }),
    prisma.project.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.pendingChange.findFirst({
      where: { entityId: id, entity: "Expense", status: "PENDING" },
      include: { requester: { select: { name: true } } },
    }),
  ]);

  if (!record) notFound();

  const action = submitEditRequest.bind(null, id);
  const paidDateStr = new Date(record.paidDate).toISOString().split("T")[0];
  const isCEO = session.user.role === "CEO";

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Edit Expense</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isCEO
              ? "As Executive Director, your changes apply immediately."
              : "Your changes will be sent to the Executive Director for approval."}
          </p>
        </div>
        <Link
          href="/astelfin_26/expenses"
          className="text-sm text-brand-gold hover:underline font-semibold"
        >
          ← Back
        </Link>
      </div>

      {existingPending && (
        <div className="mb-5 bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 text-sm text-orange-800">
          <strong>A change request is already pending for this record</strong>
          {existingPending.requester?.name
            ? ` (requested by ${existingPending.requester.name})`
            : ""}
          . Please wait for the Executive Director to review it before submitting another.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <form action={action} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                name="description"
                required
                defaultValue={record.description}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
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
                defaultValue={record.amount}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
              <select
                name="currency"
                defaultValue={record.currency}
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
                defaultValue={record.category}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
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
                defaultValue={paidDateStr}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Project (optional)
              </label>
              <select
                name="projectId"
                defaultValue={record.projectId ?? ""}
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Vendor</label>
              <input
                name="vendor"
                defaultValue={record.vendor ?? ""}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Receipt Ref.</label>
              <input
                name="receiptRef"
                defaultValue={record.receiptRef ?? ""}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
              <textarea
                name="notes"
                rows={3}
                defaultValue={record.notes ?? ""}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!!existingPending && !isCEO}
              className="bg-brand-gold hover:bg-brand-gold/90 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              {isCEO ? "Save Changes" : "Submit for Approval"}
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
