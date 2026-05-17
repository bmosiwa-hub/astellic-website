import type { Metadata } from "next";
import Link from "next/link";
import { FadeUp, SlideLeft, ScaleIn, FadeIn } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "ASIL Pilot 001 — Clean Cooking and Women's Health | Astellic",
  description:
    "ASIL-P001-MW-2025: A community governance and adaptive accountability pilot in Malawi, testing whether purposefully designed governance architecture can sustain improved cookstove adoption as a durable women's health outcome.",
};

export default function ASILPilot001Page() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy text-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/asil#pilots"
              className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              ASIL Pilots
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-gray-400 text-sm">Pilot 001</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="flex items-center gap-2 bg-brand-gold text-white text-sm font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              Active — Design Phase
            </span>
            <span className="text-gray-500 text-sm font-mono">ASIL-P001-MW-2025</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-[1.08] mb-4 max-w-4xl tracking-tight">
            Clean Cooking and Women&apos;s Health
          </h1>
          <p className="text-gray-400 text-xl font-medium mb-6 max-w-3xl">
            A Community Governance and Adaptive Accountability Pilot
          </p>
          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mb-10">
            ASIL&apos;s inaugural implementation learning pilot. A 12-month case study in the central
            question of implementation science: why do known-effective interventions fail during
            implementation, and what governance architecture makes them durable?
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10">
            {[
              { label: "Reference", value: "ASIL-P001-MW-2025" },
              { label: "Geography", value: "Malawi — 3 Communities" },
              { label: "Duration", value: "12 months · Jun 2026 – May 2027" },
              { label: "Expected Report", value: "Q2–Q3 2027" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-white text-sm font-semibold leading-snug">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE ASIL QUESTION ────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="border-l-4 border-brand-gold pl-8 py-2">
              <p className="text-base font-bold uppercase tracking-widest text-brand-gold mb-3">The Central ASIL Question</p>
              <p className="text-2xl font-bold text-brand-navy leading-snug max-w-3xl">
                Why do effective interventions fail during implementation — and what governance architectures
                translate good interventions into durable outcomes under real community conditions?
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FRAMING: EVIDENCE / FAILURE / QUESTION ───────────────────────── */}
      <section className="py-16 px-6 bg-brand-light border-b border-gray-200">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-base font-bold uppercase tracking-widest text-brand-muted mb-8">Why This Case Study</p>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                label: "The evidence is settled",
                body: "Improved cookstoves reduce exposure to household air pollution, which causes serious respiratory and cardiovascular harm concentrated among women who cook. The technology works. The health case is unambiguous.",
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                tone: "positive" as const,
              },
              {
                label: "The implementation fails",
                body: "Sustained adoption beyond the sponsored project period is consistently low. Cookstoves are distributed, used briefly, and abandoned. The failure repeats across geographies, implementers, and funding sources — decade after decade.",
                icon: "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                tone: "negative" as const,
              },
              {
                label: "The ASIL question",
                body: "If the failure is not in the technology or the evidence, it is in the implementation architecture. What governance system — designed deliberately, not assumed — is sufficient to make adoption durable? That is what this pilot tests.",
                icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.933-.399.08-.667.43-.667.808V14m0 4h.01",
                tone: "question" as const,
              },
            ].map((card) => (
              <FadeIn key={card.label}>
                <div className={`rounded-2xl p-6 h-full ${
                  card.tone === "positive" ? "bg-white border border-gray-100"
                  : card.tone === "negative" ? "bg-red-50 border border-red-100"
                  : "bg-brand-navy"
                }`}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <svg className={`w-5 h-5 shrink-0 ${
                      card.tone === "positive" ? "text-brand-teal"
                      : card.tone === "negative" ? "text-red-500"
                      : "text-brand-gold"
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                    </svg>
                    <p className={`text-sm font-bold uppercase tracking-widest ${
                      card.tone === "question" ? "text-brand-gold"
                      : card.tone === "negative" ? "text-red-600"
                      : "text-brand-teal"
                    }`}>{card.label}</p>
                  </div>
                  <p className={`text-sm leading-relaxed ${card.tone === "question" ? "text-gray-200" : "text-brand-muted"}`}>
                    {card.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── PILOT DETAIL ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-[1fr_320px] gap-10">
            {/* Main content */}
            <div className="space-y-10">

              {/* Central intervention */}
              <FadeUp>
                <div className="bg-brand-navy rounded-2xl p-8">
                  <p className="text-base font-bold uppercase tracking-widest text-brand-gold mb-4">The Central Intervention</p>
                  <p className="text-gray-200 text-base leading-relaxed">
                    Improved cookstove distribution in three Malawian communities, accompanied by a{" "}
                    <span className="text-brand-gold font-semibold">Community Accountability Committee</span> with
                    an explicit equity mandate, a{" "}
                    <span className="text-brand-gold font-semibold">Women&apos;s Health Evidence System</span> that
                    puts adoption data in community hands, and a structured{" "}
                    <span className="text-brand-gold font-semibold">quarterly adaptive governance cycle</span>.
                    One intervention. One population. One implementation question.
                  </p>
                </div>
              </FadeUp>

              {/* Overview */}
              <FadeUp>
                <div>
                  <p className="text-base font-bold uppercase tracking-widest text-brand-muted mb-5">Pilot Overview</p>
                  <div className="space-y-4">
                    <p className="text-brand-muted text-base leading-relaxed">
                      Clean cooking programmes make an ideal ASIL case study precisely because the intervention is not
                      in question. The evidence base for improved cookstoves as a women&apos;s health intervention is
                      robust, well-replicated, and uncontested. The failure point is equally well-documented:
                      sustained adoption beyond the period of external support is low, consistently, across contexts.
                    </p>
                    <p className="text-brand-muted text-base leading-relaxed">
                      This means any failure in this pilot is a pure implementation and governance failure — not a
                      technology problem, not an evidence problem. The cookstove is a known-good instrument.
                      The question is whether a deliberately designed community governance architecture can overcome
                      the implementation failure that has frustrated the same instrument for decades.
                    </p>
                    <p className="text-brand-muted text-base leading-relaxed">
                      The pilot tests a specific governance design: a Community Accountability Committee with an
                      explicit equity mandate, a Women&apos;s Health Evidence System that puts adoption data in
                      community hands, and a structured quarterly adaptive governance cycle. If this architecture
                      sustains adoption where other programmes have not, it will constitute significant evidence
                      for the central ASIL hypothesis — that governance design is the binding constraint on
                      implementation success for known-good interventions.
                    </p>
                  </div>
                </div>
              </FadeUp>

              {/* Learning questions */}
              <FadeUp>
                <div>
                  <p className="text-base font-bold uppercase tracking-widest text-brand-muted mb-5">Key Learning Questions</p>
                  <div className="space-y-4">
                    {[
                      "Does a purposefully designed community accountability system sustain improved cookstove adoption beyond the sponsored project period — and through precisely what governance mechanisms?",
                      "What design features of the Community Accountability Committee — composition, equity mandate, evidence protocols, decision authority — most reliably produce a governance response when adoption stalls?",
                      "What role does a community-held Women's Health Evidence System play in sustaining adoption decisions and activating accountability responses at household level?",
                      "What does this case study reveal about the governance conditions required to make known-effective community health interventions durable — and what does it imply for how such interventions are designed and governed in other sectors?",
                    ].map((q, i) => (
                      <div key={i} className="flex items-start gap-4 bg-brand-light rounded-xl p-5 border border-gray-100">
                        <span className="text-brand-gold font-black text-lg shrink-0 leading-none mt-0.5">Q{i + 1}</span>
                        <p className="text-brand-muted text-sm leading-relaxed">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeUp>

              {/* Methodology */}
              <FadeUp>
                <div>
                  <p className="text-base font-bold uppercase tracking-widest text-brand-muted mb-5">Methodology</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { method: "Community governance design", detail: "Three purposively selected communities. Community Accountability Committee established with an explicit equity mandate and defined decision protocols before distribution commences." },
                      { method: "Women's Health Evidence System", detail: "Community-held adoption tracking system that makes household-level data visible and actionable for the Accountability Committee each quarter." },
                      { method: "Quarterly adaptive governance", detail: "Structured cycle: evidence review, committee deliberation, targeted follow-up, documented adaptation — at each site, each quarter." },
                      { method: "Adoption outcome tracking", detail: "Consistent use monitoring across targeted households, disaggregated by equity exposure burden and household composition." },
                      { method: "Adaptive management log", detail: "Documented decision log tracking all pilot adaptations, evidence triggers, and the governance responses they produced." },
                      { method: "Ethics clearance", detail: "Malawi National Bioethics Committee clearance required prior to field activities. Helsinki Declaration principles apply throughout." },
                    ].map((item) => (
                      <div key={item.method} className="bg-brand-light rounded-xl p-5 border border-gray-100">
                        <p className="font-bold text-brand-navy text-sm mb-2">{item.method}</p>
                        <p className="text-brand-muted text-xs leading-relaxed">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeUp>

            </div>

            {/* Sidebar */}
            <div className="space-y-5 md:sticky md:top-8 self-start">

              {/* Timeline */}
              <div className="bg-brand-light rounded-2xl p-6 border border-gray-100">
                <p className="text-base font-bold uppercase tracking-widest text-brand-muted mb-5">Pilot Timeline</p>
                <div className="space-y-4">
                  {[
                    { phase: "Phase 1 — Design", period: "June – August 2026", detail: "Concept note finalisation, ethics submission, community partner engagement, CAC design, site confirmation", active: true },
                    { phase: "Phase 2 — Implementation", period: "September 2026 – February 2027", detail: "Cookstove distribution, CAC establishment, WHES activation, quarterly governance cycles, adaptive management", active: false },
                    { phase: "Phase 3 — Evaluation", period: "March – May 2027", detail: "Adoption outcome analysis, governance system evaluation, Learning Report drafting", active: false },
                    { phase: "Publication", period: "Q2–Q3 2027", detail: "ASIL Learning Report 001 + Implementation Intelligence Brief 001", active: false },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${item.active ? "bg-brand-gold ring-2 ring-brand-gold/30" : "bg-gray-300"}`} />
                        {i < 3 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                      </div>
                      <div className="pb-4">
                        <p className="font-bold text-brand-navy text-xs">{item.phase}</p>
                        <p className={`text-xs font-medium mb-1 ${item.active ? "text-brand-gold" : "text-brand-muted"}`}>{item.period}</p>
                        <p className="text-brand-muted text-xs leading-snug">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Primary domains */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <p className="text-base font-bold uppercase tracking-widest text-brand-muted mb-4">Primary Domains</p>
                <div className="space-y-2">
                  {[
                    { label: "Health", color: "bg-red-100 text-red-700" },
                    { label: "Environmental Sustainability", color: "bg-teal-100 text-teal-700" },
                    { label: "Gender", color: "bg-purple-100 text-purple-700" },
                  ].map((d) => (
                    <span key={d.label} className={`inline-flex mr-2 text-xs font-bold px-3 py-1.5 rounded-full ${d.color}`}>
                      {d.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strategic significance */}
              <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-2xl p-6">
                <p className="text-base font-bold uppercase tracking-widest text-brand-gold mb-3">Strategic Significance</p>
                <p className="text-brand-navy text-sm leading-relaxed">
                  Because the intervention is known-good, the Learning Report&apos;s findings — whether positive
                  or negative — will constitute direct evidence on governance architecture as the binding constraint
                  on implementation success. That learning is applicable across every thematic area ASIL operates in.
                </p>
              </div>

              {/* CTA */}
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
      </section>

      {/* ── CROSS-THEMATIC SECTION ───────────────────────────────────────── */}
      <section className="py-20 px-6 bg-brand-light border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <p className="text-base font-bold uppercase tracking-widest text-brand-gold mb-4">Cross-Thematic Evidence</p>
            <h2 className="text-4xl font-bold text-brand-navy leading-tight mb-4 max-w-3xl">
              One implementation question. Three domains of evidence.
            </h2>
            <p className="text-brand-muted text-lg leading-relaxed max-w-2xl mb-4">
              The central ASIL question does not respect thematic boundaries. This case study generates
              implementation intelligence across all three ASIL domains simultaneously — not by design,
              but because implementation failure is inherently cross-cutting.
            </p>
            <p className="text-brand-muted text-base leading-relaxed max-w-2xl mb-14">
              Each domain asks a version of the same question through a different institutional lens.
              The Learning Report addresses each separately. The synthesis will be the most significant output.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                num: "01",
                domain: "Health",
                question: "Why does a known-effective women's health intervention fail to produce durable health outcomes?",
                mechanism: "The failure is not in the intervention — it is in the governance of adoption. The pilot tests whether a community accountability architecture with an explicit equity mandate can close the gap between a distributed product and a sustained health outcome.",
                learning: "Governance design as the binding constraint on community health intervention durability; equity-disaggregated adoption as a health outcome metric.",
              },
              {
                num: "02",
                domain: "Environmental Sustainability",
                question: "Why do household clean energy transitions fail to persist — and what governance architecture changes that?",
                mechanism: "Cookstove abandonment is a household energy governance failure. As clean energy finance accelerates into communities, the institutional conditions for sustained adoption become critical. This pilot generates direct evidence on what those conditions require.",
                learning: "Governance architecture for durable household energy transitions; institutional conditions for sustained low-carbon behaviour change.",
              },
              {
                num: "03",
                domain: "Gender",
                question: "What governance architecture is required to produce and sustain equitable outcomes for women specifically?",
                mechanism: "The Community Accountability Committee has an explicit equity mandate. The pilot tests whether a community-level governance structure with a women's equity mandate can operationalise that mandate in practice — not just commit to it.",
                learning: "Equity mandate design and operationalisation; community governance as a gender accountability mechanism; conditions under which gender equity commitments translate into durable implementation outcomes.",
              },
            ].map((item, i) => (
              <ScaleIn key={i} delay={i * 80}>
                <div className="bg-white border border-gray-100 rounded-2xl p-7 h-full flex flex-col gap-5">
                  <div>
                    <span className="text-xs font-bold text-gray-400 font-mono">{item.num}</span>
                    <h3 className="text-brand-navy font-bold text-base mt-1">{item.domain}</h3>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-gold mb-2">The Domain Question</p>
                    <p className="text-brand-navy text-sm font-semibold leading-snug italic">&ldquo;{item.question}&rdquo;</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2">What the Pilot Tests</p>
                    <p className="text-brand-muted text-sm leading-relaxed">{item.mechanism}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-teal mb-2">Learning Output</p>
                    <p className="text-brand-muted text-xs leading-relaxed">{item.learning}</p>
                  </div>
                </div>
              </ScaleIn>
            ))}
          </div>

          <FadeUp>
            <div className="mt-10 bg-brand-navy rounded-2xl p-8">
              <p className="text-base font-bold uppercase tracking-widest text-brand-gold mb-4">Why This Design Choice Matters</p>
              <p className="text-gray-200 text-base leading-relaxed max-w-3xl">
                By anchoring Pilot 001 in a case study where the intervention is already known to work,
                ASIL eliminates the most common confound in implementation research. If adoption fails,
                the failure cannot be attributed to the technology or the evidence base — it will be a
                pure implementation and governance failure. That is the design logic, and it is what
                makes the Learning Report applicable far beyond clean cooking.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-brand-navy text-white">
        <div className="max-w-5xl mx-auto">
          <SlideLeft>
            <div className="grid md:grid-cols-[1fr_auto] gap-12 items-start">
              <div>
                <p className="text-base font-bold uppercase tracking-widest text-brand-gold mb-4">Engage with this Pilot</p>
                <h2 className="text-3xl font-bold mb-5 leading-tight max-w-xl">
                  Pilot 001 is open to institutional partners, implementation collaborators, and academic co-investigators.
                </h2>
                <p className="text-gray-300 text-base leading-relaxed max-w-lg mb-8">
                  ASIL selects collaborators based on intellectual seriousness, institutional alignment, and genuine
                  commitment to evidence standards. All partners are advised that findings will be published as the
                  evidence shows them.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold px-7 py-3.5 rounded transition-colors text-sm"
                  >
                    Request a Briefing or Partnership Discussion
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/asil"
                    className="inline-flex items-center gap-2 border border-white/25 hover:border-white/50 text-white font-semibold px-7 py-3.5 rounded transition-colors text-sm"
                  >
                    About ASIL
                  </Link>
                </div>
              </div>
              <div className="space-y-4 min-w-[220px]">
                {[
                  { label: "Implementation collaborations", detail: "Embed ASIL in live programmes" },
                  { label: "Academic co-investigation", detail: "Joint design and co-authorship" },
                  { label: "Community partner access", detail: "Three sites across Malawi" },
                  { label: "Data sharing partnerships", detail: "Adoption and governance evidence" },
                ].map((item) => (
                  <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4">
                    <p className="text-white text-sm font-semibold">{item.label}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </SlideLeft>
        </div>
      </section>
    </>
  );
}
