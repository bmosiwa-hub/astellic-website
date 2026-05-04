"use client";

import { useState, useTransition } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  "Administration",
  "Finance",
  "Human Resources",
  "Projects",
  "Senior Management",
  "Support Staff",
] as const;

const CONTRACT_TYPES = [
  { value: "PERMANENT",   label: "Permanent" },
  { value: "CONTRACT",    label: "Fixed-Term Contract" },
  { value: "CONSULTANCY", label: "Consultancy" },
  { value: "INTERNSHIP",  label: "Internship" },
  { value: "VOLUNTEER",   label: "Volunteer" },
] as const;


const CURRENCIES = ["MWK", "USD", "GBP", "EUR", "ZAR", "AUD", "CAD", "NOK", "SEK", "DKK"];

// ── Tax helpers ───────────────────────────────────────────────────────────────

function calcPAYE(mwkGross: number): number {
  const B1 = 170_000;    // 0% up to here
  const B2 = 1_570_000;  // 30% up to here, 35% above
  if (mwkGross <= B1) return 0;
  let tax = 0;
  tax += (Math.min(mwkGross, B2) - B1) * 0.30;
  if (mwkGross > B2) tax += (mwkGross - B2) * 0.35;
  return r2(tax);
}

function r2(n: number) { return Math.round(n * 100) / 100; }

