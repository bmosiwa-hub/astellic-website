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
    body: "Learning moves from ASIL into Astellic's advisory work through three formal mechanisms: Quarterly Learning Integration Reviews, Methodology Development Cycles, and public publication. Published Learning Reports are attributed to ASIL and distributed through Astellic's donor and partner networks — converting pilot evidence into institutional credibility.",
  },
];

const thematicDomains = [
  {
    num: "01",
    title: "Health & Nutrition Systems",
    img: "/images/thematic-health.jpg",
    overlayHex: "#1B2A4A",
    href: "/thematic-areas/health",
    systemsIssue: "Implementation system failures, not resource constraints, explain most persistent gaps between health policy intent and service delivery.",
    focus: "ASIL's health pilots investigate specific, bounded questions about implementation failure: why do known-effective community health interventions fail to produce durable outcomes, and what governance architectures change that? The inaugural pilot uses clean cooking as a case study in community-governed women's health outcomes.",
    strategicValue: "Documented health implementation evidence positions Astellic as a firm that has not just advised on health systems — but designed, managed, and honestly evaluated health system interventions under real conditions.",
  },
  {
    num: "02",
    title: "Governance & Public Sector Reform",
    img: "/images/thematic-governance.jpg",
    overlayHex: "#0D7A6E",
    href: "/thematic-areas/governance",
    systemsIssue: "Most governance advisory is analytically competent but institutionally thin — technically correct and politically undeliverable.",
    focus: "ASIL's governance pilots focus on accountability system design in decentralised service delivery, the gap between legislative intent and administrative capacity, and citizen engagement mechanisms that improve governance responsiveness rather than simulate it.",
    strategicValue: "Governance implementation intelligence positions Astellic for complex, high-value advisory where contextually grounded implementation experience — not technical competence alone — is the differentiator.",
  },
  {
    num: "03",
    title: "Education & Social Systems",
    img: "/images/thematic-education.jpg",
    overlayHex: "#2D4A1E",
    href: "/thematic-areas/education",
    systemsIssue: "The implementation systems that determine whether educational investment reaches its objectives remain chronically understudied.",
    focus: "ASIL's education pilots prioritise implementation systems questions over pedagogical content: MERL system design for education management information systems; governance arrangements that predict teacher performance in low-resource settings; institutional conditions for evidence use in district planning cycles.",
    strategicValue: "A documented education implementation evidence base allows Astellic to pursue education advisory and evaluation assignments with demonstrable credentials extending beyond the founder's primary health specialisation.",
  },
  {
    num: "04",
    title: "Climate, Agriculture & Sustainability",
    img: "/images/thematic-climate.jpg",
    overlayHex: "#1A3A2A",
    href: "/thematic-areas/climate",
    systemsIssue: "Climate finance is accelerating into African communities and systems that lack the institutional capacity to govern and account for it.",
    focus: "ASIL targets the governance, accountability, and adaptive management systems that determine whether climate investment reaches intended outcomes — not the technical or scientific dimensions of climate response, but the institutional architecture required to deliver it.",
    strategicValue: "As climate finance flows increase, the demand for credible implementation advisory in this sector will grow significantly. ASIL's documented pilots create the institutional credibility to compete for these opportunities.",
  },
];

