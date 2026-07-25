import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FadeUp, SlideLeft, SlideRight, ScaleIn, FadeIn } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Astellic Social Impact Lab (ASIL) | Astellic",
  description:
    "ASIL is Astellic's institutional implementation laboratory — a structured environment in which implementation models are tested, governance approaches are piloted, and practice-grounded intelligence is generated from real operational conditions.",
};

/* ─── Data ──────────────────────────────────────────────────────────────── */

const modelPhases = [
  {
    num: "01",
    verb: "Design",
    headline: "Structured learning design",
    body: "Every pilot begins with a formal design phase: a specific implementation question, a documented theory of change, a political economy analysis of the operating environment, and agreed data quality protocols. No field activity commences without a signed-off design document.",
  },
  {
    num: "02",
    verb: "Test",
    headline: "Minimum-viable pilot in real conditions",
    body: "Pilots are deliberately small and bounded — large enough to generate meaningful evidence, small enough to manage with methodological rigour. ASIL does not scale before it learns. Each pilot operates within a real institutional or community setting, not a controlled or artificial environment.",
  },
  {
    num: "03",
    verb: "Adapt",
    headline: "Adaptive management in real time",
    body: "Implementation is actively managed. Regular learning review meetings assess what the evidence is showing. Every significant adaptation is logged with its evidence basis. The point is not fidelity to the original plan — it is honesty about what real conditions require, and what that reveals.",
  },
  {
    num: "04",
    verb: "Learn",
    headline: "Honest evaluation of what happened",
    body: "Pilot evaluation is the primary product, not an afterthought. Every ASIL pilot generates a structured Learning Report covering what the design predicted, what the implementation produced, what failed and why, and what the practice revealed that theory did not anticipate. Negative results are published with the same rigour as positive ones.",
  },
  {
    num: "05",
    verb: "Transfer",
    headline: "Intelligence into advisory practice",
    body: "Learning moves from ASIL into Astellic's advisory work through three formal mechanisms: Quarterly Learning Integration Reviews, Methodology Development Cycles, and public publication. Published Learning Reports are attributed to ASIL and distributed through Astellic's donor and partner networks, converting pilot evidence into institutional credibility.",
  },
];

const thematicDomains = [
  {
    num: "01",
    title: "Health",
    img: "/images/thematic-health.jpg",
    overlayHex: "#1B2A4A",
    href: "/thematic-areas/health",
    systemsIssue: "Implementation system failures, not resource constraints or inadequate evidence, explain most persistent gaps between health and nutrition policy intent and service delivery outcomes across African contexts.",
    focus: "ASIL's health pilots investigate why known-effective community health and nutrition interventions fail to produce durable outcomes, and what governance architectures change that. The inaugural pilot uses clean cooking as a case study in community-governed women's health outcomes.",
    strategicValue: "Documented health implementation evidence positions Astellic as a firm that has not just advised on health systems — but designed, managed, and honestly evaluated interventions under real conditions and published what it learned.",
  },
  {
    num: "02",
    title: "Environmental Sustainability",
    img: "/images/thematic-climate.jpg",
    overlayHex: "#1A3A2A",
    href: "/thematic-areas/climate",
    systemsIssue: "Environmental, agricultural, and climate-resilient practice investments consistently fail to produce durable behaviour change — not because the interventions are ineffective, but because the institutional conditions for sustained adoption are absent.",
    focus: "ASIL investigates the governance architectures that determine whether environmental investments in clean energy, climate-resilient agricultural practice and natural resource management produce sustained outcomes rather than brief, sponsored-period adoption.",
    strategicValue: "As climate and environmental finance accelerates into communities that lack institutional governance capacity, demand for credible implementation advisory grows. ASIL's documented pilots create the credentials to compete for this work.",
  },
  {
    num: "03",
    title: "Social Development",
    img: "/images/thematic-education.jpg",
    overlayHex: "#1A2A3A",
    href: "/thematic-areas/education",
    systemsIssue: "Social protection and education delivery programmes regularly fail to reach intended beneficiaries — not because the designs are inadequate, but because implementation systems are not built to navigate the political economies and institutional constraints within which they operate.",
    focus: "ASIL investigates the implementation conditions — governance design, institutional incentive structures, community accountability architectures — that determine whether social programmes produce durable outcomes for the populations they are designed to serve.",
    strategicValue: "Implementation evidence in social development positions Astellic to compete for increasingly rigorous donor mandates requiring demonstrated adaptive management, honest outcome evaluation, and evidence of community-level accountability.",
  },
];

