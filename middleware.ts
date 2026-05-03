import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Protect all /astelfin_26 routes except /astelfin_26/login
  if (pathname.startsWith("/astelfin_26") && pathname !== "/astelfin_26/login") {
    if (!req.auth) {
      const loginUrl = new URL("/astelfin_26/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/astelfin_26/:path*"],
};
