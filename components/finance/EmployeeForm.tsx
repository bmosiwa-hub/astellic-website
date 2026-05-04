"use client";

import { useState, useTransition } from "react";

const DEPARTMENTS = [
  "Administration",
  "Finance",
  "Human Resources",
  "Projects",
  "Support Staff",
] as const;

// ── Local mirrors of lib/finance-utils.ts (client-side, no server import) ────

function calcPAYE(mwkGross: number): number {
  const B1 = 170_000 / 12;
  const B2 = 1_570_000 / 12;
  const B3 = 10_000_000 / 12;
  if (mwkGross <= B1) return 0;
  let tax = 0;
  tax += (Math.min(mwkGross, B2) - B1) * 0.30;
  if (mwkGross > B2) tax += (Math.min(mwkGross, B3) - B2) * 0.35;
  if (mwkGross > B3) tax += (mwkGross - B3) * 0.40;
  return Math.round(tax * 100) / 100;
}

function r2(n: number) { return Math.round(n * 100) / 100; }

function calcDeductions(grossSalary: number, pensionRate: number, middleRate: number) {
  const rate      = middleRate > 0 ? middleRate : 1;
  const grossMWK  = r2(grossSalary * rate);
  const payeMWK   = calcPAYE(grossMWK);
  const nssfMWK   = r2(grossMWK * 0.03);
  const pensionMWK= r2(grossMWK * (pensionRate / 100));
  const netMWK    = grossMWK - payeMWK - nssfMWK - pensionMWK;
  return {
    grossMWK,
    payeMWK,   paye:    r2(payeMWK    / rate),
    nssfMWK,   nssf:    r2(nssfMWK   / rate),
    pensionMWK,pension: r2(pensionMWK / rate),
    netMWK,    net:     r2(netMWK     / rate),
  };
}

