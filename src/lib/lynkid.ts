import crypto from "crypto";
import { FeatureKey, FEATURES_CONFIG } from "./quota";

export interface LynkCustomer {
  email: string;
  name: string;
  phone: string;
}

export interface LynkAddon {
  id?: string;
  name: string;
  price: string | number;
}

export interface LynkItem {
  id?: string;
  uuid?: string;
  title: string;
  price: number;
  qty: number;
  stock?: number;
  addons?: LynkAddon[];
  questions?: string;
  [key: string]: any;
}

export interface LynkTotals {
  grandTotal: number;
  totalPrice?: number;
  totalItem?: number;
  totalAddon?: number;
  discount?: number;
  convenienceFee?: number;
  affiliate?: number;
  totalShipping?: number;
}

export interface LynkMessageData {
  createdAt?: string;
  customer: LynkCustomer;
  items: LynkItem[];
  refId: string;
  shippingAddress?: string;
  shippingInfo?: string;
  totals: LynkTotals;
  voucherCode?: string;
  voucherQuantity?: number;
}

export interface LynkWebhookPayload {
  event: string; // e.g. "payment.received"
  data: {
    message_action: string; // "SUCCESS"
    message_code: string; // "0"
    message_data: LynkMessageData;
    message_desc?: string;
    message_id: string; // e.g. "API_CALL_1744270275143115_4624014"
    message_title?: string;
  };
}

/**
 * Normalizes phone numbers to standard Indonesian format (628...)
 * Ported directly from the user's verified n8n workflow.
 */
export function normalizeIndonesianPhone(phone?: string | null): string {
  if (!phone) return "";
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

/**
 * Strict validator for Gmail accounts.
 * Required so users are automatically recognized when signing in via Google Auth.
 */
export function isGmailAddress(email?: string | null): boolean {
  if (!email) return false;
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email.trim());
}

/**
 * Verifies Lynk.id HMAC SHA-256 signature using the exact formula from n8n:
 * signatureString = `${grandTotal}${refId}${message_id}${secretKey}`
 * hash = crypto.SHA256(signatureString)
 */
export function verifyLynkSignature(params: {
  grandTotal: number | string;
  refId: string;
  messageId: string;
  receivedSignature?: string | null;
  secretKey?: string;
}): { valid: boolean; calculatedHash: string; signatureString: string } {
  const secretKey = (
    params.secretKey ||
    process.env.LYNK_SECRET_KEY ||
    process.env.LYNKID_SECRET ||
    ""
  ).trim();

  if (!secretKey) {
    console.error("[Lynk Webhook] LYNK_SECRET_KEY is not defined in environment variables!");
    return { valid: false, calculatedHash: "", signatureString: "" };
  }

  const signatureString = `${params.grandTotal}${params.refId}${params.messageId}${secretKey}`;
  const calculatedHash = crypto.createHash("sha256").update(signatureString).digest("hex");

  if (!params.receivedSignature) {
    return { valid: false, calculatedHash, signatureString };
  }

  const valid = params.receivedSignature.trim().toLowerCase() === calculatedHash.toLowerCase();
  return { valid, calculatedHash, signatureString };
}

/**
 * Generates an affiliate code for newly registered paid buyers.
 */
export function generateAffiliateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "BBR-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export interface QuotaAddonMatch {
  feature: FeatureKey;
  bonus: number;
  itemName: string;
}

export interface ProductClassification {
  isTierUpgrade: boolean;
  targetTier: "spark" | "drive" | "summit";
  targetRole: "free" | "member";
  quotaAddons: QuotaAddonMatch[];
}

/**
 * Scans item titles and addon names from Lynk.id payload to detect:
 * 1. Tier upgrade (Lifetime, Summit, Drive, Personal, Pro, Business)
 * 2. Specific AI feature quota addons (Parafrase, Bedah Draf, SPSS, Sidang, etc.)
 */
