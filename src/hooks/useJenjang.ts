"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export function useJenjang() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [jenjang, setJenjang] = useState<string>("S1");
  const [jurusan, setJurusan] = useState<string>("");
  const [judulTugasAkhir, setJudulTugasAkhir] = useState<string>("");

  // Sync state from server and local cache
  const syncData = useCallback(async () => {
    // 1. Try local cache first for instant UI response
    if (typeof window !== "undefined") {
      const obKey = userId ? `bbr_${userId}_onboarding` : "bbr_onboarding";
      const ob = localStorage.getItem(obKey) || localStorage.getItem("bbr_onboarding");
      if (ob) {
        try {
          const parsed = JSON.parse(ob);
          if (parsed.jenjang) setJenjang(parsed.jenjang);
          if (parsed.jurusan) setJurusan(parsed.jurusan);
          if (parsed.judulTugasAkhir || parsed.judul_skripsi || parsed.judulSkripsi) {
            setJudulTugasAkhir(parsed.judulTugasAkhir || parsed.judul_skripsi || parsed.judulSkripsi);
          }
        } catch (e) {}
      }
    }

    // 2. Fetch authoritative data from PostgreSQL DB
    try {
      const res = await fetch("/api/user/onboarding");
      if (res.ok) {
        const json = await res.json();
        if (json.user) {
          const u = json.user;
          if (u.jenjang) setJenjang(u.jenjang);
          if (u.jurusan && u.jurusan !== "-") setJurusan(u.jurusan);
          if (u.judul_skripsi) setJudulTugasAkhir(u.judul_skripsi);

          // Update local cache
          if (typeof window !== "undefined") {
            const cacheObj = {
              namaLengkap: u.nama_lengkap,
              jenjang: u.jenjang,
              jurusan: u.jurusan,
              semester: u.semester,
              punyaJudul: u.punya_judul ? "Sudah" : "Belum",
              judulTugasAkhir: u.judul_skripsi || "",
              judul_skripsi: u.judul_skripsi || "",
            };
            if (userId) {
              localStorage.setItem(`bbr_${userId}_onboarding`, JSON.stringify(cacheObj));
            }
            localStorage.setItem("bbr_onboarding", JSON.stringify(cacheObj));
          }
        }
      }
    } catch {}
  }, [userId]);

  useEffect(() => {
    syncData();

    const handleStorage = () => syncData();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [syncData]);

  const getLabel = () => {
    if (jenjang === "S2") return "Tesis";
    if (jenjang === "S3") return "Disertasi";
    return "Skripsi";
  };

  const saveJudul = async (judul: string) => {
    setJudulTugasAkhir(judul);

    // Update local cache
    if (typeof window !== "undefined") {
      const obKey = userId ? `bbr_${userId}_onboarding` : "bbr_onboarding";
      const ob = localStorage.getItem(obKey) || localStorage.getItem("bbr_onboarding");
      let parsed: any = {};
      if (ob) {
        try { parsed = JSON.parse(ob); } catch (e) {}
      }
      const newData = { ...parsed, judulTugasAkhir: judul, judul_skripsi: judul, punyaJudul: "Sudah" };
      if (userId) localStorage.setItem(`bbr_${userId}_onboarding`, JSON.stringify(newData));
      localStorage.setItem("bbr_onboarding", JSON.stringify(newData));
      window.dispatchEvent(new Event("storage"));
    }

    // Persist to database
    try {
      await fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul_skripsi: judul,
          punya_judul: true,
        }),
      });
    } catch (err) {
      console.error("[useJenjang] Failed to save judul to DB:", err);
    }
  };

  const removeJudul = async () => {
    setJudulTugasAkhir("");

    if (typeof window !== "undefined") {
      const obKey = userId ? `bbr_${userId}_onboarding` : "bbr_onboarding";
      const ob = localStorage.getItem(obKey) || localStorage.getItem("bbr_onboarding");
      let parsed: any = {};
      if (ob) {
        try { parsed = JSON.parse(ob); } catch (e) {}
      }
      delete parsed.judulTugasAkhir;
      delete parsed.judul_skripsi;
      parsed.punyaJudul = "Belum";
      if (userId) localStorage.setItem(`bbr_${userId}_onboarding`, JSON.stringify(parsed));
      localStorage.setItem("bbr_onboarding", JSON.stringify(parsed));
      window.dispatchEvent(new Event("storage"));
    }

    // Persist removal to database
    try {
      await fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul_skripsi: null,
          punya_judul: false,
        }),
      });
    } catch (err) {
      console.error("[useJenjang] Failed to remove judul in DB:", err);
    }
  };

  return {
    jenjang,
    jurusan,
    judulTugasAkhir,
    saveJudul,
    removeJudul,
    label: getLabel(),
    labelLower: getLabel().toLowerCase(),
  };
}
