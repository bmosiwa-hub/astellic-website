"use server";

/**
 * Public, unauthenticated server actions: document submissions and feedback.
 * Defences: honeypot field, minimum fill time, per-IP rate limit, server-side
 * validation, file signature checks, and a review queue (nothing is ever
 * published automatically).
 */
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { rateLimitOk } from "@/lib/simple-rate-limit";
import { checkFileMeta, PUBLIC_MAX_BYTES, PUBLIC_MIME_TYPES } from "./files";
import { STORAGE_PROVIDER, verifyUpload } from "./storage";
import { feedbackSchema, fieldErrors, submissionSchema, type FieldErrors } from "./validation";

export interface FormState {
  ok: boolean;
  message?: string;
  errors?: FieldErrors;
}

const MIN_FILL_MS = 3000;

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/** Returns an error state if the request looks automated, otherwise null. */
async function botCheck(formData: FormData, bucket: string, limit: number): Promise<FormState | null> {
  // Honeypot: real users never see or fill this field.
  if (String(formData.get("website") ?? "").trim()) return { ok: true, message: "Thank you." };
  const started = Number(formData.get("startedAt"));
  if (!Number.isFinite(started) || Date.now() - started < MIN_FILL_MS) {
    return { ok: false, message: "That was very quick. Please check the form and submit again." };
  }
  if (!rateLimitOk(`${bucket}:${await clientIp()}`, limit, 60 * 60 * 1000)) {
    return { ok: false, message: "Too many submissions from your connection. Please try again later." };
  }
  return null;
}

export async function submitDocument(_prev: FormState, formData: FormData): Promise<FormState> {
  const blocked = await botCheck(formData, "hp-submit", 8);
  if (blocked) return blocked;

  const fileUrl = String(formData.get("fileUrl") ?? "");
  const fileName = String(formData.get("fileName") ?? "");
  const parsed = submissionSchema.safeParse({
    title: formData.get("title") ?? "",
    countryId: formData.get("countryId") ?? "",
    publisherName: formData.get("publisherName") ?? "",
    documentTypeName: formData.get("documentTypeName") ?? "",
    year: formData.get("year") ?? "",
    sourceUrl: formData.get("sourceUrl") ?? "",
    submitterName: formData.get("submitterName") ?? "",
    submitterEmail: formData.get("submitterEmail") ?? "",
    info: formData.get("info") ?? "",
    hasFile: !!fileUrl,
    consent: formData.get("consent") === "on",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Please correct the highlighted fields." };
  const d = parsed.data;

  if (d.countryId && !(await prisma.hpCountry.count({ where: { id: d.countryId } }))) {
    return { ok: false, errors: { countryId: "Choose a country from the list" } };
  }

  let file: { path: string; size: number; contentType: string } | null = null;
  if (fileUrl) {
    const meta = checkFileMeta({ name: fileName, size: 1, type: null }, { allowed: PUBLIC_MIME_TYPES, maxBytes: PUBLIC_MAX_BYTES });
    if (!meta.ok) return { ok: false, errors: { file: meta.error } };
    const verified = await verifyUpload(fileUrl, { area: "submissions", mime: meta.mime, maxBytes: PUBLIC_MAX_BYTES });
    if (!verified.ok) return { ok: false, errors: { file: verified.error } };
    file = verified.file;
  }

  await prisma.hpSubmission.create({
    data: {
      title: d.title,
      countryId: d.countryId,
      publisherName: d.publisherName,
      documentTypeName: d.documentTypeName,
      year: d.year,
      sourceUrl: d.sourceUrl,
      submitterName: d.submitterName,
      submitterEmail: d.submitterEmail,
      info: d.info,
      ...(file
        ? { storageProvider: STORAGE_PROVIDER, storagePath: file.path, fileName: fileName.slice(0, 200), fileType: file.contentType, fileSize: file.size }
        : {}),
    },
  });

  return {
    ok: true,
    message: "Thank you. Your submission is in our review queue. We check the document, its source and the rights to share it before anything is published.",
  };
}

export async function submitFeedback(_prev: FormState, formData: FormData): Promise<FormState> {
  const blocked = await botCheck(formData, "hp-feedback", 10);
  if (blocked) return blocked;

  const parsed = feedbackSchema.safeParse({
    documentId: formData.get("documentId") ?? "",
    type: formData.get("type") ?? "",
    message: formData.get("message") ?? "",
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    organisation: formData.get("organisation") ?? "",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Please correct the highlighted fields." };
  const d = parsed.data;

  if (d.documentId) {
    const exists = await prisma.hpDocument.count({ where: { id: d.documentId, status: "PUBLISHED" } });
    if (!exists) return { ok: false, message: "That document could not be found." };
  }

  await prisma.hpFeedback.create({ data: d });
  return {
    ok: true,
    message:
      d.type === "ACCESS_REQUEST"
        ? "Thank you. We'll contact you about access to this document."
        : d.type === "TAKEDOWN"
          ? "Thank you. We review takedown requests promptly and will reply by email."
          : "Thank you. Our team will review your report.",
  };
}
