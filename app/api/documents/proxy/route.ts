import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/documents/proxy?type=liquidation|library&id=<documentId>
 *
 * Authenticated proxy for uploaded documents. Vercel Blob URLs are public
 * (unguessable but unauthenticated), so the UI links here instead — the blob
 * URL never reaches the browser and access is checked per request.
 *
 * Access rules:
 *  - liquidation documents: CEO, Finance Manager, or the liquidation's submitter
 *  - library documents:     any authenticated user
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type");
  const id   = req.nextUrl.searchParams.get("id");
  if (!id || (type !== "liquidation" && type !== "library")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let url: string | null = null;
  let filename = "document";

  if (type === "liquidation") {
    const doc = await prisma.liquidationDocument.findUnique({
      where:   { id },
      include: { liquidation: { select: { submittedBy: true } } },
    });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const role = session.user.role;
    const isPrivileged = role === "CEO" || role === "FINANCE_MANAGER";
    const isOwner      = doc.liquidation.submittedBy === session.user.id;
    if (!isPrivileged && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    url = doc.url;
    filename = doc.filename;
  } else {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc || doc.deletedAt) return NextResponse.json({ error: "Not found" }, { status: 404 });
    url = doc.url;
    filename = doc.filename ?? doc.title ?? "document";
  }

  const upstream = await fetch(url);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "File unavailable" }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type":        upstream.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${filename.replace(/[^\w.\- ]/g, "_")}"`,
      "Cache-Control":       "private, no-store",
    },
  });
}
