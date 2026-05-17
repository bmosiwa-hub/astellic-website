import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createRosterProfile } from "@/lib/roster-actions";

export const metadata = {
  title: "Add to Roster | Astelfin IMS",
  robots: { index: false, follow: false },
};

export default async function NewRosterProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

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
        <span className="text-gray-600">New</span>
      </div>

      <h1 className="text-2xl font-bold text-brand-navy">Add to Roster</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form action={createRosterProfile} className="space-y-5">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600" htmlFor="name">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. Dr. Janet Phiri"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="consultant@example.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600" htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                placeholder="+265 999 000 000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
              />
            </div>
          </div>

          {/* Profile Summary */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600" htmlFor="profileSummary">
              Profile Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              id="profileSummary"
              name="profileSummary"
              required
              rows={4}
              placeholder="Describe the consultant's background, experience, and key strengths…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 resize-none"
            />
          </div>

          {/* Qualification */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600" htmlFor="highestQualification">
              Highest Qualification <span className="text-red-500">*</span>
            </label>
            <select
              id="highestQualification"
              name="highestQualification"
              required
              defaultValue="MASTERS"
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
            <label className="text-sm font-semibold text-gray-600" htmlFor="areasOfExpertise">
              Areas of Expertise <span className="text-red-500">*</span>
            </label>
            <input
              id="areasOfExpertise"
              name="areasOfExpertise"
              type="text"
              required
              placeholder="Comma-separated: M&E, Health Systems, WASH, Governance"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
            />
            <p className="text-xs text-gray-400">Separate each area with a comma.</p>
          </div>

          {/* Specialisation + Nationality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600" htmlFor="specialisation">
                Specialisation
              </label>
              <input
                id="specialisation"
                name="specialisation"
                type="text"
                placeholder="e.g. Qualitative Research"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-600" htmlFor="nationality">
                Nationality
              </label>
              <input
                id="nationality"
                name="nationality"
                type="text"
                placeholder="e.g. Malawian"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
              />
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600" htmlFor="isAvailable">
              Availability
            </label>
            <select
              id="isAvailable"
              name="isAvailable"
              defaultValue="true"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white"
            >
              <option value="true">Available</option>
              <option value="false">Not Currently Available</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600" htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Any internal notes about this consultant…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Add to Roster
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
    </div>
  );
}
