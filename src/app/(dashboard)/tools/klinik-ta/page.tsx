"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CheckSquare, Square, ChevronDown, ChevronUp, ArrowLeft, UploadCloud, Loader2, Sparkles, CheckCircle2, XCircle, FileText, Info } from "lucide-react";
import { useJenjang } from "@/hooks/useJenjang";

export default function AntiRevisiPage() {
  const { label, labelLower } = useJenjang();

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
        { id: "2.2", text: "Penelitian terdahulu disajikan dalam bentuk matriks/tabel mapping", desc: `Cek keberadaan tabel yang merangkum minimal 5 jurnal terdahulu: nama peneliti, tahun, judul, hasil, dan letak PERBEDAANNYA dengan ${labelLower} Kamu.` },
        { id: "2.3", text: "Kerangka konseptual memuat semua variabel dan arah hubungan dengan jelas", desc: "Lihat gambar bagan Kamu. Pastikan jumlah kotaknya sesuai dengan variabel yang diteliti dan arah panahnya logis (dari X ke Y)." }
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
        { id: "5.3", text: "Keterbatasan penelitian disebutkan dengan jujur", desc: "Tuliskan kelemahan metode atau kendala data yang tidak bisa Kamu cover agar bisa menjadi referensi riset lanjutan bagi pembaca." }
      ]
    }
  ];

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 1: true });

  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState("");
  
  // State to hold AI feedback per item ID
  const [aiSummary, setAiSummary] = useState<string>("");
  const [aiFeedback, setAiFeedback] = useState<Record<string, { pass: boolean, reason: string, suggestion: string }>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("bbr_evaluasinaskah");
    if (saved) {
      try { setCheckedItems(JSON.parse(saved)); } catch(e) {}
    }
    const savedFeedback = localStorage.getItem("bbr_evaluasinaskah_feedback");
    if (savedFeedback) {
      try { setAiFeedback(JSON.parse(savedFeedback)); } catch(e) {}
    }
    const savedSummary = localStorage.getItem("bbr_evaluasinaskah_summary");
    if (savedSummary) {
      setAiSummary(savedSummary);
    }
  }, []);

  const toggleItem = (id: string) => {
    const newChecked = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(newChecked);
    localStorage.setItem("bbr_evaluasinaskah", JSON.stringify(newChecked));
  };

  const toggleBab = (bab: number) => {
    setExpanded({ ...expanded, [bab]: !expanded[bab] });
  };

  const totalItems = CHECKLIST_DATA.reduce((acc, curr) => acc + curr.items.length, 0);
  const completedItems = Object.values(checkedItems).filter(Boolean).length;
  const progressPct = Math.round((completedItems / totalItems) * 100);

  const extractTextFromPDF = async (file: File) => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\\n";
    }
    return fullText;
  };

  const processFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Mohon upload file PDF.");
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      setAnalyzeStatus("Menyiapkan rekam medis dari PDF (proses ini aman dan lokal)...");
      const extractedText = await extractTextFromPDF(file);
      
      setAnalyzeStatus("Dokter AI sedang membaca dan mendiagnosis seluruh drafmu secara mendalam...");
      const response = await fetch("/api/ai/klinik-ta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText, jenjang: label }),
      });
      
      if (!response.ok) {
        throw new Error("Gagal memproses file.");
      }
      
      const result = await response.json();
      
      if (result.items) {
        setAiFeedback(result.items);
        localStorage.setItem("bbr_evaluasinaskah_feedback", JSON.stringify(result.items));
        
        // Auto-check items based on AI review
        const newChecked = { ...checkedItems };
        let newExpanded = { ...expanded };
        
        Object.keys(result.items).forEach((id) => {
          newChecked[id] = result.items[id].pass;
          // auto expand bab if it has failing items
          if (!result.items[id].pass) {
             const babNum = parseInt(id.split(".")[0]);
             if (babNum) newExpanded[babNum] = true;
          }
        });
        
        setCheckedItems(newChecked);
        setExpanded(newExpanded);
        localStorage.setItem("bbr_evaluasinaskah", JSON.stringify(newChecked));
      }
      
      if (result.summary) {
         setAiSummary(result.summary);
         localStorage.setItem("bbr_evaluasinaskah_summary", result.summary);
      }
      
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menganalisis naskah. Pastikan PDF tidak dipassword atau berukuran terlalu ekstrim.");
    } finally {
      setIsAnalyzing(false);
      setAnalyzeStatus("");
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleClearAI = () => {
    setAiFeedback({});
    setAiSummary("");
    localStorage.removeItem("bbr_evaluasinaskah_feedback");
    localStorage.removeItem("bbr_evaluasinaskah_summary");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-10">
      <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors mb-2">
        <ArrowLeft size={16} /> Kembali
      </Link>
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)]">Klinik Tugas Akhir</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">Check-up kesehatan draf Tugas Akhirmu sebelum bimbingan atau sidang untuk mencegah komplikasi "Revisi Mayor".</p>
      </div>

      {!isAnalyzing && Object.keys(aiFeedback).length === 0 && (
        <div 
          className={`border-2 border-dashed rounded-3xl p-8 transition-all ${isDragging ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)]' : 'border-[var(--color-bg-muted)] bg-white hover:border-[var(--color-brand-300)]'}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 shrink-0 bg-[var(--color-brand-50)] rounded-full flex items-center justify-center">
              <Sparkles size={28} className="text-[var(--color-brand-600)]" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-bold text-lg text-[var(--color-text-primary)] mb-1">Biar Dokter AI yang Lakukan Check-Up!</h3>
              <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                Upload full draf {label} (PDF). Dokter AI akan membaca keseluruhan drafmu dan mendiagnosis kelayakannya secara otomatis ke dalam rekam medis di bawah.
              </p>
              
              <input 
                type="file" 
                accept="application/pdf"
                className="hidden" 
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    processFile(e.target.files[0]);
                  }
                }}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 bg-[var(--color-brand-600)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--color-brand-500)] transition-colors shadow-sm inline-flex items-center gap-2"
              >
                <UploadCloud size={16} /> Upload & Auto-Check
              </button>
            </div>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="bg-white border-2 border-[var(--color-brand-100)] rounded-3xl p-10 text-center shadow-sm">
          <div className="w-20 h-20 bg-[var(--color-brand-50)] rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 size={32} className="text-[var(--color-brand-600)] animate-spin" />
          </div>
          <h3 className="font-bold text-xl text-[var(--color-text-primary)] mb-2">Mendiagnosis Draf...</h3>
          <p className="text-[var(--color-text-secondary)] mb-2 max-w-md mx-auto text-sm">
            {analyzeStatus}
          </p>
          <div className="max-w-xs mx-auto mt-6 bg-[var(--color-bg-muted)] h-2 rounded-full overflow-hidden">
            <div className="bg-[var(--color-brand-600)] h-full w-1/2 animate-pulse rounded-full" />
          </div>
        </div>
      )}

      {aiSummary && (
        <div className="bg-gradient-to-r from-[var(--color-brand-50)] to-white border border-[var(--color-brand-100)] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-4 animate-in slide-in-from-bottom-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
              <Sparkles size={18} className="text-[var(--color-brand-600)]"/> Hasil Diagnosis Dokter AI
            </h3>
            <p className="text-[var(--color-text-body)] text-sm leading-relaxed">{aiSummary}</p>
          </div>
          <button 
            onClick={handleClearAI}
            className="px-4 py-2 shrink-0 bg-white border border-[var(--color-bg-muted)] text-sm font-semibold rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors text-[var(--color-text-secondary)]"
          >
            Hapus Rekam Medis
          </button>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-md border border-[var(--color-bg-muted)] p-6 rounded-2xl shadow-sm mb-6 sticky top-4 z-20">
        <div className="flex justify-between text-sm font-semibold mb-2">
          <span className="text-[var(--color-text-body)]">Indeks Kesehatan Draf</span>
          <span className="text-[var(--color-brand-600)]">{progressPct}%</span>
        </div>
        <div className="w-full bg-[var(--color-bg-muted)] h-4 rounded-full overflow-hidden border border-[var(--color-bg-muted)]">
          <div 
            className="bg-[var(--color-brand-600)] h-full transition-all duration-500 rounded-full shadow-sm" 
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
                  {babData.items.map(item => {
                    const feedback = aiFeedback[item.id];
                    const isAiChecked = feedback !== undefined;
                    
                    return (
                    <div 
                      key={item.id} 
                      className={`rounded-xl transition-colors border ${checkedItems[item.id] ? 'bg-[var(--color-brand-50)] border-[var(--color-brand-100)]' : 'bg-white border-[var(--color-bg-muted)] hover:border-[var(--color-brand-400)]'} overflow-hidden`}
                    >
                      <div className="flex items-start gap-4 p-4 cursor-pointer" onClick={() => toggleItem(item.id)}>
                        <div className="mt-0.5 text-[var(--color-brand-600)] shrink-0">
                          {checkedItems[item.id] ? <CheckSquare size={20} /> : <Square size={20} className="text-[var(--color-text-disabled)]" />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${checkedItems[item.id] ? 'text-[var(--color-brand-600)] line-through opacity-70' : 'text-[var(--color-text-primary)]'}`}>
                            {item.text}
                          </p>
                          {!feedback && (
                            <p className={`text-xs mt-1.5 leading-relaxed bg-white p-2.5 rounded-lg border border-[var(--color-bg-muted)] shadow-sm ${checkedItems[item.id] ? 'opacity-60' : 'text-[var(--color-text-secondary)]'}`}>
                              <span className="font-semibold text-amber-700">📌 Cara Cek: </span>
                              {item.desc}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* AI Feedback Inline Panel */}
                      {feedback && (
                        <div className={`p-4 border-t ${feedback.pass ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                           <div className="flex gap-2">
                             {feedback.pass ? (
                               <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5"/>
                             ) : (
                               <XCircle size={18} className="text-red-600 shrink-0 mt-0.5"/>
                             )}
                             <div className="space-y-3">
                               <div>
                                 <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${feedback.pass ? 'text-green-700' : 'text-red-700'}`}>
                                   Diagnosis
                                 </h4>
                                 <p className="text-sm text-[var(--color-text-body)] leading-relaxed">
                                   {feedback.reason}
                                 </p>
                               </div>
                               
                               {feedback.suggestion && (
                                 <div className="bg-white p-3 rounded-xl border border-[var(--color-bg-muted)] shadow-sm">
                                   <h4 className="text-xs font-bold uppercase tracking-wider mb-1 text-amber-700 flex items-center gap-1">
                                     <Sparkles size={12} /> {feedback.pass ? 'Tips Menjaga Kesehatan' : 'Resep Obat (Perbaikan)'}
                                   </h4>
                                   <p className="text-sm text-amber-900 leading-relaxed">
                                     {feedback.suggestion}
                                   </p>
                                 </div>
                               )}
                             </div>
                           </div>
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
