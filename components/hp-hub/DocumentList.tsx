import Link from "next/link";
import type { ListDocument } from "@/lib/hp-hub/queries";
import { excerpt, fileTypeLabel } from "@/lib/hp-hub/text";

export type DocumentRowData = ListDocument & {
  highlightTitle?: string | null;
  highlightSnippet?: string | null;
};

/**
 * Editorial document listing: a ruled list, not cards. Highlight HTML comes
 * from lib/hp-hub/search.ts renderHighlight(), which escapes everything except
 * the <mark> tags it inserts.
 */
export function DocumentList({ docs, showCountry = true, compact = false }: { docs: DocumentRowData[]; showCountry?: boolean; compact?: boolean }) {
  return (
    <ol className="divide-y divide-gray-100">
      {docs.map((d) => (
        <li key={d.id}>
          <DocumentRow doc={d} showCountry={showCountry} compact={compact} />
        </li>
      ))}
    </ol>
  );
}

/** What the reader can do with the document, in plain words. */
function accessLabel(doc: DocumentRowData): { text: string; tone: string } {
  if (doc.accessType === "HOSTED" && doc.storagePath && (doc.permissionStatus === "GRANTED" || doc.permissionStatus === "OPEN_LICENSE")) {
    return { text: `${fileTypeLabel(doc.fileType, doc.fileName)} download`, tone: "text-brand-teal" };
  }
  if (doc.accessType === "RESTRICTED") return { text: "Request access", tone: "text-amber-800" };
  return { text: "External source ↗", tone: "text-brand-navy" };
}

export function DocumentRow({ doc, showCountry = true, compact }: { doc: DocumentRowData; showCountry?: boolean; compact?: boolean }) {
  const meta = [doc.publisher.acronym || doc.publisher.name, showCountry ? doc.country.name : null, doc.publicationYear ? String(doc.publicationYear) : null].filter(Boolean);
  const access = accessLabel(doc);
  const href = `/hp-hub/documents/${doc.slug}`;
  const summary = doc.highlightSnippet ?? null;
  const plain = summary ? null : excerpt(doc.description || doc.abstract, compact ? 140 : 220);

  return (
    <article className={compact ? "py-4" : "py-5 sm:py-6"}>
      <h3 className={`${compact ? "text-base" : "text-lg"} font-semibold leading-snug text-brand-navy`}>
        <Link href={href} className="hover:text-brand-teal transition-colors [&_mark]:bg-brand-gold/25 [&_mark]:text-inherit [&_mark]:rounded-sm">
          {doc.highlightTitle ? <span dangerouslySetInnerHTML={{ __html: doc.highlightTitle }} /> : doc.title}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-brand-muted">
        {meta.join(" · ")}
        <span className="text-gray-300" aria-hidden>
          {" "}
          |{" "}
        </span>
        <span className="text-gray-600">{doc.documentType.name}</span>
        {doc.isSynthetic && <span className="ml-2 text-[11px] font-bold uppercase tracking-wider text-red-700">Synthetic test record</span>}
      </p>
      {!compact && doc.themes.length > 0 && (
        <ul className="mt-1 flex flex-wrap gap-x-3" aria-label="Themes">
          {doc.themes.map(({ theme }) => (
            <li key={theme.slug}>
              <Link href={`/hp-hub/themes/${theme.slug}`} className="inline-block py-1 text-xs text-brand-teal hover:underline underline-offset-2">
                {theme.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {(summary || plain) && (
        <p className="mt-2 text-[15px] leading-relaxed text-gray-600 max-w-3xl line-clamp-3 [&_mark]:bg-brand-gold/25 [&_mark]:text-inherit [&_mark]:rounded-sm">
          {summary ? <span dangerouslySetInnerHTML={{ __html: summary }} /> : plain}
        </p>
      )}
      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <Link href={href} className="inline-block py-1.5 font-semibold text-brand-navy hover:text-brand-teal">
          View document →
        </Link>
        <span className={`inline-block py-1 text-xs font-medium ${access.tone}`}>{access.text}</span>
      </p>
    </article>
  );
}
