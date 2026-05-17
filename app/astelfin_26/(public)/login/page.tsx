"use client";

import { useState, FormEvent, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCountdown(ms: number): string {
  const totalSecs = Math.max(0, Math.ceil(ms / 1000));
  const mins      = Math.floor(totalSecs / 60);
  const secs      = totalSecs % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") ?? "/astelfin_26/home";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  // Lockout UI state
  const [locked,       setLocked]       = useState(false);
  const [lockedUntil,  setLockedUntil]  = useState<Date | null>(null);
  const [countdown,    setCountdown]    = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  // Count down while locked
  useEffect(() => {
    if (!lockedUntil) return;
    const tick = setInterval(() => {
      const remaining = lockedUntil.getTime() - Date.now();
      if (remaining <= 0) {
        setLocked(false);
        setLockedUntil(null);
        setCountdown("");
        setError("");
        clearInterval(tick);
      } else {
        setCountdown(formatCountdown(remaining));
      }
    }, 500);
    return () => clearInterval(tick);
  }, [lockedUntil]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (locked) return;

    setError("");
    setLoading(true);

    // Pass IP and UA via hidden credentials fields so auth.ts can log them.
    // The browser can't reliably get its own public IP, so we pass a sentinel;
    // the real IP is read server-side from x-forwarded-for in API routes.
    const result = await signIn("credentials", {
      email,
      password,
      ipAddress: "client",          // overridden server-side from headers
      userAgent: navigator.userAgent,
      redirect:  false,
    });

    setLoading(false);

    if (!result?.error) {
      router.push(callbackUrl);
      return;
    }

    // Check lockout state from the server
    try {
      const res = await fetch(`/api/astelfin_26/auth/lockout-status?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json() as {
          locked: boolean;
          lockedUntil?: string;
          attemptsLeft: number;
        };

        if (data.locked && data.lockedUntil) {
          setLocked(true);
          setLockedUntil(new Date(data.lockedUntil));
          setCountdown(formatCountdown(new Date(data.lockedUntil).getTime() - Date.now()));
          setError("");
          return;
        }

        if (data.attemptsLeft <= 2 && data.attemptsLeft > 0) {
          setAttemptsLeft(data.attemptsLeft);
        }
      }
    } catch { /* silently ignore — don't break the login flow */ }

    setError("Invalid email or password.");
  }

  return (
    <div className="w-full max-w-md px-6">
      {/* Brand */}
      <div className="text-center mb-8">
        <p className="text-2xl font-bold text-brand-navy">Astelfin IMS</p>
        <p className="text-sm uppercase tracking-widest text-brand-gold mt-1">
          Integrated Management System
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h1 className="text-xl font-bold text-brand-navy mb-6">Sign In</h1>

        {/* Account locked banner */}
        {locked && lockedUntil && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-4 space-y-1">
            <p className="text-sm font-bold text-red-700 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Account Temporarily Locked
            </p>
            <p className="text-xs text-red-600 leading-relaxed">
              Too many failed attempts. This account is locked for security.
              You may try again in{" "}
              <span className="font-bold tabular-nums">{countdown}</span>.
            </p>
            <p className="text-xs text-red-500">
              If this wasn&apos;t you, contact your system administrator immediately.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              required
              disabled={locked}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setAttemptsLeft(null); }}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="you@astellic.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              disabled={locked}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="space-y-1">
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                {error}
              </p>
              {attemptsLeft !== null && attemptsLeft > 0 && (
                <p className="text-xs text-orange-600 px-1">
                  Warning: {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining before account lockout.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || locked}
            className="w-full bg-brand-navy hover:bg-brand-navy/90 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in…" : locked ? `Locked — try in ${countdown}` : "Sign In"}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Restricted access. Authorised personnel only.
      </p>
    </div>
  );
}
