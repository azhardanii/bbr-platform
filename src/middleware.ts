import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/login", "/pricing"];
const apiRoutes = ["/api/auth", "/api/webhooks"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiRoute = apiRoutes.some((route) => nextUrl.pathname.startsWith(route));
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  // Allow API routes
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Bypass auth logic temporarily as requested
  return NextResponse.next();

  // Redirect to login if accessing protected route without being logged in
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Redirect to dashboard if logged in and trying to access login page
  if (isLoggedIn && nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Check onboarding for logged in users
  if (isLoggedIn) {
    const onboardingCompleted = (req.auth?.user as any)?.onboarding_completed;
    const isOnboardingRoute = nextUrl.pathname === "/onboarding";

    if (!onboardingCompleted && !isOnboardingRoute) {
      return NextResponse.redirect(new URL("/onboarding", nextUrl));
    }

    if (onboardingCompleted && isOnboardingRoute) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
