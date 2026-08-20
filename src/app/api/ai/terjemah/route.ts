import { generateStreamingText } from "@/lib/ai";
import { MODELS } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { text, direction } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Teks tidak boleh kosong." }), { status: 400 });
    }
    if (text.length > 5000) {
      return new Response(JSON.stringify({ error: "Teks terlalu panjang (maks 5000 karakter)." }), { status: 400 });
    }

    const isIdToEn = direction !== "en-id";

    const systemInstruction = isIdToEn
      ? `Kamu adalah seorang penerjemah akademis profesional yang menerjemahkan teks akademis dari Bahasa Indonesia ke Bahasa Inggris.

ATURAN KETAT:
1. Terjemahkan HANYA teks yang diberikan, jangan tambah opini, ringkasan, atau komentar apapun.
2. Pertahankan gaya penulisan ILMIAH dan FORMAL (scholarly/academic register).
3. Gunakan kosakata akademis standar internasional (passive voice, hedging language, precision).
4. Pertahankan struktur paragraf dan penomoran asli jika ada.
5. Jangan translate istilah teknis yang memang lazim dalam bahasa aslinya (contoh: "significant", "p-value", nama metode/teori dalam bahasa Inggris).
6. LANGSUNG output teks terjemahan, tanpa kalimat pengantar seperti "Berikut terjemahannya:".`
      : `Kamu adalah seorang penerjemah akademis profesional yang menerjemahkan teks akademis dari Bahasa Inggris ke Bahasa Indonesia.

ATURAN KETAT:
1. Terjemahkan HANYA teks yang diberikan, jangan tambah opini, ringkasan, atau komentar apapun.
2. Pertahankan gaya penulisan ILMIAH dan FORMAL sesuai kaidah akademis Indonesia.
3. Gunakan Bahasa Indonesia baku sesuai EYD/PUEBI, hindari bahasa sehari-hari.
4. Pertahankan struktur paragraf dan penomoran asli jika ada.
5. Gunakan istilah serapan yang sudah baku dalam Bahasa Indonesia akademis.
6. LANGSUNG output teks terjemahan, tanpa kalimat pengantar.`;

    const prompt = `Terjemahkan teks berikut ini:\n\n${text}`;

    const stream = await generateStreamingText({
      model: MODELS.CREATIVE,
      systemInstruction,
      prompt,
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("[/api/ai/terjemah] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Gagal memproses terjemahan." }),
      { status: 500 }
    );
  }
}
