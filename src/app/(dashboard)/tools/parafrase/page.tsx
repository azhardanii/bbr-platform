"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useState } from "react";
import Link from "next/link";
import { Type, Loader2, ArrowLeft, Copy, CheckCircle2, RefreshCw } from "lucide-react";
import { useAIStream } from "@/hooks/useAIStream";
import { useJenjang } from "@/hooks/useJenjang";

export default function ParafrasePage() {
  const { label, labelLower } = useJenjang();
  const [formData, setFormData] = useState({
    text: "",
    tone: "Jurnal Akademik Q1",
    target: "Kurangi Plagiasi (Turnitin)",
  });
  const [copied, setCopied] = useState<string | null>(null);

  const { completion, complete, isLoading, error, reset } = useAIStream({
    api: "/api/ai/parafrase",
    body: { jenjang: labelLower },
  });

  const wordCount = formData.text.split(/\s+/).filter((w) => w.length > 0).length;

  const handleGenerate = async () => {
    if (!formData.text) {
      alert("Mohon masukkan teks yang ingin diparafrase.");
      return;
    }

    if (wordCount > 800) {
      alert("Teks terlalu panjang. Maksimal 800 kata.");
      return;
    }

    const generatedPrompt = `Tolong parafrase teks berikut ini. 

**Instruksi Parafrase:**
1. **Gaya Bahasa/Tone:** ${formData.tone}
2. **Tujuan Utama:** ${formData.target}
3. Pastikan makna dan konteks asli tidak berubah atau hilang.
4. Ubah struktur kalimat secara signifikan - bukan hanya ganti sinonim.
5. Gunakan variasi: aktif→pasif, kalimat majemuk→tunggal, atau sebaliknya.
6. Berikan **2 alternatif** hasil parafrase agar saya bisa memilih yang paling cocok.
7. **PENTING**: Lakukan analisis sungguhan terhadap seberapa umum/klise teks asli tersebut untuk memperkirakan potensi plagiasinya (SCORE_BEFORE). Lalu perkirakan plagiasi hasil parafrasemu (SCORE_AFTER). **JANGAN** gunakan angka template! Berikan angka persentase realistis berdasarkan analisismu sendiri.

**Teks Asli:**
"""
${formData.text}
"""

Format output persis seperti ini di awal respons:
<SCORE_BEFORE>[angka % analisismu]</SCORE_BEFORE>
<SCORE_AFTER>[angka % analisismu]</SCORE_AFTER>

## Alternatif 1
[hasil parafrase]

## Alternatif 2
[hasil parafrase]

## Catatan Perubahan
[apa yang paling diubah strukturnya dan kenapa]`;

    await complete(generatedPrompt);
  };

  const handleCopy = async (text: string, id: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const scoreBeforeMatch = completion.match(/<SCORE_BEFORE>\s*([\s\S]*?)\s*<\/SCORE_BEFORE>/i);
  const scoreAfterMatch = completion.match(/<SCORE_AFTER>\s*([\s\S]*?)\s*<\/SCORE_AFTER>/i);
  const scoreBefore = scoreBeforeMatch ? scoreBeforeMatch[1] : null;
  const scoreAfter = scoreAfterMatch ? scoreAfterMatch[1] : null;

  const displayContent = completion
    .replace(/<SCORE_BEFORE>[\s\S]*?<\/SCORE_BEFORE>/gi, "")
    .replace(/<SCORE_AFTER>[\s\S]*?<\/SCORE_AFTER>/gi, "")
    .trim();

  // Parsing sections dynamically
  const alt1Match = displayContent.match(/## Alternatif 1\s*([\s\S]*?)(?=## Alternatif 2|## Catatan Perubahan|$)/i);
  const alt2Match = displayContent.match(/## Alternatif 2\s*([\s\S]*?)(?=## Catatan Perubahan|$)/i);
  const notesMatch = displayContent.match(/## Catatan Perubahan\s*([\s\S]*?)$/i);

  const alt1Text = alt1Match ? alt1Match[1].trim() : "";
  const alt2Text = alt2Match ? alt2Match[1].trim() : "";
  const notesText = notesMatch ? notesMatch[1].trim() : "";

  const introMatch = displayContent.match(/^([\s\S]*?)(?=## Alternatif 1|## Alternatif 2|## Catatan Perubahan|$)/i);
  const introText = introMatch ? introMatch[1].trim() : "";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-12">
      <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors mb-2">
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
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="Tulis / tempel teks asli dari jurnal atau bukumu di sini..."
              className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white h-40 resize-y transition-colors"
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs font-semibold ${wordCount > 800 ? "text-[var(--color-error)]" : "text-[var(--color-text-disabled)]"}`}>
                {wordCount}/800 kata
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Gaya Bahasa</label>
              <select
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white transition-colors"
              >
                <option value="Jurnal Akademik Q1">Jurnal Akademik Q1 (Sangat Formal & Ilmiah)</option>
                <option value="Standar Akademik">{label} Standar (Formal Umum)</option>
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
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white transition-colors"
              >
                <option value="Kurangi Plagiasi (Turnitin)">Kurangi Plagiasi (Turnitin)</option>
                <option value="Merapikan tata bahasa (Grammar/PUEBI)">Merapikan Tata Bahasa</option>
                <option value="Menyambungkan paragraf (Transisi)">Menyambungkan dengan Paragraf Lain</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || wordCount > 800}
            className="w-full py-3.5 bg-[var(--color-brand-600)] text-white font-semibold rounded-xl hover:bg-[var(--color-brand-500)] transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? <><Loader2 className="animate-spin" size={18} /> Memproses Parafrase...</> : <><Type size={18} /> Parafrase Sekarang</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm">
          ⚠️ {error.message || "Terjadi kesalahan saat memuat respons AI. Silakan coba lagi."}
        </div>
      )}

      {(completion || isLoading) && (
        <div className="space-y-4 animate-in zoom-in-95 duration-300">
          {/* Card: Estimasi Plagiasi (Score) */}
          <div className="bg-white border-2 border-[var(--color-brand-100)] p-6 rounded-2xl shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h3 className="font-bold text-xl text-[var(--color-brand-600)]">Hasil Analisis & Parafrase</h3>
              {completion && !isLoading && (
                <button
                  onClick={handleGenerate}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-body)] hover:bg-[var(--color-bg-muted)] flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw size={14} /> Ulang Parafrase
                </button>
              )}
            </div>

            {(scoreBefore || scoreAfter || (isLoading && !alt1Text)) && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Estimasi Plagiasi Awal</span>
                  <span className="text-2xl md:text-3xl font-bold text-red-600">{scoreBefore || (isLoading ? "..." : "N/A")}</span>
                </div>
                <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Setelah Parafrase</span>
                  <span className="text-2xl md:text-3xl font-bold text-green-600">{scoreAfter || (isLoading ? "..." : "N/A")}</span>
                </div>
              </div>
            )}
            {introText && (
              <div className="prose prose-sm md:prose-base max-w-none mt-4 text-[var(--color-text-body)] leading-relaxed prose-p:my-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{introText}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Card: Alternatif 1 */}
          {(alt1Text || (isLoading && !alt1Text && scoreAfter)) && (
            <div className="bg-white border-2 border-[var(--color-brand-100)] p-6 rounded-2xl shadow-sm relative">
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                <h4 className="font-bold text-lg text-[var(--color-text-primary)]">Alternatif 1</h4>
                {alt1Text && !isLoading && (
                  <button onClick={() => handleCopy(alt1Text, 'alt1')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${copied === 'alt1' ? 'bg-green-100 text-green-700' : 'bg-[var(--color-brand-50)] text-[var(--color-brand-600)] hover:bg-[var(--color-brand-100)]'}`}>
                    {copied === 'alt1' ? <><CheckCircle2 size={14} /> Tersalin</> : <><Copy size={14} /> Salin</>}
                  </button>
                )}
              </div>
              <div className="prose prose-sm md:prose-base max-w-none text-[var(--color-text-body)] leading-relaxed prose-p:my-3">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{alt1Text || "Memproses alternatif 1..."}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Card: Alternatif 2 */}
          {(alt2Text || (isLoading && alt1Text && !alt2Text)) && (
            <div className="bg-white border-2 border-[var(--color-brand-100)] p-6 rounded-2xl shadow-sm relative">
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                <h4 className="font-bold text-lg text-[var(--color-text-primary)]">Alternatif 2</h4>
                {alt2Text && !isLoading && (
                  <button onClick={() => handleCopy(alt2Text, 'alt2')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${copied === 'alt2' ? 'bg-green-100 text-green-700' : 'bg-[var(--color-brand-50)] text-[var(--color-brand-600)] hover:bg-[var(--color-brand-100)]'}`}>
                    {copied === 'alt2' ? <><CheckCircle2 size={14} /> Tersalin</> : <><Copy size={14} /> Salin</>}
                  </button>
                )}
              </div>
              <div className="prose prose-sm md:prose-base max-w-none text-[var(--color-text-body)] leading-relaxed prose-p:my-3">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{alt2Text || "Memproses alternatif 2..."}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Card: Catatan Perubahan */}
          {(notesText || (isLoading && alt2Text && !notesText)) && (
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] p-6 rounded-2xl shadow-sm relative">
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
                <h4 className="font-bold text-[var(--color-text-primary)]">Catatan Perubahan</h4>
                {notesText && !isLoading && (
                  <button onClick={() => handleCopy(notesText, 'notes')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${copied === 'notes' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {copied === 'notes' ? <><CheckCircle2 size={14} /> Tersalin</> : <><Copy size={14} /> Salin</>}
                  </button>
                )}
              </div>
              <div className="prose prose-sm md:prose-base max-w-none text-[var(--color-text-body)] leading-relaxed prose-p:my-3">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{notesText || "Menulis catatan..."}</ReactMarkdown>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-[var(--color-brand-400)] justify-center py-4">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm font-medium">Sedang memproses teks...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

