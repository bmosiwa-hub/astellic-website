import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/finance-utils";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { updateRosterProfile, deleteRosterProfile } from "@/lib/roster-actions";

export const metadata = {
  title: "Roster Profile | Astelfin IMS",
  robots: { index: false, follow: false },
};

const QUAL_LABELS: Record<string, string> = {
  BACHELORS:         "Bachelor's Degree",
  MASTERS:           "Master's Degree",
  PHD:               "PhD / Doctorate",
  PROFESSIONAL_CERT: "Professional Certification",
  OTHER:             "Other",
};

export default async function RosterProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const { id } = await params;
  const isCEO = session.user.role === "CEO";

  const profile = await prisma.consultantRoster.findFirst({
    where: { id, deletedAt: null },
    include: {
      consultants: {
        where: { deletedAt: null },
        include: {
          payments: {
            select: {
              grossAmount: true,
              netAmount: true,
              withholdingTax: true,
              currency: true,
            },
          },
          project: { select: { name: true, status: true } },
        },
      },
    },
  });

  if (!profile) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Link href="/astelfin_26/consultants" className="hover:text-brand-gold">
          Consultants
        </Link>
        <span>/</span>
        <Link href="/astelfin_26/consultants/roster" className="hover:text-brand-gold">
          Roster
        </Link>
        <span>/</span>
        <span className="text-gray-600 truncate max-w-[180px]">{profile.name}</span>
      </div>

      {/* Profile header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-brand-navy">{profile.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium bg-brand-navy/10 text-brand-navy px-2.5 py-0.5 rounded-full">
                {QUAL_LABELS[profile.highestQualification] ?? profile.highestQualification}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  profile.isAvailable
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {profile.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          {profile.email && (
            <span>
              <span className="font-semibold text-gray-600">Email:</span> {profile.email}
            </span>
          )}
          {profile.phone && (
            <span>
              <span className="font-semibold text-gray-600">Phone:</span> {profile.phone}
            </span>
          )}
          {profile.nationality && (
            <span>
              <span className="font-semibold text-gray-600">Nationality:</span> {profile.nationality}
            </span>
          )}
          {profile.specialisation && (
            <span>
              <span className="font-semibold text-gray-600">Specialisation:</span>{" "}
              {profile.specialisation}
            </span>
          )}
        </div>

        {/* Profile summary */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            Profile Summary
          </p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {profile.profileSummary}
          </p>
        </div>

        {/* Areas of expertise */}
        {profile.areasOfExpertise.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              Areas of Expertise
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.areasOfExpertise.map((area) => (
                <span
                  key={area}
                  className="px-2.5 py-1 rounded-full text-xs font-medium border border-gray-200 text-gray-600 bg-white"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {profile.notes && (
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Notes</p>
            <p className="text-sm text-gray-500 whitespace-pre-line">{profile.notes}</p>
          </div>
        )}

        <p className="text-xs text-gray-300 pt-1">
          Added {new Date(profile.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Engagement History */}
      {profile.consultants.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-brand-navy">Engagement History</h2>
          <div className="divide-y divide-gray-50">
            {profile.consultants.map((c) => {
              const totalNet = c.payments.reduce((s, p) => s + p.netAmount, 0);
              const totalWHT = c.payments.reduce((s, p) => s + p.withholdingTax, 0);
              const currency = c.payments[0]?.currency ?? c.currency;
              return (
                <div key={c.id} className="py-3 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-sm font-medium text-brand-navy">
                      {c.project?.name ?? "Unlinked project"}
                    </p>
                    {c.project?.status && (
                      <span
                        className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                          c.project.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {c.project.status}
                      </span>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold text-brand-navy">
                      {formatCurrency(totalNet, currency)} net paid
                    </p>
                    <p className="text-xs text-orange-600">
                      {formatCurrency(totalWHT, currency)} WHT
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="text-base font-bold text-brand-navy">Edit Profile</h2>
        <form action={updateRosterProfile} className="space-y-5">
          <input type="hidden" name="id" value={profile.id} />

          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600" htmlFor="edit-name">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-name"
              name="name"
              type="text"
              required
              defaultValue={profile.name}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600" htmlFor="edit-email">
                Email
              </label>
              <input
                id="edit-email"
                name="email"
                type="email"
                defaultValue={profile.email ?? ""}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600" htmlFor="edit-phone">
                Phone
              </label>
              <input
                id="edit-phone"
                name="phone"
                type="text"
                defaultValue={profile.phone ?? ""}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
              />
            </div>
          </div>

          {/* Profile Summary */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600" htmlFor="edit-profileSummary">
              Profile Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              id="edit-profileSummary"
              name="profileSummary"
              required
              rows={4}
              defaultValue={profile.profileSummary}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 resize-none"
            />
          </div>

          {/* Qualification */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600" htmlFor="edit-qualification">
              Highest Qualification <span className="text-red-500">*</span>
            </label>
            <select
              id="edit-qualification"
              name="highestQualification"
              required
              defaultValue={profile.highestQualification}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white"
            >
              <option value="BACHELORS">Bachelor&apos;s Degree</option>
              <option value="MASTERS">Master&apos;s Degree</option>
              <option value="PHD">PhD / Doctorate</option>
              <option value="PROFESSIONAL_CERT">Professional Certification</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Areas of Expertise */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600" htmlFor="edit-expertise">
              Areas of Expertise <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-expertise"
              name="areasOfExpertise"
              type="text"
              required
              defaultValue={profile.areasOfExpertise.join(", ")}
              placeholder="Comma-separated: M&E, Health Systems, WASH, Governance"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
            />
          </div>

          {/* Specialisation + Nationality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600" htmlFor="edit-specialisation">
                Specialisation
              </label>
              <input
                id="edit-specialisation"
                name="specialisation"
                type="text"
                defaultValue={profile.specialisation ?? ""}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600" htmlFor="edit-nationality">
                Nationality
              </label>
              <input
                id="edit-nationality"
                name="nationality"
                type="text"
                defaultValue={profile.nationality ?? ""}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
              />
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600" htmlFor="edit-isAvailable">
              Availability
            </label>
            <select
              id="edit-isAvailable"
              name="isAvailable"
              defaultValue={profile.isAvailable ? "true" : "false"}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white"
            >
              <option value="true">Available</option>
              <option value="false">Not Currently Available</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600" htmlFor="edit-notes">
              Notes
            </label>
            <textarea
              id="edit-notes"
              name="notes"
              rows={3}
              defaultValue={profile.notes ?? ""}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 resize-none"
            />
          </div>

          {/* Save */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Save Changes
            </button>
            <Link
              href="/astelfin_26/consultants/roster"
              className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* CEO-only: delete */}
      {isCEO && (
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 space-y-3">
          <h2 className="text-base font-bold text-red-600">Danger Zone</h2>
          <p className="text-sm text-gray-500">
            Removing a profile from the roster is a soft delete — the record is retained for audit
            purposes but will no longer appear in searches.
          </p>
          <form action={deleteRosterProfile}>
            <input type="hidden" name="id" value={profile.id} />
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Remove from Roster
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
