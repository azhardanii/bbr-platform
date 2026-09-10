/**
 * src/lib/withQuota.ts
 * Higher-order helper to wrap AI API route handlers with quota enforcement + usage logging.
 * Usage:
 *   export const POST = withQuota("parafrase", async (req) => { ... });
 */

import { auth } from "@/lib/auth";
import { checkServerQuota, consumeServerQuota, logAiUsage } from "@/lib/quotaServer";
import { FeatureKey } from "@/lib/quota";

type Handler = (req: Request, context: { userId: string; role: string }) => Promise<Response>;

export function withQuota(feature: FeatureKey, handler: Handler) {
  return async function POST(req: Request): Promise<Response> {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Silakan login terlebih dahulu." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const userId = session.user.id;
    const role = ((session.user as any).role || "free") as "free" | "member" | "admin";

    // 2. Quota check
    const quotaCheck = await checkServerQuota(userId, role, feature);
    if (!quotaCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: "Kuota Anda untuk fitur ini sudah habis.",
          quota: {
            used: quotaCheck.used,
            limit: quotaCheck.limit,
            remaining: 0,
            feature,
          },
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Execute the actual handler
    const response = await handler(req, { userId, role });

    // 4. If successful (2xx), consume quota and log usage
    if (response.ok) {
      await consumeServerQuota(userId, role, feature);
      await logAiUsage({ userId, feature });
    }

    return response;
  };
}
