import Link from "next/link";
import Image from "next/image";
import DeliveryFlowDiagram from "@/components/DeliveryFlowDiagram";

const coreServices = [
  {
    num: "01",
    title: "Adaptive MERL & Learning Systems",
    tagline: "We help programmes continuously learn and improve — not just report.",
    problem: "Most monitoring systems generate data for compliance, not decisions. Programmes collect what donors require, not what managers need. Course-correction happens too late, if at all.",
    bullets: [
      "Learn continuously from implementation evidence",
      "Improve programme performance in real time",
      "Strengthen adaptive management capacity",
      "Generate decision-useful evidence at every stage",
    ],
    engagements: ["Baseline, midline & endline evaluations", "Real-time adaptive MERL design", "Learning system architecture", "Theory of change development"],
    color: "border-brand-navy",
    numBg: "bg-brand-navy",
    href: "/what-we-do/evidence/evaluation-learning",
  },
  {
    num: "02",
    title: "Data Quality, Verification & Research Integrity",
    tagline: "We help institutions build confidence in what their data actually shows.",
    problem: "Inflated coverage numbers. Inconsistent reporting. Evaluations built on data no one has verified. Most development programmes operate on evidence they have never truly scrutinised.",
    bullets: [
      "Verify programme data before it shapes decisions",
      "Strengthen reporting credibility with donors",
      "Improve research integrity and fidelity",
      "Build confidence in evidence systems",
    ],
    engagements: ["Data quality audits (DQAs)", "Independent verification protocols", "Research integrity assessments", "Data governance advisory"],
    color: "border-brand-teal",
    numBg: "bg-brand-teal",
    href: "/what-we-do/evidence/data-quality",
  },
  {
    num: "03",
    title: "Policy, Systems Analysis & Implementation Support",
    tagline: "We help organisations develop sound policy and move from strategy to actual delivery.",
    problem: "Strategies look compelling in documents. They fail when they meet institutional inertia, unclear accountability, weak implementation readiness, and systems that were never built to execute them.",
    bullets: [
      "Develop policy and systems strategies grounded in evidence",
      "Operationalise strategy within institutional realities",
      "Diagnose delivery bottlenecks before they become failures",
      "Strengthen implementation readiness and execution discipline",
    ],
    engagements: ["Policy and systems analysis", "Implementation readiness reviews", "Delivery diagnostics", "Political economy analysis", "Embedded technical advisory"],
    color: "border-brand-green",
    numBg: "bg-brand-green",
    href: "/what-we-do/implementation",
  },
];

