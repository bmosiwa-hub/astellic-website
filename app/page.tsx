import Link from "next/link";
import Image from "next/image";
import PillarMatrix from "@/components/PillarMatrix";

const pillars = [
  {
    num: "01",
    title: "Evidence Generation & Verification",
    tagline: "The analytical engine that drives decisions.",
    desc: "We produce rigorous, context-grounded intelligence — not reports that sit on shelves. Our research, evaluation, and data quality work is calibrated to decision-making from the outset.",
    href: "/what-we-do/evidence",
    color: "border-brand-navy",
    numBg: "bg-brand-navy",
    subUnits: [
      { label: "Research & Analytics", href: "/what-we-do/evidence/research-analytics" },
      { label: "Evaluation & Learning", href: "/what-we-do/evidence/evaluation-learning" },
      { label: "Data Quality & Research Integrity", href: "/what-we-do/evidence/data-quality" },
    ],
  },
  {
    num: "02",
    title: "Policy Development & Advisory",
    tagline: "Where analytical depth meets strategic influence.",
    desc: "We translate evidence into policies, reform strategies, and institutional advisory that are technically credible, politically feasible, and built for implementation — not for filing.",
    href: "/what-we-do/policy",
    color: "border-brand-teal",
    numBg: "bg-brand-teal",
    subUnits: [
      { label: "Policy & Strategy Development", href: "/what-we-do/policy/strategy-development" },
      { label: "Systems Strengthening & Advisory", href: "/what-we-do/policy/systems-strengthening" },
      { label: "Knowledge Translation & Strategic Communications", href: "/what-we-do/policy/knowledge-translation" },
    ],
  },
  {
    num: "03",
    title: "Programme Design & Implementation",
    tagline: "Where strategy becomes measurable results.",
    desc: "We design implementation-ready interventions and deliver them with the adaptive management systems to course-correct in real time. We stay until the strategy works.",
    href: "/what-we-do/implementation",
    color: "border-brand-green",
    numBg: "bg-brand-green",
    subUnits: [
      { label: "Programme Design & Innovation", href: "/what-we-do/implementation/programme-design" },
      { label: "Technical Assistance & Institutional Development", href: "/what-we-do/implementation/technical-assistance" },
      { label: "Programme Implementation & Adaptive Management", href: "/what-we-do/implementation/adaptive-management" },
    ],
  },
];

const areas = [
  { title: "Health & Nutrition Systems", href: "/thematic-areas/health" },
  { title: "Governance & Public Sector Reform", href: "/thematic-areas/governance" },
  { title: "Human Development & Social Systems", href: "/thematic-areas/education" },
  { title: "Climate, Agriculture & Sustainability", href: "/thematic-areas/climate" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white py-28 px-6 overflow-hidden">
        <Image
          src="/images/hero-home.jpg"
          alt="African professionals in a policy meeting"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Working at the Intersection of Evidence, Policy and Delivery.
          </h1>
          <p className="text-gray-300 text-xl md:text-2xl max-w-2xl mx-auto mb-10">
            Astellic Group partners with governments, donors, the private sector,
            and institutions across Africa to translate evidence into policy
            priorities and programmes that produce measurable and sustainable results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/about"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-8 py-3 rounded font-medium text-lg transition-colors"
            >
              Learn About Us
            </Link>
            <Link
              href="/contact"
              className="border border-white/30 hover:border-white text-white px-8 py-3 rounded font-medium text-lg transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* What We Do — Three Pillars */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <span className="text-xs font-bold tracking-widest text-brand-gold uppercase">What We Do</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-brand-navy mb-4">
            An Integrated Delivery Architecture
          </h2>
          <p className="text-center text-brand-muted text-lg max-w-3xl mx-auto mb-14">
            Astellic operates across three functional pillars that work in deliberate sequence and
            mutual reinforcement — producing evidence, converting it into policy, and delivering
            programmes that work. Together, they constitute a complete end-to-end capability
            within a single accountable institution.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((p) => (
              <div
                key={p.num}
                className={`bg-white rounded-2xl shadow-sm border-t-4 ${p.color} p-7 flex flex-col gap-5`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold text-white ${p.numBg} px-2 py-1 rounded`}>
                    {p.num}
                  </span>
                  <h3 className="font-bold text-brand-navy text-base leading-snug">{p.title}</h3>
                </div>
                <p className="text-sm font-semibold text-brand-muted italic">{p.tagline}</p>
                <p className="text-brand-muted text-sm leading-relaxed flex-1">{p.desc}</p>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  {p.subUnits.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="flex items-center gap-2 text-xs text-brand-muted hover:text-brand-navy transition-colors group"
                    >
                      <svg className="w-3 h-3 shrink-0 opacity-50 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      {s.label}
                    </Link>
                  ))}
                </div>

                <Link
                  href={p.href}
                  className="inline-flex items-center gap-2 text-brand-gold font-semibold text-sm hover:gap-3 transition-all mt-1"
                >
                  Explore this pillar
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/what-we-do"
              className="inline-flex items-center gap-2 border border-brand-navy text-brand-navy px-6 py-2.5 rounded font-medium text-base hover:bg-brand-navy hover:text-white transition-colors"
            >
              View Full Delivery Architecture →
            </Link>
          </div>
        </div>
      </section>

      {/* Thematic Domains + Matrix */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <span className="text-xs font-bold tracking-widest text-brand-gold uppercase">Where We Work</span>
          </div>
          <h2 className="text-3xl font-bold text-center text-brand-navy mb-4">
            Four Thematic Domains. Three Pillars. One Integrated System.
          </h2>
          <p className="text-center text-brand-muted text-lg max-w-3xl mx-auto mb-14">
            Astellic&apos;s thematic domains are not separate practice areas — they cut
            horizontally across all three pillars, ensuring our functional expertise is always
            deployed with deep sector-specific knowledge. Hover the matrix to see how they intersect.
          </p>

          {/* Domain chips */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {areas.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="border border-gray-200 bg-white hover:border-brand-gold hover:text-brand-gold rounded-full px-5 py-2 text-sm font-medium text-brand-navy transition-colors"
              >
                {a.title}
              </Link>
            ))}
          </div>

          {/* Interactive matrix */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <PillarMatrix />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-navy text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to close the implementation gap?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            We work with governments, donors, the private sector, and institutions.
            Let&apos;s discuss how Astellic can support your priorities.
          </p>
          <Link
            href="/contact"
            className="bg-brand-gold hover:bg-brand-gold/90 text-white px-10 py-3 rounded font-medium text-lg transition-colors"
          >
            Start a Conversation
          </Link>
        </div>
      </section>
    </>
  );
}
