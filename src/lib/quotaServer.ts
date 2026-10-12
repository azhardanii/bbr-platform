/**
 * src/lib/quotaServer.ts
 * Server-side quota management — reads/writes from DB (not localStorage).
 * Used in all /api/ai/* route handlers.
 */

import { prisma } from "./db";
import { FEATURES_CONFIG, FeatureKey } from "./quota";

type UserRole = "free" | "member" | "admin";

/**
 * Base quota limits per feature per role.
 * - free: starter limits (matches pricing landing page "Paket Coba Gratis")
 * - member: lifetime limits (matches pricing landing page "Paket Lifetime Mahasiswa")
 * - admin: unlimited (use -1 as sentinel)
 */
export const ROLE_LIMITS: Record<UserRole, Record<FeatureKey, number>> = {
  free: {
    parafrase: 3,
    writingAssistant: 3,
    judulFinder: 3,
    spss: 2,
    sidang: 1,
    sitasi: 5,
    scriptWa: 5,
    kompilasi: 1,
  },
  member: {
    parafrase: 250,
    writingAssistant: 150,
    judulFinder: 50,
    spss: 50,
    sidang: 15,
    sitasi: 100,
    scriptWa: 100,
    kompilasi: 30,
  },
  admin: {
    parafrase: -1,
    writingAssistant: -1,
    judulFinder: -1,
    spss: -1,
    sidang: -1,
    sitasi: -1,
    scriptWa: -1,
    kompilasi: -1,
  },
};

export interface QuotaCheckResult {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  role: UserRole;
  feature: FeatureKey;
}

/**
 * Check if a user has remaining quota for a feature.
 * Admins always pass. Free/member checked against DB.
 */
export async function checkServerQuota(
  userId: string,
  role: UserRole,
  feature: FeatureKey
): Promise<QuotaCheckResult> {
  // Admin = unlimited
  if (role === "admin") {
    return { allowed: true, used: 0, limit: -1, remaining: -1, role, feature };
  }

  const baseLimit = ROLE_LIMITS[role][feature];

  try {
    // Get or create quota row for this user+feature
    const quotaRow = await prisma.userQuota.upsert({
      where: { user_id_feature: { user_id: userId, feature } },
      create: { user_id: userId, feature, used: 0, addon_bonus: 0 },
      update: {}, // no-op; just fetch
    });

    const effectiveLimit = baseLimit + (quotaRow.addon_bonus ?? 0);
    const used = quotaRow.used;
    const remaining = Math.max(0, effectiveLimit - used);

    return {
      allowed: remaining > 0,
      used,
      limit: effectiveLimit,
      remaining,
      role,
      feature,
    };
  } catch (dbErr) {
    console.warn("[checkServerQuota] Database unreachable, allowing request gracefully:", dbErr);
    return {
      allowed: true,
      used: 0,
      limit: baseLimit,
      remaining: baseLimit,
      role,
      feature,
    };
  }
}

/**
 * Consume 1 unit of quota for a user+feature (atomic increment).
 * Returns false if quota was already 0.
 */
export async function consumeServerQuota(
  userId: string,
  role: UserRole,
  feature: FeatureKey
): Promise<boolean> {
  // Admin = unlimited, never consume
  if (role === "admin") return true;

  try {
    const check = await checkServerQuota(userId, role, feature);
    if (!check.allowed) return false;

    await prisma.userQuota.upsert({
      where: { user_id_feature: { user_id: userId, feature } },
      create: { user_id: userId, feature, used: 1, addon_bonus: 0 },
      update: {
        used: { increment: 1 },
        updated_at: new Date(),
      },
    });

    return true;
  } catch (err) {
    console.warn("[consumeServerQuota] Database unreachable, ignoring:", err);
    return true;
  }
}

/**
 * Log one AI usage event for monitoring.
 * Called after successful AI response — for all roles including admin.
 */
export async function logAiUsage(params: {
  userId: string;
  feature: FeatureKey;
  model?: string;
  tokensIn?: number;
  tokensOut?: number;
}) {
  try {
    await prisma.aiUsageLog.create({
      data: {
        user_id: params.userId,
        feature: params.feature,
        model: params.model ?? null,
        tokens_in: params.tokensIn ?? null,
        tokens_out: params.tokensOut ?? null,
      },
    });
  } catch (err) {
    // Non-fatal — never let logging failure break the feature
    console.error("[logAiUsage] Failed to write log:", err);
  }
}

/**
 * Get quota summary for a user (for /api/user/quota GET).
 */
export async function getUserQuotaSummary(userId: string, role: UserRole) {
  if (role === "admin") {
    const features = Object.keys(FEATURES_CONFIG) as FeatureKey[];
    return features.reduce((acc, key) => {
      acc[key] = { used: 0, limit: -1, remaining: -1, addon_bonus: 0 };
      return acc;
    }, {} as Record<string, { used: number; limit: number; remaining: number; addon_bonus: number }>);
  }

  const rows = await prisma.userQuota.findMany({
    where: { user_id: userId },
  });

  const features = Object.keys(FEATURES_CONFIG) as FeatureKey[];
  return features.reduce((acc, key) => {
    const row = rows.find((r) => r.feature === key);
    const baseLimit = ROLE_LIMITS[role][key];
    const addonBonus = row?.addon_bonus ?? 0;
    const effectiveLimit = baseLimit + addonBonus;
    const used = row?.used ?? 0;
    acc[key] = {
      used,
      limit: effectiveLimit,
      remaining: Math.max(0, effectiveLimit - used),
      addon_bonus: addonBonus,
    };
    return acc;
  }, {} as Record<string, { used: number; limit: number; remaining: number; addon_bonus: number }>);
}
