import type { Metadata } from "next";
import { Breadcrumbs, CountList } from "@/components/hp-hub/ui";
import { getTypesWithCounts } from "@/lib/hp-hub/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Document types",
  description: "Browse health policy documents by type: policies, strategies, strategic plans, guidelines, legislation, reports, evaluations and more.",
  alternates: { canonical: "/hp-hub/types" },
};

export default async function TypesPage() {
  const types = await getTypesWithCounts();
  return (
    <div className="px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ label: "HP-Hub", href: "/hp-hub" }, { label: "Document types" }]} />
        <h1 className="text-3xl md:text-4xl font-bold text-brand-navy mt-4 mb-3">Document types</h1>
        <p className="text-brand-muted text-lg max-w-2xl mb-10">Every document has one primary type. Counts show published documents.</p>
        <CountList columns={3} items={types.map((t) => ({ key: t.slug, label: t.name, count: t.count }))} hrefFor={(s) => `/hp-hub/types/${s}`} />
      </div>
    </div>
  );
}
