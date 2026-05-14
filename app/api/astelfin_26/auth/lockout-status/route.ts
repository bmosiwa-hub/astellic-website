import { NextRequest, NextResponse } from "next/server";
import { checkLoginLockout } from "@/lib/auth";

// GET /api/astelfin_26/auth/lockout-status?email=...
// Returns lockout state for a given email so the login page can surface it.
// Does NOT expose any sensitive user data — only lockout timing.

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  try {
    const status = await checkLoginLockout(email);
    return NextResponse.json(status);
  } catch {
    // Don't crash — return a safe default
    return NextResponse.json({ locked: false, attemptsLeft: 5 });
  }
}
