import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

// Helper to determine tier from amount or product_id (simplified mapping)
function getTierFromAmount(amount: number) {
  if (amount >= 250000) return 'summit';
  if (amount >= 150000) return 'drive';
  return 'spark';
}

function generateAffiliateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'BBR-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("X-Lynkid-Signature");
    const payload = await req.json();

    // Verify HMAC signature (stubbed - replace with actual validation if secret available)
    // const secret = process.env.LYNKID_SECRET;
    // const hmac = crypto.createHmac("sha256", secret!).update(JSON.stringify(payload)).digest("hex");
    // if (hmac !== signature) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

    const { email, name, amount, status, payment_ref } = payload;

    // Log the webhook
    await prisma.webhookLog.create({
      data: {
        source: 'lynkid',
        payload: payload,
        status: status,
      }
    });

    if (status !== 'paid') {
      return NextResponse.json({ received: true, message: "Acknowledged, but not paid." });
    }

    // Check if payment_ref already processed (Idempotency)
    const existingUserByRef = await prisma.user.findFirst({
      where: { payment_ref: payment_ref }
    });

    if (existingUserByRef) {
      return NextResponse.json({ received: true, message: "Payment already processed." });
    }

    const tier = getTierFromAmount(amount);
    const affiliate_code = generateAffiliateCode();

    // Upsert user
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email,
          nama_lengkap: name,
          tier,
          payment_ref,
          paid_at: new Date(),
          affiliate_code,
        }
      });
    } else {
      await prisma.user.update({
        where: { email },
        data: {
          tier, // upgrade tier
          payment_ref,
          paid_at: new Date(),
          affiliate_code: existingUser.affiliate_code || affiliate_code,
        }
      });
    }

    // Optionally forward to n8n webhook if configured
    // if (process.env.N8N_WEBHOOK_URL) {
    //   await fetch(process.env.N8N_WEBHOOK_URL, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(payload),
    //   });
    // }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
