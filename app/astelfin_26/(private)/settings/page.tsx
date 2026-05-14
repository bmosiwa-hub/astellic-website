import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { getEffectivePermissions, serializePermissions, FUNCTION_LABELS, TAB_FUNCTIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import Link from "next/link";

export const metadata = {
  title: "Settings | Astelfin IMS",
  robots: { index: false, follow: false },
};

const ROLE_LABELS: Record<string, string> = {
  CEO:              "Chief Executive Officer",
  FINANCE_MANAGER:  "Finance Manager",
  PROJECT_MANAGER:  "Project Manager",
  STAFF:            "Staff",
  CONSULTANT:       "Consultant",
};

const ROLE_COLORS: Record<string, string> = {
  CEO:              "bg-brand-gold/20 text-brand-navy",
  FINANCE_MANAGER:  "bg-blue-100 text-blue-800",
  PROJECT_MANAGER:  "bg-green-100 text-green-800",
  STAFF:            "bg-purple-100 text-purple-800",
  CONSULTANT:       "bg-teal-100 text-teal-800",
};

/* ── Server Actions (CEO only) ──────────────────────────────── */

async function forcePwChange(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");
  const userId = formData.get("userId") as string;
  if (userId === session.user.id) return;
  await prisma.user.update({ where: { id: userId }, data: { mustChangePassword: true } });
  await auditLog({
    userId:   session.user.id!,
    action:   "FORCE_PW_CHANGE",
    entity:   "User",
    entityId: userId,
    detail:   "CEO flagged account for forced password change on next login",
  });
  revalidatePath("/astelfin_26/settings");
}

async function lockAccount(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");
  const userId      = formData.get("userId") as string;
  const hoursStr    = formData.get("hours") as string;
  const hours       = Math.min(720, Math.max(1, parseInt(hoursStr || "24") || 24));
  if (userId === session.user.id) return;
  const lockedUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
  await prisma.user.update({ where: { id: userId }, data: { lockedUntil } });
  await auditLog({
    userId:   session.user.id!,
    action:   "LOCK_ACCOUNT",
    entity:   "User",
    entityId: userId,
    detail:   `Account locked for ${hours}h by CEO`,
  });
  revalidatePath("/astelfin_26/settings");
}

async function unlockAccount(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");
  const userId = formData.get("userId") as string;
  await prisma.user.update({ where: { id: userId }, data: { lockedUntil: null } });
  await auditLog({
    userId:   session.user.id!,
    action:   "UNLOCK_ACCOUNT",
    entity:   "User",
    entityId: userId,
    detail:   "Account manually unlocked by CEO",
  });
  revalidatePath("/astelfin_26/settings");
}

async function updatePermissions(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");
  const userId = formData.get("userId") as string;
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!target || target.role === "CEO") return;

  const tabKeys   = ["finance", "operations", "projects", "bizdev"] as const;
  const funcKeys  = Object.keys(FUNCTION_LABELS) as (keyof typeof FUNCTION_LABELS)[];

  const tabs      = Object.fromEntries(tabKeys.map((k) => [k, formData.get(`tab_${k}`) === "1"]));
  const functions = Object.fromEntries(funcKeys.map((k) => [k, formData.get(`fn_${k}`) === "1"]));

  const perms = serializePermissions({ tabs, functions } as unknown as Parameters<typeof serializePermissions>[0]);

  await prisma.user.update({ where: { id: userId }, data: { permissions: perms } });
  await auditLog({
    userId:   session.user.id!,
    action:   "UPDATE_PERMISSIONS",
    entity:   "User",
    entityId: userId,
    detail:   "Permission overrides updated by CEO",
  });
  revalidatePath("/astelfin_26/settings");
}

async function createUser(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const name         = formData.get("name") as string;
  const email        = formData.get("email") as string;
  const password     = formData.get("password") as string;
  const role         = (formData.get("role") as "CEO" | "FINANCE_MANAGER" | "PROJECT_MANAGER" | "STAFF" | "CONSULTANT") || "STAFF";
  const employeeId   = (formData.get("employeeId") as string) || null;
  const consultantId = (formData.get("consultantId") as string) || null;

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role, employeeId, consultantId, mustChangePassword: true },
  });

  await auditLog({
    userId: session.user.id,
    action: "CREATE",
    entity: "User",
    entityId: user.id,
    detail: `${name} (${role})`,
  });

  redirect("/astelfin_26/settings");
}

