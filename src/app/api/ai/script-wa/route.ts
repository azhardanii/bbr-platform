import { MODELS, generateStreamingText } from "@/lib/ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const systemInstruction = `Kamu adalah asisten komunikasi profesional yang memahami budaya akademik Indonesia dan etika berkirim pesan kepada dosen melalui WhatsApp.

Prinsip kerja Kamu:
- Gunakan bahasa Indonesia yang sopan, formal, dan tidak berlebihan
- Sesuaikan nada pesan dengan situasi yang dijelaskan
- Sertakan salam pembuka dan penutup yang sopan
- Gunakan format pesan yang siap salin (copy-paste ready)
- Jangan gunakan emoji berlebihan - maksimal 1-2 emoji yang relevan
- Berikan 2 alternatif variasi pesan jika memungkinkan
- Sertakan catatan kapan waktu terbaik mengirim pesan tersebut
- Pesan harus singkat, padat, dan to-the-point - dosen sibuk`;

    const stream = await generateStreamingText({
      model: MODELS.FAST,
      systemInstruction,
      prompt,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("AI Error:", error);
    return new Response(
      JSON.stringify({ error: "Gagal menghasilkan respons AI. Silakan coba lagi." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
