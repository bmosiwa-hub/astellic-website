import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Consultant Roster | Astelfin IMS",
  robots: { index: false, follow: false },
};

const QUAL_LABELS: Record<string, string> = {
  BACHELORS:         "Bachelor's",
  MASTERS:           "Master's",
  PHD:               "PhD",
  PROFESSIONAL_CERT: "Prof. Cert.",
  OTHER:             "Other",
};

export default async function RosterPage({
  searchParams,
}: {
  searchParams: Promise<{
    name?:          string;
    qualification?: string;
    expertise?:     string;
    expertiseMode?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const sp = await searchParams;

  /* ── Build Prisma where clause ─────────────────────────────────────────── */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { deletedAt: null };

  if (sp.name) {
    where.name = { contains: sp.name, mode: "insensitive" };
  }
  if (sp.qualification) {
    where.highestQualification = sp.qualification;
  }
  if (sp.expertise) {
    const terms = sp.expertise
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (terms.length > 0) {
      where.areasOfExpertise =
        sp.expertiseMode === "and" ? { hasEvery: terms } : { hasSome: terms };
    }
  }

  const profiles = await prisma.consultantRoster.findMany({
    where,
    orderBy: { name: "asc" },
  });

  const totalCount     = await prisma.consultantRoster.count({ where: { deletedAt: null } });
  const availableCount = await prisma.consultantRoster.count({ where: { deletedAt: null, isAvailable: true } });

  const expertiseMode = sp.expertiseMode === "and" ? "and" : "or";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Link href="/astelfin_26/consultants" className="hover:text-brand-gold">
              Consultants
            </Link>
            <span>/</span>
            <span className="text-gray-600">Roster</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-navy">Consultants Roster</h1>
        </div>
        <Link
          href="/astelfin_26/consultants/roster/new"
          className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          + Add to Roster
        </Link>
      </div>

      {/* Stats */}
      <p className="text-sm text-gray-500">
        <span className="font-semibold text-brand-navy">{totalCount}</span> consultants in roster
        {" · "}
        <span className="font-semibold text-green-600">{availableCount}</span> available
      </p>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <form method="GET" className="flex flex-wrap gap-3 items-end">
          {/* Name */}
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-xs font-semibold text-gray-600">Name</label>
            <input
              type="text"
              name="name"
              defaultValue={sp.name ?? ""}
              placeholder="Search by name…"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
            />
          </div>

          {/* Qualification */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs font-semibold text-gray-600">Qualification</label>
            <select
              name="qualification"
              defaultValue={sp.qualification ?? ""}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white"
            >
              <option value="">All qualifications</option>
              <option value="BACHELORS">Bachelor&apos;s Degree</option>
              <option value="MASTERS">Master&apos;s Degree</option>
              <option value="PHD">PhD / Doctorate</option>
              <option value="PROFESSIONAL_CERT">Professional Certification</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Expertise */}
          <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
            <label className="text-xs font-semibold text-gray-600">Areas of Expertise</label>
            <input
              type="text"
              name="expertise"
              defaultValue={sp.expertise ?? ""}
              placeholder="e.g. M&E, Health Systems, WASH"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
            />
          </div>

          {/* AND / OR toggle — two submit buttons that set expertiseMode */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Match</label>
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              <button
                type="submit"
                name="expertiseMode"
                value="or"
                className={`px-3 py-2 text-xs font-semibold transition-colors ${
                  expertiseMode === "or"
                    ? "bg-brand-navy text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                ANY
              </button>
              <button
                type="submit"
                name="expertiseMode"
                value="and"
                className={`px-3 py-2 text-xs font-semibold border-l border-gray-200 transition-colors ${
                  expertiseMode === "and"
                    ? "bg-brand-navy text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                ALL
              </button>
            </div>
          </div>

          {/* Filter / Clear */}
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Filter
            </button>
            <Link
              href="/astelfin_26/consultants/roster"
              className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Clear
            </Link>
          </div>
        </form>
      </div>

      {/* Results */}
      {profiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400 text-sm">
          No consultants match the current filters.
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* Left: identity */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-brand-navy">{p.name}</h3>
                    <span className="text-xs font-medium bg-brand-navy/10 text-brand-navy px-2 py-0.5 rounded-full">
                      {QUAL_LABELS[p.highestQualification] ?? p.highestQualification}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        p.isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {p.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                    {p.email && <span>{p.email}</span>}
                    {p.phone && <span>{p.phone}</span>}
                    {p.nationality && <span>{p.nationality}</span>}
                  </div>
                </div>

                {/* Right: action */}
                <Link
                  href={`/astelfin_26/consultants/roster/${p.id}`}
                  className="text-brand-gold hover:underline text-xs font-semibold shrink-0"
                >
                  View Profile →
                </Link>
              </div>

              {/* Profile summary excerpt */}
              {p.profileSummary && (
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                  {p.profileSummary.length > 120
                    ? `${p.profileSummary.slice(0, 120)}…`
                    : p.profileSummary}
                </p>
              )}

              {/* Expertise chips */}
              {p.areasOfExpertise.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.areasOfExpertise.map((area) => (
                    <span
                      key={area}
                      className="px-2.5 py-1 rounded-full text-xs font-medium border border-gray-200 text-gray-600 bg-white"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
