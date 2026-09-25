import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Download, Clock, ArrowRight, CheckCircle2, FileEdit } from "lucide-react";
import { generateThesisDocxBlob, ThesisMetadata, OutlineItem, CitationItem } from "@/lib/thesisDocxCompiler";

interface CompiledDocInfo {
  title: string;
  timestamp: number;
  chaptersCount?: number;
  totalChapters?: number;
  formatPreset?: string;
  isVault?: boolean;
  version?: number;
}

export default function VaultWidget() {
  const [compiledDoc, setCompiledDoc] = useState<CompiledDocInfo | null>(null);
  const [jenjang, setJenjang] = useState<string>("S1");

  const getLabel = () => {
    if (jenjang === "S2") return "Tesis";
    if (jenjang === "S3") return "Disertasi";
    return "Skripsi";
  };
  const label = getLabel();

  useEffect(() => {
    const fetchLatest = () => {
      // 1. Check for compiled doc from Workspace
      const savedCompiled = localStorage.getItem("bbr_compiled_doc");
      if (savedCompiled) {
        try {
          const doc = JSON.parse(savedCompiled);
          setCompiledDoc(doc);
          return;
        } catch {}
      }

      // 2. Fallback to vault files if any
      const savedVault = localStorage.getItem("bbr_vault_files");
      if (savedVault) {
        try {
          const files = JSON.parse(savedVault);
          if (files && files.length > 0) {
            files.sort((a: { timestamp: number }, b: { timestamp: number }) => b.timestamp - a.timestamp);
            setCompiledDoc({
              title: files[0].name,
              timestamp: files[0].timestamp,
              version: files[0].version || 1,
              chaptersCount: 5,
              formatPreset: "Standar 4-4-3-3",
              isVault: true,
            });
            return;
          }
        } catch {}
      }

      setCompiledDoc(null);

      const ob = localStorage.getItem("bbr_onboarding");
      if (ob) {
        try {
          const parsedOb = JSON.parse(ob);
          if (parsedOb.jenjang) setJenjang(parsedOb.jenjang);
        } catch (e) {}
      }
    };

    fetchLatest();
    window.addEventListener("storage", fetchLatest);
    window.addEventListener("bbr-compiled-updated", fetchLatest);
    return () => {
      window.removeEventListener("storage", fetchLatest);
      window.removeEventListener("bbr-compiled-updated", fetchLatest);
    };
  }, []);

  const handleDownload = async () => {
    if (!compiledDoc) return;
    const cleanTitle = (compiledDoc.title || `Draf_${label}_Lengkap_Compiled`).replace(/\.docx?$/i, '').trim();
    const docFileName = `${cleanTitle}.docx`;
    
    // Check if we have saved compiled content from workspace
    const savedContentsStr = localStorage.getItem("bbr_bab_contents");
    let contents: Record<string, string> = {};
    if (savedContentsStr) {
      try { contents = JSON.parse(savedContentsStr); } catch {}
    }

    let dynamicCitations: CitationItem[] = [];
    try {
      const storedCits = localStorage.getItem('bbr_citations');
      if (storedCits) dynamicCitations = JSON.parse(storedCits);
    } catch {}

    let savedMetadata: ThesisMetadata | undefined;
    try {
      const mStr = localStorage.getItem('bbr_doc_metadata');
      if (mStr) savedMetadata = JSON.parse(mStr);
    } catch {}

    let outline: OutlineItem[] = [];
    try {
      const outlineStr = localStorage.getItem('bbr_outline');
      if (outlineStr) outline = JSON.parse(outlineStr);
    } catch {}

    if (!outline || outline.length === 0) {
      outline = [
        { id: '1', title: 'BAB I PENDAHULUAN', children: [{ id: '1-1', title: '1.1 Latar Belakang' }] },
        { id: '2', title: 'BAB II TINJAUAN PUSTAKA', children: [{ id: '2-1', title: '2.1 Landasan Teori' }] },
        { id: '3', title: 'BAB III METODE PENELITIAN', children: [{ id: '3-1', title: '3.1 Desain Penelitian' }] },
        { id: '4', title: 'BAB IV HASIL DAN PEMBAHASAN', children: [{ id: '4-1', title: '4.1 Hasil Penelitian' }] },
        { id: '5', title: 'BAB V PENUTUP', children: [{ id: '5-1', title: '5.1 Kesimpulan' }] },
      ];
    }

    try {
      const blob = await generateThesisDocxBlob({
        metadata: savedMetadata || {
          judul: cleanTitle.replace(/_/g, ' '),
          subJudul: label === 'Tesis' ? 'TESIS' : label === 'Disertasi' ? 'DISERTASI' : 'TUGAS AKHIR',
          namaPenulis: 'Mahasiswa Tugas Akhir',
          nim: '2026/BBR/TA',
          programStudi: `Program Studi ${label}`,
          jurusan: 'Program Studi Terkait',
          fakultas: 'Fakultas Terkait',
          universitas: 'Universitas Brawijaya',
          kota: 'Malang',
          tahun: new Date().getFullYear().toString(),
        },
        outline,
        contents,
        citations: dynamicCitations,
        format: {
          marginTop: '4',
          marginBottom: '3',
          marginLeft: '4',
          marginRight: '3',
          fontFamily: 'Times New Roman',
          fontSize: '12',
          lineSpacing: '1.5',
          includeToC: true,
          includeBibliography: true,
        },
        includeCover: true,
        includePengesahan: true,
        includeToC: true,
        includeDaftarGambar: true,
        includeDaftarSingkatan: true,
        includeDaftarTabel: true,
        includeAbstrak: true,
        includeBibliography: true,
        includeLampiran: true,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = docFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Gagal mengunduh berkas Word DOCX:", e);
    }
  };

  if (!compiledDoc) {
    return (
      <div className="bg-white border-2 border-dashed border-[var(--color-brand-200)] hover:border-[var(--color-brand-400)] transition-all p-6 md:p-7 rounded-2xl flex flex-col sm:flex-row items-center gap-5 sm:justify-between shadow-sm group">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileText size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[var(--color-text-primary)] text-base md:text-lg">
                Belum ada naskah hasil kompilasi
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Perlu Draf
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 leading-relaxed max-w-xl">
              Unggah draf naskah per bab di <strong>Workspace</strong>, poles dengan asisten AI, lalu gabungkan menjadi satu berkas Word (.docx) lengkap dengan format standar kampus.
            </p>
          </div>
        </div>

        <Link
          href="/workspace"
          className="w-full sm:w-auto px-5 py-3 bg-[var(--color-brand-600)] text-white text-sm font-semibold rounded-xl text-center hover:bg-[var(--color-brand-500)] transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow shrink-0"
        >
          <FileEdit size={16} /> Buka Workspace & Mulai Tulis <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const date = new Date(compiledDoc.timestamp || Date.now());
  const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg text-[var(--color-text-primary)] flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600" />
          Naskah {label} Terkompilasi
        </h2>
        <Link href="/workspace" className="text-xs font-semibold text-[var(--color-brand-600)] hover:underline flex items-center gap-1">
          Buka di Workspace <ArrowRight size={12} />
        </Link>
      </div>

      <div className="bg-gradient-to-r from-[var(--color-brand-50)] via-white to-emerald-50/30 border-2 border-[var(--color-brand-200)] p-5 md:p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-4 sm:justify-between shadow-sm hover:shadow-md hover:border-[var(--color-brand-300)] transition-all group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-600)] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-bold text-[var(--color-text-primary)] text-base md:text-lg group-hover:text-[var(--color-brand-700)] transition-colors line-clamp-1">
              {compiledDoc.title || `Draf_${label}_Lengkap_Compiled.docx`}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)] mt-1.5 font-medium">
              <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-[var(--color-bg-muted)] shadow-xs">
                <Clock size={12} /> {dateStr} pukul {timeStr}
              </span>
              <span className="bg-[var(--color-brand-100)] text-[var(--color-brand-700)] px-2 py-0.5 rounded-md font-semibold">
                {compiledDoc.chaptersCount || 5} Bab Tergabung
              </span>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                Format: {compiledDoc.formatPreset || "Standar 4-4-3-3"}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto flex gap-2 shrink-0 mt-2 sm:mt-0">
          <Link
            href="/workspace"
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-[var(--color-brand-200)] text-[var(--color-brand-700)] text-sm font-semibold rounded-xl text-center hover:bg-[var(--color-brand-50)] transition-colors"
          >
            Edit di Workspace
          </Link>
          <button
            onClick={handleDownload}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-[var(--color-brand-600)] text-white text-sm font-semibold rounded-xl text-center hover:bg-[var(--color-brand-500)] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Download size={16} /> Unduh (.docx)
          </button>
        </div>
      </div>
    </div>
  );
}
