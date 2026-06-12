import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Server-side simple validation
    if (!body.nama_lengkap || !body.universitas || !body.jurusan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        nama_lengkap: body.nama_lengkap,
        universitas: body.universitas,
        jenjang: body.jenjang,
        jurusan: body.jurusan,
        semester: Number(body.semester),
        punya_judul: body.punya_judul,
        judul_skripsi: body.punya_judul ? body.judul_skripsi : null,
        preferred_ai: body.preferred_ai,
        onboarding_completed: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
