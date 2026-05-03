import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Forward pathname as a header so the root layout can read it
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  // Protect all /astelfin_26 routes except /astelfin_26/login
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
