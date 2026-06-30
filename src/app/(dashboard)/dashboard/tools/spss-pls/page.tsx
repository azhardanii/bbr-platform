"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useState } from "react";
import Link from "next/link";
import { BarChart, Loader2, Play, ArrowLeft, Copy, CheckCircle2, RefreshCw } from "lucide-react";
import { useAIStream } from "@/hooks/useAIStream";
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
  const [copied, setCopied] = useState(false);

  const { completion, complete, isLoading, error, reset } = useAIStream({
    api: "/api/ai/spss",
    body: { jenjang: labelLower },
  });

  const generateInterpretation = () => {
    if (!formData.variabelX || !formData.variabelY || !formData.nilaiOutput) {
      alert("Mohon lengkapi data variabel dan nilai output terlebih dahulu.");
      return;
    }
    complete(JSON.stringify(formData));
  };

  const handleCopy = async () => {
    if (!completion) return;
    await navigator.clipboard.writeText(completion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-10">
      <Link href="/dashboard/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors mb-2">
        <ArrowLeft size={16} /> Kembali
      </Link>
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)]">Generator Interpretasi Data</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">Dapatkan kalimat interpretasi akademik dari angka output SPSS atau SmartPLS - langsung siap paste ke Bab 4.</p>
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
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white transition-colors"
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
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white transition-colors"
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
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Variabel Independen (X) <span className="text-[var(--color-error)]">*</span></label>
            <input 
              type="text"
              value={formData.variabelX}
              onChange={(e) => setFormData({...formData, variabelX: e.target.value})}
              placeholder="Contoh: Kualitas Pelayanan"
              className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white transition-colors" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Variabel Dependen (Y) <span className="text-[var(--color-error)]">*</span></label>
            <input 
              type="text"
              value={formData.variabelY}
              onChange={(e) => setFormData({...formData, variabelY: e.target.value})}
              placeholder="Contoh: Kepuasan Pelanggan"
              className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white transition-colors" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Nilai Output Utama <span className="text-[var(--color-error)]">*</span></label>
            <textarea 
              value={formData.nilaiOutput}
              onChange={(e) => setFormData({...formData, nilaiOutput: e.target.value})}
              placeholder="Masukkan angka dari tabel output. Contoh: Nilai t hitung = 3.45, p-value (sig) = 0.002, R Square = 0.67"
              className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white h-24 resize-none transition-colors" 
            />
            <p className="text-xs text-[var(--color-text-disabled)] mt-1">
              💡 Tip: Semakin lengkap angka yang kamu masukkan, semakin akurat interpretasinya.
            </p>
          </div>

          <button 
            onClick={generateInterpretation}
            disabled={isLoading}
            className="w-full py-3.5 bg-[var(--color-brand-600)] text-white font-semibold rounded-xl hover:bg-[var(--color-brand-500)] transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? <><Loader2 className="animate-spin" size={18} /> Menyusun Interpretasi...</> : <><Play size={18} /> Generate Interpretasi Bab 4</>}
          </button>
        </div>

        <div className="bg-white border-2 border-[var(--color-brand-100)] p-6 rounded-2xl shadow-sm min-h-[400px] lg:h-[600px] flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-[var(--color-bg-muted)] pb-2">
            <h3 className="font-bold text-[var(--color-brand-600)] flex items-center gap-2">
              Hasil Interpretasi AI
            </h3>
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
                  onClick={generateInterpretation}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-body)] hover:bg-[var(--color-bg-muted)] flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw size={14} /> Ulang
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {error ? (
              <div className="text-red-500 p-4 bg-red-50 rounded-lg text-sm">⚠️ {error.message}</div>
            ) : completion ? (
              <div className="prose prose-sm max-w-none text-[var(--color-text-body)] whitespace-pre-wrap leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{completion}</ReactMarkdown>
                {isLoading && (
                  <div className="mt-3 flex items-center gap-2 text-[var(--color-brand-400)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-400)] animate-pulse" />
                    <span className="text-xs">Sedang menghasilkan...</span>
                  </div>
                )}
              </div>
            ) : isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-secondary)] space-y-3">
                <Loader2 size={32} className="animate-spin text-[var(--color-brand-400)]" />
                <p className="text-sm">AI sedang menyusun interpretasi...</p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-secondary)] opacity-50 space-y-3">
                <BarChart size={48} />
                <p className="text-sm">Hasil interpretasi akan muncul di sini.</p>
                <p className="text-xs text-[var(--color-text-disabled)]">Isi form di sebelah kiri, lalu klik &quot;Generate Interpretasi&quot;</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

