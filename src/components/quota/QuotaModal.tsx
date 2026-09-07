'use client';

import { useState } from 'react';
import { 
  X, Sparkles, Zap, ShieldCheck, CheckCircle2, ArrowRight, 
  AlertTriangle, Lock, ShoppingCart 
} from 'lucide-react';
import { 
  FeatureKey, FEATURES_CONFIG, getUserQuota, 
  purchaseFeatureAddon, setPlanTier, checkFeatureQuota 
} from '@/lib/quota';

interface QuotaModalProps {
  featureKey: FeatureKey;
  isOpen: boolean;
  onClose: () => void;
  onPurchased?: () => void;
}

export default function QuotaModal({
  featureKey,
  isOpen,
  onClose,
  onPurchased,
}: QuotaModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const feature = FEATURES_CONFIG[featureKey];
  const quotaCheck = checkFeatureQuota(featureKey);
  const userQuota = getUserQuota();
  const isFreeTier = userQuota.planTier === 'free';

  const handleBuyAddon = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const result = purchaseFeatureAddon(featureKey);
      setIsProcessing(false);
      if (result.success) {
        setSuccessMsg(result.message);
        setTimeout(() => {
          setSuccessMsg(null);
          onPurchased?.();
          onClose();
        }, 1400);
      }
    }, 600);
  };

  const handleUpgradeLifetime = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setPlanTier('lifetime');
      setIsProcessing(false);
      setSuccessMsg('🎉 Selamat! Akun Anda berhasil di-upgrade ke Paket Lifetime Mahasiswa!');
      setTimeout(() => {
        setSuccessMsg(null);
        onPurchased?.();
        onClose();
      }, 1500);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-amber-500/10 via-[var(--color-brand-50)] to-white border-b border-zinc-100 relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2.5 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="p-1 rounded-lg bg-amber-100 text-amber-700">
              <Lock size={14} />
            </span>
            <span>Kuota Pemakaian Habis</span>
          </div>

          <h3 className="font-display font-black text-2xl text-zinc-900 tracking-tight">
            {feature.name}
          </h3>
          <p className="text-xs text-zinc-600 mt-1">
            Kuota aktif Anda saat ini telah mencapai batas limit ({quotaCheck.used}/{quotaCheck.limit} {feature.unit}). Tambah kuota mikro satuan atau buka akses penuh tanpa batas.
          </p>
        </div>

        {/* Modal Body / Purchasing Options */}
        <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
          {successMsg ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="font-bold text-lg text-zinc-900">{successMsg}</h4>
              <p className="text-xs text-zinc-500">Kuota telah ditambahkan ke akun Anda.</p>
            </div>
          ) : (
            <>
              {/* Option 1: Micro Add-on Top-Up for This Feature */}
              <div className="rounded-2xl border-2 border-[var(--color-brand-300)] bg-[var(--color-brand-50)]/40 p-4.5 relative hover:border-[var(--color-brand-500)] transition-all">
                {feature.addon.badge && (
                  <span className="absolute -top-2.5 right-4 bg-[var(--color-brand-600)] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                    {feature.addon.badge}
                  </span>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-brand-800)]">
                      <Zap size={14} className="text-[var(--color-brand-600)]" />
                      <span>{feature.addon.name}</span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      Tambahan +{feature.addon.amount} {feature.unit} langsung aktif tanpa biaya langganan bulanan.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-black text-zinc-900">{feature.addon.priceFormatted}</span>
                    <span className="block text-[10px] text-zinc-500 font-medium">Sekali bayar</span>
                  </div>
                </div>

                <button
                  onClick={handleBuyAddon}
                  disabled={isProcessing}
                  className="w-full mt-3.5 py-2.5 rounded-xl bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShoppingCart size={14} />
                  <span>Beli Addon ({feature.addon.priceFormatted})</span>
                </button>
              </div>

              {/* Option 2: Upgrade to Lifetime Package (If still Free Tier) */}
              {isFreeTier && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4.5 relative hover:border-amber-400 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <Sparkles size={14} className="text-amber-600" />
                        <span>Paket Lifetime Mahasiswa (Akses Penuh)</span>
                      </div>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        Buka kuota ratusan kali untuk 8 tools AI BBR sekaligus sampai kamu wisuda.
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-zinc-900">Rp 199.000</span>
                      <span className="block text-[10px] text-emerald-700 font-bold">Hemat 60%</span>
                    </div>
                  </div>

                  <ul className="mt-2.5 space-y-1 text-[11px] text-zinc-600">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                      <span>250x Parafrase AI & 150x Bedah Draf</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                      <span>15 Sesi Simulator Sidang AI & 100x Sitasi Jurnal</span>
                    </li>
                  </ul>

                  <button
                    onClick={handleUpgradeLifetime}
                    disabled={isProcessing}
                    className="w-full mt-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>Upgrade ke Lifetime (Rp 199.000)</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Guarantees */}
              <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={13} className="text-emerald-600" /> Garansi Aman
                </span>
                <span>•</span>
                <span>Aktivasi Otomatis Instan</span>
                <span>•</span>
                <span>Tanpa Langganan Berulang</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
