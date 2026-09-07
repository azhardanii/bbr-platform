'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Zap, X } from 'lucide-react';
import { FeatureKey, checkFeatureQuota, FEATURES_CONFIG } from '@/lib/quota';
import QuotaModal from './QuotaModal';

interface QuotaBannerProps {
  featureKey: FeatureKey;
  className?: string;
  onTopUpSuccess?: () => void;
}

export default function QuotaBanner({
  featureKey,
  className = '',
  onTopUpSuccess,
}: QuotaBannerProps) {
  const [quotaInfo, setQuotaInfo] = useState(() => checkFeatureQuota(featureKey));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setQuotaInfo(checkFeatureQuota(featureKey));
    };
    window.addEventListener('bbr-quota-updated', handleUpdate);
    return () => window.removeEventListener('bbr-quota-updated', handleUpdate);
  }, [featureKey]);

  if (isDismissed) return null;

  // Hanya tampil jika mendekati limit (isNearLimit) ATAU sudah habis (remaining === 0)
  if (!quotaInfo.isNearLimit && quotaInfo.remaining > 0) return null;

  const feature = FEATURES_CONFIG[featureKey];
  const isZero = quotaInfo.remaining === 0;

  return (
    <>
      <div 
        className={`rounded-2xl p-3 px-4 flex items-center justify-between gap-3 text-xs transition-all border shadow-xs ${
          isZero 
            ? 'bg-rose-50/90 border-rose-200 text-rose-800' 
            : 'bg-amber-50/90 border-amber-200 text-amber-900'
        } ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`p-1 rounded-lg shrink-0 ${isZero ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
            <AlertCircle size={15} />
          </span>
          <div className="truncate">
            <span className="font-bold">
              {isZero ? 'Kuota Habis: ' : 'Kuota Menipis: '}
            </span>
            <span>
              {isZero 
                ? `Kuota ${feature.name} telah habis (0/${quotaInfo.limit} ${feature.unit}).` 
                : `Sisa kuota ${feature.name} tinggal ${quotaInfo.remaining} ${feature.unit}.`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              isZero
                ? 'bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            <Zap size={12} />
            <span>Top-up Addon</span>
          </button>
          {!isZero && (
            <button
              onClick={() => setIsDismissed(true)}
              className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg"
              title="Tutup pengingat"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <QuotaModal
        featureKey={featureKey}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPurchased={() => {
          setQuotaInfo(checkFeatureQuota(featureKey));
          onTopUpSuccess?.();
        }}
      />
    </>
  );
}
