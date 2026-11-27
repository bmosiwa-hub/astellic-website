import DocumentForm, { type DocumentFormValues } from "@/components/hp-hub/admin/DocumentForm";
import { PageHeader, Flash } from "@/components/hp-hub/admin/ui";
import { prisma } from "@/lib/prisma";
import { requireHpPage } from "@/lib/hp-hub/auth";
import { taxonomyOptions, uploadConfig } from "@/lib/hp-hub/admin/options";
import { can } from "@/lib/hp-hub/permissions";

export const metadata = { title: "Add document" };

type SP = {
  from?: string;
  ok?: string;
  submission?: string;
  // Prefill from "Find documents" (via=discover)
  via?: string;
  title?: string;
  sourceUrl?: string;
  countryId?: string;
  year?: string;
  date?: string;
  publisher?: string;
  typeId?: string;
  language?: string;
  description?: string;
  licence?: string;
  rightsHolder?: string;
  note?: string;
};

export default async function NewDocumentPage({ searchParams }: { searchParams: Promise<SP> }) {
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

  // Cataloguing a document found with "Find documents". Everything is only a
  // suggestion the cataloguer reviews; rights start as UNKNOWN on purpose.
  if (sp.via === "discover" && sp.title) {
    const s = (v: string | undefined, max: number) => (v ?? "").trim().slice(0, max) || undefined;
    const pubName = s(sp.publisher, 300);
    const pub = pubName
      ? options.publishers.find((p) => [p.name, p.acronym].some((n) => n?.toLowerCase() === pubName.toLowerCase()))
      : undefined;
    const year = Number(sp.year);
    values = {
      ...values,
      title: s(sp.title, 500),
      sourceUrl: sp.sourceUrl?.startsWith("https://") ? sp.sourceUrl.slice(0, 2000) : undefined,
      countryId: options.countries.some((c) => c.id === sp.countryId) ? sp.countryId : values.countryId,
      documentTypeId: options.types.some((t) => t.id === sp.typeId) ? sp.typeId : undefined,
      publisherId: pub ? pub.id : pubName ? "__new" : undefined,
      newPublisherName: pub ? undefined : pubName,
      publicationYear: Number.isInteger(year) && year > 1900 ? year : null,
      publicationDate: sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : undefined,
      language: s(sp.language, 60) ?? "English",
      description: s(sp.description, 5000) ?? null,
      accessType: "EXTERNAL",
      permissionStatus: "UNKNOWN",
      rightsHolder: s(sp.rightsHolder, 300) ?? null,
      rightsStatement: sp.licence ? `Published under ${s(sp.licence, 200)} (per the source repository).` : null,
      notes: s(sp.note, 2000) ?? null,
    };
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
