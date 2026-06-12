"use client";

import { useState } from "react";
import Link from "next/link";
import { Type, Loader2, ArrowLeft } from "lucide-react";
import { useCompletion } from "ai/react";

export default function ParafrasePage() {
  const [formData, setFormData] = useState({
    text: "",
    tone: "Akademik Formal",
    target: "Kurangi Plagiasi (Turnitin)",
  });

  const { completion, complete, isLoading, error } = useCompletion({
    api: "/api/ai/parafrase",
  });

  const handleGenerate = async () => {
    if (!formData.text) {
      alert("Mohon masukkan teks yang ingin diparafrase.");
      return;
    }

    const generatedPrompt = `Tolong parafrase teks berikut ini. 

Instruksi Parafrase:
1. Gaya Bahasa/Tone: ${formData.tone}
2. Tujuan Utama: ${formData.target}
3. Pastikan makna dan konteks asli tidak berubah atau hilang.
4. Gunakan sinonim yang tepat dan ubah struktur kalimat (dari aktif ke pasif atau sebaliknya jika relevan).
5. Berikan 2 alternatif hasil parafrase agar saya bisa memilih yang paling cocok.

Teks Asli:
"""
${formData.text}
"""`;

    await complete(generatedPrompt);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <Link href="/dashboard/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors mb-2">
        <ArrowLeft size={16} /> Kembali
      </Link>
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)]">Parafrase Tool</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">Ubah struktur kalimat dan gaya bahasa untuk menghindari plagiasi dengan tetap menjaga makna asli.</p>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] p-6 rounded-2xl shadow-sm">
        <h2 className="font-semibold text-lg text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <Type size={20} className="text-[var(--color-brand-600)]" /> Teks Original
        </h2>
        
        <div className="space-y-4">
          <div>
            <textarea 
              value={formData.text}
              onChange={(e) => setFormData({...formData, text: e.target.value})}
              placeholder="Paste teks asli dari jurnal atau bukumu di sini..."
              className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white h-40 resize-y" 
            />
            <div className="text-right text-xs text-[var(--color-text-disabled)] mt-1">
              {formData.text.split(/\s+/).filter(w => w.length > 0).length} kata
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Gaya Bahasa</label>
              <select 
                value={formData.tone}
                onChange={(e) => setFormData({...formData, tone: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white"
              >
                <option value="Jurnal Akademik Q1">Jurnal Akademik Q1 (Sangat Formal & Ilmiah)</option>
                <option value="Skripsi Standar">Skripsi Standar (Formal Umum)</option>
                <option value="Sederhana">Sederhana (Lebih Mudah Dipahami Awam)</option>
                <option value="Ringkas">Ringkas (To-the-point & Padat)</option>
                <option value="Elaboratif">Elaboratif (Dijabarkan Lebih Panjang & Rinci)</option>
                <option value="Anti-Turnitin">Anti-Turnitin (Fokus Rombak Struktur Kalimat Total)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Tujuan Utama</label>
              <select 
                value={formData.target}
                onChange={(e) => setFormData({...formData, target: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white"
              >
                <option value="Kurangi Plagiasi (Turnitin)">Kurangi Plagiasi (Turnitin)</option>
                <option value="Merapikan tata bahasa (Grammar/PUEBI)">Merapikan Tata Bahasa</option>
                <option value="Menyambungkan paragraf (Transisi)">Menyambungkan dengan Paragraf Lain</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3 bg-[var(--color-brand-600)] text-white font-semibold rounded-lg hover:bg-[var(--color-brand-500)] transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <><Loader2 className="animate-spin" size={18} /> Memproses Parafrase...</> : "Minta AI Memparafrase"}
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
          <h3 className="font-bold text-[var(--color-brand-600)] mb-4">Hasil Parafrase:</h3>
          <div className="prose prose-sm md:prose-base max-w-none text-[var(--color-text-body)] whitespace-pre-wrap">
            {completion}
          </div>
        </div>
      )}
    </div>
  );
}
