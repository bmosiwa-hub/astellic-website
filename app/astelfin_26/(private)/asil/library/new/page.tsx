import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createKnowledgeProduct } from "@/lib/asil-actions";

export const metadata = {
  title: "New Publication | ASIL",
  robots: { index: false, follow: false },
};

export default async function NewKnowledgeProductPage({
  searchParams,
}: {
  searchParams: Promise<{ pilotId?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const sp = await searchParams;
  const pilots = await prisma.pilotProfile.findMany({
    where: { archivedAt: null },
    select: { id: true, pilotCode: true, project: { select: { name: true } } },
    orderBy: { pilotCode: "asc" },
  });

  const preselectedPilot = pilots.find(p => p.id === sp.pilotId);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Link href="/astelfin_26/asil" className="text-brand-gold hover:underline font-semibold">ASIL Hub</Link>
        <span>/</span>
        <Link href="/astelfin_26/asil/library" className="text-brand-gold hover:underline font-semibold">Knowledge Library</Link>
        <span>/</span>
        <span>New Publication</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-brand-navy">New Knowledge Product</h1>
        <p className="text-gray-500 text-sm mt-1">
          Publications, briefs, and working papers generated from ASIL pilot evidence.
        </p>
      </div>

      <form action={createKnowledgeProduct} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-brand-navy border-b border-gray-100 pb-3">Product Details</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title *</label>
            <input
              name="title"
              required
              placeholder="e.g. Community Health Worker Retention in Rural Malawi — A Practice Note"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Product Type *</label>
              <select
                name="productType"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy"
              >
                <option value="">Select type…</option>
                <option value="LEARNING_REPORT">Learning Report</option>
                <option value="INTELLIGENCE_BRIEF">Intelligence Brief</option>
                <option value="ANNUAL_REVIEW">Annual Review</option>
                <option value="PRACTICE_NOTE">Practice Note</option>
                <option value="WORKING_PAPER">Working Paper</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Thematic Domain *</label>
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
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Linked Pilot</label>
            <select
              name="pilotId"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy"
            >
              <option value="">None (standalone product)</option>
              {pilots.map((p) => (
                <option key={p.id} value={p.id} selected={p.id === sp.pilotId}>
                  {p.pilotCode} — {p.project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Brief overview of what this product covers…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy resize-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-brand-navy border-b border-gray-100 pb-3">Evidence &amp; Implications</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Key Learnings</label>
            <p className="text-xs text-gray-400 mb-1.5">One per line. These become the primary evidence statements.</p>
            <textarea
              name="keyLearnings"
              rows={4}
              placeholder={"Peer-nominated CHWs show 2× higher retention at 12 months.\nFacility ownership increases fidelity when supervisors co-design protocols."}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Advisory Implications</label>
            <p className="text-xs text-gray-400 mb-1.5">One per line. Policy and practice recommendations derived from this product.</p>
            <textarea
              name="advisoryImplications"
              rows={3}
              placeholder={"MoH should embed peer-nomination in CHW selection criteria.\nDistrict supervisors should be co-authors of implementation protocols."}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Target Audience</label>
              <input
                name="targetAudience"
                placeholder="Comma-separated: MoH, NGOs, Donors"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Citation Reference</label>
              <input
                name="citationRef"
                placeholder="e.g. ASIL-2025-001"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-navy"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-brand-navy border-b border-gray-100 pb-3">Publication Settings</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
              <select
                name="status"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy"
              >
                <option value="DRAFT">Draft</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Public Facing?</label>
              <select
                name="isPublicFacing"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-navy"
              >
                <option value="false">Internal only</option>
                <option value="true">Yes — visible on astellic.com/asil</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <Link
            href="/astelfin_26/asil/library"
            className="text-sm text-gray-500 hover:text-gray-700 font-medium px-4 py-2"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="bg-brand-navy hover:bg-brand-navy/90 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
          >
            Create Publication →
          </button>
        </div>
      </form>
    </div>
  );
}
