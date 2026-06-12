"use client";

import { useEffect, useState } from "react";

export default function DashboardHeader({ defaultName }: { defaultName: string }) {
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    const fetchName = () => {
      const ob = localStorage.getItem("bbr_onboarding");
      if (ob) {
        try {
          const parsed = JSON.parse(ob);
          if (parsed.namaLengkap) {
            setName(parsed.namaLengkap.split(' ')[0]);
          }
        } catch (e) {}
      }
    };
    
    fetchName();

    // Listen for storage events (if profile is updated in another tab/component)
    window.addEventListener("storage", fetchName);
    return () => window.removeEventListener("storage", fetchName);
  }, []);

  return (
    <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)]">
      Halo, {name}! 👋🏻
    </h1>
  );
}
