import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import RepositoryBrowser from "@/components/hp-hub/RepositoryBrowser";
import { Breadcrumbs } from "@/components/hp-hub/ui";
import { prisma } from "@/lib/prisma";
import { parseSearchParams } from "@/lib/hp-hub/search";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const getTheme = cache((slug: string) => prisma.hpTheme.findFirst({ where: { slug, isActive: true } }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const theme = await getTheme((await params).slug);
  if (!theme) return { title: "Not found" };
  return {
    title: `${theme.name} — health policy documents`,
    description: theme.description ?? `Policies, strategies, guidelines, reports and research on ${theme.name.toLowerCase()} in Africa.`,
    alternates: { canonical: `/hp-hub/themes/${theme.slug}` },
  };
}

export default async function ThemePage({ params, searchParams }: Props) {
  const theme = await getTheme((await params).slug);
  if (!theme) notFound();
  const sp = parseSearchParams(await searchParams);
  return (
    <div className="px-4 sm:px-6 py-10 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ label: "HP-Hub", href: "/hp-hub" }, { label: "Themes", href: "/hp-hub/themes" }, { label: theme.name }]} />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-muted mt-6 mb-2">Theme</p>
        <h1 className="text-3xl md:text-4xl font-bold text-brand-navy mb-3">{theme.name}</h1>
        {theme.description && <p className="text-brand-muted text-lg max-w-2xl">{theme.description}</p>}
        <div className="mt-10">
          <RepositoryBrowser params={sp} basePath={`/hp-hub/themes/${theme.slug}`} locked={{ theme: [theme.slug] }} />
        </div>
      </div>
    </div>
  );
}
