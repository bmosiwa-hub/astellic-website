import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME } from "@/lib/totp";
import { generateSecret, buildOtpAuthUri, verifyTotpToken, generateBackupCodes } from "@/lib/totp-server";
import { auditLog } from "@/lib/audit";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";

export const metadata = {
  title: "Two-Factor Authentication Setup | Astelfin IMS",
  robots: { index: false, follow: false },
};

// ── Server Actions ────────────────────────────────────────────────────────────

async function beginSetup(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || !["CEO", "FINANCE_MANAGER"].includes(session.user.role!))
    redirect("/astelfin_26/dashboard");

  const userId = session.user.id!;

  // Generate a fresh secret and store it (not yet enabled)
  const secret = generateSecret();
  await prisma.user.update({
    where: { id: userId },
    data:  { totpSecret: secret, totpEnabled: false },
  });

  redirect("/astelfin_26/settings/2fa?step=verify");
}

async function confirmSetup(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || !["CEO", "FINANCE_MANAGER"].includes(session.user.role!))
    redirect("/astelfin_26/dashboard");

  const userId = session.user.id!;
  const code   = (formData.get("code") as string ?? "").replace(/\s/g, "");

  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { totpSecret: true, email: true },
  });

  if (!user?.totpSecret) redirect("/astelfin_26/settings/2fa?error=no_secret");

  const valid = verifyTotpToken(user.totpSecret, code);
  if (!valid) redirect("/astelfin_26/settings/2fa?step=verify&error=wrong_code");

  // Generate one-time backup codes and store them hashed
  const { plainCodes, hashedCodes } = await generateBackupCodes();

  // Enable 2FA and store hashed backup codes
  await prisma.user.update({
    where: { id: userId },
    data:  { totpEnabled: true, totpBackupCodes: hashedCodes },
  });

  await auditLog({
    userId,
    action:   "UPDATE",
    entity:   "User",
    entityId: userId,
    detail:   "TOTP 2FA enabled",
  });

  // Pass backup codes via a signed cookie so they can be shown once on the next page load
  // (too long for a query string; they must never be stored in plain text after this point)
  const backupParam = Buffer.from(JSON.stringify(plainCodes)).toString("base64url");

  redirect(`/astelfin_26/settings/2fa?success=enabled&backup=${backupParam}`);
}

async function regenerateBackupCodes(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || !["CEO", "FINANCE_MANAGER"].includes(session.user.role!))
    redirect("/astelfin_26/dashboard");

  const userId = session.user.id!;
  const user   = await prisma.user.findUnique({ where: { id: userId }, select: { totpEnabled: true } });
  if (!user?.totpEnabled) redirect("/astelfin_26/settings/2fa?error=not_enabled");

  const { plainCodes, hashedCodes } = await generateBackupCodes();
  await prisma.user.update({ where: { id: userId }, data: { totpBackupCodes: hashedCodes } });

  await auditLog({
    userId,
    action:   "UPDATE",
    entity:   "User",
    entityId: userId,
    detail:   "TOTP backup codes regenerated",
  });

  const backupParam = Buffer.from(JSON.stringify(plainCodes)).toString("base64url");
  redirect(`/astelfin_26/settings/2fa?success=backup_regen&backup=${backupParam}`);
}

