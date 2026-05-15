/**
 * POST /api/settings/paye-bands
 * Creates a new PAYEBandSet with its associated bands.
 * CEO only.
 */

import { auth }   from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  if (session.user.role !== "CEO") return new NextResponse("Forbidden", { status: 403 });

  const form = await req.formData();
  const label         = (form.get("label")         as string)?.trim();
  const effectiveFrom = form.get("effectiveFrom")  as string;
  const bandsJson     = form.get("bandsJson")       as string;

  if (!label || !effectiveFrom || !bandsJson) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  let bands: Array<{ fromAmount: number; toAmount: number | null; rate: number }>;
  try {
    bands = JSON.parse(bandsJson);
    if (!Array.isArray(bands) || bands.length === 0) throw new Error();
  } catch {
    return NextResponse.json({ error: "Invalid bands data." }, { status: 422 });
  }

  const bandSet = await prisma.pAYEBandSet.create({
    data: {
      label,
      effectiveFrom: new Date(effectiveFrom),
      bands: {
        create: bands.map((b, i) => ({
          order:      i + 1,
          fromAmount: Number(b.fromAmount),
          toAmount:   b.toAmount != null ? Number(b.toAmount) : null,
          rate:       Number(b.rate),
        })),
      },
    },
  });

  return NextResponse.json({ id: bandSet.id });
}
