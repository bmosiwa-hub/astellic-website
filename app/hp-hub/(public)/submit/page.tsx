import type { Metadata } from "next";
import SubmitForm from "@/components/hp-hub/SubmitForm";
import { Breadcrumbs } from "@/components/hp-hub/ui";
import { prisma } from "@/lib/prisma";
import { PUBLIC_ACCEPT, PUBLIC_MAX_BYTES, PUBLIC_MIME_TYPES } from "@/lib/hp-hub/files";
import { blobAccess, storageConfigured, uploadPrefix } from "@/lib/hp-hub/storage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Submit a document",
  description: "Suggest a missing health policy document or share a file with Astellic's Health Policy Intelligence Hub. All submissions are reviewed.",
  alternates: { canonical: "/hp-hub/submit" },
};

export default async function SubmitPage() {
  const [countries, types] = await Promise.all([
    prisma.hpCountry.findMany({ orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }], select: { id: true, name: true } }),
    prisma.hpDocumentType.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true } }),
  ]);
  return (
    <div className="px-6 py-12">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-12 lg:gap-20">
        <div>
          <Breadcrumbs items={[{ label: "HP-Hub", href: "/hp-hub" }, { label: "Submit a document" }]} />
          <h1 className="text-3xl md:text-4xl font-bold text-brand-navy mt-4 mb-5">Submit a document to HP-Hub</h1>
          <div className="text-brand-muted leading-relaxed space-y-4">
            <p>
              Much of Africa&rsquo;s health policy evidence is hard to find. If you know of a policy, strategy, guideline,
              report or evaluation that should be in the repository, tell us about it or share the file.
            </p>
            <p>Every submission goes to a review queue. Before publishing, we:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>check the document is genuine and complete</li>
              <li>catalogue its publisher, themes and period</li>
              <li>confirm whether we may host the file, or should link to the source</li>
            </ul>
            <p>We never publish submissions automatically.</p>
          </div>
        </div>
        <div className="lg:pt-10">
          <SubmitForm
            countries={countries}
            documentTypes={types.map((t) => t.name)}
            startedAt={Date.now()}
            upload={
              storageConfigured()
                ? { prefix: uploadPrefix("submissions"), access: blobAccess(), allowed: PUBLIC_MIME_TYPES, accept: PUBLIC_ACCEPT, maxBytes: PUBLIC_MAX_BYTES }
                : null
            }
          />
        </div>
      </div>
    </div>
  );
}
