import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Forward pathname as header so root layout can detect finance routes
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  // Protect all /astelfin_26 routes except the login page
  if (pathname.startsWith("/astelfin_26") && pathname !== "/astelfin_26/login") {
    if (!req.auth) {
      const loginUrl = new URL("/astelfin_26/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon|images|documents|icons).*)"],
};
