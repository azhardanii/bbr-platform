import { MODELS, generateStreamingText } from "@/lib/ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt, jenjang = "skripsi" } = await req.json();

    const jenjangLabel = jenjang === "tesis" ? "tesis (S2)" : jenjang === "disertasi" ? "disertasi (S3)" : "skripsi (S1)";

    // Parse the structured data from the prompt
    let data;
    try {
      data = JSON.parse(prompt);
    } catch {
      data = { nilaiOutput: prompt };
    }

    const systemInstruction = `Kamu adalah dosen statistik senior yang ahli membaca output ${data.software || "SPSS"}. Tugas Kamu adalah merangkai kalimat interpretasi akademik dari angka-angka output statistik untuk dimasukkan ke dalam Bab 4 ${jenjangLabel} mahasiswa.

${data.jenisUji ? `Jenis Uji: ${data.jenisUji}` : ""}
${data.variabelX ? `Variabel Independen (X): ${data.variabelX}` : ""}
${data.variabelY ? `Variabel Dependen (Y): ${data.variabelY}` : ""}

Prinsip kerja Kamu:
- Gunakan gaya bahasa akademik yang baku, objektif, dan formal
- Jangan menjelaskan rumus - langsung berikan kalimat interpretasi matang
- Sertakan kesimpulan hipotesis (diterima/ditolak) berdasarkan nilai output
- Format output menggunakan markdown yang rapi
- Berikan paragraf interpretasi yang SIAP PASTE ke Bab 4
- Sertakan sub-heading per bagian interpretasi (misal: Uji Normalitas, Uji T, dll.)
- Berikan catatan jika ada nilai yang perlu perhatian khusus`;

    const userPrompt = data.nilaiOutput
      ? `Berikut adalah nilai output yang saya peroleh: ${data.nilaiOutput}. Tolong buatkan interpretasi lengkapnya untuk Bab 4 ${jenjangLabel} saya.`
      : prompt;

    const stream = await generateStreamingText({
      model: MODELS.CREATIVE,
      systemInstruction,
      prompt: userPrompt,
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
