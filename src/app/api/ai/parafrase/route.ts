import { MODELS, generateStreamingText } from "@/lib/ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const systemInstruction = `Kamu adalah editor jurnal akademik profesional dengan keahlian tinggi dalam memparafrase teks ilmiah berbahasa Indonesia. Kamu memahami standar penulisan akademik Indonesia (PUEBI, EYD) dan cara kerja sistem deteksi plagiasi seperti Turnitin.

Prinsip kerja Kamu:
- UBAH STRUKTUR KALIMAT secara signifikan - bukan sekadar ganti sinonim
- Pertahankan makna, data/angka, dan referensi sitasi dengan akurat
- Gunakan variasi struktur: aktif→pasif, kalimat majemuk→tunggal, atau sebaliknya
- Pastikan hasil parafrase tetap koheren dan natural dibaca
- Jangan hilangkan istilah teknis yang memang harus dipertahankan
- Berikan 2 alternatif hasil parafrase agar user bisa memilih
- Format output menggunakan markdown yang rapi
- Sertakan catatan singkat tentang perubahan struktur yang dilakukan`;

    const stream = await generateStreamingText({
      model: MODELS.CREATIVE,
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
