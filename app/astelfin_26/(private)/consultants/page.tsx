import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/finance-utils";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Consultants | Astelfin IMS",
  robots: { index: false, follow: false },
};

export default async function ConsultantsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const isCEO = session.user.role === "CEO";
  const { success } = await searchParams;

  // Active consultants — those where active=true AND linked project is ACTIVE
  const activeConsultants = await prisma.consultant.findMany({
    where: {
      active: true,
      deletedAt: null,
      projectId: { not: null },
    },
    orderBy: { name: "asc" },
    include: {
      payments: { select: { grossAmount: true, netAmount: true, withholdingTax: true } },
    },
  });

  // Roster summary
  const rosterCount     = await prisma.consultantRoster.count({ where: { deletedAt: null } });
  const availableCount  = await prisma.consultantRoster.count({ where: { deletedAt: null, isAvailable: true } });
  const rosterPreview   = await prisma.consultantRoster.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, highestQualification: true, isAvailable: true, areasOfExpertise: true },
  });

  const QUAL_LABELS: Record<string, string> = {
    BACHELORS:        "Bachelor's",
    MASTERS:          "Master's",
    PHD:              "PhD",
    PROFESSIONAL_CERT: "Prof. Cert.",
    OTHER:            "Other",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-brand-navy">Consultants</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/astelfin_26/consultants/roster/new"
            className="border border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            + Add to Roster
          </Link>
          <Link
            href="/astelfin_26/consultants/new"
            className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            + Add Consultant
          </Link>
        </div>
      </div>

      {success === "terminated" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          Consultant contract terminated and marked as inactive.
        </div>
      )}

      {/* ── Section 1: Active Consultants ────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-brand-navy">Active Consultants</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {activeConsultants.length === 0 ? (
            <p className="text-center py-12 text-gray-400 text-sm">
              No active consultants on live projects.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Name</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Project</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Total Paid (Net)</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">WHT Withheld</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeConsultants.map((c) => {
                  const totalNet = c.payments.reduce((s: number, p) => s + p.netAmount, 0);
                  const totalWHT = c.payments.reduce((s: number, p) => s + p.withholdingTax, 0);
                  return (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-brand-navy">{c.name}</p>
                        {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        <span className="text-gray-300">—</span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-brand-navy">
                        {formatCurrency(totalNet, c.currency)}
                      </td>
                      <td className="px-5 py-3 text-right text-orange-600">
                        {formatCurrency(totalWHT, c.currency)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/astelfin_26/consultants/${c.id}/pay`}
                            className="text-brand-gold hover:underline text-xs font-semibold"
                          >
                            Record Payment
                          </Link>
                          {isCEO && (
                            <Link
                              href={`/astelfin_26/consultants/${c.id}/terminate`}
                              className="text-red-500 hover:text-red-700 text-xs font-semibold"
                            >
                              Terminate
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ── Section 2: Consultants Roster ────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-brand-navy">Consultants Roster</h2>
          <Link
            href="/astelfin_26/consultants/roster"
            className="text-brand-gold hover:underline text-xs font-semibold"
          >
            View Full Roster →
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          {/* Stats bar */}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>
              <span className="font-bold text-brand-navy text-lg">{rosterCount}</span> consultants in talent database
            </span>
            <span className="text-gray-300">|</span>
            <span>
              <span className="font-bold text-green-600">{availableCount}</span> currently available
            </span>
            <div className="ml-auto">
              <Link
                href="/astelfin_26/consultants/roster/new"
                className="text-brand-gold hover:underline text-xs font-semibold"
              >
                + Add to Roster
              </Link>
            </div>
          </div>

          {rosterPreview.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              No roster profiles yet.{" "}
              <Link href="/astelfin_26/consultants/roster/new" className="text-brand-gold hover:underline font-semibold">
                Add the first one.
              </Link>
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {rosterPreview.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2.5 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <p className="font-medium text-brand-navy text-sm truncate">{r.name}</p>
                    <span className="shrink-0 text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                      {QUAL_LABELS[r.highestQualification] ?? r.highestQualification}
                    </span>
                    <span
                      className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        r.isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {r.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.areasOfExpertise.slice(0, 3).map((area) => (
                      <span
                        key={area}
                        className="px-2 py-0.5 rounded-full text-xs font-medium border border-gray-200 text-gray-600 bg-white"
                      >
                        {area}
                      </span>
                    ))}
                    {r.areasOfExpertise.length > 3 && (
                      <span className="text-xs text-gray-400">+{r.areasOfExpertise.length - 3}</span>
                    )}
                    <Link
                      href={`/astelfin_26/consultants/roster/${r.id}`}
                      className="text-brand-gold hover:underline text-xs font-semibold ml-2"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {rosterCount > 5 && (
            <div className="pt-2 border-t border-gray-50">
              <Link
                href="/astelfin_26/consultants/roster"
                className="text-brand-gold hover:underline text-xs font-semibold"
              >
                View all {rosterCount} profiles →
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
