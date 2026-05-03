"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MonthlyData {
  month: string;
  Grant: number;
  "Private Service": number;
  Donation: number;
}

interface TotalsData {
  name: string;
  amount: number;
  fill: string;
}

interface Props {
  monthly: MonthlyData[];
  totals: TotalsData[];
}

function currency(v: number) {
  return new Intl.NumberFormat("en-MW", {
    style: "currency",
    currency: "MWK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);
}

export default function IncomeBreakdownChart({ monthly, totals }: Props) {
  return (
    <div className="space-y-10">
      {/* Totals bar chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-brand-navy mb-6">Total by Income Type</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={totals} margin={{ top: 4, right: 20, left: 20, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 13 }} />
            <YAxis tickFormatter={(v) => currency(v)} tick={{ fontSize: 11 }} width={110} />
            <Tooltip formatter={(v) => currency(Number(v))} />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
              {totals.map((entry, i) => (
                <rect key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly trend chart */}
      {monthly.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-brand-navy mb-6">Monthly Trend by Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthly} margin={{ top: 4, right: 20, left: 20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => currency(v)} tick={{ fontSize: 11 }} width={110} />
              <Tooltip formatter={(v) => currency(Number(v))} />
              <Legend />
              <Bar dataKey="Grant" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Private Service" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Donation" stackId="a" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
