import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, FadeUp, FadeIn, SlideLeft, SlideRight, ScaleIn } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Why Astellic | African Advisory & Implementation Intelligence",
  description:
    "What makes Astellic different: five operating principles, competitive positioning, and the case for a specialist evidence-to-delivery advisory firm.",
};

const commitments = [
  {
    label: "We Stay",
    expanded: "Most evaluators and advisors hand over a report and leave. Astellic stays. Our work does not end with a document. It ends when the learning is being used: when the system has been strengthened, when the strategy is working in practice.",
    example: "We structure every engagement to include adaptive support beyond the initial deliverable.",
  },
  {
    label: "We Are Honest",
    expanded: "We tell clients what the evidence shows, including when it shows problems. That is not a risk. That is the service. A finding that identifies a flaw in a programme is more valuable than a report that confirms what a client hoped to hear.",
    example: "\"We found three data collection problems in the southern districts that are inflating your coverage numbers by 12%.\"",
  },
  {
    label: "We Know the Context",
    expanded: "The founder has over ten years of senior experience working inside Malawi's health system, embedded within government ministries, engaged with bilateral donors, multilateral agencies, and implementing partners across the country and the region. This is not advisory from the outside looking in. It is grounded intelligence from an organisation that has worked within the institutional machinery it advises on.",
    example: "Our advice accounts for how things actually work, not how they should work in theory.",
  },
  {
    label: "We Are Specialists",
    expanded: "We do three things with exceptional depth: Monitoring, Evaluation, Accountability & Learning (MEAL) — including third-party monitoring and independent verification; Data Quality & Research Integrity; and Policy-to-Implementation Systems Support. We do not try to be everything to everyone. That focus is what makes our work reliable, and what distinguishes it from firms with broad service menus and shallow delivery.",
    example: "A specialist firm delivers differently than a firm that adds services to grow its rate card.",
  },
  {
    label: "We Are Practically Useful",
    expanded: "Every piece of analysis Astellic produces should help a client make a better decision, improve a system, or solve a real problem. Not produce a compelling document. Not demonstrate intellectual sophistication. Actually be useful to the person who commissioned the work.",
    example: "\"Here is what needs to change, who needs to change it, and by when. We will stay to support that process.\"",
  },
];

const comparisons = [
  {
    competitor: "Generic consultancies",
    limitation: "Broad service lists, limited specialist depth, senior expertise rarely present during delivery",
    astellic: "Specialist in three areas only; founder-led and senior-present throughout every engagement",
  },
  {
    competitor: "Academic institutions",
    limitation: "Strong research design but slow, publication-focused, rarely help with implementation",
    astellic: "Research designed to improve delivery; practical follow-through is part of the service, not an afterthought",
  },
  {
    competitor: "Implementation NGOs",
    limitation: "Good at delivery but MERL treated as compliance; data quality rarely interrogated or verified",
    astellic: "MERL and data quality are primary services, not add-ons; they are what we are built around",
  },
  {
    competitor: "International consulting firms",
    limitation: "Expensive, expatriate-heavy, thin on local context; the person who designed the work rarely delivers it",
    astellic: "African-led, contextually embedded; the person who designs the work is the person who delivers it",
  },
];

const sectors = [
  "Health Systems & Nutrition",
  "Public Financial Management",
  "Education & Social Systems",
  "Environmental Sustainability",
  "Corporate Social Investment",
];

const clientCategories = [
  "Bilateral donors (FCDO, USAID, GIZ, AFD, Sida)",
  "Multilateral agencies (World Bank, AfDB, UN agencies)",
  "National line ministries and planning commissions",
  "International NGOs and implementing partners",
  "Corporate foundations and private sector firms",
  "Regional intergovernmental bodies",
];

