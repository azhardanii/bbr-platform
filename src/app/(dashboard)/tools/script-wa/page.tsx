"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Copy, CheckCircle2, ArrowLeft, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { useJenjang } from "@/hooks/useJenjang";
import { useAIStream } from "@/hooks/useAIStream";

export default function ScriptWaPage() {
  const { label } = useJenjang();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"template" | "custom">("template");
  const [customSituasi, setCustomSituasi] = useState("");
  const [copiedResult, setCopiedResult] = useState(false);

  const { completion, complete, isLoading, error, reset } = useAIStream({
    api: "/api/ai/script-wa",
  });

  const SCRIPTS = [
    {
      id: "bimbingan-awal",
      title: "Mengajukan Bimbingan Pertama",
      desc: "Digunakan saat pertama kali menghubungi dosen pembimbing setelah mendapatkan SK.",
      content: `Selamat pagi/siang/sore Bapak/Ibu [Nama Dosen].
Mohon maaf mengganggu waktunya. Saya [Nama Kamu], mahasiswa bimbingan Bapak/Ibu dengan NIM [NIM].
Berdasarkan SK pembimbingan yang baru keluar, saya diamanahkan untuk dibimbing oleh Bapak/Ibu.
Apakah sekiranya ada waktu kosong minggu ini agar saya bisa menghadap dan mendiskusikan topik awal penelitian saya?
Terima kasih banyak sebelumnya, Bapak/Ibu.`
    },
    {
      id: "follow-up",
      title: "Menanyakan Hasil Revisi (Follow Up)",
      desc: "Digunakan jika sudah 1-2 minggu draf belum dibalas oleh dosen.",
      content: `Selamat pagi/siang/sore Bapak/Ibu [Nama Dosen].
Mohon maaf mengganggu waktu Bapak/Ibu.
Saya [Nama Kamu], izin menanyakan terkait draf revisi Bab [X] yang saya kirimkan pada tanggal [Tanggal] lalu. 
Apakah kira-kira Bapak/Ibu sudah berkesempatan untuk memeriksanya?
Mohon arahannya Bapak/Ibu. Terima kasih banyak.`
    },
    {
      id: "izin-sakit",
      title: "Izin Tidak Hadir Bimbingan",
      desc: "Digunakan ketika ada halangan mendesak/sakit di hari jadwal bimbingan.",
      content: `Selamat pagi/siang/sore Bapak/Ibu [Nama Dosen].
Mohon maaf yang sebesar-besarnya. Saya [Nama Kamu], yang memiliki jadwal bimbingan dengan Bapak/Ibu hari ini pukul [Jam].
Qadarullah, hari ini saya sedang kurang sehat/ada udzur mendesak sehingga tidak bisa hadir menemui Bapak/Ibu.
Jika diperkenankan, apakah saya bisa me-reschedule jadwal bimbingan kita di lain hari sesuai dengan keluangan waktu Bapak/Ibu?
Sekali lagi saya memohon maaf atas ketidaknyamanan ini. Terima kasih Bapak/Ibu.`
    },
    {
      id: "acc-sidang",
      title: "Meminta ACC Sidang",
      desc: "Digunakan setelah seluruh revisi dirasa sudah lengkap dan siap diujikan.",
      content: `Selamat pagi/siang/sore Bapak/Ibu [Nama Dosen].
Mohon maaf mengganggu waktunya. Saya [Nama Kamu], izin melaporkan bahwa seluruh revisi yang Bapak/Ibu arahkan pada bimbingan terakhir sudah saya sesuaikan pada draf.
Draf terbaru telah saya kirimkan via [Email/WA].
Apabila Bapak/Ibu berkenan dan merasa draf ini sudah cukup memenuhi syarat, saya bermaksud untuk memohon persetujuan (ACC) agar bisa mendaftar sidang.
Mohon arahannya Bapak/Ibu. Terima kasih banyak.`
    },
    {
      id: "penguji",
      title: "Menghubungi Dosen Penguji",
      desc: "Digunakan untuk mengirim draf ke penguji menjelang hari H sidang.",
      content: `Selamat pagi/siang/sore Bapak/Ibu [Nama Dosen].
Mohon maaf mengganggu waktunya. Saya [Nama Kamu] dengan NIM [NIM].
Izin menyampaikan bahwa Bapak/Ibu telah ditetapkan sebagai dosen penguji pada sidang [Proposal/${label}] saya yang akan dilaksanakan pada:
Hari/Tanggal: [Tanggal]
Pukul: [Jam]
Tempat: [Ruang/Link Zoom]

Bersama pesan ini, saya lampirkan draf [Proposal/${label}] saya untuk dibaca.
Terima kasih banyak atas ketersediaan waktu Bapak/Ibu. Sampai jumpa di ruang sidang.`
    }
  ];

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyResult = async () => {
    if (!completion) return;
    await navigator.clipboard.writeText(completion);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
  };

  const handleGenerateCustom = async () => {
    if (!customSituasi.trim()) {
      alert("Mohon jelaskan situasimu terlebih dahulu.");
      return;
    }

    const prompt = `Buatkan pesan WhatsApp yang sopan dan profesional untuk dosen berdasarkan situasi berikut:

**Situasi:** ${customSituasi}

Buatkan pesan yang:
1. Sopan dan formal tapi tidak kaku
2. Langsung ke intinya (tidak bertele-tele)
3. Siap di-copy paste langsung
4. Sertakan salam pembuka dan penutup yang sopan

Berikan 2 alternatif pesan dengan gaya berbeda (formal dan semi-formal).`;

    await complete(prompt);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-10">
      <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors mb-2">
        <ArrowLeft size={16} /> Kembali
      </Link>
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)]">Script WA Dosen</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">Pilih template pesan WhatsApp atau buat custom - semua sopan dan anti-drama.</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-[var(--color-bg-surface)] rounded-xl p-1 border border-[var(--color-bg-muted)]">
        <button
          onClick={() => setActiveTab("template")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            activeTab === "template"
              ? "bg-white text-[var(--color-brand-600)] shadow-sm"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-body)]"
          }`}
        >
          📋 Template Siap Pakai
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "custom"
              ? "bg-white text-[var(--color-brand-600)] shadow-sm"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-body)]"
          }`}
        >
          <Sparkles size={14} /> Custom dengan AI
        </button>
      </div>

      {activeTab === "template" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SCRIPTS.map((script) => (
            <div key={script.id} className="bg-white border-2 border-[var(--color-bg-muted)] rounded-2xl overflow-hidden shadow-sm hover:border-[var(--color-brand-200)] transition-colors flex flex-col">
              <div className="p-5 border-b border-[var(--color-bg-muted)] bg-[var(--color-bg-surface)]">
                <h3 className="font-bold text-lg text-[var(--color-text-primary)] flex items-center gap-2">
                  <MessageSquare size={18} className="text-[var(--color-brand-600)]" /> {script.title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">{script.desc}</p>
              </div>
              
              <div className="p-5 flex-1 relative bg-green-50/30">
                <div className="bg-green-100/80 p-4 rounded-xl rounded-tl-none max-w-[90%] shadow-sm whitespace-pre-wrap text-sm text-gray-800 border border-green-200 leading-relaxed font-medium">
                  {script.content}
                </div>
              </div>

              <div className="p-4 bg-white border-t border-[var(--color-bg-muted)] flex justify-end">
                <button 
                  onClick={() => handleCopy(script.id, script.content)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${copiedId === script.id ? 'bg-[var(--color-success)] text-white' : 'bg-[var(--color-brand-50)] text-[var(--color-brand-600)] hover:bg-[var(--color-brand-100)]'}`}
                >
                  {copiedId === script.id ? <><CheckCircle2 size={16} /> Tersalin!</> : <><Copy size={16} /> Salin Pesan</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] p-6 rounded-2xl shadow-sm">
            <h2 className="font-semibold text-lg text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-[var(--color-brand-600)]" /> Ceritakan Situasimu
            </h2>
            <div className="space-y-4">
              <div>
                <textarea
                  value={customSituasi}
                  onChange={(e) => setCustomSituasi(e.target.value)}
                  placeholder="Contoh: Saya ingin meminta dosen pembimbing mengganti jadwal bimbingan karena bentrok dengan ujian mata kuliah lain. Dosen saya cukup galak dan tidak suka di-reschedule..."
                  className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white h-32 resize-y transition-colors"
                />
                <p className="text-xs text-[var(--color-text-disabled)] mt-1">
                  Semakin detail situasimu, semakin personal pesan yang dihasilkan AI.
                </p>
              </div>

              <button
                onClick={handleGenerateCustom}
                disabled={isLoading}
                className="w-full py-3.5 bg-[var(--color-brand-600)] text-white font-semibold rounded-xl hover:bg-[var(--color-brand-500)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {isLoading ? (
                  <><Loader2 className="animate-spin" size={18} /> Menyusun Pesan...</>
                ) : (
                  <><Sparkles size={18} /> Generate Script Custom</>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm">
              ⚠️ {error.message || "Terjadi kesalahan. Silakan coba lagi."}
            </div>
          )}

          {(completion || isLoading) && (
            <div className="bg-white border-2 border-[var(--color-brand-100)] p-6 rounded-2xl shadow-sm animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[var(--color-brand-600)]">Hasil Script Custom</h3>
                {completion && !isLoading && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyResult}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                        copiedResult ? "bg-green-100 text-green-700" : "bg-[var(--color-brand-50)] text-[var(--color-brand-600)] hover:bg-[var(--color-brand-100)]"
                      }`}
                    >
                      {copiedResult ? <><CheckCircle2 size={14} /> Tersalin</> : <><Copy size={14} /> Salin</>}
                    </button>
                    <button
                      onClick={handleGenerateCustom}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-body)] hover:bg-[var(--color-bg-muted)] flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw size={14} /> Ulang
                    </button>
                  </div>
                )}
              </div>
              <div className="prose prose-sm md:prose-base max-w-none text-[var(--color-text-body)] whitespace-pre-wrap leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{completion}</ReactMarkdown>
                {isLoading && !completion && (
                  <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">AI sedang menyusun pesan...</span>
                  </div>
                )}
              </div>
              {isLoading && completion && (
                <div className="mt-3 flex items-center gap-2 text-[var(--color-brand-400)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-400)] animate-pulse" />
                  <span className="text-xs">Sedang menghasilkan...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

