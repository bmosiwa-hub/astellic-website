import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/finance-utils";
import { getEffectivePermissions } from "@/lib/permissions";

export const metadata = {
  title: "Opportunity Detail | Astelfin IMS",
  robots: { index: false, follow: false },
};

const PILLAR_LABELS: Record<string, string> = {
  EVIDENCE_GENERATION:      "Evidence Generation & Verification",
  POLICY_ADVISORY:          "Policy Development & Advisory",
  PROGRAMME_IMPLEMENTATION: "Programme Design & Implementation",
};

const THEMATIC_LABELS: Record<string, string> = {
  HEALTH_NUTRITION:        "Health & Nutrition Systems",
  GOVERNANCE_PUBLIC_SECTOR:"Governance & Public Sector Reform",
  HUMAN_DEVELOPMENT:       "Human Development & Social Systems",
  CLIMATE_AGRICULTURE:     "Climate, Agriculture & Sustainability",
};

const TYPE_LABELS: Record<string, string> = {
  CONSULTANCY:     "Consultancy",
  GRANT:           "Grant",
  STARTUP_FUNDING: "Startup Funding",
};

const FIT_COLORS: Record<string, string> = {
  HIGH:   "text-green-600 bg-green-50 border-green-200",
  MEDIUM: "text-yellow-700 bg-yellow-50 border-yellow-200",
  LOW:    "text-gray-500 bg-gray-50 border-gray-200",
};

const REC_COLORS: Record<string, string> = {
  PURSUE:  "bg-green-600 text-white",
  MONITOR: "bg-yellow-500 text-white",
  PASS:    "bg-gray-400 text-white",
};

// Server actions

async function acceptOpportunity(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id! }, select: { role: true, permissions: true } });
  const perms = getEffectivePermissions(user?.role ?? "", user?.permissions);
  if (!perms.tabs.bizdev) redirect("/astelfin_26/my");

  const id = formData.get("id") as string;
  const note = formData.get("note") as string | null;

  const discovered = await prisma.discoveredOpportunity.findUnique({
    where: { id },
    include: { analysis: true },
  });
  if (!discovered) redirect("/astelfin_26/intel");

  const opp = await prisma.opportunity.create({
    data: {
      name:           discovered.title ?? discovered.rawTitle,
      classification: discovered.opportunityType === "CONSULTANCY" ? "CONSULTANCY"
                    : discovered.opportunityType === "GRANT"        ? "ADVISORY"
                    : "IMPLEMENTATION",
      funder:       discovered.funder,
      thematicArea: (discovered.thematicTags as string[])[0] ?? null,
      deadline:     discovered.deadline,
      link:         discovered.rawUrl,
      notes:        [
        discovered.description,
        discovered.analysis?.rationale ? `AI Analysis: ${discovered.analysis.rationale}` : null,
        note,
      ].filter(Boolean).join("\n\n"),
      status:    "OPEN",
      createdBy: session.user.id!,
    },
  });

  await prisma.discoveredOpportunity.update({
    where: { id },
    data: { status: "ACCEPTED", linkedOpportunityId: opp.id },
  });

  await prisma.bidDecision.upsert({
    where: { discoveredOpId: id },
    create: { discoveredOpId: id, decision: "ACCEPTED", decidedBy: session.user.id!, note: note ?? null },
    update: { decision: "ACCEPTED", decidedBy: session.user.id!, note: note ?? null, decidedAt: new Date() },
  });

  redirect("/astelfin_26/bizdev?success=intel_accepted");
}

async function ignoreOpportunity(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const id = formData.get("id") as string;
  const note = formData.get("note") as string | null;

  await prisma.discoveredOpportunity.update({ where: { id }, data: { status: "IGNORED" } });
  await prisma.bidDecision.upsert({
    where: { discoveredOpId: id },
    create: { discoveredOpId: id, decision: "IGNORED", decidedBy: session.user.id!, note: note ?? null },
    update: { decision: "IGNORED", decidedBy: session.user.id!, note: note ?? null, decidedAt: new Date() },
  });

  redirect("/astelfin_26/intel");
}

