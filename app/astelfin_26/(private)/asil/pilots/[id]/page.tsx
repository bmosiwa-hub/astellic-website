import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/finance-utils";
import {
  updatePilotPhase,
  addAdaptiveLogEntry,
  createIntelligenceEntry,
} from "@/lib/asil-actions";

export const metadata = {
  title: "Pilot Detail | ASIL",
  robots: { index: false, follow: false },
};

const PHASE_FLOW = ["DESIGN", "IMPLEMENTATION", "EVALUATION", "PUBLISHED"] as const;
type Phase = (typeof PHASE_FLOW)[number];

const PHASE_LABELS: Record<string, string> = {
  DESIGN: "Design",
  IMPLEMENTATION: "Implementation",
  EVALUATION: "Evaluation",
  PUBLISHED: "Published",
};

const PHASE_COLORS: Record<string, string> = {
  DESIGN: "bg-blue-100 text-blue-700 border-blue-200",
  IMPLEMENTATION: "bg-amber-100 text-amber-700 border-amber-200",
  EVALUATION: "bg-purple-100 text-purple-700 border-purple-200",
  PUBLISHED: "bg-green-100 text-green-700 border-green-200",
};

const DOMAIN_COLORS: Record<string, string> = {
  HEALTH: "bg-red-100 text-red-700",
  ENVIRONMENTAL_SUSTAINABILITY: "bg-teal-100 text-teal-700",
  GENDER: "bg-purple-100 text-purple-700",
};

const DOMAIN_LABELS: Record<string, string> = {
  HEALTH: "Health",
  ENVIRONMENTAL_SUSTAINABILITY: "Environmental Sustainability",
  GENDER: "Gender",
};

const ETHICS_LABELS: Record<string, string> = {
  NOT_REQUIRED: "Not Required",
  PENDING: "Pending",
  SUBMITTED: "Submitted",
  CLEARED: "Cleared",
};

const ETHICS_COLORS: Record<string, string> = {
  NOT_REQUIRED: "text-gray-400",
  PENDING: "text-orange-500",
  SUBMITTED: "text-blue-600",
  CLEARED: "text-green-600",
};

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  LEARNING_REPORT: "Learning Report",
  INTELLIGENCE_BRIEF: "Intelligence Brief",
  ANNUAL_REVIEW: "Annual Review",
  PRACTICE_NOTE: "Practice Note",
  WORKING_PAPER: "Working Paper",
};

const PRODUCT_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-gray-100 text-gray-400",
};

const INTEL_TYPE_LABELS: Record<string, string> = {
  ADVISORY_IMPLICATION: "Advisory Implication",
  METHODOLOGY_FINDING: "Methodology Finding",
  GOVERNANCE_PATTERN: "Governance Pattern",
  POLITICAL_ECONOMY: "Political Economy",
  IMPLEMENTATION_RISK: "Implementation Risk",
};

const INTEL_TYPE_COLORS: Record<string, string> = {
  ADVISORY_IMPLICATION: "bg-purple-100 text-purple-700",
  METHODOLOGY_FINDING: "bg-blue-100 text-blue-700",
  GOVERNANCE_PATTERN: "bg-indigo-100 text-indigo-700",
  POLITICAL_ECONOMY: "bg-amber-100 text-amber-700",
  IMPLEMENTATION_RISK: "bg-red-100 text-red-700",
};

const LOG_TYPE_LABELS: Record<string, string> = {
  OBSERVATION: "Observation",
  DECISION: "Decision",
  RISK: "Risk",
  LEARNING: "Learning",
  COURSE_CORRECTION: "Course Correction",
};

const LOG_TYPE_COLORS: Record<string, string> = {
  OBSERVATION: "bg-gray-100 text-gray-600",
  DECISION: "bg-brand-navy/10 text-brand-navy",
  RISK: "bg-red-100 text-red-700",
  LEARNING: "bg-green-100 text-green-700",
  COURSE_CORRECTION: "bg-amber-100 text-amber-700",
};

interface LogEntry {
  id: string;
  date: string;
  type: string;
  note: string;
  by: string;
}

