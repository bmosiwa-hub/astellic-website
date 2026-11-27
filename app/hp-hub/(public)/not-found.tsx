import Link from "next/link";
import HubSearchBar from "@/components/hp-hub/HubSearchBar";

export default function HpHubNotFound() {
  return (
    <div className="px-6 py-24">
      <div className="max-w-2xl mx-auto">
        <p className="text-brand-gold text-sm font-bold uppercase tracking-[0.2em] mb-3">Not found</p>
        <h1 className="text-3xl font-bold text-brand-navy mb-4">We couldn&rsquo;t find that page</h1>
        <p className="text-brand-muted leading-relaxed mb-8">
          The document may have been moved, archived or not yet published. Try searching the repository.
        </p>
        <HubSearchBar size="md" tone="light" />
        <Link href="/hp-hub" className="inline-block mt-6 text-sm font-semibold text-brand-teal hover:text-brand-navy">
          ← HP-Hub home
        </Link>
      </div>
    </div>
  );
}
