import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  LynkWebhookPayload,
  verifyLynkSignature,
  normalizeIndonesianPhone,
  classifyLynkProducts,
  generateAffiliateCode,
} from "@/lib/lynkid";

/**
 * POST /api/webhooks/lynkid
 * Handles incoming payment notifications from Lynk.id:
 * 1. Verifies SHA-256 signature using Lynk secret key
 * 2. Enforces idempotency via refId
 * 3. Registers or upgrades the user's role and tier
 * 4. Automatically credits AI quota add-ons
 * 5. Logs all transactions in PostgreSQL
 */
export async function POST(req: Request) {
  let rawBodyText = "";
  try {
    const signature =
      req.headers.get("x-lynk-signature") ||
      req.headers.get("X-Lynk-Signature") ||
      req.headers.get("x-signature") ||
      req.headers.get("x-lynkid-signature");

    rawBodyText = await req.text();
    const payload: LynkWebhookPayload = JSON.parse(rawBodyText);

    // Initial audit log
    const logEntry = await prisma.webhookLog.create({
      data: {
        source: "lynkid",
        payload: payload as any,
        status: "received",
      },
    });

    const event = payload?.event;
    const messageAction = payload?.data?.message_action;
    const messageId = payload?.data?.message_id;
    const messageData = payload?.data?.message_data;

    if (!messageData) {
      await prisma.webhookLog.update({
        where: { id: logEntry.id },
        data: { status: "missing_message_data", processed: false },
      });
      return NextResponse.json({ error: "Malformed Lynk payload" }, { status: 400 });
    }

    const { customer, items, refId, totals } = messageData;
    const grandTotal = totals?.grandTotal ?? 0;

    // 1. Signature Verification
    const verification = verifyLynkSignature({
      grandTotal,
      refId: refId || "",
      messageId: messageId || "",
      receivedSignature: signature,
    });

    if (!verification.valid) {
      console.warn("[Lynk Webhook] Invalid signature detected:", {
        receivedSignature: signature,
        calculatedHash: verification.calculatedHash,
        refId,
        messageId,
      });

      await prisma.webhookLog.update({
        where: { id: logEntry.id },
        data: { status: "invalid_signature", processed: false },
      });

      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Validate Payment Action
    if (messageAction !== "SUCCESS") {
      await prisma.webhookLog.update({
        where: { id: logEntry.id },
        data: { status: `action_${messageAction || "unknown"}`, processed: false },
      });
      return NextResponse.json({
        received: true,
        message: `Acknowledged non-success action: ${messageAction}`,
      });
    }

    // 3. Idempotency Check
    const existingUserWithRef = await prisma.user.findFirst({
      where: { payment_ref: refId },
    });

    if (existingUserWithRef) {
      await prisma.webhookLog.update({
        where: { id: logEntry.id },
        data: { status: "duplicate_payment_ref", processed: true },
      });
      return NextResponse.json({
        received: true,
        message: "Payment transaction already processed previously.",
      });
    }

    // 4. Extract and normalize customer information
    const normalizedEmail = (customer?.email || "").toLowerCase().trim();
    const normalizedPhone = normalizeIndonesianPhone(customer?.phone);
    const customerName = customer?.name?.trim() || "Mahasiswa Belajar Bareng Roseline";

    if (!normalizedEmail) {
      await prisma.webhookLog.update({
        where: { id: logEntry.id },
        data: { status: "missing_email", processed: false },
      });
      return NextResponse.json({ error: "Customer email is missing" }, { status: 400 });
    }

    // 5. Classify purchased product(s) and AI add-ons
    const classification = classifyLynkProducts(items || [], grandTotal);

    // 6. Upsert User Account in PostgreSQL
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          nama_lengkap: customerName,
          role: classification.isTierUpgrade ? classification.targetRole : "free",
          tier: classification.isTierUpgrade ? classification.targetTier : "spark",
          payment_ref: refId,
          paid_at: new Date(),
          affiliate_code: generateAffiliateCode(),
          onboarding_completed: false,
          sessions_total: classification.targetTier === "summit" ? 2 : 0,
        },
      });
    } else {
      const updateData: any = {
        payment_ref: refId,
        paid_at: new Date(),
      };

      if (!user.nama_lengkap && customerName) {
        updateData.nama_lengkap = customerName;
      }

      if (classification.isTierUpgrade) {
        // Upgrade role to member
        if (user.role !== "admin") {
          updateData.role = "member";
          updateData.tier = classification.targetTier;
        }
        if (classification.targetTier === "summit") {
          updateData.sessions_total = (user.sessions_total || 0) + 2;
        }
      }

      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }

    // 7. Credit AI Quota Add-ons into `user_quotas` table
    const creditedAddons = [];
    for (const addon of classification.quotaAddons) {
      const updatedQuota = await prisma.userQuota.upsert({
        where: {
          user_id_feature: {
            user_id: user.id,
            feature: addon.feature,
          },
        },
        create: {
          user_id: user.id,
          feature: addon.feature,
          used: 0,
          addon_bonus: addon.bonus,
        },
        update: {
          addon_bonus: { increment: addon.bonus },
          updated_at: new Date(),
        },
      });

      creditedAddons.push({
        feature: addon.feature,
        bonusAdded: addon.bonus,
        newAddonBonus: updatedQuota.addon_bonus,
        item: addon.itemName,
      });
    }

    // 8. Mark WebhookLog as successfully processed
    await prisma.webhookLog.update({
      where: { id: logEntry.id },
      data: {
        status: "processed",
        processed: true,
      },
    });

    console.log("[Lynk Webhook] Payment successfully processed:", {
      email: normalizedEmail,
      refId,
      tier: user.tier,
      role: user.role,
      creditedAddons,
    });

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully. Access and quotas unlocked.",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tier: user.tier,
      },
      addons: creditedAddons,
    });
  } catch (error: any) {
    console.error("[Lynk Webhook] Processing error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
