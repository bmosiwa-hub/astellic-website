import { describe, expect, it } from "vitest";
import { can, canEditDocument, canTransition } from "@/lib/hp-hub/permissions";
import { buildCitation, excerpt, slugify, splitList } from "@/lib/hp-hub/text";
import { documentInputSchema, feedbackSchema, submissionSchema } from "@/lib/hp-hub/validation";
import { checkFileMeta, magicBytesMatch, PUBLIC_MAX_BYTES, PUBLIC_MIME_TYPES, safeFileName } from "@/lib/hp-hub/files";
import { buildPrefixQuery, parseSearchParams, renderHighlight, toQueryString } from "@/lib/hp-hub/search";
import { isLikelyBot, referrerHost, visitorHash } from "@/lib/hp-hub/analytics";
import { isPubliclyDownloadable } from "@/lib/hp-hub/visibility";
import { parseCsvRows } from "@/lib/hp-hub/csv";

// ── Permissions ───────────────────────────────────────────────────────────────

describe("HP-Hub permissions", () => {
  it("contributors cannot publish, verify or delete", () => {
    expect(can("CONTRIBUTOR", "document.create")).toBe(true);
    expect(can("CONTRIBUTOR", "document.publish")).toBe(false);
    expect(can("CONTRIBUTOR", "document.verify")).toBe(false);
    expect(can("CONTRIBUTOR", "document.delete")).toBe(false);
  });

  it("editors verify but cannot publish; repo admins publish; only super admins manage members", () => {
    expect(can("EDITOR", "document.verify")).toBe(true);
    expect(can("EDITOR", "document.publish")).toBe(false);
    expect(can("REPO_ADMIN", "document.publish")).toBe(true);
    expect(can("REPO_ADMIN", "members.manage")).toBe(false);
    expect(can("SUPER_ADMIN", "members.manage")).toBe(true);
  });

  it("rejects missing or unknown roles", () => {
    expect(can(null, "document.create")).toBe(false);
    expect(can("CEO" as never, "document.create")).toBe(false);
  });

  it("contributors edit only their own drafts", () => {
    expect(canEditDocument("CONTRIBUTOR", "m1", { createdById: "m1", status: "DRAFT" })).toBe(true);
    expect(canEditDocument("CONTRIBUTOR", "m1", { createdById: "m2", status: "DRAFT" })).toBe(false);
    expect(canEditDocument("CONTRIBUTOR", "m1", { createdById: "m1", status: "PUBLISHED" })).toBe(false);
    expect(canEditDocument("EDITOR", "m1", { createdById: "m2", status: "PUBLISHED" })).toBe(true);
  });

  it("only publishers move records into or out of PUBLISHED/ARCHIVED", () => {
    expect(canTransition("CONTRIBUTOR", "DRAFT", "PENDING_REVIEW")).toBe(true);
    expect(canTransition("CONTRIBUTOR", "PENDING_REVIEW", "PUBLISHED")).toBe(false);
    expect(canTransition("EDITOR", "PENDING_REVIEW", "PUBLISHED")).toBe(false);
    expect(canTransition("REPO_ADMIN", "PENDING_REVIEW", "PUBLISHED")).toBe(true);
    expect(canTransition("EDITOR", "PUBLISHED", "DRAFT")).toBe(false);
    expect(canTransition("REPO_ADMIN", "PUBLISHED", "ARCHIVED")).toBe(true);
  });
});

// ── Text helpers ─────────────────────────────────────────────────────────────

