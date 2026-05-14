import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import { COOKIE_NAME, verify2faCookie } from "@/lib/totp";

const { auth } = NextAuth(authConfig);

// Paths that are exempt from the 2FA check (the challenge page itself + login)
const TOTP_EXEMPT = ["/astelfin_26/login", "/astelfin_26/2fa"];

// Roles that must complete 2FA when totpEnabled
const TOTP_ROLES = ["CEO", "FINANCE_MANAGER"];

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  // Forward pathname as header so root layout can detect finance routes
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  // ── 1. Password-auth guard ─────────────────────────────────────────────────
  if (pathname.startsWith("/astelfin_26") && pathname !== "/astelfin_26/login") {
    if (!req.auth) {
      const loginUrl = new URL("/astelfin_26/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── 2. TOTP 2FA guard ──────────────────────────────────────────────────────
  // Only for authenticated users with TOTP enabled, on finance routes
  if (
    req.auth &&
    pathname.startsWith("/astelfin_26") &&
    !TOTP_EXEMPT.some((p) => pathname === p || pathname.startsWith(p + "/")) &&
    req.auth.user?.totpEnabled &&
    TOTP_ROLES.includes(req.auth.user?.role ?? "")
  ) {
    const userId = req.auth.user?.id ?? "";
    const cookieVal = req.cookies.get(COOKIE_NAME)?.value ?? "";

    const valid = cookieVal ? await verify2faCookie(cookieVal, userId) : false;

    if (!valid) {
      const tfaUrl = new URL("/astelfin_26/2fa", req.url);
      // Preserve intended destination so we can redirect back after verification
      if (pathname !== "/astelfin_26/2fa") {
        tfaUrl.searchParams.set("next", pathname);
      }
      return NextResponse.redirect(tfaUrl);
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon|images|documents|icons).*)"],
};