const partnershipCategories = [
  {
    category: "Academic Institutions",
    description: "Joint pilot design and co-authored publications with African universities and research institutions. Partners bring ethics infrastructure and field research capacity. ASIL brings methodological rigour and advisory application.",
    examples: "KUHeS · Chancellor College · APHRC · Regional research networks",
    selectivityNote: "Academic partnerships are activated from Year 3, once ASIL has completed at least three pilots with published Learning Reports.",
  },
  {
    category: "ESG Learning Partnerships",
    description: "Corporate participants subject their social investment portfolios to ASIL's diagnostic framework, adopt a common evidence standard, and contribute to a shared learning review. The Platform produces validated industry benchmarks and direct evidence of what effective corporate social investment looks like in practice.",
    examples: "Companies committed to genuine social investment governance improvement",
    selectivityNote: "Participation requires adoption of ASIL's evidence standards. Findings are published regardless of partner preferences.",
  },
  {
    category: "Implementation Learning Collaborations",
    description: "Structured engagements with INGOs and donor-funded programmes that benefit from embedding ASIL pilots within their operational context. Partners contribute to data collection costs and gain access to ASIL's published learning. They do not exercise editorial control over findings.",
    examples: "Donor-funded programmes with genuine adaptive management mandates",
    selectivityNote: "ASIL selects implementation partners based on learning alignment and institutional seriousness, not funding availability.",
  },
  {
    category: "Governance & Systems Pilots",
    description: "Engagements with government departments, decentralised authorities, and public institutions investigating accountability, data use, and implementation readiness in specific governance contexts. Partners contribute institutional access and operational context. ASIL contributes independent evaluation design.",
    examples: "District health management teams · Local government units · Sector ministries",
    selectivityNote: "Government pilots require full political economy mapping before design commences. ASIL does not operate in environments where honest reporting cannot be assured.",
  },
];

