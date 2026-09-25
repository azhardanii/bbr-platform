import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/workspace: Fetch the active document, outline structure, and bab contents for current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find authenticated user in database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the user's active document
    let document = await prisma.document.findFirst({
      where: { user_id: user.id },
      include: {
        outlines: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!document) {
      // Create initial document for user
      const docType = (user.jenjang || "S1").toLowerCase() === "s2" ? "tesis" : (user.jenjang || "S1").toLowerCase() === "s3" ? "disertasi" : "skripsi";
      document = await prisma.document.create({
        data: {
          user_id: user.id,
          title: user.judul_skripsi || `Draf ${user.jenjang || "S1"} Tugas Akhir`,
          type: docType,
        },
        include: {
          outlines: true,
        },
      });
    }

    // If document has no outlines yet, auto-populate Bab I - V in database
    if (document.outlines.length === 0) {
      const defaultChapters = [
        { order: 0, title: "BAB I PENDAHULUAN", content: "<p>Mulai menulis draf bab i pendahuluan di sini...</p>" },
        { order: 1, title: "BAB II TINJAUAN PUSTAKA", content: "<p>Mulai menulis draf bab ii tinjauan pustaka di sini...</p>" },
        { order: 2, title: "BAB III METODOLOGI PENELITIAN", content: "<p>Mulai menulis draf bab iii metodologi penelitian di sini...</p>" },
        { order: 3, title: "BAB IV HASIL DAN PEMBAHASAN", content: "<p>Mulai menulis draf bab iv hasil dan pembahasan di sini...</p>" },
        { order: 4, title: "BAB V KESIMPULAN DAN SARAN", content: "<p>Mulai menulis draf bab v kesimpulan dan saran di sini...</p>" },
      ];

      for (const chap of defaultChapters) {
        const o = await prisma.outline.create({
          data: {
            document_id: document.id,
            title: chap.title,
            order: chap.order,
            content: chap.content,
          },
        });
        document.outlines.push(o as any);
      }
    }

    // Parse outline and contents
    const contents: Record<string, string> = {};
    const outlineItems: any[] = [];

    // Map outlines into parent and children structure
    const parents = document.outlines.filter((o) => !o.parent_id);
    for (const p of parents) {
      if (p.content) contents[p.id] = p.content;
      const children = document.outlines
        .filter((c) => c.parent_id === p.id)
        .map((c) => {
          if (c.content) contents[c.id] = c.content;
          return { id: c.id, title: c.title };
        });

      outlineItems.push({
        id: p.id,
        title: p.title,
        isOpen: true,
        children,
      });
    }

    return NextResponse.json({
      success: true,
      documentId: document.id,
      title: document.title,
      type: document.type,
      outline: outlineItems,
      contents,
    });
  } catch (error: any) {
    console.error("[Workspace API GET Error]:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

import { randomUUID } from "crypto";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ensureUUID = (id: string | undefined): string => {
  if (id && UUID_REGEX.test(id)) return id;
  return randomUUID();
};

// POST /api/workspace: Save/sync document outline and bab contents strictly for authenticated user
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
    const { title, outline, contents } = body;

    // Find or create document
    let document = await prisma.document.findFirst({
      where: { user_id: user.id },
    });

    if (!document) {
      document = await prisma.document.create({
        data: {
          user_id: user.id,
          title: title || user.judul_skripsi || "Naskah Tugas Akhir",
          type: (user.jenjang || "S1").toLowerCase() === "s2" ? "tesis" : (user.jenjang || "S1").toLowerCase() === "s3" ? "disertasi" : "skripsi",
        },
      });
    } else if (title && title !== document.title) {
      await prisma.document.update({
        where: { id: document.id },
        data: { title, updated_at: new Date() },
      });
    }

    // Save outline items & chapter contents transactionally
    const activeOutlineIds: string[] = [];
    if (Array.isArray(outline) && outline.length > 0) {
      // Process each parent Bab
      for (let i = 0; i < outline.length; i++) {
        const bab = outline[i];
        const babId = ensureUUID(bab.id);
        activeOutlineIds.push(babId);
        const babContent = (contents && (contents[bab.id] || contents[babId])) || null;

        // Upsert parent outline
        const parentOutline = await prisma.outline.upsert({
          where: { id: babId },
          create: {
            id: babId,
            document_id: document.id,
            title: bab.title,
            order: i,
            content: babContent,
            parent_id: null,
          },
          update: {
            title: bab.title,
            order: i,
            content: babContent,
            updated_at: new Date(),
          },
        });

        // Upsert children sub-babs
        if (Array.isArray(bab.children)) {
          for (let j = 0; j < bab.children.length; j++) {
            const sub = bab.children[j];
            const subId = ensureUUID(sub.id);
            activeOutlineIds.push(subId);
            const subContent = (contents && (contents[sub.id] || contents[subId])) || null;

            await prisma.outline.upsert({
              where: { id: subId },
              create: {
                id: subId,
                document_id: document.id,
                title: sub.title,
                order: j,
                content: subContent,
                parent_id: parentOutline.id,
              },
              update: {
                title: sub.title,
                order: j,
                content: subContent,
                updated_at: new Date(),
              },
            });
          }
        }
      }

      // Delete removed outlines that are no longer part of this document
      if (activeOutlineIds.length > 0) {
        await prisma.outline.deleteMany({
          where: {
            document_id: document.id,
            id: { notIn: activeOutlineIds },
          },
        });
      }
    }

    return NextResponse.json({ success: true, documentId: document.id });
  } catch (error: any) {
    console.error("[Workspace API POST Error]:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