const commitments = [
  {
    label: "We Stay",
    desc: "Most advisors hand over a report and leave. Astellic stays. Our work does not end with a document. It ends when the learning is being used.",
  },
  {
    label: "We Are Honest",
    desc: "We tell clients what the evidence shows — including when it shows problems. That is not a risk. That is the service.",
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

const clientTypes = [
  {
    label: "Donors & Governments",
    desc: "Bilateral donors, multilateral funders, and national governments that need credible evidence, stronger data systems, and advisory that makes programmes work.",
    href: "/institutions-we-support/donors-and-governments",
    dot: "bg-brand-gold",
  },
  {
    label: "Development Partners",
    desc: "UN agencies, INGOs, and implementing organisations that need sharper programme design, adaptive M&E, and the institutional capacity to deliver at scale.",
    href: "/institutions-we-support/development-partners",
    dot: "bg-brand-teal",
  },
  {
    label: "Corporate Institutions",
    desc: "Private sector companies and financial institutions that need credible impact measurement, ESG frameworks, and social investment strategies grounded in evidence.",
    href: "/institutions-we-support/corporate-institutions",
    dot: "bg-brand-navy",
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
          className="object-cover opacity-15"
          priority
        />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-6">
            Research · Advisory · Implementation
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] mb-8 max-w-3xl">
            Working at the Intersection of Evidence, Policy and Delivery.
          </h1>
          <p className="text-gray-300 text-xl md:text-2xl max-w-2xl leading-relaxed mb-12">
            Astellic helps governments, donors, and corporations translate evidence,
            strategy, and investment into measurable and sustainable outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white px-8 py-4 rounded font-semibold text-base transition-colors"
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

      {/* ── Operating Model ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-brand-muted text-xs font-bold uppercase tracking-[0.2em] mb-3 text-center">
            Our Operating Model
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy text-center mb-3">
            A Continuous Cycle, Not a Linear Process
          </h2>
          <p className="text-brand-muted text-lg text-center max-w-2xl mx-auto mb-12 leading-relaxed">
            The implementation gap is not a technical problem. It is a systems problem.
            We address it as one — by integrating evidence, policy, and delivery into a
            single adaptive architecture.
          </p>
          <DeliveryFlowDiagram />
          <p className="text-center text-brand-muted text-sm mt-6 italic">
            "This is not a tagline. It is our operating model."
          </p>
        </div>
      </section>

      {/* ── Core Services ────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-3">
              What We Do
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-5">
              Three Areas of Specialist Depth
            </h2>
            <p className="text-brand-muted text-lg max-w-2xl mx-auto leading-relaxed">
              Astellic is a specialist firm. We do three things with exceptional depth —
              and a fourth for the private sector. We do not try to be everything to everyone.
            </p>
          </div>

          <div className="space-y-6">
            {coreServices.map((svc, i) => (
              <div
                key={svc.num}
                className={`bg-white rounded-2xl shadow-sm border-l-4 ${svc.color} p-8 grid md:grid-cols-[1fr_1fr_1fr] gap-8 items-start`}
              >
                {/* Left: Title + Problem */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-xs font-bold text-white ${svc.numBg} px-2.5 py-1 rounded`}>
                      {svc.num}
                    </span>
                    <h3 className="font-bold text-brand-navy text-lg leading-snug">{svc.title}</h3>
                  </div>
                  <p className="text-brand-gold text-sm font-semibold italic mb-3">{svc.tagline}</p>
                  <p className="text-brand-muted text-sm leading-relaxed">{svc.problem}</p>
                </div>

                {/* Middle: What we help */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-3">
                    We Help Institutions
                  </p>
                  <ul className="space-y-2">
                    {svc.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-brand-navy">
                        <span className="text-brand-gold mt-0.5 shrink-0">→</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: Engagement types + CTA */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-3">
                    Example Engagements
                  </p>
                  <ul className="space-y-1.5 mb-6">
                    {svc.engagements.map((e) => (
                      <li key={e} className="text-sm text-brand-muted leading-snug">
                        · {e}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={svc.href}
                    className="inline-flex items-center gap-1.5 text-brand-gold font-semibold text-sm hover:gap-2.5 transition-all"
                  >
                    Explore this service
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Corporate track callout */}
          <div className="mt-6 bg-brand-navy text-white rounded-2xl p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-2">
                Corporate Track
              </p>
              <h3 className="text-xl font-bold mb-3">Corporate Advisory & Social Investment</h3>
              <p className="text-gray-300 text-sm leading-relaxed max-w-xl">
                Most CSR programmes struggle not because of intent, but because evidence,
                governance, implementation systems, and learning mechanisms are weak.
                We help corporations design credible social investment strategies, build
                ESG evidence systems, and measure impact with the rigour donors expect.
              </p>
            </div>
            <Link
              href="/institutions-we-support/corporate-institutions"
              className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-3 rounded font-semibold text-sm transition-colors whitespace-nowrap shrink-0"
            >
              Corporate Advisory
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="text-center mt-10">
            <Link
              href="/what-we-do"
              className="inline-flex items-center gap-2 border border-brand-navy text-brand-navy font-semibold px-6 py-3 rounded hover:bg-brand-navy hover:text-white transition-colors text-sm"
            >
              View Full Delivery Architecture
            </Link>
          </div>
        </div>
      </section>

      {/* ── Five Commitments ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-3">
              Our Commitments
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Every Astellic Engagement Means
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
              These are not values statements. They are operating principles that govern every engagement.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {commitments.map((c, i) => (
              <div
                key={c.label}
                className={`bg-white/5 rounded-xl p-6 border border-white/10 hover:border-brand-gold/40 transition-colors ${i === 4 ? "sm:col-span-2 lg:col-span-1" : ""}`}
              >
                <p className="text-brand-gold font-bold text-base mb-2">{c.label}</p>
                <p className="text-gray-300 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/why-astellic"
              className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white font-semibold px-6 py-3 rounded transition-colors text-sm"
            >
              Why Institutions Choose Astellic
            </Link>
          </div>
        </div>
      </section>

      {/* ── Who We Work With ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-3">
              Who We Work With
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
              Institutions at Every Stage of the Results Chain
            </h2>
            <p className="text-brand-muted text-lg max-w-xl mx-auto leading-relaxed">
              Whether you fund, design, or deliver development outcomes — or invest in
              communities through the private sector — Astellic has an entry point for you.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {clientTypes.map((ct) => (
              <Link
                key={ct.label}
                href={ct.href}
                className="group bg-brand-light rounded-2xl p-7 hover:shadow-md transition-shadow flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${ct.dot} shrink-0`} />
                  <h3 className="font-bold text-brand-navy text-lg group-hover:text-brand-gold transition-colors">
                    {ct.label}
                  </h3>
                </div>
                <p className="text-brand-muted text-sm leading-relaxed flex-1">{ct.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-brand-gold font-semibold text-sm group-hover:gap-2.5 transition-all">
                  Learn more
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Credibility Signals ──────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-brand-navy text-white">
        <div className="max-w-6xl mx-auto">
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-10 text-center">
            Institutional Track Record
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                label: "Sectors",
                items: ["Health & Nutrition Systems", "Governance & Public Sector Reform", "Public Financial Management", "Education & Social Services", "Climate & Sustainability"],
              },
              {
                label: "Clients Supported",
                items: ["Bilateral donors (FCDO, USAID, GIZ)", "Multilateral agencies (WHO, UNICEF, World Bank)", "National line ministries", "International NGOs & implementers", "Corporate foundations"],
              },
              {
                label: "Partners Engaged",
                items: ["Gavi", "Global Fund", "Africa CDC", "Gates Foundation", "AFIDEP", "VillageReach", "Palladium", "DAI"],
              },
              {
                label: "Geographic Reach",
                items: ["Malawi (primary)", "Kenya", "Nigeria", "Zambia", "Ethiopia", "South Africa", "Zimbabwe", "9+ countries total"],
              },
            ].map((col) => (
              <div key={col.label}>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">{col.label}</p>
                <ul className="space-y-2">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="w-1 h-1 rounded-full bg-brand-gold mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 text-xs mt-10 italic">
            We do not publish client logos without explicit permission. These are categories and geographies, not institutional endorsements.
          </p>
        </div>
      </section>

      {/* ── Insights Teaser ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-end mb-10">
            <div>
              <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-3">
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

          {/* Placeholder cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                category: "Implementation Brief",
                title: "Why Implementation Readiness Reviews Must Happen Before Programmes Launch",
                desc: "The most preventable programme failures begin not at the point of delivery, but in the design phase — when implementation readiness is assumed rather than assessed.",
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
            ].map((card) => (
              <Link
                key={card.title}
                href="/insights"
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className={`${card.color} px-5 py-2.5`}>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80">{card.category}</span>
                </div>
                <div className="p-6 flex flex-col gap-3 flex-1">
                  <h3 className="font-bold text-brand-navy text-base leading-snug group-hover:text-brand-teal transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-brand-muted text-sm leading-relaxed flex-1">{card.desc}</p>
                  <span className="text-brand-gold font-semibold text-sm">Read more →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy text-white py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-6">
            Start Here
          </p>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Ready to Close the Implementation Gap?
          </h2>
          <p className="text-gray-300 text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            We work with governments, donors, corporations, and development partners.
            Tell us what you are working on — we will tell you honestly whether we can help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-10 py-4 rounded text-base transition-colors"
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
        </div>
      </section>
    </>
  );
}
