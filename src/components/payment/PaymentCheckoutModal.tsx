'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  X, CheckCircle2, AlertCircle, ShieldCheck, Sparkles, 
  ArrowRight, ExternalLink, RefreshCw, Zap, Mail, 
  User as UserIcon, Phone, ShoppingCart, Lock
} from 'lucide-react';
import { FeatureKey, FEATURES_CONFIG } from '@/lib/quota';
import { 
  MEMBERSHIP_PACKAGES, 
  ADDON_LYNK_URLS, 
  buildLynkCheckoutUrl,
  PackageTierInfo 
} from '@/lib/paymentConfig';
import { isGmailAddress, normalizeIndonesianPhone } from '@/lib/lynkid';

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

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ name: false, email: false, phone: false });

  // Payment flow state
  const [step, setStep] = useState<'form' | 'waiting' | 'confirmed'>('form');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [openedUrl, setOpenedUrl] = useState<string>('');

  // Prefill form from user session if available
  useEffect(() => {
    if (session?.user) {
      if (session.user.name && !name) {
        setName(session.user.name);
      }
      if (session.user.email && !email) {
        setEmail(session.user.email);
        if (!isGmailAddress(session.user.email)) {
          setEmailError('Wajib menggunakan akun @gmail.com agar sinkronisasi AI otomatis.');
        }
      }
    }
  }, [session, isOpen]);

  // Reset state when opened with new target
  useEffect(() => {
    if (isOpen) {
      setStep('form');
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
      'Aktivasi otomatis instan dalam hitungan detik',
      'Bisa diakumulasikan berkali-kali',
    ];
  }

  // Validate email on change
  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (!val) {
      setEmailError('Email tidak boleh kosong');
    } else if (!isGmailAddress(val)) {
      setEmailError('Email wajib berakhiran @gmail.com (contoh: namaanda@gmail.com)');
    } else {
      setEmailError(null);
    }
  };

  // Validate phone on change
  const handlePhoneChange = (val: string) => {
    setPhone(val);
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) {
      setPhoneError('Nomor WhatsApp wajib diisi');
    } else if (cleaned.length < 9) {
      setPhoneError('Nomor WhatsApp minimal 9 digit');
    } else {
      setPhoneError(null);
    }
  };

  const isFormValid =
    name.trim().length > 0 &&
    isGmailAddress(email) &&
    phone.replace(/\D/g, '').length >= 9;

  const handleProceedToLynk = () => {
    if (!isFormValid) {
      setTouched({ name: true, email: true, phone: true });
      if (!isGmailAddress(email)) {
        setEmailError('Email wajib berakhiran @gmail.com');
      }
      return;
    }

    const normalizedPhone = normalizeIndonesianPhone(phone);
    const checkoutUrl = buildLynkCheckoutUrl(baseLynkUrl, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: normalizedPhone,
    });

    setOpenedUrl(checkoutUrl);
    setStep('waiting');

    // Save pending info to localStorage for recovery
    try {
      localStorage.setItem(
        'bbr_pending_payment',
        JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim(),
          phone: normalizedPhone,
          product: productTitle,
          url: checkoutUrl,
          timestamp: new Date().toISOString(),
        })
      );
    } catch {}

    // Open Lynk.id checkout page in new tab
    if (typeof window !== 'undefined') {
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
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
            setVerifyMessage('Pembayaran terverifikasi! Kuota add-on berhasil ditambahkan.');
            setTimeout(() => {
              onSuccess?.();
              onClose();
            }, 2000);
            return;
          }
        }
      }

      setVerifyMessage(
        'Pembayaran belum terdeteksi. Pastikan Anda telah menyelesaikan pembayaran di halaman Lynk.id, lalu klik tombol ini lagi.'
      );
    } catch (e) {
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
            <span>Checkout Pembayaran Lynk.id</span>
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
          {step === 'form' && (
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

              {/* Input Form */}
              <div className="space-y-3.5 pt-1">
                {/* 1. Nama Lengkap */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1.5">
                    <UserIcon size={13} className="text-zinc-500" />
                    <span>Nama Lengkap</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setTouched({ ...touched, name: true });
                    }}
                    placeholder="Contoh: Salsabila Putri"
                    className="w-full px-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[var(--color-brand-600)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 transition-all"
                  />
                  {touched.name && !name.trim() && (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> Nama lengkap wajib diisi
                    </p>
                  )}
                </div>

                {/* 2. Email (Wajib Gmail) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                      <Mail size={13} className="text-zinc-500" />
                      <span>Alamat Email (Wajib Gmail)</span>
                    </label>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Wajib @gmail.com
                    </span>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      handleEmailChange(e.target.value);
                      setTouched({ ...touched, email: true });
                    }}
                    placeholder="nama.anda@gmail.com"
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-all ${
                      emailError
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                        : isGmailAddress(email)
                        ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                        : 'border-zinc-300 focus:border-[var(--color-brand-600)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20'
                    }`}
                  />
                  {emailError ? (
                    <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-start gap-1">
                      <AlertCircle size={12} className="shrink-0 mt-0.5" />
                      <span>{emailError}</span>
                    </p>
                  ) : isGmailAddress(email) ? (
                    <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Email Gmail valid untuk aktivasi otomatis
                    </p>
                  ) : (
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Gunakan alamat Gmail yang sama saat login Google ke platform ini.
                    </p>
                  )}
                </div>

                {/* 3. Nomor WhatsApp / Telepon */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1.5">
                    <Phone size={13} className="text-zinc-500" />
                    <span>Nomor WhatsApp / HP Aktif</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-bold text-zinc-500 select-none">
                      🇮🇩 +62
                    </span>
                    <input
                      type="tel"
                      value={phone.startsWith('62') ? phone.slice(2) : phone.startsWith('0') ? phone.slice(1) : phone}
                      onChange={(e) => {
                        handlePhoneChange(e.target.value);
                        setTouched({ ...touched, phone: true });
                      }}
                      placeholder="81234567890"
                      className="w-full pl-16 pr-3.5 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[var(--color-brand-600)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 transition-all font-mono"
                    />
                  </div>
                  {phoneError ? (
                    <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {phoneError}
                    </p>
                  ) : (
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Untuk konfirmasi bukti pembayaran dan notifikasi kuota via WhatsApp.
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Gateway Notes */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <Sparkles size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Aktivasi Instan Otomatis:</strong> Setelah bayar via Lynk.id (QRIS, VA BCA/Mandiri/BRI, atau E-Wallet), sistem webhook kami langsung mengaktifkan kuota Anda seketika!
                </p>
              </div>

              {/* Submit CTA */}
              <button
                onClick={handleProceedToLynk}
                disabled={!isFormValid}
                className="w-full py-3 px-4 rounded-xl bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Lanjut ke Pembayaran Lynk.id</span>
                <ArrowRight size={14} />
              </button>

              <div className="flex items-center justify-center gap-3 text-[10px] text-zinc-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-600" /> QRIS & Bank VA Resmi
                </span>
                <span>•</span>
                <span>Proses Cepat & Terenkripsi</span>
              </div>
            </>
          )}

          {step === 'waiting' && (
            <div className="py-6 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center animate-pulse">
                <RefreshCw size={28} className="animate-spin" />
              </div>

              <div>
                <h4 className="font-bold text-lg text-zinc-900">Menunggu Pembayaran Lynk.id</h4>
                <p className="text-xs text-zinc-600 mt-1 max-w-sm mx-auto">
                  Halaman pembayaran telah dibuka di tab baru. Silakan selesaikan pembayaran QRIS / Virtual Account / E-Wallet Anda.
                </p>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-left text-xs w-full space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Nama Pembeli:</span>
                  <span className="font-bold text-zinc-800">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Email Gmail:</span>
                  <span className="font-bold text-zinc-800 font-mono">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Tagihan:</span>
                  <span className="font-bold text-[var(--color-brand-700)]">{productPriceFormatted}</span>
                </div>
              </div>

              {verifyMessage && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 w-full flex items-start gap-2 text-left">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{verifyMessage}</span>
                </div>
              )}

              <div className="w-full space-y-2 pt-2">
                <button
                  onClick={handleCheckStatus}
                  disabled={isVerifying}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={13} className={isVerifying ? 'animate-spin' : ''} />
                  <span>{isVerifying ? 'Memeriksa Sistem...' : 'Sudah Bayar? Cek Status Kuota Sekarang'}</span>
                </button>

                {openedUrl && (
                  <button
                    onClick={() => window.open(openedUrl, '_blank', 'noopener,noreferrer')}
                    className="w-full py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink size={13} />
                    <span>Buka Ulang Halaman Lynk.id</span>
                  </button>
                )}

                <button
                  onClick={() => setStep('form')}
                  className="text-xs text-zinc-500 hover:text-zinc-800 underline cursor-pointer pt-1"
                >
                  Kembali ubah formulir data diri
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
