'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Plus, Book, ExternalLink, Quote, Trash2, Check, BookOpen, Sliders, Settings } from 'lucide-react';
import type { CitationItem } from '@/components/editor/AIAssistantPopup';
import AddCitationModal from '@/components/workspace/AddCitationModal';
import CitationFormatModal, { CitationFormatConfig, DEFAULT_CITATION_FORMAT } from '@/components/workspace/CitationFormatModal';

const DEFAULT_CITATIONS: CitationItem[] = [
  {
    id: 'cit_default_1',
    authors: 'Sugiyono',
    year: '2021',
    title: 'Metode Penelitian Kuantitatif, Kualitatif, dan R&D',
    journal: 'Alfabeta Bandung',
    url: 'https://scholar.google.com/scholar?q=Metode+Penelitian+Kuantitatif+Kualitatif+dan+R%26D+Sugiyono+2021',
  },
  {
    id: 'cit_default_2',
    authors: 'Nielsen, J., & Kurniawan, S.',
    year: '2021',
    title: 'User Interface Design Guidelines for Elderly Users in E-Commerce Platforms',
    journal: 'International Journal of Human-Computer Studies',
    doi: '10.1016/j.ijhcs.2021.102688',
    url: 'https://doi.org/10.1016/j.ijhcs.2021.102688',
  }
];