describe("text helpers", () => {
  it("slugifies titles to lowercase URL segments", () => {
    expect(slugify("National HIV/AIDS Strategic Plan 2020–2025")).toBe("national-hiv-aids-strategic-plan-2020-2025");
    expect(slugify("Santé & Nutrition")).toBe("sante-and-nutrition");
    expect(slugify("  ")).toBe("");
  });

  it("splits and de-duplicates lists", () => {
    expect(splitList("HIV; hiv, Malaria\n  TB ")).toEqual(["HIV", "Malaria", "TB"]);
    expect(splitList(undefined)).toEqual([]);
  });

  it("builds a citation with the publisher as institutional author", () => {
    expect(
      buildCitation({
        title: "National Health Financing Strategy",
        authors: [],
        publisherName: "Ministry of Health",
        publicationYear: 2023,
        countryName: "Malawi",
        documentTypeName: "Strategy",
        sourceUrl: "https://example.org/x.pdf",
      }),
    ).toBe("Ministry of Health (2023). National Health Financing Strategy. Malawi. Available at: https://example.org/x.pdf");
    expect(
      buildCitation({ title: "T", authors: ["A", "B", "C", "D"], publisherName: "P", publicationYear: null, countryName: "Malawi", documentTypeName: "Report" }),
    ).toBe("A et al. (n.d.). T. P, Malawi.");
  });

  it("excerpts on a word boundary", () => {
    const text = "word ".repeat(100);
    const out = excerpt(text, 50);
    expect(out.length).toBeLessThanOrEqual(51);
    expect(out.endsWith("…")).toBe(true);
  });
});

// ── Validation ───────────────────────────────────────────────────────────────

const baseDoc = {
  title: "National Health Financing Strategy",
  countryId: "c1",
  documentTypeId: "t1",
  publisherId: "p1",
  accessType: "EXTERNAL",
  permissionStatus: "NOT_REQUIRED",
  sourceUrl: "https://health.gov.mw/strategy.pdf",
  themeIds: [],
};

describe("document validation", () => {
  it("accepts a minimal external-source record", () => {
    const r = documentInputSchema.safeParse(baseDoc);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.language).toBe("English");
      expect(r.data.publicationYear).toBeNull();
    }
  });

  it("requires a file or a source URL", () => {
    const r = documentInputSchema.safeParse({ ...baseDoc, sourceUrl: "" });
    expect(r.success).toBe(false);
  });

  it("refuses to host files without hosting rights", () => {
    const r = documentInputSchema.safeParse({ ...baseDoc, accessType: "HOSTED", hasFile: true, permissionStatus: "UNKNOWN", rightsHolder: "MoH" });
    expect(r.success).toBe(false);
    const ok = documentInputSchema.safeParse({ ...baseDoc, accessType: "HOSTED", hasFile: true, permissionStatus: "GRANTED", rightsHolder: "MoH" });
    expect(ok.success).toBe(true);
  });

  it("requires the rights basis to be recorded for hosted files", () => {
    const r = documentInputSchema.safeParse({ ...baseDoc, accessType: "HOSTED", hasFile: true, permissionStatus: "OPEN_LICENSE" });
    expect(r.success).toBe(false);
  });

  it("rejects non-http URLs, bad years and inverted periods", () => {
    expect(documentInputSchema.safeParse({ ...baseDoc, sourceUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(documentInputSchema.safeParse({ ...baseDoc, publicationYear: "1850" }).success).toBe(false);
    expect(documentInputSchema.safeParse({ ...baseDoc, startYear: "2025", endYear: "2020" }).success).toBe(false);
  });

  it("normalises keywords and authors", () => {
    const r = documentInputSchema.safeParse({ ...baseDoc, keywords: "UHC, uhc; Primary Care", authors: "Banda, J.; Phiri, K." });
    expect(r.success && r.data.keywords).toEqual(["uhc", "primary care"]);
    expect(r.success && r.data.authors).toEqual(["Banda, J.", "Phiri, K."]);
  });

  it("needs a publisher (existing or new)", () => {
    expect(documentInputSchema.safeParse({ ...baseDoc, publisherId: "" }).success).toBe(false);
    expect(documentInputSchema.safeParse({ ...baseDoc, publisherId: "", newPublisherName: "Ministry of Health" }).success).toBe(true);
  });
});

describe("public form validation", () => {
  const sub = { title: "Malaria Strategy", submitterName: "Jane", submitterEmail: "JANE@example.org", sourceUrl: "https://x.org", consent: true };

  it("accepts a valid submission and lowercases the email", () => {
    const r = submissionSchema.safeParse(sub);
    expect(r.success && r.data.submitterEmail).toBe("jane@example.org");
  });

  it("requires consent, a valid email and some way to find the document", () => {
    expect(submissionSchema.safeParse({ ...sub, consent: false }).success).toBe(false);
    expect(submissionSchema.safeParse({ ...sub, submitterEmail: "nope" }).success).toBe(false);
    expect(submissionSchema.safeParse({ ...sub, sourceUrl: "" }).success).toBe(false);
  });

  it("takedown and access requests need an email address", () => {
    expect(feedbackSchema.safeParse({ type: "TAKEDOWN", message: "Please remove this file." }).success).toBe(false);
    expect(feedbackSchema.safeParse({ type: "TAKEDOWN", message: "Please remove this file.", email: "a@b.org" }).success).toBe(true);
    expect(feedbackSchema.safeParse({ type: "CORRECTION", message: "The year should be 2021." }).success).toBe(true);
  });
});

// ── Files ────────────────────────────────────────────────────────────────────

describe("file checks", () => {
  const pdf = new TextEncoder().encode("%PDF-1.7\n%âãÏÓ\n1 0 obj");
  const zip = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0, 0, 0]);
  const html = new TextEncoder().encode("<!doctype html><script>alert(1)</script>");

  it("matches file signatures to declared types", () => {
    expect(magicBytesMatch("application/pdf", pdf)).toBe(true);
    expect(magicBytesMatch("application/pdf", html)).toBe(false);
    expect(magicBytesMatch("application/vnd.openxmlformats-officedocument.wordprocessingml.document", zip)).toBe(true);
    expect(magicBytesMatch("application/vnd.openxmlformats-officedocument.wordprocessingml.document", pdf)).toBe(false);
  });

  it("enforces type, extension and size for public uploads", () => {
    const opts = { allowed: PUBLIC_MIME_TYPES, maxBytes: PUBLIC_MAX_BYTES };
    expect(checkFileMeta({ name: "a.pdf", size: 1000, type: "application/pdf" }, opts).ok).toBe(true);
    expect(checkFileMeta({ name: "a.exe", size: 1000, type: "application/pdf" }, opts).ok).toBe(false);
    expect(checkFileMeta({ name: "a.xlsx", size: 1000, type: "" }, opts).ok).toBe(false);
    expect(checkFileMeta({ name: "a.pdf", size: PUBLIC_MAX_BYTES + 1, type: "application/pdf" }, opts).ok).toBe(false);
    expect(checkFileMeta({ name: "a.pdf", size: 0, type: "application/pdf" }, opts).ok).toBe(false);
  });

  it("produces safe download file names", () => {
    expect(safeFileName('../../etc/"passwd".pdf')).toBe("etcpasswd.pdf");
    expect(safeFileName("Strategy 2023 (final).PDF")).toBe("Strategy-2023-final.pdf");
  });
});

