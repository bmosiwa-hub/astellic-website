import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimitOk, clientIp } from "@/lib/simple-rate-limit";
import { recordDownload } from "@/lib/hp-hub/analytics";
import { safeFileName } from "@/lib/hp-hub/files";
import { openFile } from "@/lib/hp-hub/storage";
import { isPubliclyDownloadable, publicDocumentWhere } from "@/lib/hp-hub/visibility";

export const dynamic = "force-dynamic";

/**
 * Public file download. Served only for published HOSTED documents whose
 * permission status allows redistribution; the storage URL never leaves the
 * server. Each human download is counted once per visitor per day.
 */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!rateLimitOk(`hp-dl:${clientIp(req)}`, 120, 10 * 60 * 1000)) {
    return new NextResponse("Too many requests. Please wait a few minutes.", { status: 429 });
  }

  const doc = await prisma.hpDocument.findFirst({
    where: publicDocumentWhere({ slug }),
    select: {
      id: true, slug: true, status: true, accessType: true, permissionStatus: true, isSynthetic: true,
      storageProvider: true, storagePath: true, fileName: true, fileType: true,
    },
  });
  if (!doc || !isPubliclyDownloadable(doc) || !doc.storageProvider || !doc.storagePath) {
    return new NextResponse("This document is not available for download.", { status: 404 });
  }

  let file: Awaited<ReturnType<typeof openFile>>;
  try {
    file = await openFile(doc.storageProvider, doc.storagePath);
  } catch (err) {
    console.error("[hp-hub/download] storage error", err);
    file = null;
  }
  if (!file) {
    return new NextResponse("The file is temporarily unavailable. Please try again later or use the original source.", { status: 503 });
  }

  await recordDownload(req, doc.id, "DOWNLOAD");

  const name = safeFileName(doc.fileName || `${doc.slug}.pdf`);
  return new NextResponse(file.stream, {
    headers: {
      "Content-Type": doc.fileType || file.contentType || "application/octet-stream",
      "Content-Length": String(file.size),
      "Content-Disposition": `attachment; filename="${name}"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
    },
  });
}
