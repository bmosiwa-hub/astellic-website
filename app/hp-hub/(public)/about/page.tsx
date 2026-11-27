import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/hp-hub/ui";
import { ACCESS_DESCRIPTIONS, ACCESS_LABELS, VERIFICATION_LABELS } from "@/lib/hp-hub/constants";

export const metadata: Metadata = {
  title: "About the repository",
  description: "How the Health Policy Intelligence Hub catalogues, verifies and provides access to African health policy documents, and how to request corrections or removal.",
  alternates: { canonical: "/hp-hub/about" },
};

const VERIFICATION_TEXT: Record<keyof typeof VERIFICATION_LABELS, string> = {
  VERIFIED: "Checked against an authoritative source (for example the issuing ministry) for authenticity, version and details.",
  PENDING_VERIFICATION: "The record is published but its details are still being checked.",
  UNVERIFIED: "Catalogued from the best available information; not yet checked against an authoritative source.",
  DISPUTED: "Someone has questioned the record's details or authenticity, and we are reviewing it.",
};

export default function AboutPage() {
  return (
    <div className="px-6 py-12">
      <article className="max-w-3xl mx-auto">
        <Breadcrumbs items={[{ label: "HP-Hub", href: "/hp-hub" }, { label: "About" }]} />
        <p className="text-brand-gold text-sm font-bold uppercase tracking-[0.2em] mt-8 mb-3">Evidence. Policy. Knowledge. Access.</p>
        <h1 className="text-3xl md:text-4xl font-bold text-brand-navy mb-6">About the repository</h1>
        <div className="text-[17px] leading-relaxed text-gray-700 space-y-5">
          <p>
            The Health Policy Intelligence Hub (HP-Hub) is a curated repository of African health policy documents and grey
            literature, maintained by <Link href="/" className="text-brand-teal underline-offset-4 hover:underline">Astellic</Link>.
            It starts with Malawi and is built to add more countries over time.
          </p>
          <p>HP-Hub has three purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-brand-navy">Discover:</strong> make policies, strategies, guidelines, research and
              evaluations easier to find.
            </li>
            <li>
              <strong className="text-brand-navy">Understand:</strong> organise them by country, theme, institution, period
              and type, so the shape of the policy landscape is visible.
            </li>
            <li>
              <strong className="text-brand-navy">Intelligence:</strong> over time, add policy tracking, comparison and
              expert analysis on top of this evidence base.
            </li>
          </ul>
        </div>

        <h2 className="text-2xl font-bold text-brand-navy mt-14 mb-4">Access and copyright</h2>
        <p className="text-[17px] leading-relaxed text-gray-700 mb-6">
          A document being available online doesn&rsquo;t mean we may republish it. Each record is one of three access types:
        </p>
        <dl className="border-t border-gray-200">
          {(Object.keys(ACCESS_LABELS) as (keyof typeof ACCESS_LABELS)[]).map((k) => (
            <div key={k} className="grid sm:grid-cols-[12rem_minmax(0,1fr)] gap-2 sm:gap-6 py-4 border-b border-gray-200">
              <dt className="font-semibold text-brand-navy">{ACCESS_LABELS[k]}</dt>
              <dd className="text-gray-700">{ACCESS_DESCRIPTIONS[k]}</dd>
            </div>
          ))}
        </dl>
        <p className="text-[17px] leading-relaxed text-gray-700 mt-6">
          Each record names the rights holder and source where known. Copyright stays with the original publisher.
        </p>

        <h2 className="text-2xl font-bold text-brand-navy mt-14 mb-4">Verification</h2>
        <dl className="border-t border-gray-200">
          {(Object.keys(VERIFICATION_TEXT) as (keyof typeof VERIFICATION_TEXT)[]).map((k) => (
            <div key={k} className="grid sm:grid-cols-[12rem_minmax(0,1fr)] gap-2 sm:gap-6 py-4 border-b border-gray-200">
              <dt className="font-semibold text-brand-navy">{VERIFICATION_LABELS[k]}</dt>
              <dd className="text-gray-700">{VERIFICATION_TEXT[k]}</dd>
            </div>
          ))}
        </dl>

        <h2 className="text-2xl font-bold text-brand-navy mt-14 mb-4" id="takedown">
          Corrections and takedown requests
        </h2>
        <div className="text-[17px] leading-relaxed text-gray-700 space-y-4">
          <p>
            Every document page has a form to report an error or a broken link, request access, or ask for removal. If you
            hold the rights to a document and want it removed or changed, choose <em>Rights holder: request removal</em>{" "}
            on that document&rsquo;s page. We review these requests promptly and reply by email.
          </p>
          <p>
            For anything else, <Link href="/contact" className="text-brand-teal underline-offset-4 hover:underline">contact Astellic</Link>.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-brand-navy mt-14 mb-4">Privacy</h2>
        <p className="text-[17px] leading-relaxed text-gray-700">
          We count downloads to understand which documents are useful. Counts are anonymous: we record the date, the
          country (from your connection, at country level only) and the referring website, never your IP address or
          identity.
        </p>

        <div className="mt-14 pt-8 border-t border-gray-200 flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold">
          <Link href="/hp-hub/search" className="text-brand-teal hover:text-brand-navy">
            Search the repository →
          </Link>
          <Link href="/hp-hub/submit" className="text-brand-teal hover:text-brand-navy">
            Submit a document →
          </Link>
        </div>
      </article>
    </div>
  );
}
