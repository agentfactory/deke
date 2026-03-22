import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Public API routes that do NOT require authentication
const PUBLIC_API_ROUTES = [
  "/api/health",
  "/api/contact",
  "/api/booking-request",
  "/api/notification-signup",
  "/api/chat",
  "/api/events",
  "/api/group-requests",
  "/api/auth",
  "/api/webhooks",
]

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  )
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Check JWT token directly (edge-compatible, no bcrypt/prisma)
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  const isLoggedIn = !!token

  // Protect /dashboard/* routes
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    return NextResponse.next()
  }

  // Protect /api/* routes (except public ones)
  if (pathname.startsWith("/api/") && !isPublicApiRoute(pathname)) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
}
