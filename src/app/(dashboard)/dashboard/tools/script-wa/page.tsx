"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Copy, CheckCircle2, ArrowLeft } from "lucide-react";
import { useJenjang } from "@/hooks/useJenjang";

export default function ScriptWaPage() {
  const { label } = useJenjang();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const SCRIPTS = [
    {
      id: "bimbingan-awal",
      title: "Mengajukan Bimbingan Pertama",
      desc: "Digunakan saat pertama kali menghubungi dosen pembimbing setelah mendapatkan SK.",
      content: `Selamat pagi/siang/sore Bapak/Ibu [Nama Dosen].
Mohon maaf mengganggu waktunya. Saya [Nama Anda], mahasiswa bimbingan Bapak/Ibu dengan NIM [NIM].
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
Saya [Nama Anda], izin menanyakan terkait draf revisi Bab [X] yang saya kirimkan pada tanggal [Tanggal] lalu. 
Apakah kira-kira Bapak/Ibu sudah berkesempatan untuk memeriksanya?
Mohon arahannya Bapak/Ibu. Terima kasih banyak.`
    },
    {
      id: "izin-sakit",
      title: "Izin Tidak Hadir Bimbingan",
      desc: "Digunakan ketika ada halangan mendesak/sakit di hari jadwal bimbingan.",
      content: `Selamat pagi/siang/sore Bapak/Ibu [Nama Dosen].
Mohon maaf yang sebesar-besarnya. Saya [Nama Anda], yang memiliki jadwal bimbingan dengan Bapak/Ibu hari ini pukul [Jam].
Qadarullah, hari ini saya sedang kurang sehat/ada udzur mendesak sehingga tidak bisa hadir menemui Bapak/Ibu.
Jika diperkenankan, apakah saya bisa me-reschedule jadwal bimbingan kita di lain hari sesuai dengan keluangan waktu Bapak/Ibu?
Sekali lagi saya memohon maaf atas ketidaknyamanan ini. Terima kasih Bapak/Ibu.`
    },
    {
      id: "acc-sidang",
      title: "Meminta ACC Sidang",
      desc: "Digunakan setelah seluruh revisi dirasa sudah lengkap dan siap diujikan.",
      content: `Selamat pagi/siang/sore Bapak/Ibu [Nama Dosen].
Mohon maaf mengganggu waktunya. Saya [Nama Anda], izin melaporkan bahwa seluruh revisi yang Bapak/Ibu arahkan pada bimbingan terakhir sudah saya sesuaikan pada draf.
Draf terbaru telah saya kirimkan via [Email/WA].
Apabila Bapak/Ibu berkenan dan merasa draf ini sudah cukup memenuhi syarat, saya bermaksud untuk memohon persetujuan (ACC) agar bisa mendaftar sidang.
Mohon arahannya Bapak/Ibu. Terima kasih banyak.`
    },
    {
      id: "penguji",
      title: "Menghubungi Dosen Penguji",
      desc: "Digunakan untuk mengirim draf ke penguji menjelang hari H sidang.",
      content: `Selamat pagi/siang/sore Bapak/Ibu [Nama Dosen].
Mohon maaf mengganggu waktunya. Saya [Nama Anda] dengan NIM [NIM].
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-10">
      <Link href="/dashboard/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors mb-2">
        <ArrowLeft size={16} /> Kembali
      </Link>
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)]">Script WA Dosen</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">Pilih template pesan WhatsApp sesuai kebutuhanmu. Tinggal salin, sesuaikan bagian dalam kurung, dan kirim!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SCRIPTS.map((script) => (
          <div key={script.id} className="bg-white border-2 border-[var(--color-bg-muted)] rounded-2xl overflow-hidden shadow-sm hover:border-[var(--color-brand-200)] transition-colors flex flex-col">
            <div className="p-5 border-b border-[var(--color-bg-muted)] bg-[var(--color-bg-surface)]">
              <h3 className="font-bold text-lg text-[var(--color-text-primary)] flex items-center gap-2">
                <MessageSquare size={18} className="text-[var(--color-brand-600)]" /> {script.title}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">{script.desc}</p>
            </div>
            
            <div className="p-5 flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-green-50/30">
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
    </div>
  );
}
