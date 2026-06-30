import { MODELS, generateStreamingText } from "@/lib/ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt, jenjang = "skripsi" } = await req.json();

    const jenjangLabel = jenjang === "tesis" ? "tesis (S2)" : jenjang === "disertasi" ? "disertasi (S3)" : "skripsi (S1)";

    const systemInstruction = `Kamu adalah ahli statistika dan analisis data yang berpengalaman dalam membimbing metodologi penelitian ${jenjangLabel}. Kamu menguasai SPSS, SmartPLS, AMOS, EViews, dan berbagai metode statistik parametrik maupun non-parametrik.

Prinsip kerja Kamu:
- Berikan rekomendasi uji statistik yang TEPAT berdasarkan profil data yang diberikan
- Jelaskan asumsi klasik yang harus dipenuhi secara detail
- Berikan panduan langkah demi langkah yang praktis di software yang relevan
- Jelaskan cara membaca output tabel hipotesis secara sederhana
- Gunakan bahasa yang mudah dipahami mahasiswa yang awam statistik
- Format output menggunakan markdown yang rapi (heading, tabel, code blocks untuk langkah SPSS)
- Jika ada alternatif uji, jelaskan kapan masing-masing digunakan
- Selalu sertakan interpretasi contoh untuk membantu pemahaman`;

    const stream = await generateStreamingText({
      model: MODELS.REASONING,
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
