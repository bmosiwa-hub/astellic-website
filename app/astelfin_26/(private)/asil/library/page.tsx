import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Knowledge Library | ASIL",
  robots: { index: false, follow: false },
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

const TYPES   = ["LEARNING_REPORT", "INTELLIGENCE_BRIEF", "ANNUAL_REVIEW", "PRACTICE_NOTE", "WORKING_PAPER"];
const STATUSES = ["DRAFT", "UNDER_REVIEW", "PUBLISHED", "ARCHIVED"];
const DOMAINS  = ["HEALTH", "ENVIRONMENTAL_SUSTAINABILITY", "GENDER"];

export default async function KnowledgeLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; domain?: string; public?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const sp = await searchParams;

  const where: Record<string, unknown> = { archivedAt: null };
  if (sp.type)   where.productType = sp.type;
  if (sp.status) where.status      = sp.status;
  if (sp.domain) where.domain      = sp.domain;
  if (sp.public === "1") where.isPublicFacing = true;

  const products = await prisma.knowledgeProduct.findMany({
    where,
    include: { pilot: { select: { pilotCode: true, id: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Counts for overview
  const [statusCounts, typeCounts] = await Promise.all([
    prisma.knowledgeProduct.groupBy({
      by: ["status"],
      where: { archivedAt: null },
      _count: { id: true },
    }),
    prisma.knowledgeProduct.groupBy({
      by: ["productType"],
      where: { archivedAt: null },
      _count: { id: true },
    }),
  ]);

  const publishedCount = statusCounts.find(s => s.status === "PUBLISHED")?._count.id ?? 0;
  const draftCount     = statusCounts.find(s => s.status === "DRAFT")?._count.id ?? 0;

  function buildLink(extra: Record<string, string | undefined>) {
    const merged = { type: sp.type, status: sp.status, domain: sp.domain, public: sp.public, ...extra };
    const params = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v); });
    const qs = params.toString();
    return `/astelfin_26/asil/library${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/astelfin_26/asil" className="text-xs text-brand-gold hover:underline font-semibold">ASIL Hub</Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs text-gray-400">Knowledge Library</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-navy">Knowledge Library</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {publishedCount} published · {draftCount} in draft · {products.length} showing
          </p>
        </div>
        <Link
          href="/astelfin_26/asil/library/new"
          className="bg-brand-navy hover:bg-brand-navy/90 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          + New Publication
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm space-y-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide w-14">Status:</span>
          {[{ v: undefined, l: "All" }, ...STATUSES.map(s => ({ v: s, l: s.replace("_", " ") }))].map(({ v, l }) => (
            <Link key={l} href={buildLink({ status: v })}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                (sp.status ?? undefined) === v
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "border-gray-200 text-gray-600 hover:border-brand-navy hover:text-brand-navy"
              }`}>
              {l}
            </Link>
          ))}
          <Link href={buildLink({ public: sp.public === "1" ? undefined : "1" })}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              sp.public === "1"
                ? "bg-green-600 text-white border-green-600"
                : "border-gray-200 text-gray-600 hover:border-green-600 hover:text-green-600"
            }`}>
            Public only
          </Link>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide w-14">Type:</span>
          {[{ v: undefined, l: "All" }, ...TYPES.map(t => ({ v: t, l: PRODUCT_TYPE_LABELS[t] }))].map(({ v, l }) => (
            <Link key={l} href={buildLink({ type: v })}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                (sp.type ?? undefined) === v
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "border-gray-200 text-gray-600 hover:border-brand-navy hover:text-brand-navy"
              }`}>
              {l}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide w-14">Domain:</span>
          {[{ v: undefined, l: "All" }, ...DOMAINS.map(d => ({ v: d, l: DOMAIN_LABELS[d] }))].map(({ v, l }) => (
            <Link key={l} href={buildLink({ domain: v })}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                (sp.domain ?? undefined) === v
                  ? "bg-brand-teal text-white border-brand-teal"
                  : "border-gray-200 text-gray-600 hover:border-brand-teal hover:text-brand-teal"
              }`}>
              {l}
            </Link>
          ))}
        </div>
      </div>

      {/* Products list */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-400 text-sm mb-4">No knowledge products match these filters.</p>
          <Link
            href="/astelfin_26/asil/library/new"
            className="inline-flex items-center gap-1 text-brand-gold text-sm font-semibold hover:underline"
          >
            Create the first publication →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((kp) => (
            <div key={kp.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${PRODUCT_STATUS_COLORS[kp.status]}`}>
                      {kp.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-gray-500">{PRODUCT_TYPE_LABELS[kp.productType]}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${DOMAIN_COLORS[kp.domain]}`}>
                      {DOMAIN_LABELS[kp.domain]}
                    </span>
                    {kp.isPublicFacing && (
                      <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                        Public
                      </span>
                    )}
                    {kp.pilot && (
                      <Link
                        href={`/astelfin_26/asil/pilots/${kp.pilot.id}`}
                        className="text-[10px] font-mono font-bold text-brand-gold hover:underline"
                      >
                        {kp.pilot.pilotCode}
                      </Link>
                    )}
                  </div>
                  {/* Title */}
                  <h3 className="font-bold text-brand-navy leading-snug">{kp.title}</h3>
                  {kp.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{kp.description}</p>
                  )}
                  {/* Key learnings */}
                  {kp.keyLearnings.length > 0 && (
                    <div className="mt-2 space-y-0.5">
                      {kp.keyLearnings.slice(0, 3).map((l, i) => (
                        <p key={i} className="text-xs text-gray-600 flex items-start gap-1">
                          <span className="text-brand-gold shrink-0">·</span>{l}
                        </p>
                      ))}
                      {kp.keyLearnings.length > 3 && (
                        <p className="text-xs text-gray-400">+{kp.keyLearnings.length - 3} more</p>
                      )}
                    </div>
                  )}
                  {/* Advisory implications */}
                  {kp.advisoryImplications.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Advisory Implications</p>
                      {kp.advisoryImplications.slice(0, 2).map((a, i) => (
                        <p key={i} className="text-xs text-purple-700 flex items-start gap-1">
                          <span className="shrink-0">→</span>{a}
                        </p>
                      ))}
                    </div>
                  )}
                  {/* Target audience + citation */}
                  {(kp.targetAudience.length > 0 || kp.citationRef) && (
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      {kp.targetAudience.length > 0 && (
                        <span>Audience: {kp.targetAudience.join(", ")}</span>
                      )}
                      {kp.citationRef && (
                        <span className="font-mono">{kp.citationRef}</span>
                      )}
                    </div>
                  )}
                </div>
                {kp.publishedAt && (
                  <div className="shrink-0 text-right text-xs text-gray-400">
                    <p className="font-medium">
                      {new Date(kp.publishedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
