import { MODELS, generateStreamingText } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { checkServerQuota, consumeServerQuota, logAiUsage } from "@/lib/quotaServer";

export const maxDuration = 60;

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
  const quotaCheck = await checkServerQuota(userId, role, "parafrase");
  if (!quotaCheck.allowed) {
    return new Response(
      JSON.stringify({ error: "Kuota Parafrase AI Anda sudah habis. Silakan upgrade atau beli add-on.", quota: quotaCheck }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { prompt } = await req.json();

    const systemInstruction = `Kamu adalah editor jurnal akademik profesional dengan keahlian tinggi dalam memparafrase teks ilmiah berbahasa Indonesia. Kamu memahami standar penulisan akademik Indonesia (PUEBI, EYD) dan cara kerja sistem deteksi plagiasi seperti Turnitin.\n\nPrinsip kerja Kamu:\n- UBAH STRUKTUR KALIMAT secara signifikan - bukan sekadar ganti sinonim\n- Pertahankan makna, data/angka, dan referensi sitasi dengan akurat\n- Gunakan variasi struktur: aktif→pasif, kalimat majemuk→tunggal, atau sebaliknya\n- Pastikan hasil parafrase tetap koheren dan natural dibaca\n- Jangan hilangkan istilah teknis yang memang harus dipertahankan\n- Berikan 2 alternatif hasil parafrase agar user bisa memilih\n- Format output menggunakan markdown yang rapi\n- Sertakan catatan singkat tentang perubahan struktur yang dilakukan`;

    const stream = await generateStreamingText({
      model: MODELS.CREATIVE,
      systemInstruction,
      prompt,
    });

    // Consume quota + log (fire-and-forget, non-blocking)
    consumeServerQuota(userId, role, "parafrase").catch(console.error);
    logAiUsage({ userId, feature: "parafrase", model: MODELS.CREATIVE }).catch(console.error);

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