export default async function PilotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const pilot = await prisma.pilotProfile.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          income:   { select: { amount: true, currency: true }, where: { deletedAt: null } },
          expenses: { select: { amount: true, currency: true }, where: { deletedAt: null } },
        },
      },
      knowledgeProducts: {
        where: { archivedAt: null },
        orderBy: { createdAt: "desc" },
      },
      intelligenceEntries: {
        where: { archivedAt: null },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!pilot) notFound();

  const totalIncome   = pilot.project.income.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = pilot.project.expenses.reduce((s, r) => s + r.amount, 0);
  const balance       = totalIncome - totalExpenses;

  const currentPhaseIdx = PHASE_FLOW.indexOf(pilot.phase as Phase);
  const nextPhase = currentPhaseIdx < PHASE_FLOW.length - 1 ? PHASE_FLOW[currentPhaseIdx + 1] : null;

  const logEntries: LogEntry[] = Array.isArray(pilot.adaptiveManagementLog)
    ? (pilot.adaptiveManagementLog as unknown as LogEntry[]).slice().reverse()
    : [];

  const advancePhaseAction = updatePilotPhase.bind(null, id);
  const addLogAction       = addAdaptiveLogEntry.bind(null, id);
  const addIntelAction     = createIntelligenceEntry;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex items-start gap-3">
        <Link href="/astelfin_26/asil/pilots"
          className="text-gray-400 hover:text-brand-navy mt-1 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-mono font-bold text-brand-gold">{pilot.pilotCode}</span>
            <span className="text-gray-200">·</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${PHASE_COLORS[pilot.phase]}`}>
              {PHASE_LABELS[pilot.phase]}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DOMAIN_COLORS[pilot.domain]}`}>
              {DOMAIN_LABELS[pilot.domain]}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-brand-navy">{pilot.project.name}</h1>
        </div>
        {nextPhase && (
          <form action={advancePhaseAction} className="shrink-0">
            <input type="hidden" name="phase" value={nextPhase} />
            <button
              type="submit"
              className="text-xs bg-brand-gold hover:bg-brand-gold/80 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Advance → {PHASE_LABELS[nextPhase]}
            </button>
          </form>
        )}
      </div>

      {/* Phase flow */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-4">
        <div className="flex items-center gap-2">
          {PHASE_FLOW.map((p, i) => {
            const done    = i < currentPhaseIdx;
            const current = i === currentPhaseIdx;
            return (
              <div key={p} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  current ? PHASE_COLORS[p] + " border" :
                  done    ? "bg-brand-gold/10 text-brand-gold" :
                             "bg-gray-100 text-gray-400"
                }`}>
                  {done && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {PHASE_LABELS[p]}
                </div>
                {i < PHASE_FLOW.length - 1 && (
                  <div className={`w-8 h-px ${done || current ? "bg-brand-gold" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Identity & Research Design */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Identity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-brand-navy text-sm uppercase tracking-wide">Identity</h2>
          {pilot.context && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1">Context</p>
              <p className="text-sm text-gray-700 leading-relaxed">{pilot.context}</p>
            </div>
          )}
          {pilot.theoryOfChange && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1">Theory of Change</p>
              <p className="text-sm text-gray-700 leading-relaxed italic">{pilot.theoryOfChange}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="font-bold text-gray-400 uppercase tracking-wide mb-0.5">Ethics</p>
              <p className={`font-semibold ${ETHICS_COLORS[pilot.ethicsClearance]}`}>
                {ETHICS_LABELS[pilot.ethicsClearance]}
              </p>
            </div>
            {pilot.implementationSites.length > 0 && (
              <div>
                <p className="font-bold text-gray-400 uppercase tracking-wide mb-0.5">Sites</p>
                <p className="text-gray-700">{pilot.implementationSites.join(", ")}</p>
              </div>
            )}
            {pilot.project.startDate && (
              <div>
                <p className="font-bold text-gray-400 uppercase tracking-wide mb-0.5">Start</p>
                <p className="text-gray-700">{formatDate(pilot.project.startDate)}</p>
              </div>
            )}
            {pilot.project.endDate && (
              <div>
                <p className="font-bold text-gray-400 uppercase tracking-wide mb-0.5">End</p>
                <p className="text-gray-700">{formatDate(pilot.project.endDate)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Learning Questions + Budget */}
        <div className="space-y-4">
          {pilot.learningQuestions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-brand-navy text-sm uppercase tracking-wide mb-3">Learning Questions</h2>
              <ol className="space-y-2">
                {pilot.learningQuestions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <span className="text-brand-gold font-bold text-xs shrink-0 mt-0.5">{i + 1}.</span>
                    {q}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {/* Budget summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-brand-navy text-sm uppercase tracking-wide mb-3">Budget</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Allocated", value: pilot.project.budget ? formatCurrency(pilot.project.budget, "MWK") : "—", color: "text-gray-700" },
                { label: "Income", value: formatCurrency(totalIncome, "MWK"), color: "text-green-600" },
                { label: "Expenses", value: formatCurrency(totalExpenses, "MWK"), color: "text-red-600" },
                { label: "Balance", value: formatCurrency(balance, "MWK"), color: balance >= 0 ? "text-brand-navy" : "text-red-600" },
              ].map((c) => (
                <div key={c.label}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{c.label}</p>
                  <p className={`text-sm font-bold ${c.color}`}>{c.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Adaptive Management Log */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-brand-navy">Adaptive Management Log</h2>
            <p className="text-xs text-gray-400 mt-0.5">Record decisions, observations, and course corrections as the pilot evolves.</p>
          </div>
          <span className="text-xs font-semibold text-gray-400">{logEntries.length} entr{logEntries.length !== 1 ? "ies" : "y"}</span>
        </div>

        {/* Add entry */}
        <form action={addLogAction} className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-start gap-3">
            <select
              name="type"
              className="border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-brand-navy shrink-0"
            >
              <option value="OBSERVATION">Observation</option>
              <option value="DECISION">Decision</option>
              <option value="LEARNING">Learning</option>
              <option value="RISK">Risk</option>
              <option value="COURSE_CORRECTION">Course Correction</option>
            </select>
            <input
              name="note"
              required
              placeholder="Add a log entry…"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy"
            />
            <button
              type="submit"
              className="shrink-0 bg-brand-navy hover:bg-brand-navy/90 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </form>

        {logEntries.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-400 text-sm">No log entries yet. Start recording observations and decisions.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {logEntries.map((entry) => (
              <li key={entry.id} className="px-6 py-4 flex items-start gap-3">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded shrink-0 mt-0.5 ${LOG_TYPE_COLORS[entry.type] ?? "bg-gray-100 text-gray-600"}`}>
                  {LOG_TYPE_LABELS[entry.type] ?? entry.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-relaxed">{entry.note}</p>
                  <p className="text-xs text-gray-400 mt-1">{entry.by} · {new Date(entry.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Knowledge Products */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-brand-navy">
            Knowledge Products ({pilot.knowledgeProducts.length})
          </h2>
          <Link
            href={`/astelfin_26/asil/library/new?pilotId=${id}`}
            className="text-xs text-brand-gold font-semibold hover:underline"
          >
            + New Publication
          </Link>
        </div>
        {pilot.knowledgeProducts.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-400 text-sm">
            No knowledge products yet.{" "}
            <Link href={`/astelfin_26/asil/library/new?pilotId=${id}`} className="text-brand-gold hover:underline">
              Create the first publication.
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {pilot.knowledgeProducts.map((kp) => (
              <li key={kp.id} className="px-6 py-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${PRODUCT_STATUS_COLORS[kp.status]}`}>
                      {kp.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-gray-400">{PRODUCT_TYPE_LABELS[kp.productType]}</span>
                    {kp.isPublicFacing && (
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Public</span>
                    )}
                  </div>
                  <p className="font-semibold text-brand-navy text-sm">{kp.title}</p>
                  {kp.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{kp.description}</p>}
                  {kp.keyLearnings.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5">
                      {kp.keyLearnings.slice(0, 2).map((l, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                          <span className="text-brand-gold shrink-0">·</span>{l}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Intelligence Entries */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-brand-navy">
            Intelligence Entries ({pilot.intelligenceEntries.length})
          </h2>
        </div>

        {/* Add intelligence entry */}
        <form action={addIntelAction} className="px-6 py-4 border-b border-gray-100 bg-gray-50/60 space-y-3">
          <input type="hidden" name="pilotId" value={id} />
          <input type="hidden" name="domain" value={pilot.domain} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
              <select
                name="type"
                className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-brand-navy"
              >
                <option value="ADVISORY_IMPLICATION">Advisory Implication</option>
                <option value="METHODOLOGY_FINDING">Methodology Finding</option>
                <option value="GOVERNANCE_PATTERN">Governance Pattern</option>
                <option value="POLITICAL_ECONOMY">Political Economy</option>
                <option value="IMPLEMENTATION_RISK">Implementation Risk</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Confidence</label>
              <select
                name="confidence"
                className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-brand-navy"
              >
                <option value="PROVISIONAL">Provisional</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <textarea
              name="content"
              required
              rows={2}
              placeholder="Record an intelligence finding from this pilot…"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy resize-none"
            />
            <button
              type="submit"
              className="shrink-0 bg-brand-navy hover:bg-brand-navy/90 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Record
            </button>
          </div>
        </form>

        {pilot.intelligenceEntries.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-400 text-sm">No intelligence entries yet.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {pilot.intelligenceEntries.map((entry) => (
              <li key={entry.id} className="px-6 py-4">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${INTEL_TYPE_COLORS[entry.type]}`}>
                    {INTEL_TYPE_LABELS[entry.type]}
                  </span>
                  <span className={`text-[10px] font-medium text-gray-500 ${
                    entry.confidence === "HIGH" ? "font-bold" :
                    entry.confidence === "PROVISIONAL" ? "italic" : ""
                  }`}>
                    {entry.confidence.charAt(0) + entry.confidence.slice(1).toLowerCase()} confidence
                  </span>
                  {entry.tags.map((t) => (
                    <span key={t} className="text-[10px] text-gray-400">#{t}</span>
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{entry.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Null Results / Notes */}
      {(pilot.nullResultsNote || pilot.advisoryImplications) && (
        <div className="grid md:grid-cols-2 gap-4">
          {pilot.nullResultsNote && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h3 className="font-bold text-amber-800 text-sm mb-2">Null Results &amp; Negative Findings</h3>
              <p className="text-sm text-amber-700 leading-relaxed">{pilot.nullResultsNote}</p>
            </div>
          )}
          {pilot.advisoryImplications && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
              <h3 className="font-bold text-purple-800 text-sm mb-2">Advisory Implications</h3>
              <p className="text-sm text-purple-700 leading-relaxed">{pilot.advisoryImplications}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
