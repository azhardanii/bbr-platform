"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { GraduationCap, Loader2, Send, Sword, ChevronRight, ArrowLeft, XCircle, User } from "lucide-react";
import { useAIChat } from "@/hooks/useAIChat";
import { useJenjang } from "@/hooks/useJenjang";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const PERSONAS = [
  { id: 1, emoji: '😤', name: 'Si Paling Metodologi', desc: 'Sangat ketat menanyakan alasan pemilihan metode, sampel, dan validitas data.', prompt: 'Fokus tanyakan tentang alasan pemilihan metode, validitas instrumen, dan teknik sampling.', colorClasses: 'from-blue-600 to-sky-700', theme: { bg: 'bg-blue-600', bgHover: 'hover:bg-blue-700', lightBg: 'bg-blue-50', lightBgHover: 'hover:bg-blue-100', text: 'text-blue-600', border: 'border-blue-200', ring: 'focus:border-blue-600 focus:ring-1 focus:ring-blue-600' } },
  { id: 2, emoji: '📚', name: 'Si Pengabdi Teori', desc: 'Fokus pada kutipan definisi ahli dan perbandingan grand theory.', prompt: 'Fokus tanyakan definisi variabel dari berbagai tokoh dan alasan memilih teori tertentu.', colorClasses: 'from-emerald-600 to-teal-700', theme: { bg: 'bg-emerald-600', bgHover: 'hover:bg-emerald-700', lightBg: 'bg-emerald-50', lightBgHover: 'hover:bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200', ring: 'focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600' } },
  { id: 3, emoji: '🔍', name: 'Si Detektif', desc: 'Suka mempertanyakan kebaruan (novelty) dan urgensi topik penelitian.', prompt: 'Fokus tanyakan mengapa topik ini penting, gap penelitian, dan kontribusi nyatanya.', colorClasses: 'from-purple-600 to-fuchsia-700', theme: { bg: 'bg-purple-600', bgHover: 'hover:bg-purple-700', lightBg: 'bg-purple-50', lightBgHover: 'hover:bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', ring: 'focus:border-purple-600 focus:ring-1 focus:ring-purple-600' } },
  { id: 4, emoji: '🧮', name: 'Si Raja Statistik', desc: 'Selalu menagih interpretasi detail dari setiap angka statistik di Bab 4.', prompt: 'Fokus tanyakan interpretasi spesifik dari hasil olah data, uji asumsi, dan arti angka.', colorClasses: 'from-indigo-600 to-violet-700', theme: { bg: 'bg-indigo-600', bgHover: 'hover:bg-indigo-700', lightBg: 'bg-indigo-50', lightBgHover: 'hover:bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200', ring: 'focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600' } },
  { id: 5, emoji: '🗣️', name: 'Si Pencari Celah', desc: 'Gemar mencari ketidakkonsistenan antara Bab 1 dan Bab 5.', prompt: 'Fokus cari inkonsistensi antara rumusan masalah, hipotesis, dan kesimpulan akhir.', colorClasses: 'from-orange-600 to-amber-600', theme: { bg: 'bg-orange-600', bgHover: 'hover:bg-orange-700', lightBg: 'bg-orange-50', lightBgHover: 'hover:bg-orange-100', text: 'text-orange-600', border: 'border-orange-200', ring: 'focus:border-orange-600 focus:ring-1 focus:ring-orange-600' } },
  { id: 6, emoji: '🤔', name: 'Si Praktisi', desc: 'Menuntut kelanjutan praktis dan implikasi nyata dari hasil penelitian.', prompt: 'Fokus tanyakan implikasi praktis, cara implementasi, dan rekomendasi konkrit.', colorClasses: 'from-teal-600 to-cyan-700', theme: { bg: 'bg-teal-600', bgHover: 'hover:bg-teal-700', lightBg: 'bg-teal-50', lightBgHover: 'hover:bg-teal-100', text: 'text-teal-600', border: 'border-teal-200', ring: 'focus:border-teal-600 focus:ring-1 focus:ring-teal-600' } },
  { id: 7, emoji: '😴', name: 'Si Silent Treatment', desc: 'Pendiam, memberi respon minim untuk menguji ketenangan mentalmu.', prompt: 'Berikan respon yang sangat singkat, dingin, dan biarkan jeda percakapan terasa canggung.', colorClasses: 'from-slate-600 to-gray-800', theme: { bg: 'bg-slate-600', bgHover: 'hover:bg-slate-700', lightBg: 'bg-slate-50', lightBgHover: 'hover:bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', ring: 'focus:border-slate-600 focus:ring-1 focus:ring-slate-600' } },
  { id: 8, emoji: '🔥', name: "Si Dosen Killer", desc: 'Sengaja mematahkan argumenmu hanya untuk melihat daya tahanmu.', prompt: 'Sengaja bersikap skeptis, sanggah jawaban mahasiswa, dan terus tekan (push back) argumennya.', colorClasses: 'from-red-600 to-rose-800', theme: { bg: 'bg-red-600', bgHover: 'hover:bg-red-700', lightBg: 'bg-red-50', lightBgHover: 'hover:bg-red-100', text: 'text-red-600', border: 'border-red-200', ring: 'focus:border-red-600 focus:ring-1 focus:ring-red-600' } }
];

