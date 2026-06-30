// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

const PUBLIC_ROUTES = ["/login", "/api/auth"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes through
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Allow static assets
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("apex_token")?.value;
  const user  = token ? await verifyToken(token) : null;

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Inject user info into headers so server components can read it
  const headers = new Headers(req.headers);
  headers.set("x-user-id",   user.id);
  headers.set("x-user-role", user.role);
  headers.set("x-username",  user.username);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
