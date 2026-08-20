'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, LayoutDashboard, BarChart2, Wrench, GraduationCap } from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string; // CSS selector (future use)
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Selamat Datang di BBR Platform! 🎉',
    description: 'Platform ini dirancang khusus untuk membantu kamu melewati proses pengerjaan skripsi, tesis, atau disertasi dari awal hingga sidang. Mari kami tunjukkan fitur-fitur utamanya!',
    icon: <LayoutDashboard size={32} className="text-[var(--color-brand-600)]" />,
  },
  {
    title: 'Dashboard & Progress Tracker',
    description: 'Pantau kemajuan penulisan setiap bab dari dashboard. Progress dihitung otomatis berdasarkan checklist yang kamu centang. Kamu juga bisa set target tanggal sidang di sini.',
    icon: <BarChart2 size={32} className="text-emerald-600" />,
  },
  {
    title: 'Workspace — Ruang Tulis Utama',
    description: 'Di menu Workspace, kamu bisa mengupload draf per bab, mengelola outline secara dinamis, menambahkan sitasi referensi, dan mendapat saran dari AI Assistant. Semua dalam satu layar!',
    icon: <Wrench size={32} className="text-blue-600" />,
  },
  {
    title: 'Katalog Tools AI',
    description: 'Akses berbagai tools AI gratis: Judul Finder, Parafrase, Bibliometrik, Terjemah Draf Akademis, Klinik TA, dan banyak lagi. Semua berbasis prompt teroptimasi untuk kebutuhan akademis.',
    icon: <Wrench size={32} className="text-purple-600" />,
  },
  {
    title: 'Sidang Simulator',
    description: 'Latih diri dengan simulasi sidang AI yang realistis. Pilih persona dosen (dari yang ramah hingga "killer"), aktifkan mode suara agar lebih seperti sidang sungguhan, dan minta evaluasi di akhir sesi.',
    icon: <GraduationCap size={32} className="text-orange-600" />,
  },
];

const TOUR_FLAG_KEY = 'bbr_tour_done';

export default function InteractiveGuide() {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const done = localStorage.getItem(TOUR_FLAG_KEY);
    if (!done) {
      // Small delay so the page renders first
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(TOUR_FLAG_KEY, '1');
    setIsVisible(false);
  };

  const next = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      dismiss();
    }
  };

  const prev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  if (!isVisible) return null;

  const currentStep = TOUR_STEPS[step];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9000] animate-in fade-in duration-300"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Tour Card */}
      <div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9001] w-[calc(100vw-2rem)] max-w-md animate-in slide-in-from-bottom-4 duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Panduan Pengguna BBR Platform"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-bg-muted)]">
          {/* Progress bar */}
          <div className="h-1.5 bg-[var(--color-bg-muted)]">
            <div
              className="h-full bg-[var(--color-brand-600)] transition-all duration-500"
              style={{ width: `${((step + 1) / TOUR_STEPS.length) * 100}%` }}
            />
          </div>

          <div className="p-6">
            {/* Icon + step count */}
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-[var(--color-brand-50)] rounded-xl">
                {currentStep.icon}
              </div>
              <button
                onClick={dismiss}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                aria-label="Tutup panduan"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <h2 className="font-display font-bold text-xl text-[var(--color-text-primary)] mb-2">
              {currentStep.title}
            </h2>
            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
              {currentStep.description}
            </p>

            {/* Step dots */}
            <div className="flex justify-center gap-2 mt-5 mb-1">
              {TOUR_STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === step
                      ? 'bg-[var(--color-brand-600)] w-6'
                      : 'bg-[var(--color-bg-muted)] hover:bg-[var(--color-brand-400)]'
                  }`}
                  aria-label={`Langkah ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex items-center justify-between">
            <button
              onClick={dismiss}
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-medium transition-colors"
            >
              Lewati Panduan
            </button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={prev}
                  className="p-2 rounded-lg border border-[var(--color-bg-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] transition-colors"
                  aria-label="Kembali"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              <button
                onClick={next}
                className="flex items-center gap-2 px-5 py-2 bg-[var(--color-brand-600)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--color-brand-500)] transition-colors shadow-sm"
              >
                {step < TOUR_STEPS.length - 1 ? (
                  <>Lanjut <ChevronRight size={16} /></>
                ) : (
                  <>Mulai! 🚀</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
