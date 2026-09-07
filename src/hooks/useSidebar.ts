"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "bbr_sidebar_open";
const SYNC_EVENT = "bbr_sidebar_toggle";

export function useSidebar() {
  const [isOpen, setIsOpenState] = useState<boolean>(true);

  // Sync from localStorage on mount and listen to cross-component / cross-tab changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const readStoredState = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
          setIsOpenState(saved === "true");
        }
      } catch (e) {
        // Fallback silently if localStorage blocked
      }
    };

    // Initial read
    readStoredState();

    const handleSync = () => {
      readStoredState();
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener(SYNC_EVENT, handleSync);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener(SYNC_EVENT, handleSync);
    };
  }, []);

  const setIsOpen = useCallback((val: boolean) => {
    setIsOpenState(val);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, String(val));
        window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { isOpen: val } }));
      } catch (e) {
        // Ignore quota/access errors
      }
    }
  }, []);

  const toggle = useCallback(() => {
    setIsOpenState((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, String(next));
          window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { isOpen: next } }));
        } catch (e) {}
      }
      return next;
    });
  }, []);

  return { isOpen, setIsOpen, toggle };
}
