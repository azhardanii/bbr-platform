'use client';

import { useState } from 'react';
import { HelpCircle, X, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    q: 'Bagaimana cara memulai menggunakan platform ini?',
    a: 'Setelah login dan mengisi onboarding, kamu akan diarahkan ke Dashboard. Dari sana, kamu bisa langsung akses Workspace untuk mulai mengupload draf bab, atau gunakan Tools AI untuk berbagai keperluan penulisan.',
  },
  {
    q: 'Apakah data saya tersimpan secara permanen?',
    a: 'Saat ini platform menggunakan penyimpanan lokal (browser). Untuk hasil terbaik, gunakan browser yang sama dan jangan hapus data browser. Fitur sinkronisasi cloud akan hadir segera.',
  },
  {
    q: 'Bagaimana cara menambah atau menghapus bab di Workspace?',
    a: 'Di panel kiri Workspace (Outline), klik tombol "+" untuk menambah bab baru. Hover pada bab untuk melihat tombol hapus. Double-click nama bab untuk mengubah judulnya.',
  },
  {
    q: 'Apakah AI Writing Assistant mendukung Bahasa Indonesia?',
    a: 'Ya! Semua fitur AI (parafrase, klinik TA, terjemah draf) dirancang untuk Bahasa Indonesia akademis. AI dikonfigurasi dengan instruksi khusus untuk mempertahankan gaya penulisan ilmiah formal.',
  },
  {
    q: 'Bagaimana cara menggunakan Sidang Simulator?',
    a: 'Pergi ke menu Sidang, isi judul penelitian dan abstrak singkat Bab 1-4, pilih persona dosen penguji, lalu klik "Mulai Simulasi". Kamu bisa aktifkan mode suara agar lebih realistis.',
  },
  {
    q: 'Apa itu Terjemah Draf Akademis?',
    a: 'Fitur di Tools → Terjemah Draf yang menerjemahkan draf naskah Bahasa Indonesia ke Bahasa Inggris akademis formal, atau sebaliknya. Berguna untuk mahasiswa S2/S3 yang perlu publikasi internasional.',
  },
  {
    q: 'Bagaimana cara melihat panduan interaktif lagi?',
    a: 'Hapus data "bbr_tour_done" dari localStorage browser (DevTools → Application → Local Storage), lalu refresh halaman. Panduan akan muncul kembali.',
  },
  {
    q: 'Apakah ada batasan penggunaan tools AI?',
    a: 'Penggunaan tools AI tergantung pada kuota API. Jika terjadi error, tunggu beberapa menit dan coba lagi. Platform akan otomatis beralih ke model cadangan jika model utama penuh.',
  },
];

export default function FloatingFAQ() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="fixed bottom-6 right-6 z-[8000] flex flex-col items-end gap-3">
      {/* FAQ Panel */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[var(--color-bg-muted)] animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-bg-muted)] bg-[var(--color-brand-50)]">
            <div>
              <h3 className="font-display font-bold text-[var(--color-brand-600)] text-base">Pusat Bantuan</h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Pertanyaan yang sering diajukan</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] rounded-lg transition-colors"
              aria-label="Tutup FAQ"
            >
              <X size={18} />
            </button>
          </div>

          {/* FAQ list */}
          <div className="overflow-y-auto max-h-[60vh] divide-y divide-[var(--color-bg-muted)]">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-start justify-between gap-3 hover:bg-[var(--color-bg-surface)] transition-colors"
                  aria-expanded={expandedIdx === i}
                >
                  <span className="text-sm font-semibold text-[var(--color-text-primary)] leading-snug">
                    {item.q}
                  </span>
                  <span className="shrink-0 mt-0.5 text-[var(--color-text-secondary)]">
                    {expandedIdx === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </button>
                {expandedIdx === i && (
                  <div className="px-5 pb-4 text-sm text-[var(--color-text-secondary)] leading-relaxed animate-in fade-in duration-200">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-[var(--color-bg-muted)] bg-[var(--color-bg-surface)]">
            <p className="text-xs text-[var(--color-text-secondary)] text-center">
              Butuh bantuan lebih? Hubungi tim support BBR.
            </p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        aria-label={isOpen ? 'Tutup FAQ' : 'Buka FAQ'}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 border-2 ${
          isOpen
            ? 'bg-[var(--color-brand-600)] text-white border-[var(--color-brand-500)] rotate-180 scale-95'
            : 'bg-white text-[var(--color-brand-600)] border-[var(--color-brand-100)] hover:scale-110 hover:shadow-xl hover:border-[var(--color-brand-400)]'
        }`}
      >
        {isOpen ? <X size={22} /> : <HelpCircle size={24} />}
      </button>
    </div>
  );
}