const implementationGapPoints = [
  {
    stat: "Structural",
    headline: "The design-delivery gap",
    body: "The failure of social investment programmes across Africa is not primarily explained by a shortage of funding, technical expertise, or goodwill. It is explained by a persistent, structural gap between the design of interventions and the institutional conditions required to deliver them — a gap that conventional advisory practice does not close, because it is itself rarely grounded in the operational realities of delivery.",
  },
  {
    stat: "Epistemic",
    headline: "The knowledge gap",
    body: "Implementation intelligence — the practical, context-specific knowledge of what it takes to make social programmes work inside real institutions, communities, and political economies — cannot be acquired from the outside alone. It must be generated from within the practice of delivery, captured systematically, and translated into reusable institutional knowledge. Most advisory institutions do not generate this knowledge. They synthesise it, at best, from others who do.",
  },
  {
    stat: "Systemic",
    headline: "The reporting gap",
    body: "Conventional monitoring and reporting systems are designed to demonstrate outcomes, not to understand implementation. When programmes fail to produce outcomes, reporting systems typically explain the failure in terms of context rather than design — protecting the advisory and implementing institutions from accountability, and preventing the generation of knowledge that would improve future practice.",
  },
];

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function ASILPage() {
  return (
    <>
      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section className="relative bg-brand-navy text-white py-32 px-6 overflow-hidden min-h-[75vh] flex items-center">
        <Image
          src="/images/hero-approach.jpg"
          alt="ASIL — Astellic Social Impact Lab"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-brand-navy/90 pointer-events-none" />

        {/* Structural grid lines — editorial texture */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/3 inset-y-0 border-l border-white/5" />
          <div className="absolute left-2/3 inset-y-0 border-l border-white/5" />
        </div>

        <div className="relative max-w-5xl mx-auto w-full">
          {/* Eyebrow with ASIL badge */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2.5 bg-brand-gold/15 border border-brand-gold/30 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-gold" />
              <span className="text-brand-gold text-base font-bold uppercase tracking-[0.2em]">Astellic Social Impact Lab</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-8 max-w-4xl tracking-tight">
            Implementation<br />
            <span className="text-brand-gold">Intelligence</span><br />
            from Practice.
          </h1>

          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed mb-4">
            ASIL is Astellic's institutional implementation laboratory. It exists to test implementation models under real conditions, investigate governance systems, and generate the practice-grounded intelligence that makes Astellic's advisory work more credible and more authoritative.
          </p>
          <p className="text-gray-400 text-base max-w-2xl leading-relaxed mb-10">
            This is not a charitable arm. It is not a foundation. It is a structured learning institution built on the conviction that the most consequential knowledge in African development is produced from within the practice of delivery, not from the outside.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="#pilots"
              className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-7 py-3.5 rounded transition-all duration-200 text-sm"
            >
              Explore Active Pilots
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white font-semibold px-7 py-3.5 rounded transition-all duration-200 text-sm hover:bg-white/5"
            >
              Request a Partnership Discussion
            </Link>
          </div>

          {/* Institutional signal strip */}
          <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 max-w-lg">
            {[
              { value: "Y1", label: "Year One — Active" },
              { value: "001", label: "Pilot in Progress" },
              { value: "Malawi", label: "Primary Operating Context" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-brand-gold font-black text-2xl leading-none mb-1">{s.value}</p>
                <p className="text-gray-500 text-xs leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. WHAT ASIL DOES ────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-4">What ASIL Does</p>
            <h2 className="text-4xl font-bold text-brand-navy leading-tight mb-6 max-w-3xl">
              Two functions. One institutional purpose.
            </h2>
            <p className="text-brand-muted text-lg leading-relaxed max-w-3xl mb-16">
              ASIL operates as both a testing ground and an implementation engine. It pilots ideas — Astellic&apos;s own and those brought by partners — and implements interventions whose evidence base is already established, for Astellic and for partners. Both functions generate the practice-grounded intelligence that makes Astellic&apos;s advisory work credible and authoritative.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-6">
            <SlideLeft>
              <div className="bg-brand-navy rounded-2xl p-8 h-full flex flex-col">
                <div className="mb-5">
                  <span className="text-brand-gold font-black text-4xl leading-none">01</span>
                </div>
                <p className="text-brand-gold text-sm font-bold uppercase tracking-widest mb-3">Test</p>
                <h3 className="text-white font-bold text-xl mb-4 leading-snug">Test implementation ideas</h3>
                <p className="text-gray-300 text-sm leading-relaxed flex-1">
                  ASIL designs and runs structured pilots to investigate why interventions fail during implementation and what governance architectures make them durable. Pilots draw from Astellic&apos;s own research agenda and from partners seeking independent, rigorous evaluation of their ideas under real institutional and community conditions.
                </p>
                <div className="mt-6 pt-6 border-t border-white/10 space-y-2.5">
                  {[
                    "Astellic's own research and learning pilots",
                    "Partner-commissioned pilot studies",
                    "Independent evaluation of untested models",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5 text-gray-400 text-xs">
                      <div className="w-1 h-1 rounded-full bg-brand-gold mt-1.5 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </SlideLeft>

            <SlideRight>
              <div className="bg-brand-light border border-gray-100 rounded-2xl p-8 h-full flex flex-col">
                <div className="mb-5">
                  <span className="text-brand-gold font-black text-4xl leading-none">02</span>
                </div>
                <p className="text-brand-teal text-sm font-bold uppercase tracking-widest mb-3">Implement</p>
                <h3 className="text-brand-navy font-bold text-xl mb-4 leading-snug">Implement proven interventions</h3>
                <p className="text-brand-muted text-sm leading-relaxed flex-1">
                  Where an intervention&apos;s evidence base is established, ASIL takes direct responsibility for implementation: for Astellic and for partners. This is managed delivery under ASIL&apos;s methodological standards, with honest evaluation of what the implementation produces and what it reveals about the conditions for success at scale.
                </p>
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2.5">
                  {[
                    "Delivery of evidence-backed interventions for Astellic",
                    "Partner-commissioned implementation services",
                    "Documented outcomes under real conditions",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5 text-brand-muted text-xs">
                      <div className="w-1 h-1 rounded-full bg-brand-teal mt-1.5 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </SlideRight>
          </div>
        </div>
      </section>

      {/* ── 3. WHY ASIL EXISTS ───────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-brand-light border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-4">The Problem</p>
            <h2 className="text-4xl font-bold text-brand-navy leading-tight mb-4 max-w-3xl">
              Why implementation intelligence is missing, and why it matters.
            </h2>
            <p className="text-brand-muted text-lg leading-relaxed max-w-3xl mb-16">
              Advisory firms that have worked inside systems, designed programmes, managed implementation, confronted delivery failures in real time and adapted in response command a fundamentally different order of credibility from those whose expertise is primarily analytical. Donors, governments and institutional partners intuitively distinguish between the two.
            </p>
          </FadeUp>

          <div className="space-y-0">
            {implementationGapPoints.map((point, i) => (
              <FadeUp key={i}>
                <div className={`grid md:grid-cols-[120px_1fr] gap-8 ${i < implementationGapPoints.length - 1 ? "pb-12 mb-12 border-b border-gray-200" : ""}`}>
                  <div>
                    <span className="inline-block text-sm font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-3 py-1.5 rounded-full">{point.stat}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-navy mb-3">{point.headline}</h3>
                    <p className="text-brand-muted text-base leading-relaxed">{point.body}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* Pull quote */}
          <FadeUp>
            <div className="mt-16 border-l-4 border-brand-gold pl-8 py-4">
              <p className="text-2xl font-bold text-brand-navy leading-snug mb-3">
                "ASIL exists to create a structured environment in which implementation learning is the primary product; that learning feeds directly into better advisory practice."
              </p>
              <p className="text-brand-muted text-sm">ASIL Five-Year Institutional Strategy, 2025–2030</p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 4. OPERATING MODEL ───────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-4">How It Works</p>
            <h2 className="text-4xl font-bold leading-tight mb-4 max-w-3xl">
              The ASIL Operating Model
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mb-16">
              A disciplined five-phase cycle in which every pilot is designed to answer a specific implementation question, actively managed under real conditions, honestly evaluated, and its learning formally transferred into Astellic&apos;s advisory practice and published for the broader development community.
            </p>
          </FadeUp>

          {/* Phase flow */}
          <div className="space-y-0">
            {modelPhases.map((phase, i) => (
              <FadeUp key={i}>
                <div className={`grid md:grid-cols-[80px_140px_1fr] gap-6 items-start ${i < modelPhases.length - 1 ? "pb-10 mb-10 border-b border-white/10" : ""}`}>
                  {/* Number */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-600 font-mono">{phase.num}</span>
                    {i < modelPhases.length - 1 && (
                      <div className="hidden md:block w-px h-full bg-white/10" />
                    )}
                  </div>
                  {/* Verb */}
                  <div>
                    <span className="text-brand-gold font-black text-3xl tracking-tight leading-none">{phase.verb}</span>
                  </div>
                  {/* Content */}
                  <div>
                    <p className="font-bold text-white mb-2">{phase.headline}</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{phase.body}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* Evidence standards callout */}
          <FadeUp>
            <div className="mt-16 bg-white/5 border border-white/10 rounded-2xl p-8">
              <p className="text-sm font-bold uppercase tracking-widest text-brand-gold mb-5">Evidence Standards</p>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  "All data collection protocols are documented before implementation — not constructed post-hoc to justify outcomes.",
                  "Null and negative results are reported as fully and rigorously as positive results. Failed pilots generate as much learning value as successful ones.",
                  "All significant methodological limitations are stated explicitly. ASIL does not claim stronger causal inference than its designs can support.",
                  "Where pilots involve human participants, Malawi National Bioethics Committee clearance and Helsinki Declaration principles apply in full.",
                ].map((standard, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 shrink-0" />
                    <p className="text-gray-300 text-sm leading-relaxed">{standard}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 5. THEMATIC DOMAINS ──────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-4">Thematic Focus</p>
            <h2 className="text-4xl font-bold text-brand-navy leading-tight mb-4 max-w-3xl">
              Four domains. One institutional intelligence purpose.
            </h2>
            <p className="text-brand-muted text-lg leading-relaxed max-w-3xl mb-16">
              ASIL pilots are conducted across Astellic&apos;s four institutional thematic areas: the domains where we have the deepest advisory positioning and the greatest need for practice-grounded implementation evidence. Each domain is a sustained area of learning inquiry, not a portfolio of projects. A well-designed pilot, like Pilot 001, can generate implementation intelligence that speaks across multiple domains simultaneously.
            </p>
          </FadeUp>

          <div className="space-y-8">
            {thematicDomains.map((domain, i) => (
              <ScaleIn key={i} delay={i * 80}>
                <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="grid md:grid-cols-[280px_1fr]">
                    {/* Photo panel */}
                    <div className="relative h-48 md:h-auto overflow-hidden">
                      <Image
                        src={domain.img}
                        alt={domain.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(to right, ${domain.overlayHex}f0 0%, ${domain.overlayHex}99 60%, transparent 100%)` }}
                      />
                      <div className="absolute inset-0 p-6 flex flex-col justify-between">
                        <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{domain.num}</span>
                        <h3 className="text-white font-bold text-xl leading-snug">{domain.title}</h3>
                      </div>
                    </div>
                    {/* Content panel */}
                    <div className="p-8 grid md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-widest text-brand-gold mb-2">Systems Issue</p>
                        <p className="text-brand-muted text-sm leading-relaxed">{domain.systemsIssue}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-widest text-brand-teal mb-2">Lab Focus</p>
                        <p className="text-brand-muted text-sm leading-relaxed">{domain.focus}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-widest text-brand-navy mb-2">Strategic Value</p>
                        <p className="text-brand-muted text-sm leading-relaxed">{domain.strategicValue}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. ASIL PILOTS ───────────────────────────────────────────────── */}
      <section id="pilots" className="py-24 px-6 bg-brand-light border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-4">Active Research</p>
            <h2 className="text-4xl font-bold text-brand-navy leading-tight mb-4 max-w-3xl">
              The ASIL Pilot Programme
            </h2>
            <p className="text-brand-muted text-lg leading-relaxed max-w-3xl mb-4">
              Each ASIL pilot is a structured implementation research study, selected for its learning value and designed to investigate a specific version of the central ASIL question: why effective interventions fail during implementation, and what governance architectures translate them into durable outcomes under real community conditions.
            </p>
            <p className="text-brand-muted text-base leading-relaxed max-w-3xl mb-14">
              Pilots are deliberately small and bounded: large enough to generate meaningful evidence, small enough to manage with methodological rigour. ASIL does not scale before it learns.
            </p>
          </FadeUp>

          <div className="space-y-5">
            {/* Pilot 001 */}
            <FadeUp>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Status strip */}
                <div className="flex items-center gap-3 px-8 py-3.5 bg-brand-gold/5 border-b border-brand-gold/15">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-gold" />
                    <span className="text-brand-gold text-sm font-bold uppercase tracking-widest">Active · Design Phase</span>
                  </div>
                  <span className="text-gray-400 text-xs font-mono ml-auto">ASIL-P001-MW-2025</span>
                </div>

                <div className="p-8">
                  {/* Domain tags */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {["Health", "Environmental Sustainability"].map((tag) => (
                      <span key={tag} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-navy/5 text-brand-navy border border-brand-navy/10">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-brand-navy leading-snug mb-1.5">
                        Clean Cooking and Women&apos;s Health
                      </h3>
                      <p className="text-brand-navy/60 font-medium text-sm mb-5">
                        A Community Governance and Adaptive Accountability Pilot · Malawi
                      </p>
                      <p className="text-brand-muted text-base leading-relaxed mb-6 max-w-2xl">
                        The inaugural ASIL case study pilot. Improved cookstoves are a well-evidenced, clearly effective women&apos;s health intervention — and they fail, consistently, across decades of programming. Sustained adoption beyond the sponsored project period rarely materialises. This pilot uses clean cooking as a live investigation of the central ASIL question: what community governance architecture makes a known-good intervention durable?
                      </p>

                      <div className="flex items-center gap-6 text-sm text-gray-500 mb-6 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          <span>Malawi — 3 communities</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                          <span>Jun 2026 – May 2027</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                          <span>Expected report: Q2–Q3 2027</span>
                        </div>
                      </div>

                      <Link
                        href="/asil/pilots/asil-p001"
                        className="inline-flex items-center gap-2 bg-brand-navy hover:bg-brand-navy/90 text-white font-semibold text-sm px-6 py-3 rounded-lg transition-colors"
                      >
                        View Full Pilot Details
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>

                    {/* Sidebar summary */}
                    <div className="shrink-0 min-w-[220px] bg-brand-light rounded-xl border border-gray-100 p-5 space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2">The Investigation</p>
                        <p className="text-brand-navy text-sm font-semibold leading-snug italic">
                          &ldquo;What governance architecture makes a known-effective intervention durable?&rdquo;
                        </p>
                      </div>
                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2">Primary Output</p>
                        <p className="text-brand-navy text-xs leading-relaxed">ASIL Learning Report 001 + Implementation Intelligence Brief</p>
                      </div>
                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2">Duration</p>
                        <p className="text-brand-navy text-xs">12 months · Jun 2026 – May 2027</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>

            {/* Future pilots placeholder */}
            <FadeUp>
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-10 px-8 text-center">
                <p className="text-gray-400 text-sm font-medium mb-1">Pilot 002 — in development</p>
                <p className="text-gray-300 text-xs">Domain and design to be confirmed · Expected commencement 2027</p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── 7. PARTNERSHIPS ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-4">Collaboration</p>
            <h2 className="text-4xl font-bold leading-tight mb-4 max-w-3xl">
              Selective. Serious. Institutionally disciplined.
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mb-16">
              ASIL selects collaborators based on intellectual seriousness, institutional alignment and genuine commitment to evidence standards. Every partnership agreement makes explicit that ASIL publishes findings as the evidence shows them, regardless of implications for partner preferences.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-5">
            {partnershipCategories.map((cat, i) => (
              <FadeUp key={i}>
                <div className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-7 transition-colors">
                  <p className="text-brand-gold text-sm font-bold uppercase tracking-widest mb-3">{cat.category}</p>
                  <p className="text-gray-200 text-sm leading-relaxed mb-4">{cat.description}</p>
                  <p className="text-gray-500 text-xs italic mb-4">{cat.examples}</p>
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-xs text-gray-400 leading-relaxed">{cat.selectivityNote}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp>
            <div className="mt-10 text-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-white/30 hover:border-brand-gold hover:bg-brand-gold/10 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 text-sm"
              >
                Discuss a Partnership or Collaboration
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 8. FINAL CTA ────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-[1fr_auto] gap-12 items-start">
            <SlideLeft>
              <div>
                <p className="text-brand-gold text-base font-bold uppercase tracking-[0.2em] mb-4">Engage with ASIL</p>
                <h2 className="text-4xl font-bold leading-tight mb-5 max-w-xl">
                  This is where African implementation systems are studied seriously.
                </h2>
                <p className="text-gray-300 text-base leading-relaxed mb-10">
                  ASIL is building a body of practice evidence that will, over five years, establish Astellic as an African institution that advises on implementation, demonstrates what rigorous implementation looks like under real conditions, and publishes what it learns.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-7 py-3.5 rounded transition-colors text-sm"
                  >
                    Discuss an Engagement or Partnership
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 border border-white/25 hover:border-white/50 text-white font-semibold px-7 py-3.5 rounded transition-colors text-sm"
                  >
                    Request Pilot 001 Concept Note
                  </Link>
                </div>
              </div>
            </SlideLeft>

            <SlideRight>
              <div className="space-y-4 min-w-[260px]">
                {[
                  { label: "Academic institutions", detail: "Joint pilot design & co-authorship" },
                  { label: "ESG learning partnerships", detail: "Corporate social investment governance" },
                  { label: "Implementation collaborations", detail: "Embedding ASIL pilots in live programmes" },
                  { label: "Government pilots", detail: "Accountability & governance systems" },
                  { label: "Implementation intelligence network", detail: "Access to published Learning Reports" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
                    <div>
                      <p className="text-white text-sm font-semibold">{item.label}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SlideRight>
          </div>

          {/* Footer note */}
          <FadeUp>
            <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-gray-400 text-xs leading-relaxed max-w-lg">
                  ASIL is an internal strategic platform within Astellic. It is not a separate legal entity, a grant-making institution, or a charitable foundation. Partnerships and collaborations are entered into on terms consistent with ASIL's evidence standards and intellectual integrity commitments.
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-xs">partnerships@astellic.com</p>
                <p className="text-gray-600 text-xs">www.astellic.com/asil</p>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
