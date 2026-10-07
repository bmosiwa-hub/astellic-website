import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, FadeUp } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Results-Based Political Economy Analysis | Astellic Perspectives No. 01",
  description:
    "Astellic Perspectives No. 01 — Results-Based Political Economy Analysis (RB-PEA): from understanding power to navigating power for results. By Dr. Benjamin Azariah Mosiwa.",
};

const PDF = "/documents/Astellic_Perspectives_01_RB-PEA.pdf";

function Section({
  n,
  kicker,
  title,
  children,
}: {
  n: string;
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-12 border-t border-gray-100">
      <div className="max-w-3xl mx-auto px-6">
        <FadeUp>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-brand-gold font-bold text-sm tabular-nums">{n}</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-muted">{kicker}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-brand-navy leading-snug mb-6">{title}</h2>
        </FadeUp>
        <div className="space-y-5 text-brand-navy/90 text-[17px] leading-relaxed">{children}</div>
      </div>
    </section>
  );
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-l-4 border-brand-gold pl-5 py-1 text-xl font-semibold text-brand-navy leading-snug my-6">
      {children}
    </p>
  );
}

const GATES = [
  {
    g: "G1",
    name: "Authorise",
    step: "Inputs → activities",
    q: "Is there a mandate, and the money, to act?",
    conds: ["A clear legal or administrative mandate", "Budget actually released", "Senior sign-off secured", "Staff authorised to deploy"],
  },
  {
    g: "G2",
    name: "Deliver",
    step: "Activities → outputs",
    q: "Will institutions cooperate to deliver?",
    conds: ["Institutional cooperation", "Resources reach the front line", "Administrative authority", "Leadership support holds"],
  },
  {
    g: "G3",
    name: "Adopt",
    step: "Outputs → outcomes",
    q: "Will anyone behave differently because of it?",
    conds: ["Uptake by officials and users", "Political ownership", "Behaviour change", "Incentives aligned with the result"],
  },
  {
    g: "G4",
    name: "Sustain",
    step: "Outcomes → impact",
    q: "Will it survive the next budget, election or reshuffle?",
    conds: ["Institutionalisation", "Policy continuity", "Sustained coalition support", "Domestic financing beyond the project"],
  },
];

const CYCLE = [
  { n: "01", t: "Define the result", d: "Specify the outcome, policy change or delivery result precisely enough to reveal what it requires politically." },
  { n: "02", t: "Diagnose the political economy", d: "Analyse the actors, interests, incentives, institutions, power and informal norms that bear on that result." },
  { n: "03", t: "Map the political results pathway", d: "Trace the causal pathway and make the political and institutional assumptions it depends on explicit." },
  { n: "04", t: "Identify feasible entry points", d: "Find realistic openings: influence, coalition-building, institutional change or redesign of the intervention." },
  { n: "05", t: "Monitor and adapt", d: "Track political signals alongside results data; revise the analysis, strategy or result as conditions shift." },
];

const ROLES = [
  { t: "Enable", d: "Create the conditions for progress: authority, budget, permission.", q: "Which gate can they open?" },
  { t: "Block", d: "Veto, delay or quietly undermine progress, formally or informally.", q: "What would change their calculation?" },
  { t: "Influence", d: "Shape decisions or behaviour indirectly — through ideas, networks or voice.", q: "Whose decision do they move?" },
  { t: "Broker", d: "Connect competing interests and make a deal possible between them.", q: "Who trusts them on both sides?" },
  { t: "Legitimise", d: "Lend political, institutional or social legitimacy to the change.", q: "Whose endorsement makes it stick?" },
  { t: "Implement", d: "Convert decisions into action. Often the least consulted, most decisive.", q: "What do they need to act?" },
];

