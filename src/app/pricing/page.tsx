'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  CheckCircle2, Sparkles, ArrowRight, ShieldCheck, 
  Zap, Lock, HelpCircle, ArrowLeft, Star, ShoppingCart, Award
} from 'lucide-react';
import { FeatureKey, FEATURES_CONFIG } from '@/lib/quota';
import { MEMBERSHIP_PACKAGES } from '@/lib/paymentConfig';
import PaymentCheckoutModal, { CheckoutTarget } from '@/components/payment/PaymentCheckoutModal';

export default function PricingPage() {
  const { data: session } = useSession();
  const [checkoutTarget, setCheckoutTarget] = useState<CheckoutTarget | null>(null);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-zinc-900 font-sans selection:bg-[var(--color-brand-100)] selection:text-[var(--color-brand-900)]">
      {/* Top Navbar */}
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 px-2 rounded-xl bg-gradient-to-tr from-[var(--color-brand-600)] to-amber-500 flex items-center justify-center text-white font-black text-xs tracking-wider shadow-sm group-hover:scale-105 transition-transform select-none">
              BBR
            </div>
            <span className="font-display font-black text-lg tracking-tight text-zinc-900">
              Belajar Bareng <span className="text-[var(--color-brand-600)]">Roselini</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>Masuk ke Dashboard</span>
                <ArrowRight size={13} />
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] text-white text-xs font-bold transition-all shadow-sm"
              >
                Masuk / Daftar Akun
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-14 pb-10 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-200 text-amber-800 text-xs font-bold mb-4">
          <Sparkles size={14} className="text-amber-600" />
          <span>Aktivasi Instan & Otomatis via Lynk.id</span>
        </div>

        <h1 className="font-display font-black text-3xl sm:text-5xl text-zinc-900 tracking-tight leading-tight">
          Investasi Sekali, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-600)] to-amber-600">Lulus Skripsi</span> Lebih Tenang
        </h1>
        <p className="mt-4 text-zinc-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Pilih paket akses penuh selamanya atau beli kuota mikro satuan untuk fitur yang kamu butuhkan. Tanpa biaya langganan bulanan tersembunyi.
        </p>
      </section>

      {/* Main Packages Pricing Cards */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Card 1: Free Starter */}
          <div className="bg-white rounded-3xl p-7 border border-zinc-200/90 shadow-sm flex flex-col justify-between hover:border-zinc-300 transition-all">
            <div>
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Paket Coba Gratis
              </div>
              <h3 className="font-display font-black text-2xl text-zinc-900">Starter</h3>
              <p className="text-xs text-zinc-600 mt-1">
                Cocok untuk mahasiswa yang ingin mencoba kapabilitas AI BBR terlebih dahulu.
              </p>

              <div className="mt-5 pb-5 border-b border-zinc-100">
                <div className="flex items-baseline gap-1">
                  <span className="font-black text-3xl text-zinc-900">Rp 0</span>
                  <span className="text-xs text-zinc-500">/ selamanya</span>
                </div>
                <span className="text-[11px] text-zinc-400 block mt-0.5">Free Trial tanpa kartu kredit</span>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-zinc-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                  <span>3x Parafrase AI Akademik</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                  <span>3x Bedah Draf & Asisten Penulisan</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                  <span>3x Ide Judul & ACC Checker</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                  <span>2x SPSS Interpreter Bab 4</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                  <span>1 Sesi Simulator Sidang AI</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href="/login"
                className="w-full py-3 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Mulai Coba Gratis</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Card 2: Lifetime Mahasiswa (Featured) */}
          <div className="bg-gradient-to-b from-white to-amber-50/30 rounded-3xl p-7 border-2 border-[var(--color-brand-500)] shadow-xl relative flex flex-col justify-between ring-4 ring-[var(--color-brand-100)]/60">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-brand-600)] text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Star size={12} className="fill-white" />
              <span>Paling Populer & Hemat</span>
            </span>

            <div>
              <div className="text-xs font-bold text-[var(--color-brand-700)] uppercase tracking-wider mb-1">
                Sekali Bayar Aktif Selamanya
              </div>
              <h3 className="font-display font-black text-2xl text-zinc-900">Lifetime Mahasiswa</h3>
              <p className="text-xs text-zinc-600 mt-1">
                Akses penuh seluruh 8 tools AI BBR sampai wisuda tanpa beban langganan bulanan.
              </p>

              <div className="mt-5 pb-5 border-b border-zinc-200/80">
                <div className="flex items-baseline gap-2">
                  <span className="font-black text-4xl text-zinc-900">Rp 199.000</span>
                  <span className="text-xs line-through text-zinc-400 font-bold">Rp 499.000</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 block mt-0.5">
                  Hemat 60% • Garansi Sekali Bayar
                </span>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-zinc-800">
                {MEMBERSHIP_PACKAGES.lifetime.highlights.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={() => setCheckoutTarget({ type: 'membership', packageId: 'lifetime' })}
                className="w-full py-3.5 px-4 rounded-xl bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:shadow-lg"
              >
                <Sparkles size={15} />
                <span>Pilih Paket Lifetime (Rp 199.000)</span>
              </button>
              <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 mt-2.5">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span>Pembayaran Resmi Lynk.id • QRIS / VA / E-Wallet</span>
              </div>
            </div>
          </div>

          {/* Card 3: Summit Mentoring */}
          <div className="bg-white rounded-3xl p-7 border border-violet-200 shadow-sm flex flex-col justify-between hover:border-violet-300 transition-all relative">
            <span className="absolute -top-3 right-6 bg-violet-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
              VIP Mentoring
            </span>

            <div>
              <div className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-1">
                Paket Eksklusif
              </div>
              <h3 className="font-display font-black text-2xl text-zinc-900">Summit Mentoring</h3>
              <p className="text-xs text-zinc-600 mt-1">
                Akses Lifetime Mahasiswa lengkap ditambah 2x sesi konsultasi bimbingan private 1-on-1.
              </p>

              <div className="mt-5 pb-5 border-b border-zinc-100">
                <div className="flex items-baseline gap-2">
                  <span className="font-black text-3xl text-zinc-900">Rp 349.000</span>
                  <span className="text-xs line-through text-zinc-400 font-bold">Rp 799.000</span>
                </div>
                <span className="text-[11px] text-violet-700 font-bold block mt-0.5">
                  Mentoring langsung bersama Kak Roseline
                </span>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-zinc-800">
                {MEMBERSHIP_PACKAGES.summit.highlights.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-violet-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={() => setCheckoutTarget({ type: 'membership', packageId: 'summit' })}
                className="w-full py-3 px-4 rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Award size={15} />
                <span>Pilih Paket Summit (Rp 349.000)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Addon Kuota Section */}
      <section className="bg-zinc-100/70 border-y border-zinc-200/80 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-800)] text-xs font-bold mb-2">
              <Zap size={13} className="text-[var(--color-brand-600)]" /> Top-Up Satuan Fleksibel
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-zinc-900 tracking-tight">
              Butuh Tambahan Kuota Spesifik Tanpa Langganan?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-2">
              Beli paket mikro add-on kuota satuan untuk alat yang sedang sering kamu pakai. Tambahan kuota langsung masuk seketika ke akunmu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(FEATURES_CONFIG) as FeatureKey[]).map((key) => {
              const feat = FEATURES_CONFIG[key];
              return (
                <div
                  key={key}
                  className="bg-white rounded-2xl p-5 border border-zinc-200/90 hover:border-[var(--color-brand-300)] shadow-xs transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-sm text-zinc-900 group-hover:text-[var(--color-brand-700)] transition-colors">
                        {feat.addon.name}
                      </h4>
                      {feat.addon.badge && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-700)] border border-[var(--color-brand-200)] shrink-0">
                          {feat.addon.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 mb-3 line-clamp-2">
                      {feat.description}
                    </p>
                    <div className="text-lg font-black text-zinc-900 mb-1">
                      {feat.addon.priceFormatted}
                    </div>
                    <span className="text-[10px] text-zinc-400 block mb-4">
                      +{feat.addon.amount} {feat.unit} • Sekali bayar
                    </span>
                  </div>

                  <button
                    onClick={() => setCheckoutTarget({ type: 'addon', featureKey: key })}
                    className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-[var(--color-brand-600)] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <ShoppingCart size={13} />
                    <span>Beli Addon</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ / Guarantees */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="font-display font-black text-2xl text-center text-zinc-900 mb-8">
          Pertanyaan yang Sering Diajukan
        </h2>

        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-zinc-200">
            <h4 className="font-bold text-sm text-zinc-900">
              Bagaimana cara kerja pembayaran via Lynk.id?
            </h4>
            <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
              Saat kamu memilih paket atau add-on, kamu cukup mengisi nama, email Gmail, dan nomor WhatsApp. Sistem akan membuka halaman checkout resmi Lynk.id. Kamu bisa membayar lewat QRIS (Gopay, OVO, ShopeePay, BCA Mobile), atau Virtual Account Bank (BCA, Mandiri, BRI, BNI). Begitu transfer berhasil, webhook kami otomatis mendeteksi dan membuka kuotamu detik itu juga!
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200">
            <h4 className="font-bold text-sm text-zinc-900">
              Mengapa formulir email wajib menggunakan @gmail.com?
            </h4>
            <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
              Karena platform Belajar Bareng Roseline menggunakan sistem autentikasi Google OAuth. Dengan menggunakan alamat Gmail yang sama saat membeli di Lynk.id, akunmu langsung otomatis tersambung dan kuota AI langsung aktif ketika kamu login menggunakan tombol Google Login.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200">
            <h4 className="font-bold text-sm text-zinc-900">
              Apakah kuota yang saya beli ada masa kadaluarsanya?
            </h4>
            <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
              Tidak ada! Seluruh kuota Paket Lifetime maupun Add-on Kuota mikro bersifat permanen dan tidak akan pernah hangus sampai kamu menyelesaikan sidang skripsi dan wisuda.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 bg-white py-8 text-center text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} Belajar Bareng Roseline. Seluruh hak cipta dilindungi.</p>
        <p className="mt-1 text-[11px] text-zinc-400">Pembayaran diproses secara aman melalui Lynk.id Payment Gateway.</p>
      </footer>

      {/* Direct Payment Checkout Modal */}
      {checkoutTarget && (
        <PaymentCheckoutModal
          isOpen={!!checkoutTarget}
          target={checkoutTarget}
          onClose={() => setCheckoutTarget(null)}
        />
      )}
    </div>
  );
}
