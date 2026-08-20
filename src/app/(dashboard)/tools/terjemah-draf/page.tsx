"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowLeftRight, Languages, Loader2, Copy, Check, RotateCcw, AlertCircle } from "lucide-react";

type Direction = "id-en" | "en-id";

export default function TerjemahDrafPage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [direction, setDirection] = useState<Direction>("id-en");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLTextAreaElement>(null);

  const charCount = inputText.length;
  const maxChars = 5000;

  const swapDirection = () => {
    setDirection(d => d === "id-en" ? "en-id" : "id-en");
    setInputText(outputText);
    setOutputText(inputText);
  };

  const translate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    setOutputText("");

    try {
      const res = await fetch("/api/ai/terjemah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, direction }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Error ${res.status}`);
      }

      if (!res.body) throw new Error("Stream kosong");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setOutputText(fullText);
        // Auto-scroll output
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
      }
    } catch (e: any) {
      setError(e.message || "Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyOutput = async () => {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setInputText("");
    setOutputText("");
    setError(null);
  };

  const fromLabel = direction === "id-en" ? "🇮🇩 Bahasa Indonesia" : "🇬🇧 English";
  const toLabel = direction === "id-en" ? "🇬🇧 Academic English" : "🇮🇩 Bahasa Indonesia (Akademis)";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-10">
      <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors">
        <ArrowLeft size={16} /> Kembali ke Tools
      </Link>

      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)] flex items-center gap-3">
          <Languages size={32} className="text-[var(--color-brand-600)]" />
          Terjemah Draf Akademis
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-2">
          Terjemahkan draf naskah akademis kamu antara Bahasa Indonesia dan Bahasa Inggris, dengan mempertahankan gaya penulisan ilmiah formal. Cocok untuk keperluan publikasi jurnal internasional.
        </p>
      </div>

      {/* Direction Switcher */}
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex-1 text-center">
          <p className="text-xs text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider mb-1">Dari</p>
          <p className="font-bold text-[var(--color-text-primary)]">{fromLabel}</p>
        </div>
        <button
          onClick={swapDirection}
          title="Balik arah terjemahan"
          className="p-3 bg-white border-2 border-[var(--color-bg-muted)] rounded-xl hover:border-[var(--color-brand-400)] hover:bg-[var(--color-brand-50)] transition-all group"
        >
          <ArrowLeftRight size={20} className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-brand-600)] transition-colors" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-xs text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider mb-1">Ke</p>
          <p className="font-bold text-[var(--color-text-primary)]">{toLabel}</p>
        </div>
      </div>

      {/* Info note */}
      <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-600" />
        <p>
          <strong>Catatan:</strong> Terjemahan AI dirancang untuk mempertahankan gaya ilmiah, bukan terjemahan harfiah. Selalu tinjau ulang hasil terjemahan sebelum digunakan dalam naskah final.
        </p>
      </div>

      {/* Main editor area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-[var(--color-text-body)]">
              Teks Sumber <span className="text-[var(--color-error)]">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${charCount > maxChars ? 'text-red-500' : 'text-[var(--color-text-secondary)]'}`}>
                {charCount.toLocaleString()} / {maxChars.toLocaleString()}
              </span>
              {inputText && (
                <button onClick={reset} className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1 transition-colors">
                  <RotateCcw size={12} /> Reset
                </button>
              )}
            </div>
          </div>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={direction === "id-en"
              ? "Tempel atau ketik teks Bahasa Indonesia di sini...\n\nContoh: Penelitian ini bertujuan untuk mengkaji pengaruh variabel X terhadap Y pada populasi mahasiswa di kota Z."
              : "Paste or type your English text here...\n\nExample: This study aims to examine the influence of variable X on Y among university students in city Z."
            }
            className="flex-1 min-h-64 px-4 py-3 rounded-xl border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white text-sm text-[var(--color-text-primary)] resize-none leading-relaxed transition-colors"
            maxLength={maxChars}
          />
        </div>

        {/* Output */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-[var(--color-text-body)]">Hasil Terjemahan</label>
            {outputText && (
              <button
                onClick={copyOutput}
                className="text-xs text-[var(--color-brand-600)] hover:text-[var(--color-brand-500)] flex items-center gap-1 font-semibold transition-colors"
              >
                {copied ? <><Check size={12} /> Tersalin!</> : <><Copy size={12} /> Salin</>}
              </button>
            )}
          </div>
          <div className={`flex-1 min-h-64 px-4 py-3 rounded-xl border-2 text-sm leading-relaxed relative overflow-hidden ${
            error ? 'border-red-300 bg-red-50' : 'border-[var(--color-bg-muted)] bg-[var(--color-bg-surface)]'
          }`}>
            {isLoading && !outputText && (
              <div className="flex items-center gap-3 text-[var(--color-text-secondary)] mt-2">
                <Loader2 size={18} className="animate-spin text-[var(--color-brand-600)]" />
                <span>Menerjemahkan...</span>
              </div>
            )}
            {error && (
              <div className="flex items-start gap-2 text-red-600">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {outputText ? (
              <textarea
                ref={outputRef}
                readOnly
                value={outputText}
                className="w-full h-full resize-none bg-transparent outline-none text-[var(--color-text-primary)] cursor-text leading-relaxed"
                style={{ minHeight: '240px' }}
              />
            ) : !isLoading && !error && (
              <p className="text-[var(--color-text-disabled)] italic">Hasil terjemahan akan muncul di sini...</p>
            )}
          </div>
        </div>
      </div>

      {/* Translate button */}
      <button
        onClick={translate}
        disabled={isLoading || !inputText.trim() || charCount > maxChars}
        id="btn-terjemah"
        className="w-full py-4 bg-[var(--color-brand-600)] text-white font-bold rounded-xl hover:bg-[var(--color-brand-500)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-3 text-base"
      >
        {isLoading ? (
          <><Loader2 className="animate-spin" size={20} /> Menerjemahkan...</>
        ) : (
          <><Languages size={20} /> Terjemahkan Sekarang</>
        )}
      </button>

      {/* Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { emoji: '📝', title: 'Per Paragraf', desc: 'Terjemahkan paragraf demi paragraf untuk hasil yang lebih akurat dan mudah ditinjau.' },
          { emoji: '🔬', title: 'Periksa Istilah', desc: 'Selalu cek istilah teknis spesifik bidangmu — AI mungkin belum mengenal istilah sangat spesifik.' },
          { emoji: '✍️', title: 'Tulis Ulang', desc: 'Gunakan hasil terjemahan sebagai draft. Tulis ulang dengan gaya bahasamu sendiri.' },
        ].map((tip, i) => (
          <div key={i} className="p-4 bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] rounded-xl">
            <p className="text-lg mb-1">{tip.emoji}</p>
            <p className="font-semibold text-sm text-[var(--color-text-primary)]">{tip.title}</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">{tip.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
