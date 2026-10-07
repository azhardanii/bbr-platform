import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isUserAdmin } from "@/lib/roles";

export type TimeRangeFilter = "today" | "7days" | "this_month" | "last_month" | "3months" | "all";

function getDateFilter(range: TimeRangeFilter): { gte?: Date; lte?: Date } {
  const now = new Date();
  switch (range) {
    case "today": {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      return { gte: start };
    }
    case "7days": {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { gte: start };
    }
    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return { gte: start };
    }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { gte: start, lte: end };
    }
    case "3months": {
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
      return { gte: start };
    }
    case "all":
    default:
      return {};
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const email = session?.user?.email;
    const role = (session?.user as any)?.role;
    const isAdmin = isUserAdmin(email, role);

    if (!session?.user?.id || !isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const range = (searchParams.get("range") || "all") as TimeRangeFilter;
    const search = (searchParams.get("search") || "").toLowerCase().trim();

    const dateFilter = getDateFilter(range);

    // 1. Fetch all users
    const users = await prisma.user.findMany({
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        email: true,
        nama_lengkap: true,
        role: true,
        tier: true,
        payment_ref: true,
        paid_at: true,
        onboarding_completed: true,
        created_at: true,
        updated_at: true,
      },
    });

    const userEmailMap = new Map<string, typeof users[0]>();
    users.forEach((u) => {
      userEmailMap.set(u.email.toLowerCase().trim(), u);
    });

    // 2. Fetch all webhook logs (for user lifetime tracking)
    const allWebhookLogs = await prisma.webhookLog.findMany({
      where: { source: "lynkid" },
      orderBy: { created_at: "desc" },
      take: 500,
    });

    // Webhook logs filtered by time range for current view
    const webhookLogsInPeriod = allWebhookLogs.filter((log) => {
      if (!log.created_at) return true;
      const d = new Date(log.created_at);
      if (dateFilter.gte && d < dateFilter.gte) return false;
      if (dateFilter.lte && d > dateFilter.lte) return false;
      return true;
    });

    // Helper for WhatsApp click-to-chat
    const getWaLink = (phone: string, name: string) => {
      if (!phone || phone === "-") return null;
      let digits = phone.replace(/[^0-9]/g, "");
      if (!digits) return null;
      if (digits.startsWith("0")) digits = "62" + digits.slice(1);
      else if (!digits.startsWith("62")) digits = "62" + digits;
      const text = encodeURIComponent(
        `Halo kak ${name !== "-" ? name : ""}, terima kasih telah bertransaksi di Belajar Bareng Roselini! Jika butuh panduan akses atau ada pertanyaan mengenai tools skripsi, tim kami siap membantu ya kak.`
      );
      return `https://wa.me/${digits}?text=${text}`;
    };

    // 3. Process webhook logs into clean transaction items
    const transactions = webhookLogsInPeriod.map((log) => {
      const payload: any = log.payload || {};
      const msgData = payload?.data?.message_data || payload?.message_data || {};
      const customer = msgData?.customer || {};
      const totals = msgData?.totals || {};
      const items = Array.isArray(msgData?.items) ? msgData.items : [];
      const refId = msgData?.refId || payload?.data?.message_id || log.id;
      const createdAt = log.created_at ? log.created_at.toISOString() : new Date().toISOString();

      const buyerEmail = (customer.email || "").toLowerCase().trim();
      const buyerName = customer.name || "-";
      const buyerPhone = customer.phone || "-";
      const grandTotal = Number(totals.grandTotal ?? totals.totalPrice ?? 0);

      // Check user registration & funneling type
      const registeredUser = buyerEmail ? userEmailMap.get(buyerEmail) : null;
      let buyerType: "converted" | "direct" | "guest" = "direct";

      if (registeredUser) {
        const userCreatedTime = registeredUser.created_at ? new Date(registeredUser.created_at).getTime() : 0;
        const logTime = log.created_at ? new Date(log.created_at).getTime() : 0;
        // If user registered earlier than webhook (e.g. signed up for free first)
        if (userCreatedTime > 0 && logTime - userCreatedTime > 30 * 1000) {
          buyerType = "converted"; // Registered free user who converted to paid
        } else {
          buyerType = "direct"; // Direct checkout (created at or right before payment)
        }
      } else {
        buyerType = "guest"; // Paid via Lynk.id, hasn't signed into app yet
      }

      return {
        id: log.id,
        refId,
        buyerEmail,
        buyerName,
        buyerPhone,
        waLink: getWaLink(buyerPhone, buyerName),
        grandTotal,
        grandTotalFormatted: `Rp ${grandTotal.toLocaleString("id-ID")}`,
        items: items.map((it: any) => ({
          title: it.title || "Produk Digital",
          price: Number(it.price || 0),
          qty: Number(it.qty || 1),
          priceFormatted: `Rp ${Number(it.price || 0).toLocaleString("id-ID")}`,
        })),
        status: log.status || (log.processed ? "processed" : "received"),
        processed: !!log.processed,
        buyerType,
        isRegistered: !!registeredUser,
        registeredUserId: registeredUser?.id || null,
        createdAt,
        rawPayload: payload,
      };
    });

    // 4. Calculate Summary Metrics for the Selected Time Range
    const successfulTx = transactions.filter((t) => t.status === "processed" || t.processed);
    const totalRevenue = successfulTx.reduce((acc, t) => acc + t.grandTotal, 0);

    // Users registered within this period
    const usersInPeriod = users.filter((u) => {
      if (!u.created_at) return true;
      const d = new Date(u.created_at);
      if (dateFilter.gte && d < dateFilter.gte) return false;
      if (dateFilter.lte && d > dateFilter.lte) return false;
      return true;
    });

    const freeUsersInPeriod = usersInPeriod.filter((u) => u.role === "free");

    // All unique buyers across all time
    const allBuyerEmails = new Set(
      allWebhookLogs
        .filter((l) => l.processed || l.status === "processed")
        .map((l) => {
          const p: any = l.payload || {};
          const c = p?.data?.message_data?.customer?.email || p?.message_data?.customer?.email || "";
          return c.toLowerCase().trim();
        })
        .filter(Boolean)
    );

    // Users with paid_at are also buyers
    users.forEach((u) => {
      if (u.paid_at || u.payment_ref) {
        allBuyerEmails.add(u.email.toLowerCase().trim());
      }
    });

    // Converted users: users who were free and have purchased
    const convertedFromFreeUsers = users.filter((u) => {
      const email = u.email.toLowerCase().trim();
      return u.role !== "admin" && allBuyerEmails.has(email);
    });

    const totalFreeEver = users.filter((u) => u.role === "free").length;
    const directTxCount = successfulTx.filter((t) => t.buyerType === "direct").length;
    const convertedTxCount = successfulTx.filter((t) => t.buyerType === "converted").length;

    const conversionRate =
      totalFreeEver + convertedFromFreeUsers.length > 0
        ? ((convertedFromFreeUsers.length / (totalFreeEver + convertedFromFreeUsers.length)) * 100).toFixed(1)
        : "0";

    // 5. Construct User Funnel Directory
    const userFunnelList = users.map((u) => {
      const email = u.email.toLowerCase().trim();
      const userTx = transactions.filter((t) => t.buyerEmail === email && (t.status === "processed" || t.processed));
      const totalSpent = userTx.reduce((acc, t) => acc + t.grandTotal, 0);
      const isBuyer = allBuyerEmails.has(email) || u.role === "member" || !!u.paid_at;

      let funnelStage: "admin" | "converted_paid" | "direct_paid" | "free_active" | "free_new" = "free_new";
      if (u.role === "admin") {
        funnelStage = "admin";
      } else if (isBuyer) {
        // If created earlier or registered before payment
        const hasConvertedTx = userTx.some((t) => t.buyerType === "converted");
        funnelStage = hasConvertedTx || (u.created_at && u.paid_at && new Date(u.paid_at).getTime() - new Date(u.created_at).getTime() > 30000)
          ? "converted_paid"
          : "direct_paid";
      } else if (u.onboarding_completed) {
        funnelStage = "free_active";
      } else {
        funnelStage = "free_new";
      }

      return {
        id: u.id,
        email: u.email,
        name: u.nama_lengkap || "Mahasiswa",
        role: u.role,
        tier: u.tier,
        onboardingCompleted: !!u.onboarding_completed,
        createdAt: u.created_at ? u.created_at.toISOString() : null,
        paidAt: u.paid_at ? u.paid_at.toISOString() : null,
        transactionCount: userTx.length,
        totalSpent,
        totalSpentFormatted: `Rp ${totalSpent.toLocaleString("id-ID")}`,
        funnelStage,
      };
    });

    // 6. Filter by search query if present
    const filteredTransactions = search
      ? transactions.filter(
          (t) =>
            t.buyerEmail.includes(search) ||
            t.buyerName.toLowerCase().includes(search) ||
            t.refId.toLowerCase().includes(search) ||
            t.items.some((it: any) => it.title.toLowerCase().includes(search))
        )
      : transactions;

    const filteredFunnelList = search
      ? userFunnelList.filter(
          (u) =>
            u.email.toLowerCase().includes(search) ||
            u.name.toLowerCase().includes(search)
        )
      : userFunnelList;

    return NextResponse.json({
      summary: {
        timeRange: range,
        totalRevenue,
        totalRevenueFormatted: `Rp ${totalRevenue.toLocaleString("id-ID")}`,
        totalTransactions: successfulTx.length,
        totalSignups: usersInPeriod.length,
        freeUsersCount: freeUsersInPeriod.length,
        totalFreeEver,
        convertedUsersCount: convertedFromFreeUsers.length,
        directPaidCount: directTxCount,
        convertedTxCount,
        conversionRatePct: `${conversionRate}%`,
      },
      transactions: filteredTransactions,
      funnelUsers: filteredFunnelList,
    });
  } catch (error: any) {
    console.error("[GET /api/admin/transactions Error]:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
