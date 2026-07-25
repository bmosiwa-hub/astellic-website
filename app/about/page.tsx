import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, FadeUp, FadeIn, SlideLeft, SlideRight, ScaleIn } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "About Astellic | African Advisory & Evidence-to-Delivery Firm",
  description:
    "Astellic is a specialist African advisory firm helping governments, donors, and corporations close the gap between what evidence shows, what policy intends, and what systems deliver.",
};

const highlights = [
  { label: "Headquarters", value: "Lilongwe, Malawi" },
  { label: "Reach",        value: "Pan-African · 9+ countries" },
  { label: "Model",        value: "Senior-present" },
];

const notUs = [
  "Not a large implementation contractor",
  "Not a generic research consultancy",
  "Not an NGO",
  "Not advice from the outside looking in",
];

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-brand-navy text-white py-28 px-6 overflow-hidden">
        <Image
          src="/images/hero-thematic.jpg"
          alt="Astellic advisory environment"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-5 animate-fade-up">
            About Astellic
          </p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-7 max-w-3xl animate-fade-up delay-100">
            The firm that understands why systems fail.
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed animate-fade-up delay-200">
            Astellic exists to close the gap between what evidence is showing,
            what policy intends, and what systems actually deliver.
          </p>
        </div>
      </section>

      {/* ── Identity ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_auto] gap-14 items-start">
          <SlideLeft>
            <div>
              <p className="text-brand-gold text-base font-bold uppercase tracking-widest mb-4">Who We Are</p>
              <h2 className="text-3xl font-bold text-brand-navy mb-8 leading-snug">
                A specialist advisory firm.<br />African-led. Evidence-driven. Practically useful.
              </h2>

              {/* First para + pull quote side-by-side */}
              <p className="text-brand-muted text-lg leading-relaxed mb-8">
                Astellic is a research, advisory, and implementation firm based in Lilongwe, Malawi.
                We work with governments, donors, development organisations, and corporations to help them
                generate rigorous evidence, translate it into implementable policy and strategy, and build
                the institutional conditions that allow well-designed programmes to deliver sustained results.
              </p>

              {/* Pull quote */}
              <FadeUp delay={100}>
                <div className="border-l-4 border-brand-gold bg-white rounded-r-xl px-6 py-5 mb-8">
                  <p className="text-brand-navy font-semibold text-lg leading-snug">
                    &ldquo;The implementation gap is not a technical problem.
                    It is a systems problem. We address it as one.&rdquo;
                  </p>
                </div>
              </FadeUp>

              <p className="text-brand-muted text-lg leading-relaxed mb-8">
                Our work combines analytical rigour, contextual intelligence, and operational realism.
                We bring together capabilities that are typically fragmented — adaptive MERL, data quality
                and verification, policy analysis, and implementation support — into a coherent,
                decision-focused approach grounded in how African systems actually work.
              </p>

              {/* What we are not */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="text-base font-bold uppercase tracking-widest text-brand-muted mb-4">What Astellic Is Not</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {notUs.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-brand-muted">
                      <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SlideLeft>

          <SlideRight>
            <div className="space-y-3 md:w-56">
              {highlights.map((h) => (
                <div key={h.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <p className="text-base font-bold uppercase tracking-widest text-brand-muted mb-1">{h.label}</p>
                  <p className="font-semibold text-brand-navy text-sm">{h.value}</p>
                </div>
              ))}
              <Link
                href="/about/our-team"
                className="block bg-brand-navy text-white rounded-xl p-5 shadow-sm text-center hover:bg-brand-navy/90 transition-colors"
              >
                <p className="text-base font-bold uppercase tracking-widest text-brand-gold mb-1">Leadership</p>
                <p className="font-semibold text-white text-sm">Meet Dr. Mosiwa →</p>
              </Link>
            </div>
          </SlideRight>
        </div>
      </section>

      {/* ── Founding Narrative ───────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <p className="text-brand-gold text-base font-bold uppercase tracking-widest mb-8">
              On Founding
            </p>
          </FadeUp>
          <div className="grid md:grid-cols-[1fr_260px] gap-12 items-start">
            <div className="space-y-6 text-brand-muted text-lg leading-relaxed">
              <FadeUp delay={80}>
                <p>
                  Astellic was not created because there was a gap in the consulting market.
                  It was created because there is a specific, identifiable failure in how
                  development organisations produce and use evidence — and because the organisations
                  best positioned to address it are typically the ones least incentivised to do so.
                </p>
              </FadeUp>
              <FadeUp delay={120}>
                <p>
                  The founder spent over a decade working inside Malawi&apos;s health system and
                  African development institutions — as a clinician, as a programme manager
                  embedded in partnership with the Ministry of Health and Population, as a
                  health financing researcher across four countries, and as a global-level
                  policy advisor. He watched well-designed programmes fail not for lack of
                  funding or intent, but because the systems linking evidence to decision to
                  delivery were broken. He reviewed evaluations that produced findings no one
                  acted on. He observed policy translated from one context to the next without
                  the political economy analysis that would have made it workable. He saw data
                  that institutions collected but could not trust.
                </p>
              </FadeUp>
              <FadeUp delay={160}>
                <p>
                  Astellic is the institutional form of a straightforward belief: that if you
                  produce genuinely rigorous evidence, translate it into actionable policy with
                  appropriate honesty, and build the implementation systems that actually determine
                  whether programmes deliver — you create the conditions for sustained impact.
                  Not because impact is guaranteed. But because the analytical and institutional
                  foundations are sound.
                </p>
              </FadeUp>
              <FadeUp delay={200}>
                <p className="text-brand-navy font-semibold border-l-4 border-brand-gold pl-5">
                  This is advisory from the inside. Not from the outside looking in.
                </p>
              </FadeUp>
            </div>
            <FadeUp delay={140}>
              <div className="space-y-5 pt-2">
                <div className="bg-brand-light rounded-xl p-5 border-l-4 border-brand-teal">
                  <p className="text-brand-navy font-bold text-xs uppercase tracking-widest mb-1.5">The Belief</p>
                  <p className="text-brand-muted text-sm leading-relaxed">
                    Evidence works when it is designed for decisions, not for publication.
                    Implementation succeeds when advisory is grounded in how systems actually function.
                  </p>
                </div>
                <div className="bg-brand-light rounded-xl p-5 border-l-4 border-brand-navy">
                  <p className="text-brand-navy font-bold text-xs uppercase tracking-widest mb-1.5">The Commitment</p>
                  <p className="text-brand-muted text-sm leading-relaxed">
                    Senior expertise present throughout — not just at the proposal stage.
                    The work does not end with the document.
                  </p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── The Problem Statement ─────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-brand-navy text-white">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <p className="text-brand-gold text-base font-bold uppercase tracking-widest mb-5">
              The Problem We Solve
            </p>
            <blockquote className="text-2xl md:text-3xl font-bold leading-snug mb-10 max-w-3xl">
              &ldquo;Well-funded strategies and credible commitments consistently fail to deliver
              measurable results — not because of weak intent, but because of a persistent
              breakdown between analysis, decision-making, and execution.&rdquo;
            </blockquote>
          </FadeUp>

          {/* Pipeline break diagram */}
          <FadeUp delay={100}>
            <div className="mb-12 overflow-x-auto">
              <div className="flex items-center justify-start md:justify-center gap-0 min-w-max md:min-w-0 mx-auto">
                {[
                  { node: "Evidence", color: "bg-brand-navy border-white/30" },
                  { node: "Policy", color: "bg-brand-teal border-white/30" },
                  { node: "Delivery", color: "bg-brand-green border-white/30" },
                  { node: "Learning", color: "bg-brand-gold border-white/30" },
                ].map((item, i, arr) => (
                  <div key={item.node} className="flex items-center">
                    {/* Node */}
                    <div className={`${item.color} border rounded-lg px-4 py-2.5 text-white text-sm font-bold`}>
                      {item.node}
                    </div>
                    {/* Gap indicator between nodes */}
                    {i < arr.length - 1 && (
                      <div className="flex items-center mx-1">
                        <div className="w-4 h-px bg-white/20" />
                        <div className="flex flex-col items-center mx-1">
                          <svg className="w-3 h-3 text-red-400" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                          <span className="text-red-400/60 text-[9px] font-medium mt-0.5 uppercase tracking-wider whitespace-nowrap">gap</span>
                        </div>
                        <div className="w-4 h-px bg-white/20" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-4 text-center md:text-left">
                Three persistent breakdowns. Astellic addresses each as a systems problem.
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: "The gap", stat: "Evidence → Policy", desc: "Research rarely reaches the decision-makers who need it, in a form they can use." },
              { label: "The gap", stat: "Policy → Delivery", desc: "Well-designed strategies fail when institutional readiness is assumed, not assessed." },
              { label: "The gap", stat: "Delivery → Learning", desc: "Programmes rarely build in the adaptive systems needed to course-correct in real time." },
            ].map((g, i) => (
              <Reveal key={i} variant="up" delay={i * 80}>
                <div className="border border-white/10 rounded-xl p-6">
                  <p className="text-brand-gold text-base font-bold uppercase tracking-widest mb-2">{g.label}</p>
                  <p className="text-white font-bold text-lg mb-3">{g.stat}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{g.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Current Focus ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-14">
            <SlideLeft>
              <div>
                <p className="text-brand-gold text-base font-bold uppercase tracking-widest mb-4">What We Do</p>
                <h2 className="text-2xl font-bold text-brand-navy mb-5">
                  Three Services. Exceptional Depth.
                </h2>
                <p className="text-brand-muted text-base leading-relaxed mb-6">
                  We do not try to be everything to everyone.
                  That focus is what makes our work reliable — and what distinguishes it
                  from firms with broad service menus and shallow delivery.
                </p>
                <div className="space-y-3">
                  {[
                    { num: "01", title: "Adaptive MERL & Learning Systems",                color: "bg-brand-navy",  href: "/what-we-do/evidence/evaluation-learning" },
                    { num: "02", title: "Data Quality, Verification & Research Integrity", color: "bg-brand-teal",  href: "/what-we-do/evidence/data-quality" },
                    { num: "03", title: "Policy, Systems Analysis & Implementation Support",color: "bg-brand-green", href: "/what-we-do/implementation" },
                    { num: "+",  title: "Corporate Advisory & Social Investment",           color: "bg-brand-gold",  href: "/institutions-we-support/corporate-institutions" },
                  ].map((s, i) => (
                    <Reveal key={s.num} variant="up" delay={i * 80}>
                      <Link href={s.href} className="flex items-center gap-3 group">
                        <span className={`${s.color} text-white text-xs font-bold px-2 py-1 rounded shrink-0`}>{s.num}</span>
                        <p className="text-brand-navy text-sm font-medium group-hover:text-brand-gold transition-colors">{s.title}</p>
                        <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-brand-gold transition-colors ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </Reveal>
                  ))}
                </div>
                <Link href="/what-we-do" className="inline-flex items-center gap-1.5 text-brand-gold font-semibold text-sm mt-6 hover:gap-2.5 transition-all">
                  Full delivery architecture
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </SlideLeft>
            <SlideRight>
              <div>
                <p className="text-brand-gold text-base font-bold uppercase tracking-widest mb-4">Primary Domains</p>
                <h2 className="text-2xl font-bold text-brand-navy mb-5">
                  Where We Currently Work
                </h2>
                <div className="space-y-3 mb-8">
                  {[
                    { label: "Health",            primary: true },
                    { label: "Public Financial Management",           primary: true },
                    { label: "Social Development",    primary: false },
                    { label: "Environmental Sustainability", primary: false },
                  ].map((d) => (
                    <div key={d.label} className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${d.primary ? "bg-brand-teal" : "bg-gray-300"} shrink-0`} />
                      <span className={`text-sm ${d.primary ? "text-brand-navy font-medium" : "text-brand-muted"}`}>
                        {d.label}
                        {d.primary && <span className="ml-2 text-xs text-brand-teal font-semibold">(Primary)</span>}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Engagement model callout */}
                <div className="bg-brand-light rounded-xl p-5 border-l-4 border-brand-gold">
                  <p className="text-base font-bold uppercase tracking-widest text-brand-muted mb-2">Engagement Model</p>
                  <p className="text-brand-navy font-semibold text-sm leading-snug">
                    The person who designs your engagement is the person who delivers it.
                  </p>
                  <p className="text-brand-muted text-xs mt-1 leading-relaxed">
                    Senior expertise does not disappear after the proposal is signed.
                  </p>
                </div>
              </div>
            </SlideRight>
          </div>
        </div>
      </section>

      {/* ── Navigation cards ─────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { title: "Vision & Mission",  href: "/about/vision-mission", desc: "The purpose that drives every engagement and how we define success." },
              { title: "Our Team",          href: "/about/our-team",        desc: "Dr. Mosiwa's career, expertise, and the institutional depth behind the firm." },
              { title: "Why Astellic",      href: "/why-astellic",          desc: "What makes us different — and why it matters for how the work gets done." },
            ].map((card, i) => (
              <Reveal key={card.href} variant="up" delay={i * 80}>
                <Link
                  href={card.href}
                  className="group bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow lift block"
                >
                  <h3 className="font-bold text-brand-navy mb-2 group-hover:text-brand-gold transition-colors">{card.title}</h3>
                  <p className="text-brand-muted text-sm leading-relaxed">{card.desc}</p>
                  <span className="inline-flex items-center gap-1 text-brand-gold font-semibold text-xs mt-4 group-hover:gap-2 transition-all">
                    Read more →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
