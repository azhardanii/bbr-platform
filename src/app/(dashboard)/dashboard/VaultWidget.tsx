"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Download, Clock } from "lucide-react";

export default function VaultWidget() {
  const [latestFile, setLatestFile] = useState<any>(null);
  const [jenjang, setJenjang] = useState<string>("S1");

  const getLabel = () => {
    if (jenjang === "S2") return "Tesis";
    if (jenjang === "S3") return "Disertasi";
    return "Skripsi";
  };
  const label = getLabel();

  useEffect(() => {
    // Listen for updates from the vault page
    const fetchLatest = () => {
      const saved = localStorage.getItem("bbr_vault_files");
      if (saved) {
        try {
          const files = JSON.parse(saved);
          if (files && files.length > 0) {
            // Sort by date desc
            files.sort((a: any, b: any) => b.timestamp - a.timestamp);
            setLatestFile(files[0]);
          } else {
            setLatestFile(null);
          }
        } catch (e) { }
      }

      const ob = localStorage.getItem("bbr_onboarding");
      if (ob) {
        try {
          const parsedOb = JSON.parse(ob);
          if (parsedOb.jenjang) setJenjang(parsedOb.jenjang);
        } catch (e) {}
      }
    };

    fetchLatest();
    window.addEventListener("storage", fetchLatest);
    window.addEventListener("vault-updated", fetchLatest);
    return () => {
      window.removeEventListener("storage", fetchLatest);
      window.removeEventListener("vault-updated", fetchLatest);
    };
  }, []);

  if (!latestFile) {
    return (
      <div className="bg-white border-2 border-[var(--color-bg-muted)] border-dashed p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-4 sm:justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--color-bg-surface)] flex items-center justify-center text-[var(--color-text-disabled)] shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)]">Belum ada draf {getLabel().toLowerCase()}</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Amankan file {getLabel().toLowerCase()}mu agar tidak berantakan dengan penamaan kacau kayak gini: "revisi_final_banget", "revisi_fix_fixx_fixx", "revisi_paling_terakhir".
            </p>
          </div>
        </div>
        <Link
          href="/tools/vault"
          className="w-full sm:w-auto px-6 py-2.5 bg-[var(--color-brand-600)] text-white text-sm font-semibold rounded-xl text-center hover:bg-[var(--color-brand-500)] transition-colors shrink-0"
        >
          Mulai Upload Draf &rarr;
        </Link>
      </div>
    );
  }

  const date = new Date(latestFile.timestamp);
  const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg text-[var(--color-text-primary)]">Draf {label} Terkini</h2>
        <Link href="/tools/vault" className="text-sm font-semibold text-[var(--color-brand-600)] hover:underline">
          Lihat Riwayat &rarr;
        </Link>
      </div>
      <div className="bg-gradient-to-r from-[var(--color-brand-50)] to-white border-2 border-[var(--color-brand-200)] p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 sm:justify-between shadow-sm hover:shadow-md hover:border-[var(--color-brand-300)] transition-all group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-600)] flex items-center justify-center text-white shrink-0 shadow-sm">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-bold text-[var(--color-text-primary)] text-lg group-hover:text-[var(--color-brand-700)] transition-colors line-clamp-1">{latestFile.name}</h3>
            <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)] mt-1.5 font-medium">
              <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-[var(--color-bg-muted)]">
                <Clock size={12} /> {dateStr} pukul {timeStr}
              </span>
              <span className="bg-[var(--color-brand-100)] text-[var(--color-brand-700)] px-2 py-0.5 rounded">
                Versi {latestFile.version}
              </span>
            </div>
          </div>
        </div>
        <div className="w-full sm:w-auto flex gap-2 shrink-0 mt-2 sm:mt-0">
          <Link
            href="/tools/vault"
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-[var(--color-bg-muted)] text-[var(--color-text-primary)] text-sm font-semibold rounded-xl text-center hover:bg-[var(--color-bg-surface)] transition-colors"
          >
            Update File
          </Link>
          <button
            className="flex-1 sm:flex-none px-4 py-2.5 bg-[var(--color-brand-600)] text-white text-sm font-semibold rounded-xl text-center hover:bg-[var(--color-brand-500)] transition-colors flex items-center justify-center gap-2"
          >
            <Download size={16} /> Unduh
          </button>
        </div>
      </div>
    </div>
  );
}
