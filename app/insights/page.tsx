import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, FadeUp } from "@/components/Reveal";
import { PERSPECTIVES, perspectiveHref } from "@/lib/perspectives";

export const metadata: Metadata = {
  title: "Insights | Astellic",
  description:
    "Astellic's knowledge platform — Astellic Perspectives (our analysis of evidence, policy and implementation in Africa) and Inside African Systems (African voices on how development systems really work).",
};

export default function InsightsPage() {
  const featured = PERSPECTIVES[0];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy text-white py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <p className="text-brand-gold text-sm font-bold uppercase tracking-[0.2em] mb-5">
              Insights
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 max-w-3xl">
              Astellic&rsquo;s knowledge platform.
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl leading-relaxed">
              Two platforms, one knowledge cycle. <span className="text-white font-semibold">Astellic
              Perspectives</span> is our own analysis of evidence, policy and implementation.{" "}
              <span className="text-white font-semibold">Inside African Systems</span> gives a platform
              to the people who work inside those systems. Our analysis raises the questions; their
              experience tests and deepens it.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Platform 1 — Astellic Perspectives ───────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-1 rounded bg-brand-navy" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-muted">Our Analysis</p>
            </div>
            <h2 className="text-3xl font-bold text-brand-navy mb-3">Astellic Perspectives</h2>
            <p className="text-brand-muted text-lg max-w-2xl leading-relaxed mb-10">
              Astellic&rsquo;s intellectual voice: what we think, based on what we know and what we have
              seen. Analytical, practical, and grounded in African realities &mdash; a view, not a summary.
            </p>
          </FadeUp>

          {/* Featured Perspective */}
          <Reveal variant="up">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden grid md:grid-cols-[1.4fr_1fr]">
              <div className="p-8 md:p-10 order-2 md:order-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-white bg-brand-navy px-2.5 py-1 rounded">
                    Perspectives {featured.no}
                  </span>
                  <span className="text-xs text-brand-muted">{featured.date}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-brand-navy leading-snug mb-2">
                  <Link href={perspectiveHref(featured)} className="hover:text-brand-teal transition-colors">{featured.title}</Link>
                </h3>
                <p className="text-brand-gold font-semibold mb-1">{featured.subtitle}</p>
                <p className="text-sm text-brand-muted mb-5">{featured.author}</p>
                <p className="text-brand-muted text-base leading-relaxed mb-6">{featured.summary}</p>
                <div className="flex flex-wrap gap-2 mb-7">
                  {featured.tags.map((t) => (
                    <span key={t} className="text-xs font-medium text-brand-navy bg-brand-light px-3 py-1 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={perspectiveHref(featured)}
                    className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-3 rounded font-semibold text-sm transition-colors"
                  >
                    Read the Perspective →
                  </Link>
                  <a
                    href={featured.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white px-6 py-3 rounded font-semibold text-sm transition-colors"
                  >
                    Download PDF
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Framework visual — power → results */}
              <div className="order-1 md:order-2 bg-brand-navy text-white p-8 md:p-10 flex flex-col justify-center">
                <p className="text-[11px] font-bold uppercase tracking-widest text-brand-gold/80 mb-5">
                  The RB-PEA lens
                </p>
                <div className="space-y-2.5">
                  {["Power", "Institutions", "Incentives", "Action", "Results"].map((step, i) => (
                    <div key={step} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white/10 text-brand-gold text-[11px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className={`font-semibold ${i === 4 ? "text-brand-gold" : "text-white"}`}>{step}</span>
                      {i < 4 && <span className="text-white/30 ml-auto">↓</span>}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-6 leading-relaxed">
                  Four political gates every results pathway must pass: Authorise · Deliver · Adopt · Sustain.
                </p>
              </div>
            </div>
          </Reveal>

          <p className="text-sm text-brand-muted mt-6 italic">More Perspectives are in development.</p>
        </div>
      </section>

      {/* ── Platform 2 — Inside African Systems ──────────────────────────── */}
      <section className="py-20 px-6 bg-brand-light border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-1 rounded bg-brand-teal" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-muted">African Voices</p>
            </div>
            <h2 className="text-3xl font-bold text-brand-navy mb-3">Inside African Systems</h2>
            <p className="text-brand-muted text-lg max-w-2xl leading-relaxed mb-8">
              A platform for the people who work inside African systems &mdash; policymakers, practitioners,
              researchers and reformers &mdash; to explain how those systems really work, why they struggle,
              and what makes them work better. Many voices, one question: how do systems really work?
            </p>
          </FadeUp>

          <Reveal variant="up">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-4">Launching soon</p>
              <h3 className="text-xl md:text-2xl font-bold text-brand-navy leading-snug mb-4 max-w-2xl">
                Conversations, interviews and roundtables with people inside African systems.
              </h3>
              <p className="text-brand-muted text-base leading-relaxed max-w-2xl mb-7">
                We are convening a series of conversations across countries, sectors and generations.
                If you work inside a system &mdash; a ministry, a district, a programme, a reform &mdash; and can
                explain how it actually functions, we would like to hear from you.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white px-6 py-3 rounded font-semibold text-sm transition-colors"
              >
                Take part in the conversation
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">
              Working through a complex development challenge?
            </h2>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-8 py-4 rounded text-base transition-all duration-200 hover:scale-[1.02]"
            >
              Discuss a challenge
            </Link>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
