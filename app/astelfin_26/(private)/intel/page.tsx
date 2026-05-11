import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/finance-utils";
import { getEffectivePermissions } from "@/lib/permissions";

export const metadata = {
  title: "Opportunity Intelligence | Astelfin IMS",
  robots: { index: false, follow: false },
};

const PILLAR_LABELS: Record<string, string> = {
  EVIDENCE_GENERATION:      "Evidence Generation",
  POLICY_ADVISORY:          "Policy Advisory",
  PROGRAMME_IMPLEMENTATION: "Programme Implementation",
};

const THEMATIC_LABELS: Record<string, string> = {
  HEALTH_NUTRITION:        "Health & Nutrition",
  GOVERNANCE_PUBLIC_SECTOR:"Governance",
  HUMAN_DEVELOPMENT:       "Human Development",
  CLIMATE_AGRICULTURE:     "Climate & Agriculture",
};

const TYPE_LABELS: Record<string, string> = {
  CONSULTANCY:     "Consultancy",
  GRANT:           "Grant",
  STARTUP_FUNDING: "Startup Funding",
};

const TYPE_COLORS: Record<string, string> = {
  CONSULTANCY:     "bg-blue-100 text-blue-700",
  GRANT:           "bg-emerald-100 text-emerald-700",
  STARTUP_FUNDING: "bg-purple-100 text-purple-700",
};

const FIT_COLORS: Record<string, string> = {
  HIGH:   "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW:    "bg-gray-100 text-gray-500",
};

const REC_COLORS: Record<string, string> = {
  PURSUE:  "bg-green-600 text-white",
  MONITOR: "bg-yellow-500 text-white",
  PASS:    "bg-gray-400 text-white",
};

const STATUS_ORDER = ["NEW", "REVIEWED", "ACCEPTED", "IGNORED", "DUPLICATE"];

