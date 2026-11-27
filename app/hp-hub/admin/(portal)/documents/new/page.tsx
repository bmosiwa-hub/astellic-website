import DocumentForm, { type DocumentFormValues } from "@/components/hp-hub/admin/DocumentForm";
import { PageHeader, Flash } from "@/components/hp-hub/admin/ui";
import { prisma } from "@/lib/prisma";
import { requireHpPage } from "@/lib/hp-hub/auth";
import { taxonomyOptions, uploadConfig } from "@/lib/hp-hub/admin/options";
import { can } from "@/lib/hp-hub/permissions";

export const metadata = { title: "Add document" };

export default async function NewDocumentPage({ searchParams }: { searchParams: Promise<{ from?: string; ok?: string; submission?: string }> }) {
  const actor = await requireHpPage("document.create");
  const sp = await searchParams;
  const options = await taxonomyOptions();

  // "Save and add another" carries the cataloguing context forward.
  let values: DocumentFormValues = {
    countryId: options.countries[0]?.id,
    accessType: "EXTERNAL",
    permissionStatus: "NOT_REQUIRED",
    language: "English",
  };
  if (sp.from) {
    const prev = await prisma.hpDocument.findUnique({
      where: { id: sp.from },
      select: { countryId: true, documentTypeId: true, publisherId: true, language: true, accessType: true, permissionStatus: true, rightsHolder: true, rightsStatement: true },
    });
    if (prev) values = { ...prev };
  }

  // Cataloguing a public submission: prefill what the submitter told us.
  let fromSubmission: { id: string; fileName: string | null } | undefined;
  if (sp.submission && can(actor.role, "submission.review")) {
    const s = await prisma.hpSubmission.findUnique({ where: { id: sp.submission } });
    if (s) {
      fromSubmission = { id: s.id, fileName: s.storagePath ? s.fileName : null };
      const type = options.types.find((t) => t.name.toLowerCase() === s.documentTypeName?.toLowerCase());
      const pub = s.publisherName
        ? options.publishers.find((p) => [p.name, p.acronym].some((n) => n?.toLowerCase() === s.publisherName!.toLowerCase()))
        : undefined;
      values = {
        ...values,
        title: s.title,
        countryId: s.countryId ?? values.countryId,
        documentTypeId: type?.id,
        publisherId: pub?.id,
        publicationYear: s.year,
        sourceUrl: s.sourceUrl,
        permissionStatus: "UNKNOWN",
        notes: `From public submission by ${s.submitterName} (${s.submitterEmail}).${s.publisherName && !pub ? ` Publisher given: ${s.publisherName}.` : ""}${s.info ? `\n\n${s.info}` : ""}`,
      };
    }
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Add document"
        back={{ href: "/hp-hub/admin/documents", label: "Documents" }}
        description="New records are saved as drafts. A Repository Administrator publishes them after review."
      />
      <Flash ok={sp.ok} />
      <DocumentForm
        values={values}
        {...options}
        canVerify={can(actor.role, "document.verify")}
        canFeature={can(actor.role, "document.publish")}
        upload={uploadConfig("documents")}
        fromSubmission={fromSubmission}
      />
    </div>
  );
}
