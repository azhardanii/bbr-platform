"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, Loader2, ArrowLeft } from "lucide-react";
import { useCompletion } from "ai/react";

export default function StatistikPage() {
  const [formData, setFormData] = useState({
    tujuan: "Mencari Pengaruh/Hubungan",
    varX: 1,
    varY: 1,
    skala: "Interval/Rasio (Angka Numerik)",
  });

  const { completion, complete, isLoading, error } = useCompletion({
    api: "/api/ai/statistik",
  });

  const handleGenerate = async () => {
    const generatedPrompt = `Saya sedang mengerjakan bab 3 (Metodologi) dan bab 4 (Hasil) untuk skripsi saya. 
Mohon bantu saya menentukan dan menjelaskan alat analisis statistik yang paling tepat berdasarkan profil data berikut:

1. Tujuan Analisis: ${formData.tujuan}
2. Jumlah Variabel Independen (X): ${formData.varX}
3. Jumlah Variabel Dependen (Y): ${formData.varY}
4. Skala Data Pengukuran: ${formData.skala}

Tolong berikan:
1. Rekomendasi uji statistik utama yang harus saya gunakan (misalnya Regresi, ANOVA, Chi-Square, dll).
2. Asumsi klasik apa saja yang harus terpenuhi sebelum melakukan uji tersebut (misal: normalitas, autokorelasi, dll).
3. Panduan langkah demi langkah cara melakukannya di software SPSS (atau SmartPLS jika lebih cocok).
4. Cara membaca output tabel hipotesisnya secara sederhana (melihat nilai Sig. atau t-hitung).

Jelaskan dengan bahasa yang mudah dipahami mahasiswa yang awam statistik.`;

    await complete(generatedPrompt);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <Link href="/dashboard/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors mb-2">
        <ArrowLeft size={16} /> Kembali
      </Link>
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)]">Kompas Statistik</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">Kebingungan pilih alat uji? Masukkan profil datamu dan biarkan AI memberikan rekomendasi uji statistik & panduan bacanya.</p>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] p-6 rounded-2xl shadow-sm">
        <h2 className="font-semibold text-lg text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <Calculator size={20} className="text-[var(--color-brand-600)]" /> Profil Data Penelitian
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Tujuan Analisis Utama</label>
            <select 
              value={formData.tujuan}
              onChange={(e) => setFormData({...formData, tujuan: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white"
            >
              <option value="Mencari Pengaruh/Hubungan (Asosiatif)">Mencari Pengaruh/Hubungan (Asosiatif)</option>
              <option value="Mencari Perbedaan (Komparatif)">Mencari Perbedaan (Komparatif)</option>
              <option value="Mendeskripsikan Data Saja (Deskriptif)">Mendeskripsikan Data Saja (Deskriptif)</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Jumlah Variabel X (Independen)</label>
              <input 
                type="number"
                min="0"
                value={formData.varX}
                onChange={(e) => setFormData({...formData, varX: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Jumlah Variabel Y (Dependen)</label>
              <input 
                type="number"
                min="1"
                value={formData.varY}
                onChange={(e) => setFormData({...formData, varY: parseInt(e.target.value) || 1})}
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Skala Data</label>
            <select 
              value={formData.skala}
              onChange={(e) => setFormData({...formData, skala: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white"
            >
              <option value="Interval/Rasio (Angka Numerik berskala, ex: Kuesioner Likert/Laporan Keuangan)">Interval/Rasio (Numerik / Skala Likert / Keuangan)</option>
              <option value="Ordinal (Peringkat/Ranking)">Ordinal (Peringkat / Ranking)</option>
              <option value="Nominal (Kategori Tanpa Tingkatan, ex: Gender, Lulus/Tidak)">Nominal (Kategori / Klasifikasi)</option>
            </select>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3 bg-[var(--color-brand-600)] text-white font-semibold rounded-lg hover:bg-[var(--color-brand-500)] transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <><Loader2 className="animate-spin" size={18} /> Menganalisis Profil Data...</> : "Minta AI Menganalisis"}
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
          <h3 className="font-bold text-[var(--color-brand-600)] mb-4">Rekomendasi Uji Statistik:</h3>
          <div className="prose prose-sm md:prose-base max-w-none text-[var(--color-text-body)] whitespace-pre-wrap">
            {completion}
          </div>
        </div>
      )}
    </div>
  );
}
