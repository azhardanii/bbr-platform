"use client";

import { useState, useEffect } from "react";

export function useJenjang() {
  const [jenjang, setJenjang] = useState<string>("S1");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ob = localStorage.getItem("bbr_onboarding");
      if (ob) {
        try {
          const parsed = JSON.parse(ob);
          if (parsed.jenjang) setJenjang(parsed.jenjang);
        } catch (e) {}
      }

      // Listen for profile changes
      const handleStorage = () => {
        const newOb = localStorage.getItem("bbr_onboarding");
        if (newOb) {
          try {
            const parsed = JSON.parse(newOb);
            if (parsed.jenjang) setJenjang(parsed.jenjang);
          } catch (e) {}
        }
      };

      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    }
  }, []);

  const getLabel = () => {
    if (jenjang === "S2") return "Tesis";
    if (jenjang === "S3") return "Disertasi";
    return "Skripsi";
  };

  return { jenjang, label: getLabel(), labelLower: getLabel().toLowerCase() };
}