const publicationTypes = [
  {
    label: "ASIL Learning Report",
    description: "10–20 pages. The primary pilot knowledge product. Documents design, implementation, findings, and learning implications. Honest about failure.",
    frequency: "Per pilot",
    audience: "Donors, governments, development practitioners, academics",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    label: "Implementation Intelligence Brief",
    description: "4–6 pages. Distils one key learning from a pilot into a practice-focused brief for programme managers and policymakers.",
    frequency: "Quarterly from Year 1",
    audience: "Programme officers, implementing partners, policy analysts",
    icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    label: "ASIL Annual Review",
    description: "30–40 pages. Synthesises learning across all active and completed pilots. Includes methodological reflections and advisory implications.",
    frequency: "Annual from Year 2",
    audience: "Institutional partners, donors, government departments, research institutions",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    label: "Practice Notes",
    description: "2–4 pages. Rapid, operationally focused notes on specific implementation challenges emerging from active pilots.",
    frequency: "As needed",
    audience: "Field practitioners, implementing NGOs, government officers",
    icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
  },
  {
    label: "ASIL Working Paper",
    description: "Academic-format paper co-authored with university partners, peer-reviewed for submission to development journals.",
    frequency: "Annual from Year 3",
    audience: "Academic and research community; institutional credibility",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
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
    selectivityNote: "ASIL selects implementation partners based on learning alignment and institutional seriousness — not funding availability.",
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
              <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em]">Astellic Social Impact Lab</span>
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
          <p className="text-gray-400 text-base max-w-xl leading-relaxed mb-10">
            This is not a charitable arm. It is not a foundation. It is a structured learning institution — built on the conviction that the most consequential knowledge in African development is produced from within the practice of delivery, not from the outside.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="#pilot-001"
              className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-7 py-3.5 rounded transition-all duration-200 text-sm"
            >
              Explore Pilot 001
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

      {/* ── 2. WHAT IS ASIL ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-4">What ASIL Is</p>
            <h2 className="text-4xl font-bold text-brand-navy leading-tight mb-6 max-w-3xl">
              A systems laboratory. Not a charitable programme.
            </h2>
            <p className="text-brand-muted text-lg leading-relaxed max-w-2xl mb-16">
              ASIL occupies a specific and deliberately underoccupied position in the African development landscape: the implementation laboratory that takes ideas seriously enough to test them, and tests them rigorously enough to know what actually happened.
            </p>
          </FadeUp>

          <SlideLeft>
            <div className="bg-brand-navy rounded-2xl p-8 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-6">ASIL is</p>
              <ul className="space-y-4">
                {[
                  "A structured implementation laboratory embedded within Astellic's architecture",
                  "An implementation intelligence platform generating evidence from practice",
                  "A methodology development and validation environment",
                  "A demonstration site for evidence-based delivery under real conditions",
                  "A strategic credibility asset for Astellic's advisory positioning",
                  "A source of practice-grounded institutional knowledge for the development community",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-200 text-sm">
                    <svg className="w-4 h-4 text-brand-gold mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </SlideLeft>
        </div>
      </section>

      {/* ── 3. WHY ASIL EXISTS ───────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-brand-light border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-4">The Problem</p>
            <h2 className="text-4xl font-bold text-brand-navy leading-tight mb-4 max-w-3xl">
              Why implementation intelligence is missing — and why it matters.
            </h2>
            <p className="text-brand-muted text-lg leading-relaxed max-w-2xl mb-16">
              Advisory firms that have worked inside systems — that have designed programmes, managed implementation, confronted delivery failures in real time, and adapted in response — command a fundamentally different order of credibility from those whose expertise is primarily analytical. Donors, governments, and institutional partners intuitively distinguish between the two.
            </p>
          </FadeUp>

          <div className="space-y-0">
            {implementationGapPoints.map((point, i) => (
              <FadeUp key={i}>
                <div className={`grid md:grid-cols-[120px_1fr] gap-8 ${i < implementationGapPoints.length - 1 ? "pb-12 mb-12 border-b border-gray-200" : ""}`}>
                  <div>
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-3 py-1.5 rounded-full">{point.stat}</span>
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
                "ASIL exists to create a structured environment in which implementation learning is the primary product — and that learning feeds directly into better advisory practice."
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
            <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-4">How It Works</p>
            <h2 className="text-4xl font-bold leading-tight mb-4 max-w-3xl">
              The ASIL Operating Model
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mb-16">
              A disciplined five-phase cycle in which every pilot is designed to answer a specific implementation question, actively managed under real conditions, honestly evaluated, and its learning formally transferred into Astellic's advisory practice and published for the broader development community.
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
              <p className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-5">Evidence Standards</p>
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
            <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-4">Thematic Focus</p>
            <h2 className="text-4xl font-bold text-brand-navy leading-tight mb-4 max-w-3xl">
              Four domains. One institutional intelligence purpose.
            </h2>
            <p className="text-brand-muted text-lg leading-relaxed max-w-2xl mb-16">
              ASIL's thematic domains mirror Astellic's four areas of advisory practice — but ASIL's engagement with each is distinctive: pilot-based, practice-grounded, and oriented toward generating reusable institutional intelligence rather than delivering services. Each domain represents a sustained area of learning inquiry, not a portfolio of projects.
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
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-2">Systems Issue</p>
                        <p className="text-brand-muted text-sm leading-relaxed">{domain.systemsIssue}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-teal mb-2">Lab Focus</p>
                        <p className="text-brand-muted text-sm leading-relaxed">{domain.focus}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-navy mb-2">Strategic Value</p>
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

      {/* ── 6. PILOT 001 ─────────────────────────────────────────────────── */}
      <section id="pilot-001" className="py-24 px-6 bg-brand-light border-t border-gray-200">
        <div className="max-w-5xl mx-auto">

          {/* The ASIL question — framing block above the pilot */}
          <FadeUp>
            <div className="mb-16 border-l-4 border-brand-gold pl-8 py-2">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-3">The Central ASIL Question</p>
              <p className="text-2xl font-bold text-brand-navy leading-snug max-w-3xl">
                Why do effective interventions fail during implementation — and what governance architectures translate good interventions into durable outcomes under real community conditions?
              </p>
            </div>
          </FadeUp>

          <FadeUp>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2 bg-brand-gold text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                Active
              </div>
              <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em]">ASIL Pilot 001 · ASIL-P001-MW-2025 · Case Study</p>
            </div>
            <h2 className="text-4xl font-bold text-brand-navy leading-tight mb-3 max-w-3xl">
              Clean Cooking and Women&apos;s Health
            </h2>
            <p className="text-brand-navy/60 text-base font-medium mb-4 max-w-2xl">
              A Community Governance and Adaptive Accountability Pilot
            </p>
            <p className="text-brand-muted text-lg leading-relaxed max-w-2xl mb-12">
              The inaugural ASIL case study pilot. Improved cookstoves are a well-evidenced, clearly effective women&apos;s health intervention. They also fail — consistently, across decades of programming — because sustained adoption beyond the sponsored project period rarely materialises. This pilot uses clean cooking as a live case study in the central ASIL implementation question: what governance architecture makes a known-good intervention durable?
            </p>
          </FadeUp>

          {/* The implementation failure framing */}
          <FadeUp>
            <div className="mb-10 grid md:grid-cols-3 gap-4">
              {[
                {
                  label: "The evidence is settled",
                  body: "Improved cookstoves reduce exposure to household air pollution, which causes serious respiratory and cardiovascular harm. The technology works. The health case is unambiguous.",
                  icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                  tone: "positive",
                },
                {
                  label: "The implementation fails",
                  body: "Sustained adoption beyond the sponsored project period is consistently low. Cookstoves are distributed, used briefly, and abandoned. The failure repeats across geographies, implementers, and funding sources.",
                  icon: "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                  tone: "negative",
                },
                {
                  label: "The ASIL question",
                  body: "If the failure is not in the technology or the evidence, it is in the implementation architecture. What governance system — designed deliberately, not assumed — is sufficient to make adoption durable?",
                  icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.933-.399.08-.667.43-.667.808V14m0 4h.01",
                  tone: "question",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className={`rounded-2xl p-6 ${
                    card.tone === "positive"
                      ? "bg-white border border-gray-100"
                      : card.tone === "negative"
                      ? "bg-red-50 border border-red-100"
                      : "bg-brand-navy"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <svg
                      className={`w-5 h-5 shrink-0 ${
                        card.tone === "positive"
                          ? "text-brand-teal"
                          : card.tone === "negative"
                          ? "text-red-500"
                          : "text-brand-gold"
                      }`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                    </svg>
                    <p className={`text-xs font-bold uppercase tracking-widest ${
                      card.tone === "question" ? "text-brand-gold" : card.tone === "negative" ? "text-red-600" : "text-brand-teal"
                    }`}>{card.label}</p>
                  </div>
                  <p className={`text-sm leading-relaxed ${card.tone === "question" ? "text-gray-200" : "text-brand-muted"}`}>
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </FadeUp>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">

            {/* Pilot header band */}
            <div className="bg-brand-navy px-8 py-5 grid md:grid-cols-4 gap-6">
              {[
                { label: "Primary Domain", value: "Health & Nutrition Systems" },
                { label: "Geography", value: "Three Pilot Communities, Malawi" },
                { label: "Duration", value: "12 months · 2025–2026" },
                { label: "Expected Report", value: "Q4 2026 / Q1 2027" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-white text-sm font-semibold leading-snug">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="p-8 grid md:grid-cols-[1fr_340px] gap-10">
              {/* Main content */}
              <div className="space-y-8">
                {/* Overview */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-3">Why This Case Study</p>
                  <p className="text-brand-muted text-base leading-relaxed">
                    Clean cooking programmes make an ideal ASIL case study precisely because the intervention is not in question. The evidence base for improved cookstoves as a women&apos;s health intervention is robust, well-replicated, and uncontested. The failure point is equally well-documented: sustained adoption beyond the period of external support is low, consistently, across contexts.
                  </p>
                  <p className="text-brand-muted text-base leading-relaxed mt-3">
                    This means any failure in this pilot is a pure implementation and governance failure — not a technology problem, not an evidence problem, not a context problem that invalidates the intervention. The cookstove is a known-good instrument. The question is whether a deliberately designed community governance architecture can overcome the implementation failure that has frustrated the same instrument for decades.
                  </p>
                  <p className="text-brand-muted text-base leading-relaxed mt-3">
                    The pilot tests a specific governance design: a <strong className="text-brand-navy">Community Accountability Committee</strong> with an explicit equity mandate, a <strong className="text-brand-navy">Women&apos;s Health Evidence System</strong> that puts adoption data in community hands, and a structured <strong className="text-brand-navy">quarterly adaptive governance cycle</strong>. If this architecture sustains adoption where other programmes have not, it will constitute significant evidence for the central ASIL hypothesis — that governance design is the binding constraint on implementation success for known-good interventions.
                  </p>
                </div>

                {/* Learning questions */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-4">Key Learning Questions</p>
                  <div className="space-y-3">
                    {[
                      "Does a purposefully designed community accountability system sustain improved cookstove adoption beyond the sponsored project period — and through precisely what governance mechanisms?",
                      "What design features of the Community Accountability Committee — composition, equity mandate, evidence protocols, decision authority — most reliably produce a governance response when adoption stalls?",
                      "What role does a community-held Women's Health Evidence System play in sustaining adoption decisions and activating accountability responses at household level?",
                      "What does this case study reveal about the governance conditions required to make known-effective community health interventions durable — and what does it imply for how such interventions are designed and governed in other sectors?",
                    ].map((q, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-brand-gold font-bold text-sm mt-0.5 shrink-0">Q{i + 1}</span>
                        <p className="text-brand-muted text-sm leading-relaxed">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Methodology */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-4">Methodology Highlights</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { method: "Community governance design", detail: "Three purposively selected communities — Community Accountability Committee established with an explicit equity mandate and defined decision protocols before distribution commences" },
                      { method: "Women's Health Evidence System", detail: "Community-held adoption tracking system that makes household-level data visible and actionable for the Accountability Committee each quarter" },
                      { method: "Quarterly adaptive governance", detail: "Structured cycle: evidence review, committee deliberation, targeted follow-up, documented adaptation — at each site, each quarter" },
                      { method: "Adoption outcome tracking", detail: "Consistent use monitoring across targeted households, disaggregated by equity exposure burden and household composition" },
                      { method: "Adaptive management log", detail: "Documented decision log tracking all pilot adaptations, evidence triggers, and the governance responses they produced" },
                      { method: "Ethics clearance", detail: "Malawi National Bioethics Committee clearance required prior to field activities. Helsinki Declaration principles apply throughout." },
                    ].map((item) => (
                      <div key={item.method} className="bg-brand-light rounded-xl p-4 border border-gray-100">
                        <p className="font-bold text-brand-navy text-sm mb-1">{item.method}</p>
                        <p className="text-brand-muted text-xs leading-relaxed">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                {/* Timeline */}
                <div className="bg-brand-light rounded-2xl p-6 border border-gray-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-5">Pilot Timeline</p>
                  <div className="space-y-4">
                    {[
                      { phase: "Phase 1 — Design", period: "2025 Q3–Q4", detail: "Concept note finalisation, ethics submission, community partner engagement, CAC design, site confirmation" },
                      { phase: "Phase 2 — Implementation", period: "2026 Q1–Q3", detail: "Cookstove distribution, CAC establishment, WHES activation, quarterly governance cycles, adaptive management" },
                      { phase: "Phase 3 — Evaluation", period: "2026 Q3–Q4", detail: "Adoption outcome analysis, governance system evaluation, Learning Report drafting" },
                      { phase: "Publication", period: "Q4 2026 / Q1 2027", detail: "ASIL Learning Report 001 + Implementation Intelligence Brief 001" },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-2 h-2 rounded-full shrink-0 mt-1 ${i === 0 ? "bg-brand-gold" : "bg-gray-300"}`} />
                          {i < 3 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                        </div>
                        <div className="pb-4">
                          <p className="font-semibold text-brand-navy text-xs">{item.phase}</p>
                          <p className="text-brand-gold text-xs font-medium mb-1">{item.period}</p>
                          <p className="text-brand-muted text-xs leading-snug">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Knowledge products */}
                <div className="bg-brand-navy rounded-2xl p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">Expected Knowledge Products</p>
                  <div className="space-y-3">
                    {[
                      "ASIL Learning Report 001 — Clean Cooking & Women's Health Pilot",
                      "ASIL Implementation Intelligence Brief — Governance architecture for durable community health interventions",
                      "Community Accountability Committee design framework — replicable governance template",
                      "Women's Health Evidence System — community data protocol and methodology note",
                    ].map((product) => (
                      <div key={product} className="flex items-start gap-2.5">
                        <div className="w-1 h-1 rounded-full bg-brand-gold mt-2 shrink-0" />
                        <p className="text-gray-300 text-xs leading-relaxed">{product}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strategic significance */}
                <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-2xl p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-3">Strategic Significance</p>
                  <p className="text-brand-navy text-sm leading-relaxed">
                    Because the intervention is known-good, the Learning Report&apos;s findings — whether positive or negative — will constitute direct evidence on a question with implications far beyond clean cooking: whether governance architecture alone can determine the durability of community health interventions. That is learning applicable across every thematic area ASIL operates in.
                  </p>
                </div>

                <Link
                  href="/contact"
                  className="flex items-center justify-between bg-white border border-gray-200 hover:border-brand-gold rounded-xl p-5 group transition-colors"
                >
                  <div>
                    <p className="font-bold text-brand-navy text-sm">Request Pilot Briefing</p>
                    <p className="text-brand-muted text-xs mt-0.5">Full concept note available to institutional partners</p>
                  </div>
                  <svg className="w-5 h-5 text-brand-gold group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6b. CROSS-THEMATIC DEMONSTRATION ────────────────────────────── */}
      <section className="py-24 px-6 bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-4">Pilot 001 — Cross-Thematic Scope</p>
            <h2 className="text-4xl font-bold text-brand-navy leading-tight mb-4 max-w-3xl">
              One implementation question. Four domains of evidence.
            </h2>
            <p className="text-brand-muted text-lg leading-relaxed max-w-2xl mb-4">
              The central ASIL question — why effective interventions fail during implementation — does not respect thematic boundaries. The clean cooking and women&apos;s health case study generates implementation intelligence simultaneously across health, governance, climate, and education. Not because the pilot was designed to cover every domain, but because implementation failure is inherently cross-cutting.
            </p>
            <p className="text-brand-muted text-base leading-relaxed max-w-2xl mb-14">
              Each domain asks a version of the same question through a different institutional lens. The Learning Report will address each lens separately — and the synthesis will be the most significant output.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                num: "01",
                domain: "Health & Nutrition Systems",
                question: "Why does a known-effective women's health intervention fail to produce durable health outcomes?",
                mechanism: "Because the failure is not in the intervention — it is in the governance of adoption. The pilot tests whether a community accountability architecture with an explicit equity mandate can close the gap between a distributed product and a sustained health outcome.",
                learning: "Governance design as the binding constraint on community health intervention durability; equity-disaggregated adoption as a health outcome metric; community accountability as a health systems tool.",
              },
              {
                num: "02",
                domain: "Governance & Public Sector Reform",
                question: "What accountability architecture actually sustains community-level behaviour change over 12 months?",
                mechanism: "The Community Accountability Committee is the governance experiment. The pilot tests which design features — composition, mandate specificity, evidence protocols, decision authority — produce real responses when adoption stalls, and which produce only process compliance.",
                learning: "Community accountability committee design principles; equity mandate operationalisation in practice; adaptive governance protocols and their real-world conditions of effectiveness.",
              },
              {
                num: "03",
                domain: "Climate, Agriculture & Sustainability",
                question: "Why do household clean energy transitions fail to persist — and what changes that?",
                mechanism: "Cookstove abandonment is a household energy governance failure. As climate finance accelerates into community-level clean energy interventions, the institutional conditions for sustained adoption become critical. This pilot generates direct evidence on what those conditions require.",
                learning: "Governance architecture for durable household energy transitions; community accountability as a clean energy delivery mechanism; implementation conditions for sustained low-carbon behaviour change.",
              },
              {
                num: "04",
                domain: "Education & Social Systems",
                question: "What happens to community decision-making when communities hold their own health evidence?",
                mechanism: "The Women's Health Evidence System is not only an adoption tracking tool — it is a social learning intervention. The pilot examines whether community ownership of health data changes the quality of accountability responses, and what that implies for evidence-informed community governance more broadly.",
                learning: "Community data literacy as a governance mechanism; evidence ownership and its effect on accountability responsiveness; social learning dynamics within structured community governance systems.",
              },
            ].map((item, i) => (
              <ScaleIn key={i} delay={i * 80}>
                <div className="bg-brand-light border border-gray-100 rounded-2xl p-7 h-full flex flex-col gap-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-400 font-mono">{item.num}</span>
                      <h3 className="text-brand-navy font-bold text-base mt-1 leading-snug">{item.domain}</h3>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-brand-gold mt-1.5 shrink-0" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-2">The Domain Question</p>
                    <p className="text-brand-navy text-sm font-semibold leading-snug italic">&ldquo;{item.question}&rdquo;</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-2">What the Pilot Tests</p>
                    <p className="text-brand-muted text-sm leading-relaxed">{item.mechanism}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-teal mb-2">Learning Output</p>
                    <p className="text-brand-muted text-xs leading-relaxed">{item.learning}</p>
                  </div>
                </div>
              </ScaleIn>
            ))}
          </div>

          {/* Synthesis note */}
          <FadeUp>
            <div className="mt-10 bg-brand-navy rounded-2xl p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-4">Why This Design Choice Matters</p>
              <p className="text-gray-200 text-base leading-relaxed max-w-3xl">
                By anchoring Pilot 001 in a case study where the intervention is already known to work, ASIL eliminates the most common confound in implementation research: the question of whether the underlying approach was right. If adoption fails in this pilot, the failure cannot be attributed to the technology, the evidence base, or the theory of change. It will be an implementation and governance failure — and the investigation of exactly why will produce learning with direct application across every domain ASIL operates in. That is the design logic.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 7. INTELLIGENCE LIBRARY ───────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-4">Knowledge Products</p>
            <h2 className="text-4xl font-bold text-brand-navy leading-tight mb-4 max-w-3xl">
              Implementation Intelligence Library
            </h2>
            <p className="text-brand-muted text-lg leading-relaxed max-w-2xl mb-6">
              ASIL's publications are not reports that sit on a shelf. They are the primary mechanism through which the Lab's learning reaches the advisory and policy community, generates institutional recognition for Astellic, and builds the intellectual authority that distinguishes ASIL from implementation agencies.
            </p>
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2 mb-12">
              <div className="w-2 h-2 rounded-full bg-brand-gold" />
              <p className="text-amber-800 text-xs font-semibold">Publications will appear here as pilots are completed and reports are finalised. First publication expected Q1 2027.</p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {publicationTypes.map((pub, i) => (
              <FadeIn key={i}>
                <div className="bg-brand-light border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 h-full">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={pub.icon} />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-brand-navy text-sm mb-2">{pub.label}</p>
                    <p className="text-brand-muted text-xs leading-relaxed mb-3">{pub.description}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Frequency</span>
                        <span className="text-[10px] text-brand-navy font-medium">{pub.frequency}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted shrink-0">Audience</span>
                        <span className="text-[10px] text-brand-navy font-medium leading-snug">{pub.audience}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    No publications yet
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. PARTNERSHIPS ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-4">Collaboration</p>
            <h2 className="text-4xl font-bold leading-tight mb-4 max-w-3xl">
              Selective. Serious. Institutionally disciplined.
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mb-16">
              ASIL does not seek partners broadly. It selects collaborators based on intellectual seriousness, institutional alignment, and genuine commitment to evidence standards. Every partnership agreement makes explicit that ASIL publishes findings as the evidence shows them — regardless of implications for partner preferences.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-5">
            {partnershipCategories.map((cat, i) => (
              <FadeUp key={i}>
                <div className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-7 transition-colors">
                  <p className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-3">{cat.category}</p>
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

      {/* ── 9. RELATIONSHIP TO ASTELLIC ──────────────────────────────────── */}
      <section className="py-24 px-6 bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-4">Institutional Architecture</p>
            <h2 className="text-4xl font-bold text-brand-navy leading-tight mb-4 max-w-3xl">
              ASIL within Astellic: integrated, but intellectually distinct.
            </h2>
            <p className="text-brand-muted text-lg leading-relaxed max-w-2xl mb-16">
              The relationship between ASIL and Astellic's commercial operations is directional: ASIL generates learning and evidence that feeds into Astellic's advisory work. The reverse does not happen — Astellic's commercial priorities do not determine ASIL's research agenda. This separation is what preserves ASIL's intellectual integrity and, through it, its long-term value to Astellic.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                direction: "→",
                from: "ASIL Pilots",
                to: "Advisory Credibility",
                mechanism: "Quarterly Learning Integration Reviews",
                detail: "Published Learning Reports become part of Astellic's capability evidence base — allowing the firm to point to documented implementation experience, not just analytical expertise.",
              },
              {
                direction: "→",
                from: "ASIL Methodology",
                to: "Advisory Practice",
                mechanism: "Methodology Development Cycles",
                detail: "When pilots test or refine specific methodologies — DQA protocols, implementation readiness frameworks, adaptive MERL approaches — those refined tools are formally added to Astellic's methodology library.",
              },
              {
                direction: "→",
                from: "ASIL Publications",
                to: "Market Positioning",
                mechanism: "Publication & Credibility Transfer",
                detail: "ASIL's published Learning Reports and Annual Reviews are attributed to ASIL as a platform within Astellic — distributing institutional credibility through Astellic's donor and partner networks.",
              },
            ].map((flow, i) => (
              <SlideLeft key={i}>
                <div className="bg-brand-light rounded-2xl p-6 border border-gray-100 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-bold text-brand-navy bg-white border border-gray-200 px-2 py-1 rounded">{flow.from}</span>
                    <span className="text-brand-gold font-bold">{flow.direction}</span>
                    <span className="text-xs font-bold text-brand-navy bg-white border border-gray-200 px-2 py-1 rounded">{flow.to}</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-teal mb-2">{flow.mechanism}</p>
                  <p className="text-brand-muted text-sm leading-relaxed flex-1">{flow.detail}</p>
                </div>
              </SlideLeft>
            ))}
          </div>

          {/* Governance rules */}
          <FadeUp>
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="bg-brand-light px-7 py-4 border-b border-gray-100">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">Governance Rules</p>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  { rule: "Institutional identity", text: "ASIL is presented as a platform within Astellic's architecture — not as a separate institution that happens to be associated with Astellic." },
                  { rule: "Research independence", text: "ASIL's research agenda is not determined by Astellic's commercial pipeline. The Lab investigates questions strategically relevant to Astellic's work — but does not function as a free research arm for client assignments." },
                  { rule: "Intellectual integrity", text: "ASIL's findings are reported as the evidence shows, regardless of implications for Astellic's commercial interests or for the positions of institutional partners. Any attempt to suppress findings is treated as a governance violation." },
                  { rule: "Annual evaluation", text: "ASIL is evaluated annually against its contribution to Astellic's institutional credibility, not against a standalone impact metric. The governing question: Has ASIL made Astellic a more credible and effective advisory firm this year?" },
                ].map((item) => (
                  <div key={item.rule} className="grid md:grid-cols-[180px_1fr] gap-6 px-7 py-5">
                    <p className="text-xs font-bold text-brand-navy uppercase tracking-wider">{item.rule}</p>
                    <p className="text-brand-muted text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 10. FINAL CTA ────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-[1fr_auto] gap-12 items-start">
            <SlideLeft>
              <div>
                <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-4">Engage with ASIL</p>
                <h2 className="text-4xl font-bold leading-tight mb-5 max-w-xl">
                  This is where African implementation systems are studied seriously.
                </h2>
                <p className="text-gray-300 text-base leading-relaxed max-w-lg mb-10">
                  ASIL is building a body of practice evidence that will, over five years, establish Astellic as an African institution that does not simply advise on implementation — but demonstrates what rigorous implementation looks like, under real conditions, and publishes what it learns.
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
