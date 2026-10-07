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
  process.env.NEXT_PUBLIC_LYNK_STORE_URL || "https://lynk.id/belajarbarengroselini";

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
      "https://lynk.id/belajarbarengroselini/xq66xon40g7v/checkout",
  },
  summit: {
    id: "summit",
    name: "Paket Summit + Bimbingan Private",
    badge: "VIP Mentoring",
    price: 349000,
    priceFormatted: "Rp 349.000",
    originalPriceFormatted: "Rp 799.000",
    description: "Akses Lifetime lengkap + 2 sesi mentoring private 1-on-1 bersama Kak Roselini.",
    highlights: [
      "Seluruh kuota & fitur Paket Lifetime Mahasiswa",
      "2x Sesi Private 1-on-1 Bimbingan Video Call",
      "Bedah Proposal & Review Bab Skripsi Prioritas",
      "Rekomendasi Persona Dosen Penguji Sidang",
      "Akses grup Telegram eksklusif alumni bimbingan",
    ],
    lynkUrl:
      process.env.NEXT_PUBLIC_LYNK_SUMMIT_URL ||
      `${LYNK_STORE_BASE}`,
  },
};

export const ADDON_LYNK_URLS: Record<FeatureKey, string> = {
  parafrase:
    process.env.NEXT_PUBLIC_LYNK_ADDON_PARAFRASE ||
    "https://lynk.id/belajarbarengroselini/g4wwlxme885k/checkout",
  writingAssistant:
    process.env.NEXT_PUBLIC_LYNK_ADDON_WRITING ||
    "https://lynk.id/belajarbarengroselini/yyggjn4pg3ym/checkout",
  judulFinder:
    process.env.NEXT_PUBLIC_LYNK_ADDON_JUDUL ||
    "https://lynk.id/belajarbarengroselini/owee9o276po8/checkout",
  spss:
    process.env.NEXT_PUBLIC_LYNK_ADDON_SPSS ||
    "https://lynk.id/belajarbarengroselini/l8qqg9dkpnx6/checkout",
  sidang:
    process.env.NEXT_PUBLIC_LYNK_ADDON_SIDANG ||
    "https://lynk.id/belajarbarengroselini/w9gg3p895v4j/checkout",
  sitasi:
    process.env.NEXT_PUBLIC_LYNK_ADDON_SITASI ||
    "https://lynk.id/belajarbarengroselini/z1mm52x949gw/checkout",
  scriptWa:
    process.env.NEXT_PUBLIC_LYNK_ADDON_SCRIPT_WA ||
    "https://lynk.id/belajarbarengroselini/3v99moeqjwqq/checkout",
  kompilasi:
    process.env.NEXT_PUBLIC_LYNK_ADDON_KOMPILASI ||
    "https://lynk.id/belajarbarengroselini/yn11o5jp2weo/checkout",
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
