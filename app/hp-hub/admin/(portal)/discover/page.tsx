import Link from "next/link";
import { PageHeader, Pill, Flash, Notice, btnPrimary, btnSecondary, inputCls } from "@/components/hp-hub/admin/ui";
import { prisma } from "@/lib/prisma";
import { requireHpPage } from "@/lib/hp-hub/auth";
import { addDiscoveredToTracker } from "@/lib/hp-hub/admin/tracker-actions";
import { ACQUISITION_LABELS, STATUS_LABELS } from "@/lib/hp-hub/constants";
import {
  availableSources,
  discover,
  DISCOVERY_PAGE_SIZE,
  guessDocumentTypeFor,
  matchAgainstHub,
  SOURCES,
  type DiscoveredDoc,
  type HubMatch,
  type SourceId,
} from "@/lib/hp-hub/discovery";
import { can } from "@/lib/hp-hub/permissions";

export const metadata = { title: "Find documents" };
export const maxDuration = 60;

type SP = { q?: string; country?: string; source?: string | string[]; yearFrom?: string; show?: string; page?: string; ok?: string; err?: string };

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<SP> }) {
  const actor = await requireHpPage("acquisition.edit");
  const sp = await searchParams;
  const [countries, types] = await Promise.all([
    prisma.hpCountry.findMany({ orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }], select: { id: true, name: true, isoCode: true, isActive: true } }),
    prisma.hpDocumentType.findMany({ select: { id: true, name: true } }),
  ]);

  const enabled = availableSources();
  const requested = (Array.isArray(sp.source) ? sp.source : sp.source ? [sp.source] : []).filter((s): s is SourceId => enabled.includes(s as SourceId));
  const sources = requested.length ? requested : enabled;
  const country = countries.find((c) => c.id === sp.country) ?? (sp.country === undefined ? countries.find((c) => c.isActive) : undefined);
  const q = (sp.q ?? "").trim().slice(0, 200);
  const yearFrom = Number(sp.yearFrom) >= 1900 && Number(sp.yearFrom) <= 2100 ? Number(sp.yearFrom) : undefined;
  const page = Math.min(Math.max(1, Number(sp.page) || 1), 50);
  const showAll = sp.show === "all";
  const searched = sp.q !== undefined || sp.country !== undefined;

  const outcomes = searched ? await discover({ q, country: country ? { name: country.name, isoCode: country.isoCode } : null, sources, yearFrom, page }) : [];
  const all = outcomes.flatMap((o) => o.items);
  const matches = await matchAgainstHub(all).catch(() => all.map(() => null as HubMatch));
  const rows = all
    .map((item, i) => ({ item, match: matches[i] ?? null }))
    .sort((a, b) => (b.item.year ?? 0) - (a.item.year ?? 0));
  const notInHub = rows.filter((r) => !r.match);
  const shown = showAll ? rows : notInHub;

  // Current search as a URL (without flash messages) for "back" links and paging.
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("country", country?.id ?? "");
  for (const s of requested) params.append("source", s);
  if (yearFrom) params.set("yearFrom", String(yearFrom));
  if (showAll) params.set("show", "all");
  const withPage = (p: number) => {
    const x = new URLSearchParams(params);
    if (p > 1) x.set("page", String(p));
    return `/hp-hub/admin/discover?${x}`;
  };
  const backUrl = withPage(page);
  const morePossible = outcomes.some((o) => o.items.length >= DISCOVERY_PAGE_SIZE);

  const catalogueHref = (d: DiscoveredDoc) => {
    const x = new URLSearchParams({ title: d.title, sourceUrl: d.fileUrl ?? d.pageUrl, via: "discover" });
    if (country) x.set("countryId", country.id);
    if (d.year) x.set("year", String(d.year));
    if (d.date && /^\d{4}-\d{2}-\d{2}$/.test(d.date)) x.set("date", d.date);
    if (d.publisher) x.set("publisher", d.publisher);
    const t = guessDocumentTypeFor(d, types);
    if (t) x.set("typeId", t);
    if (d.language) x.set("language", d.language);
    if (d.summary) x.set("description", d.summary.slice(0, 900));
    if (d.licence) x.set("licence", d.licence);
    if (d.rightsHolder) x.set("rightsHolder", d.rightsHolder);
    x.set("note", `Found via ${SOURCES[d.source].label}: ${d.pageUrl}`);
    return `/hp-hub/admin/documents/new?${x}`;
  };

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Find documents"
        description="Search public repositories for health policy documents that aren't in HP-Hub yet. Results are matched against the catalogue and the Missing Documents tracker."
      />
      <Flash ok={sp.ok} err={sp.err} />

      <form action="/hp-hub/admin/discover" className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 mb-6 space-y-4">
        <div className="grid sm:grid-cols-[minmax(0,1fr)_14rem_8rem] gap-3">
          <div>
            <label htmlFor="q" className="block text-xs font-semibold text-brand-muted mb-1">
              Keywords
            </label>
            <input id="q" name="q" defaultValue={q} placeholder="e.g. health financing strategy, HIV, malaria guidelines" className={inputCls} />
          </div>
          <div>
            <label htmlFor="country" className="block text-xs font-semibold text-brand-muted mb-1">
              Country
            </label>
            <select id="country" name="country" defaultValue={country?.id ?? ""} className={inputCls}>
              <option value="">Any country</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.isActive ? "" : " (not live)"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="yearFrom" className="block text-xs font-semibold text-brand-muted mb-1">
              From year
            </label>
            <input id="yearFrom" name="yearFrom" inputMode="numeric" maxLength={4} defaultValue={yearFrom ?? ""} placeholder="Any" className={inputCls} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="text-xs font-semibold text-brand-muted">Sources</span>
          {enabled.map((s) => (
            <label key={s} className="flex items-center gap-1.5 text-sm text-gray-700">
              <input type="checkbox" name="source" value={s} defaultChecked={sources.includes(s)} className="h-4 w-4 rounded border-gray-300" />
              {SOURCES[s].label}
            </label>
          ))}
          <label className="flex items-center gap-1.5 text-sm text-gray-700 sm:ml-auto">
            <input type="checkbox" name="show" value="all" defaultChecked={showAll} className="h-4 w-4 rounded border-gray-300" />
            Also show documents already in HP-Hub
          </label>
          <button className={btnPrimary}>Search</button>
        </div>
        {!enabled.includes("reliefweb") && (
          <p className="text-xs text-brand-muted">
            ReliefWeb (NGO and UN reports) can be added: request a free app name from ReliefWeb and set it as <code>RELIEFWEB_APPNAME</code> in Vercel.
          </p>
        )}
      </form>

      {!searched && (
        <Notice tone="info">
          Choose a country and add keywords, or just press Search to see recent health documents for {countries.find((c) => c.isActive)?.name ?? "the live country"}.
        </Notice>
      )}

      {searched && (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
            <p className="text-sm text-brand-navy">
              <strong className="tabular-nums">{notInHub.length}</strong> not in HP-Hub
              <span className="text-brand-muted">
                {" "}
                of {rows.length} results on this page{country ? ` for ${country.name}` : ""}
              </span>
            </p>
            <p className="text-xs text-brand-muted">
              {outcomes
                .map((o) => `${SOURCES[o.source].label}: ${o.error ? `unavailable (${o.error})` : o.total !== null ? `${o.total.toLocaleString("en-GB")} matches` : `${o.items.length} on this page`}`)
                .join(" · ")}
            </p>
          </div>

          {outcomes.some((o) => o.error) && (
            <div className="mb-4">
              <Notice tone="warn">Some sources didn&rsquo;t respond. Results from the others are shown; try again shortly.</Notice>
            </div>
          )}

          {shown.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg px-5 py-10 text-center text-sm text-brand-muted">
              {rows.length ? "Everything on this page is already in HP-Hub or the tracker." : "No results. Try broader keywords or another source."}
              {morePossible && (
                <Link href={withPage(page + 1)} className="block mt-3 font-semibold text-brand-teal">
                  Next page →
                </Link>
              )}
            </div>
          ) : (
            <ul className="space-y-3">
              {shown.map(({ item: d, match }) => (
                <li key={`${d.source}-${d.externalId}`} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-brand-teal">{SOURCES[d.source].label}</span>
                    {d.docType && <span className="text-xs text-brand-muted">· {d.docType}</span>}
                    {match?.kind === "document" && <Pill tone="green">In HP-Hub · {STATUS_LABELS[match.status as keyof typeof STATUS_LABELS] ?? match.status}</Pill>}
                    {match?.kind === "tracker" && <Pill tone="amber">In tracker · {ACQUISITION_LABELS[match.status as keyof typeof ACQUISITION_LABELS] ?? match.status}</Pill>}
                    {!match && <Pill tone="blue">Not in HP-Hub</Pill>}
                  </div>
                  <h2 className="font-semibold text-brand-navy leading-snug">
                    <a href={d.pageUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-teal">
                      {d.title}
                    </a>
                  </h2>
                  <p className="text-sm text-brand-muted mt-1">
                    {[d.publisher, d.year, d.language].filter(Boolean).join(" · ")}
                    {d.licence && <span className="ml-2 text-xs">Licence: {d.licence}</span>}
                  </p>
                  {d.summary && <p className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-3">{d.summary}</p>}
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <a href={d.pageUrl} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
                      View at source ↗
                    </a>
                    {d.fileUrl && (
                      <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
                        Open file ↗
                      </a>
                    )}
                    {match ? (
                      <Link href={match.kind === "document" ? `/hp-hub/admin/documents/${match.id}` : `/hp-hub/admin/tracker/${match.id}`} className={btnSecondary}>
                        Open {match.kind === "document" ? "record" : "tracker record"}
                      </Link>
                    ) : (
                      <>
                        {can(actor.role, "document.create") && (
                          <Link href={catalogueHref(d)} className={btnPrimary}>
                            Catalogue
                          </Link>
                        )}
                        {country ? (
                          <form action={addDiscoveredToTracker}>
                            <input type="hidden" name="back" value={backUrl} />
                            <input type="hidden" name="title" value={d.title} />
                            <input type="hidden" name="countryId" value={country.id} />
                            <input type="hidden" name="publisher" value={d.publisher ?? ""} />
                            <input type="hidden" name="year" value={d.year ?? ""} />
                            <input type="hidden" name="sourceUrl" value={d.fileUrl ?? d.pageUrl} />
                            <input type="hidden" name="documentTypeId" value={guessDocumentTypeFor(d, types) ?? ""} />
                            <input
                              type="hidden"
                              name="evidence"
                              value={`Found via ${SOURCES[d.source].label} on ${new Date().toISOString().slice(0, 10)}: ${d.pageUrl}${d.licence ? `. Licence: ${d.licence}` : ""}`}
                            />
                            <button className={btnSecondary}>Add to tracker</button>
                          </form>
                        ) : (
                          <span className="text-xs text-brand-muted">Choose a country to add it to the tracker</span>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center justify-between pt-6">
            {page > 1 ? (
              <Link href={withPage(page - 1)} className={btnSecondary}>
                ← Previous page
              </Link>
            ) : (
              <span />
            )}
            {morePossible && (
              <Link href={withPage(page + 1)} className={btnSecondary}>
                Next page →
              </Link>
            )}
          </div>
          <p className="text-xs text-brand-muted mt-6">
            Being listed at a source doesn&rsquo;t mean HP-Hub may host the file. Catalogue new finds as external-source records
            unless the licence or the rights holder permits hosting.
          </p>
        </>
      )}
    </div>
  );
}