export default function SidangPage() {
  const { label, labelLower, judulTugasAkhir } = useJenjang();
  const [formData, setFormData] = useState({
    abstrak: "",
    dosenPersona: 1,
  });

  const { messages, input, setInput, isLoading, error, sendMessage, startConversation, reset } = useAIChat({
    api: "/api/ai/sidang",
  });

  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSimulation = async () => {
    if (!judulTugasAkhir || !formData.abstrak) {
      alert("Mohon pastikan judul sudah tersimpan dan abstrak telah diisi.");
      return;
    }

    const selectedPersona = PERSONAS.find(p => p.id === formData.dosenPersona);
    
    const systemInstruction = `PERANMU SEKARANG: Kamu adalah dosen penguji sidang tugas akhir bernama "${selectedPersona?.name}".
Karakteristikmu: ${selectedPersona?.desc}
Tugas Khususmu: ${selectedPersona?.prompt}

ATURAN SUPER KETAT UNTUK RESPONS:
1. BERBICARALAH SEPERTI MANUSIA NYATA (Humanize). Gunakan gaya bahasa lisan dosen (akademis tapi natural).
2. DILARANG KERAS menggunakan deskripsi tindakan fisik bergaya *roleplay* (seperti: *tersenyum tipis*, *mengerutkan dahi*, *mengetuk meja*, dll). Langsung saja ucapkan kalimat dialogmu!
3. DILARANG KERAS memberikan daftar pertanyaan berderet (bullet points).
4. AJUKAN HANYA SATU pertanyaan/sanggahan pada satu waktu.
5. Tanggapi jawaban mahasiswa sebelumnya terlebih dahulu sebelum memberi pertanyaan baru.
6. Ingat konteks pembicaraan. Ini adalah percakapan sidang yang hidup dan dinamis.

Konteks Penelitian Mahasiswa:
Judul: ${judulTugasAkhir}
Abstrak:
"""
${formData.abstrak}
"""`;

    setHasStarted(true);
    await startConversation(
      systemInstruction,
      `[SISTEM] Mahasiswa telah memasuki ruang sidang. Silakan mulai sidang dengan menyapa singkat dan langsung ajukan SATU pertanyaan pertama Anda.`
    );
  };

  const handleEndSession = () => {
    sendMessage("SELESAI SIDANG. Tolong berikan feedback komprehensif: apa kelemahan argumen saya, apa yang sudah baik, dan apa yang harus saya siapkan sebelum sidang asli.");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReset = () => {
    reset();
    setHasStarted(false);
  };

  const activePersona = PERSONAS.find(p => p.id === formData.dosenPersona) || PERSONAS[0];
  const theme = activePersona.theme;

  return (
    <div className={`animate-in fade-in slide-in-from-bottom-4 w-full ${hasStarted ? 'h-[calc(100dvh-14rem)] md:h-[calc(100dvh-7rem)] flex flex-col overflow-hidden' : 'space-y-6 pb-12'}`}>
      {hasStarted ? (
        <button onClick={handleReset} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors mb-4 shrink-0">
          <ArrowLeft size={16} /> Kembali
        </button>
      ) : (
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors mb-2">
          <ArrowLeft size={16} /> Kembali
        </Link>
      )}
      
      {!hasStarted && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)]">Sidang Simulator</h1>
            <p className="text-[var(--color-text-secondary)] mt-2">Latih mental dan argumenmu dengan simulasi sidang {labelLower} interaktif - langsung dengan AI Dosen Penguji.</p>
          </div>
        </div>
      )}

      {!hasStarted && (
        <Link href="/dashboard/sidang/arena" className="block group">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 sm:justify-between hover:shadow-md hover:border-amber-400 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <Sword size={24} />
              </div>
              <div>
                <p className="text-sm text-amber-800 mt-0.5">
                  Belum siap simulasi? Pelajari dulu bocoran 200+ pola pertanyaan jebakan dosen penguji.
                </p>
              </div>
            </div>
            <div className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 group-hover:bg-amber-500 transition-colors shadow-sm shrink-0">
              Masuk ke Arena Sidang <ChevronRight size={18} />
            </div>
          </div>
        </Link>
      )}

      {!hasStarted ? (
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold text-lg text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
            <GraduationCap size={20} className="text-[var(--color-brand-600)]" /> Konfigurasi Simulasi
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Judul Penelitian</label>
              <div className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] bg-gray-50 text-[var(--color-text-secondary)] font-medium">
                {judulTugasAkhir || `Belum ada judul tersimpan.`}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Ringkasan / Abstrak Bab 1-4 <span className="text-[var(--color-error)]">*</span></label>
              <textarea
                value={formData.abstrak}
                onChange={(e) => setFormData({ ...formData, abstrak: e.target.value })}
                placeholder="Jelaskan secara singkat latar belakang masalah, metode yang dipakai, dan hasil temuan utamanya..."
                className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white h-40 resize-y transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-[var(--color-text-body)]">Pilih Persona Dosen Penguji</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PERSONAS.map(p => (
                  <div
                    key={p.id}
                    onClick={() => setFormData({ ...formData, dosenPersona: p.id })}
                    className={`flex flex-col gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.dosenPersona === p.id ? 'border-[var(--color-brand-600)] bg-[var(--color-brand-50)] shadow-sm' : 'border-[var(--color-bg-muted)] bg-white hover:border-[var(--color-brand-300)]'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl leading-none bg-white/50 p-1.5 rounded-lg border border-[var(--color-bg-muted)]">{p.emoji}</span>
                      <span className={`text-sm font-bold ${formData.dosenPersona === p.id ? 'text-[var(--color-brand-600)]' : 'text-[var(--color-text-primary)]'}`}>{p.name}</span>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${formData.dosenPersona === p.id ? 'text-[var(--color-brand-600)]' : 'text-[var(--color-text-secondary)]'}`}>
                      {p.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={startSimulation}
              disabled={isLoading}
              className="w-full py-3.5 bg-[var(--color-brand-600)] text-white font-semibold rounded-xl hover:bg-[var(--color-brand-500)] transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? <><Loader2 className="animate-spin" size={18} /> Mempersiapkan Sidang...</> : <><GraduationCap size={18} /> Mulai Simulasi Sidang</>}
            </button>
          </div>
        </div>
      ) : null}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm">
          ⚠️ {error.message || "Terjadi kesalahan saat memuat respons AI. Silakan coba lagi."}
        </div>
      )}

      {hasStarted && (
        <div className={`bg-[#f8f9fa] border-2 ${theme.border} rounded-2xl shadow-sm animate-in zoom-in-95 duration-300 flex flex-col flex-1 relative overflow-hidden min-h-0`}>
          {/* Header Terpersonalisasi */}
          <div className={`p-4 flex items-center justify-between rounded-t-xl bg-gradient-to-r ${activePersona.colorClasses} text-white shadow-md z-10`}>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full text-2xl backdrop-blur-sm border border-white/30">
                {activePersona.emoji}
              </div>
              <div>
                <h3 className="font-bold text-base">
                  {activePersona.name}
                </h3>
                <p className="text-xs text-white/80 font-medium">Dosen Penguji • Ruang Sidang Virtual</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-black/10 hover:bg-black/20 flex items-center gap-1 transition-colors border border-white/20"
              >
                <XCircle size={14} /> Keluar
              </button>
            </div>
          </div>

          {/* Background pattern for realism */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto flex flex-col p-4 custom-scrollbar">
            {/* Spacer to push messages to the bottom when there are few */}
            <div className="flex-1 min-h-0" />
            <div className="flex flex-col gap-6 shrink-0 mt-4">
              {[...messages]
                .filter((m) => !m.content.startsWith("[SISTEM]"))
                .map((m) => {
                const isUser = m.role === "user";
                
                return (
                  <div key={m.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${isUser ? `${theme.lightBg} ${theme.text}` : 'bg-white border border-[var(--color-bg-muted)] shadow-sm text-xl'}`}>
                      {isUser ? <User size={16} /> : activePersona.emoji}
                    </div>

                    {/* Chat Bubble */}
                    <div className={`max-w-[80%] p-4 rounded-2xl ${isUser
                      ? `${theme.bg} text-white rounded-tr-sm`
                      : 'bg-white text-[var(--color-text-primary)] border border-[var(--color-bg-muted)] shadow-sm rounded-tl-sm'
                      }`}>
                      <div className="text-[10px] uppercase tracking-wider mb-1.5 font-bold text-current opacity-70">
                        {isUser ? 'Kamu' : activePersona.name}
                      </div>
                      <div className={`text-sm leading-relaxed ${isUser ? 'whitespace-pre-wrap' : 'prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-2 prose-pre:bg-transparent prose-pre:p-0 text-current'}`}>
                        {isUser ? m.content : (
                          !isUser && m.content === "" && isLoading ? (
                            <div className="flex gap-1.5 items-center h-6 px-1">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          ) : (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Anchor for auto-scroll */}
            <div ref={messagesEndRef} className="h-4 shrink-0" />
          </div>

          {/* Action buttons */}
          <div className="px-4 pb-2">
            <button
              onClick={handleEndSession}
              disabled={isLoading || messages.length < 3}
              className={`w-full py-2 text-xs font-semibold ${theme.text} ${theme.lightBg} ${theme.lightBgHover} rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              🏁 Akhiri Sidang & Minta Evaluasi
            </button>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[var(--color-bg-muted)] bg-[var(--color-bg-surface)] rounded-b-2xl">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik jawaban Kamu di sini..."
                className={`flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-bg-muted)] outline-none text-sm bg-white transition-all ${theme.ring}`}
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                className={`px-4 py-2.5 ${theme.bg} text-white rounded-xl ${theme.bgHover} disabled:opacity-50 transition-colors flex items-center justify-center`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
