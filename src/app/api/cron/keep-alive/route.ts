import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/cron/keep-alive
 * Automated Heartbeat / Keep-Alive endpoint for Supabase PostgreSQL.
 *
 * Runs a lightweight query to maintain active database traffic and prevent
 * Supabase Free Tier projects from automatically pausing after 7 days of inactivity.
 *
 * Can be triggered via:
 * 1. Vercel Cron Jobs (configured in vercel.json)
 * 2. External free pingers (e.g. cron-job.org, UptimeRobot)
 */
export async function GET(req: Request) {
  const startTime = Date.now();
  try {
    // Check authorization if CRON_SECRET is configured
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // If a secret is set and does not match, return 401
      return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
    }

    // Lightweight query that exercises the PostgreSQL engine & connection pooler
    const userCount = await prisma.user.count();
    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      service: "BBR Supabase Keep-Alive",
      status: "active",
      timestamp: new Date().toISOString(),
      durationMs,
      stats: {
        totalUsers: userCount,
      },
    });
  } catch (error: any) {
    console.error("[Keep-Alive Cron Error]:", error);
    return NextResponse.json(
      {
        success: false,
        service: "BBR Supabase Keep-Alive",
        status: "error",
        error: error.message || "Database connection error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
