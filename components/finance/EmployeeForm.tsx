"use client";

import { useState, useTransition } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  "Administration",
  "Finance",
  "Human Resources",
  "Projects",
  "Support Staff",
] as const;

// Always-available currencies — appear even if no RBM rate is loaded yet
const PRIMARY_CURRENCIES = ["MWK", "USD", "GBP", "EUR", "ZAR", "AUD", "CAD"];

// ── Tax helpers (client-side mirrors of lib/finance-utils.ts) ─────────────────

function calcPAYE(mwkGross: number): number {
  const B1 = 170_000 / 12;      // 14,166.67 → 0%
  const B2 = 1_570_000 / 12;    // 130,833.33 → 30%
  const B3 = 10_000_000 / 12;   // 833,333.33 → 35%
  if (mwkGross <= B1) return 0;
  let tax = 0;
  tax += (Math.min(mwkGross, B2) - B1) * 0.30;
  if (mwkGross > B2) tax += (Math.min(mwkGross, B3) - B2) * 0.35;
  if (mwkGross > B3) tax += (mwkGross - B3) * 0.40;
  return r2(tax);
}

function r2(n: number) {
  return Math.round(n * 100) / 100;
}

interface Breakdown {
  grossFX:    number; // gross in original currency
  grossMWK:   number; // gross converted to MWK
  payeMWK:    number; // PAYE in MWK
  nssfMWK:    number; // NSSF in MWK
  pensionMWK: number; // Pension in MWK
  netMWK:     number; // net in MWK
  payeFX:     number; // PAYE converted back
  nssfFX:     number;
  pensionFX:  number;
  netFX:      number; // net in original currency
}

