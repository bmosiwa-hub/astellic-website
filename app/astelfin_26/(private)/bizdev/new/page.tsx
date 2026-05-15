import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { getEffectivePermissions } from "@/lib/permissions";
import { LAUNCH_DATE } from "@/lib/constants";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Add Opportunity | Astelfin IMS",
  robots: { index: false, follow: false },
};

const CLASSIFICATIONS = [
  { value: "CONSULTANCY",    label: "Consultancy" },
  { value: "ADVISORY",       label: "Advisory" },
  { value: "IMPLEMENTATION", label: "Implementation" },
];

const THEMATIC_AREAS = [
  { value: "HEALTH_NUTRITION",        label: "Health & Nutrition Systems" },
  { value: "GOVERNANCE_PUBLIC_SECTOR",label: "Governance & Public Sector Reform" },
  { value: "HUMAN_DEVELOPMENT",       label: "Human Development & Social Systems" },
  { value: "CLIMATE_AGRICULTURE",     label: "Climate, Agriculture & Sustainability" },
];

async function createOpportunity(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id! },
    select: { role: true, permissions: true },
  });
  const perms = getEffectivePermissions(dbUser?.role ?? "", dbUser?.permissions);
  if (!perms.tabs.bizdev || !perms.functions.canAddOpportunity) redirect("/astelfin_26/bizdev");

  const name           = formData.get("name") as string;
  const classification = formData.get("classification") as string;
  const funder         = (formData.get("funder") as string) || null;
  const thematicArea   = (formData.get("thematicArea") as string) || null;
  const deadlineRaw    = formData.get("deadline") as string;
  const link           = (formData.get("link") as string) || null;
  const notes          = (formData.get("notes") as string) || null;

  const opp = await prisma.opportunity.create({
    data: {
      name,
      classification,
      funder,
      thematicArea,
      deadline: deadlineRaw ? new Date(deadlineRaw) : null,
      link,
      notes,
      createdBy: session.user.id!,
    },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "CREATE",
    entity:   "Opportunity",
    entityId: opp.id,
    detail:   `Opportunity added: ${name}`,
  });

  redirect("/astelfin_26/bizdev");
}

export default async function NewOpportunityPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const dbUser = await prisma.user.findUnique({
    where:  { id: session.user.id! },
    select: { role: true, permissions: true },
  });
  const perms = getEffectivePermissions(dbUser?.role ?? "", dbUser?.permissions);
  if (!perms.tabs.bizdev || !perms.functions.canAddOpportunity) redirect("/astelfin_26/bizdev");

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/astelfin_26/bizdev"
          className="text-gray-400 hover:text-brand-navy transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Add Opportunity</h1>
          <p className="text-gray-500 text-sm mt-0.5">Log a new business development opportunity.</p>
        </div>
      </div>

      <form action={createOpportunity} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Opportunity Name <span className="text-red-500">*</span>
              </label>
              <input name="name" required placeholder="e.g. Governance Support Programme — Phase III"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Classification <span className="text-red-500">*</span>
              </label>
              <select name="classification" required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white">
                <option value="">Select…</option>
                {CLASSIFICATIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Thematic Area</label>
              <select name="thematicArea"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white">
                <option value="">— Select —</option>
                {THEMATIC_AREAS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Funder / Client</label>
              <input name="funder" placeholder="e.g. UNDP, World Bank, GIZ…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Submission Deadline</label>
              <input name="deadline" type="date"
                min={LAUNCH_DATE}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Link
                <span className="ml-1.5 font-normal text-gray-400">— ToR, RFP, or opportunity portal</span>
              </label>
              <input name="link" type="url" placeholder="https://…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <textarea name="notes" rows={3}
                placeholder="Any relevant notes about this opportunity…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 resize-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit"
            className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            Save Opportunity
          </button>
          <Link href="/astelfin_26/bizdev"
            className="px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
