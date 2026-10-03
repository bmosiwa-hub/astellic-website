import Link from "next/link";
import Image from "next/image";
import OperatingModelDiagram from "@/components/OperatingModelDiagram";
import AfricaPresenceMap from "@/components/AfricaPresenceMap";
import WhoWeWorkWithSection from "@/components/WhoWeWorkWithSection";
import { Reveal, FadeUp } from "@/components/Reveal";
import { featuredStories, ACCENT_CLASSES, storyImage } from "@/lib/stories";

const featured = featuredStories();

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
    category: "Peer-reviewed",
    title: "Gender-Equitable Access to Tuberculosis Care and Prevention in Malawi: A Political Economy Analysis",
    desc: "Published in World Medical & Health Policy (2025). Political-economy analysis of why gender shapes access to TB services — evidence that fed Malawi's national Gender & TB policy and standards.",
    color: "bg-brand-navy text-white",
  },
  {
    category: "Technical guide",
    title: "Building the Foundations for Responsive Primary Health Care: A Practical Guide for Policymakers",
    desc: "A practical guide for policymakers, anchored in the WHO Health Systems Framework, on building PHC systems that prioritise availability, adaptability and responsiveness.",
    color: "bg-brand-teal text-white",
  },
  {
    category: "Technical report",
    title: "Market Intelligence Analysis for Priority HIV and TB Products in Malawi",
    desc: "A national market-intelligence assessment mapping financing, procurement flows and cost drivers for priority commodities — with a roadmap for more affordable, equitable access.",
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
            Evidence · Policy · Implementation
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] mb-8 max-w-3xl animate-fade-up delay-100">
            We work across the gap between evidence, policy and implementation.
          </h1>
          <p className="text-gray-300 text-xl md:text-2xl max-w-2xl leading-relaxed mb-12 animate-fade-up delay-200">
            Astellic helps governments and development partners maximize impact through
            evidence-driven and context-responsive strategy. We exist to close the gap between
            what evidence shows, what strategy intends, and what systems actually deliver.
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

      {/* ── Founder-led experience band ──────────────────────────────────── */}
      <section className="bg-[#0b1a38] border-b border-white/10 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-6">
            A new firm, built on established founder experience
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-white/10">
            {[
              { value: "12+", label: "Countries",          sub: "Founder-led assignments" },
              { value: "20+", label: "Engagements",        sub: "Research · policy · delivery" },
              { value: "11+", label: "Years experience", sub: "Founder, across African systems" },
              { value: "5", label: "Publications & guides", sub: "Peer-reviewed + technical" },
            ].map((stat, i) => (
              <Reveal key={stat.label} variant="up" delay={i * 80}>
                <div className="text-center px-4 py-4 first:pl-0 last:pr-0">
                  <p className="text-brand-gold font-black text-3xl md:text-4xl leading-none mb-1 tabular-nums">
                    {stat.value}
                  </p>
                  <p className="text-white font-bold text-sm tracking-wide">{stat.label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{stat.sub}</p>
                </div>
              </Reveal>
            ))}
          </div>
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

      {/* ── Featured Work ────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="grid md:grid-cols-[1fr_auto] gap-6 items-end mb-10">
              <div>
                <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-3">
                  Astellic in Action
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-3">
                  Some of the problems we know how to solve.
                </h2>
                <p className="text-brand-muted text-lg max-w-xl leading-relaxed">
                  Real work from across African health systems — evidence generated, policy
                  designed, delivery made to work. Each tells the founder&rsquo;s own story, honestly.
                </p>
              </div>
              <Link
                href="/astellic-in-action"
                className="inline-flex items-center gap-2 border border-brand-navy text-brand-navy font-semibold px-5 py-2.5 rounded hover:bg-brand-navy hover:text-white transition-colors text-sm whitespace-nowrap"
              >
                Explore all stories
              </Link>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6">
            {featured.map((s, i) => {
              const a = ACCENT_CLASSES[s.accent];
              return (
                <Reveal key={s.slug} variant="up" delay={i * 90}>
                  <Link
                    href={`/astellic-in-action/${s.slug}`}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full lift"
                  >
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={storyImage(s.slug)}
                        alt=""
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-brand-navy/25" />
                    </div>
                    <div className={`h-1.5 ${a.bg}`} />
                    <div className="p-6 flex flex-col gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${a.dot}`} />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">
                          {s.portfolio}
                        </span>
                      </div>
                      <h3 className="font-bold text-brand-navy text-lg leading-snug group-hover:text-brand-teal transition-colors">
                        {s.title}
                      </h3>
                      <p className="text-brand-muted text-sm leading-relaxed flex-1">{s.subtitle}</p>
                      <p className="text-[11px] text-brand-muted/80 border-t border-gray-100 pt-3">
                        {s.attribution}
                      </p>
                      <span className="inline-flex items-center gap-1 text-brand-gold font-semibold text-sm group-hover:gap-2 transition-all">
                        Read the story →
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
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
            <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-2 text-center">
              Founder Experience &amp; Reach
            </p>
            <p className="text-gray-400 text-sm text-center mb-12 max-w-2xl mx-auto">
              The institutions and geographies behind the founder&rsquo;s work. Astellic is new; this is
              the experience it is built on, not a claim of firm engagements.
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
                    label: "Institutions Worked With",
                    items: ["Bilateral donors (FCDO, USAID)", "Multilateral agencies (WHO, UNICEF, World Bank)", "National line ministries", "International NGOs & implementers"],
                  },
                  {
                    label: "Institutions Engaged",
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
            <p className="text-center text-gray-400 text-xs mt-12 italic max-w-3xl mx-auto">
              These are institutions and geographies from the founder&rsquo;s experience, not Astellic
              engagements, and not endorsements. We do not publish client logos without explicit permission.
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
              Working through a complex health-system problem?
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
                Discuss a challenge
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
