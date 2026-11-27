"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hpAudit, requireHp } from "../auth";
import { parseCsvRows, type CsvError } from "../csv";
import { createDocument } from "../documents";

export interface ImportPreviewRow {
  row: number;
  title: string;
  country: string;
  type: string;
  publisher: string;
  year: number | null;
  newPublisher: boolean;
  duplicate: boolean;
}

export interface ImportState {
  stage: "idle" | "preview" | "done";
  csv?: string;
  rows?: ImportPreviewRow[];
  errors?: CsvError[];
  total?: number;
  message?: string;
  created?: number;
  skipped?: number;
}

// Server actions accept up to 1 MB by default; stay under it.
const MAX_BYTES = 900 * 1024;

async function readCsv(formData: FormData): Promise<string | { error: string }> {
  const text = String(formData.get("csv") ?? "");
  if (text) return text.length > MAX_BYTES ? { error: "The CSV is larger than 900 KB. Split it into smaller files." } : text;
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a CSV file." };
  if (file.size > MAX_BYTES) return { error: "The CSV is larger than 900 KB. Split it into smaller files." };
  if (!/\.csv$/i.test(file.name)) return { error: "Upload a .csv file (in Excel: File → Save As → CSV UTF-8)." };
  return file.text();
}

async function lookups() {
  const [countries, types, themes, publishers] = await Promise.all([
    prisma.hpCountry.findMany({ select: { id: true, slug: true, name: true, isoCode: true } }),
    prisma.hpDocumentType.findMany({ select: { id: true, slug: true, name: true } }),
    prisma.hpTheme.findMany({ select: { id: true, slug: true, name: true } }),
    prisma.hpPublisher.findMany({ select: { id: true, name: true, acronym: true } }),
  ]);
  return { countries, types, themes, publishers };
}

async function isDuplicate(title: string, countryId: string, year: number | null): Promise<boolean> {
  const n = await prisma.hpDocument.count({
    where: { countryId, title: { equals: title, mode: "insensitive" }, ...(year ? { publicationYear: year } : {}) },
  });
  return n > 0;
}

export async function importCsv(_prev: ImportState, formData: FormData): Promise<ImportState> {
  let actor;
  try {
    actor = await requireHp("import.csv");
  } catch (e) {
    return { stage: "idle", message: (e as Error).message };
  }
  const csv = await readCsv(formData);
  if (typeof csv !== "string") return { stage: "idle", message: csv.error };

  const lk = await lookups();
  const parsed = parseCsvRows(csv, lk);
  const name = <T extends { id: string; name: string }>(list: T[], id: string) => list.find((x) => x.id === id)?.name ?? "";

  const rows: ImportPreviewRow[] = [];
  const seen = new Set<string>();
  for (const r of parsed.rows) {
    const key = `${r.input.countryId}|${r.input.title.toLowerCase()}|${r.input.publicationYear ?? ""}`;
    const duplicate = seen.has(key) || (await isDuplicate(r.input.title, r.input.countryId, r.input.publicationYear));
    seen.add(key);
    rows.push({
      row: r.row,
      title: r.input.title,
      country: name(lk.countries, r.input.countryId),
      type: name(lk.types, r.input.documentTypeId),
      publisher: r.input.publisherId ? name(lk.publishers, r.input.publisherId) : (r.input.newPublisherName ?? ""),
      year: r.input.publicationYear,
      newPublisher: r.newPublisher,
      duplicate,
    });
  }

  if (formData.get("intent") !== "commit") {
    return { stage: "preview", csv, rows, errors: parsed.errors, total: parsed.total };
  }

  // Commit: create drafts for valid, non-duplicate rows only.
  let created = 0;
  let skipped = 0;
  const failures: CsvError[] = [...parsed.errors];
  for (const [i, r] of parsed.rows.entries()) {
    if (rows[i].duplicate) {
      skipped++;
      continue;
    }
    try {
      await createDocument(r.input, { createdById: actor.memberId, status: "DRAFT" });
      created++;
    } catch (e) {
      failures.push({ row: r.row, message: e instanceof Error ? e.message : "Could not be saved" });
    }
  }
  await hpAudit(actor, {
    action: "CREATE",
    entityType: "HpDocument",
    detail: `CSV import: ${created} drafts created, ${skipped} duplicates skipped, ${failures.length} rows with errors`,
  });
  revalidatePath("/hp-hub/admin/documents");
  return {
    stage: "done",
    created,
    skipped,
    errors: failures,
    message: `${created} draft ${created === 1 ? "record" : "records"} created. Review and publish them from Documents.`,
  };
}
