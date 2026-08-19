'use client';

import { useState } from 'react';
import { GripVertical, Plus, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';

interface OutlineItem {
  id: string;
  title: string;
  children?: OutlineItem[];
  isOpen?: boolean;
}

const initialOutline: OutlineItem[] = [
  {
    id: '1',
    title: 'BAB I PENDAHULUAN',
    isOpen: true,
    children: [
      { id: '1-1', title: '1.1 Latar Belakang Masalah' },
      { id: '1-2', title: '1.2 Rumusan Masalah' },
      { id: '1-3', title: '1.3 Tujuan Penelitian' },
      { id: '1-4', title: '1.4 Manfaat Penelitian' },
    ],
  },
  {
    id: '2',
    title: 'BAB II TINJAUAN PUSTAKA',
    isOpen: false,
    children: [
      { id: '2-1', title: '2.1 Landasan Teori' },
      { id: '2-2', title: '2.2 Penelitian Terdahulu' },
      { id: '2-3', title: '2.3 Kerangka Pemikiran' },
    ],
  },
  {
    id: '3',
    title: 'BAB III METODE PENELITIAN',
    isOpen: false,
    children: [
      { id: '3-1', title: '3.1 Jenis Penelitian' },
      { id: '3-2', title: '3.2 Populasi dan Sampel' },
    ],
  },
];

export default function OutlineBuilder() {
  const [outline, setOutline] = useState<OutlineItem[]>(initialOutline);

  const toggleOpen = (id: string) => {
    setOutline(outline.map(item => item.id === id ? { ...item, isOpen: !item.isOpen } : item));
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Outline Draft</h3>
        <button className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors">
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-1">
        {outline.map((item) => (
          <div key={item.id} className="flex flex-col">
            <div className="group flex items-center gap-1.5 py-1.5 px-2 -mx-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-sm">
              <button onClick={() => toggleOpen(item.id)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                {item.children && item.children.length > 0 ? (
                  item.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                ) : (
                  <span className="w-3.5 inline-block"></span>
                )}
              </button>
              <span className="font-medium truncate text-zinc-800 dark:text-zinc-200">{item.title}</span>
              <div className="ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1">
                <button className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"><Plus size={14} /></button>
                <div className="cursor-grab p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"><GripVertical size={14} /></div>
              </div>
            </div>

            {item.isOpen && item.children && (
              <div className="ml-5 space-y-0.5 border-l border-zinc-200 dark:border-zinc-800 pl-2 mt-1 mb-2">
                {item.children.map(child => (
                  <div key={child.id} className="group flex items-center py-1.5 px-2 -mx-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-sm">
                    <span className="truncate text-zinc-600 dark:text-zinc-400">{child.title}</span>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1">
                      <button className="p-1 text-rose-400 hover:text-rose-600"><Trash2 size={12} /></button>
                      <div className="cursor-grab p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"><GripVertical size={14} /></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="mt-4 w-full py-2 px-3 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-500 hover:text-zinc-800 hover:border-zinc-400 dark:hover:text-zinc-300 dark:hover:border-zinc-600 transition-all font-medium flex justify-center items-center gap-2">
        <Plus size={16} /> Tambah Bab Baru
      </button>
    </div>
  );
}
