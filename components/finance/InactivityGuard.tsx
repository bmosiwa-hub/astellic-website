"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { signOut, getSession } from "next-auth/react";

const TIMEOUT_MS = 30 * 60 * 1000;    // 30 minutes of inactivity → logout
const WARN_MS    = 29.5 * 60 * 1000;  // show warning at 29 min 30 sec
const WARN_SECS  = 30;                // 30-second countdown before auto-logout
const KEEPALIVE_MS = 60 * 1000;       // roll the server session at most once a minute

const STORAGE_KEY = "astelfin_last_activity";

export default function InactivityGuard() {
  const [visible, setVisible] = useState(false);
  const [secs, setSecs]       = useState(WARN_SECS);

  const warnRef   = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const outRef    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const tickRef   = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const isWarning = useRef(false);
  const lastKeepAlive = useRef(0);

  /** Roll the 5-minute server session forward while the user is genuinely active. */
  const keepAlive = useCallback(() => {
    const now = Date.now();
    if (now - lastKeepAlive.current < KEEPALIVE_MS) return; // throttle
    lastKeepAlive.current = now;
    // Reads /api/auth/session, which re-issues the session cookie (updateAge: 0),
    // extending the expiry. Fails silently when offline — which is correct: with
    // no server reachable, the session should be allowed to lapse.
    getSession().catch(() => {});
  }, []);

  // ── helpers ────────────────────────────────────────────────────────────────

  const clearAll = useCallback(() => {
    clearTimeout(warnRef.current);
    clearTimeout(outRef.current);
    clearInterval(tickRef.current);
  }, []);

  const logout = useCallback(() => {
    clearAll();
    localStorage.removeItem(STORAGE_KEY);
    signOut({ callbackUrl: "/astelfin_26/login" });
  }, [clearAll]);

  const stampActivity = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  }, []);

  /** Returns ms since last recorded activity (or Infinity if never set). */
  const msSinceActivity = useCallback((): number => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return Infinity;
    return Date.now() - parseInt(raw, 10);
  }, []);

  /** Show the 30-second warning modal and start countdown. */
  const showWarning = useCallback(() => {
    isWarning.current = true;
    setSecs(WARN_SECS);
    setVisible(true);

    let remaining = WARN_SECS;
    tickRef.current = setInterval(() => {
      remaining -= 1;
      setSecs(remaining);
      if (remaining <= 0) clearInterval(tickRef.current);
    }, 1000);

    outRef.current = setTimeout(logout, WARN_SECS * 1000);
  }, [logout]);

  /** Arm (or re-arm) the inactivity countdown from zero. */
  const arm = useCallback(() => {
    clearAll();
    isWarning.current = false;
    setVisible(false);

    warnRef.current = setTimeout(() => {
      showWarning();
    }, WARN_MS);
  }, [clearAll, showWarning]);

  /** Called on any user activity. */
  const onActivity = useCallback(() => {
    if (isWarning.current) return; // don't reset while warning is showing
    stampActivity();
    keepAlive();
    arm();
  }, [arm, stampActivity, keepAlive]);

  // ── tab visibility change (handles laptop lid / phone screen) ──────────────

  const onVisibilityChange = useCallback(() => {
    if (document.visibilityState !== "visible") return;

    // Tab just became visible — check how long we were away
    const elapsed = msSinceActivity();

    if (elapsed >= TIMEOUT_MS) {
      // Been away for 5+ minutes → sign out immediately
      logout();
    } else if (elapsed >= WARN_MS) {
      // Been away long enough to warrant the warning
      clearAll();
      showWarning();
    } else {
      // Re-arm with remaining time
      clearAll();
      isWarning.current = false;
      setVisible(false);
      const remaining = WARN_MS - elapsed;
      warnRef.current = setTimeout(() => showWarning(), remaining);
    }
  }, [clearAll, logout, msSinceActivity, showWarning]);

  // ── mount ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    // On mount: always stamp the current time and arm the inactivity timer.
    // We intentionally do NOT check for a stale localStorage value here —
    // performance.now() in Next.js App Router keeps ticking from the initial
    // page load (not from each navigation), so the "freshPageLoad" heuristic
    // was incorrectly firing logout() for users who took > 10 s to reach a
    // private page after logging in.
    // The visibilitychange handler below covers the "returned to old tab" case.
    stampActivity();
    lastKeepAlive.current = Date.now(); // this page load already rolled the session cookie
    arm();

    const EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── button handlers ────────────────────────────────────────────────────────

  const handleContinue = useCallback(() => {
    stampActivity();
    lastKeepAlive.current = 0; // force an immediate session roll
    keepAlive();
    arm();
  }, [arm, stampActivity, keepAlive]);

  // ── render ─────────────────────────────────────────────────────────────────

  if (!visible) return null;

  const urgent    = secs <= 10;
  const dotColor  = urgent ? "bg-red-500"  : "bg-orange-400";
  const ringColor = urgent ? "bg-red-100"  : "bg-orange-100";
  const textColor = urgent ? "text-red-600": "text-orange-500";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inactivity-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className={`h-1 transition-all duration-1000 ${urgent ? "bg-red-500" : "bg-orange-400"}`}
            style={{ width: `${(secs / WARN_SECS) * 100}%` }}
          />
        </div>

        <div className="p-8 text-center space-y-5">
          <div className={`w-16 h-16 rounded-full ${ringColor} flex items-center justify-center mx-auto`}>
            <div className={`w-4 h-4 rounded-full ${dotColor} animate-pulse`} />
          </div>

          <div>
            <h2 id="inactivity-title" className="text-xl font-bold text-brand-navy">
              Still there?
            </h2>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              You&apos;ve been inactive. For security, you&apos;ll be signed out in&nbsp;
              <span className={`font-bold tabular-nums ${textColor}`}>
                {secs}&nbsp;second{secs !== 1 ? "s" : ""}
              </span>.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <button
              onClick={handleContinue}
              className="w-full bg-brand-gold hover:bg-brand-gold/90 text-white rounded-xl py-3 font-semibold transition-colors"
            >
              Continue Session
            </button>
            <button
              onClick={logout}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-semibold transition-colors"
            >
              Sign Out Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
