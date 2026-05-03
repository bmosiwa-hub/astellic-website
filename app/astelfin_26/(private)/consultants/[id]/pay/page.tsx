import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { calculateWithholding, formatCurrency } from "@/lib/finance-utils";
import { redirect, notFound } from "next/navigation";

export const metadata = {
  title: "Record Consultant Payment | Astellic Finance",
  robots: { index: false, follow: false },
};

async function createPayment(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const consultantId = formData.get("consultantId") as string;
  const grossAmount = parseFloat(formData.get("grossAmount") as string);
  const whtRate = parseFloat((formData.get("whtRate") as string) || "0.2");
  const { withholdingTax, netAmount } = calculateWithholding(grossAmount, whtRate);

  const data = {
    consultantId,
    projectId: (formData.get("projectId") as string) || null,
    description: formData.get("description") as string,
    daysWorked: formData.get("daysWorked") ? parseFloat(formData.get("daysWorked") as string) : null,
    rateUsed: formData.get("rateUsed") ? parseFloat(formData.get("rateUsed") as string) : null,
    grossAmount,
    withholdingTax,
    netAmount,
    currency: (formData.get("currency") as string) || "MWK",
    paidDate: formData.get("paidDate") ? new Date(formData.get("paidDate") as string) : null,
    status: (formData.get("status") as "PENDING" | "PAID") || "PENDING",
    notes: (formData.get("notes") as string) || null,
  };

  const record = await prisma.consultantPayment.create({ data });
  await auditLog({
    userId: session.user.id,
    action: "CREATE",
    entity: "ConsultantPayment",
    entityId: record.id,
    detail: `${data.description} — Gross ${data.currency} ${grossAmount}, WHT ${withholdingTax}, Net ${netAmount}`,
  });

  redirect("/astelfin_26/consultants");
}

export default async function PayConsultantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [consultant, projects] = await Promise.all([
    prisma.consultant.findUnique({ where: { id } }),
    prisma.project.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!consultant) notFound();

  // Default WHT preview (20%)
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Record Payment</h1>
        <p className="text-gray-500 text-sm mt-1">
          Consultant: <span className="font-semibold text-brand-navy">{consultant.name}</span>
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <form action={createPayment} className="space-y-5">
          <input type="hidden" name="consultantId" value={consultant.id} />

          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                name="description"
                required
                defaultValue={`Consultancy fee — ${consultant.name}`}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Days Worked</label>
              <input
                name="daysWorked"
                type="number"
                step="0.5"
                min="0"
                defaultValue={consultant.dailyRate ? "" : ""}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rate Used</label>
              <input
                name="rateUsed"
                type="number"
                step="0.01"
                min="0"
                defaultValue={consultant.dailyRate ?? ""}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Gross Amount <span className="text-red-500">*</span>
              </label>
              <input
                name="grossAmount"
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
                WHT Rate
              </label>
              <select
                name="whtRate"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="0.20">20% (resident)</option>
                <option value="0.15">15% (non-resident)</option>
                <option value="0.10">10% (other)</option>
                <option value="0">0% (exempt)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
              <select
                name="currency"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="MWK">MWK</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Project</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Paid</label>
              <input
                name="paidDate"
                type="date"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                name="status"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partial</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
              <textarea
                name="notes"
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
          </div>

          <div className="bg-brand-light rounded-xl p-4 text-sm text-brand-navy">
            <p className="font-semibold mb-1">Tax Preview (20% WHT default)</p>
            <p className="text-gray-500">
              Withholding tax and net amount are calculated automatically from the gross amount and WHT rate selected.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Save Payment
            </button>
            <a
              href="/astelfin_26/consultants"
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
