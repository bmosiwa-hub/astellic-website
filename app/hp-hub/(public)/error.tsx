"use client";

import Link from "next/link";

export default function HpHubError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="px-6 py-24">
      <div className="max-w-xl mx-auto">
        <p className="text-brand-gold text-sm font-bold uppercase tracking-[0.2em] mb-3">HP-Hub</p>
        <h1 className="text-3xl font-bold text-brand-navy mb-4">Something went wrong loading this page</h1>
        <p className="text-brand-muted leading-relaxed mb-8">
          The repository may be briefly unavailable. Please try again in a moment.
        </p>
        <div className="flex flex-wrap gap-4">
          <button onClick={reset} className="h-11 px-6 rounded bg-brand-navy text-white font-semibold text-sm">
            Try again
          </button>
          <Link href="/hp-hub" className="h-11 px-6 rounded border border-gray-300 text-brand-navy font-semibold text-sm inline-flex items-center">
            HP-Hub home
          </Link>
        </div>
      </div>
    </div>
  );
}
