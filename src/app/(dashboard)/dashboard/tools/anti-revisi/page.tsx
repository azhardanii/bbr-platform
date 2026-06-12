"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckSquare, Square, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { useJenjang } from "@/hooks/useJenjang";

export default function AntiRevisiPage() {
  const { labelLower } = useJenjang();

  const CHECKLIST_DATA = [
    {
      bab: 1,
      title: "Pendahuluan",
      items: [
        { id: "1.1", text: "Latar belakang memuat data empiris/fenomena gap yang kuat (maksimal 3-5 tahun terakhir)", desc: "Buka halaman awal Bab 1. Cari paragraf yang menyajikan data statistik angka atau kutipan berita terkini. Pastikan tahun datanya tidak lebih tua dari 5 tahun terakhir." },
        { id: "1.2", text: "Rumusan masalah sinkron dengan tujuan penelitian", desc: "Sandingkan bagian Rumusan Masalah (pertanyaan) dengan Tujuan Penelitian (pernyataan). Jumlah poinnya harus persis sama (1-to-1 mapping)." },
        { id: "1.3", text: "Manfaat penelitian mencakup aspek teoretis dan praktis", desc: "Pastikan ada sub-judul eksplisit 'Manfaat Teoretis' (untuk akademis) dan 'Manfaat Praktis' (untuk instansi/masyarakat)." }
      ]
    },
    {
      bab: 2,
      title: "Tinjauan Pustaka",
      items: [
        { id: "2.1", text: "Grand theory dijelaskan relevansinya dengan variabel penelitian", desc: "Cari bagian teori utama. Pastikan ada paragraf yang secara gamblang menjelaskan alasan mengapa teori tersebut cocok membedah masalah penelitian ini." },
        { id: "2.2", text: "Penelitian terdahulu disajikan dalam bentuk matriks/tabel mapping", desc: `Cek keberadaan tabel yang merangkum minimal 5 jurnal terdahulu: nama peneliti, tahun, judul, hasil, dan letak PERBEDAANNYA dengan ${labelLower} Anda.` },
        { id: "2.3", text: "Kerangka konseptual memuat semua variabel dan arah hubungan dengan jelas", desc: "Lihat gambar bagan Anda. Pastikan jumlah kotaknya sesuai dengan variabel yang diteliti dan arah panahnya logis (dari X ke Y)." }
      ]
    },
    {
      bab: 3,
      title: "Metode Penelitian",
      items: [
        { id: "3.1", text: "Populasi dan sampel didefinisikan beserta teknik samplingnya", desc: "Pastikan ada angka spesifik total sampel dan sebutkan rumusnya (misal: Slovin/Hair) beserta sitasi sumber rujukannya." },
        { id: "3.2", text: "Definisi operasional variabel mencakup indikator dan skala pengukuran", desc: "Cek tabel definisi operasional. Wajib memuat kolom Konsep Variabel, Indikator Pengukuran, dan jenis Skala (Ordinal/Nominal/Interval/Rasio)." },
        { id: "3.3", text: "Teknik analisis data sinkron dengan hipotesis yang diajukan", desc: "Cek kesesuaian alat uji: Jika hipotesis menguji 'pengaruh', pastikan ada analisis Regresi. Jika 'perbedaan', pastikan ada Uji Beda (T-test/ANOVA)." }
      ]
    },
    {
      bab: 4,
      title: "Hasil dan Pembahasan",
      items: [
        { id: "4.1", text: "Karakteristik responden/objek disajikan secara komprehensif", desc: "Pastikan ada pie-chart atau tabel distribusi frekuensi demografi responden (usia, gender, jabatan) di awal Bab 4." },
        { id: "4.2", text: "Hasil uji asumsi klasik/prasyarat terpenuhi (untuk penelitian kuantitatif)", desc: "Pastikan hasil Normalitas, Multikolinearitas, dan Heteroskedastisitas dilampirkan dan semua keterangannya 'Lolos/Memenuhi Syarat'." },
        { id: "4.3", text: "Pembahasan membandingkan temuan dengan penelitian terdahulu secara kritis", desc: "Pada setiap paragraf analisis hasil hipotesis, WAJIB ada kalimat penguat: 'Hasil ini sejalan/berlawanan dengan penelitian Si A (Tahun)...'." }
      ]
    },
    {
      bab: 5,
      title: "Kesimpulan dan Saran",
      items: [
        { id: "5.1", text: "Kesimpulan menjawab rumusan masalah secara langsung", desc: "Bandingkan isi kesimpulan dengan rumusan masalah di Bab 1. Jangan sertakan tabel output atau angka t-hitung lagi di bab ini." },
        { id: "5.2", text: "Saran bersifat aplikatif, spesifik, dan tidak klise", desc: "Hindari kata normatif 'diharapkan lebih baik'. Berikan saran konkrit: 'Instansi X sebaiknya mengubah jam kerja menjadi Y untuk mengatasi Z'." },
        { id: "5.3", text: "Keterbatasan penelitian disebutkan dengan jujur", desc: "Tuliskan kelemahan metode atau kendala data yang tidak bisa Anda cover agar bisa menjadi referensi riset lanjutan bagi pembaca." }
      ]
    }
  ];

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 1: true });

  useEffect(() => {
    const saved = localStorage.getItem("bbr_antirevisi");
    if (saved) {
      try { setCheckedItems(JSON.parse(saved)); } catch(e) {}
    }
  }, []);

  const toggleItem = (id: string) => {
    const newChecked = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(newChecked);
    localStorage.setItem("bbr_antirevisi", JSON.stringify(newChecked));
  };

  const toggleBab = (bab: number) => {
    setExpanded({ ...expanded, [bab]: !expanded[bab] });
  };

  const totalItems = CHECKLIST_DATA.reduce((acc, curr) => acc + curr.items.length, 0);
  const completedItems = Object.values(checkedItems).filter(Boolean).length;
  const progressPct = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-10">
      <Link href="/dashboard/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors mb-2">
        <ArrowLeft size={16} /> Kembali
      </Link>
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)]">Anti-Revisi Kit</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">Checklist mandiri sebelum bimbingan atau sidang untuk meminimalisir revisi mayor dari Dosen.</p>
      </div>

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] p-6 rounded-2xl shadow-sm mb-6 sticky top-4 z-10">
        <div className="flex justify-between text-sm font-semibold mb-2">
          <span className="text-[var(--color-text-body)]">Kesiapan Naskah</span>
          <span className="text-[var(--color-brand-600)]">{progressPct}%</span>
        </div>
        <div className="w-full bg-white h-4 rounded-full overflow-hidden border border-[var(--color-bg-muted)]">
          <div 
            className="bg-[var(--color-brand-600)] h-full transition-all duration-500 rounded-full" 
            style={{ width: `${progressPct}%` }} 
          />
        </div>
      </div>

      <div className="space-y-4">
        {CHECKLIST_DATA.map((babData) => {
          const babItems = babData.items.length;
          const babCompleted = babData.items.filter(i => checkedItems[i.id]).length;
          const isExpanded = expanded[babData.bab];

          return (
            <div key={babData.bab} className="bg-white border-2 border-[var(--color-bg-muted)] rounded-2xl overflow-hidden transition-all">
              <div 
                className="p-5 flex items-center justify-between cursor-pointer bg-[var(--color-bg-surface)] hover:bg-[var(--color-brand-50)] transition-colors"
                onClick={() => toggleBab(babData.bab)}
              >
                <div>
                  <h3 className="font-bold text-[var(--color-text-primary)] text-lg">Bab {babData.bab}: {babData.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">{babCompleted} dari {babItems} kriteria terpenuhi</p>
                </div>
                {isExpanded ? <ChevronUp className="text-[var(--color-text-secondary)]" /> : <ChevronDown className="text-[var(--color-text-secondary)]" />}
              </div>
              
              {isExpanded && (
                <div className="p-5 space-y-4 border-t-2 border-[var(--color-bg-muted)]">
                  {babData.items.map(item => (
                    <div 
                      key={item.id} 
                      className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-colors border ${checkedItems[item.id] ? 'bg-[var(--color-brand-50)] border-[var(--color-brand-100)]' : 'bg-white border-[var(--color-bg-muted)] hover:border-[var(--color-brand-400)]'}`}
                      onClick={() => toggleItem(item.id)}
                    >
                      <div className="mt-0.5 text-[var(--color-brand-600)] shrink-0">
                        {checkedItems[item.id] ? <CheckSquare size={20} /> : <Square size={20} className="text-[var(--color-text-disabled)]" />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${checkedItems[item.id] ? 'text-[var(--color-brand-600)] line-through opacity-70' : 'text-[var(--color-text-primary)]'}`}>
                          {item.text}
                        </p>
                        <p className={`text-xs mt-1.5 leading-relaxed bg-white p-2.5 rounded-lg border border-[var(--color-bg-muted)] shadow-sm ${checkedItems[item.id] ? 'opacity-60' : 'text-[var(--color-text-secondary)]'}`}>
                          <span className="font-semibold text-amber-700">📌 Cara Cek: </span>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
