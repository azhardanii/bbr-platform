'use client';

import { useState } from 'react';
import { Send, UserCircle2, CheckCircle2 } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  role: 'student' | 'supervisor';
  text: string;
  timestamp: string;
  resolved: boolean;
  quote?: string;
}

interface Comment {
  id: string;
  author: string;
  role: 'student' | 'supervisor';
  text: string;
  timestamp: string;
  resolved: boolean;
  quote?: string;
}

export default function CommentThread({ selectedTextForNewComment }: { selectedTextForNewComment?: string | null }) {
  const [comments, setComments] = useState<Comment[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("bbr_workspace_comments");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });
  const [newReply, setNewReply] = useState('');

  const handleSend = () => {
    if (!newReply.trim()) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      author: 'Anda (Mahasiswa)',
      role: 'student',
      text: newReply,
      timestamp: 'Baru saja',
      resolved: false,
      quote: selectedTextForNewComment || undefined,
    };
    const updated = [...comments, newComment];
    setComments(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("bbr_workspace_comments", JSON.stringify(updated));
    }
    setNewReply('');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Thread Diskusi</h3>
        <button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1">
          <CheckCircle2 size={14} /> Tandai Selesai
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.length === 0 && !selectedTextForNewComment && (
          <div className="flex flex-col items-center justify-center text-center h-full py-8 text-zinc-400">
            <UserCircle2 size={36} className="mb-2 opacity-40" />
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Belum ada diskusi</p>
            <p className="text-[11px] text-zinc-400 mt-1 max-w-[200px]">
              Tulis catatan atau sorot teks di naskah untuk memulai catatan diskusi bimbingan.
            </p>
          </div>
        )}

        {comments.map((comment, idx) => (
          <div key={comment.id} className={`flex gap-3 ${comment.role === 'student' ? 'flex-row-reverse' : 'flex-row'}`}>
            <UserCircle2 
              size={24} 
              className={`shrink-0 mt-1 ${comment.role === 'supervisor' ? 'text-amber-500' : 'text-indigo-500'}`} 
            />
            <div className={`flex flex-col ${comment.role === 'student' ? 'items-end' : 'items-start'} max-w-[85%]`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{comment.author}</span>
                <span className="text-[10px] text-zinc-400">{comment.timestamp}</span>
              </div>
              <div className={`p-3 rounded-2xl text-sm ${
                comment.role === 'supervisor' 
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-sm' 
                  : 'bg-indigo-600 text-white rounded-tr-sm'
              }`}>
                {idx === 0 && comment.quote && (
                  <div className="mb-2 pl-2 border-l-2 border-amber-400/50 text-xs text-zinc-500 dark:text-zinc-400 italic">
                    &quot;{comment.quote}&quot;
                  </div>
                )}
                {comment.text}
              </div>
            </div>
          </div>
        ))}

        {selectedTextForNewComment && (
          <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg">
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 uppercase tracking-wider">Komentar Baru pada:</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 italic line-clamp-2">&quot;{selectedTextForNewComment}&quot;</p>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 relative">
        <textarea 
          placeholder="Tulis balasan..."
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
          className="w-full resize-none bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[80px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button 
          onClick={handleSend}
          disabled={!newReply.trim()}
          className="absolute right-5 bottom-5 p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md disabled:opacity-50 transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
