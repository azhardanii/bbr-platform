import { NextResponse } from "next/server";
import { ai, MODELS } from "@/lib/ai";
import { auth } from "@/lib/auth";

// keywords is a lightweight utility (used inside tools), no quota deduction needed
// but requires authentication
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const { judul } = await req.json();

    if (!judul) {
      return NextResponse.json({ error: "Judul is required" }, { status: 400 });
    }

    const systemInstruction = `Kamu adalah ahli bibliometrik. Ekstrak maksimal 5 kata kunci utama (keywords) penelitian dari judul skripsi/tesis/disertasi yang diberikan. 
Format keluaran HANYA berupa kata kunci yang dipisahkan koma, tanpa tambahan kata lain. Contoh: Green Accounting, Profitabilitas, Kinerja Perusahaan`;

    const response = await ai.interactions.create({
      model: MODELS.FAST,
      input: judul,
      system_instruction: systemInstruction,
    });

    return NextResponse.json({ keywords: response.output_text });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Gagal mengekstrak kata kunci" }, { status: 500 });
  }
}