async function updateUser(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const userId       = formData.get("userId") as string;
  const name         = formData.get("name") as string;
  const email        = formData.get("email") as string;
  const role         = formData.get("role") as "CEO" | "FINANCE_MANAGER" | "PROJECT_MANAGER" | "STAFF" | "CONSULTANT";
  const employeeId   = (formData.get("employeeId") as string) || null;
  const consultantId = (formData.get("consultantId") as string) || null;

  await prisma.user.update({
    where: { id: userId },
    data: { name, email, role, employeeId, consultantId },
  });

  await auditLog({
    userId: session.user.id,
    action: "UPDATE",
    entity: "User",
    entityId: userId,
    detail: `Role → ${role}`,
  });

  redirect("/astelfin_26/settings");
}

async function resetPassword(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const userId      = formData.get("userId") as string;
  const newPassword = formData.get("newPassword") as string;
  if (!newPassword || newPassword.length < 10) return;

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data:  { passwordHash, mustChangePassword: true, passwordChangedAt: new Date() },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "RESET_PASSWORD",
    entity:   "User",
    entityId: userId,
    detail:   "Password reset by CEO — user must change on next login",
  });

  redirect("/astelfin_26/settings");
}

async function toggleActive(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const userId = formData.get("userId") as string;
  const active = formData.get("active") === "true";

  if (userId === session.user.id && !active) return; // can't deactivate yourself

  await prisma.user.update({ where: { id: userId }, data: { active } });

  await auditLog({
    userId: session.user.id,
    action: "UPDATE",
    entity: "User",
    entityId: userId,
    detail: active ? "Reactivated" : "Deactivated",
  });

  redirect("/astelfin_26/settings");
}

async function deleteUser(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const userId  = formData.get("userId") as string;
  const confirm = formData.get("confirm") as string;

  // Cannot delete yourself
  if (userId === session.user.id) redirect("/astelfin_26/settings?error=self_delete");
  // Require the word "DELETE" typed as confirmation
  if (confirm !== "DELETE") redirect("/astelfin_26/settings?error=confirm_mismatch");

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) redirect("/astelfin_26/settings");

  await auditLog({
    userId: session.user.id,
    action: "DELETE",
    entity: "User",
    entityId: userId,
    detail: `Permanently deleted user ${target.name} (${target.email})`,
  });

  await prisma.user.delete({ where: { id: userId } });

  redirect("/astelfin_26/settings?success=deleted");
}

