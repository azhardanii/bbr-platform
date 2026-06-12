"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Loader2, Send, Sword, ChevronRight, ArrowLeft } from "lucide-react";
import { useChat } from "ai/react";
import { useJenjang } from "@/hooks/useJenjang";

const PERSONAS = [
  { id: 1, emoji: '😤', name: 'Si Paling Metodologi', desc: 'Sangat ketat menanyakan alasan pemilihan metode, sampel, dan validitas data.', prompt: 'Kamu adalah dosen penguji yang sangat ketat soal metodologi penelitian. Tanyakan mahasiswa tentang alasan pemilihan metode, validitas instrumen, dan teknik sampling mereka. Gunakan nada kritis tapi akademis. Mulai dengan: "Baik, coba jelaskan kenapa kamu memilih metode kuantitatif untuk penelitian ini?"' },
  { id: 2, emoji: '📚', name: 'Si Pengabdi Teori', desc: 'Fokus pada kutipan definisi ahli dan perbandingan grand theory.', prompt: 'Kamu adalah dosen penguji yang sangat fokus pada landasan teori. Tanyakan definisi variabel dari berbagai tokoh, minta mahasiswa membandingkan teori, dan tanyakan alasan memilih teori tertentu. Mulai dengan: "Dari mana kamu mengambil definisi variabel X ini? Ada tokoh lain yang mendefinisikan berbeda?"' },
  { id: 3, emoji: '🔍', name: 'Si Detektif', desc: 'Suka mempertanyakan kebaruan (novelty) dan urgensi topik penelitian.', prompt: 'Kamu adalah dosen penguji yang sangat peduli dengan relevansi dan urgensi penelitian. Tanyakan mengapa topik ini penting, apa yang belum dijawab oleh penelitian sebelumnya, dan apa kontribusi nyata penelitian ini. Mulai dengan: "Saya lihat sudah banyak penelitian serupa. Apa yang membedakan penelitianmu?"' },
  { id: 4, emoji: '🧮', name: 'Si Raja Statistik', desc: 'Selalu menagih interpretasi detail dari setiap angka statistik di Bab 4.', prompt: 'Kamu adalah dosen penguji yang sangat detail soal angka dan statistik. Tanyakan interpretasi spesifik dari tabel output, minta penjelasan uji asumsi, dan tanyakan arti setiap angka dalam konteks penelitian. Mulai dengan: "Coba jelaskan angka R-square 0.67 ini artinya apa dalam penelitianmu?"' },
  { id: 5, emoji: '🗣️', name: 'Si Pencari Celah', desc: 'Gemar mencari ketidakkonsistenan antara Bab 1 dan Bab 5.', prompt: 'Kamu adalah dosen penguji yang suka mencari inkonsistensi antar bab. Bandingkan pernyataan di bab 1 dengan bab 5, cari kontradiksi antara rumusan masalah dan kesimpulan. Mulai dengan: "Di Bab 1 kamu bilang X, tapi di Bab 5 kamu menyimpulkan Y. Bisa dijelaskan?"' },
  { id: 6, emoji: '🤔', name: 'Si Praktisi', desc: 'Menuntut kelanjutan praktis dan implikasi nyata dari hasil penelitian.', prompt: 'Kamu adalah dosen penguji yang sangat tertarik pada implikasi dan kebermanfaatan penelitian. Tanyakan bagaimana hasil penelitian bisa diimplementasikan, siapa yang bisa manfaatkan, dan apa penelitian lanjutan yang relevan. Mulai dengan: "Hasil penelitianmu menarik — siapa yang seharusnya paling peduli dengan temuan ini?"' },
  { id: 7, emoji: '😴', name: 'Si Silent Treatment', desc: 'Pendiam, memberi respon minim untuk menguji ketenangan mentalmu.', prompt: 'Kamu adalah dosen penguji yang pendiam dan tidak banyak bereaksi. Ajukan pertanyaan yang singkat namun dalam, dan tunggu jawaban mahasiswa dengan diam. Berikan respons minimal untuk menguji apakah mahasiswa bisa tetap tenang. Mulai dengan: "Jelaskan penelitianmu dalam satu kalimat."' },
  { id: 8, emoji: '🔥', name: "Si Dosen Killer", desc: 'Sengaja mematahkan argumenmu hanya untuk melihat daya tahanmu.', prompt: 'Kamu adalah dosen penguji yang sengaja bersikap skeptis dan kritis untuk menguji ketahanan argumen mahasiswa. Sanggah jawaban mereka, tantang asumsi dasar penelitian, dan terus push back meski sudah dijawab. Mulai dengan: "Jujur, saya belum yakin dengan penelitian ini. Variabel kamu terlalu sederhana untuk mewakili fenomena yang kompleks."' }
];

