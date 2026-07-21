import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Assets | Astelfin IMS",
  robots: { index: false, follow: false },
};

const CATEGORY_LABELS: Record<string, string> = {
  FURNITURE:        "Furniture",
  IT_EQUIPMENT:     "IT Equipment",
  MOTOR_VEHICLE:    "Motor Vehicle",
  OFFICE_EQUIPMENT: "Office Equipment",
  LAND_BUILDING:    "Land & Building",
  OTHER:            "Other",
};

const CONDITION_COLORS: Record<string, string> = {
  EXCELLENT:   "bg-green-100 text-green-700",
  GOOD:        "bg-blue-100 text-blue-700",
  FAIR:        "bg-yellow-100 text-yellow-700",
  POOR:        "bg-orange-100 text-orange-700",
  WRITTEN_OFF: "bg-gray-100 text-gray-500",
};

export default async function AssetsPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;

  const assets = await prisma.asset.findMany({
    orderBy: [{ active: "desc" }, { category: "asc" }, { name: "asc" }],
    include: { insurance: true },
  });

  const today = new Date();
  const thirtyDays = new Date(today);
  thirtyDays.setDate(thirtyDays.getDate() + 30);

  const expiringCount = assets.filter(
    (a) => a.insurance && a.insurance.expiryDate <= thirtyDays && a.insurance.expiryDate >= today
  ).length;
  const expiredCount = assets.filter(
    (a) => a.insurance && a.insurance.expiryDate < today
  ).length;

  // Group by category for summary
  const categories = Object.keys(CATEGORY_LABELS);
  const byCat = categories.map((cat) => ({
    cat,
    label: CATEGORY_LABELS[cat],
    count: assets.filter((a) => a.category === cat && a.active).length,
  })).filter((c) => c.count > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Assets Register</h1>
          <p className="text-gray-500 text-sm mt-1">Track company assets and manage insurance.</p>
        </div>
        <Link href="/astelfin_26/assets/new"
          className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
          + Add Asset
        </Link>
      </div>

      {/* Insurance alerts */}
      {(expiredCount > 0 || expiringCount > 0) && (
        <div className="space-y-2">
          {expiredCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <strong>Warning:</strong> <strong>{expiredCount}</strong> asset{expiredCount > 1 ? "s have" : " has"} expired insurance. Renew immediately.
            </div>
          )}
          {expiringCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
              <strong>{expiringCount}</strong> asset{expiringCount > 1 ? "s" : ""} with insurance expiring within 30 days.
            </div>
          )}
        </div>
      )}

      {/* Category summary */}
      {byCat.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {byCat.map((c) => (
            <div key={c.cat} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{c.label}</p>
              <p className="text-2xl font-bold text-brand-navy mt-1">{c.count}</p>
            </div>
          ))}
        </div>
      )}

      {/* Assets table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {assets.length === 0 ? (
          <p className="text-center py-12 text-gray-400">No assets registered yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Asset</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Category</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Condition</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Purchase Value</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Insurance</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assets.map((a) => {
                const insExpired  = a.insurance && a.insurance.expiryDate < today;
                const insExpiring = a.insurance && !insExpired && a.insurance.expiryDate <= thirtyDays;
                return (
                  <tr key={a.id} className={`hover:bg-gray-50 ${!a.active ? "opacity-50" : ""}`}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-brand-navy">{a.name}</p>
                      <p className="text-xs text-gray-400">
                        {a.assetNumber ?? "—"}
                        {a.location ? ` · ${a.location}` : ""}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{CATEGORY_LABELS[a.category] ?? a.category}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CONDITION_COLORS[a.condition] ?? "bg-gray-100 text-gray-600"}`}>
                        {a.condition.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {a.purchasePrice ? formatCurrency(a.purchasePrice, a.currency) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      {a.insurance ? (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          insExpired  ? "bg-red-100 text-red-700" :
                          insExpiring ? "bg-amber-100 text-amber-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {insExpired ? "Expired" : insExpiring ? `Expires ${formatDate(a.insurance.expiryDate)}` : `Valid to ${formatDate(a.insurance.expiryDate)}`}
                        </span>
                      ) : a.insurable ? (
                        <span className="text-xs text-orange-500 font-medium">No policy</span>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/astelfin_26/assets/${a.id}`}
                        className="text-brand-gold hover:underline text-xs font-semibold">
                        View / Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
