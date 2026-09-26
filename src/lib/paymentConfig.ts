import { FeatureKey, FEATURES_CONFIG } from "./quota";

export interface PackageTierInfo {
  id: "lifetime" | "summit";
  name: string;
  badge?: string;
  price: number;
  priceFormatted: string;
  originalPriceFormatted?: string;
  description: string;
  highlights: string[];
  lynkUrl: string;
}

export const LYNK_STORE_BASE =
  process.env.NEXT_PUBLIC_LYNK_STORE_URL || "https://lynk.id/belajarbarengroseline";

export const MEMBERSHIP_PACKAGES: Record<"lifetime" | "summit", PackageTierInfo> = {
  lifetime: {
    id: "lifetime",
    name: "Paket Lifetime Mahasiswa",
    badge: "Paling Populer",
    price: 199000,
    priceFormatted: "Rp 199.000",
    originalPriceFormatted: "Rp 499.000",
    description: "Buka akses penuh seluruh 8 tools AI akademik tanpa langganan bulanan.",
    highlights: [
      "250x Parafrase AI Anti-Turnitin",
      "150x Klinik Naskah & Bedah Draf",
      "50x Judul Finder & ACC Checker",
      "50x SPSS & SmartPLS Interpreter (Bab 4)",
      "15 Sesi Simulator Sidang AI Interaktif",
      "100x Sitasi Jurnal Otomatis (APA 7th)",
      "100x Script WA Sopan Dosen Pembimbing",
      "30x Kompilasi Dokumen Word Kampus",
      "Sekali bayar aktif selamanya sampai wisuda",
    ],
    lynkUrl:
      process.env.NEXT_PUBLIC_LYNK_LIFETIME_URL ||
      `${LYNK_STORE_BASE}/s/lifetime-bbr`,
  },
  summit: {
    id: "summit",
    name: "Paket Summit + Bimbingan Private",
    badge: "VIP Mentoring",
    price: 349000,
    priceFormatted: "Rp 349.000",
    originalPriceFormatted: "Rp 799.000",
    description: "Akses Lifetime lengkap + 2 sesi mentoring private 1-on-1 bersama Kak Roseline.",
    highlights: [
      "Seluruh kuota & fitur Paket Lifetime Mahasiswa",
      "2x Sesi Private 1-on-1 Bimbingan Video Call",
      "Bedah Proposal & Review Bab Skripsi Prioritas",
      "Rekomendasi Persona Dosen Penguji Sidang",
      "Akses grup Telegram eksklusif alumni bimbingan",
    ],
    lynkUrl:
      process.env.NEXT_PUBLIC_LYNK_SUMMIT_URL ||
      `${LYNK_STORE_BASE}/s/summit-bbr`,
  },
};

export const ADDON_LYNK_URLS: Record<FeatureKey, string> = {
  parafrase:
    process.env.NEXT_PUBLIC_LYNK_ADDON_PARAFRASE ||
    `${LYNK_STORE_BASE}/s/addon-parafrase`,
  writingAssistant:
    process.env.NEXT_PUBLIC_LYNK_ADDON_WRITING ||
    `${LYNK_STORE_BASE}/s/addon-bedah-draf`,
  judulFinder:
    process.env.NEXT_PUBLIC_LYNK_ADDON_JUDUL ||
    `${LYNK_STORE_BASE}/s/addon-judul`,
  spss:
    process.env.NEXT_PUBLIC_LYNK_ADDON_SPSS ||
    `${LYNK_STORE_BASE}/s/addon-spss`,
  sidang:
    process.env.NEXT_PUBLIC_LYNK_ADDON_SIDANG ||
    `${LYNK_STORE_BASE}/s/addon-sidang`,
  sitasi:
    process.env.NEXT_PUBLIC_LYNK_ADDON_SITASI ||
    `${LYNK_STORE_BASE}/s/addon-sitasi`,
  scriptWa:
    process.env.NEXT_PUBLIC_LYNK_ADDON_SCRIPT_WA ||
    `${LYNK_STORE_BASE}/s/addon-script-wa`,
  kompilasi:
    process.env.NEXT_PUBLIC_LYNK_ADDON_KOMPILASI ||
    `${LYNK_STORE_BASE}/s/addon-kompilasi`,
};

/**
 * Builds prefilled checkout URL for Lynk.id product page
 */
export function buildLynkCheckoutUrl(
  baseUrl: string,
  params: { name?: string; email?: string; phone?: string }
): string {
  try {
    const url = new URL(baseUrl);
    if (params.name) url.searchParams.set("name", params.name);
    if (params.email) url.searchParams.set("email", params.email);
    if (params.phone) url.searchParams.set("phone", params.phone);
    return url.toString();
  } catch {
    const separator = baseUrl.includes("?") ? "&" : "?";
    const query = new URLSearchParams();
    if (params.name) query.set("name", params.name);
    if (params.email) query.set("email", params.email);
    if (params.phone) query.set("phone", params.phone);
    const qs = query.toString();
    return qs ? `${baseUrl}${separator}${qs}` : baseUrl;
  }
}
