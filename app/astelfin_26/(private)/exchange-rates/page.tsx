import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { updateRateManually } from "@/lib/exchange-rate-actions";
import Link from "next/link";

export const metadata = {
  title: "Exchange Rates | Astelfin IMS",
  robots: { index: false, follow: false },
};

const PRIMARY_CURRENCIES = ["USD", "GBP", "EUR", "ZAR", "AUD", "CAD", "MWK"];

function fmt4(n: number) {
  return n.toLocaleString("en-MW", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

export default async function ExchangeRatesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  const { edit, error } = await searchParams;

  const rates = await prisma.exchangeRate.findMany({
    orderBy: { currency: "asc" },
    include: { updatedBy: { select: { name: true } } },
  });

  type Rate = (typeof rates)[number];

  const primaryRates: Rate[] = rates.filter((r) => PRIMARY_CURRENCIES.includes(r.currency));
  const otherRates:   Rate[] = rates.filter((r) => !PRIMARY_CURRENCIES.includes(r.currency));

  const editingCurrency = edit ? rates.find((r) => r.currency === edit) : null;

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Exchange Rates</h1>
        <p className="text-gray-500 text-sm mt-1">
          Reference rates for MWK conversion. FM or CEO can add or update rates manually.
          Rates are also entered directly when registering an employee with a foreign-currency salary.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Current MWK middle rates are published at{" "}
          <a href="https://www.rbm.mw/Statistics/MajorRates/" target="_blank" rel="noopener noreferrer"
            className="underline hover:text-brand-gold">rbm.mw/Statistics/MajorRates</a>.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error === "invalid" ? "Invalid currency or rate values." : error}
        </div>
      )}

      {/* Edit existing rate */}
      {editingCurrency ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="font-bold text-brand-navy mb-4">Edit Rate: {editingCurrency.currency}</h2>
          <form action={updateRateManually} className="grid grid-cols-3 gap-4">
            <input type="hidden" name="currency" value={editingCurrency.currency} />
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Buy Rate (MWK per 1 {editingCurrency.currency})
              </label>
              <input name="buyRate" type="number" step="0.0001" min="0"
                defaultValue={editingCurrency.buyRate}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Middle Rate <span className="text-red-500">*</span>
              </label>
              <input name="middleRate" type="number" step="0.0001" min="0.0001" required
                defaultValue={editingCurrency.middleRate}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Sell Rate (MWK per 1 {editingCurrency.currency})
              </label>
              <input name="sellRate" type="number" step="0.0001" min="0"
                defaultValue={editingCurrency.sellRate}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
            </div>
            <div className="col-span-3 flex gap-3">
              <button type="submit"
                className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2 rounded-lg text-sm font-semibold">
                Save Rate
              </button>
              <Link href="/astelfin_26/exchange-rates"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      ) : (
        /* Add new currency form */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-brand-navy mb-4">Add / Update Rate</h2>
          <form action={updateRateManually} className="grid grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Currency <span className="text-red-500">*</span>
              </label>
              <input name="currency" required maxLength={4} placeholder="e.g. USD"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Buy Rate (MWK)</label>
              <input name="buyRate" type="number" step="0.0001" min="0" placeholder="e.g. 1717"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Middle Rate <span className="text-red-500">*</span>
              </label>
              <input name="middleRate" type="number" step="0.0001" min="0.0001" required placeholder="e.g. 1734"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sell Rate (MWK)</label>
              <input name="sellRate" type="number" step="0.0001" min="0" placeholder="e.g. 1751"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
            </div>
            <div className="col-span-4">
              <button type="submit"
                className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2 rounded-lg text-sm font-semibold">
                Save Rate
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rate tables */}
      {rates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-12 text-center text-gray-400 text-sm">
          No rates saved yet. Add rates using the form above.
        </div>
      ) : (
        <>
          {primaryRates.length > 0 && (
            <div className="bg-white rounded-2xl border border-brand-gold/30 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-brand-gold/10 border-b border-brand-gold/20">
                <h2 className="font-bold text-brand-navy text-sm">Key Currencies</h2>
              </div>
              <RateTable rates={primaryRates} />
            </div>
          )}
          {otherRates.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <h2 className="font-bold text-brand-navy text-sm">Other Currencies</h2>
              </div>
              <RateTable rates={otherRates} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RateTable({ rates }: {
  rates: {
    currency: string; buyRate: number; middleRate: number; sellRate: number;
    effectiveDate: Date; source: string; updatedAt: Date; updatedBy: { name: string } | null;
  }[];
}) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
          <th className="text-left  px-5 py-3 font-semibold text-gray-600">Currency</th>
          <th className="text-right px-5 py-3 font-semibold text-gray-600">Buy (MWK)</th>
          <th className="text-right px-5 py-3 font-semibold text-brand-navy">Middle (MWK)</th>
          <th className="text-right px-5 py-3 font-semibold text-gray-600">Sell (MWK)</th>
          <th className="text-center px-5 py-3 font-semibold text-gray-600">Effective</th>
          <th className="text-right px-5 py-3 font-semibold text-gray-600">Updated by</th>
          <th className="px-5 py-3"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {rates.map((r) => (
          <tr key={r.currency} className="hover:bg-gray-50">
            <td className="px-5 py-3 font-bold text-brand-navy">{r.currency}</td>
            <td className="px-5 py-3 text-right text-gray-500 tabular-nums">{fmt4(r.buyRate)}</td>
            <td className="px-5 py-3 text-right font-semibold text-gray-800 tabular-nums">{fmt4(r.middleRate)}</td>
            <td className="px-5 py-3 text-right text-gray-500 tabular-nums">{fmt4(r.sellRate)}</td>
            <td className="px-5 py-3 text-center text-xs text-gray-500">
              {new Date(r.effectiveDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </td>
            <td className="px-5 py-3 text-right text-xs text-gray-400">
              {r.updatedBy?.name ?? "—"}
              <br />
              {new Date(r.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </td>
            <td className="px-5 py-3 text-right">
              <Link href={`/astelfin_26/exchange-rates?edit=${r.currency}`}
                className="text-xs text-brand-gold font-semibold hover:underline">
                Edit
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
