/**
 * Malawi-focused source registry for the Astellic Opportunity Intelligence Engine.
 * Sources are fetched from the database (CrawlerSource model), so this file
 * provides the SEED data and helper types, not the live source list.
 *
 * To add a new source: use the IMS Sources page (/astelfin_26/intel/sources/new).
 */

export interface SourceRecord {
  id: string;
  name: string;
  url: string;
  sourceType: "RSS" | "HTML" | "PLAYWRIGHT";
  active: boolean;
  tags: string[];
  crawlIntervalMins: number;
  lastCrawledAt: Date | null;
}

/**
 * Seed data — these are the default sources to insert on first run.
 * The crawler reads live data from the DB; this is only for reference/seeding.
 */
export const DEFAULT_SOURCES = [
  {
    name: "ReliefWeb Consultancies — Malawi",
    url:  "https://reliefweb.int/jobs/rss.xml?search=malawi&type=Consultancy",
    sourceType: "RSS" as const,
    description: "ReliefWeb consultancy listings filtered for Malawi.",
    country: "Malawi",
    tags: ["consultancy", "evaluation", "Malawi"],
    crawlIntervalMins: 360,
  },
  {
    name: "ReliefWeb Jobs — Malawi (All)",
    url:  "https://reliefweb.int/jobs/rss.xml?search=malawi",
    sourceType: "RSS" as const,
    description: "All ReliefWeb job/consultancy listings for Malawi.",
    country: "Malawi",
    tags: ["consultancy", "Malawi"],
    crawlIntervalMins: 360,
  },
  {
    name: "UNDP Procurement — Malawi",
    url:  "https://procurement-notices.undp.org/rss.cfm?show=D&country=MW",
    sourceType: "RSS" as const,
    description: "UNDP procurement notices for Malawi (country code MW).",
    country: "Malawi",
    tags: ["procurement", "consultancy", "UNDP", "Malawi"],
    crawlIntervalMins: 360,
  },
  {
    name: "Devex Development Opportunities",
    url:  "https://www.devex.com/jobs/rss",
    sourceType: "RSS" as const,
    description: "Devex development sector opportunities — AI filters for Malawi relevance.",
    country: "Africa",
    tags: ["development", "consultancy", "evaluation"],
    crawlIntervalMins: 720,
  },
  {
    name: "FCDO Find a Tender — Malawi",
    url:  "https://www.find-tender.service.gov.uk/Search/Results?keyword=malawi",
    sourceType: "HTML" as const,
    description: "UK FCDO (formerly DFID) tender notices mentioning Malawi.",
    country: "Malawi",
    tags: ["FCDO", "consultancy", "evaluation", "Malawi", "UK Aid"],
    crawlIntervalMins: 720,
  },
  {
    name: "Global Fund — Malawi Grants",
    url:  "https://www.theglobalfund.org/en/portfolio/country/?k=8BF50D84-3574-4A64-BB11-43FA4E8C4B59",
    sourceType: "HTML" as const,
    description: "Global Fund grant and procurement notices for Malawi.",
    country: "Malawi",
    tags: ["Global Fund", "health", "grant", "Malawi"],
    crawlIntervalMins: 1440,
  },
  {
    name: "USAID Business Forecast — Malawi",
    url:  "https://sam.gov/api/prod/sgs/v1/search/?index=_all&q=malawi&page=0&mode=search&is_active=true&organizationId=USAID",
    sourceType: "HTML" as const,
    description: "USAID SAM.gov forecast for Malawi contracts and grants.",
    country: "Malawi",
    tags: ["USAID", "consultancy", "grant", "Malawi"],
    crawlIntervalMins: 1440,
  },
  {
    name: "African Development Bank — Malawi",
    url:  "https://www.afdb.org/en/procurement/afdb-financed-projects/current-procurement?field_country_code=MW",
    sourceType: "HTML" as const,
    description: "AfDB procurement notices for Malawi-financed projects.",
    country: "Malawi",
    tags: ["AfDB", "procurement", "consultancy", "Malawi"],
    crawlIntervalMins: 1440,
  },
];
