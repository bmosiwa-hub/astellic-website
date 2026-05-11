"use client";

/**
 * Auto-triggers AI analysis for a NEW opportunity on mount.
 * Shows a loading card while the pipeline runs, then refreshes the page.
 * Also renders a "Re-analyse" button for already-analysed opportunities.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  opportunityId: string;
  autoRun: boolean; // true = NEW with no analysis, run immediately
}

export default function AnalysisTrigger({ opportunityId, autoRun }: Props) {
  const router = useRouter();
  const [running, setRunning] = useState(autoRun);
  const [error, setError]     = useState<string | null>(null);
  const [dots, setDots]       = useState(".");

  // Animated dots while running
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 600);
    return () => clearInterval(id);
  }, [running]);

  // Auto-run on mount if NEW
  useEffect(() => {
    if (!autoRun) return;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run() {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/intel/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: opportunityId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      // Refresh the server component to show fresh analysis
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setRunning(false);
    }
  }

  if (running) {
    return (
      <div className="bg-white rounded-2xl border border-brand-gold/30 shadow-sm px-6 py-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center mx-auto">
          <div className="w-5 h-5 rounded-full bg-brand-gold animate-pulse" />
        </div>
        <p className="text-sm font-semibold text-brand-navy">Running AI analysis{dots}</p>
        <p className="text-xs text-gray-400">
          Extracting structured data and assessing strategic fit. This takes 15–30 seconds.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-5 space-y-3">
        <p className="text-sm font-semibold text-red-700">Analysis failed</p>
        <p className="text-xs text-red-500">{error}</p>
        <button
          onClick={run}
          className="text-xs font-semibold text-red-600 hover:underline"
        >
          Try again →
        </button>
      </div>
    );
  }

  // Already analysed — show a subtle re-analyse button
  return (
    <div className="text-right">
      <button
        onClick={run}
        className="text-xs text-gray-400 hover:text-brand-navy hover:underline transition-colors"
      >
        ↻ Re-analyse
      </button>
    </div>
  );
}
