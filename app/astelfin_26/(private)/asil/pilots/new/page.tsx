import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createPilot } from "@/lib/asil-actions";

export const metadata = {
  title: "Register Pilot | ASIL",
  robots: { index: false, follow: false },
};

export default async function NewPilotPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO") redirect("/astelfin_26/asil");

  return (
    <div className="max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Link href="/astelfin_26/asil" className="text-brand-gold hover:underline font-semibold">ASIL Hub</Link>
        <span>/</span>
        <Link href="/astelfin_26/asil/pilots" className="text-brand-gold hover:underline font-semibold">Pilot Registry</Link>
        <span>/</span>
        <span>Register Pilot</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Register a New Pilot</h1>
        <p className="text-gray-500 text-sm mt-1">
          Each pilot is an implementation research study conducted under the ASIL mandate.
        </p>
      </div>

      <form action={createPilot} className="space-y-6">
        {/* Identity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-brand-navy border-b border-gray-100 pb-3">Pilot Identity</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Pilot Code *</label>
              <input
                name="pilotCode"
                required
                placeholder="e.g. ASIL-001"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Domain *</label>
              <select
                name="domain"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy"
              >
                <option value="">Select domain…</option>
                <option value="HEALTH">Health &amp; Nutrition Systems</option>
                <option value="GOVERNANCE">Governance &amp; Public Sector Reform</option>
                <option value="EDUCATION">Education &amp; Social Systems</option>
                <option value="CLIMATE">Climate, Agriculture &amp; Sustainability</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Pilot Name *</label>
            <input
              name="name"
              required
              placeholder="e.g. Community Health Systems Strengthening Pilot"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Context / Background</label>
            <textarea
              name="context"
              rows={3}
              placeholder="Describe the problem context and why this pilot is being conducted…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Theory of Change</label>
            <textarea
              name="theoryOfChange"
              rows={3}
              placeholder="If [intervention], then [mechanism], leading to [outcome]…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy resize-none"
            />
          </div>
        </div>

        {/* Research Design */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-brand-navy border-b border-gray-100 pb-3">Research Design</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Learning Questions</label>
            <p className="text-xs text-gray-400 mb-1.5">One per line. These guide evaluation and adaptive management.</p>
            <textarea
              name="learningQuestions"
              rows={4}
              placeholder={"What conditions enable sustained community health worker engagement?\nHow does facility-level ownership affect implementation fidelity?"}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Methodology Notes</label>
            <textarea
              name="methodologyNotes"
              rows={2}
              placeholder="Qualitative case study, mixed-methods, rapid ethnography…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Implementation Sites</label>
              <input
                name="implementationSites"
                placeholder="Comma-separated: Lilongwe, Blantyre"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ethics Clearance</label>
              <select
                name="ethicsClearance"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy"
              >
                <option value="NOT_REQUIRED">Not Required</option>
                <option value="PENDING">Pending</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="CLEARED">Cleared</option>
              </select>
            </div>
          </div>
        </div>

        {/* Timeline & Budget */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-brand-navy border-b border-gray-100 pb-3">Timeline &amp; Budget</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Start Date *</label>
              <input
                type="date"
                name="startDate"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">End Date</label>
              <input
                type="date"
                name="endDate"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Budget (MWK)</label>
              <input
                type="number"
                name="budget"
                min="0"
                step="1000"
                placeholder="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Initial Phase</label>
            <select
              name="phase"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy"
            >
              <option value="DESIGN">Design</option>
              <option value="IMPLEMENTATION">Implementation</option>
              <option value="EVALUATION">Evaluation</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <Link
            href="/astelfin_26/asil/pilots"
            className="text-sm text-gray-500 hover:text-gray-700 font-medium px-4 py-2"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="bg-brand-navy hover:bg-brand-navy/90 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
          >
            Register Pilot →
          </button>
        </div>
      </form>
    </div>
  );
}
