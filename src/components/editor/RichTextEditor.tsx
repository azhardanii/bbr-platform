'use client';

import { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';

import { 
  Bold, Italic, Strikethrough, List, ListOrdered, Quote, Heading1, Heading2, 
  MessageSquarePlus, Sparkles, Wand2, PenLine, BookOpen, Check, RefreshCw, X,
  Maximize2, Minimize2, Image as ImageIcon, Table as TableIcon, Plus, Trash2, 
  Columns, Rows
} from 'lucide-react';
import type { Editor } from '@tiptap/react';
import AIAssistantPopup, { AIMode } from '@/components/editor/AIAssistantPopup';

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  onAddComment?: (text: string) => void;
  onAskAI?: (text: string, mode?: AIMode) => void;
  onInsertCitation?: (text: string) => void;
}

const MenuBar = ({ 
  editor, 
  onAddComment, 
  onAskAI 
}: { 
  editor: Editor | null; 
  onAddComment?: (text: string) => void; 
  onAskAI?: (text: string, mode?: AIMode) => void;
}) => {
  if (!editor) return null;

  const getSelectedText = () => {
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to, ' ');
  };

  const isTableActive = editor.isActive('table');

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-zinc-50 border-b border-zinc-200 rounded-t-2xl sticky top-0 z-10 shadow-xs backdrop-blur-md bg-opacity-95">
      {/* Headings */}
      <div className="flex items-center gap-1 pr-2 border-r border-zinc-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded-lg hover:bg-zinc-200 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-zinc-200 text-zinc-900 font-bold' : 'text-zinc-600'}`}
          title="Heading 1 (Judul Bab)"
        >
          <Heading1 size={17} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-lg hover:bg-zinc-200 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-200 text-zinc-900 font-bold' : 'text-zinc-600'}`}
          title="Heading 2 (Sub-bab)"
        >
          <Heading2 size={17} strokeWidth={2.5} />
        </button>
      </div>

      {/* Inline Styles */}
      <div className="flex items-center gap-1 px-2 border-r border-zinc-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg hover:bg-zinc-200 transition-colors ${editor.isActive('bold') ? 'bg-zinc-200 text-zinc-900 font-bold' : 'text-zinc-600'}`}
          title="Bold (Tebal)"
        >
          <Bold size={17} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg hover:bg-zinc-200 transition-colors ${editor.isActive('italic') ? 'bg-zinc-200 text-zinc-900 font-bold' : 'text-zinc-600'}`}
          title="Italic (Miring)"
        >
          <Italic size={17} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-1.5 rounded-lg hover:bg-zinc-200 transition-colors ${editor.isActive('highlight') ? 'bg-amber-200 text-amber-900 font-bold' : 'text-zinc-600'}`}
          title="Highlight (Stabilo)"
        >
          <span className="text-xs font-bold px-1 rounded bg-amber-100 border border-amber-300">H</span>
        </button>
      </div>

      {/* Lists & Quotes */}
      <div className="flex items-center gap-1 px-2 border-r border-zinc-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg hover:bg-zinc-200 transition-colors ${editor.isActive('bulletList') ? 'bg-zinc-200 text-zinc-900 font-bold' : 'text-zinc-600'}`}
          title="Bullet List"
        >
          <List size={17} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg hover:bg-zinc-200 transition-colors ${editor.isActive('orderedList') ? 'bg-zinc-200 text-zinc-900 font-bold' : 'text-zinc-600'}`}
          title="Numbered List"
        >
          <ListOrdered size={17} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-lg hover:bg-zinc-200 transition-colors ${editor.isActive('blockquote') ? 'bg-zinc-200 text-zinc-900 font-bold' : 'text-zinc-600'}`}
          title="Kutipan Langsung (Blockquote)"
        >
          <Quote size={17} strokeWidth={2.5} />
        </button>
      </div>

      {/* Insert Image & Academic Table Tools */}
      <div className="flex items-center gap-1 px-2 border-r border-zinc-200">
        <label
          className="p-1.5 rounded-lg hover:bg-zinc-200 transition-colors text-zinc-600 cursor-pointer flex items-center justify-center"
          title="Sisipkan Gambar / Grafik Penelitian"
        >
          <ImageIcon size={17} strokeWidth={2.5} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const dataUrl = event.target?.result as string;
                  if (dataUrl) {
                    editor.chain().focus().setImage({ src: dataUrl, alt: 'Gambar Penelitian' }).run();
                  }
                };
                reader.readAsDataURL(file);
              }
              e.target.value = '';
            }}
          />
        </label>

        <button
          type="button"
          onClick={() => {
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
          }}
          className={`p-1.5 rounded-lg hover:bg-zinc-200 transition-colors ${isTableActive ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-zinc-600'}`}
          title="Sisipkan Tabel Akademis Baku"
        >
          <TableIcon size={17} strokeWidth={2.5} />
        </button>
      </div>

      {/* Contextual Table Helper Controls (Active only when cursor is inside a table) */}
      {isTableActive && (
        <div className="flex items-center gap-1 px-2 bg-indigo-50/70 border border-indigo-200 rounded-xl animate-in fade-in">
          <span className="text-[10px] font-bold text-indigo-800 pr-1 border-r border-indigo-200">Tabel:</span>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="p-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 rounded"
            title="Tambah Baris ke Bawah"
          >
            +Baris
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="p-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 rounded"
            title="Tambah Kolom ke Kanan"
          >
            +Kolom
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="p-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded"
            title="Hapus Baris Ini"
          >
            -Baris
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="p-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded"
            title="Hapus Kolom Ini"
          >
            -Kolom
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="p-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 rounded flex items-center gap-0.5"
            title="Hapus Seluruh Tabel"
          >
            <Trash2 size={11} />
          </button>
        </div>
      )}

      {/* Right Actions */}
      <div className="flex items-center gap-1 pl-2 ml-auto">
        {onAddComment && (
          <button
            type="button"
            onClick={() => {
              const text = getSelectedText();
              if (text) onAddComment(text);
              else alert('Sorot (blok) kalimat terlebih dahulu untuk menambahkan catatan anotasi.');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
          >
            <MessageSquarePlus size={14} />
            <span>Anotasi</span>
          </button>
        )}
        {onAskAI && (
          <button
            type="button"
            onClick={() => {
              const text = getSelectedText();
              if (text) onAskAI(text, 'paraphrase');
              else alert('Sorot (blok) teks terlebih dahulu untuk meminta bantuan asisten AI.');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-white bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)] transition-all shadow-xs"
          >
            <Sparkles size={14} />
            <span>Tanya AI</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default function RichTextEditor({ 
  content = '', 
  onChange, 
  onAddComment, 
  onAskAI,
  onInsertCitation 
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Floating Bubble state
  const [floatingMenu, setFloatingMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    text: '',
  });

  // AI Modal local state to ensure direct selection replacement
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiSelectedText, setAiSelectedText] = useState('');
  const [activeAIMode, setActiveAIMode] = useState<AIMode>('paraphrase');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Mulai menulis draf tugas akhir Anda di sini...',
        emptyEditorClass: 'is-editor-empty',
      }),
      Highlight.configure({ multicolor: true }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-zinc max-w-none min-h-[500px] p-6 md:p-8 focus:outline-none text-zinc-900 leading-relaxed font-serif',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Synchronize external content changes (e.g. switching chapters)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  // Handle native text selection to position the floating menu smoothly
  const handleSelectionUpdate = () => {
    if (!editor || !containerRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setFloatingMenu(prev => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length < 2) {
      setFloatingMenu(prev => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    // Calculate relative coordinates inside the editor wrapper
    const x = rect.left - containerRect.left + rect.width / 2;
    const y = rect.top - containerRect.top - 10;

    setFloatingMenu({
      visible: true,
      x: Math.max(180, Math.min(x, containerRect.width - 180)),
      y: Math.max(10, y),
      text: selectedText,
    });
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(handleSelectionUpdate, 10);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFloatingMenu(prev => ({ ...prev, visible: false }));
      } else {
        setTimeout(handleSelectionUpdate, 10);
      }
    };

    document.addEventListener('selectionchange', handleSelectionUpdate);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionUpdate);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [editor]);

  const handleTriggerAI = (text: string, mode: AIMode = 'paraphrase') => {
    setAiSelectedText(text);
    setActiveAIMode(mode);
    setIsAIModalOpen(true);
    setFloatingMenu(prev => ({ ...prev, visible: false }));
  };

  // Robust replacement of selected text (Single word, single sentence, or multiple paragraphs)
  const handleApplyAIReplacement = (newText: string) => {
    if (!editor) return;

    // Convert multi-line output into proper HTML paragraphs
    const paragraphs = newText
      .trim()
      .split(/\n\n+/)
      .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');

    // Insert replacement directly into the Tiptap selection
    editor.chain().focus().insertContent(paragraphs).run();
    
    // Call parent onChange to trigger immediate state & localStorage update
    onChange?.(editor.getHTML());
    setIsAIModalOpen(false);
  };

  return (
    <div ref={containerRef} className="flex flex-col bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-visible transition-all duration-200 relative">
      <MenuBar 
        editor={editor} 
        onAddComment={onAddComment} 
        onAskAI={(text, mode) => (onAskAI ? onAskAI(text, mode) : handleTriggerAI(text, mode || 'paraphrase'))} 
      />

      {/* ========================================================================= */}
      {/* FLOATING QUICK BUBBLE MENU (Positioned directly above selected text) */}
      {/* ========================================================================= */}
      {floatingMenu.visible && (
        <div 
          style={{ 
            position: 'absolute', 
            left: `${floatingMenu.x}px`, 
            top: `${floatingMenu.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 100
          }}
          className="flex items-center gap-1 p-1.5 bg-zinc-900 text-white rounded-2xl shadow-2xl border border-zinc-800 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 select-none pointer-events-auto w-max max-w-[95vw] overflow-x-auto no-scrollbar"
        >
          {/* 1. Parafrase Action */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              if (floatingMenu.text) handleTriggerAI(floatingMenu.text, 'paraphrase');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-500)] text-white text-xs font-bold hover:brightness-110 transition-all shadow-xs shrink-0 whitespace-nowrap"
            title="Parafrase kalimat menjadi akademis formal"
          >
            <Sparkles size={13} className="text-amber-300 animate-pulse shrink-0" />
            <span className="whitespace-nowrap">Parafrase</span>
          </button>

          {/* 2. Cek EYD Action */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              if (floatingMenu.text) handleTriggerAI(floatingMenu.text, 'grammar');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-colors shrink-0 whitespace-nowrap"
            title="Perbaiki ejaan, typo, dan tata bahasa (EYD)"
          >
            <PenLine size={13} className="text-emerald-400 shrink-0" />
            <span className="whitespace-nowrap inline-block">Cek EYD</span>
          </button>

          {/* 3. Perluas Action */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              if (floatingMenu.text) handleTriggerAI(floatingMenu.text, 'expand');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-colors shrink-0 whitespace-nowrap"
            title="Perluas argumen & data teoritis"
          >
            <Maximize2 size={13} className="text-blue-400 shrink-0" />
            <span className="whitespace-nowrap">Perluas</span>
          </button>

          {/* 4. Persingkat Action */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              if (floatingMenu.text) handleTriggerAI(floatingMenu.text, 'shorten');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-colors shrink-0 whitespace-nowrap"
            title="Persingkat & padatkan kalimat"
          >
            <Minimize2 size={13} className="text-purple-400 shrink-0" />
            <span className="whitespace-nowrap">Persingkat</span>
          </button>

          {/* 5. Terjemahkan Action */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              if (floatingMenu.text) handleTriggerAI(floatingMenu.text, 'translate');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-colors shrink-0 whitespace-nowrap"
            title="Terjemahkan teks (Indo-Inggris / Inggris-Indo)"
          >
            <BookOpen size={13} className="text-pink-400 shrink-0" />
            <span className="whitespace-nowrap">Terjemahkan</span>
          </button>

          <div className="w-[1px] h-4 bg-zinc-700 my-auto mx-1 shrink-0" />

          {/* Formatting Controls in Bubble */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor?.chain().focus().toggleBold().run();
            }}
            className={`p-1.5 rounded-lg hover:bg-zinc-800 transition-colors ${editor?.isActive('bold') ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400'}`}
            title="Bold"
          >
            <Bold size={14} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor?.chain().focus().toggleItalic().run();
            }}
            className={`p-1.5 rounded-lg hover:bg-zinc-800 transition-colors ${editor?.isActive('italic') ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400'}`}
            title="Italic"
          >
            <Italic size={14} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              editor?.chain().focus().toggleHighlight().run();
            }}
            className={`p-1.5 rounded-lg hover:bg-zinc-800 transition-colors ${editor?.isActive('highlight') ? 'bg-amber-500/30 text-amber-300' : 'text-zinc-400'}`}
            title="Highlight"
          >
            <span className="text-[11px] font-bold px-1 rounded bg-amber-400/20 text-amber-300">H</span>
          </button>

          <div className="w-[1px] h-4 bg-zinc-700 my-auto mx-1 shrink-0" />

          {/* Annotation Action */}
          {onAddComment && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                if (floatingMenu.text) onAddComment(floatingMenu.text);
              }}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-amber-400 transition-colors"
              title="Tambahkan catatan anotasi revisi"
            >
              <MessageSquarePlus size={14} />
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Integrated AI Assistant Popup */}
      {isAIModalOpen && aiSelectedText && (
        <AIAssistantPopup 
          selectedText={aiSelectedText} 
          initialMode={activeAIMode}
          onClose={() => setIsAIModalOpen(false)} 
          onApply={handleApplyAIReplacement} 
        />
      )}
    </div>
  );
}
