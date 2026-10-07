import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { classifyLynkProducts } from "@/lib/lynkid";

/**
 * POST /api/user/claim-payment
 * Membantu pengguna yang salah ketik (typo) email saat checkout di Lynk.id.
 * Pengguna cukup memasukkan Ref ID dari invoice/bukti bayar Lynk.id,
 * dan sistem akan secara otomatis memindahkan status Member & Kuota ke akun Google yang aktif.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu menggunakan Google untuk melakukan klaim transaksi." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const cleanRefId = (body.refId || "").trim();

    if (!cleanRefId) {
      return NextResponse.json(
        { error: "Nomor Referensi (Ref ID) Lynk.id wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Cek apakah ada record user dengan payment_ref ini (misal akun typo yang dibuat webhook)
    const typoUser = await prisma.user.findFirst({
      where: { payment_ref: cleanRefId },
    });

    // 2. Cek apakah ada log webhook transaksi untuk refId ini
    let webhookLog = await prisma.webhookLog.findFirst({
      where: {
        source: "lynkid",
        status: "processed",
      },
      orderBy: { created_at: "desc" },
    });

    // Jika akun typo ditemukan, tapi sudah tertaut ke Google account lain
    if (typoUser && typoUser.google_id && typoUser.id !== session.user.id) {
      return NextResponse.json(
        {
          error:
            "Nomor transaksi ini sudah terverifikasi dan aktif di akun lain. Jika Anda merasa ini keliru, silakan hubungi Customer Support kami.",
        },
        { status: 400 }
      );
    }

    // Jika tidak ditemukan akun berbayar dengan ref tersebut sama sekali
    if (!typoUser) {
      return NextResponse.json(
        {
          error:
            "Nomor referensi pembayaran tidak ditemukan. Pastikan transaksi di Lynk.id sudah berstatus Berhasil (SUCCESS), atau hubungi Admin WhatsApp untuk bantuan manual.",
        },
        { status: 404 }
      );
    }

    // Tentukan klasifikasi tier & addon
    const targetTier = typoUser.tier === "summit" ? "summit" : "drive";
    const sessionsTotal = typoUser.sessions_total || (targetTier === "summit" ? 2 : 0);

    // 3. Pindahkan status Member ke akun yang sedang login saat ini
    const currentUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: "member",
        tier: targetTier,
        payment_ref: cleanRefId,
        paid_at: typoUser.paid_at || new Date(),
        sessions_total: sessionsTotal,
      },
    });

    // 4. Bersihkan payment_ref dari akun typo jika berbeda ID
    if (typoUser.id !== session.user.id) {
      await prisma.user.update({
        where: { id: typoUser.id },
        data: {
          payment_ref: null,
          role: "free",
          tier: "spark",
        },
      });

      // Pindahkan juga kuota addon jika ada
      const typoQuotas = await prisma.userQuota.findMany({
        where: { user_id: typoUser.id },
      });

      for (const q of typoQuotas) {
        if (q.addon_bonus > 0) {
          await prisma.userQuota.upsert({
            where: {
              user_id_feature: {
                user_id: session.user.id,
                feature: q.feature,
              },
            },
            create: {
              user_id: session.user.id,
              feature: q.feature,
              used: 0,
              addon_bonus: q.addon_bonus,
            },
            update: {
              addon_bonus: { increment: q.addon_bonus },
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Klaim transaksi ${cleanRefId} berhasil! Akun Anda kini aktif sebagai Member ${targetTier === "summit" ? "Summit" : "Lifetime"}.`,
      role: currentUser.role,
      tier: currentUser.tier,
    });
  } catch (error: any) {
    console.error("[POST /api/user/claim-payment] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan internal saat memproses klaim." },
      { status: 500 }
    );
  }
}
