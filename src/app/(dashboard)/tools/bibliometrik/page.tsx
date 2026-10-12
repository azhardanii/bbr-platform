"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Network, Loader2, ArrowLeft, Download, RefreshCw, FileText } from "lucide-react";
import { useJenjang } from "@/hooks/useJenjang";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toPng } from "html-to-image";
import NetworkGraph, { GraphData } from "@/components/NetworkGraph";

export default function BibliometrikPage() {
  const { labelLower, judulTugasAkhir } = useJenjang();
  const currentYear = new Date().getFullYear().toString();
  const [formData, setFormData] = useState({
    keyword: "",
    tahunAwal: "2019",
    tahunAkhir: currentYear,
    fokus: "Mencari Research Gap (Celah Penelitian)",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysisText, setAnalysisText] = useState("");
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);

  const handleGenerateKeywords = async () => {
    if (!judulTugasAkhir) {
      alert("Kamu belum menyimpan judul tugas akhir.");
      return;
    }

    setIsGeneratingKeywords(true);
    try {
      const res = await fetch("/api/ai/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judul: judulTugasAkhir })
      });
      if (!res.ok) throw new Error("Gagal generate kata kunci");
      const data = await res.json();
      if (data.keywords) {
        setFormData(prev => ({ ...prev, keyword: data.keywords.replace(/`/g, "").trim() }));
      }
    } catch (err) {
      console.error(err);
      alert("Gagal mengekstrak kata kunci dari judul.");
    } finally {
      setIsGeneratingKeywords(false);
    }
  };
  const graphContainerRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!formData.keyword) {
      alert("Mohon masukkan kata kunci penelitian.");
      return;
    }

    setIsLoading(true);
    setError("");
    setAnalysisText("");
    setGraphData(null);

    const generatedPrompt = `Saya ingin melakukan analisis bibliometrik sederhana untuk State of the Art (SOTA) ${labelLower} saya.

**Kata Kunci / Topik:** ${formData.keyword}
**Rentang Waktu:** ${formData.tahunAwal} - ${formData.tahunAkhir}
**Fokus Analisis:** ${formData.fokus}`;

    try {
      let data: any = null;
      let lastErrorMessage = "Gagal mengambil data dari server";

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const res = await fetch("/api/ai/bibliometrik", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: generatedPrompt })
          });

          if (res.ok) {
            data = await res.json();
            break;
          }

          let serverDetail = "";
          try {
            const errBody = await res.json();
            serverDetail = errBody.error || errBody.message || "";
          } catch (_) {}

          if (res.status === 401) {
            lastErrorMessage = serverDetail || "Sesi login Anda telah berakhir. Silakan muat ulang halaman dan login kembali.";
            break;
          } else if (res.status === 429) {
            lastErrorMessage = serverDetail || "Kuota penggunaan Bibliometrik Anda sudah habis. Silakan periksa paket atau hubungi admin.";
            break;
          } else {
            lastErrorMessage = serverDetail || `Server mengembalikan status ${res.status}. Silakan coba lagi.`;
          }
        } catch (fetchErr: any) {
          lastErrorMessage = fetchErr?.message || "Gagal terhubung ke server. Periksa koneksi internet Anda.";
        }

        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }

      if (data && data.analysis && data.graph) {
        setAnalysisText(data.analysis);
        setGraphData(data.graph);
      } else {
        throw new Error(lastErrorMessage || "Format respons tidak valid dari AI");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat respons AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!graphContainerRef.current) return;

    try {
      const node = graphContainerRef.current.querySelector('.network-graph-container') as HTMLElement;
      if (!node) return;

      const dataUrl = await toPng(node, {
        cacheBust: true,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `bibliometrik-${formData.keyword.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'graph'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
      alert('Gagal mengunduh gambar. Silakan coba lagi.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-12">
      <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors mb-2">
        <ArrowLeft size={16} /> Kembali
      </Link>
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)]">Bibliometrik Generator</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">Petakan tren penelitian dan temukan celah (research gap) untuk topik tugas akhirmu dengan mudah.</p>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] p-6 rounded-2xl shadow-sm">
        <h2 className="font-semibold text-lg text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <Network size={20} className="text-[var(--color-brand-600)]" /> Parameter Riset
        </h2>

        <div className="space-y-4">
          <div>
            <div className="flex flex-row items-center justify-between gap-2 mb-2">
              <label className="block text-sm font-semibold text-[var(--color-text-body)] mb-0">Kata Kunci Utama <span className="text-[var(--color-error)]">*</span></label>
              {judulTugasAkhir && (
                <button
                  onClick={handleGenerateKeywords}
                  disabled={isGeneratingKeywords}
                  className="w-auto shrink-0 text-xs flex justify-center items-center gap-1.5 text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] bg-[var(--color-brand-50)] px-3 py-1.5 rounded-md transition-colors font-semibold disabled:opacity-50 border border-[var(--color-brand-100)]"
                  title="Ekstrak kata kunci dari judul yang tersimpan"
                >
                  {isGeneratingKeywords ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                  Auto-Generate dari Judul
                </button>
              )}
            </div>
            <input
              value={formData.keyword}
              onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
              placeholder="Contoh: Green Accounting, Keamanan Siber, Kurikulum Merdeka..."
              className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Tahun Awal</label>
              <input
                type="number"
                value={formData.tahunAwal}
                onChange={(e) => setFormData({ ...formData, tahunAwal: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Tahun Akhir</label>
              <input
                type="number"
                value={formData.tahunAkhir}
                onChange={(e) => setFormData({ ...formData, tahunAkhir: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Fokus Pencarian</label>
            <select
              value={formData.fokus}
              onChange={(e) => setFormData({ ...formData, fokus: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white transition-colors"
            >
              <option value="Mencari Research Gap (Celah Penelitian)">Mencari Research Gap</option>
              <option value="Pemetaan Tren Topik (Co-occurrence)">Pemetaan Tren Topik</option>
              <option value="Mencari Novelty (Kebaruan)">Mencari Novelty (Kebaruan)</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3.5 bg-[var(--color-brand-600)] text-white font-semibold rounded-xl hover:bg-[var(--color-brand-500)] transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? <><Loader2 className="animate-spin" size={18} /> Membangun Bibliometrik...</> : <><Network size={18} /> Buat Peta Bibliometrik</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-lg transition-colors whitespace-nowrap self-end sm:self-auto disabled:opacity-50"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {graphData && (
        <div className="flex flex-col gap-6 animate-in zoom-in-95 duration-500">
          {/* Bagian Visualisasi (Kiri/Atas) */}
          <div className="bg-white border-2 border-[var(--color-brand-100)] p-5 rounded-2xl shadow-sm flex flex-col h-[700px]" ref={graphContainerRef}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[var(--color-brand-600)] flex items-center gap-2">
                <Network size={20} /> VOSviewer-style Map
              </h3>
              <button
                onClick={downloadImage}
                className="px-4 py-2 bg-[var(--color-brand-50)] text-[var(--color-brand-700)] hover:bg-[var(--color-brand-100)] text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors border border-[var(--color-brand-200)]"
              >
                <Download size={16} /> Unduh Gambar
              </button>
            </div>

            <div className="flex-1 relative bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
              {/* Tempat Graf D3 */}
              <NetworkGraph data={graphData} />

              <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none">
                <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs font-medium text-gray-500 border border-gray-200 shadow-sm pointer-events-auto">
                  Tarik node untuk mengatur layout &middot; Scroll untuk Zoom
                </div>
              </div>
            </div>
          </div>

          {/* Bagian Analisis (Kanan/Bawah) */}
          <div className="bg-white border-2 border-[var(--color-brand-100)] p-5 rounded-2xl shadow-sm flex flex-col h-[700px]">
            <h3 className="font-bold text-lg text-[var(--color-brand-600)] flex items-center gap-2 mb-4 shrink-0">
              <FileText size={20} /> Hasil Analisis Akademik
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="prose prose-sm md:prose-base max-w-none text-[var(--color-text-body)] leading-relaxed pb-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysisText}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

