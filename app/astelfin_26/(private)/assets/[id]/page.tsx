import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Asset Detail | Astelfin IMS",
  robots: { index: false, follow: false },
};

const CATEGORIES: Record<string, string> = {
  FURNITURE:        "Furniture",
  IT_EQUIPMENT:     "IT Equipment",
  MOTOR_VEHICLE:    "Motor Vehicle",
  OFFICE_EQUIPMENT: "Office Equipment",
  LAND_BUILDING:    "Land & Building",
  OTHER:            "Other",
};

const CONDITIONS = [
  { value: "EXCELLENT",   label: "Excellent" },
  { value: "GOOD",        label: "Good" },
  { value: "FAIR",        label: "Fair" },
  { value: "POOR",        label: "Poor" },
  { value: "WRITTEN_OFF", label: "Written Off" },
];

const CONDITION_COLORS: Record<string, string> = {
  EXCELLENT:   "bg-green-100 text-green-700",
  GOOD:        "bg-blue-100 text-blue-700",
  FAIR:        "bg-yellow-100 text-yellow-700",
  POOR:        "bg-orange-100 text-orange-700",
  WRITTEN_OFF: "bg-gray-100 text-gray-500",
};

const CATEGORIES_LIST = [
  { value: "FURNITURE",        label: "Furniture" },
  { value: "IT_EQUIPMENT",     label: "IT Equipment" },
  { value: "MOTOR_VEHICLE",    label: "Motor Vehicle" },
  { value: "OFFICE_EQUIPMENT", label: "Office Equipment" },
  { value: "LAND_BUILDING",    label: "Land & Building" },
  { value: "OTHER",            label: "Other" },
];

const CURRENCIES = ["MWK", "USD", "GBP", "EUR", "ZAR"];

// ── Server Actions ────────────────────────────────────────────────────────────

