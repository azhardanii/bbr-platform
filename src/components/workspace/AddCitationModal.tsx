'use client';

import { useState } from 'react';
import { X, Plus, Book, Globe, FileText, Bookmark, Check } from 'lucide-react';
import type { CitationItem } from '@/components/editor/AIAssistantPopup';

interface AddCitationModalProps {
  onClose: () => void;
  onAdd: (citation: CitationItem) => void;
}

export default function AddCitationModal({ onClose, onAdd }: AddCitationModalProps) {
  const [sourceType, setSourceType] = useState<'jurnal' | 'buku' | 'prosiding' | 'website'>('jurnal');
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [journalOrPublisher, setJournalOrPublisher] = useState('');
  const [doi, setDoi] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !authors.trim()) {
      alert('Judul dan Nama Penulis wajib diisi.');
      return;
    }

    const newCitation: CitationItem = {
      id: `cit_manual_${Date.now()}`,
      title: title.trim(),
      authors: authors.trim(),
      year: year.trim() || new Date().getFullYear().toString(),
      journal: journalOrPublisher.trim() || (sourceType === 'buku' ? 'Penerbit Buku' : 'Jurnal Ilmiah'),
      doi: doi.trim() || undefined,
      url: url.trim() || (doi.trim() ? `https://doi.org/${doi.trim()}` : undefined),
    };

    onAdd(newCitation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/70">
          <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex items-center justify-center border border-[var(--color-brand-100)]">
              <Plus size={16} />
            </div>
            <div>
              <div className="leading-none">Tambah Referensi Manual</div>
              <div className="text-[11px] text-zinc-400 font-normal mt-0.5">Input data sumber rujukan tugas akhir Anda</div>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-xl hover:bg-zinc-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Source Type Selector */}
          <div>
            <label className="block text-zinc-700 font-bold mb-1.5">Tipe Sumber</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'jurnal', label: 'Jurnal', icon: Book },
                { id: 'buku', label: 'Buku', icon: Bookmark },
                { id: 'prosiding', label: 'Prosiding', icon: FileText },
                { id: 'website', label: 'Website', icon: Globe },
              ].map(t => {
                const Icon = t.icon;
                const active = sourceType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSourceType(t.id as any)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-bold border transition-all ${
                      active 
                        ? 'bg-[var(--color-brand-50)] border-[var(--color-brand-600)] text-[var(--color-brand-600)] shadow-2xs' 
                        : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-zinc-700 font-bold mb-1">
              Judul {sourceType === 'buku' ? 'Buku' : 'Artikel / Publikasi'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Metodologi Penelitian Kuantitatif & Kualitatif..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
            />
          </div>

          {/* Authors & Year */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-zinc-700 font-bold mb-1">
                Penulis <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Sugiyono, A. & Pratama, B."
                value={authors}
                onChange={e => setAuthors(e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
              />
            </div>
            <div>
              <label className="block text-zinc-700 font-bold mb-1">Tahun</label>
              <input
                type="text"
                placeholder="2023"
                value={year}
                onChange={e => setYear(e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
              />
            </div>
          </div>

          {/* Journal / Publisher */}
          <div>
            <label className="block text-zinc-700 font-bold mb-1">
              {sourceType === 'buku' ? 'Penerbit & Kota' : sourceType === 'website' ? 'Nama Situs / Organisasi' : 'Nama Jurnal Ilmiah'}
            </label>
            <input
              type="text"
              placeholder={sourceType === 'buku' ? 'Alfabeta, Bandung' : 'Jurnal Sistem Informasi Bisnis'}
              value={journalOrPublisher}
              onChange={e => setJournalOrPublisher(e.target.value)}
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
            />
          </div>

          {/* DOI & URL */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-700 font-bold mb-1">Nomor DOI (Opsional)</label>
              <input
                type="text"
                placeholder="10.1016/j.ijhcs.2021.102688"
                value={doi}
                onChange={e => setDoi(e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
              />
            </div>
            <div>
              <label className="block text-zinc-700 font-bold mb-1">Tautan Web / URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)] text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>Simpan ke Sitasi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
