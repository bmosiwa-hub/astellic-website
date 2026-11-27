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

const getType = cache((slug: string) => prisma.hpDocumentType.findUnique({ where: { slug } }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const type = await getType((await params).slug);
  if (!type) return { title: "Not found" };
  return {
    title: `${type.name} documents`,
    description: type.description ?? `Health ${type.name.toLowerCase()} documents from Malawi and across Africa.`,
    alternates: { canonical: `/hp-hub/types/${type.slug}` },
  };
}

export default async function TypePage({ params, searchParams }: Props) {
  const type = await getType((await params).slug);
  if (!type) notFound();
  const sp = parseSearchParams(await searchParams);
  return (
    <div className="px-4 sm:px-6 py-10 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ label: "HP-Hub", href: "/hp-hub" }, { label: "Document types", href: "/hp-hub/types" }, { label: type.name }]} />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-muted mt-6 mb-2">Document type</p>
        <h1 className="text-3xl md:text-4xl font-bold text-brand-navy mb-3">{type.name}</h1>
        {type.description && <p className="text-brand-muted text-lg max-w-2xl">{type.description}</p>}
        <div className="mt-10">
          <RepositoryBrowser params={sp} basePath={`/hp-hub/types/${type.slug}`} locked={{ type: [type.slug] }} />
        </div>
      </div>
    </div>
  );
}
