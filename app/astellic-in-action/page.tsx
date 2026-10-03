import Link from "next/link";
import { Reveal, FadeUp } from "@/components/Reveal";
import {
  STORIES,
  PORTFOLIOS,
  PORTFOLIO_BLURB,
  ACCENT_CLASSES,
  type Portfolio,
} from "@/lib/stories";

export const metadata = {
  title: "Astellic in Action | Evidence, Policy & Implementation",
  description:
    "Nine problems we know how to solve — curated stories across evidence, policy and implementation, drawn from the founder's experience across African health systems.",
};

const PILL_ANCHOR: Record<Portfolio, string> = {
  Evidence: "evidence",
  Policy: "policy",
  Implementation: "implementation",
};

function StoryCard({ story }: { story: (typeof STORIES)[number] }) {
  const a = ACCENT_CLASSES[story.accent];
  return (
    <Link
      href={`/astellic-in-action/${story.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col lift"
    >
      <div className={`h-1.5 ${a.bg}`} />
      <div className="p-6 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${a.dot}`} />
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">
            {story.portfolio}
          </span>
        </div>
        <h3 className="font-bold text-brand-navy text-lg leading-snug group-hover:text-brand-teal transition-colors">
          {story.title}
        </h3>
        <p className="text-brand-muted text-sm leading-relaxed flex-1">{story.subtitle}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {story.geography.slice(0, 4).map((g) => (
            <span key={g} className="text-[11px] text-brand-navy/70 bg-brand-light px-2 py-0.5 rounded-full">
              {g}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-brand-muted/80 border-t border-gray-100 pt-3 mt-1">
          {story.attribution}
        </p>
        <span className="inline-flex items-center gap-1 text-brand-gold font-semibold text-sm group-hover:gap-2 transition-all">
          Read the story →
        </span>
      </div>
    </Link>
  );
}

export default function AstellicInActionPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-navy text-white py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-brand-gold text-sm font-bold uppercase tracking-[0.2em] mb-5">
              Astellic in Action
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] mb-6 max-w-3xl">
              Nine problems we know how to solve.
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl leading-relaxed">
              Evidence exists. Policies exist. Programmes exist. But somewhere between them,
              things break down. These are nine real problems from across African health
              systems — and how they were worked, through evidence, policy and implementation.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Attribution note — the credibility spine */}
      <section className="bg-[#0b1a38] border-b border-white/10 py-5 px-6">
        <p className="max-w-5xl mx-auto text-gray-400 text-sm leading-relaxed">
          Astellic is a new, founder-led firm. Every story below is the{" "}
          <span className="text-white font-semibold">founder&rsquo;s own experience</span> —
          prior roles and personal consultancies across African health systems — brought to
          Astellic. We label each one honestly and never present it as a firm engagement.
        </p>
      </section>

      {/* Pill nav */}
      <section className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100 py-3 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-2 justify-center">
          {PORTFOLIOS.map((p) => (
            <a
              key={p}
              href={`#${PILL_ANCHOR[p]}`}
              className="text-sm font-semibold text-brand-navy border border-gray-200 hover:border-brand-gold hover:text-brand-gold px-4 py-1.5 rounded-full transition-colors"
            >
              {p}
            </a>
          ))}
        </div>
      </section>

      {/* Portfolio sections */}
      {PORTFOLIOS.map((p) => {
        const stories = STORIES.filter((s) => s.portfolio === p);
        const accent = ACCENT_CLASSES[stories[0].accent];
        return (
          <section key={p} id={PILL_ANCHOR[p]} className="py-16 px-6 odd:bg-brand-light scroll-mt-16">
            <div className="max-w-6xl mx-auto">
              <FadeUp className="mb-8 max-w-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`w-8 h-1 rounded ${accent.bg}`} />
                  <h2 className="text-3xl font-bold text-brand-navy">{p}</h2>
                </div>
                <p className="text-brand-muted text-lg leading-relaxed">{PORTFOLIO_BLURB[p]}</p>
              </FadeUp>
              <div className="grid md:grid-cols-3 gap-6">
                {stories.map((s, i) => (
                  <Reveal key={s.slug} variant="up" delay={i * 80}>
                    <StoryCard story={s} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <section className="bg-brand-navy text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-5">
              Working through a complex health-system problem?
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Tell us what you&rsquo;re working on. We&rsquo;ll tell you honestly whether we can help.
            </p>
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
