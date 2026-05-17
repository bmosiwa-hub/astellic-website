import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Pilot Registry | ASIL",
  robots: { index: false, follow: false },
};

const PHASE_FLOW = ["DESIGN", "IMPLEMENTATION", "EVALUATION", "PUBLISHED"];

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
  NOT_REQUIRED: "Not required",
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

export default async function PilotRegistryPage({
  searchParams,
}: {
  searchParams: Promise<{ phase?: string; domain?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const { phase, domain } = await searchParams;

  const where: Record<string, unknown> = { archivedAt: null };
  if (phase) where.phase = phase;
  if (domain) where.domain = domain;

  const pilots = await prisma.pilotProfile.findMany({
    where,
    include: {
      project: { select: { name: true, startDate: true, endDate: true, description: true } },
      knowledgeProducts: { select: { id: true, status: true } },
      intelligenceEntries: { select: { id: true } },
      _count: { select: { knowledgeProducts: true, intelligenceEntries: true } },
    },
    orderBy: { pilotCode: "asc" },
  });

  function buildLink(extra: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { phase, domain, ...extra };
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v); });
    const qs = params.toString();
    return `/astelfin_26/asil/pilots${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/astelfin_26/asil" className="text-xs text-brand-gold hover:underline font-semibold">ASIL Hub</Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs text-gray-400">Pilot Registry</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-navy">Pilot Registry</h1>
          <p className="text-gray-500 text-sm mt-0.5">{pilots.length} pilot{pilots.length !== 1 ? "s" : ""} registered</p>
        </div>
        <Link href="/astelfin_26/asil/pilots/new" className="bg-brand-navy hover:bg-brand-navy/90 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          + Register Pilot
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex flex-wrap gap-4 items-center shadow-sm">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Phase:</span>
          {[{ v: undefined, l: "All" }, ...PHASE_FLOW.map(p => ({ v: p, l: PHASE_LABELS[p] }))].map(({ v, l }) => (
            <Link key={l} href={buildLink({ phase: v })}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                (phase ?? undefined) === v
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "border-gray-200 text-gray-600 hover:border-brand-navy hover:text-brand-navy"
              }`}>
              {l}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Domain:</span>
          {[{ v: undefined, l: "All" }, ...Object.entries(DOMAIN_LABELS).map(([v, l]) => ({ v, l: l.split(" ")[0] }))].map(({ v, l }) => (
            <Link key={l} href={buildLink({ domain: v })}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                (domain ?? undefined) === v
                  ? "bg-brand-teal text-white border-brand-teal"
                  : "border-gray-200 text-gray-600 hover:border-brand-teal hover:text-brand-teal"
              }`}>
              {l}
            </Link>
          ))}
        </div>
      </div>

      {/* Pilot list */}
      <div className="space-y-4">
        {pilots.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
            <p className="text-gray-400 text-sm mb-4">No pilots match these filters.</p>
            <Link href="/astelfin_26/asil/pilots/new" className="inline-flex items-center gap-1 text-brand-gold text-sm font-semibold hover:underline">
              Register the first pilot →
            </Link>
          </div>
        )}
        {pilots.map((pilot) => {
          const phaseIndex = PHASE_FLOW.indexOf(pilot.phase);
          return (
            <Link key={pilot.id} href={`/astelfin_26/asil/pilots/${pilot.id}`}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex items-start gap-5">
                  {/* Code + domain */}
                  <div className="shrink-0 text-center w-20">
                    <p className="text-brand-gold font-black text-sm font-mono">{pilot.pilotCode}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded mt-1 inline-block ${DOMAIN_COLORS[pilot.domain]}`}>
                      {pilot.domain.charAt(0) + pilot.domain.slice(1).toLowerCase()}
                    </span>
                  </div>
                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-brand-navy leading-snug">{pilot.project.name}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${PHASE_COLORS[pilot.phase]}`}>
                        {PHASE_LABELS[pilot.phase]}
                      </span>
                    </div>
                    {pilot.project.description && (
                      <p className="text-brand-muted text-sm line-clamp-2 mb-3">{pilot.project.description}</p>
                    )}
                    {/* Phase flow indicator */}
                    <div className="flex items-center gap-1 mb-3">
                      {PHASE_FLOW.map((p, i) => (
                        <div key={p} className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${i <= phaseIndex ? "bg-brand-gold" : "bg-gray-200"}`} />
                          <span className={`text-[10px] font-medium ${i === phaseIndex ? "text-brand-navy" : "text-gray-400"}`}>
                            {PHASE_LABELS[p]}
                          </span>
                          {i < PHASE_FLOW.length - 1 && <div className={`w-6 h-px ${i < phaseIndex ? "bg-brand-gold" : "bg-gray-200"}`} />}
                        </div>
                      ))}
                    </div>
                    {/* Meta row */}
                    <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                      {pilot.implementationSites.length > 0 && (
                        <span>{pilot.implementationSites.join(" · ")}</span>
                      )}
                      <span className={ETHICS_COLORS[pilot.ethicsClearance]}>
                        Ethics: {ETHICS_LABELS[pilot.ethicsClearance]}
                      </span>
                      <span>{pilot._count.knowledgeProducts} publication{pilot._count.knowledgeProducts !== 1 ? "s" : ""}</span>
                      <span>{pilot._count.intelligenceEntries} intelligence entr{pilot._count.intelligenceEntries !== 1 ? "ies" : "y"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
