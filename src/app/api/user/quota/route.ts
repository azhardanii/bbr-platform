import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserQuotaSummary } from "@/lib/quotaServer";
import { isUserAdmin } from "@/lib/roles";

/**
 * GET /api/user/quota
 * Returns the current quota summary for the logged-in user.
 * Admin users get unlimited (-1) across all features.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    const sessionRole = (session.user as any).role || "free";
    const isAdmin = isUserAdmin(email, sessionRole);
    const role = isAdmin ? "admin" : sessionRole;
    const tier = isAdmin ? "summit" : ((session.user as any).tier || "spark");
    const summary = await getUserQuotaSummary(session.user.id, role);

    return NextResponse.json({ 
      quota: summary, 
      role, 
      isAdmin,
      tier,
    });
  } catch (error) {
    console.error("[GET /api/user/quota]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