// ── Search ───────────────────────────────────────────────────────────────────

describe("search helpers", () => {
  it("builds prefix queries without operator injection", () => {
    expect(buildPrefixQuery("malar strat")).toBe("malar:* & strat:*");
    expect(buildPrefixQuery("hiv') | (tb:* & !x")).toBe("hiv:* & tb:*");
    expect(buildPrefixQuery("!!! &&")).toBeNull();
  });

  it("parses query strings defensively", () => {
    const p = parseSearchParams({ q: " malaria ", theme: ["hiv-aids,malaria"], access: ["HOSTED", "BOGUS"], page: "-3", sort: "drop table" });
    expect(p.q).toBe("malaria");
    expect(p.theme).toEqual(["hiv-aids", "malaria"]);
    expect(p.access).toEqual(["HOSTED"]);
    expect(p.page).toBe(1);
    expect(p.sort).toBe("relevance");
    expect(parseSearchParams({}).sort).toBe("newest");
  });

  it("parses and serialises the period-covered filter", () => {
    const p = parseSearchParams({ covers: "2025" });
    expect(p.covers).toBe(2025);
    expect(toQueryString(p)).toBe("?covers=2025");
    expect(parseSearchParams({ covers: "abc" }).covers).toBeUndefined();
  });

  it("round-trips params to a query string", () => {
    const p = parseSearchParams({ q: "tb", type: "policy", yearFrom: "2010" });
    expect(toQueryString(p, { page: 2 })).toBe("?q=tb&type=policy&yearFrom=2010&page=2");
  });

  it("escapes HTML in highlights before adding <mark>", () => {
    expect(renderHighlight("a \u0002<b>x</b>\u0003")).toBe("a <mark>&lt;b&gt;x&lt;/b&gt;</mark>");
  });
});

