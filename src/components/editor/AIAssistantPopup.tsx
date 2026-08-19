'use client';

import { Sparkles, Check, X, RefreshCw, PenLine, BookOpen } from 'lucide-react';
import { useState } from 'react';

interface AIAssistantPopupProps {
  selectedText: string;
  onClose: () => void;
  onApply: (newText: string) => void;
}

export default function AIAssistantPopup({ selectedText, onClose, onApply }: AIAssistantPopupProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'formalize' | 'paraphrase' | 'grammar'>('formalize');

  // Simulasi pemanggilan API AI
  const handleProcess = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResult(`Ini adalah hasil simulasi dari AI untuk proses ${activeTab} teks: "${selectedText.substring(0, 30)}..."`);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-900/10">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
            <Sparkles size={18} />
            <span>AI Writing Assistant</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X size={18} />
          </button>
        </div>

        {/* Action Tabs */}
        <div className="flex px-4 pt-3 gap-2 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('formalize')}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'formalize' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
          >
            <BookOpen size={16} /> Formalisasi
          </button>
          <button 
            onClick={() => setActiveTab('paraphrase')}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'paraphrase' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
          >
            <RefreshCw size={16} /> Parafrase
          </button>
          <button 
            onClick={() => setActiveTab('grammar')}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'grammar' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
          >
            <PenLine size={16} /> Cek Tata Bahasa
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-4">
            <h4 className="text-xs font-bold uppercase text-zinc-500 mb-1.5">Teks Asli</h4>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800">
              {selectedText}
            </div>
          </div>

          {!result && !loading && (
            <button 
              onClick={handleProcess}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex justify-center items-center gap-2"
            >
              <Sparkles size={16} /> Proses dengan AI
            </button>
          )}

          {loading && (
            <div className="p-6 flex flex-col items-center justify-center text-zinc-500 space-y-3">
              <RefreshCw className="animate-spin text-indigo-500" size={24} />
              <p className="text-sm">Menganalisis teks...</p>
            </div>
          )}

          {result && !loading && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <h4 className="text-xs font-bold uppercase text-indigo-500 mb-1.5 flex justify-between items-center">
                <span>Hasil Saran</span>
                <button onClick={handleProcess} className="text-indigo-500 hover:text-indigo-600 flex items-center gap-1 normal-case font-medium">
                  <RefreshCw size={12} /> Regenerate
                </button>
              </h4>
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg text-sm text-zinc-800 dark:text-zinc-200 shadow-inner">
                {result}
              </div>
              
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => onApply(result)}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-1.5"
                >
                  <Check size={16} /> Terapkan ke Draft
                </button>
                <button 
                  onClick={onClose}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