function fmtMWK(n: number) {
  return n.toLocaleString("en-MW", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (formData: FormData) => Promise<any>;
  defaultValues?: {
    name?: string;
    email?: string;
    position?: string;
    department?: string;
    contractType?: string;
    endDate?: string;   // ISO date string e.g. "2025-12-31"
    grossSalary?: number;
    currency?: string;
    salaryExchangeRate?: number;
    taxPin?: string;
    nssf?: string;
    pensionRate?: number;
    startDate?: string;
    notes?: string;
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EmployeeForm({ action, defaultValues }: Props) {
  const [isPending, startTransition] = useTransition();

  const [gross,                setGross]                = useState(defaultValues?.grossSalary ?? 0);
  const [pensionRate,          setPensionRate]          = useState(defaultValues?.pensionRate  ?? 5);
  const [currency,             setCurrency]             = useState(defaultValues?.currency     ?? "MWK");
  const [exchangeRate,         setExchangeRate]         = useState(defaultValues?.salaryExchangeRate ?? 0);
  const [department,           setDepartment]           = useState(defaultValues?.department   ?? "");
  const [contractType, setContractType] = useState(defaultValues?.contractType ?? "PERMANENT");
  const [startDate,    setStartDate]    = useState(defaultValues?.startDate ?? "");

  const isMWK    = currency === "MWK";
  const rate     = isMWK ? 1 : exchangeRate;
  const hasRate  = isMWK || rate > 0;

  // ── Live calculations ─────────────────────────────────────────────────────

  const grossMWK    = r2(gross * rate);
  const payeMWK     = hasRate ? calcPAYE(grossMWK) : 0;
  const pensionMWK  = hasRate ? r2(grossMWK * (pensionRate / 100)) : 0;
  const netMWK      = hasRate ? r2(grossMWK - payeMWK - pensionMWK) : 0;
  const netFX       = !isMWK && rate > 0 ? r2(netMWK / rate) : 0;

  const showBreakdown = gross > 0 && hasRate;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => { await action(fd); });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Employee Details ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-brand-navy text-sm uppercase tracking-wide">Employee Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input name="name" required defaultValue={defaultValues?.name}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input name="email" type="email" defaultValue={defaultValues?.email ?? ""}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Position / Job Title <span className="text-red-500">*</span>
            </label>
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
            <label className="block text-xs font-medium text-gray-600 mb-1">Employment Type</label>
            <select name="contractType" value={contractType}
              onChange={e => setContractType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white">
              {CONTRACT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input name="startDate" type="date" required
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
          </div>

          {/* Contract End Date — shown for all types; leave blank for permanent */}
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Contract End Date
              <span className="ml-1.5 font-normal text-gray-400">— leave blank for permanent employees</span>
            </label>
            <input
              name="endDate"
              type="date"
              defaultValue={defaultValues?.endDate ?? ""}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
            <select name="currency" value={currency} onChange={e => { setCurrency(e.target.value); setExchangeRate(0); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white">
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea name="notes" rows={2} defaultValue={defaultValues?.notes ?? ""}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 resize-none" />
        </div>
      </div>

      {/* ── Tax & Compliance IDs ─────────────────────────────── */}
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

      {/* ── Salary & Deductions ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="font-semibold text-brand-navy text-sm uppercase tracking-wide">Salary &amp; Deductions</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Gross */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Gross Monthly Salary ({currency}) <span className="text-red-500">*</span>
            </label>
            <input
              name="grossSalary"
              type="number" min="0" step="0.01" required
              value={gross || ""}
              onChange={e => setGross(parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
            />
          </div>

          {/* Pension */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Pension Rate (%)</label>
            <input
              name="pensionRate"
              type="number" min="0" max="100" step="0.5"
              value={pensionRate}
              onChange={e => setPensionRate(parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
            />
          </div>

          {/* Exchange Rate — only shown for foreign currencies */}
          {!isMWK && (
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Exchange Rate: 1 {currency} = MWK ___
                <span className="text-red-500 ml-0.5">*</span>
                <span className="ml-2 text-gray-400 font-normal">
                  Enter the current MWK middle rate for {currency}
                </span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 shrink-0">1 {currency} =</span>
                <input
                  name="salaryExchangeRate"
                  type="number" min="0.0001" step="0.0001"
                  required={!isMWK}
                  value={exchangeRate || ""}
                  onChange={e => setExchangeRate(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 1734.0118"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
                />
                <span className="text-sm text-gray-500 shrink-0">MWK</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                You can find the current rate at{" "}
                <a href="https://www.rbm.mw/Statistics/MajorRates/" target="_blank" rel="noopener noreferrer"
                  className="text-brand-gold underline">rbm.mw/Statistics/MajorRates</a>
              </p>
            </div>
          )}

          {/* Hidden field for MWK employees — submits null/empty */}
          {isMWK && <input type="hidden" name="salaryExchangeRate" value="" />}
        </div>

        {/* ── Salary Breakdown ─────────────────────────────── */}
        {showBreakdown ? (
          <div className="rounded-xl border border-gray-200 overflow-hidden">

            {/* Header */}
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                Monthly Salary Breakdown
              </span>
              {!isMWK && (
                <span className="text-xs text-gray-500">
                  All taxes on MWK equivalent · net converted back to {currency}
                </span>
              )}
            </div>

            <div className="divide-y divide-gray-100 bg-white text-sm">

              {/* Gross (original currency) */}
              <Row
                label={`Gross Salary (${currency})`}
                right={`${currency} ${fmtMWK(gross)}`}
                className="font-medium text-gray-800"
              />

              {/* MWK equivalent — foreign only */}
              {!isMWK && (
                <Row
                  label={`Gross MWK equivalent  ×  ${fmtMWK(rate)}`}
                  right={`MWK ${fmtMWK(grossMWK)}`}
                  className="bg-blue-50/40 text-blue-800 font-medium"
                  labelMuted
                />
              )}

              {/* PAYE section */}
              <div className="px-4 pt-2.5 pb-1.5 bg-amber-50/50">
                <p className="text-xs font-semibold text-amber-700 mb-1">
                  PAYE — calculated on MWK {fmtMWK(isMWK ? gross : grossMWK)}
                </p>
                <div className="pl-2 space-y-0.5">
                  <BandRow label="Band 1:  0%   MWK 0 – 170,000"                  hit={(isMWK ? gross : grossMWK) > 0} />
                  <BandRow label="Band 2: 30%   MWK 170,001 – 1,570,000"          hit={(isMWK ? gross : grossMWK) > 170_000} />
                  <BandRow label="Band 3: 35%   above MWK 1,570,000"              hit={(isMWK ? gross : grossMWK) > 1_570_000} />
                </div>
              </div>

              <DeductionRow label="PAYE"                        mwk={payeMWK}    fx={isMWK ? null : { currency, val: r2(payeMWK   / rate) }} />
              <DeductionRow label={`Pension (${pensionRate}%)`} mwk={pensionMWK} fx={isMWK ? null : { currency, val: r2(pensionMWK/ rate) }} />

              {/* Separator */}
              <div className="border-t-2 border-gray-300" />

              {/* Net MWK */}
              <Row
                label="Net Salary (MWK)"
                right={`MWK ${fmtMWK(netMWK)}`}
                className="font-bold text-brand-navy bg-gray-50"
              />

              {/* Net original currency — foreign only */}
              {!isMWK && (
                <div className="flex items-center justify-between px-4 py-3 bg-brand-navy/5">
                  <span className="text-sm font-bold text-brand-navy">
                    Net Salary ({currency})
                    <span className="ml-1.5 text-xs font-normal text-gray-500">
                      MWK {fmtMWK(netMWK)} ÷ {fmtMWK(rate)}
                    </span>
                  </span>
                  <span className="text-lg font-bold text-brand-navy tabular-nums">
                    {currency} {fmtMWK(netFX)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-xs text-gray-400">
            {!isMWK && !hasRate
              ? `Enter the ${currency}/MWK exchange rate and gross salary above to see the breakdown.`
              : "Enter a gross salary above to see the breakdown."}
          </div>
        )}

        <p className="text-xs text-gray-400 italic">
          Note: For consultants, Withholding Tax (WHT) of 20% applies instead of PAYE.
          Manage consultant payments separately under Requests.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <a href="/astelfin_26/employees"
          className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
          Cancel
        </a>
        <button type="submit" disabled={isPending}
          className="px-6 py-2.5 bg-brand-gold hover:bg-brand-gold/90 text-white rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors">
          {isPending ? "Saving…" : "Save Employee"}
        </button>
      </div>
    </form>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Row({
  label, right, className = "", labelMuted,
}: {
  label: string; right: string; className?: string; labelMuted?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 ${className}`}>
      <span className={`text-xs ${labelMuted ? "text-blue-600" : "text-gray-600"}`}>{label}</span>
      <span className="tabular-nums text-xs">{right}</span>
    </div>
  );
}

function DeductionRow({
  label, mwk, fx,
}: {
  label: string;
  mwk: number;
  fx: { currency: string; val: number } | null;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-xs text-gray-600">{label}</span>
      <div className="text-right tabular-nums">
        {fx && (
          <p className="text-[11px] text-red-400">− {fx.currency} {fmtMWK(fx.val)}</p>
        )}
        <p className="text-xs font-semibold text-red-600">− MWK {fmtMWK(mwk)}</p>
      </div>
    </div>
  );
}

function BandRow({ label, hit }: { label: string; hit: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs pb-0.5 ${hit ? "text-amber-800" : "text-gray-400"}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${hit ? "bg-amber-500" : "bg-gray-300"}`} />
      {label}
    </div>
  );
}
