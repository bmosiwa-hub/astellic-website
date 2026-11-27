import type { Metadata } from "next";
import { Suspense } from "react";
import HubFilterPanel from "@/components/hp-hub/HubFilterPanel";
import { HP_HUB_NAME } from "@/lib/hp-hub/constants";
import { headers } from "next/headers";
import { getFilterPanelProps } from "@/lib/hp-hub/queries";
import { hpHubIndexable } from "@/lib/hp-hub/visibility";

export function generateMetadata(): Metadata {
  return {
    title: {
      default: `${HP_HUB_NAME} (HP-Hub) | Astellic`,
      template: "%s | HP-Hub | Astellic",
    },
    description:
      "Discover health policies, strategies, guidelines, research and reports from Malawi and across Africa. A curated resource for researchers, policymakers, practitioners and development partners.",
    openGraph: { siteName: `${HP_HUB_NAME}, Astellic`, type: "website" },
    // Pre-launch: keep HP-Hub out of search engines (see hpHubIndexable).
    ...(hpHubIndexable() ? {} : { robots: { index: false, follow: false } }),
  };
}

/**
 * Every public HP-Hub page gets the "Find documents" panel: a sticky left
 * sidebar from tablet width up (which also covers phones in desktop mode),
 * and a "Find documents" bar under the site header on phones.
 */
export default async function HpHubPublicLayout({ children }: { children: React.ReactNode }) {
  const data = await getFilterPanelProps();
  // The homepage shows the panel open in its own section on phones instead.
  const isHome = ((await headers()).get("x-pathname") ?? "").replace(/\/$/, "") === "/hp-hub";

  return (
    <div className="bg-white md:flex md:items-stretch">
      {data && (
        <aside aria-label="Find documents" className="hidden md:block w-64 lg:w-72 xl:w-80 shrink-0 bg-brand-light border-r border-gray-200">
          <div className="sticky top-[72px] max-h-[calc(100vh-72px)] overflow-y-auto px-5 lg:px-6 py-7">
            <h2 className="text-lg font-bold text-brand-navy mb-5">Find documents</h2>
            <Suspense>
              <HubFilterPanel data={data} idPrefix="side" />
            </Suspense>
          </div>
        </aside>
      )}

      <div className="flex-1 min-w-0">
        {data && !isHome && (
          <details className="md:hidden group/bar border-b border-gray-200 bg-brand-light">
            <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-4 h-12 text-brand-navy">
              <span className="flex items-center gap-2 font-semibold">
                <svg aria-hidden className="w-5 h-5 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M6 12h12M10 19h4" />
                </svg>
                Find documents
              </span>
              <span className="text-xs text-brand-muted group-open/bar:hidden">Search &amp; filter</span>
              <span aria-hidden className="hidden group-open/bar:inline text-brand-muted">✕</span>
            </summary>
            <div className="px-4 pb-6 pt-2">
              <Suspense>
                <HubFilterPanel data={data} idPrefix="mobile" />
              </Suspense>
            </div>
          </details>
        )}
        {children}
      </div>
    </div>
  );
}
