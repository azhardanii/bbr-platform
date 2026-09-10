import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isUserAdmin } from "@/lib/roles";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const email = session?.user?.email;
    const role = (session?.user as any)?.role;
    const isAdmin = isUserAdmin(email, role);

    if (!session?.user?.id || !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const feature = searchParams.get("feature") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const limit = Math.min(Number(searchParams.get("limit") || "100"), 500);
    const page = Math.max(Number(searchParams.get("page") || "1"), 1);

    const where: any = {};
    if (feature) where.feature = feature;
    if (userId) where.user_id = userId;

    const [logs, total, featureStats, userStats] = await Promise.all([
      prisma.aiUsageLog.findMany({
        where,
        orderBy: { created_at: "desc" },
        take: limit,
        skip: (page - 1) * limit,
        include: {
          user: {
            select: { id: true, email: true, nama_lengkap: true, role: true },
          },
        },
      }),
      prisma.aiUsageLog.count({ where }),
      // Feature usage summary
      prisma.aiUsageLog.groupBy({
        by: ["feature"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      // Top users summary
      prisma.aiUsageLog.groupBy({
        by: ["user_id"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
    ]);

    return NextResponse.json({ logs, total, featureStats, userStats, page, limit });
  } catch (error) {
    console.error("[GET /api/admin/monitoring]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
