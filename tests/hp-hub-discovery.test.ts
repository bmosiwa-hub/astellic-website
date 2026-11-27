import { describe, expect, it } from "vitest";
import { guessDocumentType, guessDocumentTypeFor, normaliseTitle, normaliseUrl, parseReliefWeb, parseWho, parseWorldBank, solrTerms } from "@/lib/hp-hub/discovery";

describe("WHO query safety", () => {
  it("strips query syntax from user keywords", () => {
    expect(solrTerms('health") OR (*:* AND dc.title:x')).toBe("health OR AND dc title x");
    expect(solrTerms("santé maternelle")).toBe("santé maternelle");
  });
});

describe("discovery helpers", () => {
  it("normalises titles and URLs for matching", () => {
    expect(normaliseTitle("  Malawi Health-Sector Strategic Plan III (2023–2030) ")).toBe("malawi health sector strategic plan iii 2023 2030");
    expect(normaliseUrl("https://www.Example.org/Doc/123/")).toBe("example.org/doc/123");
    expect(normaliseUrl("not a url")).toBeNull();
  });

  it("guesses document types from source labels", () => {
    const types = ["Strategy", "Strategic Plan", "Policy", "Evaluation", "Working Paper", "Technical Report", "Other"].map((name, i) => ({ id: String(i), name }));
    const name = (label: string) => types.find((t) => t.id === guessDocumentType(label, types))?.name;
    expect(name("Country Cooperation Strategy")).toBe("Strategy");
    expect(name("Health Sector Strategic Plan")).toBe("Strategic Plan");
    expect(name("Implementation Completion and Results Report")).toBe("Evaluation");
    expect(name("Working Paper")).toBe("Working Paper");
    expect(name("Brochure")).toBe("Other");
  });

  it("falls back to the title when the source label is generic", () => {
    const types = ["Assessment", "Technical Report", "Other", "Working Paper"].map((name, i) => ({ id: String(i), name }));
    const name = (d: { docType: string | null; title: string }) => types.find((t) => t.id === guessDocumentTypeFor(d, types))?.name;
    expect(name({ docType: "Publications", title: "Health financing progress matrix assessment, Malawi 2025" })).toBe("Assessment");
    expect(name({ docType: "Working Paper", title: "An assessment of X" })).toBe("Working Paper");
    expect(name({ docType: "Publications", title: "Focus on Malawi" })).toBe("Technical Report");
  });
});

describe("World Bank parser", () => {
  it("reads documents and skips facet keys", () => {
    const json = {
      total: 375,
      documents: {
        D27757086: {
          id: "27757086",
          display_title: "Malawi - Fiscal space for health",
          docdt: "2017-01-01T05:00:00Z",
          pdfurl: "http://documents.worldbank.org/curated/en/123/pdf/x.pdf",
          url: "http://documents.worldbank.org/curated/en/123",
          docty: "Working Paper",
          abstracts: { "cdata!": "<p>Malawi’s population has grown…</p>" },
        },
        facets: {},
      },
    };
    const { total, items } = parseWorldBank(json);
    expect(total).toBe(375);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ title: "Malawi - Fiscal space for health", year: 2017, publisher: "World Bank", docType: "Working Paper" });
    expect(items[0].fileUrl).toMatch(/^https:\/\//);
    expect(items[0].summary).not.toContain("<p>");
  });
});

describe("WHO IRIS parser", () => {
  const item = (title: string, iso: string[], mesh: string[] = []) => ({
    _embedded: {
      indexableObject: {
        uuid: title,
        name: title,
        handle: "10665/1",
        metadata: {
          "dc.title": [{ value: title }],
          "dc.date.issued": [{ value: "2025-08-07" }],
          "dc.identifier.uri": [{ value: "https://iris.who.int/handle/10665/1" }],
          "dc.rights": [{ value: "CC BY-NC-SA 3.0 IGO" }],
          "dc.rights.holder": [{ value: "World Health Organization" }],
          "who.docsubtype": [{ value: "Country Cooperation Strategy" }],
          "who.country.iso": iso.map((value) => ({ value })),
          "dc.subject.mesh": mesh.map((value) => ({ value })),
        },
      },
    },
  });
  const json = (objs: unknown[]) => ({ _embedded: { searchResult: { page: { totalElements: 2 }, _embedded: { objects: objs } } } });

  it("keeps licence details and filters by country", () => {
    const { items } = parseWho(json([item("Country cooperation strategy, Malawi", ["MW"]), item("Kenya health plan", ["KE"])]), { name: "Malawi", isoCode: "MW" });
    expect(items.map((i) => i.title)).toEqual(["Country cooperation strategy, Malawi"]);
    expect(items[0]).toMatchObject({ year: 2025, licence: "CC BY-NC-SA 3.0 IGO", rightsHolder: "World Health Organization", docType: "Country Cooperation Strategy" });
  });

  it("accepts records that name the country even without an ISO tag", () => {
    const { items } = parseWho(json([item("Regional report", [], ["Malawi", "Health Planning"])]), { name: "Malawi", isoCode: "MW" });
    expect(items).toHaveLength(1);
  });
});

describe("ReliefWeb parser", () => {
  it("reads reports and prefers the PDF file", () => {
    const { total, items } = parseReliefWeb({
      totalCount: 12,
      data: [
        {
          id: 1,
          fields: {
            title: "Malawi: Cholera response plan",
            url_alias: "https://reliefweb.int/report/malawi/x",
            date: { original: "2024-03-01T00:00:00+00:00" },
            source: [{ name: "UNICEF" }, { name: "WHO" }],
            file: [{ url: "https://reliefweb.int/a.docx", mimetype: "application/msword" }, { url: "https://reliefweb.int/b.pdf", mimetype: "application/pdf" }],
          },
        },
      ],
    });
    expect(total).toBe(12);
    expect(items[0]).toMatchObject({ year: 2024, publisher: "UNICEF; WHO", fileUrl: "https://reliefweb.int/b.pdf" });
  });
});
