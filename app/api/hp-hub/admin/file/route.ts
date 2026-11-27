import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getHpActor } from "@/lib/hp-hub/auth";
import { safeFileName } from "@/lib/hp-hub/files";
import { can } from "@/lib/hp-hub/permissions";
import { openFile } from "@/lib/hp-hub/storage";

export const dynamic = "force-dynamic";

/**
 * Authenticated file preview for the admin portal: any stored file (drafts,
 * restricted documents, earlier versions, submissions, tracker evidence).
 * Not counted as a download.
 */
export async function GET(req: NextRequest) {
  const actor = await getHpActor();
  if (!actor) return new NextResponse("Unauthorised", { status: 401 });

  const kind = req.nextUrl.searchParams.get("kind");
  const id = req.nextUrl.searchParams.get("id") ?? "";
  let rec: { provider: string | null; path: string | null; name: string | null; type: string | null } | null = null;

  if (kind === "document") {
    const d = await prisma.hpDocument.findUnique({ where: { id }, select: { storageProvider: true, storagePath: true, fileName: true, fileType: true } });
    rec = d && { provider: d.storageProvider, path: d.storagePath, name: d.fileName, type: d.fileType };
  } else if (kind === "version") {
    const v = await prisma.hpDocumentVersion.findUnique({ where: { id } });
    rec = v && { provider: v.storageProvider, path: v.storagePath, name: v.fileName, type: v.fileType };
  } else if (kind === "submission") {
    if (!can(actor.role, "submission.review")) return new NextResponse("Forbidden", { status: 403 });
    const s = await prisma.hpSubmission.findUnique({ where: { id }, select: { storageProvider: true, storagePath: true, fileName: true, fileType: true } });
    rec = s && { provider: s.storageProvider, path: s.storagePath, name: s.fileName, type: s.fileType };
  } else if (kind === "evidence") {
    const a = await prisma.hpAcquisitionActivity.findUnique({ where: { id }, select: { attachmentPath: true, attachmentName: true } });
    rec = a && { provider: "vercel-blob", path: a.attachmentPath, name: a.attachmentName, type: null };
  } else {
    return new NextResponse("Invalid request", { status: 400 });
  }

  if (!rec?.provider || !rec.path) return new NextResponse("Not found", { status: 404 });
  const file = await openFile(rec.provider, rec.path).catch(() => null);
  if (!file) return new NextResponse("The file could not be read from storage.", { status: 503 });

  const type = rec.type || file.contentType || "application/octet-stream";
  const name = safeFileName(rec.name || "file");
  // PDFs open inline for preview; other formats download. Never cached.
  const disposition = type === "application/pdf" ? "inline" : "attachment";
  return new NextResponse(file.stream, {
    headers: {
      "Content-Type": type,
      "Content-Length": String(file.size),
      "Content-Disposition": `${disposition}; filename="${name}"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
      "Content-Security-Policy": "sandbox",
    },
  });
}