// ── Analytics & visibility ───────────────────────────────────────────────────

describe("analytics", () => {
  it("filters bots and scripted clients", () => {
    expect(isLikelyBot("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).toBe(true);
    expect(isLikelyBot("curl/8.4.0")).toBe(true);
    expect(isLikelyBot(null)).toBe(true);
    expect(isLikelyBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36")).toBe(false);
  });

  it("hashes visitors per day without storing the IP", () => {
    const a = visitorHash({ ip: "1.2.3.4", userAgent: "UA", documentId: "d", day: "2026-01-01" });
    expect(a).not.toContain("1.2.3.4");
    expect(a).toBe(visitorHash({ ip: "1.2.3.4", userAgent: "UA", documentId: "d", day: "2026-01-01" }));
    expect(a).not.toBe(visitorHash({ ip: "1.2.3.4", userAgent: "UA", documentId: "d", day: "2026-01-02" }));
  });

  it("keeps only external referrer hosts", () => {
    expect(referrerHost("https://www.google.com/search?q=x", "www.astellic.com")).toBe("www.google.com");
    expect(referrerHost("https://www.astellic.com/hp-hub", "www.astellic.com")).toBeNull();
    expect(referrerHost("not a url", null)).toBeNull();
  });
});

describe("visibility", () => {
  const doc = { status: "PUBLISHED", accessType: "HOSTED", permissionStatus: "GRANTED", isSynthetic: false, storagePath: "x" };
  it("serves files only for published hosted records with rights", () => {
    expect(isPubliclyDownloadable(doc)).toBe(true);
    expect(isPubliclyDownloadable({ ...doc, status: "DRAFT" })).toBe(false);
    expect(isPubliclyDownloadable({ ...doc, accessType: "RESTRICTED" })).toBe(false);
    expect(isPubliclyDownloadable({ ...doc, permissionStatus: "UNKNOWN" })).toBe(false);
    expect(isPubliclyDownloadable({ ...doc, storagePath: null })).toBe(false);
    expect(isPubliclyDownloadable({ ...doc, isSynthetic: true })).toBe(false);
  });
});

// ── CSV import ───────────────────────────────────────────────────────────────

describe("CSV import parsing", () => {
  const lookups = {
    countries: [{ id: "mw", slug: "malawi", name: "Malawi", isoCode: "MW" }],
    types: [{ id: "pol", slug: "policy", name: "Policy" }],
    themes: [
      { id: "hf", slug: "health-financing", name: "Health Financing" },
      { id: "hiv", slug: "hiv-aids", name: "HIV/AIDS" },
    ],
    publishers: [{ id: "moh", name: "Ministry of Health", acronym: "MoH" }],
  };

  it("maps headers case-insensitively and resolves lookups", () => {
    const csv = "Title,Country,Document Type,Publisher,Publication Year,Themes,Keywords,Source URL,Access Type\n" +
      'National Health Policy,Malawi,policy,MoH,2018,"Health Financing; HIV/AIDS",uhc; equity,https://x.org/p.pdf,external\n';
    const { rows, errors } = parseCsvRows(csv, lookups);
    expect(errors).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0].input.countryId).toBe("mw");
    expect(rows[0].input.publisherId).toBe("moh");
    expect(rows[0].input.themeIds).toEqual(["hf", "hiv"]);
    expect(rows[0].input.keywords).toEqual(["uhc", "equity"]);
    expect(rows[0].input.accessType).toBe("EXTERNAL");
  });

  it("reports row-level errors instead of importing bad rows", () => {
    const csv = "title,country,document_type,publisher,source_url\nBad row,Atlantis,policy,MoH,https://x.org\nNo source,Malawi,policy,New Publisher,\n";
    const { rows, errors } = parseCsvRows(csv, lookups);
    expect(rows).toHaveLength(0);
    expect(errors.map((e) => e.row)).toEqual([2, 3]);
    expect(errors[0].message).toMatch(/country/i);
  });

  it("refuses HOSTED rows (files can't come from CSV)", () => {
    const csv = "title,country,document_type,publisher,source_url,access_type\nX doc,Malawi,policy,MoH,https://x.org,hosted\n";
    const { errors } = parseCsvRows(csv, lookups);
    expect(errors[0].message).toMatch(/hosted/i);
  });
});
