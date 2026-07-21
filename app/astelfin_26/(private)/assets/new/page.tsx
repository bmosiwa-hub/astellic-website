import { auth } from "@/auth";
import { resolveAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Add Asset | Astelfin IMS",
  robots: { index: false, follow: false },
};

const CATEGORIES = [
  { value: "FURNITURE",        label: "Furniture" },
  { value: "IT_EQUIPMENT",     label: "IT Equipment" },
  { value: "MOTOR_VEHICLE",    label: "Motor Vehicle" },
  { value: "OFFICE_EQUIPMENT", label: "Office Equipment" },
  { value: "LAND_BUILDING",    label: "Land & Building" },
  { value: "OTHER",            label: "Other" },
];

const CONDITIONS = [
  { value: "EXCELLENT",   label: "Excellent" },
  { value: "GOOD",        label: "Good" },
  { value: "FAIR",        label: "Fair" },
  { value: "POOR",        label: "Poor" },
  { value: "WRITTEN_OFF", label: "Written Off" },
];

const CURRENCIES = ["MWK", "USD", "GBP", "EUR", "ZAR"];

async function addAsset(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const access = await resolveAccess(session);
  if (!access || !access.can("canManageAssets")) redirect("/astelfin_26/my");

  const name         = formData.get("name") as string;
  const category     = formData.get("category") as string;
  const description  = (formData.get("description") as string) || null;
  const serialNumber = (formData.get("serialNumber") as string) || null;
  const location     = (formData.get("location") as string) || null;
  const condition    = formData.get("condition") as string;
  const purchaseDate = formData.get("purchaseDate") as string;
  const purchasePriceRaw = formData.get("purchasePrice") as string;
  const currency     = (formData.get("currency") as string) || "MWK";
  const supplier     = (formData.get("supplier") as string) || null;
  const insurable    = formData.get("insurable") === "true";
  const notes        = (formData.get("notes") as string) || null;

  // Auto-generate asset number: A-XXXX
  // Use MAX of existing numbers to avoid gaps/collisions if assets are deleted or created concurrently.
  const latest = await prisma.asset.findFirst({
    where:   { assetNumber: { startsWith: "A-" } },
    orderBy: { assetNumber: "desc" },
    select:  { assetNumber: true },
  });
  const lastNum    = latest?.assetNumber ? parseInt(latest.assetNumber.replace("A-", ""), 10) : 0;
  const assetNumber = `A-${String((isNaN(lastNum) ? 0 : lastNum) + 1).padStart(4, "0")}`;

  const asset = await prisma.asset.create({
    data: {
      assetNumber,
      name,
      category,
      description,
      serialNumber,
      location,
      condition,
      purchaseDate:  purchaseDate ? new Date(purchaseDate) : null,
      purchasePrice: purchasePriceRaw ? parseFloat(purchasePriceRaw) : null,
      currency,
      supplier,
      insurable,
      notes,
    },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "CREATE",
    entity:   "Asset",
    entityId: asset.id,
    detail:   `Asset registered: ${name} (${assetNumber})`,
  });

  redirect(`/astelfin_26/assets/${asset.id}?success=created`);
}

export default async function NewAssetPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/astelfin_26/assets"
          className="text-gray-400 hover:text-brand-navy transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Add Asset</h1>
          <p className="text-gray-500 text-sm mt-0.5">Register a new asset to the company register.</p>
        </div>
      </div>

      <form action={addAsset} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-brand-navy">Asset Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Asset Name <span className="text-red-500">*</span>
              </label>
              <input name="name" required placeholder="e.g. Dell Latitude 5540 Laptop"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select name="category" required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white">
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Condition <span className="text-red-500">*</span>
              </label>
              <select name="condition" required defaultValue="GOOD"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white">
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Serial / Reg. Number</label>
              <input name="serialNumber" placeholder="e.g. SN-ABC123 or KF-1234"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
              <input name="location" placeholder="e.g. Head Office, Store Room"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea name="description" rows={2} placeholder="Optional details about the asset…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 resize-none" />
            </div>
          </div>
        </div>

        {/* Purchase Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-brand-navy">Purchase Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Purchase Date</label>
              <input name="purchaseDate" type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Supplier / Vendor</label>
              <input name="supplier" placeholder="e.g. Compu-Tech Malawi"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Purchase Price</label>
              <input name="purchasePrice" type="number" min="0" step="0.01" placeholder="0.00"
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
        </div>

        {/* Insurance & Notes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-brand-navy">Insurance &amp; Notes</h2>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Does this asset require insurance?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="insurable" value="true" className="accent-brand-gold" />
                Yes — insurable
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="insurable" value="false" defaultChecked className="accent-brand-gold" />
                No — not insurable
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Internal Notes</label>
            <textarea name="notes" rows={3} placeholder="Any additional notes about this asset…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 resize-none" />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit"
            className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            Register Asset
          </button>
          <Link href="/astelfin_26/assets"
            className="px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
