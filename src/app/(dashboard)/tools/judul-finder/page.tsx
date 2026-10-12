"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Loader2, ArrowLeft, Save, Edit2, CheckCircle2, RefreshCw, BookOpen } from "lucide-react";
import { useJenjang } from "@/hooks/useJenjang";

type JudulResult = {
  judul: string;
  deskripsi: string;
  referensi: string[];
};

export default function JudulFinderPage() {
  const { labelLower, jurusan, saveJudul, judulTugasAkhir } = useJenjang();
  const [formData, setFormData] = useState({
    judulSaatIni: "",
    tujuanKarier: "",
    topik: "",
    masalah: "",
    objek: "",
    metode: "Kuantitatif",
  });
  
  const isCheckerMode = !!judulTugasAkhir;
  
  useEffect(() => {
    setFormData(prev => ({...prev, judulSaatIni: judulTugasAkhir || ""}));
  }, [judulTugasAkhir]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<JudulResult[]>([]);
  
  // States for inline editing
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleGenerate = async () => {
    if (isCheckerMode && !formData.judulSaatIni) {
      alert("Mohon masukkan judul yang ingin dievaluasi.");
      return;
    }
    if (!isCheckerMode && (!formData.topik || !formData.masalah)) {
      alert("Mohon isi topik dan masalah terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResults([]);
    setEditingIndex(null);

    const generatedPrompt = isCheckerMode 
      ? `Saya mahasiswa tingkat akhir jurusan ${jurusan || "Umum"} yang sudah memiliki draf judul ${labelLower}.
Judul saya saat ini: "${formData.judulSaatIni}"

Konteks (Opsional):
Topik/Minat Kajian: ${formData.topik || "-"}
Masalah di Lapangan: ${formData.masalah || "-"}
Objek Penelitian: ${formData.objek || "-"}
Preferensi Metode: ${formData.metode}

Tolong periksa kelayakan judul saya saat ini secara akademis. Kemudian, berikan 3 alternatif pembenahan atau variasi yang lebih tajam/baik dari judul tersebut, beserta evaluasi mengapa variasi tersebut lebih baik.`
      : `Saya mahasiswa tingkat akhir yang sedang mencari judul ${labelLower}.
Mohon bantu saya merumuskan 3 alternatif judul ${labelLower} yang menarik, akademis, dan dapat diteliti berdasarkan informasi berikut:

**Jurusan/Program Studi:** ${jurusan || "Umum"}
**Topik/Minat Kajian:** ${formData.topik}
**Masalah di Lapangan (Fenomena):** ${formData.masalah}
**Objek Penelitian (Target/Lokasi):** ${formData.objek || "Belum ditentukan"}
**Tujuan Karier/Aspirasi (Opsional):** ${formData.tujuanKarier || "Belum ditentukan"}
**Preferensi Metode:** ${formData.metode}`;

    try {
      let data: any = null;
      let lastErrorMessage = "Gagal mengambil data dari server";

      // Automatic retry loop: attempt up to 2 times for transient network/server hiccups
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const res = await fetch("/api/ai/judul", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: generatedPrompt, jenjang: labelLower })
          });
          
          if (res.ok) {
            data = await res.json();
            break;
          }

          // Read server error details
          let serverDetail = "";
          try {
            const errBody = await res.json();
            serverDetail = errBody.error || errBody.message || "";
          } catch (_) {}

          if (res.status === 401) {
            lastErrorMessage = serverDetail || "Sesi login Anda telah berakhir. Silakan muat ulang halaman dan login kembali.";
            break; // Don't retry on auth error
          } else if (res.status === 429) {
            lastErrorMessage = serverDetail || "Kuota penggunaan Judul Finder Anda sudah habis. Silakan periksa paket atau hubungi admin.";
            break; // Don't retry on quota error
          } else if (res.status === 504) {
            lastErrorMessage = "Server AI membutuhkan waktu lebih lama dari biasanya (Timeout). Sedang mencoba kembali...";
          } else {
            lastErrorMessage = serverDetail || `Server mengembalikan status ${res.status}. Silakan coba lagi.`;
          }
        } catch (fetchErr: any) {
          lastErrorMessage = fetchErr?.message || "Gagal terhubung ke server. Periksa koneksi internet Anda.";
        }

        if (attempt < 2) {
          // Wait 1.5s before automatic retry
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
      
      if (Array.isArray(data) && data.length > 0) {
        setResults(data);
      } else {
        throw new Error(lastErrorMessage || "Format respons tidak valid dari AI");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat respons AI. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = (judul: string) => {
    saveJudul(judul);
    alert(`Judul berhasil disimpan sebagai judul ${labelLower} kamu!`);
  };

  const startEdit = (index: number, currentJudul: string) => {
    setEditingIndex(index);
    setEditValue(currentJudul);
  };

  const saveEdit = (index: number) => {
    const newResults = [...results];
    newResults[index].judul = editValue;
    setResults(newResults);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-12">
      <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors mb-2">
        <ArrowLeft size={16} /> Kembali
      </Link>
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)]">
          {isCheckerMode ? "Judul Checker & Alternatif" : "Judul Finder"}
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-2">
          {isCheckerMode 
            ? `Evaluasi kelayakan draf judul ${labelLower} Kamu dan dapatkan saran alternatif yang lebih baik.` 
            : `Temukan inspirasi judul ${labelLower} dengan dukungan AI dan setidaknya 5 sumber referensi valid.`}
        </p>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] p-6 rounded-2xl shadow-sm">
        <h2 className="font-semibold text-lg text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <Search size={20} className="text-[var(--color-brand-600)]" /> Form Informasi Penelitian
        </h2>
        
        <div className="space-y-4">
          {isCheckerMode && (
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Judul Kamu Saat Ini <span className="text-[var(--color-error)]">*</span></label>
              <textarea 
                value={formData.judulSaatIni}
                onChange={(e) => setFormData({...formData, judulSaatIni: e.target.value})}
                placeholder="Masukkan judul yang ingin dicek/dievaluasi..."
                className="w-full px-4 py-3 font-bold text-[var(--color-brand-700)] rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-[var(--color-brand-50)] h-24 resize-none transition-colors" 
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Target Karier (Opsional)</label>
              <input 
                value={formData.tujuanKarier}
                onChange={(e) => setFormData({...formData, tujuanKarier: e.target.value})}
                placeholder="Contoh: Ahli Data, Pengusaha, dsb."
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white transition-colors" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Topik / Minat Kajian {!isCheckerMode && <span className="text-[var(--color-error)]">*</span>}</label>
              <input 
                value={formData.topik}
                onChange={(e) => setFormData({...formData, topik: e.target.value})}
                placeholder="Contoh: Digital Marketing, Kinerja Karyawan..."
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white transition-colors" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Masalah di Lapangan / Fenomena {!isCheckerMode && <span className="text-[var(--color-error)]">*</span>}</label>
            <textarea 
              value={formData.masalah}
              onChange={(e) => setFormData({...formData, masalah: e.target.value})}
              placeholder="Ceritakan singkat fenomena atau masalah yang membuatmu tertarik meneliti topik ini..."
              className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white h-24 resize-none transition-colors" 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Objek / Lokasi Penelitian (Opsional)</label>
              <input 
                value={formData.objek}
                onChange={(e) => setFormData({...formData, objek: e.target.value})}
                placeholder="Contoh: PT. ABC, Mahasiswa Gen Z..."
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white transition-colors" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Preferensi Metode</label>
              <select 
                value={formData.metode}
                onChange={(e) => setFormData({...formData, metode: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white transition-colors"
              >
                <option value="Kuantitatif">Kuantitatif (Kuesioner, Angka)</option>
                <option value="Kualitatif">Kualitatif (Wawancara, Observasi)</option>
                <option value="Mixed Methods">Campuran (Mixed Methods)</option>
                <option value="Belum Tahu">Belum Tahu / Terserah AI</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3.5 bg-[var(--color-brand-600)] text-white font-semibold rounded-xl hover:bg-[var(--color-brand-500)] transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? <><Loader2 className="animate-spin" size={18} /> {isCheckerMode ? "Mengevaluasi & Menyusun Alternatif..." : "Sedang Mencari Referensi & Menyusun Judul..."}</> : <><Search size={18} /> {isCheckerMode ? "Evaluasi & Beri Alternatif" : "Minta AI Temukan Judul"}</>}
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

      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl text-[var(--color-text-primary)]">Rekomendasi Judul</h3>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-body)] hover:bg-[var(--color-bg-muted)] flex items-center gap-2 transition-colors border border-[var(--color-bg-muted)]"
            >
              <RefreshCw size={16} /> Cari Lainnya
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {results.map((item, index) => {
              const isSaved = judulTugasAkhir === item.judul;
              const isEditing = editingIndex === index;
              
              return (
                <div key={index} className="bg-white border-2 border-[var(--color-brand-100)] p-6 rounded-2xl shadow-sm transition-all hover:shadow-md hover:-translate-y-1 animate-in zoom-in-95 duration-300">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div className="flex-1 w-full">
                      {isEditing ? (
                        <div className="flex flex-col gap-3">
                          <textarea 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-4 py-3 font-bold text-lg rounded-xl border-2 border-[var(--color-brand-300)] focus:border-[var(--color-brand-600)] outline-none min-h-[100px] resize-none"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button onClick={() => saveEdit(index)} className="px-4 py-2 bg-[var(--color-brand-600)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--color-brand-500)] shadow-sm">Simpan Teks</button>
                            <button onClick={() => setEditingIndex(null)} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200">Batal</button>
                          </div>
                        </div>
                      ) : (
                        <h3 className="font-bold text-xl md:text-2xl text-[var(--color-text-primary)] leading-snug">{item.judul}</h3>
                      )}
                    </div>
                    
                    {!isEditing && (
                      <div className="flex flex-wrap gap-2 md:shrink-0 mt-2 md:mt-0">
                        <button 
                          onClick={() => startEdit(index, item.judul)}
                          className="px-4 py-2.5 text-sm font-semibold rounded-xl text-[var(--color-text-body)] bg-[var(--color-bg-surface)] border-2 border-[var(--color-bg-muted)] hover:border-[var(--color-brand-300)] hover:text-[var(--color-brand-600)] flex items-center gap-2 transition-colors"
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                        <button 
                          onClick={() => handleSave(item.judul)}
                          className={`px-5 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all shadow-sm ${
                            isSaved 
                              ? "bg-green-100 text-green-700 border-2 border-green-200"
                              : "bg-[var(--color-brand-600)] text-white border-2 border-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)] hover:border-[var(--color-brand-500)] hover:scale-105"
                          }`}
                        >
                          {isSaved ? <><CheckCircle2 size={16} /> Dipilih</> : <><Save size={16} /> Jadikan Judul</>}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-5 bg-[var(--color-brand-50)]/50 p-4 rounded-xl border border-[var(--color-brand-100)]">
                    <h4 className="text-xs font-bold text-[var(--color-brand-700)] uppercase tracking-wider mb-2">💡 Mengapa Judul Ini Menarik?</h4>
                    <p className="text-[var(--color-text-body)] leading-relaxed text-sm md:text-base">{item.deskripsi}</p>
                  </div>
                  
                  <div className="bg-[var(--color-bg-surface)] p-5 rounded-xl border-2 border-[var(--color-bg-muted)]">
                    <h4 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-3 border-b pb-3 border-[var(--color-bg-muted)]">
                      <BookOpen size={18} className="text-[var(--color-brand-600)]" />
                      Referensi Pendukung (Minimal 5)
                    </h4>
                    <ul className="space-y-3">
                      {item.referensi && item.referensi.map((ref, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-[var(--color-text-body)] items-start">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] flex items-center justify-center font-bold text-xs mt-0.5">{idx + 1}</span>
                          <span className="leading-relaxed">{ref}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

