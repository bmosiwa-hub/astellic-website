"use client";

/**
 * Dynamic form for creating a new PAYEBandSet with a variable number of bands.
 * Serialises band data as JSON into a hidden field for the server action.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Band {
  fromAmount: number | "";
  toAmount:   number | "" | null;
  rate:       number | "";
}

const INITIAL_BANDS: Band[] = [
  { fromAmount: 0,          toAmount: 170_000,   rate: 0  },
  { fromAmount: 170_000,    toAmount: 1_570_000, rate: 30 },
  { fromAmount: 1_570_000,  toAmount: null,      rate: 35 },
];

export function CreateBandSetForm() {
  const router  = useRouter();
  const [bands,   setBands]   = useState<Band[]>(INITIAL_BANDS);
  const [label,   setLabel]   = useState("");
  const [date,    setDate]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  function addBand() {
    setBands((prev) => [
      ...prev,
      { fromAmount: "", toAmount: null, rate: "" },
    ]);
  }

  function removeBand(idx: number) {
    setBands((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateBand(idx: number, field: keyof Band, value: string) {
    setBands((prev) =>
      prev.map((b, i) => {
        if (i !== idx) return b;
        if (field === "toAmount") {
          return { ...b, toAmount: value === "" ? null : Number(value) };
        }
        return { ...b, [field]: value === "" ? "" : Number(value) };
      })
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!label.trim() || !date) {
      setError("Label and effective date are required.");
      return;
    }

    for (const b of bands) {
      if (b.fromAmount === "" || b.rate === "") {
        setError("All bands must have a From amount and Rate.");
        return;
      }
    }

    const bandsJson = JSON.stringify(
      bands.map((b) => ({
        fromAmount: Number(b.fromAmount),
        toAmount:   b.toAmount === "" ? null : b.toAmount === null ? null : Number(b.toAmount),
        rate:       Number(b.rate),
      }))
    );

    const fd = new FormData();
    fd.append("label",         label);
    fd.append("effectiveFrom", date);
    fd.append("bandsJson",     bandsJson);

    setLoading(true);
    try {
      const res = await fetch("/api/settings/paye-bands", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "Save failed.");
        return;
      }
      router.refresh();
      setLabel("");
      setDate("");
      setBands(INITIAL_BANDS);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Label *</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. MRA Bands 2025/26"
            required
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Effective from *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
          />
        </div>
      </div>

      {/* Band rows */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-600">Tax bands (MWK monthly)</label>
          <button
            type="button"
            onClick={addBand}
            className="text-xs text-brand-gold hover:underline"
          >
            + Add band
          </button>
        </div>
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">From (MWK)</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">To (MWK, blank = no limit)</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Rate %</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bands.map((band, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      value={band.fromAmount}
                      onChange={(e) => updateBand(idx, "fromAmount", e.target.value)}
                      placeholder="0"
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      value={band.toAmount === null ? "" : band.toAmount}
                      onChange={(e) => updateBand(idx, "toAmount", e.target.value)}
                      placeholder="No limit"
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={band.rate}
                      onChange={(e) => updateBand(idx, "rate", e.target.value)}
                      placeholder="0"
                      className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    {bands.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBand(idx)}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-navy text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-navy/90 transition-colors disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save band set"}
        </button>
      </div>
    </form>
  );
}