export function classifyLynkProducts(
  items: LynkItem[],
  grandTotal: number = 0
): ProductClassification {
  let isTierUpgrade = false;
  let targetTier: "spark" | "drive" | "summit" = "summit";
  let targetRole: "free" | "member" = "free";
  const quotaAddons: QuotaAddonMatch[] = [];

  const tierPatterns = [
    /lifetime/i,
    /akses lifetime/i,
    /summit/i,
    /drive/i,
    /personal/i,
    /pro\s*version/i,
    /business\s*version/i,
    /member/i,
    /paket lengkap/i,
    /xq66xon40g7v/i,
  ];

  const featureDetectors: Array<{
    feature: FeatureKey;
    pattern: RegExp;
    defaultAmount: number;
  }> = [
    {
      feature: "parafrase",
      pattern: /parafrase|paraphrase|turnitin|g4wwlxme885k/i,
      defaultAmount: 50,
    },
    {
      feature: "writingAssistant",
      pattern: /bedah draf|bedah draft|penulisan|writing|klinik naskah|kinlik naskah|asisten penulisan|yyggjn4pg3ym/i,
      defaultAmount: 40,
    },
    {
      feature: "judulFinder",
      pattern: /judul|judul finder|acc checker|ide riset|owee9o276po8/i,
      defaultAmount: 25,
    },
    {
      feature: "spss",
      pattern: /spss|smartpls|olah data|statistik|interpreter bab 4|l8qqg9dkpnx6/i,
      defaultAmount: 20,
    },
    {
      feature: "sidang",
      pattern: /sidang|simulator sidang|simulasi sidang|w9gg3p895v4j/i,
      defaultAmount: 5,
    },
    {
      feature: "sitasi",
      pattern: /sitasi|sitasi jurnal|jurnal|rujukan|daftar pustaka|z1mm52x949gw/i,
      defaultAmount: 50,
    },
    {
      feature: "scriptWa",
      pattern: /script wa|pesan dosen|chat dosen|3v99moeqjwqq/i,
      defaultAmount: 50,
    },
    {
      feature: "kompilasi",
      pattern: /kompilasi|kompilasi dokumen|gabung bab|word|yn11o5jp2weo/i,
      defaultAmount: 10,
    },
  ];

  for (const item of items) {
    const title = item.title || "";
    const itemSearchStr = [
      item.title,
      item.id,
      item.uuid,
      item.slug,
      (item as any).url,
      (item as any).product_url,
      (item as any).link,
    ]
      .filter(Boolean)
      .join(" ");

    const qty = item.qty && item.qty > 0 ? item.qty : 1;

    // Explicit Free version check
    if (/free\s*version|paket\s*gratis|free\s*tier/i.test(itemSearchStr)) {
      isTierUpgrade = false;
      targetTier = "spark";
      targetRole = "free";
      continue;
    }

    // Check if this item triggers a Tier Upgrade
    const isTierMatch = tierPatterns.some((pattern) => pattern.test(itemSearchStr));
    if (isTierMatch || (grandTotal >= 140000 && !featureDetectors.some((f) => f.pattern.test(itemSearchStr)))) {
      isTierUpgrade = true;
      targetRole = "member";
      if (grandTotal >= 200000 || /summit|pro|business|bussiness|content\s*plan/i.test(itemSearchStr)) {
        targetTier = "summit";
      } else {
        targetTier = "drive";
      }
    }

    // Check if this item is a direct AI Quota Addon
    for (const detector of featureDetectors) {
      if (detector.pattern.test(itemSearchStr)) {
        // Extract custom number like "+50" or "50x" if present in title
        const numMatch = title.match(/\+(\d+)/) || title.match(/(\d+)\s*(?:x|kali|sesi|analisis)/i);
        const parsedAmount = numMatch ? parseInt(numMatch[1], 10) : detector.defaultAmount;
        const totalBonus = parsedAmount * qty;

        quotaAddons.push({
          feature: detector.feature,
          bonus: totalBonus,
          itemName: title,
        });
      }
    }

    // Also check Lynk nested item addons if present
    if (Array.isArray(item.addons)) {
      for (const addon of item.addons) {
        const addonName = addon.name || "";
        const addonSearchStr = [addon.name, addon.id, (addon as any).slug].filter(Boolean).join(" ");
        for (const detector of featureDetectors) {
          if (detector.pattern.test(addonSearchStr)) {
            const numMatch = addonName.match(/\+(\d+)/) || addonName.match(/(\d+)\s*(?:x|kali|sesi|analisis)/i);
            const parsedAmount = numMatch ? parseInt(numMatch[1], 10) : detector.defaultAmount;
            quotaAddons.push({
              feature: detector.feature,
              bonus: parsedAmount * qty,
              itemName: addonName,
            });
          }
        }
      }
    }
  }

  // Fallback: If no specific addon matched but grandTotal > 0 and no tier matched yet
  // If price is Rp 199.000 or general "Digital Produk"
  if (!isTierUpgrade && quotaAddons.length === 0 && grandTotal > 0) {
    if (grandTotal >= 140000) {
      isTierUpgrade = true;
      targetRole = "member";
      targetTier = grandTotal >= 200000 ? "summit" : "drive";
    }
  }

  return {
    isTierUpgrade,
    targetTier,
    targetRole,
    quotaAddons,
  };
}
