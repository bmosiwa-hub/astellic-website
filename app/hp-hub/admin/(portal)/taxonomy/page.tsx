import { PageHeader, Panel, Flash, btnSecondary, inputCls } from "@/components/hp-hub/admin/ui";
import { prisma } from "@/lib/prisma";
import { requireHpPage } from "@/lib/hp-hub/auth";
import { rebuildSearchIndex } from "@/lib/hp-hub/admin/document-actions";
import { mergePublisher, saveCountry, saveDocumentType, savePublisher, saveTheme } from "@/lib/hp-hub/admin/settings-actions";

export const metadata = { title: "Taxonomy" };

export default async function TaxonomyPage({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireHpPage("taxonomy.manage");
  const sp = await searchParams;
  const [countries, themes, types, publishers] = await Promise.all([
    prisma.hpCountry.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { documents: true } } } }),
    prisma.hpTheme.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { documents: true } } } }),
    prisma.hpDocumentType.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { documents: true } } } }),
    prisma.hpPublisher.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { documents: true, acquisitions: true } } } }),
  ]);

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader title="Taxonomy" description="Countries, themes, document types and publishers. Slugs (used in public URLs) don't change when you rename themes or types." />
      <Flash ok={sp.ok} err={sp.err} />

      <Panel title="Countries">
        <div id="countries" className="space-y-3">
          {countries.map((c) => (
            <form key={c.id} action={saveCountry} className="grid sm:grid-cols-[1fr_5rem_8rem_auto_auto] gap-2 items-start border-b border-gray-100 pb-3">
              <input type="hidden" name="id" value={c.id} />
              <input name="name" defaultValue={c.name} className={inputCls} aria-label="Name" />
              <input name="isoCode" defaultValue={c.isoCode} maxLength={2} className={inputCls} aria-label="ISO code" />
              <input name="slug" defaultValue={c.slug} className={inputCls} aria-label="URL slug" />
              <label className="flex items-center gap-1.5 text-sm h-10 whitespace-nowrap">
                <input type="checkbox" name="isActive" defaultChecked={c.isActive} /> Live
              </label>
              <button className={btnSecondary}>Save</button>
              <textarea name="intro" defaultValue={c.intro ?? ""} rows={2} placeholder="Public introduction" className={`${inputCls} h-auto py-2 sm:col-span-5`} aria-label="Introduction" />
              <p className="text-xs text-brand-muted sm:col-span-5">{c._count.documents} documents · /hp-hub/{c.slug}</p>
            </form>
          ))}
          <form action={saveCountry} className="grid sm:grid-cols-[1fr_5rem_8rem_auto_auto] gap-2 items-center">
            <input name="name" placeholder="New country" className={inputCls} aria-label="New country name" />
            <input name="isoCode" placeholder="ISO" maxLength={2} className={inputCls} aria-label="ISO code" />
            <input name="slug" placeholder="slug (auto)" className={inputCls} aria-label="URL slug" />
            <label className="flex items-center gap-1.5 text-sm whitespace-nowrap">
              <input type="checkbox" name="isActive" /> Live
            </label>
            <button className={btnSecondary}>Add</button>
          </form>
        </div>
      </Panel>

      <Panel title="Themes">
        <div id="themes" className="space-y-2">
          {themes.map((t) => (
            <form key={t.id} action={saveTheme} className="grid sm:grid-cols-[4rem_1fr_1.4fr_auto_auto] gap-2 items-center">
              <input type="hidden" name="id" value={t.id} />
              <input name="sortOrder" type="number" defaultValue={t.sortOrder} className={inputCls} aria-label="Order" />
              <input name="name" defaultValue={t.name} className={inputCls} aria-label="Name" />
              <input name="description" defaultValue={t.description ?? ""} placeholder={`Description (${t._count.documents} docs)`} className={inputCls} aria-label="Description" />
              <label className="flex items-center gap-1.5 text-sm whitespace-nowrap">
                <input type="checkbox" name="isActive" defaultChecked={t.isActive} /> Active
              </label>
              <button className={btnSecondary}>Save</button>
            </form>
          ))}
          <form action={saveTheme} className="grid sm:grid-cols-[4rem_1fr_1.4fr_auto] gap-2 items-center pt-2 border-t border-gray-100">
            <input name="sortOrder" type="number" placeholder="#" className={inputCls} aria-label="Order" />
            <input name="name" placeholder="New theme" className={inputCls} aria-label="New theme name" />
            <input name="description" placeholder="Description" className={inputCls} aria-label="Description" />
            <button className={btnSecondary}>Add</button>
          </form>
        </div>
      </Panel>

      <Panel title="Document types">
        <div id="types" className="space-y-2">
          {types.map((t) => (
            <form key={t.id} action={saveDocumentType} className="grid sm:grid-cols-[4rem_1fr_1.4fr_auto] gap-2 items-center">
              <input type="hidden" name="id" value={t.id} />
              <input name="sortOrder" type="number" defaultValue={t.sortOrder} className={inputCls} aria-label="Order" />
              <input name="name" defaultValue={t.name} className={inputCls} aria-label="Name" />
              <input name="description" defaultValue={t.description ?? ""} placeholder={`Description (${t._count.documents} docs)`} className={inputCls} aria-label="Description" />
              <button className={btnSecondary}>Save</button>
            </form>
          ))}
          <form action={saveDocumentType} className="grid sm:grid-cols-[4rem_1fr_1.4fr_auto] gap-2 items-center pt-2 border-t border-gray-100">
            <input name="sortOrder" type="number" placeholder="#" className={inputCls} aria-label="Order" />
            <input name="name" placeholder="New type" className={inputCls} aria-label="New type name" />
            <input name="description" placeholder="Description" className={inputCls} aria-label="Description" />
            <button className={btnSecondary}>Add</button>
          </form>
        </div>
      </Panel>

      <Panel title="Publishers">
        <div id="publishers" className="space-y-2">
          {publishers.length === 0 && <p className="text-sm text-brand-muted">Publishers are created when you catalogue documents.</p>}
          {publishers.map((p) => (
            <div key={p.id} className="grid lg:grid-cols-[minmax(0,1fr)_auto] gap-2 border-b border-gray-100 pb-2">
              <form action={savePublisher} className="grid sm:grid-cols-[1.4fr_6rem_1fr_auto] gap-2 items-center">
                <input type="hidden" name="id" value={p.id} />
                <input name="name" defaultValue={p.name} className={inputCls} aria-label="Name" />
                <input name="acronym" defaultValue={p.acronym ?? ""} placeholder="Acronym" className={inputCls} aria-label="Acronym" />
                <input name="website" defaultValue={p.website ?? ""} placeholder="https://" className={inputCls} aria-label="Website" />
                <button className={btnSecondary}>Save</button>
              </form>
              <form action={mergePublisher} className="flex gap-2 items-center">
                <input type="hidden" name="id" value={p.id} />
                <select name="into" defaultValue="" className={`${inputCls} w-44`} aria-label="Merge into">
                  <option value="" disabled>
                    Merge into…
                  </option>
                  {publishers
                    .filter((o) => o.id !== p.id)
                    .map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                </select>
                <button className={btnSecondary}>Merge</button>
                <span className="text-xs text-brand-muted whitespace-nowrap">{p._count.documents} docs</span>
              </form>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Search index">
        <form action={rebuildSearchIndex} className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-brand-muted flex-1">The index updates automatically on every save. Rebuild it only after bulk database changes.</p>
          <button className={btnSecondary}>Rebuild search index</button>
        </form>
      </Panel>
    </div>
  );
}
