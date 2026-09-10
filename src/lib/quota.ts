import { isUserAdmin } from './roles';

export type PlanTier = 'free' | 'lifetime' | 'admin';

export type FeatureKey = 
  | 'parafrase'
  | 'writingAssistant'
  | 'judulFinder'
  | 'spss'
  | 'sidang'
  | 'sitasi'
  | 'scriptWa'
  | 'kompilasi';

export interface FeatureMeta {
  key: FeatureKey;
  name: string;
  unit: string;
  description: string;
  cogsPerUnit: number; // Rupiah estimasi biaya server/API
  freeLimit: number;
  lifetimeLimit: number;
  addon: {
    name: string;
    amount: number;
    price: number;
    priceFormatted: string;
    badge?: string;
  };
}

export const FEATURES_CONFIG: Record<FeatureKey, FeatureMeta> = {
  parafrase: {
    key: 'parafrase',
    name: 'Parafrase AI Anti-Turnitin',
    unit: 'kali',
    description: 'Parafrase kalimat & paragraf 6 gaya bahasa akademik lolos Turnitin',
    cogsPerUnit: 15,
    freeLimit: 3,
    lifetimeLimit: 250,
    addon: {
      name: 'Addon Parafrase +50x',
      amount: 50,
      price: 19000,
      priceFormatted: 'Rp 19.000',
      badge: 'Paling Laris',
    },
  },
  writingAssistant: {
    key: 'writingAssistant',
    name: 'Asisten Penulisan & Bedah Draf',
    unit: 'kali',
    description: 'Klinik naskah, koreksi EYD, ekspansi argumen, dan parafrase cepat',
    cogsPerUnit: 20,
    freeLimit: 3,
    lifetimeLimit: 150,
    addon: {
      name: 'Addon Bedah Draf +40x',
      amount: 40,
      price: 19000,
      priceFormatted: 'Rp 19.000',
    },
  },
  judulFinder: {
    key: 'judulFinder',
    name: 'Judul Finder & ACC Checker',
    unit: 'analisis',
    description: 'Eksplorasi ide judul riset dan simulasi skor persetujuan dosen pembimbing',
    cogsPerUnit: 18,
    freeLimit: 3,
    lifetimeLimit: 50,
    addon: {
      name: 'Addon Judul Finder +25x',
      amount: 25,
      price: 15000,
      priceFormatted: 'Rp 15.000',
    },
  },
  spss: {
    key: 'spss',
    name: 'SPSS & SmartPLS Interpreter (Bab 4)',
    unit: 'analisis',
    description: 'Interpretasi output regresi, uji F/t, R-square, dan narasi siap tempel',
    cogsPerUnit: 30,
    freeLimit: 2,
    lifetimeLimit: 50,
    addon: {
      name: 'Addon Olah Data +20x',
      amount: 20,
      price: 25000,
      priceFormatted: 'Rp 25.000',
      badge: 'Spesial Riset',
    },
  },
  sidang: {
    key: 'sidang',
    name: 'Simulator Sidang Skripsi AI',
    unit: 'sesi',
    description: 'Simulasi tanya jawab sidang interaktif dengan 8 persona penguji & audio suara',
    cogsPerUnit: 150,
    freeLimit: 1,
    lifetimeLimit: 15,
    addon: {
      name: 'Addon Sidang +5 Sesi',
      amount: 5,
      price: 29000,
      priceFormatted: 'Rp 29.000',
      badge: 'High Impact',
    },
  },
  sitasi: {
    key: 'sitasi',
    name: 'Sitasi & Rujukan Jurnal Otomatis',
    unit: 'sitasi',
    description: 'Pencarian metadata jurnal dan pembentukan kutipan standar APA 7th',
    cogsPerUnit: 12,
    freeLimit: 5,
    lifetimeLimit: 100,
    addon: {
      name: 'Addon Sitasi +50x',
      amount: 50,
      price: 15000,
      priceFormatted: 'Rp 15.000',
    },
  },
  scriptWa: {
    key: 'scriptWa',
    name: 'Script WA Dosen Pembimbing',
    unit: 'script',
    description: 'Generator template pesan santun untuk bimbingan, revisi, dan tanda tangan',
    cogsPerUnit: 10,
    freeLimit: 5,
    lifetimeLimit: 100,
    addon: {
      name: 'Addon Script WA +50x',
      amount: 50,
      price: 15000,
      priceFormatted: 'Rp 15.000',
    },
  },
  kompilasi: {
    key: 'kompilasi',
    name: 'Kompilasi Dokumen Word Standar',
    unit: 'berkas',
    description: 'Penggabungan bab naskah lengkap otomatis dengan margin kampus & daftar isi',
    cogsPerUnit: 5,
    freeLimit: 1,
    lifetimeLimit: 30,
    addon: {
      name: 'Addon Kompilasi +10x',
      amount: 10,
      price: 15000,
      priceFormatted: 'Rp 15.000',
    },
  },
};

export interface UserFeatureUsage {
  limit: number;
  used: number;
}

export interface UserQuotaState {
  planTier: PlanTier;
  purchasedAddons: Array<{
    featureKey: FeatureKey;
    name: string;
    amount: number;
    purchasedAt: string;
    price: number;
  }>;
  features: Record<FeatureKey, UserFeatureUsage>;
  lastUpdated: string;
}

const STORAGE_KEY = 'bbr_user_quota';

/**
 * Inisialisasi kuota default berdasarkan tier
 */