/* ── Page ────────────────────────────────────────────────────── */

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ editUser?: string; deleteUser?: string; error?: string; success?: string }>;
}) {
  const { editUser, deleteUser: deleteUserId, error, success } = await searchParams;
  const session = await auth();
  const isCEO = session?.user?.role === "CEO";

  const [users, employees, consultants] = await Promise.all([
    isCEO ? prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true, name: true, email: true, role: true, active: true,
        createdAt: true, lastLoginAt: true, lockedUntil: true,
        mustChangePassword: true, employeeId: true, consultantId: true,
        permissions: true,
      },
    }) : Promise.resolve([]),
    isCEO ? prisma.employee.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }) : Promise.resolve([]),
    isCEO ? prisma.consultant.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }) : Promise.resolve([]),
  ]);

  const editingUser  = editUser     ? users.find((u) => u.id === editUser)     : null;
  const deletingUser = deleteUserId ? users.find((u) => u.id === deleteUserId) : null;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-navy">Settings</h1>
        <div className="flex items-center gap-4">
          <a href="/api/finance/backup" download
            className="inline-flex items-center gap-2 bg-brand-navy hover:bg-brand-navy/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Backup
          </a>
          <Link href="/astelfin_26/settings/login-history" className="text-sm text-gray-500 hover:text-brand-navy font-semibold transition-colors">
            Login History →
          </Link>
          <Link href="/astelfin_26/settings/audit" className="text-sm text-brand-gold hover:underline font-semibold">
            View Audit Log →
          </Link>
        </div>
      </div>

      {error === "self_delete" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          You cannot delete your own account.
        </div>
      )}
      {error === "confirm_mismatch" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          Confirmation text did not match. User was not deleted.
        </div>
      )}
      {success === "deleted" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          User account permanently deleted.
        </div>
      )}

      {isCEO ? (
        <>
          {/* Delete confirmation panel */}
          {deletingUser && deletingUser.id !== session?.user?.id && (
            <div className="bg-red-50 border border-red-300 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-red-200 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-red-800">Permanently Delete User Account</p>
                  <p className="text-xs text-red-600">This action cannot be undone. All login access for this user will be removed.</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-red-200 px-4 py-3 text-sm space-y-1">
                <p><span className="text-gray-500">Name:</span> <span className="font-semibold text-gray-800">{deletingUser.name}</span></p>
                <p><span className="text-gray-500">Email:</span> <span className="font-semibold text-gray-800">{deletingUser.email}</span></p>
                <p><span className="text-gray-500">Role:</span> <span className="font-semibold text-gray-800">{ROLE_LABELS[deletingUser.role] ?? deletingUser.role}</span></p>
              </div>
              <form action={deleteUser} className="flex items-center gap-3">
                <input type="hidden" name="userId" value={deletingUser.id} />
                <div className="flex-1">
                  <label className="block text-xs font-medium text-red-700 mb-1">
                    Type <strong>DELETE</strong> to confirm permanent deletion
                  </label>
                  <input name="confirm" required placeholder="DELETE"
                    className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40 bg-white" />
                </div>
                <div className="flex gap-2 pt-5">
                  <button type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap">
                    Delete Permanently
                  </button>
                  <Link href="/astelfin_26/settings"
                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          )}

          {/* User list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-brand-navy">User Accounts</h2>
              <p className="text-xs text-gray-400">{users.length} total · Only the Chief Executive Officer can manage users</p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Name</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Email</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Role</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden xl:table-cell">Last Login</th>
                  <th className="px-5 py-3 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => {
                  const isLocked = u.lockedUntil && u.lockedUntil > new Date();
                  return (
                  <tr key={u.id} className={`hover:bg-gray-50 ${editUser === u.id ? "bg-brand-light" : ""}`}>
                    <td className="px-5 py-3 font-medium text-brand-navy">
                      <div className="flex items-center gap-2">
                        {u.name}
                        {u.mustChangePassword && (
                          <span title="Must change password on next login"
                            className="text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">PW</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${u.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {u.active ? "Active" : "Inactive"}
                        </span>
                        {isLocked && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit bg-red-100 text-red-700">
                            Locked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400 hidden xl:table-cell whitespace-nowrap">
                      {u.lastLoginAt
                        ? u.lastLoginAt.toLocaleString("en-GB", { day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:false })
                        : "Never"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-3 flex-wrap justify-end">
                        <Link href={`/astelfin_26/settings?editUser=${u.id}`}
                          className="text-xs text-brand-gold font-semibold hover:underline">
                          Edit
                        </Link>
                        {u.id !== session?.user?.id && (
                          <>
                            <form action={toggleActive}>
                              <input type="hidden" name="userId" value={u.id} />
                              <input type="hidden" name="active" value={u.active ? "false" : "true"} />
                              <button type="submit"
                                className={`text-xs font-semibold hover:underline ${u.active ? "text-orange-500" : "text-green-600"}`}>
                                {u.active ? "Deactivate" : "Reactivate"}
                              </button>
                            </form>
                            {!u.mustChangePassword && (
                              <form action={forcePwChange}>
                                <input type="hidden" name="userId" value={u.id} />
                                <button type="submit" className="text-xs font-semibold hover:underline text-amber-600">
                                  Force PW
                                </button>
                              </form>
                            )}
                            {isLocked ? (
                              <form action={unlockAccount}>
                                <input type="hidden" name="userId" value={u.id} />
                                <button type="submit" className="text-xs font-semibold hover:underline text-blue-600">
                                  Unlock
                                </button>
                              </form>
                            ) : (
                              <form action={lockAccount} className="inline-flex items-center gap-1">
                                <input type="hidden" name="userId" value={u.id} />
                                <input type="hidden" name="hours" value="24" />
                                <button type="submit" className="text-xs font-semibold hover:underline text-red-500">
                                  Lock 24h
                                </button>
                              </form>
                            )}
                            <Link href={`/astelfin_26/settings?deleteUser=${u.id}`}
                              className="text-xs font-semibold text-red-500 hover:underline">
                              Delete
                            </Link>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Edit user form */}
          {editingUser && (
            <div className="bg-brand-light border border-brand-gold/30 rounded-2xl p-6">
              <h2 className="font-bold text-brand-navy mb-5">Edit User: {editingUser.name}</h2>
              <form action={updateUser} className="grid grid-cols-2 gap-5">
                <input type="hidden" name="userId" value={editingUser.id} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input name="name" required defaultValue={editingUser.name}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input name="email" type="email" required defaultValue={editingUser.email}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                  <select name="role" defaultValue={editingUser.role}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
                    <option value="CEO">Chief Executive Officer (CEO)</option>
                    <option value="FINANCE_MANAGER">Finance Manager</option>
                    <option value="PROJECT_MANAGER">Project Manager</option>
                    <option value="STAFF">Staff</option>
                    <option value="CONSULTANT">Consultant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Link to Employee (optional)</label>
                  <select name="employeeId" defaultValue={editingUser.employeeId ?? ""}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
                    <option value="">— None —</option>
                    {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Link to Consultant (optional)</label>
                  <select name="consultantId" defaultValue={editingUser.consultantId ?? ""}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
                    <option value="">— None —</option>
                    {consultants.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2 flex gap-3">
                  <button type="submit"
                    className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold">
                    Save Changes
                  </button>
                  <Link href="/astelfin_26/settings"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-semibold">
                    Cancel
                  </Link>
                </div>
              </form>

              {/* Password reset */}
              <div className="mt-6 pt-5 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Reset Password</h3>
                <p className="text-xs text-gray-400 mb-3">User will be required to change their password on next login.</p>
                <form action={resetPassword} className="flex items-center gap-3">
                  <input type="hidden" name="userId" value={editingUser.id} />
                  <input name="newPassword" type="password" minLength={10} required placeholder="New password (min 10 chars)"
                    className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                  <button type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap">
                    Reset Password
                  </button>
                </form>
              </div>

              {/* Permission overrides — not shown for CEO (always full access) */}
              {editingUser.role !== "CEO" && (() => {
                const effectivePerms = getEffectivePermissions(editingUser.role, editingUser.permissions);
                return (
                  <div className="mt-6 pt-5 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Permission Overrides</h3>
                    <p className="text-xs text-gray-400 mb-4">
                      Customise access for this user. Defaults are based on their role.
                      Toggle tabs first — functions are ignored when the parent tab is off.
                    </p>
                    <form action={updatePermissions} className="space-y-5">
                      <input type="hidden" name="userId" value={editingUser.id} />

                      {(["finance","operations","projects","bizdev"] as const).map((tab) => (
                        <div key={tab} className="rounded-xl border border-gray-100 p-4 space-y-3">
                          {/* Tab toggle */}
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              name={`tab_${tab}`}
                              value="1"
                              defaultChecked={effectivePerms.tabs[tab]}
                              className="w-4 h-4 rounded accent-brand-gold"
                            />
                            <span className="font-semibold text-sm text-brand-navy capitalize">
                              {tab === "bizdev" ? "Business Development" : tab.charAt(0).toUpperCase() + tab.slice(1)} Tab
                            </span>
                          </label>
                          {/* Functions in this tab */}
                          <div className="pl-7 grid grid-cols-2 gap-2">
                            {TAB_FUNCTIONS[tab].map((fn) => (
                              <label key={fn} className="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
                                <input
                                  type="checkbox"
                                  name={`fn_${fn}`}
                                  value="1"
                                  defaultChecked={effectivePerms.functions[fn]}
                                  className="w-3.5 h-3.5 rounded accent-brand-gold"
                                />
                                {FUNCTION_LABELS[fn]}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}

                      <button type="submit"
                        className="bg-brand-navy hover:bg-brand-navy/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                        Save Permissions
                      </button>
                    </form>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Add user form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-brand-navy mb-5">Add New User</h2>
            <form action={createUser} className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input name="name" required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input name="email" type="email" required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input name="password" type="password" required minLength={10}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <select name="role"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
                  <option value="STAFF">Staff</option>
                  <option value="CONSULTANT">Consultant</option>
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="FINANCE_MANAGER">Finance Manager</option>
                  <option value="CEO">Chief Executive Officer (CEO)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Link to Employee (optional)</label>
                <select name="employeeId"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
                  <option value="">— None —</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Link to Consultant (optional)</label>
                <select name="consultantId"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
                  <option value="">— None —</option>
                  {consultants.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <button type="submit"
                  className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
          <p>User management is available to the Chief Executive Officer only.</p>
        </div>
      )}
    </div>
  );
}
