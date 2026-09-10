import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        nama_lengkap: true,
        universitas: true,
        jenjang: true,
        jurusan: true,
        semester: true,
        punya_judul: true,
        judul_skripsi: true,
        tier: true,
        role: true,
        onboarding_completed: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("[GET /api/user/onboarding]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const nama_lengkap = body.nama_lengkap || body.namaLengkap;
    const universitas = body.universitas;
    const jenjang = body.jenjang || "S1";
    const jurusan = body.jurusan;
    const semester = body.semester !== undefined ? Number(body.semester) : 8;
    const punya_judul = body.punya_judul !== undefined 
      ? Boolean(body.punya_judul) 
      : body.punyaJudul === "Sudah" || body.punyaJudul === "Ya" || body.punyaJudul === true;
    const judul_skripsi = body.judul_skripsi !== undefined
      ? body.judul_skripsi
      : (punya_judul ? (body.judulSkripsi || body.judulTugasAkhir || null) : null);
    
    // Server-side validation
    if (nama_lengkap && nama_lengkap.trim().length < 2) {
      return NextResponse.json({ error: "Nama lengkap minimal 2 karakter" }, { status: 400 });
    }

    const email = session.user.email.toLowerCase().trim();

    const updatedUser = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        nama_lengkap: nama_lengkap || "Mahasiswa",
        universitas: universitas || "-",
        jenjang,
        jurusan: jurusan || "-",
        semester,
        punya_judul,
        judul_skripsi,
        onboarding_completed: true,
      },
      update: {
        nama_lengkap: nama_lengkap || undefined,
        universitas: universitas || undefined,
        jenjang: jenjang || undefined,
        jurusan: jurusan || undefined,
        semester: semester || undefined,
        punya_judul: punya_judul !== undefined ? punya_judul : undefined,
        judul_skripsi: judul_skripsi !== undefined ? judul_skripsi : undefined,
        onboarding_completed: true,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