export default async function IntelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id! }, select: { role: true, permissions: true } });
  const perms = getEffectivePermissions(user?.role ?? "", user?.permissions);
  if (!perms.tabs.bizdev) redirect("/astelfin_26/my");

  const { id } = await params;

  const opp = await prisma.discoveredOpportunity.findUnique({
    where: { id },
    include: {
      source:   { select: { name: true, url: true } },
      analysis: true,
      decision: { include: { decider: { select: { name: true } } } },
    },
  });

  if (!opp) redirect("/astelfin_26/intel");

  const analysis = opp.analysis;
  const isUrgent  = opp.deadline && opp.deadline <= new Date(Date.now() + 7 * 86400000);
  const isOverdue = opp.deadline && opp.deadline < new Date();

  const canDecide = opp.status !== "ACCEPTED" && opp.status !== "IGNORED";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/astelfin_26/intel" className="hover:text-brand-navy transition-colors">
          ← Intelligence Feed
        </Link>
        <span>/</span>
        <span className="text-brand-navy font-medium">Opportunity Detail</span>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {opp.opportunityType && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  opp.opportunityType === "CONSULTANCY" ? "bg-blue-100 text-blue-700" :
                  opp.opportunityType === "GRANT" ? "bg-emerald-100 text-emerald-700" :
                  "bg-purple-100 text-purple-700"
                }`}>
                  {TYPE_LABELS[opp.opportunityType]}
                </span>
              )}
              {opp.status === "ACCEPTED" && (
                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">✓ Accepted</span>
              )}
              {opp.status === "IGNORED" && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Ignored</span>
              )}
              {opp.status === "NEW" && (
                <span className="text-xs text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full animate-pulse">● New</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-brand-navy leading-snug">
              {opp.title ?? opp.rawTitle}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 flex-wrap">
              {opp.funder && <span className="font-medium text-gray-700">{opp.funder}</span>}
              <span>·</span>
              <span>{opp.source.name}</span>
              {opp.country && <><span>·</span><span>{opp.country}</span></>}
              {opp.deadline && (
                <><span>·</span>
                <span className={`font-medium ${isOverdue ? "text-red-600" : isUrgent ? "text-orange-500" : ""}`}>
                  Deadline: {formatDate(opp.deadline)}
                </span></>
              )}
              {opp.valueEstimate && <><span>·</span><span>{opp.valueEstimate}</span></>}
            </div>
          </div>

          {/* Priority widget */}
          {analysis && (
            <div className="shrink-0 text-center bg-brand-light rounded-xl px-4 py-3">
              <p className="text-3xl font-bold text-brand-navy">{analysis.priorityScore}</p>
              <p className="text-xs text-brand-muted">Priority / 10</p>
              <div className={`mt-2 text-xs font-bold px-2 py-0.5 rounded-full ${REC_COLORS[analysis.recommendation]}`}>
                {analysis.recommendation}
              </div>
            </div>
          )}
        </div>

        {/* External link */}
        <div className="mt-4 pt-4 border-t border-gray-50">
          <a href={opp.rawUrl} target="_blank" rel="noopener noreferrer"
            className="text-sm text-brand-gold hover:underline font-medium">
            View original posting ↗
          </a>
          <span className="text-xs text-gray-400 ml-3">{opp.source.name}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: description + tags */}
        <div className="md:col-span-2 space-y-5">

          {/* Description */}
          {opp.description && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
              <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide mb-3">Summary</h2>
              <p className="text-gray-700 text-sm leading-relaxed">{opp.description}</p>
            </div>
          )}

          {/* AI Analysis panel */}
          {analysis ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 space-y-4">
              <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide">AI Analysis</h2>

              {/* Scores row */}
              <div className="grid grid-cols-3 gap-3">
                <div className={`rounded-xl border px-4 py-3 text-center ${FIT_COLORS[analysis.strategicFit]}`}>
                  <p className="text-lg font-bold">{analysis.strategicFit}</p>
                  <p className="text-xs mt-0.5">Strategic Fit</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center">
                  <p className="text-lg font-bold text-brand-navy">{analysis.competitivenessScore}/10</p>
                  <p className="text-xs text-gray-500 mt-0.5">Competitiveness</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center">
                  <p className="text-lg font-bold text-brand-navy">{analysis.priorityScore}/10</p>
                  <p className="text-xs text-gray-500 mt-0.5">Priority Score</p>
                </div>
              </div>

              {/* Rationale */}
              {analysis.rationale && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Rationale</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{analysis.rationale}</p>
                </div>
              )}

              {/* Strengths & Risks */}
              <div className="grid sm:grid-cols-2 gap-4">
                {analysis.strengths.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">Strengths</p>
                    <ul className="space-y-1.5">
                      {(analysis.strengths as string[]).map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.risks.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">Risks</p>
                    <ul className="space-y-1.5">
                      {(analysis.risks as string[]).map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-red-400 mt-0.5 shrink-0">⚠</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-gray-400">
                Analysed by {analysis.modelVersion} · {formatDate(analysis.analysedAt)}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
              <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide mb-3">AI Analysis</h2>
              <p className="text-sm text-gray-500">AI analysis is still processing. Check back in a few moments.</p>
              <form action="/api/intel/analyse" method="POST" className="mt-3">
                <input type="hidden" name="id" value={opp.id} />
                <button type="submit"
                  className="text-sm font-semibold text-brand-gold hover:underline">
                  Re-trigger analysis →
                </button>
              </form>
            </div>
          )}

          {/* Tags */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide mb-3">Classification Tags</h2>
            {(opp.pillarTags as string[]).length === 0 && (opp.thematicTags as string[]).length === 0 ? (
              <p className="text-sm text-gray-400">No tags assigned.</p>
            ) : (
              <div className="space-y-3">
                {(opp.pillarTags as string[]).length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1.5">Pillars</p>
                    <div className="flex flex-wrap gap-2">
                      {(opp.pillarTags as string[]).map((t) => (
                        <span key={t} className="text-xs font-medium px-3 py-1 rounded-full bg-brand-navy/10 text-brand-navy border border-brand-navy/15">
                          {PILLAR_LABELS[t] ?? t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(opp.thematicTags as string[]).length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1.5">Thematic Domains</p>
                    <div className="flex flex-wrap gap-2">
                      {(opp.thematicTags as string[]).map((t) => (
                        <span key={t} className="text-xs font-medium px-3 py-1 rounded-full bg-brand-teal/10 text-brand-teal border border-brand-teal/15">
                          {THEMATIC_LABELS[t] ?? t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: decision panel */}
        <div className="space-y-4">

          {/* Decision card */}
          {canDecide && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5 space-y-4">
              <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide">Make a Decision</h2>

              <form action={acceptOpportunity} className="space-y-3">
                <input type="hidden" name="id" value={opp.id} />
                <textarea name="note" rows={3}
                  placeholder="Optional note..."
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 resize-none" />
                <button type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
                  ✓ Accept — Add to BD Pipeline
                </button>
              </form>

              <form action={ignoreOpportunity}>
                <input type="hidden" name="id" value={opp.id} />
                <button type="submit"
                  className="w-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-red-600 hover:border-red-200 text-sm font-medium py-2 rounded-lg transition-colors">
                  Ignore this opportunity
                </button>
              </form>
            </div>
          )}

          {/* Existing decision */}
          {opp.decision && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5">
              <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide mb-3">Decision</h2>
              <p className={`text-sm font-semibold ${opp.decision.decision === "ACCEPTED" ? "text-green-600" : "text-gray-500"}`}>
                {opp.decision.decision === "ACCEPTED" ? "✓ Accepted" : "Ignored"}
              </p>
              <p className="text-xs text-gray-400 mt-1">by {opp.decision.decider.name}</p>
              {opp.decision.note && (
                <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg px-3 py-2">{opp.decision.note}</p>
              )}
              {opp.linkedOpportunityId && (
                <Link href={`/astelfin_26/bizdev`}
                  className="block mt-3 text-sm font-semibold text-brand-gold hover:underline">
                  View in BD Pipeline →
                </Link>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5 text-xs text-gray-500 space-y-2">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide mb-3">Metadata</h2>
            <p><span className="font-semibold text-gray-700">Source:</span> {opp.source.name}</p>
            <p><span className="font-semibold text-gray-700">Discovered:</span> {formatDate(opp.createdAt)}</p>
            {opp.rawPublishedAt && (
              <p><span className="font-semibold text-gray-700">Published:</span> {formatDate(opp.rawPublishedAt)}</p>
            )}
            {opp.rawFunder && (
              <p><span className="font-semibold text-gray-700">Raw Funder:</span> {opp.rawFunder}</p>
            )}
            {opp.rawDeadline && (
              <p><span className="font-semibold text-gray-700">Raw Deadline:</span> {opp.rawDeadline}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