function fmtMWK(n: number) {
  return n.toLocaleString("en-MW", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtFX(n: number, dp = 4) {
  return n.toLocaleString("en-MW", { minimumFractionDigits: 2, maximumFractionDigits: dp });
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StoredRate {
  currency:         string;
  middleRate:       number;
  effectiveDateStr: string; // pre-formatted on server
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

  // Lookup stored RBM/manual rate for the selected currency
  const isMWK      = currency === "MWK";
  const storedRate = rates.find((r) => r.currency === currency);
  const middleRate = isMWK ? 1 : (storedRate?.middleRate ?? 0);
  const hasRate    = isMWK || middleRate > 0;

  const d = gross > 0 && hasRate
    ? calcDeductions(gross, pensionRate, middleRate)
    : null;

  // All available currencies = MWK + whatever has a rate stored
  const availableCurrencies = ["MWK", ...rates.map((r) => r.currency).filter((c) => c !== "MWK")].sort();

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
              {availableCurrencies.map(c => <option key={c}>{c}</option>)}
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

        {/* No rate available warning */}
        {!isMWK && !storedRate && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            <strong>No exchange rate on file for {currency}.</strong>{" "}
            Go to <a href="/astelfin_26/exchange-rates" className="underline font-semibold">Exchange Rates</a> and
            either refresh from RBM or add a manual rate to see the salary breakdown.
          </div>
        )}

        {/* Rate info banner (foreign currency only) */}
        {!isMWK && storedRate && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 flex items-center justify-between text-xs text-blue-800">
            <span>
              Using <strong>{storedRate.source}</strong> middle rate:{" "}
              <strong>1 {currency} = MWK {fmtMWK(storedRate.middleRate)}</strong>
            </span>
            <span className="text-blue-500">
              Effective {storedRate.effectiveDateStr} ·{" "}
              <a href="/astelfin_26/exchange-rates" className="underline hover:text-blue-700">update</a>
            </span>
          </div>
        )}

        {/* ── Live breakdown ─────────────────────────────────── */}
        {d && (
          <div className="rounded-xl bg-gray-50 border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                Monthly Salary Breakdown
              </p>
              {!isMWK && (
                <p className="text-xs text-gray-500">
                  All taxes calculated on MWK equivalent · Net converted back to {currency}
                </p>
              )}
            </div>

            <div className="divide-y divide-gray-100">

              {/* ── Gross ──────────────────────────────────── */}
              <SalaryRow
                label="Gross Salary"
                mwk={d.grossMWK}
                fx={isMWK ? null : { amount: gross, currency }}
                isMWK={isMWK}
              />

              {/* ── Conversion step (foreign only) ─────────── */}
              {!isMWK && (
                <div className="px-4 py-2 bg-blue-50/60">
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">{currency} {fmtFX(gross, 2)}</span>
                    {" × "}
                    <span className="font-semibold">{fmtMWK(middleRate)}</span>
                    {" = "}
                    <span className="font-semibold">MWK {fmtMWK(d.grossMWK)}</span>
                    <span className="text-blue-400 ml-1">(MWK equivalent used for tax)</span>
                  </p>
                </div>
              )}

              {/* ── PAYE ───────────────────────────────────── */}
              <div className="px-4 py-2 bg-amber-50/50">
                <p className="text-xs font-semibold text-amber-700 mb-1.5">
                  PAYE — calculated on MWK {fmtMWK(d.grossMWK)}
                </p>
                <div className="space-y-0.5 pl-2">
                  <BandRow label={`Band 1: 0%  on first MWK ${fmtMWK(170_000 / 12)}`}       hit={d.grossMWK > 0} />
                  <BandRow label={`Band 2: 30% on MWK ${fmtMWK(170_000/12)} – ${fmtMWK(1_570_000/12)}`} hit={d.grossMWK > 170_000/12} />
                  <BandRow label={`Band 3: 35% on MWK ${fmtMWK(1_570_000/12)} – ${fmtMWK(10_000_000/12)}`} hit={d.grossMWK > 1_570_000/12} />
                  <BandRow label={`Band 4: 40% above MWK ${fmtMWK(10_000_000/12)}`}          hit={d.grossMWK > 10_000_000/12} />
                </div>
              </div>

              <SalaryRow
                label="PAYE"
                mwk={-d.payeMWK}
                fx={isMWK ? null : { amount: -d.paye, currency }}
                isMWK={isMWK}
                negative
              />
              <SalaryRow
                label="NSSF Employee Contribution (3%)"
                mwk={-d.nssfMWK}
                fx={isMWK ? null : { amount: -d.nssf, currency }}
                isMWK={isMWK}
                negative
              />
              <SalaryRow
                label={`Pension (${pensionRate}%)`}
                mwk={-d.pensionMWK}
                fx={isMWK ? null : { amount: -d.pension, currency }}
                isMWK={isMWK}
                negative
              />

              {/* ── Net ────────────────────────────────────── */}
              <div className="px-4 py-3 bg-brand-navy/5">
                {isMWK ? (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-brand-navy">Net Salary</span>
                    <span className="text-lg font-bold text-brand-navy">
                      MWK {fmtMWK(d.netMWK)}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-gray-600">Net (MWK)</span>
                      <span className="text-sm font-bold text-gray-700">MWK {fmtMWK(d.netMWK)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-brand-navy/10">
                      <span className="text-sm font-bold text-brand-navy">
                        Net Salary ({currency})
                        <span className="font-normal text-xs text-gray-500 ml-1">
                          ÷ {fmtMWK(middleRate)}
                        </span>
                      </span>
                      <span className="text-lg font-bold text-brand-navy">
                        {currency} {fmtFX(d.net, 2)}
                      </span>
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Empty state */}
        {!d && gross > 0 && !hasRate && (
          <div className="rounded-xl bg-gray-50 border border-dashed border-gray-200 px-4 py-6 text-center text-xs text-gray-400">
            Enter an exchange rate for {currency} to see the salary breakdown.
          </div>
        )}

        <p className="text-xs text-gray-400 italic">
          Note: For consultants, Withholding Tax (WHT) of 20% is applied instead of PAYE and NSSF.
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

/**
 * A single row showing the MWK amount and optionally the foreign-currency equivalent.
 */
function SalaryRow({
  label,
  mwk,
  fx,
  isMWK,
  negative,
}: {
  label: string;
  mwk: number;
  fx: { amount: number; currency: string } | null;
  isMWK: boolean;
  negative?: boolean;
}) {
  const sign  = negative && mwk !== 0 ? "−" : "";
  const absMWK = Math.abs(mwk);

  return (
    <div className="flex justify-between items-center px-4 py-2.5">
      <span className="text-xs text-gray-600">{label}</span>
      <div className="text-right tabular-nums">
        {!isMWK && fx && (
          <p className={`text-[11px] ${negative ? "text-red-400" : "text-gray-400"}`}>
            {sign}{fx.currency} {fmtFX(Math.abs(fx.amount), 2)}
          </p>
        )}
        <p className={`text-xs font-semibold ${negative ? "text-red-600" : "text-gray-800"}`}>
          {sign}MWK {fmtMWK(absMWK)}
        </p>
      </div>
    </div>
  );
}

function BandRow({ label, hit }: { label: string; hit: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs ${hit ? "text-amber-800" : "text-gray-400"}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${hit ? "bg-amber-500" : "bg-gray-300"}`} />
      {label}
    </div>
  );
}
