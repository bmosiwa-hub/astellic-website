import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordDownload } from "@/lib/hp-hub/analytics";
import { isHttpUrl } from "@/lib/hp-hub/text";
import { publicDocumentWhere } from "@/lib/hp-hub/visibility";

export const dynamic = "force-dynamic";

/**
 * Counts a visit to the original source, then redirects there. The target URL
 * comes only from the database (validated as http/https on save), so this
 * can't be used as an open redirect.
 */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await prisma.hpDocument.findFirst({
    where: publicDocumentWhere({ slug, accessType: { not: "RESTRICTED" } }),
    select: { id: true, sourceUrl: true },
  });
  if (!doc?.sourceUrl || !isHttpUrl(doc.sourceUrl)) {
    return NextResponse.redirect(new URL(`/hp-hub/documents/${encodeURIComponent(slug)}`, req.url));
  }
  await recordDownload(req, doc.id, "EXTERNAL_SOURCE");
  return NextResponse.redirect(doc.sourceUrl, { status: 302, headers: { "X-Robots-Tag": "noindex", "Referrer-Policy": "no-referrer-when-downgrade" } });
}
