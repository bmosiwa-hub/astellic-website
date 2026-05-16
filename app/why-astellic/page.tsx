import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, FadeUp, FadeIn, SlideLeft, SlideRight, ScaleIn } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Why Astellic | African Advisory & Implementation Intelligence",
  description:
    "What makes Astellic different â€” five operating principles, competitive positioning, and the case for a specialist evidence-to-delivery advisory firm.",
};

const commitments = [
  {
    label: "We Stay",
    expanded: "Most evaluators and advisors hand over a report and leave. Astellic stays. Our work does not end with a document. It ends when the learning is being used â€” when the system has been strengthened, when the strategy is working in practice.",
    example: "We structure every engagement to include adaptive support beyond the initial deliverable.",
  },
  {
    label: "We Are Honest",
    expanded: "We tell clients what the evidence shows â€” including when it shows problems. That is not a risk. That is the service. A finding that identifies a flaw in a programme is more valuable than a report that confirms what a client hoped to hear.",
    example: "\"We found three data collection problems in the southern districts that are inflating your coverage numbers by 12%.\"",
  },
  {
    label: "We Know the Context",
    expanded: "The founder has over ten years of senior experience working inside Malawi's health system â€” embedded within government ministries, engaged with bilateral donors, multilateral agencies, and implementing partners across the country and the region. This is not advisory from the outside looking in. It is grounded intelligence from an organisation that has worked within the institutional machinery it advises on.",
    example: "Our advice accounts for how things actually work, not how they should work in theory.",
  },
  {
    label: "We Are Specialists",
    expanded: "We do three things with exceptional depth: Adaptive MERL & Learning Systems, Data Quality & Verification, and Policy-to-Implementation Systems Support. We do not try to be everything to everyone. That focus is what makes our work reliable â€” and what distinguishes it from firms with broad service menus and shallow delivery.",
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
    astellic: "MERL and data quality are primary services, not add-ons â€” they are what we are built around",
  },
  {
    competitor: "International consulting firms",
    limitation: "Expensive, expatriate-heavy, thin on local context; the person who designed the work rarely delivers it",
    astellic: "African-led, contextually embedded; the person who designs the work is the person who delivers it",
  },
];

const sectors = [
  "Health Systems & Nutrition",
  "Governance & Public Sector Reform",
  "Public Financial Management",
  "Education & Social Systems",
  "Climate, Agriculture & Sustainability",
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
      {/* â”€â”€ Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-5">
            Why Astellic
          </p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-7 max-w-3xl">
            We are not just different.<br />We are effective.
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            The implementation gap is real. It is persistent. And it is largely caused
            by the fragmented way institutions commission research, advisory, and delivery
            as separate exercises. Astellic was built to address that problem directly.
          </p>
        </div>
      </section>

      {/* â”€â”€ The Positioning â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-start">
          <SlideLeft>
            <div>
              <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-4">Our Positioning</p>
              <h2 className="text-3xl font-bold text-brand-navy mb-6 leading-snug">
                Specialist African advisory firm. Three services. Exceptional depth.
              </h2>
              <p className="text-brand-muted text-lg leading-relaxed mb-5">
                Astellic is a specialist African advisory firm that helps development
                programmes learn continuously, trust their data, and make strategy work in practice.
                We combine the analytical rigour of a research institution with the operational
                grounding of an organisation that has spent a decade inside African systems.
              </p>
              <p className="text-brand-muted text-lg leading-relaxed">
                We are not a research firm that stops at analysis. We are not a policy advisor
                disconnected from delivery. We are not an implementation partner without analytical
                depth. We are positioned at the intersection â€” because that is where sustainable
                results are produced.
              </p>
            </div>
          </SlideLeft>
          <SlideRight>
            <div className="space-y-4">
              {[
                { label: "Geography", value: "Africa-focused, operating from Malawi" },
                { label: "Year founded", value: "October 2025 â€” Lilongwe, Malawi" },
                { label: "Core services", value: "Adaptive MERL Â· Data Quality Â· Policy & Systems Analysis Â· Implementation Support" },
                { label: "Clients", value: "Donors, Governments, Development Partners, Corporations" },
                { label: "Model", value: "Founder-led, specialist, senior-present throughout" },
                { label: "Compliance", value: "MNBC Â· Helsinki Â· FCDO & USAID frameworks" },
              ].map((f, i) => (
                <Reveal key={f.label} variant="up" delay={i * 70}>
                  <div className="bg-white rounded-xl border border-gray-100 p-5 flex gap-4 items-start lift">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 shrink-0" />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">{f.label}: </span>
                      <span className="text-sm font-medium text-brand-navy">{f.value}</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </SlideRight>
        </div>
      </section>

      {/* â”€â”€ Five Commitments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-3">
                Operating Principles
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
                Five Things That Are True of Every Engagement
              </h2>
              <p className="text-brand-muted text-lg max-w-xl mx-auto leading-relaxed">
                These are not aspirations. They are the operating principles that govern
                how Astellic works â€” with every client, on every engagement.
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

      {/* â”€â”€ Competitive Differentiation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-20 px-6 bg-brand-light">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-12">
              <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-3">
                Comparative Positioning
              </p>
              <h2 className="text-3xl font-bold text-brand-navy mb-4">
                How Astellic Compares
              </h2>
              <p className="text-brand-muted text-lg max-w-xl mx-auto leading-relaxed">
                Every type of institution has a valuable role. This is not about criticism.
                It is about clarity â€” so you know exactly what choosing Astellic means.
              </p>
            </div>
          </FadeUp>
          <ScaleIn delay={100}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_1fr] bg-brand-navy text-white text-xs font-bold uppercase tracking-widest">
                <div className="px-6 py-4">Compared To</div>
                <div className="px-6 py-4 border-l border-white/10">Their Limitation</div>
                <div className="px-6 py-4 border-l border-white/10 text-brand-gold">Astellic&apos;s Distinction</div>
              </div>
              {comparisons.map((row, i) => (
                <div
                  key={row.competitor}
                  className={`grid grid-cols-[1fr_1fr_1fr] ${i % 2 === 0 ? "bg-white" : "bg-brand-light"} border-t border-gray-100`}
                >
                  <div className="px-6 py-5">
                    <p className="font-semibold text-brand-navy text-sm">{row.competitor}</p>
                  </div>
                  <div className="px-6 py-5 border-l border-gray-100">
                    <p className="text-brand-muted text-sm leading-relaxed">{row.limitation}</p>
                  </div>
                  <div className="px-6 py-5 border-l border-gray-100">
                    <p className="text-brand-navy text-sm leading-relaxed font-medium">{row.astellic}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScaleIn>
        </div>
      </section>

      {/* â”€â”€ Sectors, Clients & Methodological Strengths â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12">
          <FadeUp>
            <div>
              <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-4">Sectors</p>
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
              <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-4">Clients</p>
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
              <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-4">Methods</p>
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

      {/* â”€â”€ CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