export default function RbPeaPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy text-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeUp>
            <Link href="/insights" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
              ← Insights
            </Link>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs font-bold uppercase tracking-widest text-white bg-white/10 px-2.5 py-1 rounded">
                Astellic Perspectives · No. 01
              </span>
              <span className="text-xs text-gray-400">October 2026</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-[1.1] mb-4">Results-Based Political Economy Analysis</h1>
            <p className="text-brand-gold text-lg md:text-xl font-semibold mb-5">
              From understanding power to navigating power for results.
            </p>
            <p className="text-gray-300 mb-8">Dr. Benjamin Azariah Mosiwa</p>
            <a
              href={PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-3 rounded font-semibold text-sm transition-colors"
            >
              Download the brief (PDF)
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </a>
          </FadeUp>
        </div>
      </section>

      <article className="bg-white">
        {/* Lead */}
        <div className="max-w-3xl mx-auto px-6 py-12">
          <FadeUp>
            <p className="text-xl md:text-2xl text-brand-navy font-medium leading-relaxed">
              Political economy analysis is now standard practice. We map the actors, chart the interests and name
              the constraints &mdash; then too often file the report while the results framework is built elsewhere,
              on political assumptions the analysis never tested. RB-PEA closes that gap by making a specific
              <span className="text-brand-gold"> result</span> the unit of analysis.
            </p>
          </FadeUp>
        </div>

        <Section n="01" kicker="The problem" title="We understand the political economy. But do we understand what it means for results?">
          <p>
            Programmes commission political economy analysis at inception, map the system and name the constraints.
            The report is then filed, while the results framework is built elsewhere &mdash; on political assumptions the
            analysis never tested.
          </p>
          <PullQuote>The gap is rarely the quality of the analysis. It is the unit of analysis.</PullQuote>
          <p>
            When the political system is the starting point, results enter late, as a list of implications. When the
            result is the starting point, every piece of political analysis has to earn its place by explaining what
            helps or hinders that result. A PEA should tell you what to do, not only what is happening.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-brand-light rounded-xl p-5 border border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2">Conventional PEA</p>
              <p className="text-sm text-brand-navy/80">Starts with the political system: context → actors → interests → power → analysis → recommendations. <span className="italic">Results? The link is often implicit.</span></p>
            </div>
            <div className="bg-brand-navy rounded-xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-gold/80 mb-2">Results-Based PEA</p>
              <p className="text-sm text-white/90">Starts with the result it must serve: desired result → pathway → political conditions required → power and incentives that bear on it → feasible entry points → strategic action → results → learning.</p>
            </div>
          </div>
        </Section>

        <Section n="02" kicker="The central idea" title="Start with the result, not the political system.">
          <p>
            RB-PEA inverts the usual sequence. Instead of describing the whole political landscape and then asking what
            it implies, it fixes a specific result and works backwards through the politics that will decide whether it
            happens.
          </p>
          <div className="space-y-3 pt-2">
            {[
              { h: "Results logic", q: "What specific change are we trying to achieve? What must happen for it to occur?" },
              { h: "Political diagnosis", q: "What political and institutional conditions are required? Who can enable or block them? Which incentives and power dynamics matter most?" },
              { h: "Decision", q: "What is politically feasible, here and now — and what should we do?" },
              { h: "Adaptation", q: "Are the political conditions changing? If so, revise the strategy, the pathway or the result." },
            ].map((x) => (
              <div key={x.h} className="flex gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-gold w-36 shrink-0 pt-1">{x.h}</span>
                <p className="text-brand-navy/85 text-base">{x.q}</p>
              </div>
            ))}
          </div>
          <p className="pt-2">
            Fixing the result makes the analysis <strong>selective</strong> (it studies the politics that matter for this
            change), <strong>testable</strong> (its political assumptions can be monitored) and <strong>actionable</strong>{" "}
            (its findings convert into entry points).
          </p>
        </Section>

        <Section n="03" kicker="Definition" title="Power matters because it changes what is possible.">
          <div className="bg-brand-light border border-gray-100 rounded-xl p-6">
            <p className="text-brand-navy font-medium">
              Results-Based Political Economy Analysis (RB-PEA) is a problem- and results-oriented approach to political
              economy analysis that examines how power, interests, institutions, incentives and informal norms shape the
              feasibility and achievement of specific development results.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            {[
              { n: "1", t: "Results", d: "What specific change are we trying to achieve, for whom, and by when?" },
              { n: "2", t: "Political economy", d: "Which power, interests, institutions, incentives and norms shape that change?" },
              { n: "3", t: "Feasibility", d: "Which pathways are politically and institutionally realistic, and which are not?" },
              { n: "4", t: "Adaptation", d: "How does the political context shift as implementation unfolds, and what do we change?" },
            ].map((d) => (
              <div key={d.t} className="border border-gray-100 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-brand-navy text-white text-[11px] font-bold flex items-center justify-center">{d.n}</span>
                  <p className="font-bold text-brand-navy">{d.t}</p>
                </div>
                <p className="text-sm text-brand-muted">{d.d}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-brand-muted pt-1">
            <strong>Three guard rails.</strong> Not PEA plus a logframe (the result reorganises the analysis, it does not
            sit beside it). Not a narrowing of politics (a wide-lens check keeps structural factors in view). Not
            politically neutral (choosing a result is itself political &mdash; RB-PEA always asks: <em>whose result?</em>).
          </p>
        </Section>

        <Section n="04" kicker="The framework · Astellic signature" title="The RB-PEA Cycle">
          <p>Five stages, organised around one result and repeated for as long as the programme runs.</p>
          <p className="text-sm font-semibold text-brand-gold tracking-wide">
            RESULT → DIAGNOSE → PATHWAY → ACT → MONITOR → ADAPT → RESULT
          </p>
          <div className="space-y-3 pt-1">
            {CYCLE.map((s) => (
              <div key={s.n} className="flex gap-4 bg-brand-light rounded-xl p-4 border border-gray-100">
                <span className="shrink-0 w-9 h-9 rounded-lg bg-brand-navy text-white text-sm font-bold flex items-center justify-center">{s.n}</span>
                <div>
                  <p className="font-bold text-brand-navy">{s.t}</p>
                  <p className="text-sm text-brand-muted">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section n="05" kicker="The pathway · Astellic signature tool" title="The Political Results Pathway">
          <p>
            Political assumptions are often the missing link in results frameworks. RB-PEA makes them visible as four
            gates every result must pass through, along the chain from inputs to impact.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-[11px] font-bold uppercase tracking-wider text-brand-muted py-2">
            {["Inputs", "Activities", "Outputs", "Outcomes", "Impact"].map((s, i) => (
              <span key={s} className="flex items-center gap-1">
                {s}{i < 4 && <span className="text-brand-gold">›</span>}
              </span>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {GATES.map((g) => (
              <div key={g.g} className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="bg-brand-navy text-white px-5 py-3 flex items-baseline gap-2">
                  <span className="text-brand-gold font-bold">{g.g}</span>
                  <span className="font-bold">{g.name}</span>
                  <span className="text-[11px] text-gray-400 ml-auto">{g.step}</span>
                </div>
                <div className="p-5">
                  <p className="font-semibold text-brand-navy mb-3">{g.q}</p>
                  <ul className="space-y-1.5">
                    {g.conds.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-sm text-brand-muted">
                        <span className="text-brand-gold mt-1.5 w-1 h-1 rounded-full bg-brand-gold shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <PullQuote>The weakest gate, not the weakest activity, is usually where results fail.</PullQuote>
          <p className="text-sm text-brand-muted">
            <strong>How to use it.</strong> Write each gate condition as a testable assumption, rate how confident you are
            it holds, and name who controls it.
          </p>
        </Section>

        <Section n="06" kicker="Feasibility · Astellic signature tool" title="The Political Feasibility Matrix">
          <p>
            Conventional analysis tends to sort options. RB-PEA asks how a high-merit option could move from stranded to
            achievable &mdash; through a new coalition, a different sequence, a policy window, or a redesign that lowers what it
            asks of powerful actors. The most valuable move is often the arrow, not the box.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            {[
              { t: "Build the conditions", d: "High merit, low feasibility. Technically attractive, politically stranded. Invest in coalitions, sequencing and timing.", tone: "bg-white border-brand-gold/40" },
              { t: "Pursue now", d: "High merit, high feasibility. Moves the result and can be done. Protect it and scale.", tone: "bg-brand-navy text-white" },
              { t: "Drop or redesign", d: "Low merit, low feasibility. Neither effective nor achievable. Free up the effort.", tone: "bg-white border-gray-200" },
              { t: "Handle with care", d: "Low merit, high feasibility. Politically easy, technically weak. Useful for trust, rarely for results.", tone: "bg-white border-gray-200" },
            ].map((b) => (
              <div key={b.t} className={`rounded-xl p-5 border ${b.tone}`}>
                <p className={`font-bold mb-1 ${b.tone.includes("brand-navy") ? "text-brand-gold" : "text-brand-navy"}`}>{b.t}</p>
                <p className={`text-sm ${b.tone.includes("brand-navy") ? "text-white/85" : "text-brand-muted"}`}>{b.d}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-brand-muted text-center">
            Vertical axis: technical merit (how much it moves the result). Horizontal axis: political &amp; institutional feasibility.
          </p>
          <p className="text-sm text-brand-muted">
            A politically easy option that will not move the result is not a quick win &mdash; it is a cost.
          </p>
        </Section>

        <Section n="07" kicker="Actors" title="From actors to entry points: what can each actor do to the result?">
          <p>
            Instead of sorting actors as supporters, opponents, influencers or beneficiaries, results-oriented stakeholder
            analysis asks what each can <em>do</em> to the result &mdash; and maps those roles against the gates, not as fixed
            labels on actors. The same ministry can enable at one gate and block at another.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ROLES.map((r) => (
              <div key={r.t} className="border border-gray-100 rounded-xl p-4">
                <p className="font-bold text-brand-navy mb-1">{r.t}</p>
                <p className="text-sm text-brand-muted mb-2">{r.d}</p>
                <p className="text-xs text-brand-gold font-semibold">{r.q}</p>
              </div>
            ))}
          </div>
          <div className="bg-brand-light rounded-xl p-5 border border-gray-100 text-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2">Trace each actor to the result <span className="font-normal normal-case">(illustrative)</span></p>
            <p className="text-brand-navy/85">
              A district finance officer <span className="text-brand-muted">judged on staying within cash ceilings</span> →
              releases devolved funds late in the quarter → <strong>Gate G2 weakens: services start late.</strong>
            </p>
          </div>
        </Section>

        <Section n="08" kicker="Adaptation" title="A living diagnostic, not an inception report.">
          <p>
            Politics moves faster than programme cycles. RB-PEA runs two tracks side by side &mdash; a results track and a
            political-economy track &mdash; so a shift in political conditions is noticed before it shows up as a missed target.
          </p>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-3">Political-economy signals to watch</p>
            <div className="flex flex-wrap gap-2">
              {["Leadership changes", "Institutional mandate changes", "Emerging coalitions", "Shifts in resource allocation", "New veto players", "Policy shifts", "Changing donor priorities", "Bureaucratic resistance", "Shifts in stakeholder support", "Implementation bottlenecks"].map((s) => (
                <span key={s} className="text-xs text-brand-navy bg-brand-light border border-gray-100 px-3 py-1.5 rounded-full">{s}</span>
              ))}
            </div>
          </div>
          <p>
            <strong>From signal to decision:</strong> detect (a signal is logged with its source) → assess (which gate, which
            assumption, how serious?) → decide: persist, pivot the pathway, adjust tactics, or revisit the result. RB-PEA
            treats political economy as part of results management, not simply as background context.
          </p>
        </Section>

        <Section n="09" kicker="Application · Illustrative, hypothetical" title="Making decentralised primary healthcare work">
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            {[
              { k: "Desired result", v: "District councils plan, fund and manage the primary healthcare functions transferred to them." },
              { k: "Political bottleneck", v: "Functions are devolved on paper, but budgets and staff postings remain controlled centrally. The pathway stalls at G1 and G2." },
              { k: "Relevant actors", v: "Central finance and HR units (block), district executives (implement), the local-government ministry (broker), councillors (legitimise)." },
              { k: "Interests & incentives", v: "Central units keep discretion over funds; districts fear accountability without resources; councillors are rewarded for visible projects, not recurrent services." },
              { k: "Critical assumption", v: "Fiscal transfers follow functions within the same financial year — untested in the original design." },
              { k: "Feasible entry point", v: "The annual budget cycle: a ring-fenced primary-healthcare grant that districts manage, with light reporting that lets the centre keep oversight." },
              { k: "Strategic response", v: "Broker a joint central–local working group, pilot in a few districts, and publish quarterly data on transfer timeliness." },
              { k: "Expected result", v: "Funds reach district budgets on time — timeliness tracked as both a results indicator and a political signal." },
            ].map((row, i) => (
              <div key={row.k} className={`grid sm:grid-cols-[180px_1fr] gap-x-4 px-5 py-3 ${i % 2 ? "bg-brand-light" : "bg-white"}`}>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-muted pt-0.5">{row.k}</p>
                <p className="text-sm text-brand-navy/85">{row.v}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-brand-muted italic">Illustrative and hypothetical — not real data. What the analysis delivers is a diagnosis: which gate is failing, whose incentives explain it, and what is worth trying first.</p>
        </Section>

        <Section n="10" kicker="Why it matters" title="From analysis to action.">
          <div className="grid sm:grid-cols-2 gap-3">
            {["Makes PEA more decision-useful", "Connects political analysis to measurable results", "Makes political assumptions explicit and testable", "Sharpens the search for feasible strategies", "Enables adaptation as political conditions change"].map((p, i) => (
              <div key={p} className="flex gap-3 border border-gray-100 rounded-xl p-4">
                <span className="text-brand-gold font-bold tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-sm text-brand-navy/85">{p}</p>
              </div>
            ))}
          </div>
          <div className="pt-2">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-3">The RB-PEA toolkit — four tools, usable alone or together</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { t: "Political Results Pathway", d: "Four gates that expose political assumptions." },
                { t: "Political Feasibility Matrix", d: "Merit against feasibility, and how to move options." },
                { t: "Results-Oriented Stakeholder Map", d: "Six roles, mapped against gates." },
                { t: "Political Economy Signals Log", d: "Signals linked to gates and decisions." },
              ].map((x) => (
                <div key={x.t} className="bg-brand-light border border-gray-100 rounded-xl p-4">
                  <p className="font-bold text-brand-navy text-sm mb-1">{x.t}</p>
                  <p className="text-xs text-brand-muted">{x.d}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section n="11" kicker="An invitation" title="Given the political economy, what can realistically be achieved — and how?">
          <p>
            The question is no longer simply &ldquo;What is the political economy?&rdquo; It is: given the political economy, what
            can realistically be achieved, and how? Astellic is interested in working with governments, development
            partners, funders and implementing organisations to apply and further develop results-based political economy
            approaches to complex development challenges.
          </p>
          <p className="text-sm text-brand-muted">
            RB-PEA claims no new discipline. Its contribution is the integration, sequencing and application of established
            traditions &mdash; political economy analysis, problem-driven PEA, thinking and working politically, PDIA, adaptive
            management, theory of change, results-based management, implementation science and institutional analysis &mdash;
            organised around a specific result.
          </p>
        </Section>

        {/* Download CTA */}
        <div className="max-w-3xl mx-auto px-6 py-14 text-center border-t border-gray-100">
          <FadeUp>
            <h2 className="text-2xl font-bold text-brand-navy mb-3">Read the full Perspective</h2>
            <p className="text-brand-muted mb-6">The complete brief includes the full frameworks, the feasibility matrix and sources.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={PDF} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white px-7 py-3.5 rounded font-semibold text-sm transition-colors">
                Download the brief (PDF)
              </a>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 border border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white px-7 py-3.5 rounded font-semibold text-sm transition-colors">
                Discuss applying RB-PEA
              </Link>
            </div>
          </FadeUp>
        </div>
      </article>
    </>
  );
}
