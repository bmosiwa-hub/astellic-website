import { getStory, ACCENT_CLASSES } from "@/lib/stories";

// ─────────────────────────────────────────────────────────────────────────────
// Signature visual per story — deliberately different shapes so no two stories
// look the same. Built with HTML + Tailwind (brand tokens) for theme-consistency
// and responsiveness. Each receives the story's accent class set.
// ─────────────────────────────────────────────────────────────────────────────

type Accent = (typeof ACCENT_CLASSES)[keyof typeof ACCENT_CLASSES];

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg className={`w-5 h-5 shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
  );
}

/* 1 · SUPREME — research architecture: a vertical staged pipeline ending in a decision */
function ResearchArchitecture({ a }: { a: Accent }) {
  const stages = [
    "Research question",
    "Co-designed models of care",
    "Fieldwork across facilities & districts",
    "Implementation fidelity + costing",
    "Evidence: feasibility, scalability, cost",
  ];
  return (
    <div className="relative pl-8">
      <div className={`absolute left-[11px] top-2 bottom-10 w-0.5 ${a.bg} opacity-30`} />
      <div className="space-y-4">
        {stages.map((s, i) => (
          <div key={s} className="relative flex items-center gap-4">
            <span className={`absolute -left-8 w-6 h-6 rounded-full ${a.bg} text-white text-xs font-bold flex items-center justify-center`}>
              {i + 1}
            </span>
            <div className="bg-white border border-gray-100 rounded-lg px-4 py-2.5 shadow-sm text-sm font-medium text-brand-navy w-full">
              {s}
            </div>
          </div>
        ))}
        <div className="relative flex items-center gap-4 pt-2">
          <span className={`absolute -left-8 w-6 h-6 rounded-full border-2 ${a.border} bg-white`} />
          <div className={`${a.bg} text-white rounded-lg px-4 py-3 text-sm font-bold w-full`}>
            National scale-up decision
          </div>
        </div>
      </div>
    </div>
  );
}

/* 2 · Frontline AIDS — financing-intelligence constellation: 8 countries around a hub */
function FinancingConstellation({ a }: { a: Accent }) {
  const countries = ["Angola", "Côte d'Ivoire", "Kenya", "Malawi", "Mozambique", "Nigeria", "Uganda", "Zimbabwe"];
  const chain = ["Context", "Financing landscape", "Actors & incentives", "Policy windows", "Priorities", "Strategic action"];
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {countries.map((c) => (
          <div key={c} className="bg-white border border-gray-100 rounded-lg px-3 py-3 text-center shadow-sm">
            <span className={`block w-2 h-2 rounded-full ${a.dot} mx-auto mb-2`} />
            <span className="text-xs font-semibold text-brand-navy">{c}</span>
          </div>
        ))}
      </div>
      <div className={`${a.bg} text-white rounded-xl px-5 py-3 text-center text-sm font-bold mb-6`}>
        Health Financing Intelligence Hub
      </div>
      <div className="flex flex-wrap items-center gap-x-1 gap-y-2 justify-center">
        {chain.map((c, i) => (
          <div key={c} className="flex items-center gap-1">
            <span className="text-xs font-medium text-brand-navy bg-brand-light rounded-full px-3 py-1.5">{c}</span>
            {i < chain.length - 1 && <Arrow className={`${a.text} opacity-60`} />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* 3 · Evaluations — comparison strip: four cases, question → design → decision */
function ComparisonStrip({ a }: { a: Accent }) {
  const cases = [
    { q: "Did integrated AGYW services improve access?", d: "Baseline → endline + Scorecard", k: "Mangochi" },
    { q: "Is cervical-cancer screening reaching women?", d: "Midline: KIIs, FGDs, surveys", k: "Sondra Smalley" },
    { q: "What should the next youth strategy be?", d: "4-country theory-based, 32 KIIs", k: "Commuters for Health" },
    { q: "Do community health committees work?", d: "Governance + access review", k: "Zambia" },
  ];
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cases.map((c) => (
        <div key={c.k} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">The question</p>
            <p className="text-sm font-medium text-brand-navy leading-snug">{c.q}</p>
          </div>
          <div className="px-4 py-3 bg-brand-light flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">The design</p>
            <p className="text-sm text-brand-navy/80 leading-snug">{c.d}</p>
          </div>
          <div className={`px-4 py-2.5 ${a.bg}`}>
            <p className="text-xs font-semibold text-white">{c.k}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* 4 · Devolution — institutional architecture: tiers + an overlay rail of functions */
function DevolutionArchitecture({ a }: { a: Accent }) {
  const tiers = ["National", "Ministry of Health", "Local Government", "District (DHMT)", "Facility", "Community"];
  const overlays = ["Functions", "Financing", "Accountability", "Reporting", "HR", "Governance", "Coordination"];
  return (
    <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
      <div className="space-y-1.5">
        {tiers.map((t, i) => (
          <div key={t} className="flex items-center gap-3">
            <div
              className={`${a.bg} text-white rounded-md py-2.5 px-4 text-sm font-semibold`}
              style={{ width: `${100 - i * 9}%`, minWidth: "52%" }}
            >
              {t}
            </div>
            {i < tiers.length - 1 && <span className={`${a.text} text-xs`}>↓</span>}
          </div>
        ))}
      </div>
      <div className="bg-brand-light border border-gray-100 rounded-xl p-4 md:w-48">
        <p className="text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-3">Overlaid at every tier</p>
        <div className="flex flex-wrap gap-1.5">
          {overlays.map((o) => (
            <span key={o} className={`text-xs font-medium border ${a.border} ${a.text} rounded-full px-2.5 py-1 bg-white`}>
              {o}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* 5 · One Plan — convergence: many streams funnel into one plan */
function ConvergenceFunnel({ a }: { a: Accent }) {
  const streams = ["Global Fund", "Gavi", "World Bank", "Ministry priorities", "District priorities"];
  return (
    <div className="grid md:grid-cols-[1fr_auto_1fr] gap-5 items-center">
      <div className="space-y-2">
        {streams.map((s) => (
          <div key={s} className="bg-white border border-gray-100 rounded-lg px-4 py-2.5 text-sm font-medium text-brand-navy shadow-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-muted shrink-0" />
            {s}
          </div>
        ))}
      </div>
      <div className="flex md:flex-col items-center justify-center gap-2 py-4">
        <Arrow className={`${a.text} rotate-90 md:rotate-0`} />
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted text-center">Align</span>
        <Arrow className={`${a.text} rotate-90 md:rotate-0`} />
      </div>
      <div className={`${a.bg} text-white rounded-xl px-5 py-6 text-center`}>
        <p className="text-base font-bold leading-snug">One Plan.<br />One Budget.<br />One Report.</p>
      </div>
    </div>
  );
}

/* 6 · EIDM — numbered learning journey rail */
function JourneyRail({ a }: { a: Accent }) {
  const steps = [
    "Understand the role of evidence", "Find it", "Appraise it", "Frame the policy question",
    "Develop a brief", "Identify the policy window", "Engage decision-makers", "Institutionalise use",
  ];
  return (
    <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-3">
          <span className={`shrink-0 w-8 h-8 rounded-lg ${a.bg} text-white text-sm font-bold flex items-center justify-center`}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="text-sm font-medium text-brand-navy">{s}</span>
        </li>
      ))}
    </ol>
  );
}

/* 7 · FACT — delivery operating-system hub-and-ring */
function OperatingSystemHub({ a }: { a: Accent }) {
  const parts = ["People", "Planning", "Finance", "Procurement", "MEAL", "Safeguarding", "Reporting", "Stakeholders", "Adaptive mgmt"];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-center">
      <div className={`${a.bg} text-white rounded-2xl px-4 py-6 text-center col-span-2 sm:col-span-1 sm:row-span-2 flex flex-col justify-center`}>
        <p className="text-xs uppercase tracking-wider opacity-80 mb-1">The machine</p>
        <p className="text-lg font-bold leading-tight">Delivery</p>
      </div>
      {parts.map((p) => (
        <div key={p} className="bg-white border border-gray-100 rounded-lg px-3 py-3 text-center shadow-sm">
          <span className={`block w-1.5 h-1.5 rounded-full ${a.dot} mx-auto mb-1.5`} />
          <span className="text-xs font-semibold text-brand-navy leading-tight">{p}</span>
        </div>
      ))}
    </div>
  );
}

/* 8 · Health Center by Phone — ownership ladder, rising left→right */
function OwnershipLadder({ a }: { a: Accent }) {
  const rungs = ["Pilot", "Evidence", "Policy alignment", "Political ownership", "Institutional capacity", "Government stewardship", "Sustainability"];
  return (
    <div className="flex items-end gap-1.5 overflow-x-auto pb-2">
      {rungs.map((r, i) => (
        <div key={r} className="flex flex-col items-center shrink-0" style={{ width: `${100 / rungs.length}%`, minWidth: 92 }}>
          <span className="text-[11px] font-semibold text-brand-navy text-center mb-2 h-8 flex items-end leading-tight">{r}</span>
          <div
            className={`w-full rounded-t-md ${i === rungs.length - 1 ? a.bg : "bg-brand-navy"}`}
            style={{ height: 24 + i * 16, opacity: i === rungs.length - 1 ? 1 : 0.4 + i * 0.09 }}
          />
        </div>
      ))}
    </div>
  );
}

/* 9 · Community TB — human journey, a warm winding path of waypoints */
function HumanJourneyPath({ a }: { a: Accent }) {
  const steps = ["Community", "Trust", "Mobilisation", "Demand", "Screening", "Referral", "Treatment", "Follow-up"];
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-full pl-2 pr-4 py-1.5 shadow-sm">
            <span className={`w-6 h-6 rounded-full ${a.bg} text-white text-[11px] font-bold flex items-center justify-center`}>{i + 1}</span>
            <span className="text-sm font-medium text-brand-navy">{s}</span>
          </div>
          {i < steps.length - 1 && <span className={`${a.text} opacity-50`}>•</span>}
        </div>
      ))}
    </div>
  );
}

const VISUALS: Record<string, (p: { a: Accent }) => React.ReactNode> = {
  "supreme-lifelines": ResearchArchitecture,
  "frontline-aids-financing-intelligence": FinancingConstellation,
  "evaluation-as-a-decision-tool": ComparisonStrip,
  "malawi-health-devolution": DevolutionArchitecture,
  "one-plan-one-budget-one-report": ConvergenceFunnel,
  "evidence-informed-decision-making": JourneyRail,
  "fact-delivery-operating-system": OperatingSystemHub,
  "innovation-to-government-ownership": OwnershipLadder,
  "reaching-people-outside-the-clinic": HumanJourneyPath,
};

const CAPTIONS: Record<string, string> = {
  "supreme-lifelines": "The research journey — from question to a national scale-up decision.",
  "frontline-aids-financing-intelligence": "Eight countries feeding one living intelligence system.",
  "evaluation-as-a-decision-tool": "Four evaluations — each method chosen to fit the decision.",
  "malawi-health-devolution": "Who does what, at every tier — the devolution architecture.",
  "one-plan-one-budget-one-report": "Many funders and priorities, converging on one plan.",
  "evidence-informed-decision-making": "The journey from finding evidence to institutionalising its use.",
  "fact-delivery-operating-system": "The operating system behind simultaneous delivery.",
  "innovation-to-government-ownership": "From pilot to government stewardship — rung by rung.",
  "reaching-people-outside-the-clinic": "Meeting people in the community, all the way to follow-up.",
};

export default function StoryVisual({ slug }: { slug: string }) {
  const story = getStory(slug);
  const Visual = VISUALS[slug];
  if (!story || !Visual) return null;
  const a = ACCENT_CLASSES[story.accent];
  return (
    <section className="bg-brand-light border-y border-gray-100 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Visual a={a} />
        <p className="text-brand-muted text-sm italic mt-8 text-center">{CAPTIONS[slug]}</p>
      </div>
    </section>
  );
}
