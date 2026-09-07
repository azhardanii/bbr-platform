'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  FileText, BookOpen, Clock, PanelRight, Settings, X, Check, 
  Upload, Download, FileCheck, File as FileIcon, Sparkles, LayoutGrid, Plus, 
  ChevronRight, ChevronDown, ArrowRight, ArrowLeft, LayoutDashboard, RefreshCw, Wand2, ShieldCheck, CheckCircle2,
  Layers, SlidersHorizontal, Eye, HelpCircle, Edit3, Trash2, CheckSquare, RotateCcw
} from 'lucide-react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import CitationPanel from '@/components/workspace/CitationPanel';
import AIAssistantPopup from '@/components/editor/AIAssistantPopup';
import CommentThread from '@/components/editor/CommentThread';
import { checkFeatureQuota, consumeFeatureQuota, FeatureKey } from '@/lib/quota';
import QuotaModal from '@/components/quota/QuotaModal';

export interface OutlineItem {
  id: string;
  title: string;
  children?: OutlineItem[];
  isOpen?: boolean;
}

const DEFAULT_OUTLINES: Record<string, OutlineItem[]> = {
  S1: [
    { id: '1', title: 'BAB I PENDAHULUAN', isOpen: true, children: [
      { id: '1-1', title: '1.1 Latar Belakang Masalah' },
      { id: '1-2', title: '1.2 Rumusan Masalah' },
      { id: '1-3', title: '1.3 Tujuan Penelitian' },
      { id: '1-4', title: '1.4 Manfaat Penelitian' },
    ]},
    { id: '2', title: 'BAB II TINJAUAN PUSTAKA', isOpen: false, children: [
      { id: '2-1', title: '2.1 Landasan Teori' },
      { id: '2-2', title: '2.2 Penelitian Terdahulu' },
      { id: '2-3', title: '2.3 Kerangka Pemikiran' },
      { id: '2-4', title: '2.4 Hipotesis Penelitian' },
    ]},
    { id: '3', title: 'BAB III METODE PENELITIAN', isOpen: false, children: [
      { id: '3-1', title: '3.1 Jenis Penelitian' },
      { id: '3-2', title: '3.2 Populasi dan Sampel' },
      { id: '3-3', title: '3.3 Teknik Pengumpulan Data' },
      { id: '3-4', title: '3.4 Teknik Analisis Data' },
    ]},
    { id: '4', title: 'BAB IV HASIL DAN PEMBAHASAN', isOpen: false, children: [
      { id: '4-1', title: '4.1 Gambaran Umum Objek Penelitian' },
      { id: '4-2', title: '4.2 Hasil Pengujian' },
      { id: '4-3', title: '4.3 Pembahasan' },
    ]},
    { id: '5', title: 'BAB V PENUTUP', isOpen: false, children: [
      { id: '5-1', title: '5.1 Kesimpulan' },
      { id: '5-2', title: '5.2 Saran' },
    ]},
  ],
  S2: [
    { id: '1', title: 'BAB I PENDAHULUAN', isOpen: true, children: [
      { id: '1-1', title: '1.1 Latar Belakang' },
      { id: '1-2', title: '1.2 Identifikasi Masalah' },
      { id: '1-3', title: '1.3 Rumusan Masalah' },
      { id: '1-4', title: '1.4 Tujuan Penelitian' },
      { id: '1-5', title: '1.5 Manfaat Penelitian' },
      { id: '1-6', title: '1.6 Kebaruan Penelitian (Novelty)' },
    ]},
    { id: '2', title: 'BAB II KAJIAN PUSTAKA', isOpen: false, children: [
      { id: '2-1', title: '2.1 Landasan Teoretis' },
      { id: '2-2', title: '2.2 Kajian Empiris (Penelitian Terdahulu)' },
      { id: '2-3', title: '2.3 Kerangka Konseptual' },
      { id: '2-4', title: '2.4 Hipotesis' },
    ]},
    { id: '3', title: 'BAB III METODE PENELITIAN', isOpen: false, children: [
      { id: '3-1', title: '3.1 Paradigma dan Pendekatan Penelitian' },
      { id: '3-2', title: '3.2 Desain Penelitian' },
      { id: '3-3', title: '3.3 Populasi, Sampel, dan Sampling' },
      { id: '3-4', title: '3.4 Instrumen Penelitian' },
      { id: '3-5', title: '3.5 Teknik Analisis Data' },
    ]},
    { id: '4', title: 'BAB IV HASIL PENELITIAN', isOpen: false, children: [
      { id: '4-1', title: '4.1 Deskripsi Data' },
      { id: '4-2', title: '4.2 Hasil Pengujian Hipotesis' },
    ]},
    { id: '5', title: 'BAB V PEMBAHASAN', isOpen: false, children: [
      { id: '5-1', title: '5.1 Diskusi Hasil Temuan' },
      { id: '5-2', title: '5.2 Implikasi Teoritis dan Praktis' },
    ]},
    { id: '6', title: 'BAB VI PENUTUP', isOpen: false, children: [
      { id: '6-1', title: '6.1 Kesimpulan' },
      { id: '6-2', title: '6.2 Keterbatasan dan Saran' },
    ]},
  ],
  S3: [
    { id: '1', title: 'BAB I PENDAHULUAN', isOpen: true, children: [
      { id: '1-1', title: '1.1 Latar Belakang' },
      { id: '1-2', title: '1.2 Rumusan Masalah' },
      { id: '1-3', title: '1.3 Tujuan Penelitian' },
      { id: '1-4', title: '1.4 Kontribusi Orisinal (Original Contribution)' },
    ]},
    { id: '2', title: 'BAB II TINJAUAN LITERATUR', isOpen: false, children: [
      { id: '2-1', title: '2.1 Kerangka Teoretis' },
      { id: '2-2', title: '2.2 State of the Art' },
      { id: '2-3', title: '2.3 Research Gap dan Proposisi' },
    ]},
    { id: '3', title: 'BAB III KERANGKA KONSEPTUAL', isOpen: false, children: [
      { id: '3-1', title: '3.1 Model Konseptual' },
      { id: '3-2', title: '3.2 Proposisi Penelitian' },
    ]},
    { id: '4', title: 'BAB IV METODE PENELITIAN', isOpen: false, children: [
      { id: '4-1', title: '4.1 Paradigma Penelitian' },
      { id: '4-2', title: '4.2 Desain dan Prosedur' },
      { id: '4-3', title: '4.3 Pengumpulan Data' },
      { id: '4-4', title: '4.4 Strategi Analisis' },
    ]},
    { id: '5', title: 'BAB V HASIL PENELITIAN', isOpen: false, children: [
      { id: '5-1', title: '5.1 Temuan Utama' },
      { id: '5-2', title: '5.2 Pengujian Proposisi' },
    ]},
    { id: '6', title: 'BAB VI PEMBAHASAN', isOpen: false, children: [
      { id: '6-1', title: '6.1 Interpretasi Temuan' },
      { id: '6-2', title: '6.2 Kontribusi pada Ilmu Pengetahuan' },
    ]},
    { id: '7', title: 'BAB VII PENUTUP', isOpen: false, children: [
      { id: '7-1', title: '7.1 Kesimpulan' },
      { id: '7-2', title: '7.2 Keterbatasan' },
      { id: '7-3', title: '7.3 Agenda Penelitian Lanjutan' },
    ]},
  ],
};

function numToRoman(num: number): string {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return roman[num - 1] || String(num);
}