export default function WhyAstellicPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-brand-navy text-white py-28 px-6 overflow-hidden">
        <Image
          src="/images/hero-why.jpg"
          alt="Senior advisory environment"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-5">
            Why Astellic
          </p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-7 max-w-3xl">
            Senior expertise,<br />from evidence to delivery.
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            The implementation gap is real. It is persistent. And it is largely caused
            by the fragmented way institutions commission research, advisory, and delivery
            as separate exercises. Astellic was built to address that problem directly.
          </p>
        </div>
      </section>

      {/* ── The Positioning ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-start">
          <SlideLeft>
            <div>
              <p className="text-brand-gold text-base font-bold uppercase tracking-widest mb-4">Our Positioning</p>
              <h2 className="text-3xl font-bold text-brand-navy mb-6 leading-snug">
                Specialist African advisory firm. Three services. Exceptional depth.
              </h2>
              <p className="text-brand-muted text-lg leading-relaxed mb-5">
                Astellic is a development advisory firm drawing on more than a decade of senior
                experience across African health systems, policy, research and implementation.
                We bring the analytical rigour to generate evidence, the systems and
                political-economy grounding to turn it into decisions, and the operational experience
                to help those decisions work in real institutions.
              </p>
              <p className="text-brand-muted text-lg leading-relaxed">
                We work at the intersection of evidence, policy and implementation &mdash; because that
                is where sustainable results are produced, and where most advisory work stops short.
              </p>
            </div>
          </SlideLeft>
          <SlideRight>
            <div className="space-y-4">
              {[
                { label: "Geography", value: "Africa-focused, operating from Malawi" },
                { label: "Core services", value: "Adaptive MERL · Data Quality · Policy & Systems Analysis · Implementation Support" },
                { label: "Clients", value: "Donors, Governments, Development Partners, Corporations" },
                { label: "Model", value: "Specialist, senior-present throughout" },
                { label: "Compliance", value: "MNBC · Helsinki · FCDO & USAID frameworks" },
              ].map((f, i) => (
                <Reveal key={f.label} variant="up" delay={i * 70}>
                  <div className="bg-white rounded-xl border border-gray-100 p-5 flex gap-4 items-start lift">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 shrink-0" />
                    <div>
                      <span className="text-base font-bold uppercase tracking-widest text-brand-muted">{f.label}: </span>
                      <span className="text-sm font-medium text-brand-navy">{f.value}</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </SlideRight>
        </div>
      </section>

      {/* ── Five Commitments ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <p className="text-brand-gold text-base font-bold uppercase tracking-widest mb-3">
                Operating Principles
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
                Five Things That Are True of Every Engagement
              </h2>
              <p className="text-brand-muted text-lg max-w-xl mx-auto leading-relaxed">
                These are not aspirations. They are the operating principles that govern
                how Astellic works, with every client, on every engagement.
              </p>
            </div>
          </FadeUp>
          <div className="space-y-5">
            {commitments.map((c, i) => (
              <Reveal key={c.label} variant="up" delay={i * 80}>
                <div className="border border-gray-100 rounded-2xl p-8 hover:border-brand-gold/30 transition-colors lift">
                  <div className="grid md:grid-cols-[auto_1fr] gap-6 items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-brand-gold/50 font-bold text-sm">0{i + 1}</span>
                      <h3 className="text-xl font-bold text-brand-navy whitespace-nowrap">{c.label}</h3>
                    </div>
                    <div>
                      <p className="text-brand-muted text-base leading-relaxed mb-4">{c.expanded}</p>
                      <div className="bg-brand-light rounded-lg px-4 py-3 border-l-4 border-brand-gold/40">
                        <p className="text-sm text-brand-navy italic">{c.example}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── What Makes Us Different ───────────────────────────────────────── */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-12">
              <p className="text-brand-gold text-base font-bold uppercase tracking-widest mb-3">
                What Makes Us Different
              </p>
              <h2 className="text-3xl font-bold text-brand-navy mb-4">
                Five things you can hold us to
              </h2>
              <p className="text-brand-muted text-lg max-w-xl mx-auto leading-relaxed">
                Not claims about what we are not &mdash; positive differences, each one visible in the work.
              </p>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                label: "Senior-present",
                desc: "The people who design the work stay close to delivery. You get senior judgement throughout, not a pitch team that hands off to juniors.",
                href: "/astellic-in-action/fact-delivery-operating-system",
              },
              {
                label: "Systems-grounded",
                desc: "We account for institutions, incentives, financing and governance — not just the technical answer that looks good on paper.",
                href: "/astellic-in-action/malawi-health-devolution",
              },
              {
                label: "Evidence-led",
                desc: "We build decisions around evidence, and choose the method to fit the decision a client actually faces — not the report.",
                href: "/astellic-in-action/supreme-lifelines",
              },
              {
                label: "Implementation-aware",
                desc: "We understand the realities between a policy document and a working service, and design for them from the start.",
                href: "/astellic-in-action/kuhes-idsr-hiv",
              },
              {
                label: "African-contextual",
                desc: "Our work is grounded in African institutional and political contexts — across the continent, rooted in Malawi.",
                href: "/astellic-in-action/frontline-aids-financing-intelligence",
              },
            ].map((d, i) => (
              <Reveal key={d.label} variant="up" delay={i * 70}>
                <div className={`bg-white rounded-2xl border border-gray-100 p-7 h-full hover:border-brand-gold/30 transition-colors lift ${i === 4 ? "md:col-span-2" : ""}`}>
                  <div className="w-8 h-1 bg-brand-gold rounded mb-4" />
                  <h3 className="text-xl font-bold text-brand-navy mb-2">{d.label}</h3>
                  <p className="text-brand-muted text-base leading-relaxed mb-4">{d.desc}</p>
                  <Link href={d.href} className="inline-flex items-center gap-1 text-brand-gold font-semibold text-sm hover:gap-2 transition-all">
                    See it in action →
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sectors, Clients & Methodological Strengths ─────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12">
          <FadeUp>
            <div>
              <p className="text-brand-gold text-base font-bold uppercase tracking-widest mb-4">Sectors</p>
              <h3 className="text-xl font-bold text-brand-navy mb-6">Where We Have Worked</h3>
              <div className="space-y-3">
                {sectors.map((s) => (
                  <div key={s} className="flex items-center gap-3 text-brand-muted">
                    <span className="w-2 h-2 rounded-full bg-brand-teal shrink-0" />
                    <span className="text-sm">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={80}>
            <div>
              <p className="text-brand-gold text-base font-bold uppercase tracking-widest mb-4">Clients</p>
              <h3 className="text-xl font-bold text-brand-navy mb-6">Who We Have Served</h3>
              <div className="space-y-3">
                {clientCategories.map((c) => (
                  <div key={c} className="flex items-center gap-3 text-brand-muted">
                    <span className="w-2 h-2 rounded-full bg-brand-navy shrink-0" />
                    <span className="text-sm">{c}</span>
                  </div>
                ))}
              </div>
              <p className="text-brand-muted text-xs italic mt-5">
                We do not publish client logos without explicit permission.
                These are categories, not claims.
              </p>
            </div>
          </FadeUp>
          <FadeUp delay={160}>
            <div>
              <p className="text-brand-gold text-base font-bold uppercase tracking-widest mb-4">Methods</p>
              <h3 className="text-xl font-bold text-brand-navy mb-6">Methodological Strengths</h3>
              <div className="space-y-3">
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
                  <div key={m} className="flex items-center gap-3 text-brand-muted">
                    <span className="w-2 h-2 rounded-full bg-brand-gold shrink-0" />
                    <span className="text-sm">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold mb-5">
              Let&apos;s Have a Direct Conversation
            </h2>
          </FadeUp>
          <FadeUp delay={100}>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Tell us what you are working on. We will tell you honestly whether
              we are the right firm, what engagement model would suit your situation,
              and what a working relationship with Astellic actually looks like.
            </p>
          </FadeUp>
          <FadeUp delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-10 py-4 rounded transition-colors"
              >
                Discuss an Engagement
              </Link>
              <Link
                href="/what-we-do"
                className="border border-white/30 hover:border-white text-white font-semibold px-10 py-4 rounded transition-colors"
              >
                Our Services
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
