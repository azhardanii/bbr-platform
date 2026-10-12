import { MODELS, ai } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { checkServerQuota, consumeServerQuota, logAiUsage } from "@/lib/quotaServer";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
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

    // Quota check — bibliometrik uses sitasi quota
    const quotaCheck = await checkServerQuota(userId, role, "sitasi");
    if (!quotaCheck.allowed) {
      return new Response(
        JSON.stringify({ error: "Kuota Bibliometrik Anda sudah habis. Silakan upgrade atau beli add-on.", quota: quotaCheck }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const { prompt } = await req.json();

    const systemInstruction = `Kamu adalah peneliti senior (Professor) yang ahli dalam bibliometrik, systematic literature review, dan pemetaan trend penelitian.
Kamu WAJIB merespons HANYA dengan format JSON valid murni tanpa markdown \`\`\`json.
Struktur JSON yang harus dikembalikan secara utuh:
{
  "analysis": "Penjelasan format markdown tentang tren penelitian, minimal 3 research gap spesifik, dan 3 future research directions. Buat dengan sangat rapi dan akademis.",
  "graph": {
    "nodes": [
      { "id": "topikutama", "group": 1, "size": 30, "label": "Topik Utama" },
      { "id": "subtopik1", "group": 2, "size": 15, "label": "Sub Topik 1" }
    ],
    "links": [
      { "source": "topikutama", "target": "subtopik1", "value": 5 }
    ]
  }
}
Syarat Graph (Penting agar Visualisasi Tidak Error):
- Buat minimal 12 nodes (kata kunci penelitian) dengan property 'size' (angka 10-40, menunjukkan kemunculan).
- Buat minimal 15 links (hubungan antar kata kunci) dengan property 'value' (angka 1-10, menunjukkan kekuatan hubungan).
- Pastikan semua 'id' pada node adalah string unik (huruf kecil tanpa spasi disarankan).
- Pastikan setiap 'source' dan 'target' pada link PERSIS sama dengan salah satu 'id' di array nodes.`;

    const interaction = await ai.interactions.create({
      model: MODELS.FAST_LIGHT,
      system_instruction: systemInstruction,
      input: prompt,
    });

    const textOutput = interaction.output_text || "{}";
    let jsonResult: any = null;
    const clean = textOutput.replace(/```json/gi, "").replace(/```/g, "").trim();

    try {
      jsonResult = JSON.parse(clean);
    } catch (_) {
      const firstBrace = clean.indexOf("{");
      const lastBrace = clean.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
          jsonResult = JSON.parse(clean.substring(firstBrace, lastBrace + 1));
        } catch (_) {}
      }
    }

    if (!jsonResult || typeof jsonResult !== "object" || !jsonResult.analysis) {
      console.warn("[/api/ai/bibliometrik] Failed to parse JSON graph analysis:", textOutput);
      return new Response(
        JSON.stringify({ error: "Sistem gagal mengurai data analisis bibliometrik AI. Silakan coba kembali." }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // Consume quota + log (fire-and-forget)
    consumeServerQuota(userId, role, "sitasi").catch(console.error);
    logAiUsage({ userId, feature: "sitasi", model: MODELS.FAST_LIGHT }).catch(console.error);

    return new Response(JSON.stringify(jsonResult), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("AI Error in /api/ai/bibliometrik:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Gagal menghasilkan respons AI. Silakan coba lagi." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
