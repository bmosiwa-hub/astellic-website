import Link from "next/link";
import Image from "next/image";
import OperatingModelDiagram from "@/components/OperatingModelDiagram";
import AfricaPresenceMap from "@/components/AfricaPresenceMap";
import WhoWeWorkWithSection from "@/components/WhoWeWorkWithSection";
import { Reveal, FadeUp } from "@/components/Reveal";

const commitments = [
  {
    label: "We Stay",
    desc: "Most advisors hand over a report and leave. Astellic stays. Our work does not end with a document. It ends when the learning is being used.",
  },
  {
    label: "We Are Honest",
    desc: "We tell clients what the evidence shows, including when it shows problems. That is not a risk. That is the service.",
  },
  {
    label: "We Know the Context",
    desc: "Our advice is grounded in how African systems actually work, not how they should work in theory. That difference changes everything.",
  },
  {
    label: "We Are Specialists",
    desc: "We do three things with exceptional depth. We do not try to be everything to everyone. That focus is what makes our work reliable.",
  },
  {
    label: "We Are Practically Useful",
    desc: "Every analysis Astellic produces helps a client make a better decision, improve a system, or solve a real problem.",
  },
];


const insightCards = [
  {
    category: "Implementation Brief",
    title: "Why Implementation Readiness Reviews Must Happen Before Programmes Launch",
    desc: "The most preventable programme failures begin not at the point of delivery, but in the design phase, when implementation readiness is assumed rather than assessed.",
    color: "bg-brand-navy text-white",
  },
  {
    category: "MERL Insight",
    title: "When M&E Becomes a Compliance Exercise: The Cost of Learning-Blind Monitoring",
    desc: "Programmes that design M&E systems around donor reporting frameworks rather than decision-making needs consistently miss the learning they most need.",
    color: "bg-brand-teal text-white",
  },
  {
    category: "Perspective",
    title: "Data Quality in African Health Systems: What We Found, and Why It Matters",
    desc: "After conducting data quality audits across multiple programme cycles, consistent patterns emerge that challenge assumptions about routine data reliability.",
    color: "bg-brand-gold text-white",
  },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-brand-navy text-white py-32 px-6 overflow-hidden">
        <Image
          src="/images/hero-home.jpg"
          alt="African policy advisory environment"
          fill
          className="object-cover opacity-90"
          priority
        />
        {/* Minimal dark scrim — just enough for text legibility, no blue tint */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-6 animate-fade-up">
            Research · Advisory · Implementation
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] mb-8 max-w-3xl animate-fade-up delay-100">
            Working at the Intersection of Evidence, Policy and Delivery.
          </h1>
          <p className="text-gray-300 text-xl md:text-2xl max-w-2xl leading-relaxed mb-12 animate-fade-up delay-200">
            Astellic helps governments, donors, and corporations translate evidence,
            strategy, and investment into measurable and sustainable outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up delay-300">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white px-8 py-4 rounded font-semibold text-base transition-all duration-200 hover:scale-[1.02]"
            >
              Discuss an Engagement
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/what-we-do"
              className="inline-flex items-center justify-center gap-2 border border-white/30 hover:border-white text-white px-8 py-4 rounded font-semibold text-base transition-colors"
            >
              Explore Our Work
            </Link>
          </div>
        </div>
      </section>

      {/* ── Impact Metrics Band ──────────────────────────────────────────── */}
      <section className="bg-[#0b1a38] border-b border-white/10 py-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-white/10">
          {[
            { value: "9+",  label: "Countries",              sub: "Across Africa"          },
            { value: "30+", label: "Engagements",            sub: "Research & advisory"    },
            { value: "10+", label: "Years Experience",       sub: "In African systems"     },
            { value: "15+", label: "Institutional Partners", sub: "Donors, UN, NGOs"       },
          ].map((stat, i) => (
            <Reveal key={stat.label} variant="up" delay={i * 80}>
              <div className="text-center px-6 py-4 first:pl-0 last:pr-0">
                <p className="text-brand-gold font-black text-4xl md:text-5xl leading-none mb-1 tabular-nums">
                  {stat.value}
                </p>
                <p className="text-white font-bold text-sm tracking-wide">{stat.label}</p>
                <p className="text-gray-500 text-xs mt-0.5">{stat.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Operating Model ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-10">
            <p className="text-brand-muted text-base font-bold uppercase tracking-[0.2em] mb-3">
              Our Operating Model
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
              A Continuous Cycle, Not a Linear Process
            </h2>
            <p className="text-brand-muted text-lg max-w-2xl mx-auto leading-relaxed">
              The implementation gap is not a technical problem. It is a systems problem.
              We address it as one: by integrating evidence, policy, and delivery into a
              single adaptive architecture.
            </p>
          </FadeUp>
          <Reveal variant="scale" delay={150}>
            <OperatingModelDiagram />
          </Reveal>
        </div>
      </section>

      {/* ── Who We Work With ─────────────────────────────────────────────── */}
      <WhoWeWorkWithSection />

      {/* ── Five Commitments ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-14">
            <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-3">
              Our Commitments
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Every Astellic Engagement Means
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
              These are not values statements. They are operating principles that govern every engagement.
            </p>
          </FadeUp>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {commitments.map((c, i) => (
              <Reveal key={c.label} variant="up" delay={i * 70}>
                <div className={`bg-white/5 rounded-xl p-6 border border-white/10 hover:border-brand-gold/50 hover:bg-white/8 transition-all duration-300 h-full ${i === 4 ? "sm:col-span-2 lg:col-span-1" : ""}`}>
                  <div className="w-6 h-0.5 bg-brand-gold mb-3 rounded" />
                  <p className="text-brand-gold font-bold text-base mb-2">{c.label}</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{c.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <FadeUp delay={200}>
            <div className="text-center mt-10">
              <Link
                href="/why-astellic"
                className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white font-semibold px-6 py-3 rounded transition-colors text-sm"
              >
                Why Institutions Choose Astellic
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Typographic Declaration ──────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="relative">
              {/* Large decorative quotation mark */}
              <div
                aria-hidden="true"
                className="absolute -top-8 -left-4 text-[10rem] md:text-[14rem] font-black leading-none select-none pointer-events-none"
                style={{ color: "rgba(212,175,55,0.08)" }}
              >
                &ldquo;
              </div>
              <p className="relative text-[clamp(1.75rem,4.5vw,3.5rem)] font-bold text-brand-navy leading-[1.15] max-w-4xl">
                The firms that close the implementation gap are not the ones with the longest service lists.
                They are the ones who{" "}
                <span className="text-brand-gold italic">stayed.</span>
              </p>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="w-10 h-0.5 bg-brand-gold rounded" />
              <p className="text-brand-muted text-sm">Astellic operating principle</p>
            </div>
          </FadeUp>
        </div>
      </section>


      {/* ── Geographic Presence & Track Record ───────────────────────────── */}
      <section className="bg-brand-navy text-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-12 text-center">
              Institutional Track Record
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-[auto_1fr] gap-14 items-start">
            {/* Africa presence map */}
            <Reveal variant="left" delay={80}>
              <AfricaPresenceMap theme="dark" className="w-[240px] lg:w-[280px] shrink-0" />
            </Reveal>

            {/* Stats columns */}
            <div className="space-y-10">
              <div className="grid sm:grid-cols-3 gap-8">
                {[
                  {
                    label: "Sectors",
                    items: ["Health", "Public Financial Management", "Education & Social Systems", "Environmental Sustainability"],
                  },
                  {
                    label: "Clients Supported",
                    items: ["Bilateral donors (FCDO, USAID, GIZ)", "Multilateral agencies (WHO, UNICEF, World Bank)", "National line ministries", "International NGOs & implementers", "Corporate foundations"],
                  },
                  {
                    label: "Partners Engaged",
                    items: ["Gavi", "Global Fund", "Africa CDC", "Gates Foundation", "AFIDEP", "VillageReach", "Palladium", "DAI"],
                  },
                ].map((col, i) => (
                  <Reveal key={col.label} variant="up" delay={i * 80}>
                    <p className="text-base font-bold uppercase tracking-widest text-brand-gold mb-4">{col.label}</p>
                    <ul className="space-y-2">
                      {col.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="w-1 h-1 rounded-full bg-brand-gold mt-2 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                ))}
              </div>

              {/* Methodological strengths */}
              <Reveal variant="up" delay={150}>
                <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-5">
                  <p className="text-base font-bold uppercase tracking-widest text-brand-gold mb-4">Methodological Strengths</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Political Economy Analysis (PEA)",
                      "Adaptive MERL System Design",
                      "Data Quality Assurance (DQA)",
                      "Health Systems Financing Diagnostics",
                      "Programme Evaluation",
                      "Theory of Change Development",
                      "Institutional Capacity Diagnostics",
                      "Evidence Synthesis & Policy Translation",
                      "Implementation Readiness Assessment",
                    ].map((m) => (
                      <span key={m} className="text-xs text-gray-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg hover:border-brand-gold/30 transition-colors">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          <FadeUp delay={200}>
            <p className="text-center text-gray-700 text-xs mt-12 italic">
              We do not publish client logos without explicit permission. These are categories and geographies, not institutional endorsements.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Insights Teaser ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="grid md:grid-cols-[1fr_auto] gap-6 items-end mb-10">
              <div>
                <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-3">
                  Astellic Insights
                </p>
                <h2 className="text-3xl font-bold text-brand-navy mb-3">
                  The Firm That Understands Why Systems Fail
                </h2>
                <p className="text-brand-muted text-lg max-w-xl leading-relaxed">
                  Implementation briefs, perspectives, and institutional intelligence
                  from the front lines of African development.
                </p>
              </div>
              <Link
                href="/insights"
                className="inline-flex items-center gap-2 border border-brand-navy text-brand-navy font-semibold px-5 py-2.5 rounded hover:bg-brand-navy hover:text-white transition-colors text-sm whitespace-nowrap"
              >
                All Insights
              </Link>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6">
            {insightCards.map((card, i) => (
              <Reveal key={card.title} variant="up" delay={i * 90}>
                <Link
                  href="/insights"
                  className="group bg-white rounded-2xl overflow-hidden flex flex-col lift"
                >
                  <div className={`${card.color} px-5 py-2.5`}>
                    <span className="text-base font-bold uppercase tracking-widest opacity-80">{card.category}</span>
                  </div>
                  <div className="p-6 flex flex-col gap-3 flex-1">
                    <h3 className="font-bold text-brand-navy text-base leading-snug group-hover:text-brand-teal transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-brand-muted text-sm leading-relaxed flex-1">{card.desc}</p>
                    <span className="inline-flex items-center gap-1 text-brand-gold font-semibold text-sm group-hover:gap-2 transition-all">
                      Read more →
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy text-white py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-6">
              Start Here
            </p>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Ready to Close the Implementation Gap?
            </h2>
          </FadeUp>
          <FadeUp delay={100}>
            <p className="text-gray-300 text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
              We work with governments, donors, corporations, and development partners.
              Tell us what you are working on; we will tell you honestly whether we can help.
            </p>
          </FadeUp>
          <FadeUp delay={180}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-10 py-4 rounded text-base transition-all duration-200 hover:scale-[1.02]"
              >
                Start a Conversation
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 border border-white/30 hover:border-white text-white font-semibold px-10 py-4 rounded text-base transition-colors"
              >
                About Astellic
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
