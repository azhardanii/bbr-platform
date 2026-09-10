import { MODELS, generateStreamingText } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { checkServerQuota, consumeServerQuota, logAiUsage } from "@/lib/quotaServer";

export const maxDuration = 30;

export async function POST(req: Request) {
  // Auth
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(
      JSON.stringify({ error: "Silakan login terlebih dahulu." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const userId = session.user.id;
  const role = ((session.user as any).role || "free") as "free" | "member" | "admin";

  // Quota check
  const quotaCheck = await checkServerQuota(userId, role, "scriptWa");
  if (!quotaCheck.allowed) {
    return new Response(
      JSON.stringify({ error: "Kuota Script WA Anda sudah habis. Silakan upgrade atau beli add-on.", quota: quotaCheck }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { prompt } = await req.json();

    const systemInstruction = `Kamu adalah asisten komunikasi profesional yang memahami budaya akademik Indonesia dan etika berkirim pesan kepada dosen melalui WhatsApp.

Prinsip kerja Kamu:
- Gunakan bahasa Indonesia yang sopan, formal, dan tidak berlebihan
- Sesuaikan nada pesan dengan situasi yang dijelaskan
- Jangan gunakan emoji berlebihan - maksimal 1-2 emoji yang relevan
- Pesan harus singkat, padat, dan to-the-point - dosen sibuk
- DILARANG KERAS memberikan teks pengantar atau penutup (seperti "Tentu, ini pesannya...", "Semoga membantu", dll).
- LANGSUNG berikan hasil akhir dengan format terstruktur persis seperti pola di bawah ini, tanpa tambahan apapun:

OPSI_1_START
[Isi pesan opsi 1 bergaya formal]
OPSI_1_END

OPSI_2_START
[Isi pesan opsi 2 bergaya semi-formal]
OPSI_2_END

CATATAN_START
[Isi catatan dan tips waktu pengiriman]
CATATAN_END`;

    const stream = await generateStreamingText({
      model: MODELS.FAST,
      systemInstruction,
      prompt,
    });

    // Consume quota + log
    consumeServerQuota(userId, role, "scriptWa").catch(console.error);
    logAiUsage({ userId, feature: "scriptWa", model: MODELS.FAST }).catch(console.error);

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
