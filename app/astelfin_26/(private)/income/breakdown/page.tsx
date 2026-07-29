import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/finance-utils";
import Link from "next/link";
import IncomeBreakdownChart from "@/components/finance/IncomeBreakdownChart";

export const metadata = {
  title: "Income Breakdown | Astellic Finance",
  robots: { index: false, follow: false },
};

const TYPE_LABELS: Record<string, string> = {
  GRANT: "Grant",
  PRIVATE_SERVICE: "Private Service",
  DONATION: "Donation",
  CAPITAL_INJECTION: "Capital Injection",
};

const TYPE_COLORS: Record<string, string> = {
  GRANT: "#3b82f6",
  PRIVATE_SERVICE: "#8b5cf6",
  DONATION: "#10b981",
  CAPITAL_INJECTION: "#f59e0b",
};

const TYPE_BG: Record<string, string> = {
  GRANT: "bg-blue-50 border-blue-100",
  PRIVATE_SERVICE: "bg-purple-50 border-purple-100",
  DONATION: "bg-green-50 border-green-100",
};

const TYPE_TEXT: Record<string, string> = {
  GRANT: "text-blue-700",
  PRIVATE_SERVICE: "text-purple-700",
  DONATION: "text-green-700",
};

export default async function IncomeBreakdownPage() {
  const allIncome = await prisma.income.findMany({
    orderBy: { receivedDate: "asc" },
  });

  // Totals per type
  const totalsMap: Record<string, number> = {
    GRANT: 0,
    PRIVATE_SERVICE: 0,
    DONATION: 0,
  };
  for (const r of allIncome) {
    totalsMap[r.incomeType] = (totalsMap[r.incomeType] ?? 0) + r.amount;
  }

  const grandTotal = Object.values(totalsMap).reduce((s, v) => s + v, 0);

  const totals = Object.entries(totalsMap).map(([key, amount]) => ({
    name: TYPE_LABELS[key],
    amount,
    fill: TYPE_COLORS[key],
  }));

  // Monthly breakdown (last 12 months)
  const monthMap: Record<string, Record<string, number>> = {};
  for (const r of allIncome) {
    const month = new Date(r.receivedDate).toLocaleDateString("en-GB", {
      month: "short",
      year: "2-digit",
    });
    if (!monthMap[month]) monthMap[month] = { Grant: 0, "Private Service": 0, Donation: 0 };
    const label = TYPE_LABELS[r.incomeType];
    monthMap[month][label] = (monthMap[month][label] ?? 0) + r.amount;
  }

  const monthly = Object.entries(monthMap)
    .slice(-12)
    .map(([month, vals]) => ({
      month,
      Grant: vals["Grant"] ?? 0,
      "Private Service": vals["Private Service"] ?? 0,
      Donation: vals["Donation"] ?? 0,
    }));

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Income Breakdown</h1>
          <p className="text-gray-500 text-sm mt-1">
            Grand Total:{" "}
            <span className="font-bold text-green-600">{formatCurrency(grandTotal)}</span>
          </p>
        </div>
        <Link
          href="/astelfin_26/income"
          className="text-sm text-brand-gold hover:underline font-semibold"
        >
          ← All Income
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-5">
        {Object.entries(totalsMap).map(([key, amount]) => {
          const pct = grandTotal > 0 ? ((amount / grandTotal) * 100).toFixed(1) : "0.0";
          return (
            <div key={key} className={`rounded-2xl p-5 border ${TYPE_BG[key]}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${TYPE_TEXT[key]}`}>
                {TYPE_LABELS[key]}
              </p>
              <p className={`text-2xl font-bold ${TYPE_TEXT[key]}`}>
                {formatCurrency(amount)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{pct}% of total</p>
              <Link
                href={`/astelfin_26/income?type=${key}`}
                className={`text-xs font-semibold hover:underline mt-2 inline-block ${TYPE_TEXT[key]}`}
              >
                View records →
              </Link>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <IncomeBreakdownChart monthly={monthly} totals={totals} />
    </div>
  );
}
