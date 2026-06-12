"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function OnboardingGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only check on client side
    if (typeof window !== "undefined") {
      const hasOnboarded = localStorage.getItem("bbr_onboarding");
      
      // If we don't have onboarding data and we are not already on the onboarding page
      if (!hasOnboarded && !pathname.includes("/onboarding")) {
        router.replace("/onboarding");
      } else {
        setIsChecking(false);
      }
    }
  }, [pathname, router]);

  if (isChecking) {
    // Render a minimal blank screen or spinner while checking to prevent flash of content
    return <div className="fixed inset-0 bg-[var(--color-bg-base)] z-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[var(--color-brand-600)] border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return null;
}
