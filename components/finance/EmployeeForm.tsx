"use client";

import { useState, useTransition } from "react";

const DEPARTMENTS = [
  "Administration",
  "Finance",
  "Human Resources",
  "Projects",
  "Support Staff",
] as const;

// Mirror of lib/finance-utils.ts calculatePAYE — kept client-side for live preview
function calcPAYE(monthlyGross: number): number {
  const B1 = 170_000 / 12;       // 14,166.67 → 0%
  const B2 = 1_570_000 / 12;     // 130,833.33 → 30%
  const B3 = 10_000_000 / 12;    // 833,333.33 → 35%
  if (monthlyGross <= B1) return 0;
  let tax = 0;
  tax += (Math.min(monthlyGross, B2) - B1) * 0.30;
  if (monthlyGross > B2) tax += (Math.min(monthlyGross, B3) - B2) * 0.35;
  if (monthlyGross > B3) tax += (monthlyGross - B3) * 0.40;
  return Math.round(tax * 100) / 100;
}

function calcNSSF(gross: number): number {
  return Math.round(gross * 0.03 * 100) / 100;
}

function calcPension(gross: number, rate: number): number {
  return Math.round(gross * (rate / 100) * 100) / 100;
}

function fmt(n: number) {
  return n.toLocaleString("en-MW", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (formData: FormData) => Promise<any>;
  defaultValues?: {
    name?: string;
    email?: string;
    position?: string;
    department?: string;
    grossSalary?: number;
    currency?: string;
    taxPin?: string;
    nssf?: string;
    pensionRate?: number;
    startDate?: string;
    notes?: string;
  };
}

export default function EmployeeForm({ action, defaultValues }: Props) {
  const [isPending, startTransition] = useTransition();

  const [gross, setGross] = useState(defaultValues?.grossSalary ?? 0);
  const [pensionRate, setPensionRate] = useState(defaultValues?.pensionRate ?? 5);
  const [currency, setCurrency] = useState(defaultValues?.currency ?? "MWK");
  const [department, setDepartment] = useState(defaultValues?.department ?? "");

  const paye    = calcPAYE(gross);
  const nssf    = calcNSSF(gross);
  const pension = calcPension(gross, pensionRate);
  const net     = Math.max(0, gross - paye - nssf - pension);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => { await action(fd); });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Basic info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-brand-navy text-sm uppercase tracking-wide">Employee Details</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input name="name" required defaultValue={defaultValues?.name}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input name="email" type="email" defaultValue={defaultValues?.email ?? ""}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Position / Job Title <span className="text-red-500">*</span></label>
            <input name="position" required defaultValue={defaultValues?.position}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
            <select name="department" value={department} onChange={e => setDepartment(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white">
              <option value="">— Select department —</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Start Date <span className="text-red-500">*</span></label>
            <input name="startDate" type="date" required defaultValue={defaultValues?.startDate}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
            <select name="currency" value={currency} onChange={e => setCurrency(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white">
              {["MWK", "USD", "GBP", "EUR", "ZAR"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea name="notes" rows={2} defaultValue={defaultValues?.notes ?? ""}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 resize-none" />
        </div>
      </div>

      {/* Tax & compliance IDs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-brand-navy text-sm uppercase tracking-wide">Tax &amp; Compliance</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">TPIN (Tax PIN)</label>
            <input name="taxPin" defaultValue={defaultValues?.taxPin ?? ""}
              placeholder="e.g. 1234567890"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">NSSF Number</label>
            <input name="nssf" defaultValue={defaultValues?.nssf ?? ""}
              placeholder="e.g. NSSF-00000"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
          </div>
        </div>
      </div>

      {/* Salary calculation */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-brand-navy text-sm uppercase tracking-wide">Salary &amp; Deductions</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Gross Monthly Salary ({currency}) <span className="text-red-500">*</span>
            </label>
            <input
              name="grossSalary"
              type="number"
              min="0"
              step="0.01"
              required
              value={gross || ""}
              onChange={e => setGross(parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Pension Rate (%)
            </label>
            <input
              name="pensionRate"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={pensionRate}
              onChange={e => setPensionRate(parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
            />
          </div>
        </div>

        {/* Live breakdown */}
        <div className="rounded-xl bg-gray-50 border border-gray-100 overflow-hidden mt-2">
          <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Monthly Salary Breakdown</p>
          </div>
          <div className="divide-y divide-gray-100">
            <Row label="Gross Salary" value={gross} currency={currency} />
            <div className="px-4 py-2 bg-amber-50/50">
              <p className="text-xs font-semibold text-amber-700 mb-1.5">PAYE (Malawi Tax Bands)</p>
              <div className="space-y-0.5 pl-2">
                <BandRow
                  label={`Band 1: 0% on first MWK ${fmt(170_000 / 12)}`}
                  amount={gross <= 170_000/12 ? 0 : undefined}
                  hit={gross > 0}
                />
                <BandRow
                  label={`Band 2: 30% on MWK ${fmt(170_000/12)} – ${fmt(1_570_000/12)}`}
                  hit={gross > 170_000/12}
                />
                <BandRow
                  label={`Band 3: 35% on MWK ${fmt(1_570_000/12)} – ${fmt(10_000_000/12)}`}
                  hit={gross > 1_570_000/12}
                />
                <BandRow
                  label={`Band 4: 40% above MWK ${fmt(10_000_000/12)}`}
                  hit={gross > 10_000_000/12}
                />
              </div>
            </div>
            <Row label="PAYE" value={-paye} currency={currency} negative />
            <Row label={`NSSF Employee Contribution (3%)`} value={-nssf} currency={currency} negative />
            <Row label={`Pension (${pensionRate}%)`} value={-pension} currency={currency} negative />
            <div className="px-4 py-3 bg-brand-navy/5">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-brand-navy">Net Salary</span>
                <span className="text-lg font-bold text-brand-navy">
                  {currency} {fmt(net)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Withholding tax note for reference */}
        <p className="text-xs text-gray-400 italic">
          Note: For consultants, Withholding Tax (WHT) of 20% is applied instead of PAYE and NSSF. Manage consultant payments separately under Requests.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <a href="/astelfin_26/employees" className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
          Cancel
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-brand-gold hover:bg-brand-gold/90 text-white rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors"
        >
          {isPending ? "Saving…" : "Save Employee"}
        </button>
      </div>
    </form>
  );
}

function Row({ label, value, currency, negative }: { label: string; value: number; currency: string; negative?: boolean }) {
  return (
    <div className="flex justify-between items-center px-4 py-2.5">
      <span className="text-xs text-gray-600">{label}</span>
      <span className={`text-xs font-semibold tabular-nums ${negative ? "text-red-600" : "text-gray-800"}`}>
        {negative && value !== 0 ? "−" : ""}{currency} {fmt(Math.abs(value))}
      </span>
    </div>
  );
}

function BandRow({ label, hit }: { label: string; amount?: number; hit: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs ${hit ? "text-amber-800" : "text-gray-400"}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${hit ? "bg-amber-500" : "bg-gray-300"}`} />
      {label}
    </div>
  );
}
