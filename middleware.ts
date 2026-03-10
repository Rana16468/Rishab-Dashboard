import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get authentication status from cookies
  const token = request.cookies.get("token")?.value;
  const userRole = request.cookies.get("userRole")?.value;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/auth",
    "/forget-password",
    "/reset-password",
    "/verification-code",
  ];

  // Admin routes that require admin role
  const adminRoutes = ["/admin"];

  // Check if the path is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Check if the path is admin route
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // If trying to access admin routes without authentication, redirect to auth
  if (isAdminRoute && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  // If trying to access admin routes without admin role, redirect to auth
  if (isAdminRoute && token && userRole?.toLowerCase() !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  // Don't redirect authenticated users from auth pages - let the component handle it

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
