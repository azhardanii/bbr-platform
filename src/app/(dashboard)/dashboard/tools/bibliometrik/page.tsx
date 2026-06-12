"use client";

import { useState } from "react";
import Link from "next/link";
import { Network, Loader2, ArrowLeft } from "lucide-react";
import { useCompletion } from "ai/react";
import { useJenjang } from "@/hooks/useJenjang";

export default function BibliometrikPage() {
  const { labelLower } = useJenjang();
  const [formData, setFormData] = useState({
    keyword: "",
    tahunAwal: "2019",
    tahunAkhir: "2024",
    fokus: "Tren Penelitian",
  });

  const { completion, complete, isLoading, error } = useCompletion({
    api: "/api/ai/bibliometrik",
    body: { jenjang: labelLower }
  });

  const handleGenerate = async () => {
    if (!formData.keyword) {
      alert("Mohon masukkan kata kunci penelitian.");
      return;
    }

    const generatedPrompt = `Saya ingin melakukan analisis bibliometrik sederhana untuk State of the Art (SOTA) ${labelLower} saya.

Kata Kunci / Topik: ${formData.keyword}
Rentang Waktu: ${formData.tahunAwal} - ${formData.tahunAkhir}
Fokus Analisis: ${formData.fokus}

Tolong bantu saya:
1. Identifikasi 5-7 kata kunci turunan (co-occurrence) yang paling sering muncul bersamaan dengan topik ini.
2. Jelaskan gap penelitian (research gap) yang masih jarang diteliti berdasarkan tren beberapa tahun terakhir.
3. Rekomendasikan 3 arah penelitian (future research directions) yang relevan untuk dikerjakan oleh mahasiswa S1.
4. Buatkan format JSON sederhana dari kata-kata kunci tersebut dan bobot hubungannya agar saya bisa memvisualisasikannya nanti.

Berikan penjelasan yang runut dan mudah dipahami.`;

    await complete(generatedPrompt);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <Link href="/dashboard/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors mb-2">
        <ArrowLeft size={16} /> Kembali
      </Link>
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)]">Bibliometrik Generator</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">Temukan State of the Art (SOTA) dan Research Gap dari topikmu melalui simulasi bibliometrik AI.</p>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] p-6 rounded-2xl shadow-sm">
        <h2 className="font-semibold text-lg text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <Network size={20} className="text-[var(--color-brand-600)]" /> Parameter Riset
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Kata Kunci Utama</label>
            <input 
              value={formData.keyword}
              onChange={(e) => setFormData({...formData, keyword: e.target.value})}
              placeholder="Contoh: Green Accounting, Pembelajaran Daring, Literasi Keuangan..."
              className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Tahun Awal</label>
              <input 
                type="number"
                value={formData.tahunAwal}
                onChange={(e) => setFormData({...formData, tahunAwal: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Tahun Akhir</label>
              <input 
                type="number"
                value={formData.tahunAkhir}
                onChange={(e) => setFormData({...formData, tahunAkhir: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Fokus Pencarian</label>
            <select 
              value={formData.fokus}
              onChange={(e) => setFormData({...formData, fokus: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white"
            >
              <option value="Mencari Research Gap (Celah Penelitian)">Mencari Research Gap</option>
              <option value="Pemetaan Tren Topik (Co-occurrence)">Pemetaan Tren Topik</option>
              <option value="Mencari Novelty (Kebaruan)">Mencari Novelty (Kebaruan)</option>
            </select>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3 bg-[var(--color-brand-600)] text-white font-semibold rounded-lg hover:bg-[var(--color-brand-500)] transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <><Loader2 className="animate-spin" size={18} /> Menganalisis Topik...</> : "Minta AI Menganalisis"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          Terjadi kesalahan saat memuat respons AI. Pastikan API Key sudah dikonfigurasi.
        </div>
      )}

      {(completion || isLoading) && (
        <div className="bg-white border-2 border-[var(--color-brand-100)] p-6 rounded-2xl shadow-sm animate-in zoom-in-95 duration-300">
          <h3 className="font-bold text-[var(--color-brand-600)] mb-4">Hasil Analisis Bibliometrik:</h3>
          <div className="prose prose-sm md:prose-base max-w-none text-[var(--color-text-body)] whitespace-pre-wrap">
            {completion}
          </div>
        </div>
      )}
    </div>
  );
}
