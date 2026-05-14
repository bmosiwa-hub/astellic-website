import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export const metadata = {
  title: "Change Password | Astelfin IMS",
  robots: { index: false, follow: false },
};

// ── Server Action ─────────────────────────────────────────────────────────────

async function changePassword(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword     = formData.get("newPassword")     as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    redirect("/astelfin_26/change-password?error=mismatch");
  }
  if (newPassword.length < 10) {
    redirect("/astelfin_26/change-password?error=too_short");
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id! } });
  if (!user) redirect("/astelfin_26/login");

  // Verify current password — unless this is a forced change where mustChangePassword
  // was set by an admin reset (skip current-password check in that case)
  if (!session.user.mustChangePassword) {
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) redirect("/astelfin_26/change-password?error=wrong_current");
  }

  // Prevent reusing the same password
  const sameAsOld = await bcrypt.compare(newPassword, user.passwordHash);
  if (sameAsOld) redirect("/astelfin_26/change-password?error=same_password");

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: session.user.id! },
    data: {
      passwordHash,
      mustChangePassword: false,
      passwordChangedAt:  new Date(),
    },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "CHANGE_PASSWORD",
    entity:   "User",
    entityId: session.user.id!,
    detail:   session.user.mustChangePassword
      ? "Password changed (forced — admin reset)"
      : "Password changed by user",
  });

  // The mustChangePassword flag is now false in DB but still true in the JWT.
  // Sign out to force a fresh token on next login.
  redirect("/astelfin_26/login?reason=password_changed");
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const { error } = await searchParams;
  const isForced = session.user.mustChangePassword;

  const errorMessages: Record<string, string> = {
    mismatch:       "New passwords do not match.",
    too_short:      "New password must be at least 10 characters long.",
    wrong_current:  "Current password is incorrect.",
    same_password:  "New password must be different from your current password.",
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Forced-change banner */}
      {isForced && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-amber-800">Password Change Required</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Your password has been reset by an administrator and must be changed before you can continue.
                Choose a strong, unique password that you have not used before.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-xl font-bold text-brand-navy mb-1">
          {isForced ? "Set New Password" : "Change Password"}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Minimum 10 characters. Choose a password you have not used before.
        </p>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {errorMessages[error] ?? "An error occurred. Please try again."}
          </div>
        )}

        <form action={changePassword} className="space-y-4">
          {/* Only show current-password field if this is a voluntary change */}
          {!isForced && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Current Password
              </label>
              <input
                type="password" name="currentPassword" required
                autoComplete="current-password"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New Password
            </label>
            <input
              type="password" name="newPassword" required minLength={10}
              autoComplete="new-password"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password" name="confirmPassword" required minLength={10}
              autoComplete="new-password"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-navy hover:bg-brand-navy/90 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2"
          >
            {isForced ? "Set Password & Continue" : "Change Password"}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-gray-400 mt-5">
        After changing your password you will be signed out and redirected to the login page.
      </p>
    </div>
  );
}
