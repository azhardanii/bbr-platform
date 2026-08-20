'use client';

import { useState, useEffect } from 'react';
import { X, Settings2, Check, BookOpen, Sliders, Eye } from 'lucide-react';

export interface CitationFormatConfig {
  style: 'apa7' | 'ieee' | 'harvard' | 'chicago' | 'vancouver' | 'mla' | 'custom';
  sortOrder: 'alphabetical' | 'appearance';
  hangingIndent: boolean;
  lineSpacing: '1.0' | '1.15' | '1.5';
  includeDoi: boolean;
  customPrefix?: string;
  customSuffix?: string;
}

export const DEFAULT_CITATION_FORMAT: CitationFormatConfig = {
  style: 'apa7',
  sortOrder: 'alphabetical',
  hangingIndent: true,
  lineSpacing: '1.0',
  includeDoi: true,
};

interface CitationFormatModalProps {
  onClose: () => void;
  onSave?: (config: CitationFormatConfig) => void;
}

export default function CitationFormatModal({ onClose, onSave }: CitationFormatModalProps) {
  const [config, setConfig] = useState<CitationFormatConfig>(DEFAULT_CITATION_FORMAT);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bbr_citation_format');
      if (stored) {
        try { setConfig(JSON.parse(stored)); } catch {}
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('bbr_citation_format', JSON.stringify(config));
    window.dispatchEvent(new Event('bbr-citation-format-changed'));
    onSave?.(config);
    onClose();
  };

  // Generate real-time preview based on active style
  const getInTextPreview = () => {
    switch (config.style) {
      case 'ieee':
        return '[1]';
      case 'vancouver':
        return '(1)';
      case 'harvard':
        return '(Sugiyono 2021)';
      case 'mla':
        return '(Sugiyono 45)';
      case 'chicago':
        return '(Sugiyono 2021)';
      case 'custom':
        return '(Sugiyono, 2021: hal. 14)';
      case 'apa7':
      default:
        return '(Sugiyono, 2021)';
    }
  };

  const getBibliographyPreview = () => {
    switch (config.style) {
      case 'ieee':
        return '[1] Sugiyono, "Metode Penelitian Kuantitatif, Kualitatif, dan R&D," Bandung: Alfabeta, 2021.' + (config.includeDoi ? ' doi: 10.1016/j.ijhcs.2021.102688.' : '');
      case 'harvard':
        return 'Sugiyono, 2021. Metode Penelitian Kuantitatif, Kualitatif, dan R&D, Bandung: Alfabeta.' + (config.includeDoi ? ' Available at: <https://doi.org/10.1016/j.ijhcs.2021.102688>.' : '');
      case 'mla':
        return 'Sugiyono. Metode Penelitian Kuantitatif, Kualitatif, dan R&D. Alfabeta, 2021.' + (config.includeDoi ? ' doi:10.1016/j.ijhcs.2021.102688.' : '');
      case 'vancouver':
        return '1. Sugiyono. Metode Penelitian Kuantitatif, Kualitatif, dan R&D. Bandung: Alfabeta; 2021.' + (config.includeDoi ? ' Available from: https://doi.org/10.1016/j.ijhcs.2021.102688' : '');
      case 'apa7':
      default:
        return 'Sugiyono. (2021). Metode Penelitian Kuantitatif, Kualitatif, dan R&D. Alfabeta Bandung.' + (config.includeDoi ? ' https://doi.org/10.1016/j.ijhcs.2021.102688' : '');
    }
  };

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/70">
          <div className="flex items-center gap-2.5 text-zinc-900 font-bold text-sm">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex items-center justify-center border border-[var(--color-brand-100)]">
              <Sliders size={16} />
            </div>
            <div>
              <div className="leading-none">Pengaturan Format Sitasi & Daftar Pustaka</div>
              <div className="text-[11px] text-zinc-400 font-normal mt-0.5">Sesuaikan dengan pedoman penulisan kampus Anda</div>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-xl hover:bg-zinc-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Style Template Selector */}
          <div>
            <label className="block text-zinc-800 font-bold mb-2">Standar Format Sitasi</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'apa7', name: 'APA 7th Edition', desc: '(Penulis, Tahun)' },
                { id: 'ieee', name: 'IEEE', desc: 'Angka [1]' },
                { id: 'harvard', name: 'Harvard', desc: '(Penulis Tahun)' },
                { id: 'chicago', name: 'Chicago Style', desc: '(Penulis 2021)' },
                { id: 'vancouver', name: 'Vancouver', desc: 'Superskrip (1)' },
                { id: 'custom', name: 'Pedoman Kampus', desc: 'Kustom Lokal' },
              ].map(item => {
                const active = config.style === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, style: item.id as any }))}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      active 
                        ? 'bg-[var(--color-brand-50)]/80 border-[var(--color-brand-600)] text-[var(--color-brand-600)] ring-2 ring-[var(--color-brand-600)]/20' 
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="font-bold">{item.name}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bibliography Rules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
            {/* Sorting Order */}
            <div>
              <label className="block text-zinc-800 font-bold mb-1.5">Urutan Daftar Pustaka</label>
              <select
                value={config.sortOrder}
                onChange={e => setConfig(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
              >
                <option value="alphabetical">Abjad Penulis (A - Z)</option>
                <option value="appearance">Urutan Pemunculan di Naskah [1, 2, ...]</option>
              </select>
            </div>

            {/* Spacing */}
            <div>
              <label className="block text-zinc-800 font-bold mb-1.5">Spasi Baris Rujukan</label>
              <select
                value={config.lineSpacing}
                onChange={e => setConfig(prev => ({ ...prev, lineSpacing: e.target.value as any }))}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-600)]"
              >
                <option value="1.0">Tunggal (Single 1.0)</option>
                <option value="1.15">Spasi 1.15</option>
                <option value="1.5">Spasi 1.5</option>
              </select>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-2.5 pt-2 border-t border-zinc-100">
            <label className="flex items-center justify-between p-3 bg-zinc-50 rounded-2xl border border-zinc-200/80 cursor-pointer hover:bg-zinc-100 transition-colors">
              <div>
                <div className="font-bold text-zinc-800">Indensitas Gantung (Hanging Indent 1.27 cm)</div>
                <div className="text-[10px] text-zinc-500">Baris kedua dan seterusnya menjorok ke dalam</div>
              </div>
              <input
                type="checkbox"
                checked={config.hangingIndent}
                onChange={e => setConfig(prev => ({ ...prev, hangingIndent: e.target.checked }))}
                className="w-4 h-4 accent-[var(--color-brand-600)] rounded focus:ring-[var(--color-brand-500)]"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-zinc-50 rounded-2xl border border-zinc-200/80 cursor-pointer hover:bg-zinc-100 transition-colors">
              <div>
                <div className="font-bold text-zinc-800">Sertakan Tautan DOI / URL Resmi</div>
                <div className="text-[10px] text-zinc-500">Tampilkan tautan publikasi pada setiap entri rujukan</div>
              </div>
              <input
                type="checkbox"
                checked={config.includeDoi}
                onChange={e => setConfig(prev => ({ ...prev, includeDoi: e.target.checked }))}
                className="w-4 h-4 accent-[var(--color-brand-600)] rounded focus:ring-[var(--color-brand-500)]"
              />
            </label>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 bg-[var(--color-brand-50)]/60 border border-[var(--color-brand-100)] rounded-2xl space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[var(--color-brand-600)] text-xs">
              <Eye size={14} className="text-[var(--color-brand-600)]" />
              <span>Pratinjau Hasil Format ({config.style.toUpperCase()})</span>
            </div>
            
            <div className="space-y-1.5 text-[11px] text-zinc-800">
              <div>
                <strong className="text-[var(--color-brand-600)]">Format di Dalam Paragraf (In-Text):</strong>
                <div className="p-2 bg-white rounded-xl border border-[var(--color-brand-100)] mt-1 font-mono text-[var(--color-brand-600)]">
                  {getInTextPreview()}
                </div>
              </div>

              <div>
                <strong className="text-[var(--color-brand-600)]">Format di Daftar Pustaka:</strong>
                <div className={`p-2.5 bg-white rounded-xl border border-[var(--color-brand-100)] mt-1 leading-relaxed ${config.hangingIndent ? 'pl-6 -indent-4' : ''}`}>
                  {getBibliographyPreview()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/70 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors text-xs"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)] text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs"
          >
            <Check size={14} />
            <span>Terapkan Format Sitasi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
