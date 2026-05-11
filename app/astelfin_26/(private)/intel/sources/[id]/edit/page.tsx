import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Edit Source | Astelfin IMS",
  robots: { index: false, follow: false },
};

async function updateSource(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/intel/sources");

  const id       = formData.get("id") as string;
  const tagsRaw  = formData.get("tags") as string;
  const tags     = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const interval = parseInt(formData.get("crawlIntervalMins") as string, 10);

  await prisma.crawlerSource.update({
    where: { id },
    data: {
      name:             formData.get("name") as string,
      url:              formData.get("url") as string,
      sourceType:       formData.get("sourceType") as any,
      description:      (formData.get("description") as string) || null,
      country:          (formData.get("country") as string) || "Malawi",
      tags,
      crawlIntervalMins: isNaN(interval) ? 360 : interval,
    },
  });

  redirect("/astelfin_26/intel/sources");
}

async function deleteSource(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/intel/sources");
  const id = formData.get("id") as string;
  await prisma.crawlerSource.delete({ where: { id } });
  redirect("/astelfin_26/intel/sources");
}

export default async function EditSourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ confirm?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/intel/sources");

  const { id }      = await params;
  const { confirm } = await searchParams;

  const source = await prisma.crawlerSource.findUnique({
    where: { id },
    include: { _count: { select: { discoveries: true } } },
  });
  if (!source) redirect("/astelfin_26/intel/sources");

  const confirmDelete = confirm === "delete";

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/astelfin_26/intel" className="hover:text-brand-navy">Intelligence Feed</Link>
        <span>/</span>
        <Link href="/astelfin_26/intel/sources" className="hover:text-brand-navy">Sources</Link>
        <span>/</span>
        <span className="text-brand-navy font-medium">Edit Source</span>
      </div>

      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold text-brand-navy">Edit Source</h1>
        <span className="text-xs text-gray-400 mt-2">{source._count.discoveries} discoveries</span>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6">
        <form action={updateSource} className="space-y-4">
          <input type="hidden" name="id" value={source.id} />

          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-1">Source Name *</label>
            <input name="name" required defaultValue={source.name}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-1">URL *</label>
            <input name="url" type="url" required defaultValue={source.url}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1">Source Type *</label>
              <select name="sourceType" required defaultValue={source.sourceType}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-white">
                <option value="RSS">RSS / Atom Feed</option>
                <option value="HTML">HTML (Cheerio)</option>
                <option value="PLAYWRIGHT">HTML + JS (Playwright)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1">Crawl Interval</label>
              <select name="crawlIntervalMins" defaultValue={source.crawlIntervalMins}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-white">
                <option value="60">Every 1 hour</option>
                <option value="180">Every 3 hours</option>
                <option value="360">Every 6 hours</option>
                <option value="720">Every 12 hours</option>
                <option value="1440">Daily</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-1">Country Focus</label>
            <input name="country" defaultValue={source.country}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-1">
              AI Hint Tags
              <span className="text-xs font-normal text-gray-400 ml-1">(comma-separated)</span>
            </label>
            <input name="tags" defaultValue={source.tags.join(", ")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
              placeholder="consultancy, evaluation, Malawi, health" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-1">Description</label>
            <textarea name="description" rows={2} defaultValue={source.description ?? ""}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors">
              Save Changes
            </button>
            <Link href="/astelfin_26/intel/sources"
              className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Delete zone */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm px-6 py-5">
        <h2 className="text-sm font-bold text-red-600 mb-1">Delete Source</h2>
        <p className="text-xs text-gray-500 mb-4">
          Removes this source and all its crawl run logs. The {source._count.discoveries} discovered
          opportunit{source._count.discoveries !== 1 ? "ies" : "y"} will remain in the feed.
        </p>

        {confirmDelete ? (
          <div className="flex items-center gap-3">
            <form action={deleteSource}>
              <input type="hidden" name="id" value={source.id} />
              <button type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
                Yes, delete source
              </button>
            </form>
            <Link href={`/astelfin_26/intel/sources/${source.id}/edit`}
              className="text-sm text-gray-500 hover:underline">
              Cancel
            </Link>
          </div>
        ) : (
          <Link href={`/astelfin_26/intel/sources/${source.id}/edit?confirm=delete`}
            className="text-sm font-semibold text-red-500 hover:text-red-700 hover:underline transition-colors">
            Delete this source →
          </Link>
        )}
      </div>
    </div>
  );
}