function generateId() {
  return `bab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// --- Format Document Settings Interface ---
interface DocFormat {
  marginTop: string;
  marginBottom: string;
  marginLeft: string;
  marginRight: string;
  fontFamily: string;
  fontSize: string;
  lineSpacing: string;
  includeToC: boolean;
  includeBibliography: boolean;
}

const FORMAT_PRESETS: { label: string; value: DocFormat }[] = [
  { 
    label: 'Standar 4-4-3-3 (Umum Indonesia)', 
    value: { marginTop: '4', marginBottom: '3', marginLeft: '4', marginRight: '3', fontFamily: 'Times New Roman', fontSize: '12', lineSpacing: '2', includeToC: true, includeBibliography: true } 
  },
  { 
    label: 'APA Style / Kemendikbud', 
    value: { marginTop: '2.54', marginBottom: '2.54', marginLeft: '2.54', marginRight: '2.54', fontFamily: 'Times New Roman', fontSize: '12', lineSpacing: '2', includeToC: true, includeBibliography: true } 
  },
  { 
    label: 'Pedoman UI / UGM / ITB', 
    value: { marginTop: '3', marginBottom: '3', marginLeft: '4', marginRight: '3', fontFamily: 'Times New Roman', fontSize: '12', lineSpacing: '1.5', includeToC: true, includeBibliography: true } 
  },
];

const DEFAULT_FORMAT: DocFormat = FORMAT_PRESETS[0].value;

// Helper to count words from HTML content
function getWordCount(html?: string): number {
  if (!html) return 0;
  const clean = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
  if (!clean) return 0;
  return clean.split(/\s+/).filter(Boolean).length;
}

// Helper to count characters
function getCharCount(html?: string): number {
  if (!html) return 0;
  const clean = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return clean.length;
}

// --- Format Modal ---
function FormatModal({ onClose, format, onSaveFormat }: { onClose: () => void; format: DocFormat; onSaveFormat: (f: DocFormat) => void }) {
  const [localFormat, setLocalFormat] = useState<DocFormat>(format);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const applyPreset = (preset: DocFormat) => setLocalFormat(preset);

  const handleSave = () => {
    onSaveFormat(localFormat);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
          <div>
            <h2 className="font-bold text-lg text-zinc-900 flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-[var(--color-brand-600)]" />
              Pengaturan Format Dokumen Tugas Akhir
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Atur margin, font, dan spasi yang akan diterapkan saat kompilasi dokumen.</p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Preset Templates */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5 block">
              Pilih Template Pedoman Kampus
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {FORMAT_PRESETS.map((p, i) => {
                const isSelected = localFormat.marginTop === p.value.marginTop && localFormat.marginLeft === p.value.marginLeft && localFormat.lineSpacing === p.value.lineSpacing;
                return (
                  <button
                    key={i}
                    onClick={() => applyPreset(p.value)}
                    className={`text-left p-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-[var(--color-brand-600)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)] shadow-xs'
                        : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="font-bold mb-0.5">{p.label}</div>
                    <div className="text-[10px] opacity-75 font-normal">Margin {p.value.marginTop}-{p.value.marginBottom}-{p.value.marginLeft}-{p.value.marginRight} cm · Spasi {p.value.lineSpacing}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Margin Settings */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5 block">
              Pengaturan Margin Halaman (cm)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'marginTop', label: 'Atas (Top)' },
                { key: 'marginBottom', label: 'Bawah (Bottom)' },
                { key: 'marginLeft', label: 'Kiri (Left)' },
                { key: 'marginRight', label: 'Kanan (Right)' },
              ].map(({ key, label }) => (
                <div key={key} className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                  <span className="text-[11px] font-medium text-zinc-500 block mb-1">{label}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="8"
                      value={(localFormat as any)[key]}
                      onChange={e => setLocalFormat({ ...localFormat, [key]: e.target.value })}
                      className="w-full bg-white px-2 py-1 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-800 focus:border-[var(--color-brand-600)] outline-none"
                    />
                    <span className="text-[10px] text-zinc-400 font-semibold">cm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 mb-1.5 block">Jenis Font</label>
              <select
                value={localFormat.fontFamily}
                onChange={e => setLocalFormat({ ...localFormat, fontFamily: e.target.value })}
                className="w-full p-2.5 bg-white border-2 border-zinc-200 rounded-xl text-xs font-medium focus:border-[var(--color-brand-600)] outline-none"
              >
                <option>Times New Roman</option>
                <option>Arial</option>
                <option>Calibri</option>
                <option>Georgia</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 mb-1.5 block">Ukuran Font</label>
              <select
                value={localFormat.fontSize}
                onChange={e => setLocalFormat({ ...localFormat, fontSize: e.target.value })}
                className="w-full p-2.5 bg-white border-2 border-zinc-200 rounded-xl text-xs font-medium focus:border-[var(--color-brand-600)] outline-none"
              >
                <option value="11">11 pt</option>
                <option value="12">12 pt (Standar)</option>
                <option value="14">14 pt (Judul)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 mb-1.5 block">Spasi Baris</label>
              <select
                value={localFormat.lineSpacing}
                onChange={e => setLocalFormat({ ...localFormat, lineSpacing: e.target.value })}
                className="w-full p-2.5 bg-white border-2 border-zinc-200 rounded-xl text-xs font-medium focus:border-[var(--color-brand-600)] outline-none"
              >
                <option value="1">1.0 (Single)</option>
                <option value="1.5">1.5 Spasi</option>
                <option value="2">2.0 (Double)</option>
              </select>
            </div>
          </div>

          {/* Additional Compilation Options */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-2.5">
            <div className="text-xs font-bold text-zinc-800 mb-2">Opsi Tambahan Kompilasi</div>
            <label className="flex items-center gap-2.5 text-xs text-zinc-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={localFormat.includeToC}
                onChange={e => setLocalFormat({ ...localFormat, includeToC: e.target.checked })}
                className="rounded text-[var(--color-brand-600)] focus:ring-[var(--color-brand-600)]"
              />
              <span>Generate Daftar Isi (Table of Contents) Otomatis</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs text-zinc-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={localFormat.includeBibliography}
                onChange={e => setLocalFormat({ ...localFormat, includeBibliography: e.target.checked })}
                className="rounded text-[var(--color-brand-600)] focus:ring-[var(--color-brand-600)]"
              />
              <span>Susun Daftar Pustaka Otomatis dari Sitasi Aktif</span>
            </label>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-200/60 rounded-xl transition-colors">
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[var(--color-brand-600)] text-white font-semibold text-xs rounded-xl hover:bg-[var(--color-brand-500)] transition-all flex items-center gap-2 shadow-sm"
          >
            {savedSuccess ? <><Check size={14} /> Tersimpan!</> : 'Simpan Format Template'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Compilation Modal ---
function CompilationModal({ 
  onClose, 
  outline, 
  uploads, 
  contents,
  format,
  onCompiledSuccess 
}: { 
  onClose: () => void; 
  outline: OutlineItem[]; 
  uploads: Record<string, UploadedBab>; 
  contents: Record<string, string>;
  format: DocFormat;
  onCompiledSuccess: () => void;
}) {
  const [compiling, setCompiling] = useState(false);
  const [compiled, setCompiled] = useState(false);
  const [customTitle, setCustomTitle] = useState('Naskah_Tugas_Akhir_Lengkap');

  const filledCount = outline.filter(b => {
    const up = uploads[b.id];
    const text = contents[b.id] || '';
    return !!up || getWordCount(text) > 0;
  }).length;
  const totalBabs = outline.length;

  const handleStartCompile = () => {
    consumeFeatureQuota('kompilasi');
    setCompiling(true);
    setTimeout(() => {
      setCompiling(false);
      setCompiled(true);

      const fileName = customTitle.endsWith('.doc') ? customTitle : customTitle.endsWith('.docx') ? customTitle.replace('.docx', '.doc') : `${customTitle}.doc`;

      // Save compiled document record for dashboard vault
      const record = {
        title: fileName,
        timestamp: Date.now(),
        chaptersCount: filledCount,
        totalChapters: totalBabs,
        formatPreset: `${format.fontFamily} ${format.fontSize}pt · Spasi ${format.lineSpacing} · Margin ${format.marginTop}-${format.marginBottom}-${format.marginLeft}-${format.marginRight}cm`,
      };
      localStorage.setItem('bbr_compiled_doc', JSON.stringify(record));
      window.dispatchEvent(new Event('bbr-compiled-updated'));

      // Retrieve dynamic citations & format config from localStorage
      let dynamicCitations: any[] = [];
      try {
        const storedCits = localStorage.getItem('bbr_citations');
        if (storedCits) dynamicCitations = JSON.parse(storedCits);
      } catch {}

      if (dynamicCitations.length === 0) {
        dynamicCitations = [
          {
            authors: 'Creswell, J. W., & Creswell, J. D.',
            year: '2018',
            title: 'Research Design: Qualitative, Quantitative, and Mixed Methods Approaches (5th ed.)',
            journal: 'SAGE Publications',
          },
          {
            authors: 'Sugiyono',
            year: '2021',
            title: 'Metode Penelitian Kuantitatif, Kualitatif, dan R&D',
            journal: 'Alfabeta Bandung',
          },
          {
            authors: 'Nielsen, J., & Kurniawan, S.',
            year: '2021',
            title: 'User Interface Design Guidelines for Elderly Users in E-Commerce Platforms',
            journal: 'International Journal of Human-Computer Studies',
            doi: '10.1016/j.ijhcs.2021.102688',
          }
        ];
      }

      // Generate Authentic Word-Compliant HTML Document with standard Academic Styles & Native Word Page Numbering
      const lineSpacingCss = format.lineSpacing === '2' ? '2.0' : format.lineSpacing === '1.5' ? '1.5' : '1.15';
      
      const docHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>${fileName}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 21.0cm 29.7cm; /* A4 */
      margin: ${format.marginTop}cm ${format.marginRight}cm ${format.marginBottom}cm ${format.marginLeft}cm;
      mso-header-margin: 2.0cm;
      mso-footer-margin: 2.0cm;
      mso-footer: f1;
      mso-paper-source: 0;
    }
    div.Section1 {
      page: Section1;
    }
    body {
      font-family: '${format.fontFamily}', 'Times New Roman', serif;
      font-size: ${format.fontSize}pt;
      line-height: ${lineSpacingCss};
      color: #000000;
      text-align: justify;
    }
    p.MsoFooter, li.MsoFooter, div.MsoFooter {
      margin: 0;
      margin-bottom: 0.0001pt;
      mso-pagination: widow-orphan;
      font-size: 10.0pt;
      font-family: '${format.fontFamily}', 'Times New Roman', serif;
      text-align: right;
    }
    h1.chapter-title {
      font-family: '${format.fontFamily}', 'Times New Roman', serif;
      font-size: 14pt;
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
      margin-top: 0;
      margin-bottom: 24pt;
      page-break-before: always;
    }
    h2.sub-title {
      font-family: '${format.fontFamily}', 'Times New Roman', serif;
      font-size: 12pt;
      font-weight: bold;
      margin-top: 18pt;
      margin-bottom: 6pt;
    }
    h3.sub-sub-title {
      font-family: '${format.fontFamily}', 'Times New Roman', serif;
      font-size: 12pt;
      font-weight: bold;
      font-style: italic;
      margin-top: 12pt;
      margin-bottom: 6pt;
    }
    p {
      margin-top: 0;
      margin-bottom: 6pt;
      text-indent: 1.27cm; /* Standar First Line Indent Indonesia 1.27cm */
      text-align: justify;
      line-height: ${lineSpacingCss};
    }
    .cover-page {
      text-align: center;
      margin-top: 4cm;
      page-break-after: always;
    }
    .cover-title {
      font-size: 16pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 2.5cm;
    }
    .cover-author {
      font-size: 12pt;
      font-weight: bold;
      margin-bottom: 3.5cm;
    }
    .cover-footer {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .toc-container {
      page-break-after: always;
    }
    .toc-title {
      font-size: 14pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 20pt;
    }
    table.toc-table {
      width: 100%;
      border-collapse: collapse;
      border: none !important;
      mso-border-alt: none !important;
      mso-border-top-alt: none !important;
      mso-border-bottom-alt: none !important;
      mso-border-left-alt: none !important;
      mso-border-right-alt: none !important;
      font-size: 12pt;
      margin-top: 10pt;
    }
    table.toc-table tr, table.toc-table td {
      border: none !important;
      mso-border-alt: none !important;
      mso-border-top-alt: none !important;
      mso-border-bottom-alt: none !important;
      mso-border-left-alt: none !important;
      mso-border-right-alt: none !important;
      padding: 3pt 0;
      vertical-align: bottom;
    }
    .toc-title {
      font-family: '${format.fontFamily}', 'Times New Roman', serif;
      font-size: 14pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 24pt;
    }
    .bib-item {
      text-indent: -1.27cm;
      padding-left: 1.27cm;
      margin-bottom: 10pt;
      text-align: justify;
    }
  </style>
</head>
<body lang="ID">
  <div class="Section1">
    <!-- HALAMAN JUDUL (COVER) -->
    <div class="cover-page">
      <div class="cover-title">
        ${customTitle.replace(/_/g, ' ')}
      </div>
      <p style="text-indent: 0; margin-bottom: 2cm; font-size: 12pt; text-align: center;">
        TUGAS AKHIR / SKRIPSI<br>
        <em>Diajukan untuk Memenuhi Sebagian Persyaratan Mencapai Gelar Sarjana</em>
      </p>
      <div class="cover-author">
        Disusun Oleh:<br>
        <strong>MAHASISWA TUGAS AKHIR</strong><br>
        NIM: 2026/BBR/TA
      </div>
      <div class="cover-footer">
        PROGRAM STUDI SARJANA<br>
        UNIVERSITAS INDONESIA<br>
        ${new Date().getFullYear()}
      </div>
    </div>

    ${format.includeToC ? `
    <!-- DAFTAR ISI OTOMATIS (TANPA BORDER / ZERO BORDER) -->
    <div class="toc-container">
      <div class="toc-title">DAFTAR ISI</div>
      <table class="toc-table" border="0" cellpadding="0" cellspacing="0" style="width:100%; border:none; border-collapse:collapse; mso-border-alt:none;">
        ${outline.map((b, idx) => `
          <tr style="border:none; mso-border-alt:none;">
            <td style="border:none; mso-border-alt:none; font-weight:bold; padding-top:6pt; padding-bottom:2pt;">${b.title}</td>
            <td style="border:none; mso-border-alt:none; text-align:right; font-weight:bold; padding-top:6pt; padding-bottom:2pt; white-space:nowrap;">${idx + 1}</td>
          </tr>
          ${b.children ? b.children.map(sub => `
            <tr style="border:none; mso-border-alt:none;">
              <td style="border:none; mso-border-alt:none; padding-left:24pt; padding-top:2pt; padding-bottom:2pt;">${sub.title}</td>
              <td style="border:none; mso-border-alt:none; text-align:right; padding-top:2pt; padding-bottom:2pt; white-space:nowrap;">${idx + 1}</td>
            </tr>
          `).join('') : ''}
        `).join('')}
        ${format.includeBibliography ? `
          <tr style="border:none; mso-border-alt:none;">
            <td style="border:none; mso-border-alt:none; font-weight:bold; padding-top:10pt; padding-bottom:2pt;">DAFTAR PUSTAKA</td>
            <td style="border:none; mso-border-alt:none; text-align:right; font-weight:bold; padding-top:10pt; padding-bottom:2pt; white-space:nowrap;">${outline.length + 1}</td>
          </tr>
        ` : ''}
      </table>
    </div>
    ` : ''}

    <!-- ISI SETIAP BAB -->
    ${outline.map((b) => {
      const rawContent = contents[b.id] || '';
      const hasHtml = rawContent.trim().length > 0;
      return `
        <div class="chapter-container">
          <h1 class="chapter-title">${b.title}</h1>
          ${hasHtml ? rawContent : `
            ${b.children ? b.children.map(sub => `
              <h2 class="sub-title">${sub.title}</h2>
              <p>Draf penulisan naskah untuk bagian ${sub.title} dituliskan pada bagian ini.</p>
            `).join('') : '<p>Draf penulisan naskah bab ini belum diisi.</p>'}
          `}
        </div>
      `;
    }).join('')}

    ${format.includeBibliography ? `
    <!-- DAFTAR PUSTAKA -->
    <div style="page-break-before: always;">
      <h1 class="chapter-title">DAFTAR PUSTAKA</h1>
      ${dynamicCitations.map(c => `
        <p class="bib-item">
          ${c.authors}. (${c.year}). <em>${c.title}</em>. ${c.journal}.${c.doi ? ` https://doi.org/${c.doi}` : c.url ? ` ${c.url}` : ''}
        </p>
      `).join('')}
    </div>
    ` : ''}
  </div>

  <!-- Word Native Footer XML (Automatically Evaluated as Real Page Number in Word) -->
  <div style='mso-element:footer' id='f1'>
    <p class='MsoFooter'>
      <span style='mso-field-code: " PAGE "'></span>
    </p>
  </div>
</body>
</html>
      `;

      // Download file with proper Word MIME type
      const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onCompiledSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
          <div>
            <h2 className="font-bold text-lg text-zinc-900 flex items-center gap-2">
              <Download size={18} className="text-[var(--color-brand-600)]" />
              Kompilasi Naskah Tugas Akhir
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Gabungkan seluruh bab draf menjadi satu berkas Word (.docx) siap sidang.</p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {!compiled ? (
            <>
              {/* Document Name */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">
                  Nama File Hasil Kompilasi
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 border-2 border-zinc-200 rounded-xl text-xs font-semibold focus:border-[var(--color-brand-600)] outline-none"
                  />
                  <span className="text-xs font-bold text-zinc-400 bg-zinc-100 px-3 py-2.5 rounded-xl border border-zinc-200">.docx</span>
                </div>
              </div>

              {/* Chapters Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Bab yang Akan Digabung ({filledCount}/{totalBabs})
                  </span>
                  <span className="text-[11px] text-zinc-500 font-semibold">
                    {filledCount === totalBabs ? '✅ Lengkap Semua Bab' : 'ℹ️ Bab kosong akan dibuatkan struktur bab'}
                  </span>
                </div>
                <div className="max-h-44 overflow-y-auto space-y-1.5 border border-zinc-200 rounded-2xl p-2.5 bg-zinc-50">
                  {outline.map((b) => {
                    const up = uploads[b.id];
                    const text = contents[b.id] || '';
                    const words = getWordCount(text);
                    const isFilled = !!up || words > 0;

                    return (
                      <div key={b.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-zinc-100 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          {isFilled ? (
                            <FileCheck size={15} className="text-emerald-600 shrink-0" />
                          ) : (
                            <FileIcon size={15} className="text-zinc-400 shrink-0" />
                          )}
                          <span className="font-semibold text-zinc-800 truncate">{b.title}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          up 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : words > 0 
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-zinc-100 text-zinc-500'
                        }`}>
                          {up ? `Berkas (${words} kata)` : words > 0 ? `${words} kata` : 'Draf Kosong'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Applied Formats Summary */}
              <div className="bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] p-3.5 rounded-2xl text-xs space-y-1 text-[var(--color-brand-900)]">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <Sparkles size={14} className="text-[var(--color-brand-600)]" />
                  Format Standar Dokumen yang Diterapkan:
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-zinc-700 font-medium">
                  <div>• Margin: {format.marginTop}-{format.marginBottom}-{format.marginLeft}-{format.marginRight} cm</div>
                  <div>• Font: {format.fontFamily} {format.fontSize}pt</div>
                  <div>• Spasi: {format.lineSpacing}</div>
                  <div>• Halaman Judul & Daftar Isi Otomatis</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6 space-y-3 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="font-bold text-lg text-zinc-900">Kompilasi Berhasil!</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                File <strong>{customTitle}.docx</strong> telah diunduh secara otomatis dan tersimpan di Dashboard Anda.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 flex justify-end gap-3">
          {!compiled ? (
            <>
              <button onClick={onClose} className="px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-200/60 rounded-xl transition-colors">
                Batal
              </button>
              <button
                onClick={handleStartCompile}
                disabled={compiling}
                className="px-6 py-2.5 bg-[var(--color-brand-600)] text-white font-semibold text-xs rounded-xl hover:bg-[var(--color-brand-500)] disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
              >
                {compiling ? (
                  <><RefreshCw size={14} className="animate-spin" /> Menggabungkan Bab...</>
                ) : (
                  <><Download size={14} /> Kompilasi & Unduh (.docx)</>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[var(--color-brand-600)] text-white font-semibold text-xs rounded-xl hover:bg-[var(--color-brand-500)] transition-colors"
            >
              Selesai & Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface UploadedBab {
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

export default function WorkspaceClient() {
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [activeRightPanel, setActiveRightPanel] = useState<'comments' | 'citations' | 'ai'>('citations');
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
  const [isCompilationModalOpen, setIsCompilationModalOpen] = useState(false);
  const [quotaExhaustedFeature, setQuotaExhaustedFeature] = useState<FeatureKey | null>(null);

  const handleOpenCompilation = () => {
    const check = checkFeatureQuota('kompilasi');
    if (!check.allowed) {
      setQuotaExhaustedFeature('kompilasi');
      return;
    }
    setIsCompilationModalOpen(true);
  };
  
  // Chapter-based State
  const searchParams = useSearchParams();
  const [jenjang, setJenjang] = useState('S1');
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [activeBabId, setActiveBabId] = useState<string | null>(null);

  useEffect(() => {
    const babParam = searchParams?.get('bab');
    if (babParam) {
      setActiveBabId(babParam);
    }
  }, [searchParams]);

  // Dropdown states
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [isBabSelectorOpen, setIsBabSelectorOpen] = useState(false);
  const progressDropdownRef = useRef<HTMLDivElement>(null);
  const babSelectorRef = useRef<HTMLDivElement>(null);

  // Inline editing states
  const [editingBabId, setEditingBabId] = useState<string | null>(null);
  const [editingBabDraft, setEditingBabDraft] = useState('');
  const [editingSubBabId, setEditingSubBabId] = useState<string | null>(null);
  const [editingSubBabDraft, setEditingSubBabDraft] = useState('');
  
  // Real chapter contents & uploads stored in localStorage
  const [contents, setContents] = useState<Record<string, string>>({});
  const [uploads, setUploads] = useState<Record<string, UploadedBab>>({});
  
  // Format state
  const [format, setFormat] = useState<DocFormat>(DEFAULT_FORMAT);

  // File Upload Drag & Drop State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (progressDropdownRef.current && !progressDropdownRef.current.contains(event.target as Node)) {
        setIsProgressOpen(false);
      }
      if (babSelectorRef.current && !babSelectorRef.current.contains(event.target as Node)) {
        setIsBabSelectorOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load state from localStorage on mount & sync across pages
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadState = () => {
      const ob = localStorage.getItem('bbr_onboarding');
      let j = 'S1';
      if (ob) {
        try { j = JSON.parse(ob)?.jenjang || 'S1'; } catch {}
      }
      setJenjang(j);

      const savedOutline = localStorage.getItem('bbr_outline');
      if (savedOutline) {
        try {
          const parsed = JSON.parse(savedOutline);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOutline(parsed);
          } else {
            const initial = DEFAULT_OUTLINES[j] || DEFAULT_OUTLINES['S1'];
            setOutline(initial);
            localStorage.setItem('bbr_outline', JSON.stringify(initial));
          }
        } catch {
          const initial = DEFAULT_OUTLINES[j] || DEFAULT_OUTLINES['S1'];
          setOutline(initial);
        }
      } else {
        const initial = DEFAULT_OUTLINES[j] || DEFAULT_OUTLINES['S1'];
        setOutline(initial);
        localStorage.setItem('bbr_outline', JSON.stringify(initial));
      }

      const savedContents = localStorage.getItem('bbr_bab_contents');
      if (savedContents) {
        try { setContents(JSON.parse(savedContents)); } catch {}
      }

      const savedUploads = localStorage.getItem('bbr_bab_uploads');
      if (savedUploads) {
        try { setUploads(JSON.parse(savedUploads)); } catch {}
      }

      const savedFormat = localStorage.getItem('bbr_doc_format');
      if (savedFormat) {
        try { setFormat(JSON.parse(savedFormat)); } catch {}
      }
    };

    loadState();

    window.addEventListener('storage', loadState);
    window.addEventListener('bbr_workspace_updated', loadState);

    return () => {
      window.removeEventListener('storage', loadState);
      window.removeEventListener('bbr_workspace_updated', loadState);
    };
  }, []);

  // Save outline helper
  const saveOutline = (newOutline: OutlineItem[]) => {
    setOutline(newOutline);
    localStorage.setItem('bbr_outline', JSON.stringify(newOutline));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bbr_workspace_updated'));
    }
  };

  // Add Bab
  const handleAddBab = () => {
    const nextNum = outline.length + 1;
    const newBab: OutlineItem = {
      id: generateId(),
      title: `BAB ${numToRoman(nextNum)} JUDUL BAB BARU`,
      isOpen: true,
      children: [
        { id: generateId(), title: `${nextNum}.1 Sub-bab Awal` },
      ],
    };
    const updated = [...outline, newBab];
    saveOutline(updated);
    setActiveBabId(newBab.id);
  };

  // Delete Bab
  const handleDeleteBab = (babId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (outline.length <= 1) {
      alert('Minimal harus ada 1 bab di dalam naskah tugas akhir.');
      return;
    }
    const targetBab = outline.find(b => b.id === babId);
    if (window.confirm(`Hapus "${targetBab?.title || 'Bab ini'}" beserta draf isinya dari naskah?`)) {
      const updated = outline.filter(b => b.id !== babId);
      saveOutline(updated);

      const newContents = { ...contents };
      delete newContents[babId];
      setContents(newContents);
      localStorage.setItem('bbr_bab_contents', JSON.stringify(newContents));

      const newUploads = { ...uploads };
      delete newUploads[babId];
      saveUploads(newUploads);

      if (activeBabId === babId) {
        setActiveBabId(null);
      }
    }
  };

  // Rename Bab
  const handleSaveRenameBab = (babId: string) => {
    if (!editingBabDraft.trim()) {
      setEditingBabId(null);
      return;
    }
    const updated = outline.map(b => b.id === babId ? { ...b, title: editingBabDraft.trim() } : b);
    saveOutline(updated);
    setEditingBabId(null);
  };

  // Add Sub-bab
  const handleAddSubBab = (babId: string, customTitle?: string) => {
    const bab = outline.find(b => b.id === babId);
    if (!bab) return;
    const babIdx = outline.findIndex(b => b.id === babId) + 1;
    const childCount = (bab.children?.length || 0) + 1;
    const title = customTitle?.trim() || `${babIdx}.${childCount} Sub-bab Baru`;
    const newChild: OutlineItem = {
      id: generateId(),
      title,
    };
    const updated = outline.map(b => 
      b.id === babId 
        ? { ...b, children: [...(b.children || []), newChild], isOpen: true } 
        : b
    );
    saveOutline(updated);
  };

  // Delete Sub-bab
  const handleDeleteSubBab = (babId: string, childId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const bab = outline.find(b => b.id === babId);
    const subBab = bab?.children?.find(c => c.id === childId);
    if (window.confirm(`Hapus sub-bab "${subBab?.title || 'ini'}"?`)) {
      const updated = outline.map(b => 
        b.id === babId 
          ? { ...b, children: b.children?.filter(c => c.id !== childId) } 
          : b
      );
      saveOutline(updated);
    }
  };

  // Rename Sub-bab
  const handleSaveRenameSubBab = (babId: string, childId: string) => {
    if (!editingSubBabDraft.trim()) {
      setEditingSubBabId(null);
      return;
    }
    const updated = outline.map(b => 
      b.id === babId 
        ? {
            ...b,
            children: b.children?.map(c => c.id === childId ? { ...c, title: editingSubBabDraft.trim() } : c),
          }
        : b
    );
    saveOutline(updated);
    setEditingSubBabId(null);
  };

  // Reset Outline
  const handleResetOutline = () => {
    if (window.confirm('Kembalikan struktur bab ke template standar kampus Anda?')) {
      const defaults = DEFAULT_OUTLINES[jenjang] || DEFAULT_OUTLINES['S1'];
      saveOutline(defaults);
      setActiveBabId(null);
    }
  };

  // Save content handler
  const handleSaveContent = (babId: string, newHtml: string) => {
    const updated = { ...contents, [babId]: newHtml };
    setContents(updated);
    localStorage.setItem('bbr_bab_contents', JSON.stringify(updated));
    setLastSavedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bbr_workspace_updated'));
    }
  };

  // Save uploads handler
  const saveUploads = (newUploads: Record<string, UploadedBab>) => {
    setUploads(newUploads);
    localStorage.setItem('bbr_bab_uploads', JSON.stringify(newUploads));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bbr_workspace_updated'));
    }
  };

  const handleSaveFormat = (newFormat: DocFormat) => {
    setFormat(newFormat);
    localStorage.setItem('bbr_doc_format', JSON.stringify(newFormat));
  };

  // Convert uploaded DOCX / text to rich HTML preserving structure, headings, bold, italics
  const handleFileProcess = async (file: File, targetBabId?: string) => {
    const babId = targetBabId || activeBabId;
    if (!babId) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('Ukuran berkas terlalu besar. Maksimal 20 MB.');
      return;
    }

    try {
      let textContent = '';

      if (file.name.endsWith('.docx')) {
        // Dynamically load Mammoth.js from CDN if not yet present in browser window
        if (!(window as any).mammoth) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Gagal memuat parser dokumen DOCX'));
            document.head.appendChild(script);
          });
        }

        const arrayBuffer = await file.arrayBuffer();
        const result = await (window as any).mammoth.convertToHtml({ arrayBuffer });
        textContent = result.value;

        // If mammoth extracted empty or very short text, provide fallback
        if (!textContent || textContent.trim().length === 0) {
          const babObj = outline.find(b => b.id === babId);
          textContent = `<h2>${babObj?.title || 'Draf Bab'}</h2><p>Berkas ${file.name} berhasil diunggah. Mulai edit naskah Anda di sini...</p>`;
        }
      } else if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const raw = await file.text();
        textContent = raw
          .split('\n\n')
          .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
          .join('');
      } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
        textContent = await file.text();
      } else {
        // Fallback for doc/other binary files
        const babObj = outline.find(b => b.id === babId);
        textContent = `
          <h2>${babObj?.title || 'Draf Bab'}</h2>
          <p>Berkas <strong>${file.name}</strong> (${Math.round(file.size / 1024)} KB) berhasil diunggah.</p>
          <p>Silakan tinjau dan kembangkan draf naskah bab ini menggunakan editor.</p>
        `;
      }

      handleSaveContent(babId, textContent);

      const newUploads = {
        ...uploads,
        [babId]: {
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
        },
      };
      saveUploads(newUploads);
      if (!activeBabId) setActiveBabId(babId);
    } catch (err: any) {
      console.error('Error parsing uploaded file:', err);
      alert('Gagal mengekstrak isi file Word: ' + (err.message || 'Format tidak didukung'));
    }
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileProcess(file);
  };

  const handleResetBab = (babId: string) => {
    if (confirm('Kosongkan isi dan hapus draf untuk bab ini?')) {
      const newContents = { ...contents };
      delete newContents[babId];
      setContents(newContents);
      localStorage.setItem('bbr_bab_contents', JSON.stringify(newContents));

      const newUploads = { ...uploads };
      delete newUploads[babId];
      saveUploads(newUploads);
    }
  };

  // Generate starter scaffold for a bab
  const handleInsertScaffold = (babId: string) => {
    const bab = outline.find(b => b.id === babId);
    if (!bab) return;

    let scaffoldHtml = ``;
    if (bab.children && bab.children.length > 0) {
      scaffoldHtml = bab.children
        .map(sub => `<h2>${sub.title}</h2><p>Tuliskan penjelasan untuk bagian ${sub.title} di sini...</p>`)
        .join('');
    } else {
      scaffoldHtml = `<h2>${bab.title}</h2><p>Mulai ketik isi bab Anda di sini...</p>`;
    }

    handleSaveContent(babId, scaffoldHtml);
  };

  // Insert sample un-paraphrased student draft for quick testing
  const handleInsertSampleDraft = (babId: string) => {
    const sampleHtml = `
      <h2>1.1 Latar Belakang Masalah</h2>
      <p>Di era modern saat ini, perkembangan teknologi digital tuh berkembang cepet banget dan hampir semua orang sekarang make smartphone buat belanja online karena emang lebih gampang dan praktis dibanding harus dateng ke toko offline.</p>
      <p>Namun masalahnya, masih banyak banget aplikasi e-commerce yang tampilannya ribet dan susah dipake sama orang tua. Hal ini bikin banyak pengguna baru ngerasa bingung waktu mau bayar atau nyari barang yang mereka mau beli.</p>
      <p>Oleh karena itu, penelitian ini pengen nyari tau gimana caranya bikin desain antarmuka aplikasi yang lebih ramah pengguna supaya tingkat kepuasan pelanggan bisa makin naik dan penjualan toko online jadi lebih meningkat secara signifikan.</p>
      <h2>1.2 Rumusan Masalah</h2>
      <p>1. Bagaimana merancang antarmuka aplikasi belanja yang gampang dipake oleh semua kalangan?</p>
      <p>2. Apakah perbaikan desain antarmuka ini beneran bisa naikin kepuasan dan loyalitas pembeli?</p>
    `;
    handleSaveContent(babId, sampleHtml);
  };

  const handleAddComment = (text: string) => { 
    setSelectedText(text); 
    setActiveRightPanel('comments'); 
    setRightSidebarOpen(true); 
  };

  const activeBab = outline.find(b => b.id === activeBabId);
  const activeContent = activeBabId ? contents[activeBabId] || '' : '';
  const activeUpload = activeBabId ? uploads[activeBabId] : undefined;
  const activeWords = getWordCount(activeContent);
  const activeChars = getCharCount(activeContent);

  const filledBabIds = outline.filter(b => {
    const up = uploads[b.id];
    const text = contents[b.id] || '';
    return !!up || getWordCount(text) > 0;
  }).map(b => b.id);

  const totalBabs = outline.length;
  const filledCount = filledBabIds.length;
  const progressPct = totalBabs > 0 ? Math.round((filledCount / totalBabs) * 100) : 0;
  const totalWords = Object.values(contents).reduce((acc, html) => acc + getWordCount(html), 0);

  return (
    <div className="flex flex-1 w-full h-full overflow-hidden bg-zinc-100 text-zinc-900 select-none">
      {/* Format Settings Modal */}
      {isFormatModalOpen && (
        <FormatModal 
          onClose={() => setIsFormatModalOpen(false)} 
          format={format}
          onSaveFormat={handleSaveFormat}
        />
      )}

      {/* Compilation Modal */}
      {isCompilationModalOpen && (
        <CompilationModal
          onClose={() => setIsCompilationModalOpen(false)}
          outline={outline}
          uploads={uploads}
          contents={contents}
          format={format}
          onCompiledSuccess={() => {}}
        />
      )}

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE CANVAS AREA (FULL WIDTH) */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col h-full bg-zinc-100 relative transition-all duration-300 min-w-0 overflow-hidden">
        {/* Top Control Header Toolbar */}
        <header className="h-14 border-b border-zinc-200/90 bg-white flex items-center justify-between px-4 sticky top-0 z-20 shrink-0 shadow-xs">
          {/* Left Controls & Breadcrumbs */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/dashboard"
              className="font-bold text-xs md:text-sm text-zinc-600 hover:text-[var(--color-brand-600)] transition-colors flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg hover:bg-zinc-100"
            >
              <LayoutDashboard size={14} className="text-zinc-500" />
              <span>Dashboard</span>
            </Link>
            <ChevronRight size={14} className="text-zinc-300 shrink-0" />
            <button
              onClick={() => setActiveBabId(null)}
              className={`font-bold text-xs md:text-sm transition-colors flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-lg ${
                activeBabId === null 
                  ? 'text-[var(--color-brand-700)] bg-[var(--color-brand-50)] border border-[var(--color-brand-200)]' 
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
              title="Lihat semua struktur bab tugas akhir"
            >
              <LayoutGrid size={14} />
              <span>Ringkasan Bab</span>
            </button>

            {/* Chapter Selector Dropdown */}
            {activeBab && (
              <>
                <ChevronRight size={14} className="text-zinc-300 shrink-0" />
                <div className="relative" ref={babSelectorRef}>
                  <button
                    onClick={() => setIsBabSelectorOpen(!isBabSelectorOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-900 transition-colors truncate max-w-[200px] sm:max-w-[300px]"
                    title="Ganti Bab Lain"
                  >
                    <span className="truncate">{activeBab.title}</span>
                    <ChevronDown size={13} className={`text-zinc-400 shrink-0 transition-transform duration-200 ${isBabSelectorOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isBabSelectorOpen && (
                    <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-2xl border border-zinc-200 shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase text-zinc-400">Pindah ke Bab:</div>
                      {outline.map((b) => {
                        const isFilled = filledBabIds.includes(b.id);
                        return (
                          <button
                            key={b.id}
                            onClick={() => { setActiveBabId(b.id); setIsBabSelectorOpen(false); }}
                            className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                              activeBabId === b.id 
                                ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)] font-bold' 
                                : 'text-zinc-700 hover:bg-zinc-100'
                            }`}
                          >
                            <span className="truncate pr-2">{b.title}</span>
                            {isFilled ? (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">✓ Terisi</span>
                            ) : (
                              <span className="text-[10px] text-zinc-400 shrink-0">Kosong</span>
                            )}
                          </button>
                        );
                      })}
                      <div className="pt-1.5 mt-1 border-t border-zinc-100">
                        <button
                          onClick={() => { handleAddBab(); setIsBabSelectorOpen(false); }}
                          className="w-full text-center py-1.5 rounded-xl bg-[var(--color-brand-50)] text-[var(--color-brand-700)] hover:bg-[var(--color-brand-100)] text-xs font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus size={13} /> Tambah Bab Baru
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* PROGRESS DROPDOWN BUTTON */}
            <div className="relative" ref={progressDropdownRef}>
              <button
                onClick={() => setIsProgressOpen(!isProgressOpen)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all shadow-xs ${
                  isProgressOpen 
                    ? 'bg-[var(--color-brand-50)] border-[var(--color-brand-300)] text-[var(--color-brand-700)] ring-2 ring-[var(--color-brand-200)]' 
                    : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                }`}
                title="Lihat Target Progress Naskah"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="hidden sm:inline">Progress:</span>
                  <span className="font-bold text-[var(--color-brand-600)]">{progressPct}%</span>
                  <span className="text-[10px] text-zinc-400 font-normal">({filledCount}/{totalBabs})</span>
                </div>
                <ChevronDown size={14} className={`transition-transform text-zinc-400 duration-200 ${isProgressOpen ? 'rotate-180 text-[var(--color-brand-600)]' : ''}`} />
              </button>

              {/* Progress Dropdown Menu */}
              {isProgressOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-zinc-200 shadow-2xl z-50 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900">Target Progress Naskah</h4>
                      <p className="text-[11px] text-zinc-500">Kelengkapan penulisan per bab tugas akhir</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[var(--color-brand-100)] text-[var(--color-brand-700)]">
                      {progressPct}% Selesai
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden border border-zinc-200/60">
                      <div 
                        className="bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-400)] h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-3 gap-2 bg-zinc-50 p-3 rounded-xl border border-zinc-200/60 text-center">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-zinc-400">Total Bab</div>
                      <div className="text-base font-extrabold text-zinc-800">{totalBabs}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-zinc-400">Terisi</div>
                      <div className="text-base font-extrabold text-emerald-600">{filledCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-zinc-400">Total Kata</div>
                      <div className="text-base font-extrabold text-[var(--color-brand-600)]">{totalWords}</div>
                    </div>
                  </div>

                  {/* Chapter Status List */}
                  <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                    <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Status Tiap Bab:</div>
                    {outline.map((b) => {
                      const up = uploads[b.id];
                      const text = contents[b.id] || '';
                      const words = getWordCount(text);
                      const isFilled = !!up || words > 0;

                      return (
                        <div
                          key={b.id}
                          onClick={() => { setActiveBabId(b.id); setIsProgressOpen(false); }}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors border ${
                            activeBabId === b.id 
                              ? 'bg-[var(--color-brand-50)]/70 border-[var(--color-brand-200)]' 
                              : 'bg-white hover:bg-zinc-50 border-zinc-200/60'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            {isFilled ? (
                              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                            ) : (
                              <Clock size={14} className="text-zinc-300 shrink-0" />
                            )}
                            <span className="font-semibold text-zinc-800 truncate">{b.title}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isFilled ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                          }`}>
                            {up ? 'Berkas' : words > 0 ? `${words} kata` : 'Belum'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                    <button
                      onClick={() => { setActiveBabId(null); setIsProgressOpen(false); }}
                      className="text-xs font-bold text-[var(--color-brand-600)] hover:underline flex items-center gap-1"
                    >
                      Buka Ringkasan Seluruh Bab &rarr;
                    </button>
                    <button
                      onClick={() => { handleAddBab(); setIsProgressOpen(false); }}
                      className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-1"
                    >
                      <Plus size={13} /> Tambah Bab
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Format Settings Button */}
            <button
              onClick={() => setIsFormatModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-all flex items-center gap-1.5 shadow-xs"
              title="Pengaturan Margin, Font & Spasi Dokumen"
            >
              <Settings size={14} className="text-zinc-500" />
              <span className="hidden md:inline">Format Template</span>
            </button>

            {/* Citations Panel Button */}
            <button
              onClick={() => { setActiveRightPanel('citations'); setRightSidebarOpen(true); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                rightSidebarOpen && activeRightPanel === 'citations'
                  ? 'bg-[var(--color-brand-50)] border border-[var(--color-brand-200)] text-[var(--color-brand-700)]'
                  : 'bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 shadow-xs'
              }`}
            >
              <BookOpen size={14} className={rightSidebarOpen && activeRightPanel === 'citations' ? 'text-[var(--color-brand-600)]' : 'text-zinc-500'} />
              <span className="hidden lg:inline">Sitasi</span>
            </button>

            {/* Annotations Panel Button */}
            <button
              onClick={() => { setActiveRightPanel('comments'); setRightSidebarOpen(true); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                rightSidebarOpen && activeRightPanel === 'comments'
                  ? 'bg-amber-50 border border-amber-200 text-amber-800'
                  : 'bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 shadow-xs'
              }`}
            >
              <Clock size={14} className="text-amber-600" />
              <span className="hidden lg:inline">Anotasi</span>
            </button>

            {/* Primary Compile Action Button */}
            <button
              onClick={handleOpenCompilation}
              className="px-4 py-1.5 rounded-xl bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm hover:shadow active:scale-98"
              title="Kompilasi semua bab menjadi dokumen Word utuh"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Kompilasi Word</span>
              <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                {filledCount}/{totalBabs}
              </span>
            </button>

            {!rightSidebarOpen && (
              <button
                onClick={() => setRightSidebarOpen(true)}
                className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-500 border border-zinc-200 ml-1 transition-colors"
                title="Buka Panel Bantuan"
              >
                <PanelRight size={17} />
              </button>
            )}
          </div>
        </header>

        {/* ========================================================================= */}
        {/* Dynamic Center Canvas View (Clean & Wide) */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar flex justify-center">
          <div className="w-full max-w-5xl">
            {/* VIEW 1: OVERVIEW SELURUH BAB */}
            {activeBabId === null ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                {/* Header Welcome Card */}
                <div className="bg-gradient-to-r from-[var(--color-brand-900)] via-[var(--color-brand-800)] to-[var(--color-brand-700)] text-white p-6 md:p-8 rounded-3xl shadow-md border border-[var(--color-brand-600)]/30 relative overflow-hidden">
                  <div className="relative z-10 max-w-2xl">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-md mb-3 inline-block border border-white/10 shadow-xs">
                      Workspace Penulisan Tugas Akhir
                    </span>
                    <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-2 tracking-tight">
                      Kelola Naskah per Bab & Kompilasi
                    </h2>
                    <p className="text-sm text-white/95 leading-relaxed font-normal">
                      Tulis langsung di editor atau unggah berkas Word (.docx). Sistem akan mengotomasi margin standar kampus, memanajemen sitasi, dan menggabungkan draf akhir menjadi satu dokumen siap sidang.
                    </p>
                  </div>
                  <div className="absolute right-6 bottom-4 opacity-15 text-white pointer-events-none hidden md:block">
                    <Layers size={180} />
                  </div>
                </div>

                {/* Status Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-xs">
                    <div className="text-xs text-zinc-500 font-medium mb-1">Total Bab Target</div>
                    <div className="text-2xl font-bold text-zinc-900">{totalBabs} Bab</div>
                  </div>
                  <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-xs">
                    <div className="text-xs text-zinc-500 font-medium mb-1">Draf Terisi</div>
                    <div className="text-2xl font-bold text-emerald-600">{filledCount} Bab</div>
                  </div>
                  <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-xs">
                    <div className="text-xs text-zinc-500 font-medium mb-1">Preset Format</div>
                    <div className="text-sm font-bold text-zinc-800 truncate">{format.fontFamily} ({format.fontSize}pt)</div>
                  </div>
                  <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-xs">
                    <div className="text-xs text-zinc-500 font-medium mb-1">Kesiapan Kompilasi</div>
                    <div className="text-2xl font-bold text-[var(--color-brand-600)]">
                      {progressPct}%
                    </div>
                  </div>
                </div>

                {/* Chapter Management Section */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-1">
                    <div>
                      <h3 className="font-display font-bold text-xl text-zinc-900 flex items-center gap-2">
                        <span>Struktur & Daftar Bab Tugas Akhir</span>
                        <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-full">
                          {outline.length} Bab
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Kelola struktur naskah, tambah/hapus bab dan sub-bab, serta pantau kelengkapan draf.
                      </p>
                    </div>

                    {/* ALWAYS VISIBLE ACTION BUTTONS! */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleResetOutline}
                        title="Kembalikan ke template default kampus"
                        className="px-3 py-2 bg-white hover:bg-zinc-100 text-zinc-600 text-xs font-semibold rounded-xl border border-zinc-200 shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <RotateCcw size={13} />
                        <span>Reset Template</span>
                      </button>
                      <button
                        onClick={handleAddBab}
                        title="Tambah Bab Baru ke Naskah"
                        className="px-4 py-2 bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                      >
                        <Plus size={15} />
                        <span>Tambah Bab Baru</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {outline.map((bab, idx) => {
                      const up = uploads[bab.id];
                      const text = contents[bab.id] || '';
                      const words = getWordCount(text);
                      const isFilled = !!up || words > 0;

                      return (
                        <div
                          key={bab.id}
                          className={`p-5 rounded-2xl border-2 transition-all bg-white flex flex-col justify-between shadow-xs hover:shadow-md ${
                            isFilled
                              ? 'border-zinc-200 hover:border-emerald-500/60'
                              : 'border-zinc-200 hover:border-[var(--color-brand-400)]'
                          }`}
                        >
                          <div>
                            {/* Card Header: Bab badge, status pill, and ALWAYS VISIBLE ACTION BUTTONS */}
                            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-100">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-800)] bg-[var(--color-brand-50)] border border-[var(--color-brand-200)] px-2.5 py-0.5 rounded-md">
                                  Bab {idx + 1}
                                </span>
                                {up ? (
                                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <FileCheck size={12} /> Berkas Terunggah
                                  </span>
                                ) : words > 0 ? (
                                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <Edit3 size={12} /> Draf ({words} kata)
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-medium text-zinc-400 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-full">
                                    Belum Diisi
                                  </span>
                                )}
                              </div>

                              {/* ALWAYS VISIBLE CHAPTER ACTION BUTTONS (NO HOVER NEEDED!) */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => { setEditingBabId(bab.id); setEditingBabDraft(bab.title); }}
                                  title="Ubah Nama Bab"
                                  className="px-2 py-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-900 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                                >
                                  <Edit3 size={12} />
                                  <span className="hidden sm:inline">Ubah</span>
                                </button>
                                <button
                                  onClick={(e) => handleDeleteBab(bab.id, e)}
                                  title="Hapus Bab Ini"
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                >
                                  <Trash2 size={12} />
                                  <span className="hidden sm:inline">Hapus</span>
                                </button>
                              </div>
                            </div>

                            {/* Chapter Title / Inline Editor */}
                            <div className="mt-3">
                              {editingBabId === bab.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={editingBabDraft}
                                    onChange={(e) => setEditingBabDraft(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveRenameBab(bab.id);
                                      if (e.key === 'Escape') setEditingBabId(null);
                                    }}
                                    autoFocus
                                    className="flex-1 text-sm font-bold px-3 py-1.5 border-2 border-[var(--color-brand-600)] rounded-xl outline-none bg-white text-zinc-900 shadow-inner"
                                  />
                                  <button
                                    onClick={() => handleSaveRenameBab(bab.id)}
                                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                                    title="Simpan Judul"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() => setEditingBabId(null)}
                                    className="p-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-xl text-xs"
                                    title="Batal"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <h4
                                  onClick={() => setActiveBabId(bab.id)}
                                  className="font-bold text-base text-zinc-900 hover:text-[var(--color-brand-600)] transition-colors cursor-pointer"
                                  title="Klik untuk membuka editor bab"
                                >
                                  {bab.title}
                                </h4>
                              )}
                            </div>

                            {/* SUB-BAB MANAGEMENT DIRECTLY IN CARD (ALWAYS VISIBLE!) */}
                            <div className="mt-3 bg-zinc-50/80 border border-zinc-200/80 rounded-xl p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-zinc-600 flex items-center gap-1.5">
                                  <Layers size={13} className="text-[var(--color-brand-600)]" />
                                  Sub-bab ({bab.children?.length || 0}):
                                </span>
                                <button
                                  onClick={() => handleAddSubBab(bab.id)}
                                  title="Tambah sub-bab baru ke bab ini"
                                  className="px-2.5 py-1 bg-white hover:bg-[var(--color-brand-50)] text-[var(--color-brand-700)] hover:text-[var(--color-brand-800)] border border-[var(--color-brand-200)] rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-all hover:scale-102"
                                >
                                  <Plus size={12} />
                                  <span>Tambah Sub-bab</span>
                                </button>
                              </div>

                              {/* Sub-bab list */}
                              {bab.children && bab.children.length > 0 ? (
                                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-0.5">
                                  {bab.children.map((child) => (
                                    <div
                                      key={child.id}
                                      className="flex items-center justify-between py-1.5 px-2.5 bg-white border border-zinc-200/70 rounded-lg text-xs text-zinc-700"
                                    >
                                      {editingSubBabId === child.id ? (
                                        <div className="flex items-center gap-1.5 flex-1 min-w-0 mr-2">
                                          <input
                                            type="text"
                                            value={editingSubBabDraft}
                                            onChange={(e) => setEditingSubBabDraft(e.target.value)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleSaveRenameSubBab(bab.id, child.id);
                                              if (e.key === 'Escape') setEditingSubBabId(null);
                                            }}
                                            autoFocus
                                            className="flex-1 text-xs font-semibold px-2 py-1 border border-[var(--color-brand-600)] rounded-md outline-none bg-white text-zinc-900"
                                          />
                                          <button
                                            onClick={() => handleSaveRenameSubBab(bab.id, child.id)}
                                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                          >
                                            <Check size={13} />
                                          </button>
                                          <button
                                            onClick={() => setEditingSubBabId(null)}
                                            className="p-1 text-zinc-400 hover:bg-zinc-100 rounded"
                                          >
                                            <X size={13} />
                                          </button>
                                        </div>
                                      ) : (
                                        <span className="truncate flex-1 min-w-0 font-medium text-zinc-800">
                                          {child.title}
                                        </span>
                                      )}

                                      {/* ALWAYS VISIBLE ACTION BUTTONS ON EACH SUB-BAB! */}
                                      <div className="flex items-center gap-1 shrink-0 ml-2">
                                        <button
                                          onClick={() => { setEditingSubBabId(child.id); setEditingSubBabDraft(child.title); }}
                                          title="Ubah nama sub-bab"
                                          className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
                                        >
                                          <Edit3 size={12} />
                                        </button>
                                        <button
                                          onClick={(e) => handleDeleteSubBab(bab.id, child.id, e)}
                                          title="Hapus sub-bab ini"
                                          className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-zinc-400 italic py-1">
                                  Belum ada sub-bab di bab ini. Klik tombol "Tambah Sub-bab" di atas.
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Card Footer */}
                          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                            <span className="text-zinc-500 truncate max-w-[200px]">
                              {up ? up.fileName : words > 0 ? `${words} kata tertulis` : 'Belum ada draf naskah'}
                            </span>
                            <button
                              onClick={() => setActiveBabId(bab.id)}
                              className="px-4 py-2 bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs hover:shadow"
                            >
                              <span>{isFilled ? 'Buka Editor Bab' : 'Tulis / Unggah Draf'}</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* VIEW 2: ACTIVE BAB WRITING & REVIEW WORKSPACE */
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                {/* Active Chapter Header & Status Bar */}
                <div className="bg-white border border-zinc-200 p-4 px-5 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      activeUpload 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : activeWords > 0 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'bg-zinc-100 text-zinc-400'
                    }`}>
                      {activeUpload ? <FileCheck size={20} /> : activeWords > 0 ? <Edit3 size={20} /> : <FileText size={20} />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-zinc-900 flex items-center gap-2 flex-wrap">
                        {editingBabId === activeBabId ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editingBabDraft}
                              onChange={(e) => setEditingBabDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRenameBab(activeBabId);
                                if (e.key === 'Escape') setEditingBabId(null);
                              }}
                              autoFocus
                              className="text-sm font-bold px-2 py-0.5 border border-[var(--color-brand-600)] rounded-md outline-none bg-white text-zinc-900"
                            />
                            <button
                              onClick={() => handleSaveRenameBab(activeBabId)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingBabId(null)}
                              className="p-1 text-zinc-400 hover:bg-zinc-100 rounded"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <span>{activeBab?.title}</span>
                            <button
                              onClick={() => { setEditingBabId(activeBabId); setEditingBabDraft(activeBab?.title || ''); }}
                              title="Ubah judul bab"
                              className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
                            >
                              <Edit3 size={13} />
                            </button>
                          </span>
                        )}

                        {activeUpload ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Berkas: {activeUpload.fileName}
                          </span>
                        ) : activeWords > 0 ? (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                            Draf ({activeWords} kata)
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                            Draf Kosong
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-2">
                        <span>Format: {format.fontFamily} {format.fontSize}pt · Spasi {format.lineSpacing}</span>
                        {lastSavedTime && (
                          <span className="text-emerald-600 font-medium">· ✓ Tersimpan ({lastSavedTime})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                      title="Unggah berkas naskah dari komputer"
                    >
                      <Upload size={13} />
                      <span>{activeUpload ? 'Ganti File' : 'Unggah File'}</span>
                    </button>
                    {activeWords === 0 && !activeUpload && (
                      <button
                        onClick={() => handleInsertScaffold(activeBabId)}
                        className="px-3 py-1.5 bg-[var(--color-brand-50)] text-[var(--color-brand-700)] border border-[var(--color-brand-200)] hover:bg-[var(--color-brand-100)] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                        title="Isi draf dengan kerangka sub-bab otomatis"
                      >
                        <Sparkles size={13} />
                        <span>Gunakan Kerangka Sub-bab</span>
                      </button>
                    )}
                    {(activeWords > 0 || activeUpload) && (
                      <button
                        onClick={() => handleResetBab(activeBabId)}
                        className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
                        title="Kosongkan isi bab ini"
                      >
                        <Trash2 size={13} />
                        <span>Kosongkan</span>
                      </button>
                    )}
                    <button
                      onClick={() => setIsFormatModalOpen(true)}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl transition-colors"
                    >
                      Ubah Margin
                    </button>
                    {/* ALWAYS VISIBLE HAPUS BAB BUTTON! */}
                    <button
                      onClick={() => handleDeleteBab(activeBabId)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                      title="Hapus bab ini dari struktur dokumen"
                    >
                      <Trash2 size={13} />
                      <span>Hapus Bab</span>
                    </button>
                  </div>
                </div>

                {/* SUB-BAB MANAGER BAR DIRECTLY IN MAIN SECTION (ABOVE EDITOR) */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Layers size={15} className="text-[var(--color-brand-600)]" />
                      <h4 className="font-bold text-xs md:text-sm text-zinc-900">
                        Sub-bab {activeBab?.title} ({activeBab?.children?.length || 0})
                      </h4>
                      <span className="text-[11px] text-zinc-400 hidden md:inline">
                        · Tambah atau hapus poin sub-bab langsung dari sini
                      </span>
                    </div>

                    {/* ALWAYS VISIBLE BUTTON TO ADD SUB-BAB! */}
                    <button
                      onClick={() => handleAddSubBab(activeBabId)}
                      className="px-3 py-1.5 bg-[var(--color-brand-50)] text-[var(--color-brand-700)] hover:bg-[var(--color-brand-100)] border border-[var(--color-brand-200)] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs"
                    >
                      <Plus size={13} />
                      <span>Tambah Sub-bab</span>
                    </button>
                  </div>

                  {/* List of Sub-babs as Chips */}
                  {activeBab?.children && activeBab.children.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {activeBab.children.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 shadow-2xs"
                        >
                          {editingSubBabId === sub.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={editingSubBabDraft}
                                onChange={(e) => setEditingSubBabDraft(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveRenameSubBab(activeBabId, sub.id);
                                  if (e.key === 'Escape') setEditingSubBabId(null);
                                }}
                                autoFocus
                                className="px-2 py-0.5 text-xs font-bold border border-[var(--color-brand-600)] rounded-md outline-none bg-white text-zinc-900 w-44"
                              />
                              <button
                                onClick={() => handleSaveRenameSubBab(activeBabId, sub.id)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              >
                                <Check size={12} />
                              </button>
                              <button
                                onClick={() => setEditingSubBabId(null)}
                                className="p-1 text-zinc-400 hover:bg-zinc-100 rounded"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="font-semibold text-zinc-800">{sub.title}</span>
                              <div className="flex items-center gap-0.5 ml-1">
                                <button
                                  onClick={() => { setEditingSubBabId(sub.id); setEditingSubBabDraft(sub.title); }}
                                  title="Ubah nama sub-bab"
                                  className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded transition-colors"
                                >
                                  <Edit3 size={11} />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteSubBab(activeBabId, sub.id, e)}
                                  title="Hapus sub-bab ini"
                                  className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-400 italic flex items-center justify-between py-1">
                      <span>Belum ada sub-bab di bab ini.</span>
                      <button
                        onClick={() => handleInsertScaffold(activeBabId)}
                        className="text-xs font-bold text-[var(--color-brand-600)] hover:underline flex items-center gap-1"
                      >
                        <Sparkles size={12} /> Pasang Kerangka Sub-bab Otomatis
                      </button>
                    </div>
                  )}
                </div>

                {/* Hidden File Input for uploading to this Bab */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.doc,.txt,.md,.html"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileProcess(file);
                    e.target.value = '';
                  }}
                />

                {/* Quick Onboarding / Starter Banner if Bab is Empty */}
                {activeWords === 0 && !activeUpload && (
                  <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
                    <div className="flex items-center gap-2.5 text-amber-900">
                      <HelpCircle size={18} className="text-amber-600 shrink-0" />
                      <div>
                        <strong>Bab ini masih kosong.</strong> Anda bisa mengetik langsung, memuat contoh naskah belum diparafrase untuk dites, atau memasang kerangka sub-bab otomatis.
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleInsertSampleDraft(activeBabId)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                        title="Muat contoh kalimat mahasiswa belum diparafrase untuk dicoba"
                      >
                        <Sparkles size={13} className="text-amber-300" />
                        <span>+ Muat Contoh Draf Uji Coba</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertScaffold(activeBabId)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors shrink-0 shadow-xs"
                      >
                        + Pasang Kerangka Sub-bab
                      </button>
                    </div>
                  </div>
                )}

                {/* Document Editor Paper Container */}
                <div 
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(false);
                  }}
                  onDrop={handleDropFile}
                  className={`bg-white border rounded-3xl shadow-sm p-6 md:p-10 min-h-[600px] transition-all relative ${
                    isDraggingFile 
                      ? 'border-2 border-dashed border-[var(--color-brand-600)] bg-[var(--color-brand-50)]/30 ring-4 ring-[var(--color-brand-600)]/10' 
                      : 'border-zinc-200'
                  }`}
                >
                  {isDraggingFile && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center z-50 rounded-3xl animate-in fade-in">
                      <div className="w-16 h-16 rounded-2xl bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex items-center justify-center mb-3">
                        <Upload size={32} />
                      </div>
                      <h3 className="font-bold text-base text-zinc-900">Lepaskan berkas untuk mengisi {activeBab?.title}</h3>
                      <p className="text-xs text-zinc-500 mt-1">Mendukung berkas Word (.docx) atau teks (.txt)</p>
                    </div>
                  )}

                  <div className="mb-4 pb-3 border-b border-zinc-100 flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-lg text-zinc-900">{activeBab?.title}</h2>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Sorot (blok) teks kalimat untuk memunculkan <strong>Floating Quick Menu</strong> (Parafrase AI, Koreksi EYD, dll.)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleInsertSampleDraft(activeBabId)}
                        className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 text-xs font-semibold rounded-lg transition-colors"
                        title="Muat teks draf mentah untuk mencoba fitur parafrase"
                      >
                        Contoh Draf
                      </button>
                      <div className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
                        {activeWords} Kata · {activeChars} Karakter
                      </div>
                    </div>
                  </div>

                  <RichTextEditor 
                    content={activeContent} 
                    onChange={(newHtml) => handleSaveContent(activeBabId, newHtml)}
                    onAddComment={handleAddComment} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* RIGHT SIDEBAR: Sitasi & Referensi, Anotasi, Bantuan AI */}
      {/* ========================================================================= */}
      {rightSidebarOpen && (
        <aside className="w-80 md:w-88 border-l border-zinc-200/90 bg-white flex flex-col transition-all duration-300 shrink-0 shadow-sm z-30">
          <div className="p-3.5 px-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveRightPanel('citations')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeRightPanel === 'citations' 
                    ? 'bg-[var(--color-brand-600)] text-white shadow-xs' 
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                Sitasi Pintar
              </button>
              <button
                onClick={() => setActiveRightPanel('comments')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeRightPanel === 'comments' 
                    ? 'bg-amber-700 text-white shadow-xs' 
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                Anotasi Dosen
              </button>
            </div>
            <button
              onClick={() => setRightSidebarOpen(false)}
              className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <PanelRight size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-zinc-50/40">
            {activeRightPanel === 'comments' ? (
              <CommentThread selectedTextForNewComment={selectedText} />
            ) : (
              <CitationPanel />
            )}
          </div>
        </aside>
      )}

      {/* Quota Exhausted Modal */}
      {quotaExhaustedFeature && (
        <QuotaModal
          featureKey={quotaExhaustedFeature}
          isOpen={true}
          onClose={() => setQuotaExhaustedFeature(null)}
          onPurchased={() => {
            setQuotaExhaustedFeature(null);
            if (quotaExhaustedFeature === 'kompilasi') {
              setIsCompilationModalOpen(true);
            }
          }}
        />
      )}
    </div>
  );
}
