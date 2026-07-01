"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useState } from "react";
import Link from "next/link";
import { Calculator, Loader2, ArrowLeft, Copy, CheckCircle2, RefreshCw, ArrowRight } from "lucide-react";
import { useAIStream } from "@/hooks/useAIStream";
import { useJenjang } from "@/hooks/useJenjang";

export default function StatistikPage() {
  const { labelLower } = useJenjang();
  const [formData, setFormData] = useState({
    tujuan: "Mencari Pengaruh/Hubungan (Asosiatif)",
    varX: 1,
    varY: 1,
    skala: "Interval/Rasio (Angka Numerik berskala, ex: Kuesioner Likert/Laporan Keuangan)",
  });
  const [copied, setCopied] = useState(false);

  const { completion, complete, isLoading, error, reset } = useAIStream({
    api: "/api/ai/statistik",
    body: { jenjang: labelLower },
  });

  const handleGenerate = async () => {
    const generatedPrompt = `Saya sedang mengerjakan bab 3 (Metodologi) dan bab 4 (Hasil) untuk ${labelLower} saya. 
Mohon bantu saya menentukan dan menjelaskan alat analisis statistik yang paling tepat berdasarkan profil data berikut:

**1. Tujuan Analisis:** ${formData.tujuan}
**2. Jumlah Variabel Independen (X):** ${formData.varX}
**3. Jumlah Variabel Dependen (Y):** ${formData.varY}
**4. Skala Data Pengukuran:** ${formData.skala}

Tolong berikan dalam format yang rapi:

### Rekomendasi Uji Statistik
- Uji utama yang harus digunakan beserta alasannya
- Alternatif uji jika asumsi tidak terpenuhi

### Asumsi Klasik yang Harus Dipenuhi
- Daftar uji prasyarat yang wajib dilakukan
- Kriteria lolos/tidak lolos untuk masing-masing

### Panduan Langkah demi Langkah
- Langkah-langkah di SPSS atau SmartPLS
- Screenshot-able steps yang mudah diikuti

### Cara Membaca Output
- Cara membaca tabel hipotesis (nilai Sig., t-hitung, dll.)
- Contoh kalimat interpretasi untuk setiap kemungkinan hasil

Jelaskan dengan bahasa yang mudah dipahami mahasiswa yang awam statistik.`;

    await complete(generatedPrompt);
  };

  const handleCopy = async () => {
    if (!completion) return;
    await navigator.clipboard.writeText(completion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors mb-2">
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
              className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white transition-colors"
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
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white transition-colors" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Jumlah Variabel Y (Dependen)</label>
              <input 
                type="number"
                min="1"
                value={formData.varY}
                onChange={(e) => setFormData({...formData, varY: parseInt(e.target.value) || 1})}
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white transition-colors" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Skala Data</label>
            <select 
              value={formData.skala}
              onChange={(e) => setFormData({...formData, skala: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white transition-colors"
            >
              <option value="Interval/Rasio (Angka Numerik berskala, ex: Kuesioner Likert/Laporan Keuangan)">Interval/Rasio (Numerik / Skala Likert / Keuangan)</option>
              <option value="Ordinal (Peringkat/Ranking)">Ordinal (Peringkat / Ranking)</option>
              <option value="Nominal (Kategori Tanpa Tingkatan, ex: Gender, Lulus/Tidak)">Nominal (Kategori / Klasifikasi)</option>
            </select>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3.5 bg-[var(--color-brand-600)] text-white font-semibold rounded-xl hover:bg-[var(--color-brand-500)] transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? <><Loader2 className="animate-spin" size={18} /> Menganalisis Profil Data...</> : <><Calculator size={18} /> Analisis & Rekomendasikan</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm">
          ⚠️ {error.message || "Terjadi kesalahan saat memuat respons AI. Silakan coba lagi."}
        </div>
      )}

      {(completion || isLoading) && (
        <div className="bg-white border-2 border-[var(--color-brand-100)] p-6 rounded-2xl shadow-sm animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--color-brand-600)]">Rekomendasi Uji Statistik</h3>
            {completion && !isLoading && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                    copied ? "bg-green-100 text-green-700" : "bg-[var(--color-brand-50)] text-[var(--color-brand-600)] hover:bg-[var(--color-brand-100)]"
                  }`}
                >
                  {copied ? <><CheckCircle2 size={14} /> Tersalin</> : <><Copy size={14} /> Salin</>}
                </button>
                <button
                  onClick={handleGenerate}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-body)] hover:bg-[var(--color-bg-muted)] flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw size={14} /> Ulang
                </button>
              </div>
            )}
          </div>
          <div className="prose prose-sm md:prose-base max-w-none text-[var(--color-text-body)] whitespace-pre-wrap leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{completion}</ReactMarkdown>
            {isLoading && !completion && (
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">AI sedang menganalisis profil data...</span>
              </div>
            )}
          </div>
          {isLoading && completion && (
            <div className="mt-3 flex items-center gap-2 text-[var(--color-brand-400)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-400)] animate-pulse" />
              <span className="text-xs">Sedang menghasilkan...</span>
            </div>
          )}

          {/* CTA to SPSS Interpreter */}
          {completion && !isLoading && (
            <div className="mt-6 pt-4 border-t border-[var(--color-bg-muted)]">
              <Link
                href="/tools/spss-pls"
                className="w-full py-3 bg-[var(--color-bg-surface)] border-2 border-[var(--color-brand-200)] text-[var(--color-brand-600)] font-semibold rounded-xl hover:bg-[var(--color-brand-50)] transition-colors flex items-center justify-center gap-2"
              >
                Lanjut ke SPSS Interpreter <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

