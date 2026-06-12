"use client";

import Link from "next/link";
import { FileSearch, Type, Network, Calculator } from "lucide-react";
import { useJenjang } from "@/hooks/useJenjang";

export default function ToolsPage() {
  const { labelLower } = useJenjang();

  const tools = [
    {
      title: "Judul Finder & Checker",
      desc: `Temukan ide atau validasi judul ${labelLower}mu menggunakan AI.`,
      icon: FileSearch,
      href: "/dashboard/tools/judul-finder",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Parafrase Tool",
      desc: "Ubah struktur kalimat untuk hindari plagiasi (Turnitin) dengan gaya akademik.",
      icon: Type,
      href: "/dashboard/tools/parafrase",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Bibliometrik Generator",
      desc: "Analisis state-of-the-art dan temukan research gap dari topikmu.",
      icon: Network,
      href: "/dashboard/tools/bibliometrik",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Kompas Statistik",
      desc: `Pilih metode analisis data yang tepat untuk ${labelLower}mu.`,
      icon: Calculator,
      href: "/dashboard/tools/statistik",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Anti-Revisi Kit",
      desc: "Checklist mandiri sebelum bimbingan untuk minimalkan revisi.",
      icon: FileSearch,
      href: "/dashboard/tools/anti-revisi",
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "SPSS/PLS Interpreter",
      desc: "Ubah angka output statistik jadi kalimat interpretasi Bab 4.",
      icon: Calculator,
      href: "/dashboard/tools/spss-pls",
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      title: "Script WA Dosen",
      desc: "Template chat siap pakai untuk hubungi dosen dengan sopan.",
      icon: Type,
      href: "/dashboard/tools/script-wa",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)]">Katalog Tools AI</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">Gunakan berbagai alat bantu AI tanpa biaya tambahan. Semua berbasis prompt teroptimasi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool, i) => (
          <Link key={i} href={tool.href} className="flex p-5 bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] hover:border-[var(--color-brand-400)] hover:shadow-md transition-all rounded-2xl group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${tool.bg} ${tool.color}`}>
              <tool.icon size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-600)] transition-colors">{tool.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">{tool.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
