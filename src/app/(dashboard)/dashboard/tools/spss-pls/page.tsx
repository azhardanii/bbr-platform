"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart, Loader2, Play, ArrowLeft } from "lucide-react";
import { useCompletion } from "ai/react";
import { useJenjang } from "@/hooks/useJenjang";

export default function SPSSPage() {
  const { labelLower } = useJenjang();
  const [formData, setFormData] = useState({
    software: "SPSS",
    jenisUji: "Uji T (Parsial)",
    variabelX: "",
    variabelY: "",
    nilaiOutput: ""
  });

  const { completion, complete, isLoading, error } = useCompletion({
    api: "/api/ai/spss",
    body: { jenjang: labelLower }
  });

  const generateInterpretation = () => {
    if (!formData.variabelX || !formData.variabelY || !formData.nilaiOutput) {
      alert("Mohon lengkapi data variabel dan nilai output terlebih dahulu.");
      return;
    }
    complete(JSON.stringify(formData));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-10">
      <Link href="/dashboard/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors mb-2">
        <ArrowLeft size={16} /> Kembali
      </Link>
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)]">Generator Interpretasi Data</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">Dapatkan kalimat interpretasi akademik dari angka output SPSS atau SmartPLS secara otomatis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="font-semibold text-lg text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
            <BarChart size={20} className="text-[var(--color-brand-600)]" /> Input Output Software
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Software</label>
              <select 
                value={formData.software}
                onChange={(e) => setFormData({...formData, software: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white"
              >
                <option>SPSS</option>
                <option>SmartPLS</option>
                <option>EViews</option>
                <option>Amos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Jenis Uji</label>
              <select 
                value={formData.jenisUji}
                onChange={(e) => setFormData({...formData, jenisUji: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white"
              >
                <option>Uji T (Parsial)</option>
                <option>Uji F (Simultan)</option>
                <option>Koefisien Determinasi (R Square)</option>
                <option>Uji Validitas & Reliabilitas</option>
                <option>Path Analysis / Direct-Indirect Effect</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Variabel Independen (X)</label>
            <input 
              type="text"
              value={formData.variabelX}
              onChange={(e) => setFormData({...formData, variabelX: e.target.value})}
              placeholder="Contoh: Kualitas Pelayanan"
              className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Variabel Dependen (Y)</label>
            <input 
              type="text"
              value={formData.variabelY}
              onChange={(e) => setFormData({...formData, variabelY: e.target.value})}
              placeholder="Contoh: Kepuasan Pelanggan"
              className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Nilai Output Utama</label>
            <textarea 
              value={formData.nilaiOutput}
              onChange={(e) => setFormData({...formData, nilaiOutput: e.target.value})}
              placeholder="Masukkan angka dari tabel output. Contoh: Nilai t hitung = 3.45, p-value (sig) = 0.002"
              className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white h-24 resize-none" 
            />
          </div>

          <button 
            onClick={generateInterpretation}
            disabled={isLoading}
            className="w-full py-3 bg-[var(--color-brand-600)] text-white font-semibold rounded-lg hover:bg-[var(--color-brand-500)] transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <><Loader2 className="animate-spin" size={18} /> Menyusun Interpretasi...</> : <><Play size={18} /> Generate Interpretasi Bab 4</>}
          </button>
        </div>

        <div className="bg-white border-2 border-[var(--color-brand-100)] p-6 rounded-2xl shadow-sm h-[500px] flex flex-col">
          <h3 className="font-bold text-[var(--color-brand-600)] mb-3 border-b border-[var(--color-bg-muted)] pb-2 flex items-center gap-2">
            Hasil Interpretasi AI
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {error ? (
              <div className="text-red-500 p-4 bg-red-50 rounded-lg text-sm">Terjadi kesalahan: {error.message}</div>
            ) : completion ? (
              <div className="prose prose-sm max-w-none text-[var(--color-text-body)] whitespace-pre-wrap leading-relaxed">
                {completion}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-secondary)] opacity-50 space-y-3">
                <BarChart size={48} />
                <p className="text-sm">Hasil interpretasi akan muncul di sini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
