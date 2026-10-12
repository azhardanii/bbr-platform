"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

/**
 * AuthGuard:
 * 1. Detects unauthenticated client state and immediately kicks to /login
 * 2. Neutralizes Browser Back-Forward Cache (bfcache):
 *    When a user logs out and presses the browser "Back" button, the browser
 *    may restore the page from in-memory cache without hitting the server.
 *    The `pageshow` listener detects `event.persisted === true` and forces
 *    a hard reload or immediate redirect to /login.
 */
export default function AuthGuard() {
  const { status } = useSession();

  useEffect(() => {
    // 1. If client session is resolved as unauthenticated, redirect immediately
    if (status === "unauthenticated") {
      window.location.replace("/login?logout=1");
      return;
    }

    // 2. bfcache (Back-Forward Cache) detection
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from memory cache (e.g. user pressed Back after logging out)
        window.location.reload();
      }
    };

    // 3. PopState event handler
    const handlePopState = () => {
      if ((status as string) === "unauthenticated") {
        window.location.replace("/login?logout=1");
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [status]);

  return null;
}
