import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { HerVoiceProvider } from "./_lib/store";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    absolute: "HerVoice! — Survivor-led GBV Response & Accountability Platform",
    template: "%s | HerVoice!",
  },
  description:
    "HerVoice! by Astellic — a survivor-led GBV response and citizen accountability platform. Restricted demonstration environment.",
  robots: { index: false, follow: false },
};

export default function HerVoiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <HerVoiceProvider>
      <div className={`hv-root ${inter.className} text-gray-900 antialiased`}>
        {children}
      </div>
      {/* Accessibility mode: scale up type inside HerVoice only */}
      <style>{`
        .hv-a11y .hv-root { font-size: 112.5%; }
        .hv-a11y .hv-root .text-xs { font-size: 0.8rem; }
        .hv-a11y .hv-root .text-sm { font-size: 0.95rem; }

        /* Mobile type scale: the dense desktop-dashboard sizes (9-14px) are
           too small on phones — bump every small size on narrow screens.
           Scoped to .hv-root so the main Astellic site is untouched. */
        @media (max-width: 640px) {
          .hv-root .text-\\[9px\\]  { font-size: 0.6875rem; line-height: 1rem; }
          .hv-root .text-\\[10px\\] { font-size: 0.75rem;   line-height: 1.05rem; }
          .hv-root .text-\\[11px\\] { font-size: 0.8125rem; line-height: 1.15rem; }
          .hv-root .text-xs        { font-size: 0.875rem;  line-height: 1.3rem; }
          .hv-root .text-sm        { font-size: 0.9688rem; line-height: 1.45rem; }
          .hv-root table.text-sm   { font-size: 0.875rem; }
        }
      `}</style>
    </HerVoiceProvider>
  );
}
