import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/user/sync: One-time migration/hydration of any local data to user's database record
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
    const { onboarding, outline, contents, citations, progress } = body;

    // 1. Sync onboarding profile if user doesn't have it completed in DB yet
    if (onboarding && !user.onboarding_completed) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          nama_lengkap: onboarding.namaLengkap || user.nama_lengkap,
          universitas: onboarding.universitas || user.universitas,
          jenjang: onboarding.jenjang || user.jenjang || "S1",
          jurusan: onboarding.jurusan || user.jurusan,
          semester: onboarding.semester ? Number(onboarding.semester) : user.semester,
          punya_judul: onboarding.punyaJudul === "Sudah" || Boolean(onboarding.punyaJudul),
          judul_skripsi: onboarding.judulSkripsi || user.judul_skripsi,
          onboarding_completed: true,
        },
      });
    }

    // 2. Sync Document & Outlines if user has no document yet
    if (Array.isArray(outline) && outline.length > 0) {
      let doc = await prisma.document.findFirst({
        where: { user_id: user.id },
      });

      if (!doc) {
        doc = await prisma.document.create({
          data: {
            user_id: user.id,
            title: user.judul_skripsi || "Naskah Tugas Akhir",
            type: (user.jenjang || "S1").toLowerCase() === "s2" ? "tesis" : (user.jenjang || "S1").toLowerCase() === "s3" ? "disertasi" : "skripsi",
          },
        });

        for (let i = 0; i < outline.length; i++) {
          const bab = outline[i];
          const babContent = contents ? contents[bab.id] : null;

          const pOutline = await prisma.outline.create({
            data: {
              id: bab.id,
              document_id: doc.id,
              title: bab.title,
              order: i,
              content: babContent,
            },
          });

          if (Array.isArray(bab.children)) {
            for (let j = 0; j < bab.children.length; j++) {
              const sub = bab.children[j];
              const subContent = contents ? contents[sub.id] : null;
              await prisma.outline.create({
                data: {
                  id: sub.id,
                  document_id: doc.id,
                  title: sub.title,
                  order: j,
                  content: subContent,
                  parent_id: pOutline.id,
                },
              });
            }
          }
        }
      }
    }

    // 3. Sync citations
    if (Array.isArray(citations) && citations.length > 0) {
      const existingRefs = await prisma.reference.count({ where: { user_id: user.id } });
      if (existingRefs === 0) {
        for (const cit of citations) {
          if (!cit.title) continue;
          await prisma.reference.create({
            data: {
              id: cit.id || undefined,
              user_id: user.id,
              type: cit.type || "journal",
              title: cit.title,
              authors: cit.authors || "",
              year: cit.year || "",
              source: cit.source || "",
              doi_url: cit.doi_url || "",
            },
          });
        }
      }
    }

    // Return the authoritative user profile from database
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    return NextResponse.json({
      success: true,
      user: freshUser,
    });
  } catch (error: any) {
    console.error("[Sync API Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
