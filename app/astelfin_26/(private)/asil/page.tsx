import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "ASIL Hub | Astelfin",
  robots: { index: false, follow: false },
};

const PHASE_LABELS: Record<string, string> = {
  DESIGN: "Design",
  IMPLEMENTATION: "Implementation",
  EVALUATION: "Evaluation",
  PUBLISHED: "Published",
};

const PHASE_COLORS: Record<string, string> = {
  DESIGN: "bg-blue-100 text-blue-700",
  IMPLEMENTATION: "bg-amber-100 text-amber-700",
  EVALUATION: "bg-purple-100 text-purple-700",
  PUBLISHED: "bg-green-100 text-green-700",
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

const TRANSFER_COLORS: Record<string, string> = {
  INTERNAL: "bg-gray-100 text-gray-600",
  TRANSFERRED: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-green-100 text-green-700",
};

const INTEL_LABELS: Record<string, string> = {
  ADVISORY_IMPLICATION: "Advisory Implication",
  METHODOLOGY_FINDING: "Methodology Finding",
  GOVERNANCE_PATTERN: "Governance Pattern",
  POLITICAL_ECONOMY: "Political Economy",
  IMPLEMENTATION_RISK: "Implementation Risk",
};

const CONFIDENCE_STYLES: Record<string, string> = {
  HIGH: "font-bold",
  MEDIUM: "font-medium",
  PROVISIONAL: "italic font-normal",
};

export default async function ASILHubPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const isCEO = session.user.role === "CEO";
  if (!isCEO) redirect("/astelfin_26/dashboard");

  const [pilots, recentIntel, pilotCounts, libCounts] = await Promise.all([
    prisma.pilotProfile.findMany({
      where: { archivedAt: null },
      include: { project: { select: { name: true, startDate: true, endDate: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.intelligenceEntry.findMany({
      where: { archivedAt: null },
      include: { pilot: { select: { pilotCode: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.pilotProfile.groupBy({
      by: ["phase"],
      where: { archivedAt: null },
      _count: { id: true },
    }),
    prisma.knowledgeProduct.groupBy({
      by: ["status"],
      where: { archivedAt: null },
      _count: { id: true },
    }),
  ]);

  const totalPilots = pilots.length;
  const activePilots = pilots.filter(p => p.phase === "DESIGN" || p.phase === "IMPLEMENTATION").length;
  const totalIntel = await prisma.intelligenceEntry.count({ where: { archivedAt: null } });
  const pendingTransfer = await prisma.intelligenceEntry.count({ where: { transferStatus: "INTERNAL", archivedAt: null } });

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-2.5 py-1 rounded-full">ASIL</span>
            <span className="text-xs text-gray-400">Astellic Social Impact Lab</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-navy">Implementation Lab Hub</h1>
          <p className="text-gray-500 text-sm mt-1">Active pilots, knowledge products, and implementation intelligence.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/astelfin_26/asil/library/new" className="text-sm font-semibold text-brand-gold hover:underline">
            + Publication
          </Link>
          <Link href="/astelfin_26/asil/pilots/new" className="bg-brand-navy hover:bg-brand-navy/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            + New Pilot
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Pilots", value: totalPilots, color: "text-brand-navy", href: "/astelfin_26/asil/pilots" },
          { label: "Active", value: activePilots, color: "text-amber-600", href: "/astelfin_26/asil/pilots" },
          { label: "Intelligence Entries", value: totalIntel, color: "text-brand-teal", href: "/astelfin_26/asil/library" },
          { label: "Pending Transfer", value: pendingTransfer, color: pendingTransfer > 0 ? "text-orange-600" : "text-gray-400", href: "/astelfin_26/asil/library" },
        ].map((s) => (
          <Link key={s.label} href={s.href}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-[1fr_360px] gap-6">
        {/* Pilots */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-brand-navy">Pilot Registry</h2>
            <Link href="/astelfin_26/asil/pilots" className="text-xs text-brand-gold font-semibold hover:underline">View all →</Link>
          </div>
          {pilots.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400 text-sm mb-3">No pilots registered yet.</p>
              <Link href="/astelfin_26/asil/pilots/new" className="inline-flex items-center gap-1 bg-brand-navy text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-brand-navy/90 transition-colors">
                Register Pilot 001 →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {pilots.map((pilot) => (
                <li key={pilot.id}>
                  <Link href={`/astelfin_26/asil/pilots/${pilot.id}`} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="shrink-0">
                      <span className="text-xs font-mono font-bold text-brand-gold">{pilot.pilotCode}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-brand-navy text-sm leading-snug line-clamp-1">{pilot.project.name}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${PHASE_COLORS[pilot.phase]}`}>{PHASE_LABELS[pilot.phase]}</span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${DOMAIN_COLORS[pilot.domain]}`}>{DOMAIN_LABELS[pilot.domain]}</span>
                        {pilot.implementationSites.length > 0 && (
                          <span className="text-[11px] text-gray-400">{pilot.implementationSites.join(" · ")}</span>
                        )}
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Intelligence Feed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-brand-navy">Intelligence Feed</h2>
            <Link href="/astelfin_26/asil/library" className="text-xs text-brand-gold font-semibold hover:underline">All entries →</Link>
          </div>
          {recentIntel.length === 0 ? (
            <p className="px-6 py-10 text-center text-gray-400 text-sm">No intelligence entries yet.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentIntel.map((entry) => (
                <li key={entry.id} className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${TRANSFER_COLORS[entry.transferStatus]}`}>
                      {entry.transferStatus.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-gray-400">{INTEL_LABELS[entry.type]}</span>
                    {entry.pilot && (
                      <span className="text-[10px] font-mono text-brand-gold">{entry.pilot.pilotCode}</span>
                    )}
                  </div>
                  <p className={`text-sm text-gray-700 leading-snug line-clamp-3 ${CONFIDENCE_STYLES[entry.confidence]}`}>
                    {entry.content}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
