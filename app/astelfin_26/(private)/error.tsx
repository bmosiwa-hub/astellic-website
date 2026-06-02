"use client";

import { useEffect } from "react";

export default function PrivateLayoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Astelfin IMS Error]", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white border border-red-100 rounded-2xl shadow-sm p-8 text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Something went wrong</h2>
          <p className="text-sm text-gray-500 mt-1">
            An error occurred while loading this page. Please try again.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 mt-2 font-mono">
              Ref: {error.digest}
            </p>
          )}
        </div>
        <button
          onClick={reset}
          className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          Try Again
        </button>
        <a
          href="/astelfin_26/home"
          className="block text-sm text-gray-400 hover:text-brand-navy transition-colors"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
}
