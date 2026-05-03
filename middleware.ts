import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Protect all /finance routes except /finance/login
  if (pathname.startsWith("/finance") && pathname !== "/finance/login") {
    if (!req.auth) {
      const loginUrl = new URL("/finance/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/finance/:path*"],
};
