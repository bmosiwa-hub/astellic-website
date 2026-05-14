"use client";

/**
 * Phase 14 — Import Bank Statement
 * Client component that uploads a CSV and redirects to the review page.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CURRENCIES = ["MWK", "USD", "EUR", "GBP", "ZAR"];

export default function ImportStatementPage() {
  const router = useRouter();

  const [accountName, setAccountName] = useState("");
  const [bankName,    setBankName]    = useState("");
  const [currency,    setCurrency]    = useState("MWK");
  const [fromDate,    setFromDate]    = useState("");
  const [toDate,      setToDate]      = useState("");
  const [file,        setFile]        = useState<File | null>(null);
  const [error,       setError]       = useState<string | null>(null);
  const [loading,     setLoading]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Please select a CSV file."); return; }
    setError(null);
    setLoading(true);

    try {
      const body = new FormData();
      body.append("file",        file);
      body.append("accountName", accountName);
      body.append("bankName",    bankName);
      body.append("currency",    currency);
      body.append("fromDate",    fromDate);
      body.append("toDate",      toDate);

      const res = await fetch("/api/reconciliation", { method: "POST", body });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Upload failed.");
        return;
      }

      router.push(`/astelfin_26/reconciliation/${json.statementId}`);
    } catch (err) {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <Link href="/astelfin_26/reconciliation" className="hover:text-brand-gold">
            Reconciliation
          </Link>
          <span>›</span>
          <span className="text-gray-600">Import Statement</span>
        </div>
        <h1 className="text-2xl font-bold text-brand-navy">Import Bank Statement</h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload a CSV export from your bank. Transactions will be auto-matched against
          income, expense, payroll, and payable records.
        </p>
      </div>

      {/* CSV format guide */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 text-sm text-blue-700">
        <p className="font-semibold mb-1">Supported CSV formats</p>
        <p className="text-xs leading-relaxed">
          <strong>Format A (recommended):</strong> Date, Description, Debit, Credit, Balance<br />
          <strong>Format B:</strong> Date, Description/Narration, Amount (negative=debit), Balance<br />
          The first row must be a header. Date formats DD/MM/YYYY, YYYY-MM-DD, and D MMM YYYY are supported.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Account name</label>
            <input
              type="text"
              required
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. Astellic Operations Account"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bank name</label>
            <input
              type="text"
              required
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. Standard Bank Malawi"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
            >
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Statement from</label>
            <input
              type="date"
              required
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Statement to</label>
            <input
              type="date"
              required
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">CSV file</label>
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl px-6 py-8 text-center hover:border-brand-gold/40 transition-colors cursor-pointer"
            onClick={() => document.getElementById("csv-file")?.click()}
          >
            {file ? (
              <div className="text-sm">
                <p className="font-medium text-brand-navy">{file.name}</p>
                <p className="text-gray-400 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  type="button"
                  className="text-xs text-red-500 hover:underline mt-2"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-gray-500">Click to select a CSV file</p>
                <p className="text-xs text-gray-400 mt-1">or drag and drop</p>
              </>
            )}
          </div>
          <input
            id="csv-file"
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Link
            href="/astelfin_26/reconciliation"
            className="text-sm text-gray-500 hover:text-brand-navy"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-navy text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-navy/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Importing…" : "Import & Auto-Match"}
          </button>
        </div>
      </form>
    </div>
  );
}
