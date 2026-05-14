import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sign2faCookie, COOKIE_NAME } from "@/lib/totp";
import { verifyTotpToken } from "@/lib/totp-server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const metadata = {
  title: "Two-Factor Authentication | Astelfin IMS",
  robots: { index: false, follow: false },
};

async function verifyCode(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const code  = (formData.get("code") as string ?? "").replace(/\s/g, "");
  const next  = (formData.get("next") as string) || "/astelfin_26/dashboard";

  if (!/^\d{6}$/.test(code)) {
    redirect(`/astelfin_26/2fa?next=${encodeURIComponent(next)}&error=invalid`);
  }

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { totpSecret: true, totpEnabled: true },
  });

  if (!user?.totpEnabled || !user.totpSecret) {
    // 2FA not set up — just pass through
    redirect(next);
  }

  const valid = verifyTotpToken(user.totpSecret, code);
  if (!valid) {
    redirect(`/astelfin_26/2fa?next=${encodeURIComponent(next)}&error=wrong_code`);
  }

  // Set signed HttpOnly cookie
  const cookieValue = await sign2faCookie(session.user.id);
  const jar = await cookies();
  jar.set(COOKIE_NAME, cookieValue, {
    httpOnly: true,
    sameSite: "strict",
    secure:   process.env.NODE_ENV === "production",
    maxAge:   8 * 60 * 60, // 8 hours — matches JWT maxAge
    path:     "/",
  });

  redirect(next);
}

export default async function TwoFactorPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  // If 2FA not enabled, skip this page
  if (!session.user.totpEnabled) redirect("/astelfin_26/dashboard");

  const { next, error } = await searchParams;
  const destination = next || "/astelfin_26/dashboard";

  const ERROR_MESSAGES: Record<string, string> = {
    invalid:    "Please enter a valid 6-digit code.",
    wrong_code: "Incorrect code. Please try again — codes refresh every 30 seconds.",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-navy mb-4">
            <svg className="w-7 h-7 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-brand-navy">Two-Factor Authentication</h1>
          <p className="text-gray-500 text-sm mt-1">Enter the 6-digit code from your authenticator app</p>
        </div>

        {/* Error banner */}
        {error && ERROR_MESSAGES[error] && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            ⚠ {ERROR_MESSAGES[error]}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <form action={verifyCode} className="space-y-5">
            <input type="hidden" name="next" value={destination} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                autoFocus
                placeholder="000000"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-xl font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
              <p className="text-xs text-gray-400 mt-1.5 text-center">Refreshes every 30 seconds</p>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-gold hover:bg-brand-gold/90 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Verify &amp; Continue
            </button>
          </form>
        </div>

        {/* Signed in as */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Signed in as <strong className="text-gray-600">{session.user.email}</strong>
        </p>

      </div>
    </div>
  );
}
