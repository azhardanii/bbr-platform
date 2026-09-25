"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function OnboardingGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isDashboardRoute = pathname.startsWith("/dashboard") || pathname === "/";
  // On dashboard routes, never block the screen with a full-screen spinner.
  // Middleware already validated authentication and onboarding on the server side.
  const [isChecking, setIsChecking] = useState(() => !isDashboardRoute);

  useEffect(() => {
    // Safety fallback: ensure checking never hangs longer than 300ms
    const safetyTimer = setTimeout(() => {
      setIsChecking(false);
    }, 300);

    // Only check on client side once session loading is resolved
    if (typeof window === "undefined" || status === "loading") {
      return () => clearTimeout(safetyTimer);
    }

    const userId = session?.user?.id;

    // 1. Check if marked completed in session (authoritative from DB)
    const isSessionOnboarded = (session?.user as any)?.onboarding_completed;

    // 2. Check user-scoped local storage cache
    const localOnboarded = userId
      ? localStorage.getItem(`bbr_${userId}_onboarding`)
      : localStorage.getItem("bbr_onboarding");

    // If marked done in session or local cache
    if (isSessionOnboarded || localOnboarded) {
      if (pathname.includes("/onboarding")) {
        router.replace("/dashboard");
      }
      setIsChecking(false);
      clearTimeout(safetyTimer);
      return;
    }

    // 3. If neither local cache nor session shows onboarding, query DB directly
    fetch("/api/user/onboarding")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.onboarding_completed) {
          if (userId) {
            localStorage.setItem(`bbr_${userId}_onboarding`, JSON.stringify(data.user));
          }
          localStorage.setItem("bbr_onboarding", JSON.stringify(data.user));
          if (pathname.includes("/onboarding")) {
            router.replace("/dashboard");
          }
        } else if (data?.user && !data.user.onboarding_completed) {
          // Truly has not completed onboarding
          if (!pathname.includes("/onboarding")) {
            router.replace("/onboarding");
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsChecking(false);
        clearTimeout(safetyTimer);
      });

    return () => clearTimeout(safetyTimer);
  }, [pathname, router, session, status]);

  // Never render a full-screen blocking overlay on dashboard
  if (isChecking && !isDashboardRoute) {
    return (
      <div className="fixed inset-0 bg-[var(--color-bg-base)] z-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--color-brand-600)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return null;
}

