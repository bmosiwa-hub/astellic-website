import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/hp-hub/ui";
import { getCountriesWithCounts } from "@/lib/hp-hub/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Countries",
  description: "Browse health policy documents by country.",
  alternates: { canonical: "/hp-hub/countries" },
};

export default async function CountriesPage() {
  const countries = await getCountriesWithCounts();
  return (
    <div className="px-4 sm:px-6 py-10 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ label: "HP-Hub", href: "/hp-hub" }, { label: "Countries" }]} />
        <h1 className="text-3xl md:text-4xl font-bold text-brand-navy mt-4 mb-2">Countries</h1>
        <p className="text-brand-muted text-lg max-w-2xl mb-8">
          HP-Hub starts with Malawi. More African countries will be added as their collections are catalogued.
        </p>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {countries.map((c) => (
            <li key={c.id}>
              <Link href={`/hp-hub/${c.slug}`} className="group block h-full rounded-lg border border-gray-200 p-5 hover:border-brand-navy hover:shadow-sm transition">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-lg font-bold text-brand-navy group-hover:text-brand-teal">{c.name}</span>
                  <span className="text-sm text-brand-muted">
                    {c.count > 0 ? `${c.count.toLocaleString("en-GB")} ${c.count === 1 ? "document" : "documents"}` : "Collection growing"}
                  </span>
                </span>
                {c.intro && <span className="block text-sm text-brand-muted leading-relaxed mt-2">{c.intro}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
