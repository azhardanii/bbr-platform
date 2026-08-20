'use client';

import { useState, useEffect, useRef } from 'react';
import { GripVertical, Plus, ChevronRight, ChevronDown, Trash2, Check, X, FileCheck, File as FileIcon, Sparkles, LayoutGrid, RotateCcw } from 'lucide-react';

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

function generateId() {
  return `bab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

interface EditableTextProps {
  value: string;
  onSave: (v: string) => void;
  className?: string;
  isActive?: boolean;
}

function EditableText({ value, onSave, className, isActive }: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  if (!editing) {
    return (
      <span
        className={className}
        onDoubleClick={(e) => { e.stopPropagation(); setDraft(value); setEditing(true); }}
        title="Klik 2x untuk mengubah nama"
      >
        {value}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1 flex-1 min-w-0" onClick={e => e.stopPropagation()}>
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { onSave(draft); setEditing(false); }
          if (e.key === 'Escape') setEditing(false);
        }}
        className="flex-1 min-w-0 text-xs font-semibold px-2 py-1 border-2 border-[var(--color-brand-600)] rounded-md outline-none bg-white text-zinc-900 shadow-sm"
      />
      <button onClick={(e) => { e.stopPropagation(); onSave(draft); setEditing(false); }} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
        <Check size={14} />
      </button>
      <button onClick={(e) => { e.stopPropagation(); setEditing(false); }} className="p-1 text-zinc-400 hover:bg-zinc-100 rounded">
        <X size={14} />
      </button>
    </div>
  );
}

interface OutlineBuilderProps {
  activeBabId: string | null;
  onSelectBab: (id: string | null) => void;
  uploadedBabIds: string[];
  outline: OutlineItem[];
  setOutline: (outline: OutlineItem[]) => void;
}

export default function OutlineBuilder({ activeBabId, onSelectBab, uploadedBabIds, outline, setOutline }: OutlineBuilderProps) {
  const [jenjang, setJenjang] = useState('S1');
  
  // Drag and drop state for bab
  const [draggedBabIdx, setDraggedBabIdx] = useState<number | null>(null);
  const [dragOverBabIdx, setDragOverBabIdx] = useState<number | null>(null);

  // Drag and drop state for sub-bab
  const [draggedSubBab, setDraggedSubBab] = useState<{ babId: string; subIdx: number } | null>(null);
  const [dragOverSubIdx, setDragOverSubIdx] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ob = localStorage.getItem('bbr_onboarding');
    let j = 'S1';
    if (ob) {
      try { j = JSON.parse(ob)?.jenjang || 'S1'; } catch {}
    }
    setJenjang(j);

    if (outline.length === 0) {
      const saved = localStorage.getItem('bbr_outline');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOutline(parsed);
            return;
          }
        } catch {}
      }
      setOutline(DEFAULT_OUTLINES[j] || DEFAULT_OUTLINES['S1']);
    }
  }, [outline.length, setOutline]);

  const saveOutline = (newOutline: OutlineItem[]) => {
    setOutline(newOutline);
    localStorage.setItem('bbr_outline', JSON.stringify(newOutline));
  };

  const toggleOpen = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    saveOutline(outline.map(item => item.id === id ? { ...item, isOpen: !item.isOpen } : item));
  };

  const renameBab = (id: string, newTitle: string) => {
    saveOutline(outline.map(item => item.id === id ? { ...item, title: newTitle } : item));
  };

  const renameSubBab = (babId: string, childId: string, newTitle: string) => {
    saveOutline(outline.map(item =>
      item.id === babId
        ? { ...item, children: item.children?.map(c => c.id === childId ? { ...c, title: newTitle } : c) }
        : item
    ));
  };

  const deleteBab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (outline.length <= 1) {
      alert('Minimal harus ada 1 bab.');
      return;
    }
    if (confirm('Hapus bab ini dari struktur dokumen?')) {
      const updated = outline.filter(item => item.id !== id);
      saveOutline(updated);
      if (activeBabId === id) onSelectBab(null);
    }
  };

  const deleteSubBab = (e: React.MouseEvent, babId: string, childId: string) => {
    e.stopPropagation();
    saveOutline(outline.map(item =>
      item.id === babId
        ? { ...item, children: item.children?.filter(c => c.id !== childId) }
        : item
    ));
  };

  const addSubBab = (e: React.MouseEvent, babId: string) => {
    e.stopPropagation();
    const bab = outline.find(item => item.id === babId);
    if (!bab) return;
    const babIndex = outline.findIndex(item => item.id === babId) + 1;
    const childCount = (bab.children?.length || 0) + 1;
    const newChild: OutlineItem = {
      id: generateId(),
      title: `${babIndex}.${childCount} Sub-bab Baru`,
    };
    saveOutline(outline.map(item =>
      item.id === babId
        ? { ...item, children: [...(item.children || []), newChild], isOpen: true }
        : item
    ));
  };

  const addBab = () => {
    const num = outline.length + 1;
    const newBab: OutlineItem = {
      id: generateId(),
      title: `BAB ${numToRoman(num)} JUDUL BAB BARU`,
      isOpen: true,
      children: [
        { id: generateId(), title: `${num}.1 Sub-bab Awal` },
      ],
    };
    const updated = [...outline, newBab];
    saveOutline(updated);
    onSelectBab(newBab.id);
  };

  const resetToDefault = () => {
    if (confirm('Kembalikan struktur bab ke template default kampus?')) {
      const defaults = DEFAULT_OUTLINES[jenjang] || DEFAULT_OUTLINES['S1'];
      saveOutline(defaults);
      onSelectBab(null);
    }
  };

  // --- HTML5 Drag and Drop for BAB ---
  const handleBabDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    setDraggedBabIdx(index);
  };

  const handleBabDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverBabIdx !== index) {
      setDragOverBabIdx(index);
    }
  };

  const handleBabDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedBabIdx === null || draggedBabIdx === targetIndex) {
      setDraggedBabIdx(null);
      setDragOverBabIdx(null);
      return;
    }
    const items = [...outline];
    const [moved] = items.splice(draggedBabIdx, 1);
    items.splice(targetIndex, 0, moved);
    saveOutline(items);
    setDraggedBabIdx(null);
    setDragOverBabIdx(null);
  };

  // --- Drag and Drop for Sub-bab ---
  const handleSubBabDrop = (e: React.DragEvent, babId: string, targetSubIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedSubBab || draggedSubBab.babId !== babId || draggedSubBab.subIdx === targetSubIdx) {
      setDraggedSubBab(null);
      setDragOverSubIdx(null);
      return;
    }

    const bab = outline.find(b => b.id === babId);
    if (!bab || !bab.children) return;

    const children = [...bab.children];
    const [moved] = children.splice(draggedSubBab.subIdx, 1);
    children.splice(targetSubIdx, 0, moved);

    saveOutline(outline.map(b => b.id === babId ? { ...b, children } : b));
    setDraggedSubBab(null);
    setDragOverSubIdx(null);
  };

  return (
    <div className="flex flex-col space-y-3">
      {/* Header bar Outline */}
      <div className="flex items-center justify-between px-1 gap-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 truncate">
          Kerangka ({outline.length} Bab)
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={resetToDefault}
            title="Reset ke template default jenjang"
            className="text-[11px] text-zinc-400 hover:text-zinc-700 px-1.5 py-1 rounded-md hover:bg-zinc-100 transition-colors flex items-center gap-1 whitespace-nowrap"
          >
            <RotateCcw size={12} /> Reset
          </button>
          <button
            onClick={addBab}
            title="Tambah Bab Baru"
            className="text-[11px] font-semibold text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] bg-[var(--color-brand-50)] hover:bg-[var(--color-brand-100)] px-2 py-1 rounded-md transition-colors flex items-center gap-1 shadow-xs whitespace-nowrap"
          >
            <Plus size={13} /> Bab
          </button>
        </div>
      </div>

      {/* List Container */}
      <div className="space-y-1.5">
        {/* Tombol Overview Keseluruhan */}
        <button
          onClick={() => onSelectBab(null)}
          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
            activeBabId === null
              ? 'bg-[var(--color-brand-600)] text-white shadow-sm ring-2 ring-[var(--color-brand-600)]/20'
              : 'text-zinc-700 hover:bg-zinc-100/80 bg-zinc-50/50 border border-zinc-200/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <LayoutGrid size={15} className={activeBabId === null ? 'text-white' : 'text-zinc-500'} />
            <span>Ringkasan Seluruh Bab</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            activeBabId === null ? 'bg-white/20 text-white' : 'bg-zinc-200/70 text-zinc-600'
          }`}>
            {uploadedBabIds.length}/{outline.length}
          </span>
        </button>

        <div className="h-px bg-zinc-200/80 my-2" />

        {/* Dynamic Draggable Bab Items */}
        {outline.map((item, idx) => {
          const isUploaded = uploadedBabIds.includes(item.id);
          const isActive = activeBabId === item.id;
          const isDraggingThis = draggedBabIdx === idx;
          const isDragOverThis = dragOverBabIdx === idx;

          return (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleBabDragStart(e, idx)}
              onDragOver={(e) => handleBabDragOver(e, idx)}
              onDrop={(e) => handleBabDrop(e, idx)}
              onDragEnd={() => { setDraggedBabIdx(null); setDragOverBabIdx(null); }}
              className={`flex flex-col rounded-xl transition-all ${
                isDraggingThis ? 'opacity-40 scale-95' : 'opacity-100'
              } ${isDragOverThis ? 'border-t-2 border-[var(--color-brand-600)] bg-[var(--color-brand-50)]/40' : ''}`}
            >
              {/* Bab row header */}
              <div
                onClick={() => onSelectBab(item.id)}
                className={`group relative flex items-center gap-2 py-2.5 px-3 rounded-xl transition-all cursor-pointer border select-none ${
                  isActive
                    ? 'bg-white border-[var(--color-brand-600)] shadow-sm ring-2 ring-[var(--color-brand-600)]/15'
                    : 'bg-white/70 hover:bg-white border-zinc-200/80 hover:border-zinc-300'
                }`}
              >
                {/* Drag handle */}
                <div
                  className="cursor-grab active:cursor-grabbing p-0.5 text-zinc-300 hover:text-zinc-600 transition-colors"
                  title="Tarik untuk memindahkan urutan bab"
                  onClick={e => e.stopPropagation()}
                >
                  <GripVertical size={14} />
                </div>

                {/* Chevron Toggle */}
                <button
                  onClick={(e) => toggleOpen(e, item.id)}
                  className={`p-0.5 rounded transition-colors ${
                    isActive ? 'text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)]' : 'text-zinc-400 hover:bg-zinc-100'
                  }`}
                >
                  {item.children && item.children.length > 0 ? (
                    item.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                  ) : (
                    <span className="w-3.5 inline-block" />
                  )}
                </button>

                {/* Upload / Filled Status Icon */}
                <div
                  title={isUploaded ? "Draf bab sudah terisi" : "Draf bab belum diisi"}
                  className="shrink-0"
                >
                  {isUploaded ? (
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <FileCheck size={11} />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center">
                      <FileIcon size={10} />
                    </div>
                  )}
                </div>

                {/* Title */}
                <EditableText
                  value={item.title}
                  onSave={(v) => renameBab(item.id, v)}
                  isActive={isActive}
                  className={`font-semibold text-xs truncate flex-1 min-w-0 cursor-text ${
                    isActive ? 'text-[var(--color-brand-700)]' : 'text-zinc-800'
                  }`}
                />

                {/* Action Buttons on Hover */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
                  <button
                    onClick={(e) => addSubBab(e, item.id)}
                    title="Tambah Sub-bab"
                    className="p-1 text-zinc-400 hover:text-[var(--color-brand-600)] hover:bg-zinc-100 rounded"
                  >
                    <Plus size={13} />
                  </button>
                  <button
                    onClick={(e) => deleteBab(e, item.id)}
                    title="Hapus Bab"
                    className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Sub-bab rows */}
              {item.isOpen && item.children && item.children.length > 0 && (
                <div className="ml-6 pl-3 border-l-2 border-zinc-200/80 space-y-1 my-1.5">
                  {item.children.map((child, subIdx) => {
                    const isDraggingSub = draggedSubBab?.babId === item.id && draggedSubBab?.subIdx === subIdx;
                    const isDragOverSub = draggedSubBab?.babId === item.id && dragOverSubIdx === subIdx;

                    return (
                      <div
                        key={child.id}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          setDraggedSubBab({ babId: item.id, subIdx });
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDragOverSubIdx(subIdx);
                        }}
                        onDrop={(e) => handleSubBabDrop(e, item.id, subIdx)}
                        className={`group flex items-center py-1.5 px-2 rounded-lg text-xs gap-1.5 transition-all ${
                          isDraggingSub ? 'opacity-40' : 'hover:bg-zinc-100/80 bg-white/40'
                        } ${isDragOverSub ? 'border-t-2 border-[var(--color-brand-500)]' : ''}`}
                      >
                        <div
                          className="cursor-grab active:cursor-grabbing p-0.5 text-zinc-300 hover:text-zinc-500"
                          onClick={e => e.stopPropagation()}
                        >
                          <GripVertical size={12} />
                        </div>
                        <EditableText
                          value={child.title}
                          onSave={(v) => renameSubBab(item.id, child.id, v)}
                          className="truncate text-zinc-600 flex-1 min-w-0 cursor-text text-[11px]"
                        />
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
                          <button
                            onClick={(e) => deleteSubBab(e, item.id, child.id)}
                            className="p-1 text-zinc-400 hover:text-rose-600 rounded"
                            title="Hapus sub-bab"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-2">
        <p className="text-[10px] text-zinc-400 text-center leading-relaxed">
          💡 Tarik ikon titik untuk ubah urutan · Klik 2x nama bab untuk edit
        </p>
      </div>
    </div>
  );
}

function numToRoman(n: number): string {
  const map: [number, string][] = [
    [10, 'X'], [9, 'IX'], [8, 'VIII'], [7, 'VII'], [6, 'VI'],
    [5, 'V'], [4, 'IV'], [3, 'III'], [2, 'II'], [1, 'I'],
  ];
  let result = '';
  for (const [val, sym] of map) {
    while (n >= val) { result += sym; n -= val; }
  }
  return result;
}
