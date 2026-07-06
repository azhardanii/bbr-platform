"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Copy, CheckCircle2, ArrowLeft, Sparkles, Loader2, RefreshCw, User, Users, Hash } from "lucide-react";
import { useJenjang } from "@/hooks/useJenjang";
import { useAIStream } from "@/hooks/useAIStream";

export default function ScriptWaPage() {
  const { label } = useJenjang();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"template" | "custom">("template");
  const [customSituasi, setCustomSituasi] = useState("");
  const [copiedResult, setCopiedResult] = useState<string | null>(null);
  
  // Real-time states
  const [dosenName, setDosenName] = useState("");
  const [userName, setUserName] = useState("");
  const [nim, setNim] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("bbr_onboarding");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.namaLengkap) setUserName(parsed.namaLengkap);
      } catch (e) {}
    }
  }, []);

  const { completion, complete, isLoading, error } = useAIStream({
    api: "/api/ai/script-wa",
  });

  const formatDosenName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return "Bapak/Ibu [Nama Dosen]";
    const lower = trimmed.toLowerCase();
    if (lower.startsWith("pak ") || lower.startsWith("bapak ") || lower.startsWith("ibu ") || lower.startsWith("bu ") || lower.startsWith("prof") || lower.startsWith("dr")) {
      return trimmed;
    }
    return `Bapak/Ibu ${trimmed}`;
  };

  const getDosen = () => formatDosenName(dosenName);
  const getPanggilan = () => {
    const lower = dosenName.trim().toLowerCase();
    if (lower.startsWith("ibu ") || lower.startsWith("bu ") || lower === "ibu" || lower === "bu" || lower.includes(" bu ") || lower.includes(" ibu ")) {
      return "Ibu";
    }
    if (lower.startsWith("bapak ") || lower.startsWith("pak ") || lower === "bapak" || lower === "pak" || lower.includes(" pak ") || lower.includes(" bapak ")) {
      return "Bapak";
    }
    return "Bapak/Ibu";
  };

  const getUser = () => userName.trim() || "[Nama Kamu]";
  const getNim = () => nim.trim() || "[NIM]";

  const SCRIPTS = [
    {
      id: "bimbingan-awal",
      title: "Mengajukan Bimbingan Pertama",
      desc: "Digunakan saat pertama kali menghubungi dosen pembimbing setelah mendapatkan SK.",
      content: `Selamat pagi/siang/sore ${getDosen()}.\nMohon maaf mengganggu waktunya. Saya ${getUser()}, mahasiswa bimbingan ${getPanggilan()} dengan NIM ${getNim()}.\nBerdasarkan SK pembimbingan yang baru keluar, saya diamanahkan untuk dibimbing oleh ${getPanggilan()}.\nApakah sekiranya ada waktu kosong minggu ini agar saya bisa menghadap dan mendiskusikan topik awal penelitian saya?\nTerima kasih banyak sebelumnya, ${getPanggilan()}.`
    },
    {
      id: "kirim-draf",
      title: "Mengirimkan Draf Bab 1-3",
      desc: "Digunakan saat mengirimkan draf bab untuk dikoreksi.",
      content: `Selamat pagi/siang/sore ${getDosen()}.\nMohon maaf mengganggu waktu ${getPanggilan()}.\nSaya ${getUser()} (NIM: ${getNim()}), izin melaporkan bahwa saya telah menyelesaikan draf Bab 1-3 penelitian saya.\nBersama pesan ini, saya lampirkan draf tersebut (dalam format PDF/Word) untuk ${getPanggilan()} periksa.\nSaya siap menerima arahan dan koreksi dari ${getPanggilan()}. Kapan kira-kira saya bisa menjadwalkan bimbingan selanjutnya untuk membahas draf ini?\nTerima kasih banyak ${getPanggilan()}.`
    },
    {
      id: "follow-up",
      title: "Menanyakan Hasil Revisi (Follow Up)",
      desc: "Digunakan jika sudah 1-2 minggu draf belum dibalas oleh dosen.",
      content: `Selamat pagi/siang/sore ${getDosen()}.\nMohon maaf mengganggu waktu ${getPanggilan()}.\nSaya ${getUser()} (${getNim()}), izin menanyakan terkait draf revisi Bab [X] yang saya kirimkan pada tanggal [Tanggal] lalu.\nApakah kira-kira ${getPanggilan()} sudah berkesempatan untuk memeriksanya?\nMohon arahannya ${getPanggilan()}. Terima kasih banyak.`
    },
    {
      id: "izin-sakit",
      title: "Izin Tidak Hadir Bimbingan",
      desc: "Digunakan ketika ada halangan mendesak/sakit di hari jadwal bimbingan.",
      content: `Selamat pagi/siang/sore ${getDosen()}.\nMohon maaf yang sebesar-besarnya. Saya ${getUser()} (${getNim()}), yang memiliki jadwal bimbingan dengan ${getPanggilan()} hari ini pukul [Jam].\nQadarullah, hari ini saya sedang kurang sehat/ada udzur mendesak sehingga tidak bisa hadir menemui ${getPanggilan()}.\nJika diperkenankan, apakah saya bisa me-reschedule jadwal bimbingan kita di lain hari sesuai dengan keluangan waktu ${getPanggilan()}?\nSekali lagi saya memohon maaf atas ketidaknyamanan ini. Terima kasih ${getPanggilan()}.`
    },
    {
      id: "ingatkan-bimbingan",
      title: "Mengingatkan Jadwal Bimbingan",
      desc: "Digunakan sehari sebelum jadwal bimbingan yang sudah disepakati.",
      content: `Selamat pagi/siang/sore ${getDosen()}.\nMohon maaf mengganggu waktu ${getPanggilan()}. Saya ${getUser()} (${getNim()}), izin mengingatkan dan memastikan kembali terkait jadwal bimbingan kita esok hari pada pukul [Jam] di [Tempat/Link Zoom].\nApakah sekiranya jadwal tersebut masih sesuai dengan keluangan waktu ${getPanggilan()}?\nTerima kasih banyak atas waktunya.`
    },
    {
      id: "tanya-sempro",
      title: "Menanyakan Kesiapan Sempro",
      desc: "Digunakan ketika sudah bimbingan berkali-kali dan ingin minta izin maju seminar.",
      content: `Selamat pagi/siang/sore ${getDosen()}.\nMohon maaf mengganggu waktunya. Saya ${getUser()} (${getNim()}).\nSesuai arahan ${getPanggilan()} pada bimbingan terakhir, seluruh catatan revisi proposal telah saya perbaiki dan sesuaikan pada draf terlampir.\nApabila ${getPanggilan()} berkenan dan merasa proposal ini sudah cukup layak, saya bermaksud memohon izin untuk mendaftar Seminar Proposal bulan ini.\nMohon arahannya ${getPanggilan()}. Terima kasih banyak.`
    },
    {
      id: "minta-ttd",
      title: "Meminta Tanda Tangan Berkas",
      desc: "Digunakan saat butuh tanda tangan untuk lembar pengesahan atau dokumen lainnya.",
      content: `Selamat pagi/siang/sore ${getDosen()}.\nSemoga ${getPanggilan()} dalam keadaan sehat. Saya ${getUser()} (${getNim()}).\nMohon maaf mengganggu waktunya. Saya bermaksud untuk memohon kesediaan ${getPanggilan()} memberikan tanda tangan pada dokumen [Sebutkan Dokumen, cth: Lembar Pengesahan ${label}].\nKira-kira kapan dan di mana saya bisa menemui ${getPanggilan()} untuk keperluan tersebut?\nAtau apakah ${getPanggilan()} berkenan jika dokumen tersebut saya titipkan di meja ${getPanggilan()} / saya kirimkan via PDF?\nTerima kasih banyak atas arahan dan waktunya.`
    },
    {
      id: "ubah-judul",
      title: "Mengajukan Perubahan Judul",
      desc: "Digunakan untuk konsultasi karena stuck atau ada saran mengubah judul/topik.",
      content: `Selamat pagi/siang/sore ${getDosen()}.\nMohon maaf mengganggu waktu ${getPanggilan()}.\nSaya ${getUser()} (${getNim()}), mahasiswa bimbingan ${getPanggilan()}.\nBerdasarkan progres dan temuan saya sejauh ini, ada beberapa kendala terkait data pada topik awal penelitian saya. Saya berencana untuk mendiskusikan kemungkinan penyesuaian judul penelitian.\nApakah sekiranya saya bisa menjadwalkan bimbingan dalam minggu ini untuk membahas hal tersebut?\nTerima kasih banyak atas bimbingannya ${getPanggilan()}.`
    },
    {
      id: "kirim-revisi-pasca",
      title: "Kirim Revisi Pasca Sidang/Sempro",
      desc: "Mengirimkan hasil revisian setelah ujian kepada dosen penguji/pembimbing.",
      content: `Selamat pagi/siang/sore ${getDosen()}.\nSemoga ${getPanggilan()} dalam keadaan sehat. Saya ${getUser()} (${getNim()}).\nIzin melaporkan bahwa saya telah merampungkan revisi [Proposal/${label}] berdasarkan masukan dan catatan ${getPanggilan()} pada ujian tanggal [Tanggal] lalu.\nBerikut saya lampirkan draf perbaikan beserta Lembar Matriks Revisi sebagai bukti perbaikan.\nMohon kesediaan ${getPanggilan()} untuk memeriksa kembali. Terima kasih banyak.`
    },
    {
      id: "acc-sidang",
      title: "Meminta ACC Sidang Akhir",
      desc: "Digunakan setelah seluruh naskah lengkap dan siap diujikan secara final.",
      content: `Selamat pagi/siang/sore ${getDosen()}.\nMohon maaf mengganggu waktunya. Saya ${getUser()} (${getNim()}), izin menyampaikan bahwa seluruh revisi naskah ${label} yang ${getPanggilan()} arahkan pada bimbingan terakhir sudah saya perbaiki.\nDraf terbaru telah saya kirimkan via [Email/WA].\nApabila ${getPanggilan()} berkenan dan merasa naskah ini sudah cukup memenuhi syarat kelulusan, saya bermaksud untuk memohon persetujuan (ACC) agar saya bisa mendaftar Sidang Akhir.\nMohon arahannya ${getPanggilan()}. Terima kasih banyak.`
    },
    {
      id: "penguji",
      title: "Menghubungi Dosen Penguji",
      desc: "Digunakan untuk mengirim draf ke penguji menjelang hari H sidang.",
      content: `Selamat pagi/siang/sore ${getDosen()}.\nMohon maaf mengganggu waktunya. Saya ${getUser()} dengan NIM ${getNim()}.\nIzin menyampaikan bahwa ${getPanggilan()} telah ditetapkan sebagai dosen penguji pada sidang [Proposal/${label}] saya yang akan dilaksanakan pada:\nHari/Tanggal: [Tanggal]\nPukul: [Jam]\nTempat: [Ruang/Link Zoom]\n\nBersama pesan ini, saya lampirkan draf [Proposal/${label}] saya untuk dibaca.\nTerima kasih banyak atas ketersediaan waktu ${getPanggilan()}. Sampai jumpa di ruang sidang.`
    },
    {
      id: "terima-kasih",
      title: "Ucapan Terima Kasih (Lulus)",
      desc: "Dikirimkan setelah dinyatakan lulus atau urusan yudisium selesai.",
      content: `Selamat pagi/siang/sore ${getDosen()}.\nSaya ${getUser()} (${getNim()}), ingin mengucapkan terima kasih yang sebesar-besarnya atas segala waktu, tenaga, kesabaran, serta bimbingan yang telah ${getPanggilan()} berikan selama proses penyusunan ${label} saya.\nBerkat arahan dan kebaikan ${getPanggilan()}, saya bisa menyelesaikan studi ini dengan baik.\nSemoga ${getPanggilan()} senantiasa diberikan kesehatan, kelancaran rezeki, dan perlindungan dari Tuhan YME.\nSekali lagi, terima kasih banyak ${getPanggilan()}.`
    }
  ];

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyResult = async (id: string, content: string) => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopiedResult(id);
    setTimeout(() => setCopiedResult(null), 2000);
  };

  const extractSection = (text: string, start: string, end: string) => {
    const startIndex = text.indexOf(start);
    if (startIndex === -1) return "";
    const endIndex = text.indexOf(end);
    if (endIndex === -1) {
      return text.substring(startIndex + start.length).trim();
    }
    return text.substring(startIndex + start.length, endIndex).trim();
  };

  const handleGenerateCustom = async () => {
    if (!customSituasi.trim()) {
      alert("Mohon jelaskan situasimu terlebih dahulu.");
      return;
    }

    let prompt = `Buatkan pesan WhatsApp yang sopan dan profesional untuk dosen berdasarkan situasi berikut:\n\n**Situasi:** ${customSituasi}\n\nBuatkan pesan yang:\n1. Sopan dan formal tapi tidak kaku\n2. Langsung ke intinya (tidak bertele-tele)\n3. Siap di-copy paste langsung\n4. Sertakan salam pembuka dan penutup yang sopan\n\nBerikan 2 alternatif pesan dengan gaya berbeda (formal dan semi-formal).`;
    
    // Inject names if available
    if (dosenName) prompt += `\nNama Dosen: ${dosenName}`;
    if (userName) prompt += `\nNama Saya (Mahasiswa): ${userName}`;
    if (nim) prompt += `\nNIM Saya: ${nim}`;

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

      {/* Global Identitas Input */}
      <div className="bg-white border-2 border-[var(--color-bg-muted)] p-5 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Users size={14} /> Nama Dosen</label>
          <input 
            type="text" 
            placeholder="Cth: Bapak Budi / Prof. Yanto" 
            value={dosenName}
            onChange={(e) => setDosenName(e.target.value)}
            className="w-full px-4 py-2.5 bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] rounded-xl focus:outline-none focus:border-[var(--color-brand-500)] transition-colors text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><User size={14} /> Nama Kamu</label>
          <input 
            type="text" 
            placeholder="Cth: Ahmad / Dina" 
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-2.5 bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] rounded-xl focus:outline-none focus:border-[var(--color-brand-500)] transition-colors text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Hash size={14} /> NIM / NPM</label>
          <input 
            type="text" 
            placeholder="Cth: 19082348" 
            value={nim}
            onChange={(e) => setNim(e.target.value)}
            className="w-full px-4 py-2.5 bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] rounded-xl focus:outline-none focus:border-[var(--color-brand-500)] transition-colors text-sm"
          />
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-[var(--color-bg-surface)] rounded-xl p-1 border border-[var(--color-bg-muted)] sticky top-4 z-10">
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

          {(completion || isLoading) && (() => {
            const opsi1 = extractSection(completion, "OPSI_1_START", "OPSI_1_END");
            const opsi2 = extractSection(completion, "OPSI_2_START", "OPSI_2_END");
            const catatan = extractSection(completion, "CATATAN_START", "CATATAN_END");
            const hasTags = completion.includes("OPSI_1_START") || completion.includes("OPSI_2_START") || completion.includes("CATATAN_START");

            return (
              <div className="bg-white border-2 border-[var(--color-brand-100)] p-6 rounded-2xl shadow-sm animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl text-[var(--color-brand-600)]">Hasil Script Custom</h3>
                  {completion && !isLoading && (
                    <button
                      onClick={handleGenerateCustom}
                      className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--color-bg-surface)] text-[var(--color-text-body)] hover:bg-[var(--color-bg-muted)] flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw size={16} /> Ulang
                    </button>
                  )}
                </div>
                
                {!hasTags && isLoading ? (
                  <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">AI sedang menyusun pesan...</span>
                  </div>
                ) : !hasTags && !isLoading ? (
                  <div className="prose prose-sm md:prose-base max-w-none text-[var(--color-text-body)] whitespace-pre-wrap leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{completion}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {opsi1 && (
                      <div className="border border-[var(--color-bg-muted)] rounded-xl overflow-hidden">
                        <div className="bg-[var(--color-bg-surface)] px-4 py-3 border-b border-[var(--color-bg-muted)] flex justify-between items-center">
                          <span className="font-semibold text-[var(--color-text-primary)]">Opsi 1 (Formal)</span>
                          <button
                            onClick={() => handleCopyResult('opsi1', opsi1)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                              copiedResult === 'opsi1' ? "bg-green-100 text-green-700" : "bg-[var(--color-brand-50)] text-[var(--color-brand-600)] hover:bg-[var(--color-brand-100)]"
                            }`}
                          >
                            {copiedResult === 'opsi1' ? <><CheckCircle2 size={14} /> Tersalin</> : <><Copy size={14} /> Salin</>}
                          </button>
                        </div>
                        <div className="p-4 bg-green-50/30 text-sm whitespace-pre-wrap leading-relaxed font-medium text-gray-800">
                          {opsi1}
                        </div>
                      </div>
                    )}

                    {opsi2 && (
                      <div className="border border-[var(--color-bg-muted)] rounded-xl overflow-hidden">
                        <div className="bg-[var(--color-bg-surface)] px-4 py-3 border-b border-[var(--color-bg-muted)] flex justify-between items-center">
                          <span className="font-semibold text-[var(--color-text-primary)]">Opsi 2 (Semi-Formal)</span>
                          <button
                            onClick={() => handleCopyResult('opsi2', opsi2)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                              copiedResult === 'opsi2' ? "bg-green-100 text-green-700" : "bg-[var(--color-brand-50)] text-[var(--color-brand-600)] hover:bg-[var(--color-brand-100)]"
                            }`}
                          >
                            {copiedResult === 'opsi2' ? <><CheckCircle2 size={14} /> Tersalin</> : <><Copy size={14} /> Salin</>}
                          </button>
                        </div>
                        <div className="p-4 bg-green-50/30 text-sm whitespace-pre-wrap leading-relaxed font-medium text-gray-800">
                          {opsi2}
                        </div>
                      </div>
                    )}

                    {catatan && (
                      <div className="border border-amber-200 rounded-xl overflow-hidden">
                        <div className="bg-amber-50 px-4 py-3 border-b border-amber-200 flex justify-between items-center">
                          <span className="font-semibold text-amber-900">Catatan & Tips</span>
                          <button
                            onClick={() => handleCopyResult('catatan', catatan)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                              copiedResult === 'catatan' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                            }`}
                          >
                            {copiedResult === 'catatan' ? <><CheckCircle2 size={14} /> Tersalin</> : <><Copy size={14} /> Salin</>}
                          </button>
                        </div>
                        <div className="p-4 bg-amber-50/50 text-sm whitespace-pre-wrap leading-relaxed font-medium text-amber-900">
                          {catatan}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {isLoading && completion && (
                  <div className="mt-4 flex items-center gap-2 text-[var(--color-brand-400)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-400)] animate-pulse" />
                    <span className="text-xs">Sedang menghasilkan...</span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
