import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isUserAdmin } from "@/lib/roles";

const publicRoutes = ["/", "/login", "/pricing"];
const apiRoutes = ["/api/auth", "/api/webhooks"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiRoute = apiRoutes.some((route) => nextUrl.pathname.startsWith(route));
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  // Allow all API routes to pass through so they can handle JSON 401/403 responses
  if (nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Redirect to login if accessing protected route without being logged in
  if (!isLoggedIn && !isPublicRoute) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
  }

  // Redirect to dashboard if logged in and trying to access login page (except when explicitly logging out)
  if (isLoggedIn && nextUrl.pathname === "/login") {
    if (nextUrl.searchParams.get("logout") || nextUrl.searchParams.get("error")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Check onboarding for logged in users
  if (isLoggedIn) {
    const onboardingCompleted = (req.auth?.user as any)?.onboarding_completed;
    const email = req.auth?.user?.email;
    const role = (req.auth?.user as any)?.role;
    const isAdmin = isUserAdmin(email, role);
    const isOnboardingRoute = nextUrl.pathname === "/onboarding";
    const isMonitoringRoute = nextUrl.pathname.startsWith("/monitoring");

    if (!onboardingCompleted && !isOnboardingRoute) {
      return NextResponse.redirect(new URL("/onboarding", nextUrl));
    }

    if (onboardingCompleted && isOnboardingRoute) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    // Admin-only route guard
    if (isMonitoringRoute && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