function compute(gross: number, pensionPct: number, middleRate: number): Breakdown {
  const rate       = middleRate > 0 ? middleRate : 1;
  const grossMWK   = r2(gross * rate);
  const payeMWK    = calcPAYE(grossMWK);
  const nssfMWK    = r2(grossMWK * 0.03);
  const pensionMWK = r2(grossMWK * (pensionPct / 100));
  const netMWK     = r2(grossMWK - payeMWK - nssfMWK - pensionMWK);
  return {
    grossFX:    gross,
    grossMWK,
    payeMWK,
    nssfMWK,
    pensionMWK,
    netMWK,
    payeFX:    r2(payeMWK    / rate),
    nssfFX:    r2(nssfMWK   / rate),
    pensionFX: r2(pensionMWK / rate),
    netFX:     r2(netMWK     / rate),
  };
}

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtMWK(n: number) {
  return n.toLocaleString("en-MW", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtFX(n: number) {
  return n.toLocaleString("en-MW", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StoredRate {
  currency:         string;
  middleRate:       number;
  effectiveDateStr: string;
  source:           string;
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (formData: FormData) => Promise<any>;
  rates?: StoredRate[];
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

// ── Component ─────────────────────────────────────────────────────────────────

export default function EmployeeForm({ action, rates = [], defaultValues }: Props) {
  const [isPending, startTransition] = useTransition();

  const [gross,       setGross]       = useState(defaultValues?.grossSalary ?? 0);
  const [pensionRate, setPensionRate] = useState(defaultValues?.pensionRate  ?? 5);
  const [currency,    setCurrency]    = useState(defaultValues?.currency     ?? "MWK");
  const [department,  setDepartment]  = useState(defaultValues?.department   ?? "");

  const isMWK      = currency === "MWK";
  const storedRate = rates.find((r) => r.currency === currency);
  const middleRate = isMWK ? 1 : (storedRate?.middleRate ?? 0);
  const hasRate    = isMWK || middleRate > 0;

  // Build dropdown: primary currencies + any extras from stored rates not already in primary list
  const extraCurrencies = rates
    .map((r) => r.currency)
    .filter((c) => !PRIMARY_CURRENCIES.includes(c));
  const allCurrencies = [...PRIMARY_CURRENCIES, ...extraCurrencies].sort((a, b) =>
    a === "MWK" ? -1 : b === "MWK" ? 1 : a.localeCompare(b)
  );

  const d: Breakdown | null = gross > 0 && hasRate
    ? compute(gross, pensionRate, middleRate)
    : null;

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
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input name="startDate" type="date" required defaultValue={defaultValues?.startDate}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Salary Currency</label>
            <select name="currency" value={currency} onChange={e => setCurrency(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white">
              {allCurrencies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
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
            <label className="block text-xs font-medium text-gray-600 mb-1">Pension Rate (%)</label>
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

        {/* Missing rate warning */}
        {!isMWK && !storedRate && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            <strong>No exchange rate on file for {currency}.</strong>{" "}
            Go to{" "}
            <a href="/astelfin_26/exchange-rates" className="underline font-semibold">
              Exchange Rates
            </a>{" "}
            and refresh from RBM (or add a manual rate) to enable the salary breakdown.
          </div>
        )}

        {/* Rate source banner */}
        {!isMWK && storedRate && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 flex items-center justify-between text-xs text-blue-800">
            <span>
              RBM middle rate: <strong>1 {currency} = MWK {fmtMWK(storedRate.middleRate)}</strong>
            </span>
            <span className="text-blue-500">
              {storedRate.source} · {storedRate.effectiveDateStr} ·{" "}
              <a href="/astelfin_26/exchange-rates" className="underline hover:text-blue-700">update</a>
            </span>
          </div>
        )}

        {/* ── Live Breakdown ────────────────────────────────── */}
        {d && (
          <div className="rounded-xl border border-gray-200 overflow-hidden text-sm">

            {/* Header */}
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex justify-between">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                Monthly Salary Breakdown
              </span>
              {!isMWK && (
                <span className="text-xs text-gray-500">
                  Taxes applied on MWK equivalent · net converted back to {currency}
                </span>
              )}
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-100 bg-white">

              {/* Gross (original currency) */}
              <BreakdownRow
                label={`Gross Salary (${currency})`}
                mwkCell={null}
                fxCell={{ currency, amount: d.grossFX }}
                isMWK={isMWK}
              />

              {/* Gross MWK equivalent — only for foreign currency */}
              {!isMWK && (
                <div className="px-4 py-2.5 bg-blue-50/40 flex items-center justify-between">
                  <span className="text-xs text-blue-700">
                    Gross (MWK equivalent)
                    <span className="ml-1 text-blue-400 text-[11px]">
                      {fmtFX(d.grossFX)} × {fmtMWK(middleRate)}
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-blue-800 tabular-nums">
                    MWK {fmtMWK(d.grossMWK)}
                  </span>
                </div>
              )}

              {/* PAYE section header */}
              <div className="px-4 pt-2 pb-1 bg-amber-50/60">
                <p className="text-xs font-semibold text-amber-700">
                  PAYE — Malawi Tax Bands (applied to MWK {fmtMWK(d.grossMWK)})
                </p>
                <div className="mt-1 space-y-0.5 pl-2">
                  <BandRow label={`Band 1: 0%  up to MWK ${fmtMWK(170_000 / 12)}`}                                                 hit={d.grossMWK > 0} />
                  <BandRow label={`Band 2: 30% on MWK ${fmtMWK(170_000/12)} – ${fmtMWK(1_570_000/12)}`}   hit={d.grossMWK > 170_000/12} />
                  <BandRow label={`Band 3: 35% on MWK ${fmtMWK(1_570_000/12)} – ${fmtMWK(10_000_000/12)}`} hit={d.grossMWK > 1_570_000/12} />
                  <BandRow label={`Band 4: 40% above MWK ${fmtMWK(10_000_000/12)}`}                         hit={d.grossMWK > 10_000_000/12} />
                </div>
              </div>

              {/* PAYE */}
              <BreakdownRow
                label="PAYE"
                mwkCell={{ amount: d.payeMWK }}
                fxCell={isMWK ? null : { currency, amount: d.payeFX }}
                isMWK={isMWK}
                negative
              />

              {/* NSSF */}
              <BreakdownRow
                label="NSSF Employee Contribution (3%)"
                mwkCell={{ amount: d.nssfMWK }}
                fxCell={isMWK ? null : { currency, amount: d.nssfFX }}
                isMWK={isMWK}
                negative
              />

              {/* Pension */}
              <BreakdownRow
                label={`Pension (${pensionRate}%)`}
                mwkCell={{ amount: d.pensionMWK }}
                fxCell={isMWK ? null : { currency, amount: d.pensionFX }}
                isMWK={isMWK}
                negative
              />

              {/* Divider before net */}
              <div className="border-t-2 border-gray-200" />

              {/* Net MWK */}
              <BreakdownRow
                label="Net Salary (MWK)"
                mwkCell={{ amount: d.netMWK }}
                fxCell={null}
                isMWK={true}
                bold
              />

              {/* Net original currency — only for foreign */}
              {!isMWK && (
                <div className="px-4 py-3 bg-brand-navy/5 flex items-center justify-between">
                  <span className="text-sm font-bold text-brand-navy">
                    Net Salary ({currency})
                    <span className="ml-1 text-xs font-normal text-gray-500">
                      MWK {fmtMWK(d.netMWK)} ÷ {fmtMWK(middleRate)}
                    </span>
                  </span>
                  <span className="text-lg font-bold text-brand-navy tabular-nums">
                    {currency} {fmtFX(d.netFX)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prompt if gross is empty */}
        {!d && gross === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">
            Enter a gross salary above to see the breakdown.
          </p>
        )}

        <p className="text-xs text-gray-400 italic">
          Note: For consultants, Withholding Tax (WHT) of 20% applies instead of PAYE and NSSF.
          Manage consultant payments under Requests.
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

/**
 * One row in the breakdown table.
 *
 * For MWK employees:  label | MWK amount
 * For FX employees:   label | MWK amount | FX amount
 */
function BreakdownRow({
  label,
  mwkCell,
  fxCell,
  isMWK,
  negative,
  bold,
}: {
  label: string;
  mwkCell: { amount: number } | null;
  fxCell:  { currency: string; amount: number } | null;
  isMWK: boolean;
  negative?: boolean;
  bold?: boolean;
}) {
  const sign = negative ? "− " : "";
  const textCls = negative ? "text-red-600" : bold ? "text-brand-navy" : "text-gray-800";
  const sizeCls = bold ? "text-sm font-bold" : "text-xs font-semibold";

  return (
    <div className={`flex items-center px-4 py-2.5 gap-2 ${bold ? "bg-gray-50" : ""}`}>
      {/* Label */}
      <span className="flex-1 text-xs text-gray-600">{label}</span>

      {/* MWK column — always shown */}
      {mwkCell !== null && (
        <span className={`tabular-nums ${sizeCls} ${textCls} ${isMWK ? "" : "min-w-[160px] text-right"}`}>
          {sign}MWK {fmtMWK(Math.abs(mwkCell.amount))}
        </span>
      )}

      {/* FX column — only for foreign-currency employees */}
      {!isMWK && fxCell !== null && (
        <span className={`tabular-nums text-xs font-semibold ${negative ? "text-red-400" : "text-gray-500"} min-w-[110px] text-right`}>
          {sign}{fxCell.currency} {fmtFX(Math.abs(fxCell.amount))}
        </span>
      )}

      {/* MWK-only employees: fxCell column placeholder to keep alignment consistent */}
      {isMWK && fxCell === null && mwkCell === null && <span />}
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
