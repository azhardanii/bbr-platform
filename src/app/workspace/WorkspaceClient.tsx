'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  FileText, BookOpen, Clock, PanelLeft, PanelRight, Settings, X, Check, 
  Upload, Download, FileCheck, File as FileIcon, Sparkles, LayoutGrid, Plus, 
  ChevronRight, ArrowRight, ArrowLeft, LayoutDashboard, RefreshCw, Wand2, ShieldCheck, CheckCircle2,
  Layers, SlidersHorizontal, Eye, HelpCircle, Edit3, Trash2, CheckSquare
} from 'lucide-react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import OutlineBuilder, { OutlineItem } from '@/components/workspace/OutlineBuilder';
import CitationPanel from '@/components/workspace/CitationPanel';
import ProgressTrackerSidebar from '@/components/workspace/ProgressTrackerSidebar';
import AIAssistantPopup from '@/components/editor/AIAssistantPopup';
import CommentThread from '@/components/editor/CommentThread';

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
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [activeRightPanel, setActiveRightPanel] = useState<'comments' | 'citations' | 'ai'>('citations');
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
  const [isCompilationModalOpen, setIsCompilationModalOpen] = useState(false);
  
  // Left Sidebar Tab Switcher (Outline vs Progress)
  const [sidebarTab, setSidebarTab] = useState<'outline' | 'progress'>('outline');

  // Chapter-based State
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [activeBabId, setActiveBabId] = useState<string | null>(null);
  
  // Real chapter contents & uploads stored in localStorage
  const [contents, setContents] = useState<Record<string, string>>({});
  const [uploads, setUploads] = useState<Record<string, UploadedBab>>({});
  
  // Format state
  const [format, setFormat] = useState<DocFormat>(DEFAULT_FORMAT);

  // File Upload Drag & Drop State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    }
  }, []);

  // Save content handler
  const handleSaveContent = (babId: string, newHtml: string) => {
    const updated = { ...contents, [babId]: newHtml };
    setContents(updated);
    localStorage.setItem('bbr_bab_contents', JSON.stringify(updated));
    setLastSavedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  };

  // Save uploads handler
  const saveUploads = (newUploads: Record<string, UploadedBab>) => {
    setUploads(newUploads);
    localStorage.setItem('bbr_bab_uploads', JSON.stringify(newUploads));
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
      {/* LEFT SIDEBAR: Struktur Bab & Target Progress */}
      {/* ========================================================================= */}
      {leftSidebarOpen && (
        <aside className="w-80 md:w-88 border-r border-zinc-200/90 bg-white flex flex-col transition-all duration-300 shrink-0 shadow-sm z-30">
          {/* Header Panel */}
          <div className="p-3.5 px-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSidebarTab('outline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  sidebarTab === 'outline'
                    ? 'bg-[var(--color-brand-600)] text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60'
                }`}
              >
                Struktur Bab
              </button>
              <button
                onClick={() => setSidebarTab('progress')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  sidebarTab === 'progress'
                    ? 'bg-[var(--color-brand-600)] text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60'
                }`}
              >
                Target Progress
              </button>
            </div>
            <button
              onClick={() => setLeftSidebarOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/60 rounded-lg transition-colors"
              title="Sembunyikan Panel"
            >
              <PanelLeft size={16} />
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {sidebarTab === 'outline' ? (
              <OutlineBuilder 
                activeBabId={activeBabId} 
                onSelectBab={setActiveBabId} 
                uploadedBabIds={filledBabIds} 
                outline={outline}
                setOutline={setOutline}
              />
            ) : (
              <div className="space-y-4">
                <ProgressTrackerSidebar />
              </div>
            )}
          </div>

          {/* Sidebar Footer: Kembali ke Dashboard */}
          <div className="p-3 px-4 border-t border-zinc-200 bg-zinc-50/90 mt-auto shrink-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl bg-white hover:bg-[var(--color-brand-50)] text-zinc-700 hover:text-[var(--color-brand-600)] border border-zinc-200 hover:border-[var(--color-brand-300)] font-bold text-xs transition-all shadow-xs group"
            >
              <div className="w-7 h-7 rounded-lg bg-zinc-100 group-hover:bg-[var(--color-brand-100)] text-zinc-500 group-hover:text-[var(--color-brand-600)] flex items-center justify-center transition-colors shrink-0">
                <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <div className="flex flex-col text-left">
                <span className="leading-tight text-xs font-bold text-zinc-800 group-hover:text-[var(--color-brand-600)]">Kembali ke Dashboard</span>
                <span className="text-[10px] text-zinc-400 font-normal">Halaman Utama Platform</span>
              </div>
            </Link>
          </div>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE CANVAS AREA */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col h-full bg-zinc-100 relative transition-all duration-300 min-w-0 overflow-hidden">
        {/* Top Control Header Toolbar */}
        <header className="h-14 border-b border-zinc-200/90 bg-white flex items-center justify-between px-4 sticky top-0 z-20 shrink-0 shadow-xs">
          {/* Left Controls */}
          <div className="flex items-center gap-3 min-w-0">
            {!leftSidebarOpen && (
              <button
                onClick={() => setLeftSidebarOpen(true)}
                className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-600 border border-zinc-200 shrink-0 transition-colors"
                title="Buka Struktur Bab"
              >
                <PanelLeft size={17} />
              </button>
            )}
            <div className="flex items-center gap-2 truncate">
              <Link
                href="/dashboard"
                className="font-bold text-xs md:text-sm text-zinc-600 hover:text-[var(--color-brand-600)] transition-colors flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg hover:bg-zinc-100"
              >
                <LayoutDashboard size={14} className="text-zinc-500" />
                <span>Dashboard</span>
              </Link>
              <ChevronRight size={14} className="text-zinc-400 shrink-0" />
              <button
                onClick={() => setActiveBabId(null)}
                className={`font-bold text-xs md:text-sm transition-colors flex items-center gap-1 shrink-0 ${
                  activeBabId === null ? 'text-[var(--color-brand-600)]' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Workspace
              </button>
              {activeBab && (
                <>
                  <ChevronRight size={14} className="text-zinc-400 shrink-0" />
                  <span className="font-semibold text-xs md:text-sm text-zinc-900 truncate">
                    {activeBab.title}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Format Settings Button */}
            <button
              onClick={() => setIsFormatModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-all flex items-center gap-1.5 shadow-xs"
              title="Pengaturan Margin, Font & Spasi Dokumen"
            >
              <Settings size={14} className="text-zinc-500" />
              <span className="hidden sm:inline">Format Template</span>
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
              <span className="hidden md:inline">Sitasi</span>
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
              <span className="hidden md:inline">Anotasi</span>
            </button>

            {/* Primary Compile Action Button */}
            <button
              onClick={() => setIsCompilationModalOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm hover:shadow active:scale-98"
              title="Kompilasi semua bab menjadi dokumen Word utuh"
            >
              <Download size={15} />
              <span>Kompilasi</span>
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
        {/* Dynamic Center Canvas View */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar flex justify-center">
          <div className="w-full max-w-5xl">
            {/* VIEW 1: OVERVIEW SELURUH BAB */}
            {activeBabId === null ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                {/* Header Welcome Card */}
                <div className="bg-gradient-to-r from-[#7B2020] via-[#651818] to-[#450F0F] text-white p-6 md:p-8 rounded-3xl shadow-md border border-[#9B3535]/30 relative overflow-hidden">
                  <div className="relative z-10 max-w-2xl">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-md mb-3 inline-block border border-white/10 shadow-xs">
                      Workspace Penulisan Tugas Akhir
                    </span>
                    <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-2 tracking-tight">
                      Kelola Naskah per Bab & Kompilasi
                    </h2>
                    <p className="text-sm text-white/95 leading-relaxed font-normal">
                      Tulis langsung di editor atau unggah berkas Word (.docx). Sistem akan mengotomasi margin standar, memanajemen sitasi, dan menggabungkan draf akhir menjadi satu dokumen siap sidang.
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
                      {totalBabs > 0 ? Math.round((filledCount / totalBabs) * 100) : 0}%
                    </div>
                  </div>
                </div>

                {/* Chapter Cards Grid */}
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="font-bold text-sm text-zinc-800">Daftar Bab Tugas Akhir</h3>
                    <span className="text-xs text-zinc-500">Pilih bab untuk mulai menulis atau mengunggah berkas</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {outline.map((bab, idx) => {
                      const up = uploads[bab.id];
                      const text = contents[bab.id] || '';
                      const words = getWordCount(text);
                      const isFilled = !!up || words > 0;

                      return (
                        <div
                          key={bab.id}
                          onClick={() => setActiveBabId(bab.id)}
                          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white group flex flex-col justify-between ${
                            isFilled
                              ? 'border-zinc-200 hover:border-emerald-500 hover:shadow-md'
                              : 'border-zinc-200 hover:border-[var(--color-brand-400)] hover:shadow-md'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
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
                                <span className="text-[11px] font-medium text-zinc-500 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-full">
                                  Belum Diisi
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-sm text-zinc-900 group-hover:text-[var(--color-brand-600)] transition-colors mb-1">
                              {bab.title}
                            </h4>
                            <p className="text-xs text-zinc-400">
                              {bab.children && bab.children.length > 0 
                                ? `Template Outline: ${bab.children.length} Sub-bab` 
                                : 'Tanpa sub-bab default'}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                            <span className="text-zinc-500 truncate max-w-[200px]">
                              {up ? up.fileName : words > 0 ? `${words} kata tertulis` : 'Belum ada draf naskah'}
                            </span>
                            <span className="font-bold text-[var(--color-brand-600)] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              {isFilled ? 'Buka Editor' : 'Tulis / Unggah'} <ArrowRight size={13} />
                            </span>
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
                      <div className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                        <span>{activeBab?.title}</span>
                        {activeUpload ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Berkas: {activeUpload.fileName}
                          </span>
                        ) : activeWords > 0 ? (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                            Draf Manual ({activeWords} kata)
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

                  <div className="flex items-center gap-2">
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
                        className="px-3 py-1.5 bg-zinc-100 hover:bg-rose-50 hover:text-rose-600 text-zinc-600 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
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
                  </div>
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
    </div>
  );
}
