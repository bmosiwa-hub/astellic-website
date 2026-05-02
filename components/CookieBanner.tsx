"use client";

import { useState, useEffect } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import Link from "next/link";

type Consent = "accepted" | "rejected" | null;

export default function CookieBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cookie-consent") as Consent;
    if (stored === "accepted" || stored === "rejected") {
      setConsent(stored);
    } else {
      // Small delay so banner doesn't flash before hydration
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setConsent("accepted");
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setConsent("rejected");
    setVisible(false);
  };

  return (
    <>
      {/* Load GA only when accepted */}
      {consent === "accepted" && <GoogleAnalytics gaId="G-WGNFBR5C4G" />}

      {/* Banner */}
      {visible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 py-4 md:px-8 md:py-5 bg-brand-navy border-t-2 border-brand-gold shadow-2xl">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center gap-4 md:gap-8">

            {/* Text */}
            <div className="flex-1">
              <p className="text-white text-base leading-relaxed">
                We use cookies to analyse website traffic and improve your
                experience. By accepting, you consent to our use of Google
                Analytics.{" "}
                <Link
                  href="/privacy"
                  className="text-brand-gold underline hover:text-brand-gold/80 transition-colors"
                >
                  Learn more
                </Link>
                .
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={reject}
                className="px-5 py-2.5 rounded-lg border border-white/30 text-white text-base font-medium hover:border-white transition-colors"
              >
                Reject
              </button>
              <button
                onClick={accept}
                className="px-5 py-2.5 rounded-lg bg-brand-gold hover:bg-brand-gold/90 text-white text-base font-medium transition-colors"
              >
                Accept Cookies
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
