'use client';

import { signOut } from 'next-auth/react';

/**
 * Perform a clean, complete logout:
 * 1. Purges all user-related localStorage keys (bbr_*, onboarding, quota, progress, user)
 * 2. Purges sessionStorage
 * 3. Calls /api/auth/logout with no-store to force-expire all server-side session cookies
 *    and trigger Clear-Site-Data header
 * 4. Calls NextAuth signOut to invalidate client React session state
 * 5. Uses window.location.replace('/login?logout=1') so the protected page is REPLACED
 *    in the browser history stack, preventing the user from navigating back to it.
 */
export async function performLogout() {
  // 1. Wipe client caches
  try {
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith('bbr_') ||
            key.includes('onboarding') ||
            key.includes('quota') ||
            key.includes('user') ||
            key.includes('auth'))
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();
    }
  } catch (e) {
    console.warn('[Logout] Failed to clear local storage:', e);
  }

  // 2. Clear server-side session cookies & bfcache
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      cache: 'no-store',
    });
  } catch (e) {
    console.warn('[Logout] Failed to call logout endpoint:', e);
  }

  // 3. Clear NextAuth client session
  try {
    await signOut({ redirect: false });
  } catch (e) {
    console.warn('[Logout] NextAuth signOut error:', e);
  }

  // 4. Critical: use window.location.replace instead of .href
  // This replaces the current dashboard/profil page in the history stack,
  // preventing the browser 'Back' button from returning to the protected view.
  if (typeof window !== 'undefined') {
    window.location.replace('/login?logout=1');
  }
}
