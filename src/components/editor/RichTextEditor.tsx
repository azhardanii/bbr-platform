'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { Bold, Italic, Strikethrough, List, ListOrdered, Quote, Heading1, Heading2, MessageSquarePlus, Sparkles } from 'lucide-react';
import type { Editor } from '@tiptap/react';

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  onAddComment?: (text: string) => void;
  onAskAI?: (text: string) => void;
}

const MenuBar = ({ editor, onAddComment, onAskAI }: { editor: Editor | null, onAddComment?: (text: string) => void, onAskAI?: (text: string) => void }) => {
  if (!editor) return null;

  const getSelectedText = () => {
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to, ' ');
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 rounded-t-xl sticky top-0 z-10 shadow-sm backdrop-blur-md bg-opacity-90">
      <div className="flex items-center gap-1 pr-2 border-r border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
          title="Heading 1"
        >
          <Heading1 size={18} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
          title="Heading 2"
        >
          <Heading2 size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex items-center gap-1 px-2 border-r border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('bold') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
        >
          <Bold size={18} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('italic') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
        >
          <Italic size={18} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('strike') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
        >
          <Strikethrough size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex items-center gap-1 px-2 border-r border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('bulletList') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
        >
          <List size={18} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('orderedList') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
        >
          <ListOrdered size={18} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('blockquote') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
        >
          <Quote size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex items-center gap-1 pl-2 ml-auto">
        {onAddComment && (
          <button
            onClick={() => {
              const text = getSelectedText();
              if (text) onAddComment(text);
              else alert('Pilih teks terlebih dahulu untuk menambahkan komentar.');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 transition-colors"
          >
            <MessageSquarePlus size={16} strokeWidth={2.5} />
            <span>Komentar</span>
          </button>
        )}
        {onAskAI && (
          <button
            onClick={() => {
              const text = getSelectedText();
              if (text) onAskAI(text);
              else alert('Pilih teks terlebih dahulu untuk mendapatkan bantuan AI.');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors shadow-sm"
          >
            <Sparkles size={16} strokeWidth={2.5} />
            <span>Tanya AI</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default function RichTextEditor({ content = '', onChange, onAddComment, onAskAI }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Mulai menulis draft Anda di sini...',
        emptyEditorClass: 'is-editor-empty',
      }),
      Highlight.configure({ multicolor: true }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-zinc dark:prose-invert prose-p:leading-relaxed prose-headings:font-semibold max-w-none min-h-[500px] p-6 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      <MenuBar editor={editor} onAddComment={onAddComment} onAskAI={onAskAI} />
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
