import Link from "next/link";
import type { ListDocument } from "@/lib/hp-hub/queries";
import { excerpt } from "@/lib/hp-hub/text";
import { AccessBadge } from "./ui";

export type DocumentRowData = ListDocument & {
  highlightTitle?: string | null;
  highlightSnippet?: string | null;
};

/**
 * Editorial document listing: a ruled list, not cards. Highlight HTML comes
 * from lib/hp-hub/search.ts renderHighlight(), which escapes everything except
 * the <mark> tags it inserts.
 */
export function DocumentList({ docs, showCountry = false, compact = false }: { docs: DocumentRowData[]; showCountry?: boolean; compact?: boolean }) {
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

export function DocumentRow({ doc, showCountry, compact }: { doc: DocumentRowData; showCountry?: boolean; compact?: boolean }) {
  const meta = [
    doc.publisher.acronym || doc.publisher.name,
    doc.publicationYear ? String(doc.publicationYear) : null,
    showCountry ? doc.country.name : null,
  ].filter(Boolean);

  return (
    <article className={compact ? "py-4" : "py-6"}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-teal">{doc.documentType.name}</span>
        {doc.isSynthetic && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-1.5 py-0.5 rounded">Synthetic test record</span>
        )}
      </div>
      <h3 className={`${compact ? "text-base" : "text-lg"} font-semibold leading-snug text-brand-navy`}>
        <Link href={`/hp-hub/documents/${doc.slug}`} className="hover:text-brand-teal transition-colors [&_mark]:bg-brand-gold/25 [&_mark]:text-inherit [&_mark]:rounded-sm">
          {doc.highlightTitle ? <span dangerouslySetInnerHTML={{ __html: doc.highlightTitle }} /> : doc.title}
        </Link>
      </h3>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-brand-muted">
        <span>{meta.join(" · ")}</span>
        {!compact && <AccessBadge access={doc.accessType} />}
      </div>
      {!compact && (doc.highlightSnippet || doc.description || doc.abstract) && (
        <p className="mt-2.5 text-[15px] leading-relaxed text-gray-600 max-w-3xl [&_mark]:bg-brand-gold/25 [&_mark]:text-inherit [&_mark]:rounded-sm">
          {doc.highlightSnippet ? (
            <span dangerouslySetInnerHTML={{ __html: doc.highlightSnippet }} />
          ) : (
            excerpt(doc.description || doc.abstract, 240)
          )}
        </p>
      )}
      {!compact && doc.themes.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {doc.themes.map(({ theme }) => (
            <li key={theme.slug}>
              <Link href={`/hp-hub/themes/${theme.slug}`} className="text-xs text-brand-muted hover:text-brand-teal">
                {theme.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
