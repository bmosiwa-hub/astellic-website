"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { signOut } from "next-auth/react";

const WARN_MS   = 4.5 * 60 * 1000; // 4 min 30 sec → show warning
const EXTRA_MS  = 30 * 1000;        // 30 sec more  → auto-logout

export default function InactivityGuard() {
  const [visible, setVisible] = useState(false);
  const [secs, setSecs]       = useState(30);

  const warnRef    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const outRef     = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const tickRef    = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const isWarning  = useRef(false);   // track without triggering re-renders

  /* ── helpers ─────────────────────────────────────────────────────── */

  const clearAll = useCallback(() => {
    clearTimeout(warnRef.current);
    clearTimeout(outRef.current);
    clearInterval(tickRef.current);
  }, []);

  const logout = useCallback(() => {
    clearAll();
    signOut({ callbackUrl: "/astelfin_26/login" });
  }, [clearAll]);

  /** Arm (or re-arm) the inactivity countdown from zero. */
  const arm = useCallback(() => {
    clearAll();
    isWarning.current = false;

    warnRef.current = setTimeout(() => {
      // ── show the warning modal ──
      isWarning.current = true;
      setSecs(30);
      setVisible(true);

      let remaining = 30;
      tickRef.current = setInterval(() => {
        remaining -= 1;
        setSecs(remaining);
        if (remaining <= 0) clearInterval(tickRef.current);
      }, 1000);

      outRef.current = setTimeout(logout, EXTRA_MS);
    }, WARN_MS);
  }, [clearAll, logout]);

  /** Any user activity while warning is NOT showing resets the timer. */
  const onActivity = useCallback(() => {
    if (!isWarning.current) arm();
  }, [arm]);

  /* ── button handlers ─────────────────────────────────────────────── */

  const handleContinue = useCallback(() => {
    setVisible(false);
    arm();
  }, [arm]);

  const handleSignOut = useCallback(() => {
    logout();
  }, [logout]);

  /* ── mount / unmount ─────────────────────────────────────────────── */

  useEffect(() => {
    const EVENTS = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];
    EVENTS.forEach((e) =>
      window.addEventListener(e, onActivity, { passive: true })
    );
    arm(); // start initial timer

    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
      clearAll();
    };
    // arm / onActivity / clearAll are stable (useCallback with no changing deps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── render ──────────────────────────────────────────────────────── */

  if (!visible) return null;

  // Colour shifts from amber → red as countdown nears zero
  const urgent   = secs <= 10;
  const dotColor = urgent ? "bg-red-500" : "bg-orange-400";
  const ringColor = urgent ? "bg-red-100" : "bg-orange-100";
  const textColor = urgent ? "text-red-600" : "text-orange-500";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inactivity-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Progress bar at top */}
        <div className="h-1 bg-gray-100">
          <div
            className={`h-1 transition-all duration-1000 ${urgent ? "bg-red-500" : "bg-orange-400"}`}
            style={{ width: `${(secs / 30) * 100}%` }}
          />
        </div>

        <div className="p-8 text-center space-y-5">
          {/* Icon */}
          <div
            className={`w-16 h-16 rounded-full ${ringColor} flex items-center justify-center mx-auto`}
          >
            <div className={`w-4 h-4 rounded-full ${dotColor} animate-pulse`} />
          </div>

          {/* Copy */}
          <div>
            <h2
              id="inactivity-title"
              className="text-xl font-bold text-brand-navy"
            >
              Still there?
            </h2>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              You've been inactive. For security, you'll be signed out
              in&nbsp;
              <span className={`font-bold tabular-nums ${textColor}`}>
                {secs}&nbsp;second{secs !== 1 ? "s" : ""}
              </span>
              .
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-1">
            <button
              onClick={handleContinue}
              className="w-full bg-brand-gold hover:bg-brand-gold/90 text-white rounded-xl py-3 font-semibold transition-colors"
            >
              Continue Session
            </button>
            <button
              onClick={handleSignOut}
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
