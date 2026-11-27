/**
 * Server-side validation for every HP-Hub write. Client forms may validate too,
 * but these schemas are the source of truth.
 */
import { z } from "zod";
import { HOSTABLE_PERMISSIONS } from "./constants";
import { isHttpUrl, normaliseKeyword, splitList } from "./text";

const CURRENT_YEAR = new Date().getUTCFullYear();

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

const optionalYear = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v, ctx) => {
    if (v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : Number(String(v).trim());
    if (!Number.isInteger(n) || n < 1900 || n > CURRENT_YEAR + 5) {
      ctx.addIssue({ code: "custom", message: `Enter a year between 1900 and ${CURRENT_YEAR + 5}` });
      return z.NEVER;
    }
    return n;
  });

const optionalUrl = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((v, ctx) => {
    if (!v) return null;
    if (!isHttpUrl(v)) {
      ctx.addIssue({ code: "custom", message: "Enter a full web address starting with http:// or https://" });
      return z.NEVER;
    }
    return v;
  });

export const ACCESS_TYPES = ["HOSTED", "EXTERNAL", "RESTRICTED"] as const;
export const PERMISSION_STATUSES = [
  "UNKNOWN",
  "NOT_REQUIRED",
  "REQUESTED",
  "GRANTED",
  "OPEN_LICENSE",
  "DENIED",
] as const;
export const VERIFICATION_STATUSES = ["UNVERIFIED", "PENDING_VERIFICATION", "VERIFIED", "DISPUTED"] as const;

/** Metadata for a repository document. File fields are validated separately. */
export const documentInputSchema = z
  .object({
    title: z.string().trim().min(3, "Title is required").max(500),
    countryId: z.string().trim().min(1, "Choose a country"),
    documentTypeId: z.string().trim().min(1, "Choose a document type"),
    publisherId: optionalText(60),
    newPublisherName: optionalText(300),
    publicationYear: optionalYear,
    publicationDate: optionalText(10),
    startYear: optionalYear,
    endYear: optionalYear,
    authors: z
      .string()
      .optional()
      .transform((v) => splitList(v, /[;\n]/).slice(0, 50)),
    description: optionalText(5000),
    abstract: optionalText(20000),
    language: z.string().trim().max(60).optional().transform((v) => v || "English"),
    version: optionalText(60),
    edition: optionalText(60),
    themeIds: z.array(z.string().min(1)).max(30).default([]),
    primaryThemeId: optionalText(60),
    keywords: z
      .string()
      .optional()
      .transform((v) => [...new Set(splitList(v).map(normaliseKeyword))].filter(Boolean).slice(0, 40)),
    sourceUrl: optionalUrl,
    citationText: optionalText(2000),
    notes: optionalText(5000),
    accessType: z.enum(ACCESS_TYPES),
    permissionStatus: z.enum(PERMISSION_STATUSES),
    rightsHolder: optionalText(300),
    rightsStatement: optionalText(2000),
    verificationStatus: z.enum(VERIFICATION_STATUSES).default("UNVERIFIED"),
    verificationNotes: optionalText(2000),
    isFeatured: z.boolean().default(false),
    /** true when the record has (or is about to have) a stored file */
    hasFile: z.boolean().default(false),
  })
  .superRefine((d, ctx) => {
    if (!d.publisherId && !d.newPublisherName) {
      ctx.addIssue({ code: "custom", path: ["publisherId"], message: "Choose or add a publisher" });
    }
    if (d.startYear && d.endYear && d.startYear > d.endYear) {
      ctx.addIssue({ code: "custom", path: ["endYear"], message: "End year must be after the start year" });
    }
    if (d.publicationDate && !/^\d{4}-\d{2}-\d{2}$/.test(d.publicationDate)) {
      ctx.addIssue({ code: "custom", path: ["publicationDate"], message: "Use the date picker (YYYY-MM-DD)" });
    }
    if (!d.hasFile && !d.sourceUrl) {
      ctx.addIssue({ code: "custom", path: ["sourceUrl"], message: "Upload a file or give the original source URL" });
    }
    if (d.accessType === "HOSTED") {
      if (!d.hasFile) {
        ctx.addIssue({ code: "custom", path: ["accessType"], message: "A hosted download needs an uploaded file" });
      }
      if (!(HOSTABLE_PERMISSIONS as readonly string[]).includes(d.permissionStatus)) {
        ctx.addIssue({
          code: "custom",
          path: ["permissionStatus"],
          message: "Files can only be hosted with permission granted or under an open licence",
        });
      }
      if (!d.rightsStatement && !d.rightsHolder) {
        ctx.addIssue({
          code: "custom",
          path: ["rightsStatement"],
          message: "Record the rights basis (rights holder or rights statement) for hosted files",
        });
      }
    }
    if (d.accessType === "EXTERNAL" && !d.sourceUrl) {
      ctx.addIssue({ code: "custom", path: ["sourceUrl"], message: "External-source records need the source URL" });
    }
    if (d.primaryThemeId && !d.themeIds.includes(d.primaryThemeId)) {
      ctx.addIssue({ code: "custom", path: ["primaryThemeId"], message: "The primary theme must be one of the selected themes" });
    }
  });