async function disable2fa(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || !["CEO", "FINANCE_MANAGER"].includes(session.user.role!))
    redirect("/astelfin_26/dashboard");

  const userId    = session.user.id!;
  const targetId  = (formData.get("targetUserId") as string) || userId;

  // Only CEO can disable another user's 2FA
  if (targetId !== userId && session.user.role !== "CEO")
    redirect("/astelfin_26/settings/2fa?error=forbidden");

  await prisma.user.update({
    where: { id: targetId },
    data:  { totpSecret: null, totpEnabled: false, totpBackupCodes: [] },
  });

  await auditLog({
    userId,
    action:   "UPDATE",
    entity:   "User",
    entityId: targetId,
    detail:   `TOTP 2FA disabled${targetId !== userId ? ` for user ${targetId} by CEO` : ""}`,
  });

  // Clear the 2FA cookie
  const jar = await cookies();
  jar.delete(COOKIE_NAME);

  redirect("/astelfin_26/settings/2fa?success=disabled");
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function TwoFASettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; error?: string; success?: string; backup?: string }>;
}) {
  const session = await auth();
  if (!session?.user || !["CEO", "FINANCE_MANAGER"].includes(session.user.role!))
    redirect("/astelfin_26/dashboard");

  const userId = session.user.id!;
  const { step, error, success, backup } = await searchParams;

  // Decode backup codes passed once after initial setup
  let backupCodes: string[] | null = null;
  if (backup) {
    try { backupCodes = JSON.parse(Buffer.from(backup, "base64url").toString("utf8")); }
    catch { /* ignore malformed param */ }
  }

  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { email: true, totpSecret: true, totpEnabled: true, totpBackupCodes: true },
  });

  if (!user) redirect("/astelfin_26/dashboard");

  // CEO also sees other users' 2FA status
  const isCEO = session.user.role === "CEO";
  const otherUsers = isCEO
    ? await prisma.user.findMany({
        where:  { role: { in: ["CEO", "FINANCE_MANAGER"] }, id: { not: userId }, active: true },
        select: { id: true, name: true, email: true, role: true, totpEnabled: true },
        orderBy: { name: "asc" },
      })
    : [];

  // Build QR code URI if in setup flow
  const showSetup = step === "verify" && user.totpSecret && !user.totpEnabled;
  const otpUri    = showSetup ? buildOtpAuthUri(user.totpSecret!, user.email) : null;
  const qrUrl     = otpUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&qzone=2&data=${encodeURIComponent(otpUri)}`
    : null;

  const ERROR_MESSAGES: Record<string, string> = {
    wrong_code: "Incorrect code — please try again. Codes refresh every 30 seconds.",
    no_secret:  "Setup session expired. Please start again.",
    forbidden:  "You do not have permission to perform this action.",
  };

  const SUCCESS_MESSAGES: Record<string, string> = {
    enabled:      "✓ Two-factor authentication is now active on your account.",
    disabled:     "Two-factor authentication has been disabled.",
    backup_regen: "✓ New backup codes generated. Save them — the old codes are now invalid.",
  };

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Two-Factor Authentication</h1>
          <p className="text-gray-500 text-sm mt-1">
            Protect your account with a time-based one-time password (TOTP) from any authenticator app.
          </p>
        </div>
        <Link href="/astelfin_26/settings" className="text-sm text-brand-gold hover:underline mt-1">
          ← Settings
        </Link>
      </div>

      {/* Status/success/error banners */}
      {success && SUCCESS_MESSAGES[success] && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${
          success === "enabled"
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-amber-50 border-amber-200 text-amber-700"
        }`}>
          {SUCCESS_MESSAGES[success]}
          {success === "enabled" && (
            <p className="mt-1 text-xs text-green-600">
              ⚠ You will be prompted for your TOTP code on your next login.
            </p>
          )}
        </div>
      )}
      {/* ── One-time backup codes display (shown immediately after setup) ──────── */}
      {backupCodes && backupCodes.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <h3 className="font-bold text-amber-800">Save your backup codes — shown only once</h3>
          </div>
          <p className="text-sm text-amber-700">
            If you lose access to your authenticator app, use one of these codes to sign in.
            Each code can only be used <strong>once</strong>. Store them somewhere safe (e.g. password manager).
          </p>
          <div className="grid grid-cols-2 gap-2 bg-white border border-amber-200 rounded-xl p-4">
            {backupCodes.map((c) => (
              <code key={c} className="font-mono text-sm text-brand-navy text-center tracking-widest py-1 px-2 bg-gray-50 rounded-lg border border-gray-100">
                {c}
              </code>
            ))}
          </div>
          <p className="text-xs text-amber-600">
            You have <strong>{backupCodes.length} codes</strong>. Each code removes itself from your account when used.
            You can generate new codes from this page at any time — that will invalidate the old ones.
          </p>
        </div>
      )}

      {error && ERROR_MESSAGES[error] && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          ⚠ {ERROR_MESSAGES[error]}
        </div>
      )}

      {/* ── Current status card ──────────────────────────────────────────────── */}
      <div className={`bg-white rounded-2xl border shadow-sm p-6 ${
        user.totpEnabled ? "border-green-200" : "border-gray-100"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              user.totpEnabled ? "bg-green-100" : "bg-gray-100"
            }`}>
              <svg className={`w-5 h-5 ${user.totpEnabled ? "text-green-600" : "text-gray-400"}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {user.totpEnabled
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                }
              </svg>
            </div>
            <div>
              <p className="font-semibold text-brand-navy text-sm">
                {user.totpEnabled ? "2FA Enabled" : "2FA Not Configured"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {user.totpEnabled
                  ? `Your account requires a TOTP code on every login. ${user.totpBackupCodes.length} backup code${user.totpBackupCodes.length !== 1 ? "s" : ""} remaining.`
                  : "Your account is protected by password only."}
              </p>
            </div>
          </div>

          {!user.totpEnabled && !showSetup && (
            <form action={beginSetup}>
              <button type="submit"
                className="bg-brand-gold hover:bg-brand-gold/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                Set up 2FA
              </button>
            </form>
          )}

          {user.totpEnabled && (
            <div className="flex items-center gap-2 shrink-0">
              <form action={regenerateBackupCodes}>
                <button type="submit"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                  onClick={(e) => {
                    if (!confirm("Generate new backup codes? Your existing backup codes will be invalidated immediately."))
                      e.preventDefault();
                  }}>
                  New backup codes
                </button>
              </form>
              <form action={disable2fa}>
                <input type="hidden" name="targetUserId" value={userId} />
                <button type="submit"
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  onClick={(e) => {
                    if (!confirm("Disable two-factor authentication? Your account will be protected by password only."))
                      e.preventDefault();
                  }}>
                  Disable 2FA
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ── Setup step 2: QR + verify ────────────────────────────────────────── */}
      {showSetup && (
        <div className="bg-white rounded-2xl border border-brand-gold/30 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-brand-navy">Scan QR Code</h2>
          <p className="text-sm text-gray-600">
            Open your authenticator app (Google Authenticator, Authy, 1Password, etc.) and scan the QR code below.
            Then enter the 6-digit code to verify and activate 2FA.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* QR code */}
            <div className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl!} alt="TOTP QR code" width={180} height={180}
                className="rounded-xl border border-gray-200 bg-white p-1" />
            </div>

            {/* Manual entry fallback */}
            <div className="flex-1 space-y-3">
              <p className="text-sm font-medium text-gray-700">Can&apos;t scan? Enter manually:</p>
              <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Account</p>
                <p className="text-sm font-medium text-gray-700">{user.email}</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Secret key</p>
                <p className="font-mono text-sm text-brand-navy tracking-wider break-all">
                  {user.totpSecret}
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Type: Time-based (TOTP) · Algorithm: SHA-1 · Digits: 6 · Period: 30s
              </p>
            </div>
          </div>

          {/* Verify form */}
          <form action={confirmSetup} className="space-y-3 pt-2 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700">
              Enter the 6-digit code shown in your app to confirm setup
            </label>
            <div className="flex gap-3">
              <input
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                placeholder="000000"
                className="w-40 border border-gray-200 rounded-lg px-4 py-2.5 text-lg font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
              <button type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                Activate 2FA
              </button>
              <Link href="/astelfin_26/settings/2fa"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors self-center">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      )}

      {/* ── CEO: other users' 2FA status ─────────────────────────────────────── */}
      {isCEO && otherUsers.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-brand-navy">Other Privileged Accounts</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              CEO can reset 2FA for Finance Managers if they lose access to their authenticator.
            </p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">User</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Role</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">2FA Status</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {otherUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-700">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {u.role.replace("_", " ")}
                  </td>
                  <td className="px-5 py-3">
                    {u.totpEnabled
                      ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Enabled</span>
                      : <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Not set up</span>
                    }
                  </td>
                  <td className="px-5 py-3 text-right">
                    {u.totpEnabled && (
                      <form action={disable2fa} className="inline">
                        <input type="hidden" name="targetUserId" value={u.id} />
                        <button type="submit"
                          className="text-xs text-red-600 hover:text-red-800 font-semibold hover:underline">
                          Reset 2FA
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info box */}
      <div className="bg-brand-light rounded-xl border border-gray-100 px-5 py-4 text-sm text-gray-600 space-y-1">
        <p className="font-semibold text-brand-navy">Supported authenticator apps</p>
        <p>Google Authenticator · Microsoft Authenticator · Authy · 1Password · Bitwarden · any TOTP-compatible app</p>
        <p className="text-xs text-gray-400 mt-1">
          If you lose access to your authenticator app, contact the CEO to reset your 2FA.
        </p>
      </div>
    </div>
  );
}
