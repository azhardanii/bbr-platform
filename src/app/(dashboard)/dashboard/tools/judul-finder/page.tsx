"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Loader2, ArrowLeft } from "lucide-react";
import { useCompletion } from "ai/react";

export default function JudulFinderPage() {
  const [formData, setFormData] = useState({
    jurusan: "",
    topik: "",
    masalah: "",
    objek: "",
    metode: "Kuantitatif",
    metode: "Kuantitatif",
  });

  const { completion, complete, isLoading, error } = useCompletion({
    api: "/api/ai/judul",
  });

  const handleGenerate = async () => {
    if (!formData.topik || !formData.masalah) {
      alert("Mohon isi topik dan masalah terlebih dahulu.");
      return;
    }

    const generatedPrompt = `Saya mahasiswa tingkat akhir yang sedang mencari judul skripsi.
Mohon bantu saya merumuskan 3 alternatif judul skripsi yang menarik, akademis, dan dapat diteliti berdasarkan informasi berikut:

Jurusan/Program Studi: ${formData.jurusan || "Umum"}
Topik/Minat Kajian: ${formData.topik}
Masalah di Lapangan (Fenomena): ${formData.masalah}
Objek Penelitian (Target/Lokasi): ${formData.objek || "Belum ditentukan"}
Preferensi Metode: ${formData.metode}

Untuk setiap judul berikan:
1. Rumusan Judul (Maks 15 kata)
2. Alasan mengapa judul ini relevan dan penting
3. Variabel Utama (X dan Y) yang diteliti
4. Metode pengumpulan data yang disarankan

Berikan respons dalam bahasa Indonesia yang baku namun mudah dipahami.`;

    await complete(generatedPrompt);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <Link href="/dashboard/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors mb-2">
        <ArrowLeft size={16} /> Kembali
      </Link>
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)]">Judul Finder & Checker</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">Temukan inspirasi judul skripsi atau validasi judul yang sudah kamu punya menggunakan AI.</p>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] p-6 rounded-2xl shadow-sm">
        <h2 className="font-semibold text-lg text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <Search size={20} className="text-[var(--color-brand-600)]" /> Form Informasi Penelitian
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Jurusan / Program Studi</label>
              <input 
                value={formData.jurusan}
                onChange={(e) => setFormData({...formData, jurusan: e.target.value})}
                placeholder="Contoh: Manajemen, Ilmu Komunikasi, dsb."
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Topik atau Minat Kajian</label>
              <input 
                value={formData.topik}
                onChange={(e) => setFormData({...formData, topik: e.target.value})}
                placeholder="Contoh: Digital Marketing, Kinerja Karyawan, dsb."
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Masalah di Lapangan (Fenomena)</label>
            <textarea 
              value={formData.masalah}
              onChange={(e) => setFormData({...formData, masalah: e.target.value})}
              placeholder="Ceritakan singkat fenomena atau masalah yang membuatmu tertarik meneliti topik ini..."
              className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white h-24 resize-none" 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Objek / Lokasi Penelitian (Opsional)</label>
              <input 
                value={formData.objek}
                onChange={(e) => setFormData({...formData, objek: e.target.value})}
                placeholder="Contoh: PT. ABC, Mahasiswa Gen Z..."
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Preferensi Metode</label>
              <select 
                value={formData.metode}
                onChange={(e) => setFormData({...formData, metode: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white"
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
            className="w-full py-3 bg-[var(--color-brand-600)] text-white font-semibold rounded-lg hover:bg-[var(--color-brand-500)] transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <><Loader2 className="animate-spin" size={18} /> Sedang Menyusun Judul...</> : "Minta AI Temukan Judul"}
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
          <h3 className="font-bold text-[var(--color-brand-600)] mb-4">Hasil Generasi Judul:</h3>
          <div className="prose prose-sm md:prose-base max-w-none text-[var(--color-text-body)] whitespace-pre-wrap">
            {completion}
          </div>
        </div>
      )}
    </div>
  );
}
