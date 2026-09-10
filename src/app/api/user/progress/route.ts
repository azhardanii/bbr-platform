import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/user/progress: Get bab progress percentages and checklist items for authenticated user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const babProgress = await prisma.babProgress.findMany({
      where: { user_id: user.id },
      orderBy: { bab: "asc" },
    });

    const checklistProgress = await prisma.checklistProgress.findMany({
      where: { user_id: user.id },
    });

    return NextResponse.json({
      success: true,
      progress: babProgress.map((p) => ({ bab: p.bab, percentage: p.percentage ?? 0 })),
      checklists: checklistProgress.map((c) => ({ bab: c.bab, itemId: c.item_id, checked: c.checked ?? false })),
    });
  } catch (error: any) {
    console.error("[Progress GET Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/user/progress: Update bab progress or checklist item strictly for authenticated user
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();

    // Batch update of bab milestones/progress
    if (Array.isArray(body.progressList)) {
      for (const item of body.progressList) {
        if (item.bab === undefined) continue;
        await prisma.babProgress.upsert({
          where: {
            user_id_bab: {
              user_id: user.id,
              bab: Number(item.bab),
            },
          },
          create: {
            user_id: user.id,
            bab: Number(item.bab),
            percentage: Number(item.percentage || 0),
          },
          update: {
            percentage: Number(item.percentage || 0),
            updated_at: new Date(),
          },
        });
      }
      return NextResponse.json({ success: true });
    }

    // Single Bab percentage update
    if (body.bab !== undefined && body.percentage !== undefined) {
      const updated = await prisma.babProgress.upsert({
        where: {
          user_id_bab: {
            user_id: user.id,
            bab: Number(body.bab),
          },
        },
        create: {
          user_id: user.id,
          bab: Number(body.bab),
          percentage: Number(body.percentage),
        },
        update: {
          percentage: Number(body.percentage),
          updated_at: new Date(),
        },
      });
      return NextResponse.json({ success: true, item: updated });
    }

    // Checklist item update
    if (body.bab !== undefined && body.itemId && body.checked !== undefined) {
      const updatedChecklist = await prisma.checklistProgress.upsert({
        where: {
          user_id_bab_item_id: {
            user_id: user.id,
            bab: Number(body.bab),
            item_id: String(body.itemId),
          },
        },
        create: {
          user_id: user.id,
          bab: Number(body.bab),
          item_id: String(body.itemId),
          checked: Boolean(body.checked),
        },
        update: {
          checked: Boolean(body.checked),
          updated_at: new Date(),
        },
      });
      return NextResponse.json({ success: true, item: updatedChecklist });
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (error: any) {
    console.error("[Progress POST Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