export default function CitationPanel() {
  const { data: session } = useSession();
  const userId = session?.user?.id || 'default';
  const [citations, setCitations] = useState<CitationItem[]>([]);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
  const [formatConfig, setFormatConfig] = useState<CitationFormatConfig>(DEFAULT_CITATION_FORMAT);

  const loadCitations = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`bbr_${userId}_citations`) || localStorage.getItem('bbr_citations');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCitations(parsed);
          }
        } catch {}
      }

      // Fetch from Database
      fetch('/api/references')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.success && Array.isArray(data.citations) && data.citations.length > 0) {
            const formatted = data.citations.map((c: any) => ({
              id: c.id,
              authors: c.authors || '',
              year: c.year || '',
              title: c.title,
              journal: c.source || '',
              url: c.doi_url || '',
            }));
            setCitations(formatted);
            localStorage.setItem(`bbr_${userId}_citations`, JSON.stringify(formatted));
            localStorage.setItem('bbr_citations', JSON.stringify(formatted));
          } else if (!stored) {
            setCitations(DEFAULT_CITATIONS);
            localStorage.setItem('bbr_citations', JSON.stringify(DEFAULT_CITATIONS));
          }
        })
        .catch(() => {});
    }
  };

  const loadFormatConfig = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`bbr_${userId}_citation_format`) || localStorage.getItem('bbr_citation_format');
      if (stored) {
        try { setFormatConfig(JSON.parse(stored)); } catch {}
      }
    }
  };

  useEffect(() => {
    loadCitations();
    loadFormatConfig();

    const handleAdded = () => loadCitations();
    const handleFormatChanged = () => loadFormatConfig();

    window.addEventListener('bbr-citation-added', handleAdded);
    window.addEventListener('bbr-citation-format-changed', handleFormatChanged);
    window.addEventListener('storage', handleAdded);

    return () => {
      window.removeEventListener('bbr-citation-added', handleAdded);
      window.removeEventListener('bbr-citation-format-changed', handleFormatChanged);
      window.removeEventListener('storage', handleAdded);
    };
  }, [userId]);

  const handleManualAdd = async (newCit: CitationItem) => {
    const updated = [newCit, ...citations];
    setCitations(updated);
    localStorage.setItem(`bbr_${userId}_citations`, JSON.stringify(updated));
    localStorage.setItem('bbr_citations', JSON.stringify(updated));
    window.dispatchEvent(new Event('bbr-citation-added'));

    // Persist to database
    try {
      await fetch('/api/references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newCit.id,
          title: newCit.title,
          authors: newCit.authors,
          year: newCit.year,
          source: newCit.journal || '',
          doi_url: newCit.url || newCit.doi || '',
          type: 'journal',
        }),
      });
    } catch (e) {
      console.warn('[CitationPanel] Could not save citation to database:', e);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    const updated = citations.filter(c => c.id !== id);
    setCitations(updated);
    localStorage.setItem(`bbr_${userId}_citations`, JSON.stringify(updated));
    localStorage.setItem('bbr_citations', JSON.stringify(updated));

    // Delete in database
    try {
      await fetch(`/api/references?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('[CitationPanel] Could not delete citation from database:', e);
    }
  };

  // Generate In-text citation copy according to active format config
  const handleCopyInText = (cit: CitationItem, index: number) => {
    const authorLastname = cit.authors.split(',')[0].trim();
    let inText = `(${authorLastname}, ${cit.year})`;

    if (formatConfig.style === 'ieee') inText = `[${index + 1}]`;
    else if (formatConfig.style === 'vancouver') inText = `(${index + 1})`;
    else if (formatConfig.style === 'harvard') inText = `(${authorLastname} ${cit.year})`;
    else if (formatConfig.style === 'mla') inText = `(${authorLastname} 45)`;
    else if (formatConfig.style === 'chicago') inText = `(${authorLastname} ${cit.year})`;
    else if (formatConfig.style === 'custom') inText = `(${authorLastname}, ${cit.year}: hal. 14)`;

    navigator.clipboard.writeText(inText);
    if (cit.id) {
      setCopiedId(cit.id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  const filtered = citations.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.authors.toLowerCase().includes(search.toLowerCase()) ||
    c.journal.toLowerCase().includes(search.toLowerCase())
  );

  const getStyleLabel = () => {
    switch (formatConfig.style) {
      case 'ieee': return 'IEEE [1]';
      case 'harvard': return 'Harvard';
      case 'chicago': return 'Chicago';
      case 'vancouver': return 'Vancouver (1)';
      case 'mla': return 'MLA 9th';
      case 'custom': return 'Pedoman Kampus';
      case 'apa7':
      default:
        return 'APA 7th';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3.5">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
        <input 
          type="text" 
          placeholder="Cari jurnal & referensi..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)] text-zinc-900 shadow-2xs"
        />
      </div>

      {/* Action Buttons: Add Citation & Format Settings */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)] text-white rounded-xl text-xs font-bold transition-all shadow-2xs whitespace-nowrap"
          title="Tambah referensi dari jurnal / buku / website"
        >
          <Plus size={14} className="shrink-0" />
          <span className="whitespace-nowrap">Tambah Referensi</span>
        </button>

        <button
          type="button"
          onClick={() => setIsFormatModalOpen(true)}
          className="flex items-center justify-between gap-1 py-2 px-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold transition-colors border border-zinc-200 shrink-0"
          title="Atur format sitasi dan daftar pustaka"
        >
          <span className="font-bold text-[11px] text-[var(--color-brand-600)] whitespace-nowrap truncate max-w-[85px]">{getStyleLabel()}</span>
          <Settings size={13} className="text-zinc-500 shrink-0" />
        </button>
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Daftar Rujukan ({filtered.length})
        </span>
        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Format: {getStyleLabel()}
        </span>
      </div>

      {/* Citation List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pt-1 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 text-xs space-y-2">
            <BookOpen size={26} className="mx-auto text-zinc-300 mb-1" />
            <p className="font-semibold text-zinc-600">Belum ada rujukan ditemukan.</p>
            <p className="text-[11px] text-zinc-400">
              Klik <strong>Tambah Referensi</strong> di atas atau gunakan fitur <strong>Perluas & Sitasi</strong> pada editor.
            </p>
          </div>
        ) : (
          filtered.map((cit, idx) => (
            <div 
              key={cit.id || cit.title} 
              className="bg-white p-3 rounded-2xl border border-zinc-200 shadow-2xs hover:border-[var(--color-brand-400)]/60 transition-all group relative space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--color-brand-600)] bg-[var(--color-brand-50)] px-2 py-0.5 rounded-md border border-[var(--color-brand-100)]">
                  <Book size={10} /> {formatConfig.style === 'ieee' ? `[${idx + 1}] ` : ''}Rujukan
                </span>
                <span className="text-[11px] font-bold text-zinc-500">{cit.year}</span>
              </div>

              <h4 className="text-xs font-bold text-zinc-900 leading-snug">
                {cit.title}
              </h4>
              <p className="text-[11px] text-zinc-600 font-medium line-clamp-1">
                {cit.authors}
              </p>
              <p className="text-[10px] text-zinc-400 italic truncate">
                {cit.journal}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleCopyInText(cit, idx)}
                  className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-brand-600)] hover:text-[var(--color-brand-500)] transition-colors"
                  title="Salin format in-text citation sesuai style aktif"
                >
                  {copiedId === cit.id ? <Check size={12} className="text-emerald-600" /> : <Quote size={12} />}
                  <span>{copiedId === cit.id ? 'Tersalin' : 'Sitasi Teks'}</span>
                </button>

                <div className="flex items-center gap-2">
                  {cit.url && (
                    <a 
                      href={cit.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[11px] font-semibold text-zinc-500 hover:text-[var(--color-brand-600)] inline-flex items-center gap-0.5 transition-colors"
                      title="Buka publikasi resmi"
                    >
                      <span>Akses</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(cit.id)}
                    className="text-zinc-400 hover:text-rose-500 p-1 transition-colors"
                    title="Hapus sitasi"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Manual Add Citation Modal */}
      {isAddModalOpen && (
        <AddCitationModal 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={handleManualAdd} 
        />
      )}

      {/* Format Settings Modal */}
      {isFormatModalOpen && (
        <CitationFormatModal 
          onClose={() => setIsFormatModalOpen(false)} 
          onSave={cfg => setFormatConfig(cfg)}
        />
      )}
    </div>
  );
}