// Server Actions

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

  // Create a BD Opportunity from this discovered item
  const opp = await prisma.opportunity.create({
    data: {
      name:           discovered.title ?? discovered.rawTitle,
      classification: discovered.opportunityType === "CONSULTANCY" ? "CONSULTANCY"
                    : discovered.opportunityType === "GRANT"        ? "ADVISORY"
                    : "IMPLEMENTATION",
      funder:       discovered.funder,
      thematicArea: discovered.thematicTags[0] ?? null,
      deadline:     discovered.deadline,
      link:         discovered.rawUrl,
      notes:        [
        discovered.description,
        discovered.analysis?.rationale ? `AI: ${discovered.analysis.rationale}` : null,
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

  await prisma.discoveredOpportunity.update({
    where: { id },
    data: { status: "IGNORED" },
  });

  await prisma.bidDecision.upsert({
    where: { discoveredOpId: id },
    create: { discoveredOpId: id, decision: "IGNORED", decidedBy: session.user.id!, note: note ?? null },
    update: { decision: "IGNORED", decidedBy: session.user.id!, note: note ?? null, decidedAt: new Date() },
  });

  redirect("/astelfin_26/intel");
}

// Page

export default async function IntelFeedPage({
  searchParams,
}: {
  searchParams: Promise<{
    pillar?: string;
    thematic?: string;
    type?: string;
    status?: string;
    rec?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id! }, select: { role: true, permissions: true } });
  const perms = getEffectivePermissions(user?.role ?? "", user?.permissions);
  if (!perms.tabs.bizdev) redirect("/astelfin_26/my");

  const { pillar, thematic, type, status, rec } = await searchParams;

  const where: Record<string, unknown> = {};
  if (pillar)   where.pillarTags   = { has: pillar };
  if (thematic) where.thematicTags = { has: thematic };
  if (type)     where.opportunityType = type;
  if (status)   where.status = status;
  else          where.status = { in: ["NEW", "REVIEWED"] }; // default: hide accepted/ignored
  if (rec)      where.analysis = { recommendation: rec };

  const opportunities = await prisma.discoveredOpportunity.findMany({
    where: where as any,
    orderBy: [
      { analysis: { priorityScore: "desc" } },
      { createdAt: "desc" },
    ],
    include: {
      source:   { select: { name: true } },
      analysis: true,
      decision: true,
    },
    take: 100,
  });

  const newCount = await prisma.discoveredOpportunity.count({ where: { status: "NEW" } });
  const reviewedCount = await prisma.discoveredOpportunity.count({ where: { status: "REVIEWED" } });
  const pursueCount = await prisma.discoveredOpportunity.count({ where: { analysis: { recommendation: "PURSUE" } }, });

  const isCEO = session.user.role === "CEO";

  function buildLink(extra: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { pillar, thematic, type, status, rec, ...extra };
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v); });
    const qs = params.toString();
    return `/astelfin_26/intel${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Opportunity Intelligence</h1>
          <p className="text-gray-500 text-sm mt-1">
            AI-discovered funding and consultancy opportunities for Malawi.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isCEO && (
            <Link href="/astelfin_26/intel/sources"
              className="text-sm font-semibold text-brand-muted hover:text-brand-navy transition-colors">
              Manage Sources →
            </Link>
          )}
          <Link href="/astelfin_26/intel?status=ACCEPTED"
            className="text-sm font-semibold text-brand-gold hover:underline">
            Accepted →
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Unreviewed", value: newCount, color: "text-orange-600" },
          { label: "AI-Reviewed", value: reviewedCount, color: "text-brand-navy" },
          { label: "Pursue Recommended", value: pursueCount, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 px-5 py-4 text-center shadow-sm">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex flex-wrap gap-3 items-center shadow-sm">
        {/* Status */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Status:</span>
          {[
            { v: undefined, l: "Active" },
            { v: "NEW", l: "Unreviewed" },
            { v: "REVIEWED", l: "AI-Reviewed" },
            { v: "ACCEPTED", l: "Accepted" },
            { v: "IGNORED", l: "Ignored" },
          ].map(({ v, l }) => (
            <Link key={l} href={buildLink({ status: v })}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                (status ?? undefined) === v
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "border-gray-200 text-gray-600 hover:border-brand-navy hover:text-brand-navy"
              }`}>
              {l}
            </Link>
          ))}
        </div>

        <div className="h-4 border-l border-gray-200" />

        {/* Recommendation */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">AI Rec:</span>
          {[{ v: undefined, l: "All" }, { v: "PURSUE", l: "Pursue" }, { v: "MONITOR", l: "Monitor" }, { v: "PASS", l: "Pass" }].map(({ v, l }) => (
            <Link key={l} href={buildLink({ rec: v })}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                (rec ?? undefined) === v
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "border-gray-200 text-gray-600 hover:border-brand-navy hover:text-brand-navy"
              }`}>
              {l}
            </Link>
          ))}
        </div>

        <div className="h-4 border-l border-gray-200" />

        {/* Type */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Type:</span>
          {[{ v: undefined, l: "All" }, ...Object.entries(TYPE_LABELS).map(([v, l]) => ({ v, l }))].map(({ v, l }) => (
            <Link key={l} href={buildLink({ type: v })}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                (type ?? undefined) === v
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "border-gray-200 text-gray-600 hover:border-brand-navy hover:text-brand-navy"
              }`}>
              {l}
            </Link>
          ))}
        </div>
      </div>

      {/* Pillar & Thematic filters */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide self-center mr-1">Pillar:</span>
        {[{ v: undefined, l: "All" }, ...Object.entries(PILLAR_LABELS).map(([v, l]) => ({ v, l }))].map(({ v, l }) => (
          <Link key={l} href={buildLink({ pillar: v })}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              (pillar ?? undefined) === v
                ? "bg-brand-navy text-white border-brand-navy"
                : "border-gray-200 text-gray-600 hover:border-brand-navy hover:text-brand-navy"
            }`}>
            {l}
          </Link>
        ))}
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide self-center mx-1">Domain:</span>
        {[{ v: undefined, l: "All" }, ...Object.entries(THEMATIC_LABELS).map(([v, l]) => ({ v, l }))].map(({ v, l }) => (
          <Link key={l} href={buildLink({ thematic: v })}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              (thematic ?? undefined) === v
                ? "bg-brand-teal text-white border-brand-teal"
                : "border-gray-200 text-gray-600 hover:border-brand-teal hover:text-brand-teal"
            }`}>
            {l}
          </Link>
        ))}
      </div>

      {/* Opportunities list */}
      <div className="space-y-3">
        {opportunities.length === 0 && (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
            No opportunities match these filters.
          </div>
        )}
        {opportunities.map((opp) => {
          const analysis = opp.analysis;
          const isUrgent = opp.deadline && opp.deadline <= new Date(Date.now() + 7 * 86400000);
          const isOverdue = opp.deadline && opp.deadline < new Date();

          return (
            <div key={opp.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <div className="flex items-start gap-4">
                {/* Priority score pill */}
                {analysis && (
                  <div className="shrink-0 flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-brand-light">
                    <span className="text-xs font-bold text-brand-navy leading-none">{analysis.priorityScore}</span>
                    <span className="text-[9px] text-brand-muted leading-none mt-0.5">/ 10</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/astelfin_26/intel/${opp.id}`}
                      className="font-semibold text-brand-navy hover:text-brand-gold transition-colors leading-snug line-clamp-2">
                      {opp.title ?? opp.rawTitle}
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      {opp.opportunityType && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[opp.opportunityType] ?? "bg-gray-100 text-gray-600"}`}>
                          {TYPE_LABELS[opp.opportunityType]}
                        </span>
                      )}
                      {analysis && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${REC_COLORS[analysis.recommendation] ?? ""}`}>
                          {analysis.recommendation}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-gray-500">
                    {opp.funder && <span className="font-medium text-gray-700">{opp.funder}</span>}
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-400">{opp.source.name}</span>
                    {opp.deadline && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className={`font-medium ${isOverdue ? "text-red-600" : isUrgent ? "text-orange-500" : "text-gray-600"}`}>
                          {isOverdue ? "⚠ Overdue · " : isUrgent ? "⚡ " : ""}
                          Deadline {formatDate(opp.deadline)}
                        </span>
                      </>
                    )}
                    {opp.valueEstimate && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span>{opp.valueEstimate}</span>
                      </>
                    )}
                  </div>

                  {/* Tags */}
                  {(opp.pillarTags.length > 0 || opp.thematicTags.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(opp.pillarTags as string[]).map((t) => (
                        <span key={t} className="text-[11px] font-medium px-2 py-0.5 rounded bg-brand-navy/8 text-brand-navy border border-brand-navy/10">
                          {PILLAR_LABELS[t] ?? t}
                        </span>
                      ))}
                      {(opp.thematicTags as string[]).map((t) => (
                        <span key={t} className="text-[11px] font-medium px-2 py-0.5 rounded bg-brand-teal/8 text-brand-teal border border-brand-teal/10">
                          {THEMATIC_LABELS[t] ?? t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* AI fit bar & rationale snippet */}
                  {analysis && (
                    <div className="mt-2 flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${FIT_COLORS[analysis.strategicFit]}`}>
                        {analysis.strategicFit} fit
                      </span>
                      {analysis.rationale && (
                        <p className="text-xs text-gray-500 line-clamp-1 flex-1">{analysis.rationale}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {opp.status !== "ACCEPTED" && opp.status !== "IGNORED" && (
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <form action={acceptOpportunity}>
                      <input type="hidden" name="id" value={opp.id} />
                      <button type="submit"
                        className="text-xs font-semibold text-green-600 hover:underline whitespace-nowrap">
                        Accept →
                      </button>
                    </form>
                    <form action={ignoreOpportunity}>
                      <input type="hidden" name="id" value={opp.id} />
                      <button type="submit"
                        className="text-xs font-semibold text-gray-400 hover:text-red-500 hover:underline">
                        Ignore
                      </button>
                    </form>
                    <Link href={`/astelfin_26/intel/${opp.id}`}
                      className="text-xs text-brand-muted hover:text-brand-navy">
                      Details
                    </Link>
                  </div>
                )}

                {opp.status === "ACCEPTED" && (
                  <div className="shrink-0">
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      ✓ Accepted
                    </span>
                  </div>
                )}

                {opp.status === "IGNORED" && (
                  <div className="shrink-0">
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                      Ignored
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