export type DocumentInput = z.output<typeof documentInputSchema>;

/** Public "Submit a document" form. */
export const submissionSchema = z
  .object({
    title: z.string().trim().min(3, "Enter the document title").max(500),
    countryId: optionalText(60),
    publisherName: optionalText(300),
    documentTypeName: optionalText(120),
    year: optionalYear,
    sourceUrl: optionalUrl,
    submitterName: z.string().trim().min(2, "Enter your name").max(200),
    submitterEmail: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")).pipe(z.string().max(254)),
    info: optionalText(5000),
    hasFile: z.boolean().default(false),
    consent: z.literal(true, { message: "Please confirm the statement above" }),
  })
  .superRefine((d, ctx) => {
    if (!d.sourceUrl && !d.hasFile && !d.info) {
      ctx.addIssue({
        code: "custom",
        path: ["sourceUrl"],
        message: "Give a source URL, attach the file, or tell us where the document can be found",
      });
    }
  });

/** Public corrections / broken links / takedown / access requests. */
export const feedbackSchema = z
  .object({
    documentId: optionalText(60),
    type: z.enum(["CORRECTION", "BROKEN_LINK", "TAKEDOWN", "ACCESS_REQUEST", "OTHER"]),
    message: z.string().trim().min(10, "Please add a few more details").max(5000),
    name: optionalText(200),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .optional()
      .transform((v, ctx) => {
        if (!v) return null;
        if (!z.email().safeParse(v).success) {
          ctx.addIssue({ code: "custom", message: "Enter a valid email address" });
          return z.NEVER;
        }
        return v;
      }),
    organisation: optionalText(300),
  })
  .superRefine((d, ctx) => {
    if ((d.type === "TAKEDOWN" || d.type === "ACCESS_REQUEST") && !d.email) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "We need an email address to respond to this request" });
    }
  });

export const acquisitionSchema = z.object({
  title: z.string().trim().min(3, "Title is required").max(500),
  countryId: z.string().trim().min(1, "Choose a country"),
  publisherId: optionalText(60),
  publisherName: optionalText(300),
  documentTypeId: optionalText(60),
  year: optionalYear,
  evidence: optionalText(5000),
  sourceUrl: optionalUrl,
  status: z.enum(["ACQUIRED", "MISSING", "NEEDS_VERIFICATION", "BROKEN_LINK", "PERMISSION_REQUIRED", "NEEDS_UPDATING"]),
  unavailableReason: optionalText(2000),
  lastVerifiedAt: optionalText(10),
  ownerId: optionalText(60),
  nextAction: optionalText(1000),
  nextActionDue: optionalText(10),
  notes: optionalText(10000),
});

export type FieldErrors = Record<string, string>;

/** Flattens zod issues to one message per top-level field. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function parseDateOnly(v: string | null | undefined): Date | null {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(`${v}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}
