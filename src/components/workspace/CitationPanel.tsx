'use client';

import { useState } from 'react';
import { Search, Plus, Book, ExternalLink, Quote } from 'lucide-react';

interface Citation {
  id: string;
  authors: string;
  year: string;
  title: string;
  source: string;
}

const mockCitations: Citation[] = [
  {
    id: '1',
    authors: 'Badjuber, M., & Roseline, A.',
    year: '2023',
    title: 'Pengaruh AI Slop Terhadap Kualitas Tulisan Akademik di Indonesia',
    source: 'Jurnal Ilmu Komputer dan Pendidikan',
  },
  {
    id: '2',
    authors: 'Smith, J., et al.',
    year: '2022',
    title: 'Modern Workflows in Thesis Writing: A Survey',
    source: 'International Journal of Educational Technology',
  }
];

export default function CitationPanel() {
  const [search, setSearch] = useState('');

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
        <input 
          type="text" 
          placeholder="Cari referensi Anda..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      <button className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
        <Plus size={16} /> Tambah Referensi
      </button>

      <div className="flex-1 overflow-y-auto space-y-3 pt-2">
        {mockCitations.map(cit => (
          <div key={cit.id} className="bg-white dark:bg-zinc-950 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-colors group relative">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">
                <Book size={12} /> Jurnal
              </span>
              <span className="text-xs text-zinc-500">{cit.year}</span>
            </div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug mb-1">{cit.title}</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">{cit.authors}</p>
            <p className="text-[11px] text-zinc-500 italic truncate mt-1">{cit.source}</p>
            
            {/* Actions overlay on hover */}
            <div className="absolute inset-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 rounded-lg transition-opacity border border-indigo-200 dark:border-indigo-800">
              <button className="flex flex-col items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 p-2">
                <Quote size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Sitasi Teks</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 p-2">
                <ExternalLink size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Detail</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