export function createInitialQuota(tier: PlanTier = 'free'): UserQuotaState {
  const features = {} as Record<FeatureKey, UserFeatureUsage>;
  
  (Object.keys(FEATURES_CONFIG) as FeatureKey[]).forEach((key) => {
    const config = FEATURES_CONFIG[key];
    features[key] = {
      limit: tier === 'admin' ? -1 : tier === 'lifetime' ? config.lifetimeLimit : config.freeLimit,
      used: 0,
    };
  });

  return {
    planTier: tier,
    purchasedAddons: [],
    features,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Mengambil kuota user saat ini dari localStorage
 */
export function getUserQuota(): UserQuotaState {
  if (typeof window === 'undefined') {
    return createInitialQuota('free');
  }

  // Check if active user is admin via cached session
  const email = localStorage.getItem('bbr_user_email');
  const role = localStorage.getItem('bbr_user_role');
  if (isUserAdmin(email, role)) {
    return createInitialQuota('admin');
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const defaultState = createInitialQuota('free');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
      return defaultState;
    }
    const parsed: UserQuotaState = JSON.parse(stored);
    
    if (parsed.planTier === 'admin') {
      return createInitialQuota('admin');
    }

    // Pastikan semua fitur terdefinisi (backward compatibility)
    let needsUpdate = false;
    (Object.keys(FEATURES_CONFIG) as FeatureKey[]).forEach((key) => {
      if (!parsed.features || !parsed.features[key]) {
        parsed.features = parsed.features || ({} as any);
        const config = FEATURES_CONFIG[key];
        parsed.features[key] = {
          limit: parsed.planTier === 'lifetime' ? config.lifetimeLimit : config.freeLimit,
          used: 0,
        };
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (err) {
    console.error('[QuotaService] Error reading quota:', err);
    return createInitialQuota('free');
  }
}

/**
 * Simpan dan dispatch event perubahan kuota
 */
export function saveUserQuota(state: UserQuotaState) {
  if (typeof window === 'undefined') return;
  state.lastUpdated = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('bbr-quota-updated', { detail: state }));
}

/**
 * Pengecekan status kuota fitur
 */
export interface QuotaCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  isNearLimit: boolean;
  percentageUsed: number;
  feature: FeatureMeta;
}

export function checkFeatureQuota(key: FeatureKey): QuotaCheckResult {
  const state = getUserQuota();
  const feature = FEATURES_CONFIG[key];

  // Admin user always has unlimited access
  if (state.planTier === 'admin') {
    return {
      allowed: true,
      remaining: 999999,
      limit: -1,
      used: 0,
      isNearLimit: false,
      percentageUsed: 0,
      feature,
    };
  }

  const usage = state.features[key] || { limit: feature.freeLimit, used: 0 };
  
  const remaining = Math.max(0, usage.limit - usage.used);
  const allowed = remaining > 0;
  
  // Peringatan menipis jika sisa <= 1 untuk free, atau sisa <= 15% (min <= 5) untuk pro
  const isNearLimit = state.planTier === 'free' 
    ? remaining === 1
    : remaining > 0 && remaining <= Math.max(5, Math.ceil(usage.limit * 0.15));

  const percentageUsed = usage.limit > 0 ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 100;

  return {
    allowed,
    remaining,
    limit: usage.limit,
    used: usage.used,
    isNearLimit,
    percentageUsed,
    feature,
  };
}

/**
 * Konsumsi kuota 1x pemakaian.
 * Return true jika berhasil konsumsi, false jika kuota sudah habis.
 */
export function consumeFeatureQuota(key: FeatureKey): boolean {
  const state = getUserQuota();
  if (state.planTier === 'admin') {
    return true; // Admin never consumes quota
  }

  const check = checkFeatureQuota(key);
  if (!check.allowed) {
    return false;
  }

  if (state.features[key]) {
    state.features[key].used += 1;
    saveUserQuota(state);
  }
  return true;
}

/**
 * Pembelian Addon kuota satuan per fitur
 */
export function purchaseFeatureAddon(key: FeatureKey): { success: boolean; message: string } {
  const feature = FEATURES_CONFIG[key];
  if (!feature) return { success: false, message: 'Fitur tidak ditemukan.' };

  const state = getUserQuota();
  const addon = feature.addon;

  // Tambahkan limit kuota pada fitur tersebut
  if (!state.features[key]) {
    state.features[key] = { limit: addon.amount, used: 0 };
  } else {
    state.features[key].limit += addon.amount;
  }

  // Catat transaksi addon
  state.purchasedAddons.push({
    featureKey: key,
    name: addon.name,
    amount: addon.amount,
    purchasedAt: new Date().toISOString(),
    price: addon.price,
  });

  saveUserQuota(state);
  return { 
    success: true, 
    message: `Berhasil menambahkan +${addon.amount} kuota ${feature.name}!` 
  };
}

/**
 * Upgrade atau ganti tier (misal dari Free ke Lifetime)
 */
export function setPlanTier(newTier: PlanTier) {
  const state = getUserQuota();
  state.planTier = newTier;

  // Reset limit fitur sesuai tier baru tanpa menghilangkan addon yang sudah dibeli
  (Object.keys(FEATURES_CONFIG) as FeatureKey[]).forEach((key) => {
    const config = FEATURES_CONFIG[key];
    const baseLimit = newTier === 'lifetime' ? config.lifetimeLimit : config.freeLimit;
    
    // Hitung addon tambahan yang sudah pernah dibeli untuk fitur ini
    const addonBonus = state.purchasedAddons
      .filter(a => a.featureKey === key)
      .reduce((sum, a) => sum + a.amount, 0);

    const currentUsed = state.features[key]?.used || 0;
    state.features[key] = {
      limit: baseLimit + addonBonus,
      used: currentUsed,
    };
  });

  saveUserQuota(state);
}

/**
 * Reset kuota untuk pengujian / demonstrasi
 */
export function resetUserQuotaDemo(tier: PlanTier = 'free') {
  const fresh = createInitialQuota(tier);
  saveUserQuota(fresh);
  return fresh;
}
