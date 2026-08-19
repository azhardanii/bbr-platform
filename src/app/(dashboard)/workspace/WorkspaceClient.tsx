'use client';

import { useState } from 'react';
import { FileText, BookOpen, Clock, LayoutPanelLeft, LayoutPanelRight } from 'lucide-react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import OutlineBuilder from '@/components/workspace/OutlineBuilder';
import CitationPanel from '@/components/workspace/CitationPanel';
import ProgressTrackerSidebar from '@/components/workspace/ProgressTrackerSidebar';
import AIAssistantPopup from '@/components/editor/AIAssistantPopup';
import CommentThread from '@/components/editor/CommentThread';

export default function WorkspaceClient() {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [activeRightPanel, setActiveRightPanel] = useState<'comments' | 'citations' | 'ai'>('comments');
  
  // States for selected text interaction
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const handleAddComment = (text: string) => {
    setSelectedText(text);
    setActiveRightPanel('comments');
    setRightSidebarOpen(true);
  };

  const handleAskAI = (text: string) => {
    setSelectedText(text);
    setIsAIModalOpen(true);
  };

  return (
    <div className="flex flex-1 w-full h-full overflow-hidden text-zinc-900 dark:text-zinc-100">
      
      {/* Left Sidebar: Outline & Progress */}
      {leftSidebarOpen && (
        <aside className="w-80 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col transition-all duration-300">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="font-semibold flex items-center gap-2">
              <FileText size={18} className="text-zinc-500" />
              Struktur Dokumen
            </h2>
            <button onClick={() => setLeftSidebarOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-500">
              <LayoutPanelLeft size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <ProgressTrackerSidebar />
            <hr className="border-zinc-200 dark:border-zinc-800" />
            <OutlineBuilder />
          </div>
        </aside>
      )}

      {/* Main Content Area: Editor */}
      <main className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 relative transition-all duration-300">
        {/* Header Toolbar */}
        <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {!leftSidebarOpen && (
              <button onClick={() => setLeftSidebarOpen(true)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-500">
                <LayoutPanelLeft size={18} />
              </button>
            )}
            <div>
              <h1 className="font-semibold text-sm">Draft Skripsi v1</h1>
              <p className="text-xs text-zinc-500">Terakhir disimpan: Beberapa detik yang lalu</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setActiveRightPanel('citations'); setRightSidebarOpen(true); }}
              className={`p-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium ${rightSidebarOpen && activeRightPanel === 'citations' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
            >
              <BookOpen size={16} /> <span className="hidden sm:inline">Referensi</span>
            </button>
            <button 
              onClick={() => { setActiveRightPanel('comments'); setRightSidebarOpen(true); }}
              className={`p-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium ${rightSidebarOpen && activeRightPanel === 'comments' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
            >
              <Clock size={16} /> <span className="hidden sm:inline">Anotasi</span>
            </button>
            {!rightSidebarOpen && (
              <button onClick={() => setRightSidebarOpen(true)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-500 ml-2 border-l border-zinc-200 dark:border-zinc-800 pl-3">
                <LayoutPanelRight size={18} />
              </button>
            )}
          </div>
        </header>

        {/* Editor Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 pb-32 flex justify-center">
          <div className="w-full max-w-4xl">
            <RichTextEditor 
              onAddComment={handleAddComment} 
              onAskAI={handleAskAI} 
            />
          </div>
        </div>

        {/* Floating AI Modal */}
        {isAIModalOpen && selectedText && (
          <AIAssistantPopup 
            selectedText={selectedText} 
            onClose={() => setIsAIModalOpen(false)} 
            onApply={(result) => {
               // In a real app, this would replace the editor's selection
               alert('Saran AI diterima (Simulasi)');
               setIsAIModalOpen(false);
            }} 
          />
        )}
      </main>

      {/* Right Sidebar: Contextual Tools (Citations, Comments) */}
      {rightSidebarOpen && (
        <aside className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shadow-xl sm:shadow-none transition-all duration-300 z-30">
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <div className="flex gap-1">
              <button 
                onClick={() => setActiveRightPanel('comments')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${activeRightPanel === 'comments' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              >
                Komentar
              </button>
              <button 
                onClick={() => setActiveRightPanel('citations')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${activeRightPanel === 'citations' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              >
                Sitasi
              </button>
            </div>
            <button onClick={() => setRightSidebarOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-500">
              <LayoutPanelRight size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-zinc-50/50 dark:bg-zinc-900/50">
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
