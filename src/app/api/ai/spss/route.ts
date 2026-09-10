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
  const quotaCheck = await checkServerQuota(userId, role, "spss");
  if (!quotaCheck.allowed) {
    return new Response(
      JSON.stringify({ error: "Kuota SPSS Interpreter Anda sudah habis. Silakan upgrade atau beli add-on.", quota: quotaCheck }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { prompt, jenjang = "skripsi" } = await req.json();

    const jenjangLabel = jenjang === "tesis" ? "tesis (S2)" : jenjang === "disertasi" ? "disertasi (S3)" : "skripsi (S1)";

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

    // Consume quota + log
    consumeServerQuota(userId, role, "spss").catch(console.error);
    logAiUsage({ userId, feature: "spss", model: MODELS.CREATIVE }).catch(console.error);

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
