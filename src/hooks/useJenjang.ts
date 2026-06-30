"use client";

import { useState, useEffect } from "react";

export function useJenjang() {
  const [jenjang, setJenjang] = useState<string>("S1");
  const [jurusan, setJurusan] = useState<string>("");
  const [judulTugasAkhir, setJudulTugasAkhir] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ob = localStorage.getItem("bbr_onboarding");
      if (ob) {
        try {
          const parsed = JSON.parse(ob);
          if (parsed.jenjang) setJenjang(parsed.jenjang);
          if (parsed.jurusan) setJurusan(parsed.jurusan);
          if (parsed.judulTugasAkhir) setJudulTugasAkhir(parsed.judulTugasAkhir);
        } catch (e) {}
      }

      // Listen for profile changes
      const handleStorage = () => {
        const newOb = localStorage.getItem("bbr_onboarding");
        if (newOb) {
          try {
            const parsed = JSON.parse(newOb);
            if (parsed.jenjang) setJenjang(parsed.jenjang);
            if (parsed.jurusan) setJurusan(parsed.jurusan);
            if (parsed.judulTugasAkhir) setJudulTugasAkhir(parsed.judulTugasAkhir);
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

  const saveJudul = (judul: string) => {
    setJudulTugasAkhir(judul);
    const ob = localStorage.getItem("bbr_onboarding");
    let parsed = {};
    if (ob) {
      try {
        parsed = JSON.parse(ob);
      } catch (e) {}
    }
    const newData = { ...parsed, judulTugasAkhir: judul };
    localStorage.setItem("bbr_onboarding", JSON.stringify(newData));
    window.dispatchEvent(new Event("storage"));
  };

  const removeJudul = () => {
    setJudulTugasAkhir("");
    const ob = localStorage.getItem("bbr_onboarding");
    let parsed: any = {};
    if (ob) {
      try {
        parsed = JSON.parse(ob);
      } catch (e) {}
    }
    delete parsed.judulTugasAkhir;
    localStorage.setItem("bbr_onboarding", JSON.stringify(parsed));
    window.dispatchEvent(new Event("storage"));
  };

  return { jenjang, jurusan, judulTugasAkhir, saveJudul, removeJudul, label: getLabel(), labelLower: getLabel().toLowerCase() };
}
