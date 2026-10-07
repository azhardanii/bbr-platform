'use client';

import { signOut } from 'next-auth/react';

/**
 * Perform a clean, complete logout:
 * 1. Purges all user-related localStorage keys (bbr_*, onboarding, quota, progress)
 * 2. Purges sessionStorage
 * 3. Calls /api/auth/logout to force-expire all server-side session cookies (authjs & next-auth)
 * 4. Calls NextAuth signOut
 * 5. Performs a hard window navigation to /login?logout=1 to ensure all React state & cache are flushed
 */
export async function performLogout() {
  // 1. Wipe client caches
  try {
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('bbr_') || key.includes('onboarding') || key.includes('quota'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();
    }
  } catch (e) {
    console.warn('[Logout] Failed to clear local storage:', e);
  }

  // 2. Clear server-side session cookies
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

  // 4. Force full page reload to login screen
  if (typeof window !== 'undefined') {
    window.location.href = '/login?logout=1';
  }
}