export default function SidangPage() {
  const { label, labelLower } = useJenjang();
  const [formData, setFormData] = useState({
    judul: "",
    abstrak: "",
    dosenPersona: 1,
  });

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading, error } = useChat({
    api: "/api/ai/sidang",
    body: { jenjang: labelLower }
  });

  const [hasStarted, setHasStarted] = useState(false);

  const startSimulation = () => {
    if (!formData.judul || !formData.abstrak) {
      alert("Mohon masukkan judul dan ringkasan penelitianmu.");
      return;
    }

    const selectedPersona = PERSONAS.find(p => p.id === formData.dosenPersona);
    const systemPrompt = `${selectedPersona?.prompt}


Mahasiswa di depanmu sedang mempresentasikan ${labelLower} dengan detail berikut:
Judul ${label}: ${formData.judul}
Ringkasan/Abstrak: 
"""
${formData.abstrak}
"""

Instruksi Simulasi Sidang:
1. Bertindaklah sepenuhnya sebagai dosen penguji sesuai persona tersebut. Jangan pernah keluar dari karakter.
2. Ajukan SATU PERTANYAAN saja pada satu waktu. Jangan memberikan daftar pertanyaan sekaligus.
3. Pertanyaan pertama biasanya dimulai dengan menguji urgensi penelitian atau alasan pemilihan judul/metode.
4. Tunggu saya (mahasiswa) menjawab. Setelah saya menjawab, berikan evaluasi singkat atas jawaban saya (apakah masuk akal atau kurang tepat), lalu beri serangan lanjutan atau pertanyaan baru.
5. Lakukan simulasi ini sampai saya mengetik "SELESAI SIDANG".
6. Setelah selesai, berikan feedback komprehensif apa kelemahan argumen saya dan apa yang harus saya siapkan sebelum sidang asli.`;

    setMessages([
      { role: "system", content: systemPrompt, id: "system-1" },
      { role: "user", content: `Halo Bapak/Ibu dosen penguji, saya siap memulai sidang ${labelLower} saya.`, id: "user-1" }
    ]);

    setHasStarted(true);

    // Auto-submit the initial prompt
    setTimeout(() => {
      document.getElementById('hidden-submit-btn')?.click();
    }, 100);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors mb-2">
        <ArrowLeft size={16} /> Kembali
      </Link>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)]">Sidang Simulator</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Latih mental dan argumenmu dengan simulasi sidang {labelLower} interaktif bersama AI Dosen Penguji.</p>
        </div>
      </div>

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

      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] p-6 rounded-2xl shadow-sm">
        <h2 className="font-semibold text-lg text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <GraduationCap size={20} className="text-[var(--color-brand-600)]" /> Konfigurasi Simulasi
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Judul Penelitian</label>
            <textarea
              value={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              placeholder="Masukkan judul akhir penelitianmu..."
              className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white resize-none h-20"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Ringkasan / Abstrak Bab 1-4</label>
            <textarea
              value={formData.abstrak}
              onChange={(e) => setFormData({ ...formData, abstrak: e.target.value })}
              placeholder="Jelaskan secara singkat latar belakang masalah, metode yang dipakai, dan hasil temuan utamanya..."
              className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white h-40 resize-y"
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
                    <span className={`text-sm font-bold ${formData.dosenPersona === p.id ? 'text-[var(--color-brand-700)]' : 'text-[var(--color-text-primary)]'}`}>{p.name}</span>
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
            disabled={hasStarted && isLoading}
            className="w-full py-3 bg-[var(--color-brand-600)] text-white font-semibold rounded-lg hover:bg-[var(--color-brand-500)] transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {hasStarted && isLoading ? <><Loader2 className="animate-spin" size={18} /> Mempersiapkan Sidang...</> : "Mulai Simulasi Sidang"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          Terjadi kesalahan saat memuat respons AI. Pastikan API Key sudah dikonfigurasi.
        </div>
      )}

      {hasStarted && (
        <div className="bg-white border-2 border-[var(--color-brand-100)] p-6 rounded-2xl shadow-sm animate-in zoom-in-95 duration-300 flex flex-col h-[500px]">
          <h3 className="font-bold text-[var(--color-brand-600)] mb-3 border-b border-[var(--color-bg-muted)] pb-2 flex items-center justify-between">
            <span>Ruang Sidang Virtual</span>
            {isLoading && <Loader2 className="animate-spin text-[var(--color-brand-400)]" size={16} />}
          </h3>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
            {messages.filter(m => m.role !== 'system' && m.id !== 'user-1').map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl ${m.role === 'user'
                  ? 'bg-[var(--color-brand-600)] text-white rounded-br-none'
                  : 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-[var(--color-bg-muted)] rounded-bl-none'
                  }`}>
                  <div className="text-xs opacity-70 mb-1 font-semibold">{m.role === 'user' ? 'Anda (Mahasiswa)' : 'Dosen Penguji'}</div>
                  <div className="whitespace-pre-wrap text-sm">{m.content}</div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ketik jawaban Anda di sini..."
              className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none text-sm bg-[var(--color-bg-base)]"
              disabled={isLoading}
            />
            <button type="submit" id="hidden-submit-btn" disabled={isLoading} className="px-4 py-2 bg-[var(--color-brand-600)] text-white rounded-lg hover:bg-[var(--color-brand-500)] disabled:opacity-50 transition-colors flex items-center justify-center">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
