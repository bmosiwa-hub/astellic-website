/**
 * Phase 12 — Approval Delegation Settings
 *
 * Only the CEO can access this page. Allows creating, viewing, and revoking
 * active approval delegations. A delegation lets another user act on all
 * CEO-gated approval flows for a specified date range.
 */

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/finance-utils";
import { LAUNCH_DATE } from "@/lib/constants";

export const metadata = {
  title: "Approval Delegation | Astellic Finance",
  robots: { index: false, follow: false },
};

// ── Create delegation ─────────────────────────────────────────────────────────

async function createDelegation(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const delegateeId = formData.get("delegateeId") as string;
  const startDate   = formData.get("startDate")   as string;
  const endDate     = formData.get("endDate")     as string;
  const notes       = (formData.get("notes") as string) || null;

  if (!delegateeId || !startDate || !endDate) {
    revalidatePath("/astelfin_26/settings/delegation");
    return;
  }

  const start = new Date(startDate);
  const end   = new Date(endDate);
  end.setHours(23, 59, 59, 999); // delegation is inclusive of end day

  if (end <= start) {
    revalidatePath("/astelfin_26/settings/delegation");
    return;
  }

  // Deactivate any overlapping active delegations for the same delegatee
  await prisma.approvalDelegation.updateMany({
    where: {
      delegateeId,
      isActive:  true,
      startDate: { lte: end },
      endDate:   { gte: start },
    },
    data: { isActive: false, revokedAt: new Date(), revokedById: session.user.id! },
  });

  await prisma.approvalDelegation.create({
    data: {
      delegatorId: session.user.id!,
      delegateeId,
      startDate:   start,
      endDate:     end,
      notes,
      isActive:    true,
    },
  });

  const delegatee = await prisma.user.findUnique({ where: { id: delegateeId }, select: { name: true } });
  await auditLog({
    userId:   session.user.id!,
    action:   "CREATE",
    entity:   "ApprovalDelegation",
    entityId: delegateeId,
    detail:   `Delegated CEO approval authority to ${delegatee?.name ?? delegateeId} from ${startDate} to ${endDate}`,
  });

  revalidatePath("/astelfin_26/settings/delegation");
}

// ── Revoke delegation ─────────────────────────────────────────────────────────

async function revokeDelegation(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const id = formData.get("id") as string;
  if (!id) return;

  const delegation = await prisma.approvalDelegation.update({
    where: { id },
    data:  { isActive: false, revokedAt: new Date(), revokedById: session.user.id! },
    include: { delegatee: { select: { name: true } } },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "REVOKE",
    entity:   "ApprovalDelegation",
    entityId: id,
    detail:   `Revoked approval delegation for ${delegation.delegatee.name}`,
  });

  revalidatePath("/astelfin_26/settings/delegation");
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DelegationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const { success } = await searchParams;

  const now = new Date();

  // Load all users who could be delegates (not CEO, active)
  const [eligibleUsers, delegations] = await Promise.all([
    prisma.user.findMany({
      where:   { role: { not: "CEO" }, active: true },
      select:  { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    }),
    prisma.approvalDelegation.findMany({
      where:   { delegatorId: session.user.id! },
      include: { delegatee: { select: { name: true, role: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const active  = delegations.filter((d) => d.isActive && d.endDate >= now);
  const expired = delegations.filter((d) => !d.isActive || d.endDate < now);

  const ROLE_LABELS: Record<string, string> = {
    FINANCE_MANAGER: "Finance Manager",
    PROJECT_MANAGER: "Project Manager",
    STAFF:           "Staff",
    CONSULTANT:      "Consultant",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <Link href="/astelfin_26/settings" className="hover:text-brand-gold">Settings</Link>
          <span>›</span>
          <span className="text-gray-600">Approval Delegation</span>
        </div>
        <h1 className="text-2xl font-bold text-brand-navy">Approval Delegation</h1>
        <p className="text-gray-500 text-sm mt-1">
          Grant another user temporary authority to take CEO-level approval actions on your behalf.
          All delegate actions are attributed "on behalf of CEO" in the audit trail.
        </p>
      </div>

      {success === "created" && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-xl">
          Delegation created successfully.
        </div>
      )}

      {/* Active delegations */}
      {active.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-brand-navy">Active Delegations</h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {active.map((d) => (
              <li key={d.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-brand-navy">{d.delegatee.name}</p>
                  <p className="text-xs text-gray-500">
                    {ROLE_LABELS[d.delegatee.role] ?? d.delegatee.role}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(d.startDate)} – {formatDate(d.endDate)}
                    {d.notes && <span className="ml-2 italic">· {d.notes}</span>}
                  </p>
                </div>
                <form action={revokeDelegation}>
                  <input type="hidden" name="id" value={d.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-600 hover:text-red-700 font-semibold border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
                  >
                    Revoke
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}

      {active.length === 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-6 py-4 text-sm text-amber-700">
          No active delegations. You currently hold all CEO approval authority yourself.
        </div>
      )}

      {/* Create new delegation */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-brand-navy">Grant New Delegation</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            The delegate will be able to approve submissions, payroll, tax remittances, period locks, and change requests.
          </p>
        </div>
        <form action={createDelegation} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Delegate</label>
              <select
                name="delegateeId"
                required
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
              >
                <option value="">Select a user…</option>
                {eligibleUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {ROLE_LABELS[u.role] ?? u.role}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Start date</label>
                <input
                  type="date"
                  name="startDate"
                  required
                  min={LAUNCH_DATE}
                  defaultValue={LAUNCH_DATE}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">End date</label>
                <input
                  type="date"
                  name="endDate"
                  required
                  min={LAUNCH_DATE}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes (optional)</label>
            <input
              type="text"
              name="notes"
              placeholder="e.g. Annual leave 15–22 May"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
            />
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700">
            <strong>Important:</strong> The delegate will have full CEO approval authority for the specified period.
            All actions will be logged in the audit trail with a "delegated by" note.
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-brand-navy text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-navy/90 transition-colors"
            >
              Grant Delegation
            </button>
          </div>
        </form>
      </div>

      {/* Past delegations */}
      {expired.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-brand-navy text-sm">Past Delegations</h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {expired.map((d) => (
              <li key={d.id} className="px-6 py-3 flex items-center gap-4 text-sm">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-700">{d.delegatee.name}</span>
                  <span className="text-gray-400 ml-2 text-xs">
                    {formatDate(d.startDate)} – {formatDate(d.endDate)}
                  </span>
                  {d.revokedAt && (
                    <span className="ml-2 text-xs text-red-400">revoked {formatDate(d.revokedAt)}</span>
                  )}
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  d.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {d.revokedAt ? "Revoked" : "Expired"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