async function updateAsset(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;

  const id           = formData.get("assetId") as string;
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

  await prisma.asset.update({
    where: { id },
    data: {
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
    action:   "UPDATE",
    entity:   "Asset",
    entityId: id,
    detail:   `Asset updated: ${name}`,
  });

  redirect(`/astelfin_26/assets/${id}?success=updated`);
}

async function deactivateAsset(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const id = formData.get("assetId") as string;
  const asset = await prisma.asset.findUnique({ where: { id }, select: { name: true } });

  await prisma.asset.update({ where: { id }, data: { active: false } });

  await auditLog({
    userId:   session.user.id!,
    action:   "DEACTIVATE",
    entity:   "Asset",
    entityId: id,
    detail:   `Asset deactivated: ${asset?.name}`,
  });

  redirect(`/astelfin_26/assets/${id}?success=deactivated`);
}

async function reactivateAsset(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const id = formData.get("assetId") as string;
  const asset = await prisma.asset.findUnique({ where: { id }, select: { name: true } });

  await prisma.asset.update({ where: { id }, data: { active: true } });

  await auditLog({
    userId:   session.user.id!,
    action:   "REACTIVATE",
    entity:   "Asset",
    entityId: id,
    detail:   `Asset reactivated: ${asset?.name}`,
  });

  redirect(`/astelfin_26/assets/${id}?success=reactivated`);
}

async function saveInsurance(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;

  const assetId        = formData.get("assetId") as string;
  const insurer        = formData.get("insurer") as string;
  const policyNumber   = (formData.get("policyNumber") as string) || null;
  const premiumRaw     = formData.get("premium") as string;
  const coverageRaw    = formData.get("coverageAmount") as string;
  const insCurrency    = (formData.get("insCurrency") as string) || "MWK";
  const startDate      = formData.get("startDate") as string;
  const expiryDate     = formData.get("expiryDate") as string;
  const notes          = (formData.get("insNotes") as string) || null;

  const data = {
    insurer,
    policyNumber,
    premium:        premiumRaw     ? parseFloat(premiumRaw)  : null,
    coverageAmount: coverageRaw    ? parseFloat(coverageRaw) : null,
    currency:       insCurrency,
    startDate:      new Date(startDate),
    expiryDate:     new Date(expiryDate),
    notes,
  };

  await prisma.assetInsurance.upsert({
    where:  { assetId },
    update: data,
    create: { assetId, ...data },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "UPDATE",
    entity:   "AssetInsurance",
    entityId: assetId,
    detail:   `Insurance policy saved for asset ${assetId} — insurer: ${insurer}`,
  });

  redirect(`/astelfin_26/assets/${assetId}?success=insurance`);
}

async function deleteInsurance(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const assetId = formData.get("assetId") as string;
  await prisma.assetInsurance.delete({ where: { assetId } });

  await auditLog({
    userId:   session.user.id!,
    action:   "DELETE",
    entity:   "AssetInsurance",
    entityId: assetId,
    detail:   `Insurance policy removed from asset ${assetId}`,
  });

  redirect(`/astelfin_26/assets/${assetId}?success=ins-removed`);
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AssetDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;

  const { id }      = await params;
  const { success } = await searchParams;

  const asset = await prisma.asset.findUnique({
    where:   { id },
    include: { insurance: true },
  });

  if (!asset) notFound();

  const isCEO = role === "CEO";

  const today      = new Date();
  const thirtyDays = new Date(today);
  thirtyDays.setDate(thirtyDays.getDate() + 30);

  const ins = asset.insurance;
  const insExpired  = ins && ins.expiryDate < today;
  const insExpiring = ins && !insExpired && ins.expiryDate <= thirtyDays;

  const successMessages: Record<string, { color: string; text: string }> = {
    created:     { color: "green", text: "Asset registered successfully." },
    updated:     { color: "green", text: "Asset details updated." },
    insurance:   { color: "green", text: "Insurance policy saved." },
    "ins-removed": { color: "blue", text: "Insurance policy removed." },
    deactivated: { color: "amber", text: "Asset marked as inactive." },
    reactivated: { color: "green", text: "Asset reactivated." },
  };
  const alert = success ? successMessages[success] : null;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/astelfin_26/assets"
          className="text-gray-400 hover:text-brand-navy transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-brand-navy truncate">{asset.name}</h1>
            {!asset.active && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Inactive</span>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-0.5">
            {asset.assetNumber ?? "No asset number"} · {CATEGORIES[asset.category] ?? asset.category}
          </p>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${
          alert.color === "green" ? "bg-green-50 border-green-200 text-green-700" :
          alert.color === "amber" ? "bg-amber-50 border-amber-200 text-amber-700" :
          "bg-blue-50 border-blue-200 text-blue-700"
        }`}>
          {alert.text}
        </div>
      )}

      {/* Insurance alert */}
      {insExpired && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <strong>Warning:</strong> Insurance expired on <strong>{formatDate(ins!.expiryDate)}</strong>. Renew immediately.
        </div>
      )}
      {insExpiring && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
          Insurance expires <strong>{formatDate(ins!.expiryDate)}</strong> — within 30 days.
        </div>
      )}

      {/* Asset detail summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Category</p>
            <p className="mt-0.5 text-gray-800">{CATEGORIES[asset.category] ?? asset.category}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Condition</p>
            <span className={`inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${CONDITION_COLORS[asset.condition] ?? "bg-gray-100 text-gray-600"}`}>
              {asset.condition.replace("_", " ")}
            </span>
          </div>
          {asset.serialNumber && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Serial / Reg. No.</p>
              <p className="mt-0.5 text-gray-800 font-mono text-xs">{asset.serialNumber}</p>
            </div>
          )}
          {asset.location && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Location</p>
              <p className="mt-0.5 text-gray-800">{asset.location}</p>
            </div>
          )}
          {asset.purchaseDate && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Purchase Date</p>
              <p className="mt-0.5 text-gray-800">{formatDate(asset.purchaseDate)}</p>
            </div>
          )}
          {asset.purchasePrice && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Purchase Value</p>
              <p className="mt-0.5 text-gray-800 font-medium">{formatCurrency(asset.purchasePrice, asset.currency)}</p>
            </div>
          )}
          {asset.supplier && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Supplier</p>
              <p className="mt-0.5 text-gray-800">{asset.supplier}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Insurance Required</p>
            <p className="mt-0.5 text-gray-800">{asset.insurable ? "Yes" : "No"}</p>
          </div>
          {asset.description && (
            <div className="col-span-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Description</p>
              <p className="mt-0.5 text-gray-800">{asset.description}</p>
            </div>
          )}
          {asset.notes && (
            <div className="col-span-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Notes</p>
              <p className="mt-0.5 text-gray-800 text-sm">{asset.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Insurance section */}
      {asset.insurable && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-brand-navy">Insurance Policy</h2>
            {ins && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                insExpired  ? "bg-red-100 text-red-700" :
                insExpiring ? "bg-amber-100 text-amber-700" :
                "bg-green-100 text-green-700"
              }`}>
                {insExpired ? "Expired" : insExpiring ? "Expiring soon" : "Active"}
              </span>
            )}
          </div>

          {ins ? (
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-4">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Insurer</p>
                <p className="mt-0.5 text-gray-800">{ins.insurer}</p>
              </div>
              {ins.policyNumber && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Policy Number</p>
                  <p className="mt-0.5 text-gray-800 font-mono text-xs">{ins.policyNumber}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Start Date</p>
                <p className="mt-0.5 text-gray-800">{formatDate(ins.startDate)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Expiry Date</p>
                <p className={`mt-0.5 font-medium ${insExpired ? "text-red-600" : insExpiring ? "text-amber-600" : "text-gray-800"}`}>
                  {formatDate(ins.expiryDate)}
                </p>
              </div>
              {ins.premium && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Annual Premium</p>
                  <p className="mt-0.5 text-gray-800">{formatCurrency(ins.premium, ins.currency)}</p>
                </div>
              )}
              {ins.coverageAmount && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Coverage Amount</p>
                  <p className="mt-0.5 text-gray-800">{formatCurrency(ins.coverageAmount, ins.currency)}</p>
                </div>
              )}
              {ins.notes && (
                <div className="col-span-2">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Notes</p>
                  <p className="mt-0.5 text-gray-800">{ins.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-orange-600 font-medium">No insurance policy on file.</p>
          )}

          {/* Insurance form — always shown for insurable assets */}
          <details className="group" open={!ins}>
            <summary className="cursor-pointer text-sm font-semibold text-brand-gold hover:underline list-none flex items-center gap-1">
              <span>{ins ? "Update Policy" : "Add Insurance Policy"}</span>
              <svg className="w-4 h-4 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </summary>

            <form action={saveInsurance} className="mt-4 space-y-4">
              <input type="hidden" name="assetId" value={asset.id} />
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Insurer <span className="text-red-500">*</span>
                  </label>
                  <input name="insurer" required defaultValue={ins?.insurer ?? ""}
                    placeholder="e.g. NICO General Insurance"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Policy Number</label>
                  <input name="policyNumber" defaultValue={ins?.policyNumber ?? ""}
                    placeholder="e.g. POL-2024-001"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
                  <select name="insCurrency" defaultValue={ins?.currency ?? "MWK"}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white">
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Annual Premium</label>
                  <input name="premium" type="number" min="0" step="0.01"
                    defaultValue={ins?.premium ?? ""}
                    placeholder="0.00"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Coverage Amount</label>
                  <input name="coverageAmount" type="number" min="0" step="0.01"
                    defaultValue={ins?.coverageAmount ?? ""}
                    placeholder="0.00"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input name="startDate" type="date" required
                    defaultValue={ins ? ins.startDate.toISOString().slice(0, 10) : ""}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input name="expiryDate" type="date" required
                    defaultValue={ins ? ins.expiryDate.toISOString().slice(0, 10) : ""}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                  <textarea name="insNotes" rows={2} defaultValue={ins?.notes ?? ""}
                    placeholder="Any notes about this policy…"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 resize-none" />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit"
                  className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Save Policy
                </button>
                {ins && isCEO && (
                  <form action={deleteInsurance}>
                    <input type="hidden" name="assetId" value={asset.id} />
                    <button type="submit"
                      className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-2">
                      Remove Policy
                    </button>
                  </form>
                )}
              </div>
            </form>
          </details>
        </div>
      )}

      {/* Edit asset */}
      <details className="group">
        <summary className="cursor-pointer list-none">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <h2 className="font-semibold text-brand-navy">Edit Asset Details</h2>
            <svg className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </summary>

        <div className="bg-white rounded-b-2xl border border-t-0 border-gray-100 shadow-sm px-6 pb-6 pt-4">
          <form action={updateAsset} className="space-y-4">
            <input type="hidden" name="assetId" value={asset.id} />

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Asset Name <span className="text-red-500">*</span></label>
                <input name="name" required defaultValue={asset.name}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category <span className="text-red-500">*</span></label>
                <select name="category" required defaultValue={asset.category}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white">
                  {CATEGORIES_LIST.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Condition <span className="text-red-500">*</span></label>
                <select name="condition" required defaultValue={asset.condition}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white">
                  {CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Serial / Reg. Number</label>
                <input name="serialNumber" defaultValue={asset.serialNumber ?? ""}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                <input name="location" defaultValue={asset.location ?? ""}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Purchase Date</label>
                <input name="purchaseDate" type="date"
                  defaultValue={asset.purchaseDate ? asset.purchaseDate.toISOString().slice(0, 10) : ""}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Supplier</label>
                <input name="supplier" defaultValue={asset.supplier ?? ""}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Purchase Price</label>
                <input name="purchasePrice" type="number" min="0" step="0.01"
                  defaultValue={asset.purchasePrice ?? ""}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
                <select name="currency" defaultValue={asset.currency}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white">
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea name="description" rows={2} defaultValue={asset.description ?? ""}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 resize-none" />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-2">Insurance Required?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="insurable" value="true"
                      defaultChecked={asset.insurable} className="accent-brand-gold" />
                    Yes — insurable
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="insurable" value="false"
                      defaultChecked={!asset.insurable} className="accent-brand-gold" />
                    No — not insurable
                  </label>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea name="notes" rows={3} defaultValue={asset.notes ?? ""}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 resize-none" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit"
                className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </details>

      {/* CEO: Deactivate / Reactivate */}
      {isCEO && (
        <div className={`rounded-2xl border p-6 space-y-3 ${asset.active ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
          <h2 className={`font-semibold ${asset.active ? "text-red-800" : "text-gray-700"}`}>
            {asset.active ? "Deactivate Asset" : "Reactivate Asset"}
          </h2>
          <p className={`text-sm ${asset.active ? "text-red-700" : "text-gray-600"}`}>
            {asset.active
              ? "Deactivating removes this asset from the active register. All records are preserved."
              : "Reactivating will return this asset to the active register."}
          </p>
          <form action={asset.active ? deactivateAsset : reactivateAsset}>
            <input type="hidden" name="assetId" value={asset.id} />
            <button type="submit"
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors text-white ${
                asset.active ? "bg-red-600 hover:bg-red-700" : "bg-brand-navy hover:bg-brand-navy/90"
              }`}>
              {asset.active ? "Deactivate" : "Reactivate"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
