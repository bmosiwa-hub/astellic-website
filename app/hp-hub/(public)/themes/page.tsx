import type { Metadata } from "next";
import { Breadcrumbs, CountList } from "@/components/hp-hub/ui";
import { getThemesWithCounts } from "@/lib/hp-hub/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Health themes",
  description: "Browse African health policy documents by theme, from health financing and governance to HIV/AIDS, malaria and digital health.",
  alternates: { canonical: "/hp-hub/themes" },
};

export default async function ThemesPage() {
  const themes = await getThemesWithCounts();
  return (
    <div className="px-4 sm:px-6 py-10 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ label: "HP-Hub", href: "/hp-hub" }, { label: "Themes" }]} />
        <h1 className="text-3xl md:text-4xl font-bold text-brand-navy mt-4 mb-3">Health themes</h1>
        <p className="text-brand-muted text-lg max-w-2xl mb-10">
          Documents can belong to several themes. Themes with published documents are listed first; the rest are still being catalogued.
        </p>
        <CountList columns={3} items={[...themes].sort((a, b) => Number(b.count > 0) - Number(a.count > 0)).map((t) => ({ key: t.slug, label: t.name, count: t.count }))} hrefFor={(s) => `/hp-hub/themes/${s}`} />
      </div>
    </div>
  );
}
