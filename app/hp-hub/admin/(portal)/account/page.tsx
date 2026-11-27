import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { PageHeader, Panel, Flash, inputCls, btnPrimary, Notice } from "@/components/hp-hub/admin/ui";
import { prisma } from "@/lib/prisma";
import { hpAudit, requireHp, requireHpPage } from "@/lib/hp-hub/auth";
import { ROLE_LABELS } from "@/lib/hp-hub/constants";

export const metadata = { title: "Account" };

async function changePassword(formData: FormData) {
  "use server";
  const actor = await requireHp();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const user = await prisma.user.findUniqueOrThrow({ where: { id: actor.userId } });

  const fail = (msg: string) => redirect(`/hp-hub/admin/account?err=${encodeURIComponent(msg)}${user.mustChangePassword ? "&force=1" : ""}`);
  if (next.length < 12) fail("Use at least 12 characters.");
  if (next !== confirm) fail("The new passwords don't match.");
  if (!(await bcrypt.compare(current, user.passwordHash))) fail("Your current password is incorrect.");
  if (await bcrypt.compare(next, user.passwordHash)) fail("Choose a password you haven't used here before.");

  await prisma.user.update({
    where: { id: actor.userId },
    data: { passwordHash: await bcrypt.hash(next, 12), mustChangePassword: false, passwordChangedAt: new Date() },
  });
  await hpAudit(actor, { action: "UPDATE", entityType: "User", entityId: actor.userId, detail: "Password changed via HP-Hub" });
  redirect("/hp-hub/admin/account?ok=Password%20changed.");
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string; force?: string }> }) {
  const actor = await requireHpPage();
  const sp = await searchParams;
  return (
    <div className="max-w-xl">
      <PageHeader title="Your account" description={`${actor.name} · ${actor.email} · ${ROLE_LABELS[actor.role]}`} />
      <Flash ok={sp.ok} err={sp.err} />
      {sp.force && !sp.err && (
        <div className="mb-6">
          <Notice tone="warn">Please replace your temporary password before continuing.</Notice>
        </div>
      )}
      <Panel title="Change password">
        <form action={changePassword} className="space-y-4">
          <div>
            <label htmlFor="current" className="block text-sm font-semibold text-brand-navy mb-1">
              Current (or temporary) password
            </label>
            <input id="current" name="current" type="password" required autoComplete="current-password" className={inputCls} />
          </div>
          <div>
            <label htmlFor="next" className="block text-sm font-semibold text-brand-navy mb-1">
              New password
            </label>
            <input id="next" name="next" type="password" required minLength={12} autoComplete="new-password" className={inputCls} />
            <p className="text-xs text-brand-muted mt-1">At least 12 characters. A passphrase of several words works well.</p>
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-semibold text-brand-navy mb-1">
              Confirm new password
            </label>
            <input id="confirm" name="confirm" type="password" required minLength={12} autoComplete="new-password" className={inputCls} />
          </div>
          <button type="submit" className={btnPrimary}>
            Change password
          </button>
        </form>
      </Panel>
    </div>
  );
}
