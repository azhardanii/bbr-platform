import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { isUserAdmin } from "@/lib/roles";

const publicRoutes = ["/", "/login", "/pricing"];
const apiRoutes = ["/api/auth", "/api/webhooks"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  // Allow all API routes to pass through so they can handle JSON 401/403 responses
  if (nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // 1. Redirect to login if accessing protected route without being logged in
  if (!isLoggedIn && !isPublicRoute) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    const redirectRes = NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
    redirectRes.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    redirectRes.headers.set("Pragma", "no-cache");
    redirectRes.headers.set("Expires", "0");
    return redirectRes;
  }

  // 2. Handle login page access
  if (isLoggedIn && nextUrl.pathname === "/login") {
    // If explicitly logging out or on error, allow viewing login page with no-store
    if (nextUrl.searchParams.get("logout") || nextUrl.searchParams.get("error")) {
      const res = NextResponse.next();
      res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      return res;
    }
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // 3. Check onboarding for logged in users
  if (isLoggedIn) {
    const onboardingCompleted = (req.auth?.user as any)?.onboarding_completed;
    const email = req.auth?.user?.email;
    const role = (req.auth?.user as any)?.role;
    const isAdmin = isUserAdmin(email, role);
    const isOnboardingRoute = nextUrl.pathname === "/onboarding";
    const isMonitoringRoute = nextUrl.pathname.startsWith("/monitoring");

    if (!onboardingCompleted && !isOnboardingRoute) {
      const res = NextResponse.redirect(new URL("/onboarding", nextUrl));
      res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      return res;
    }

    if (onboardingCompleted && isOnboardingRoute) {
      const res = NextResponse.redirect(new URL("/dashboard", nextUrl));
      res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      return res;
    }

    // Admin-only route guard
    if (isMonitoringRoute && !isAdmin) {
      const res = NextResponse.redirect(new URL("/dashboard", nextUrl));
      res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      return res;
    }
  }

  // 4. On all protected responses, set strict no-cache/no-store headers
  // This forbids the browser from caching dashboard/profil views in bfcache (Back/Forward Cache)
  const response = NextResponse.next();
  if (!isPublicRoute) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
