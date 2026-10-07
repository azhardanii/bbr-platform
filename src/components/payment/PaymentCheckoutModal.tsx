'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  X, CheckCircle2, ShieldCheck, Sparkles, 
  ArrowRight, ExternalLink, RefreshCw, Zap, 
  ShoppingCart, AlertCircle
} from 'lucide-react';
import { FeatureKey, FEATURES_CONFIG } from '@/lib/quota';
import { 
  MEMBERSHIP_PACKAGES, 
  ADDON_LYNK_URLS, 
  PackageTierInfo 
} from '@/lib/paymentConfig';

export type CheckoutTarget = 
  | { type: 'membership'; packageId: 'lifetime' | 'summit' }
  | { type: 'addon'; featureKey: FeatureKey };

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: CheckoutTarget;
  onSuccess?: () => void;
}

export default function PaymentCheckoutModal({
  isOpen,
  onClose,
  target,
  onSuccess,
}: PaymentCheckoutModalProps) {
  const { data: session } = useSession();

  // Payment flow state: 'ready' (overview) | 'waiting' (opened Lynk) | 'confirmed'
  const [step, setStep] = useState<'ready' | 'waiting' | 'confirmed'>('ready');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('ready');
      setIsVerifying(false);
      setVerifyMessage(null);
    }
  }, [isOpen, target]);

  if (!isOpen) return null;

  // Determine Product details
  let productTitle = '';
  let productPriceFormatted = '';
  let productBadge = '';
  let productDescription = '';
  let baseLynkUrl = '';
  let highlights: string[] = [];

  if (target.type === 'membership') {
    const pkg: PackageTierInfo = MEMBERSHIP_PACKAGES[target.packageId];
    productTitle = pkg.name;
    productPriceFormatted = pkg.priceFormatted;
    productBadge = pkg.badge || 'Akses Penuh';
    productDescription = pkg.description;
    baseLynkUrl = pkg.lynkUrl;
    highlights = pkg.highlights.slice(0, 4);
  } else {
    const feat = FEATURES_CONFIG[target.featureKey];
    productTitle = feat.addon.name;
    productPriceFormatted = feat.addon.priceFormatted;
    productBadge = feat.addon.badge || 'Add-on Kuota';
    productDescription = `Tambah +${feat.addon.amount} ${feat.unit} ${feat.name} langsung aktif tanpa langganan.`;
    baseLynkUrl = ADDON_LYNK_URLS[target.featureKey];
    highlights = [
      `+${feat.addon.amount} ${feat.unit} pemakaian aktif`,
      'Tanpa masa kadaluarsa (aktif selamanya)',
      'Aktivasi otomatis instan via webhook Lynk.id',
      'Bisa diakumulasikan berkali-kali',
    ];
  }

  // Pre-fill query param if user email is available from session
  let finalLynkUrl = baseLynkUrl;
  if (session?.user?.email) {
    const separator = finalLynkUrl.includes('?') ? '&' : '?';
    finalLynkUrl = `${finalLynkUrl}${separator}email=${encodeURIComponent(session.user.email)}`;
  }

  const handleProceedToLynk = () => {
    setStep('waiting');

    // Open Lynk.id checkout page in a new tab
    if (typeof window !== 'undefined') {
      window.open(finalLynkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Check quota or tier status live from server
  const handleCheckStatus = async () => {
    setIsVerifying(true);
    setVerifyMessage(null);

    try {
      const res = await fetch('/api/user/quota', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        // If user upgraded to member or received quotas
        if (target.type === 'membership' && (data.role === 'member' || data.role === 'admin')) {
          setStep('confirmed');
          setVerifyMessage('Pembayaran terverifikasi! Akun Anda kini aktif sebagai Member.');
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 2000);
          return;
        }

        // Check if feature addon bonus exists
        if (target.type === 'addon') {
          const quotaItem = data.quota?.[target.featureKey];
          if (quotaItem && quotaItem.addon_bonus > 0) {
            setStep('confirmed');
            setVerifyMessage('Pembayaran terverifikasi! Kuota add-on berhasil ditambahkan ke akun Anda.');
            setTimeout(() => {
              onSuccess?.();
              onClose();
            }, 2000);
            return;
          }
        }
      }

      setVerifyMessage(
        'Pembayaran belum terdeteksi di sistem kami. Jika baru saja menyelesaikan transfer di Lynk.id, tunggu beberapa detik lalu klik tombol ini lagi.'
      );
    } catch {
      setVerifyMessage('Gagal memeriksa status pembayaran. Silakan coba sesaat lagi.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-amber-500/10 via-[var(--color-brand-50)] to-white border-b border-zinc-100 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-brand-700)] uppercase tracking-wider mb-2">
            <span className="p-1 rounded-lg bg-[var(--color-brand-100)] text-[var(--color-brand-700)]">
              <ShoppingCart size={14} />
            </span>
            <span>Pembayaran via Lynk.id</span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display font-black text-2xl text-zinc-900 tracking-tight">
                {productTitle}
              </h3>
              <p className="text-xs text-zinc-600 mt-1 line-clamp-2">
                {productDescription}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-black text-zinc-900">{productPriceFormatted}</span>
              <span className="block text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                {productBadge}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
          {step === 'ready' && (
            <>
              {/* Product Highlights */}
              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/80">
                <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block mb-2">
                  Benefit yang kamu dapatkan:
                </span>
                <ul className="space-y-1.5 text-xs text-zinc-700">
                  {highlights.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Highlighted Warning Box for Email Accuracy */}
              <div className="p-4 bg-gradient-to-br from-red-50/90 via-amber-50/70 to-rose-50/80 rounded-2xl border-2 border-red-300/90 shadow-2xs space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-red-900 text-xs">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[11px] font-black shrink-0">!</span>
                  <span>PERIKSA DENGAN TELITI ALAMAT GMAIL ANDA</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-800">
                  Seluruh formulir data dan pembayaran (QRIS / VA Bank / E-Wallet) diisi langsung di halaman resmi <strong>Lynk.id</strong>.
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-red-200 text-[11px] text-slate-800 font-medium flex items-start gap-2">
                  <span className="text-red-600 font-bold text-xs shrink-0">⚠️</span>
                  <span>
                    <strong>Wajib gunakan Gmail aktif:</strong> Masukkan alamat Gmail yang sama dengan akun Google Anda {session?.user?.email ? <span className="font-mono font-bold text-red-600 underline">({session.user.email})</span> : '(@gmail.com)'}. Jika salah ketik email di Lynk.id, sistem tidak bisa mendeteksi akun Anda secara otomatis!
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                onClick={handleProceedToLynk}
                className="w-full py-3.5 px-4 rounded-xl bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg"
              >
                <span>Buka Halaman Pembayaran Lynk.id</span>
                <ArrowRight size={14} />
              </button>

              <div className="flex items-center justify-center gap-3 text-[10px] text-zinc-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-600" /> QRIS & Bank VA Resmi Lynk.id
                </span>
                <span>•</span>
                <span>Aktivasi Instan Otomatis</span>
              </div>
            </>
          )}

          {step === 'waiting' && (
            <div className="py-6 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center animate-pulse">
                <RefreshCw size={28} className="animate-spin" />
              </div>

              <div>
                <h4 className="font-bold text-lg text-zinc-900">Halaman Lynk.id Telah Dibuka</h4>
                <p className="text-xs text-zinc-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  Silakan selesaikan pembayaran QRIS / Virtual Account / E-Wallet Anda di halaman resmi Lynk.id yang terbuka di tab baru.
                </p>
              </div>

              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-left text-xs w-full space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Produk yang dipilih:</span>
                  <span className="font-bold text-zinc-800">{productTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Biaya:</span>
                  <span className="font-bold text-[var(--color-brand-700)]">{productPriceFormatted}</span>
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-200/60">
                  <span>Status Webhook:</span>
                  <span className="text-amber-700 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    Menunggu konfirmasi payment.received
                  </span>
                </div>
              </div>

              {verifyMessage && (
                <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200 w-full flex items-start gap-2 text-left">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-600" />
                  <span>{verifyMessage}</span>
                </div>
              )}

              <div className="w-full space-y-2 pt-2">
                <button
                  onClick={handleCheckStatus}
                  disabled={isVerifying}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={13} className={isVerifying ? 'animate-spin' : ''} />
                  <span>{isVerifying ? 'Memeriksa Sistem...' : 'Sudah Bayar? Cek Status Kuota Sekarang'}</span>
                </button>

                <button
                  onClick={() => window.open(finalLynkUrl, '_blank', 'noopener,noreferrer')}
                  className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink size={13} />
                  <span>Buka Ulang Halaman Lynk.id</span>
                </button>

                <button
                  onClick={onClose}
                  className="text-xs text-zinc-500 hover:text-zinc-800 underline cursor-pointer pt-1"
                >
                  Tutup jendela ini
                </button>
              </div>
            </div>
          )}

          {step === 'confirmed' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="font-bold text-lg text-zinc-900">Pembayaran Berhasil!</h4>
              <p className="text-xs text-zinc-600 max-w-xs">{verifyMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
