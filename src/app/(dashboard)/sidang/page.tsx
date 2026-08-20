"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { GraduationCap, Loader2, Send, Sword, ChevronRight, ArrowLeft, XCircle, User, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
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
  const [formData, setFormData] = useState({ abstrak: "", dosenPersona: 1 });
  const { messages, input, setInput, isLoading, error, sendMessage, startConversation, reset } = useAIChat({ api: "/api/ai/sidang" });
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice states - default to true as requested
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");
  const lastSpokenMsgIdRef = useRef<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Check browser support
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSttSupported("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
      
      // Preload voices for fallback
      if ("speechSynthesis" in window) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setPlayingMsgId(null);
  }, []);

  const playIndonesianVoice = useCallback((text: string, msgId?: string) => {
    if (typeof window === "undefined") return;

    // Stop any existing audio
    stopAudio();

    const cleanText = text
      .replace(/\[SISTEM\]/gi, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/#{1,6}\s/g, "")
      .replace(/`([^`]*)`/g, "$1")
      .replace(/<[^>]*>/g, "")
      .trim();

    if (!cleanText) return;

    if (msgId) setPlayingMsgId(msgId);

    // Primary: High-fidelity natural Indonesian audio via /api/ai/tts
    const audioUrl = `/api/ai/tts?text=${encodeURIComponent(cleanText)}`;
    const audio = new Audio(audioUrl);
    currentAudioRef.current = audio;

    audio.onended = () => {
      setPlayingMsgId(null);
      currentAudioRef.current = null;
    };

    audio.onerror = () => {
      console.warn("Server TTS playback error, attempting browser SpeechSynthesis fallback...");
      // Fallback to browser SpeechSynthesis with Indonesian voice
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = "id-ID";
        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find((v) => v.lang.toLowerCase().includes("id"));
        if (idVoice) utterance.voice = idVoice;
        utterance.onend = () => setPlayingMsgId(null);
        utterance.onerror = () => setPlayingMsgId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setPlayingMsgId(null);
      }
    };

    audio.play().catch((err) => {
      console.warn("Audio autoplay blocked or failed:", err);
      // Browser autoplay policy might require fallback
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = "id-ID";
        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find((v) => v.lang.toLowerCase().includes("id"));
        if (idVoice) utterance.voice = idVoice;
        utterance.onend = () => setPlayingMsgId(null);
        utterance.onerror = () => setPlayingMsgId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setPlayingMsgId(null);
      }
    });
  }, [stopAudio]);

  // Automatically speak when a new response finishes streaming if voiceEnabled is true
  useEffect(() => {
    if (!voiceEnabled || isLoading) return;
    const assistantMessages = messages.filter(
      (m) => m.role === "assistant" && m.content.trim().length > 0
    );
    if (assistantMessages.length === 0) return;
    const latest = assistantMessages[assistantMessages.length - 1];
    if (latest.id === lastSpokenMsgIdRef.current) return;
    lastSpokenMsgIdRef.current = latest.id;

    playIndonesianVoice(latest.content, latest.id);
  }, [messages, voiceEnabled, isLoading, playIndonesianVoice]);

  // Stop audio when voiceEnabled is toggled off
  useEffect(() => {
    if (!voiceEnabled) {
      stopAudio();
    }
  }, [voiceEnabled, stopAudio]);

  const startListening = useCallback(() => {
    if (!sttSupported || isListening) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    transcriptRef.current = "";

    recognition.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      if (currentTranscript.trim()) {
        transcriptRef.current = currentTranscript;
        setInput(currentTranscript);
      }
    };

    recognition.onerror = (e: any) => {
      console.warn("STT recognition error:", e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      const finalText = transcriptRef.current.trim();
      if (finalText) {
        // Automatically send the voice note message directly without extra clicks
        sendMessage(finalText);
        transcriptRef.current = "";
        setInput("");
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.warn("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  }, [sttSupported, isListening, setInput, sendMessage]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn("Error stopping recognition:", err);
      }
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSimulation = async () => {
    if (!judulTugasAkhir || !formData.abstrak) {
      alert("Mohon pastikan judul sudah tersimpan dan abstrak telah diisi.");
      return;
    }
    const selectedPersona = PERSONAS.find(p => p.id === formData.dosenPersona);
    const searchParams = new URLSearchParams(window.location.search);
    const practiceQ = searchParams.get("q");

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
    const initialPrompt = practiceQ
      ? `[SISTEM] Mahasiswa telah memasuki ruang sidang. Mereka ingin berlatih menjawab pertanyaan spesifik ini: "${practiceQ}". Silakan sapa singkat lalu jadikan pertanyaan tersebut sebagai pertanyaan pertama Anda secara natural.`
      : `[SISTEM] Mahasiswa telah memasuki ruang sidang. Silakan mulai sidang dengan menyapa singkat dan langsung ajukan SATU pertanyaan pertama Anda.`;

    await startConversation(systemInstruction, initialPrompt);
  };

  const handleEndSession = () => {
    sendMessage("SELESAI SIDANG. Tolong berikan feedback komprehensif: apa kelemahan argumen saya, apa yang sudah baik, dan apa yang harus saya siapkan sebelum sidang asli.");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleReset = () => {
    window.speechSynthesis?.cancel();
    recognitionRef.current?.stop();
    setIsListening(false);
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
        <Link href="/sidang/arena" className="block group">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 sm:justify-between hover:shadow-md hover:border-amber-400 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <Sword size={24} />
              </div>
              <div>
                <p className="text-sm text-amber-800 mt-0.5">Belum siap simulasi? Pelajari dulu bocoran 200+ pola pertanyaan jebakan dosen penguji.</p>
              </div>
            </div>
            <div className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 group-hover:bg-amber-500 transition-colors shadow-sm shrink-0">
              Lihat Database Pertanyaan <ChevronRight size={18} />
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

            {/* Voice option */}
            <div className="flex items-center gap-3 p-4 bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] rounded-xl">
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5">
                  <Volume2 size={16} className="text-[var(--color-brand-600)]" />
                  Mode Suara Dosen (Bahasa Indonesia Alami)
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  Dosen AI berbicara langsung dengan pengucapan Bahasa Indonesia yang jernih dan fasih.
                </p>
              </div>
              <button
                onClick={() => setVoiceEnabled(v => !v)}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative shrink-0 ${voiceEnabled ? 'bg-[var(--color-brand-600)]' : 'bg-zinc-300'}`}
                aria-label={voiceEnabled ? 'Matikan mode suara' : 'Aktifkan mode suara'}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${voiceEnabled ? 'translate-x-6' : ''}`} />
              </button>
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
                    <p className={`text-xs mt-1 leading-relaxed ${formData.dosenPersona === p.id ? 'text-[var(--color-brand-600)]' : 'text-[var(--color-text-secondary)]'}`}>{p.desc}</p>
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
          {/* Header */}
          <div className={`p-4 flex items-center justify-between rounded-t-xl bg-gradient-to-r ${activePersona.colorClasses} text-white shadow-md z-10`}>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full text-2xl backdrop-blur-sm border border-white/30">
                {activePersona.emoji}
              </div>
              <div>
                <h3 className="font-bold text-base">{activePersona.name}</h3>
                <p className="text-xs text-white/80 font-medium">Dosen Penguji • Ruang Sidang Virtual</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Voice toggle in chat mode */}
              <button
                onClick={() => setVoiceEnabled((v) => !v)}
                title={voiceEnabled ? "Matikan suara" : "Aktifkan suara dosen"}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors border border-white/20 ${
                  voiceEnabled ? "bg-white/20 hover:bg-white/30" : "bg-black/10 hover:bg-black/20"
                }`}
              >
                {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                <span className="hidden sm:inline">{voiceEnabled ? "Suara ON" : "Suara OFF"}</span>
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-black/10 hover:bg-black/20 flex items-center gap-1 transition-colors border border-white/20"
              >
                <XCircle size={14} /> Keluar
              </button>
            </div>
          </div>

          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          {/* Messages */}
          <div className="flex-1 overflow-y-auto flex flex-col p-4 custom-scrollbar">
            <div className="flex-1 min-h-0" />
            <div className="flex flex-col gap-6 shrink-0 mt-4">
              {[...messages]
                .filter((m) => !m.content.startsWith("[SISTEM]"))
                .map((m) => {
                  const isUser = m.role === "user";
                  return (
                    <div key={m.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${isUser ? `${theme.lightBg} ${theme.text}` : 'bg-white border border-[var(--color-bg-muted)] shadow-sm text-xl'}`}>
                        {isUser ? <User size={16} /> : activePersona.emoji}
                      </div>
                      <div className={`max-w-[80%] p-4 rounded-2xl ${isUser ? `${theme.bg} text-white rounded-tr-sm` : 'bg-white text-[var(--color-text-primary)] border border-[var(--color-bg-muted)] shadow-sm rounded-tl-sm'}`}>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-current opacity-70">
                            {isUser ? 'Kamu' : activePersona.name}
                          </span>
                          {!isUser && m.content && (
                            <button
                              type="button"
                              onClick={() => {
                                if (playingMsgId === m.id) {
                                  stopAudio();
                                } else {
                                  playIndonesianVoice(m.content, m.id);
                                }
                              }}
                              className={`text-[11px] flex items-center gap-1 transition-colors p-0.5 px-2 rounded-md font-semibold ${
                                playingMsgId === m.id
                                  ? "bg-[var(--color-brand-600)] text-white animate-pulse"
                                  : "text-zinc-500 hover:text-[var(--color-brand-600)] hover:bg-zinc-100"
                              }`}
                              title={playingMsgId === m.id ? "Hentikan suara" : "Dengarkan suara dosen fasih berbahasa Indonesia"}
                            >
                              {playingMsgId === m.id ? (
                                <>
                                  <VolumeX size={12} />
                                  <span className="text-[10px]">Hentikan</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 size={12} />
                                  <span className="text-[10px]">Putar Suara</span>
                                </>
                              )}
                            </button>
                          )}
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
            <div ref={messagesEndRef} className="h-4 shrink-0" />
          </div>

          {/* End session button */}
          <div className="px-4 pb-2">
            <button
              onClick={handleEndSession}
              disabled={isLoading || messages.length < 3}
              className={`w-full py-2 text-xs font-semibold ${theme.text} ${theme.lightBg} ${theme.lightBgHover} rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              🏁 Akhiri Sidang & Minta Evaluasi
            </button>
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-[var(--color-bg-muted)] bg-[var(--color-bg-surface)] rounded-b-2xl">
            <div className="flex gap-2">
              {/* STT mic button */}
              {sttSupported && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading}
                  title={isListening ? 'Hentikan rekaman' : 'Bicara sebagai jawaban'}
                  className={`px-3 py-2.5 rounded-xl border transition-colors flex items-center justify-center shrink-0 ${
                    isListening
                      ? 'bg-red-500 text-white border-red-500 animate-pulse'
                      : 'border-[var(--color-bg-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]'
                  }`}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              )}
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Sedang mendengarkan..." : "Ketik jawaban Kamu di sini..."}
                className={`flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-bg-muted)] outline-none text-sm bg-white transition-all ${theme.ring}`}
                disabled={isLoading || isListening}
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                className={`px-4 py-2.5 ${theme.bg} text-white rounded-xl ${theme.bgHover} disabled:opacity-50 transition-colors flex items-center justify-center`}
              >
                <Send size={18} />
              </button>
            </div>
            {isListening && (
              <p className="text-xs text-red-500 font-medium mt-2 text-center animate-pulse">
                🎤 Sedang merekam... Klik tombol mikrofon untuk berhenti
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
