import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Add Crawler Source | Astelfin IMS",
  robots: { index: false, follow: false },
};

async function createSource(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/intel/sources");

  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const intervalRaw = formData.get("crawlIntervalMins") as string;
  const interval = parseInt(intervalRaw, 10);

  await prisma.crawlerSource.create({
    data: {
      name:             formData.get("name") as string,
      url:              formData.get("url") as string,
      sourceType:       formData.get("sourceType") as any,
      description:      (formData.get("description") as string) || null,
      country:          (formData.get("country") as string) || "Malawi",
      tags,
      crawlIntervalMins: isNaN(interval) ? 360 : interval,
      active:           true,
    },
  });

  redirect("/astelfin_26/intel/sources");
}

const PRESET_SOURCES = [
  {
    name: "ReliefWeb Jobs & Consultancies (Malawi)",
    url:  "https://reliefweb.int/jobs/rss.xml?search=malawi&type=Consultancy",
    type: "RSS",
    tags: "consultancy, evaluation, Malawi",
    interval: 360,
    desc: "ReliefWeb consultancy and job listings filtered for Malawi.",
  },
  {
    name: "UNDP Procurement Notices (Malawi)",
    url:  "https://procurement-notices.undp.org/rss.cfm?show=D&country=MW",
    type: "RSS",
    tags: "procurement, consultancy, UNDP, Malawi",
    interval: 360,
    desc: "UNDP procurement notices for Malawi.",
  },
  {
    name: "Devex Opportunities",
    url:  "https://www.devex.com/jobs/rss",
    type: "RSS",
    tags: "development, consultancy, evaluation",
    interval: 720,
    desc: "Devex job and consultancy feed — filter in AI for Malawi relevance.",
  },
  {
    name: "World Bank Procurement (Malawi)",
    url:  "https://projects.worldbank.org/en/projects-operations/procurement?mc_whereopr=MW&lang=en",
    type: "HTML",
    tags: "World Bank, procurement, consultancy, Malawi",
    interval: 720,
    desc: "World Bank procurement notices for Malawi (HTML scrape).",
  },
  {
    name: "FCDO Find a Tender (Development)",
    url:  "https://www.find-tender.service.gov.uk/Search/Results?keyword=malawi&publishedFrom=&publishedTo=",
    type: "HTML",
    tags: "FCDO, consultancy, evaluation, Malawi, UK Aid",
    interval: 720,
    desc: "FCDO (UK Aid) tender notices mentioning Malawi.",
  },
  {
    name: "GIZ Tenders & Consultancies",
    url:  "https://www.giz.de/en/worldwide/1475.html",
    type: "HTML",
    tags: "GIZ, consultancy, technical assistance",
    interval: 1440,
    desc: "GIZ international tender notices.",
  },
  {
    name: "Global Fund Procurement",
    url:  "https://www.theglobalfund.org/en/procurement/",
    type: "HTML",
    tags: "Global Fund, health, consultancy",
    interval: 1440,
    desc: "Global Fund procurement and consulting opportunities.",
  },
  {
    name: "UNICEF Supply & Procurement",
    url:  "https://www.unicef.org/supply/procurement-opportunities",
    type: "HTML",
    tags: "UNICEF, human development, consultancy",
    interval: 1440,
    desc: "UNICEF procurement and consultancy opportunities.",
  },
];

export default async function NewSourcePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/intel/sources");

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/astelfin_26/intel" className="hover:text-brand-navy">Intelligence Feed</Link>
        <span>/</span>
        <Link href="/astelfin_26/intel/sources" className="hover:text-brand-navy">Sources</Link>
        <span>/</span>
        <span className="text-brand-navy font-medium">Add Source</span>
      </div>

      <h1 className="text-2xl font-bold text-brand-navy">Add Crawler Source</h1>

      {/* Quick-add presets */}
      <div className="bg-brand-light rounded-xl px-5 py-4">
        <p className="text-sm font-bold text-brand-navy mb-3">Quick-add Malawi-focused presets</p>
        <div className="space-y-2">
          {PRESET_SOURCES.map((p) => (
            <form key={p.url} action={createSource} className="flex items-center gap-3">
              <input type="hidden" name="name" value={p.name} />
              <input type="hidden" name="url" value={p.url} />
              <input type="hidden" name="sourceType" value={p.type} />
              <input type="hidden" name="description" value={p.desc} />
              <input type="hidden" name="country" value="Malawi" />
              <input type="hidden" name="tags" value={p.tags} />
              <input type="hidden" name="crawlIntervalMins" value={String(p.interval)} />
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-navy">{p.name}</p>
                <p className="text-xs text-brand-muted">{p.desc}</p>
              </div>
              <button type="submit"
                className="text-xs font-semibold text-brand-gold hover:underline shrink-0">
                Add →
              </button>
            </form>
          ))}
        </div>
      </div>

      {/* Manual form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6">
        <h2 className="text-base font-bold text-brand-navy mb-5">Or add a custom source</h2>
        <form action={createSource} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-1">Source Name *</label>
            <input name="name" required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
              placeholder="e.g. ReliefWeb Malawi Consultancies" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-1">URL *</label>
            <input name="url" type="url" required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
              placeholder="https://..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1">Source Type *</label>
              <select name="sourceType" required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-white">
                <option value="RSS">RSS / Atom Feed</option>
                <option value="HTML">HTML (Cheerio)</option>
                <option value="PLAYWRIGHT">HTML + JS (Playwright)</option>
                <option value="WPJOBS">WP Job Manager (REST API)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1">Crawl Interval</label>
              <select name="crawlIntervalMins"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 bg-white">
                <option value="60">Every 1 hour</option>
                <option value="180">Every 3 hours</option>
                <option value="360" selected>Every 6 hours</option>
                <option value="720">Every 12 hours</option>
                <option value="1440">Daily</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-1">Country Focus</label>
            <input name="country" defaultValue="Malawi"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-1">
              AI Hint Tags
              <span className="text-xs font-normal text-gray-400 ml-1">(comma-separated, e.g. consultancy, evaluation, health)</span>
            </label>
            <input name="tags"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
              placeholder="consultancy, evaluation, Malawi, health" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-1">Description</label>
            <textarea name="description" rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 resize-none"
              placeholder="Optional: what this source covers" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors">
              Add Source
            </button>
            <Link href="/astelfin_26/intel/sources"
              className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
