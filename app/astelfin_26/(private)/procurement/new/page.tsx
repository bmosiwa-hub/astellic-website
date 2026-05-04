import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "New Procurement Request | Astelfin IMS",
  robots: { index: false, follow: false },
};

const CATEGORIES = [
  "Office Supplies",
  "IT Equipment",
  "Furniture",
  "Vehicle",
  "Field Equipment",
  "Training & Capacity Building",
  "Consultancy Services",
  "Printing & Publications",
  "Travel & Logistics",
  "Maintenance & Repairs",
  "Other",
];

const CURRENCIES = ["MWK", "USD", "GBP", "EUR", "ZAR"];

async function createDraft(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  const title         = formData.get("title") as string;
  const description   = (formData.get("description") as string) || null;
  const category      = (formData.get("category") as string) || null;
  const estimatedCost = parseFloat(formData.get("estimatedCost") as string);
  const currency      = (formData.get("currency") as string) || "MWK";

  const procurement = await prisma.procurement.create({
    data: {
      title,
      description,
      category,
      estimatedCost,
      currency,
      requestedBy: session.user.id!,
      status: "DRAFT",
    },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "CREATE",
    entity:   "Procurement",
    entityId: procurement.id,
    detail:   `Procurement draft created: ${title}`,
  });

  redirect(`/astelfin_26/procurement/${procurement.id}?success=created`);
}

export default async function NewProcurementPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  // Only FM can create requests
  if (session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/procurement");

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/astelfin_26/procurement"
          className="text-gray-400 hover:text-brand-navy transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">New Procurement Request</h1>
          <p className="text-gray-500 text-sm mt-0.5">Requests ≥ MWK 100,000 require three quotations before CEO review.</p>
        </div>
      </div>

      <form action={createDraft} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input name="title" required placeholder="e.g. Procurement of Laptops for Project Team"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select name="category"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white">
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              {/* spacer */}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Estimated Cost <span className="text-red-500">*</span>
              </label>
              <input name="estimatedCost" type="number" required min="0" step="0.01" placeholder="0.00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
              <select name="currency" defaultValue="MWK"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white">
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description / Justification</label>
            <textarea name="description" rows={4}
              placeholder="Describe what is being procured and why it is needed…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 resize-none" />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
          <strong>Note:</strong> After saving, you will be able to add supplier quotations. Requests ≥ MWK 100,000 require
          at least 3 quotations before they can be submitted for CEO approval.
        </div>

        <div className="flex gap-3">
          <button type="submit"
            className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            Save as Draft
          </button>
          <Link href="/astelfin_26/procurement"
            className="px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
