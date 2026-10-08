import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FadeUp } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Results-Based Political Economy Analysis | Astellic Perspectives No. 01",
  description:
    "Astellic Perspectives No. 01 — Results-Based Political Economy Analysis (RB-PEA): from understanding power to navigating power for results. By Dr. Benjamin Azariah Mosiwa.",
};

const PDF = "/documents/Astellic_Perspectives_01_RB-PEA.pdf";
const PAGE_COUNT = 13;
const pages = Array.from({ length: PAGE_COUNT }, (_, i) => String(i + 1).padStart(2, "0"));

export default function RbPeaPage() {
  return (
    <>
      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-brand-navy text-white border-b border-white/10">
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <Link href="/insights" className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white text-sm transition-colors shrink-0">
            ← Insights
          </Link>
          <p className="hidden sm:block text-xs text-gray-400 truncate">
            Astellic Perspectives No. 01 · Results-Based Political Economy Analysis
          </p>
          <a
            href={PDF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white px-4 py-2 rounded font-semibold text-sm transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </a>
        </div>
      </div>

      {/* ── Document reader ──────────────────────────────────────────────── */}
      <div className="bg-gray-100 py-6 sm:py-10 px-0 sm:px-6">
        <div className="max-w-[900px] mx-auto space-y-4 sm:space-y-6">
          {pages.map((p, i) => (
            <Image
              key={p}
              src={`/perspectives/rb-pea/pg-${p}.jpg`}
              alt={`Results-Based Political Economy Analysis — page ${i + 1} of ${PAGE_COUNT}`}
              width={1490}
              height={2105}
              priority={i === 0}
              sizes="(max-width: 900px) 100vw, 900px"
              className="w-full h-auto block sm:rounded-lg shadow-md sm:shadow-lg"
            />
          ))}
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy text-white py-14 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-3">Astellic Perspectives · No. 01</p>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">
              Apply RB-PEA to your programme or reform.
            </h2>
            <p className="text-gray-300 leading-relaxed mb-8 max-w-xl mx-auto">
              Astellic works with governments, development partners, funders and implementing organisations
              to apply and develop results-based political economy approaches to complex development challenges.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={PDF} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white px-7 py-3.5 rounded font-semibold text-sm transition-colors">
                Download the brief (PDF)
              </a>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 border border-white/30 hover:border-white text-white px-7 py-3.5 rounded font-semibold text-sm transition-colors">
                Discuss applying RB-PEA
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
