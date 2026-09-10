import { MODELS, ai } from "@/lib/ai";
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
  const quotaCheck = await checkServerQuota(userId, role, "judulFinder");
  if (!quotaCheck.allowed) {
    return new Response(
      JSON.stringify({ error: "Kuota Judul Finder Anda sudah habis. Silakan upgrade atau beli add-on.", quota: quotaCheck }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { prompt, jenjang = "skripsi" } = await req.json();

    const jenjangLabel = jenjang === "tesis" ? "tesis (S2)" : jenjang === "disertasi" ? "disertasi (S3)" : "skripsi (S1)";

    const systemInstruction = `Kamu adalah konsultan akademik senior yang sangat berpengalaman dalam membimbing mahasiswa menyusun judul ${jenjangLabel} di Indonesia.
Kamu HANYA BOLEH merespons dalam format JSON array murni tanpa format markdown \`\`\`json.
Setiap objek dalam array JSON mewakili satu ide judul penelitian dan WAJIB memiliki properti berikut:
1. "judul" (string): Rumusan judul yang spesifik, tidak lebih dari 15 kata.
2. "deskripsi" (string): Alasan mengapa judul relevan, variabel utama (X dan Y), serta metode yang disarankan.
3. "referensi" (array of string): WAJIB berisi MINIMAL 5 referensi jurnal/buku akademik valid (judul, penulis, tahun) yang relevan dengan judul.

Contoh format respons:
[
  {
    "judul": "Pengaruh X terhadap Y",
    "deskripsi": "Penelitian ini relevan karena... Metode kuantitatif.",
    "referensi": ["Jurnal A (2023)", "Jurnal B (2022)", "Buku C (2021)", "Buku D (2020)", "Jurnal E (2024)"]
  }
]`;

    const interaction = await ai.interactions.create({
      model: MODELS.REASONING,
      system_instruction: systemInstruction,
      input: prompt,
    });

    const textOutput = interaction.output_text || "[]";
    const cleanJson = textOutput.replace(/```json/g, "").replace(/```/g, "").trim();

    // Consume quota + log
    consumeServerQuota(userId, role, "judulFinder").catch(console.error);
    logAiUsage({ userId, feature: "judulFinder", model: MODELS.REASONING }).catch(console.error);

    return new Response(cleanJson, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Error:", error);
    return new Response(
      JSON.stringify({ error: "Gagal menghasilkan respons AI. Silakan coba lagi." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
