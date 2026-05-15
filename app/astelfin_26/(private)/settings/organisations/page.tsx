/**
 * /settings/organisations
 * CEO-only page for creating and managing legal-entity organisations.
 *
 * Features:
 *  - List all organisations (active + inactive)
 *  - Create new organisation
 *  - Toggle active/inactive
 *  - "Claim untagged records" — backfills null organisationId on all financial
 *    records to the selected organisation (one-time migration action)
 */

import { auth }     from "@/auth";
import { prisma }   from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link         from "next/link";
import { revalidatePath } from "next/cache";

// ── Server actions ────────────────────────────────────────────────────────────

async function createOrg(formData: FormData) {
  "use server";
  const session = await auth();
  if (session?.user?.role !== "CEO") redirect("/astelfin_26/dashboard");

  const name               = (formData.get("name")               as string)?.trim();
  const shortCode          = (formData.get("shortCode")          as string)?.trim().toUpperCase();
  const type               = (formData.get("type")               as string) || "COMPANY";
  const registrationNumber = (formData.get("registrationNumber") as string)?.trim() || null;
  const taxPin             = (formData.get("taxPin")             as string)?.trim() || null;
  const notes              = (formData.get("notes")              as string)?.trim() || null;

  if (!name || !shortCode) return;

  await prisma.organisation.create({
    data: { name, shortCode, type, registrationNumber, taxPin, notes },
  });

  revalidatePath("/astelfin_26/settings/organisations");
}

async function toggleActive(formData: FormData) {
  "use server";
  const session = await auth();
  if (session?.user?.role !== "CEO") redirect("/astelfin_26/dashboard");

  const id     = formData.get("id")     as string;
  const active = formData.get("active") === "true";

  await prisma.organisation.update({ where: { id }, data: { active: !active } });
  revalidatePath("/astelfin_26/settings/organisations");
}

async function claimUntagged(formData: FormData) {
  "use server";
  const session = await auth();
  if (session?.user?.role !== "CEO") redirect("/astelfin_26/dashboard");

  const orgId = formData.get("orgId") as string;
  if (!orgId) return;

  // Backfill all models that carry organisationId
  await prisma.$transaction([
    prisma.income.updateMany({
      where: { organisationId: null },
      data:  { organisationId: orgId },
    }),
    prisma.expense.updateMany({
      where: { organisationId: null },
      data:  { organisationId: orgId },
    }),
    prisma.employee.updateMany({
      where: { organisationId: null },
      data:  { organisationId: orgId },
    }),
    prisma.payroll.updateMany({
      where: { organisationId: null },
      data:  { organisationId: orgId },
    }),
    prisma.project.updateMany({
      where: { organisationId: null },
      data:  { organisationId: orgId },
    }),
    prisma.donorGrant.updateMany({
      where: { organisationId: null },
      data:  { organisationId: orgId },
    }),
    prisma.debt.updateMany({
      where: { organisationId: null },
      data:  { organisationId: orgId },
    }),
  ]);

  revalidatePath("/astelfin_26/settings/organisations");
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function OrganisationsPage() {
  const session = await auth();
  if (session?.user?.role !== "CEO") redirect("/astelfin_26/dashboard");

  const orgs = await prisma.organisation.findMany({
    orderBy: { createdAt: "asc" },
  });

  // Count untagged records for migration banner
  const [untaggedIncome, untaggedExpense, untaggedEmployee, untaggedPayroll] = await Promise.all([
    prisma.income.count(  { where: { organisationId: null, deletedAt: null } }),
    prisma.expense.count( { where: { organisationId: null, deletedAt: null } }),
    prisma.employee.count({ where: { organisationId: null } }),
    prisma.payroll.count( { where: { organisationId: null, deletedAt: null } }),
  ]);
  const untaggedTotal = untaggedIncome + untaggedExpense + untaggedEmployee + untaggedPayroll;

  const ORG_TYPES = ["COMPANY", "CONSULTANCY", "CHARITABLE_TRUST", "NGO", "OTHER"];

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <Link href="/astelfin_26/settings" className="hover:text-brand-gold">Settings</Link>
          <span>›</span>
          <span className="text-gray-600">Organisations</span>
        </div>
        <h1 className="text-2xl font-bold text-brand-navy">Organisations</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage the legal entities this Astelfin installation covers. Each entity can hold
          its own income, expenses, employees, payroll, and grants, while sharing the same
          user accounts and settings.
        </p>
      </div>

      {/* Migration banner */}
      {untaggedTotal > 0 && orgs.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-amber-800 mb-1">
            {untaggedTotal.toLocaleString()} legacy record{untaggedTotal !== 1 ? "s" : ""} not yet tagged to an organisation
          </p>
          <p className="text-xs text-amber-700 mb-3">
            These records were created before multi-entity support was added.
            Use the button below to claim them under a specific entity — they will remain
            visible in all entity contexts until you do.
          </p>
          <form action={claimUntagged} className="flex items-center gap-3 flex-wrap">
            <select
              name="orgId"
              required
              className="rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30"
            >
              <option value="">Select organisation…</option>
              {orgs.filter((o) => o.active).map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-amber-700 transition-colors"
            >
              Claim untagged records
            </button>
          </form>
        </div>
      )}

      {/* Existing orgs */}
      {orgs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {orgs.map((org) => (
            <div key={org.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center font-bold text-sm flex-shrink-0">
                {org.shortCode.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-brand-navy">{org.name}</p>
                <p className="text-xs text-gray-400">
                  {org.shortCode} · {org.type.replace(/_/g, " ")}
                  {org.registrationNumber ? ` · Reg: ${org.registrationNumber}` : ""}
                  {org.taxPin ? ` · TIN: ${org.taxPin}` : ""}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                org.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              }`}>
                {org.active ? "Active" : "Inactive"}
              </span>
              <form action={toggleActive}>
                <input type="hidden" name="id"     value={org.id} />
                <input type="hidden" name="active" value={String(org.active)} />
                <button
                  type="submit"
                  className="text-xs text-gray-500 hover:text-brand-navy underline-offset-2 hover:underline"
                >
                  {org.active ? "Deactivate" : "Activate"}
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {/* Create new organisation */}
      <div>
        <h2 className="text-base font-bold text-brand-navy mb-4">Add organisation</h2>
        <form action={createOrg} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Legal name *</label>
              <input
                name="name" required type="text"
                placeholder="e.g. Astellic Consulting Ltd"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Short code * <span className="font-normal text-gray-400">(unique, used as badge)</span></label>
              <input
                name="shortCode" required type="text" maxLength={10}
                placeholder="e.g. CONSULT"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Entity type</label>
              <select
                name="type"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
              >
                {ORG_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Registration number</label>
              <input
                name="registrationNumber" type="text"
                placeholder="e.g. CO/2019/12345"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tax PIN (TIN/TPR)</label>
              <input
                name="taxPin" type="text"
                placeholder="e.g. 30000012345"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
              <textarea
                name="notes" rows={2}
                placeholder="Optional notes about this entity"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="bg-brand-navy text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-navy/90 transition-colors"
            >
              Create organisation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
