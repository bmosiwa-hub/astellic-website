/**
 * POST /api/org/switch
 * Sets the `astelfin_org` cookie to the requested organisation ID.
 * Validates that the org exists and is active before setting.
 */

import { auth }          from "@/auth";
import { prisma }        from "@/lib/prisma";
import { ORG_COOKIE }    from "@/lib/org";
import { NextRequest, NextResponse } from "next/server";
import { cookies }       from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json().catch(() => null);
  const orgId = body?.orgId as string | undefined;

  if (!orgId) {
    return NextResponse.json({ error: "orgId required" }, { status: 400 });
  }

  // Validate org is active
  const org = await prisma.organisation.findFirst({
    where:  { id: orgId, active: true },
    select: { id: true },
  });

  if (!org) {
    return NextResponse.json({ error: "Organisation not found or inactive." }, { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ORG_COOKIE, orgId, {
    path:     "/",
    httpOnly: true,
    sameSite: "lax",
    // Session cookie — expires when browser closes
  });

  return NextResponse.json({ ok: true });
}
