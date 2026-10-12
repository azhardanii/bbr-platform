import { MODELS, ai } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { checkServerQuota, consumeServerQuota, logAiUsage } from "@/lib/quotaServer";

export const maxDuration = 60;

// Robust JSON array extraction and normalization helper
function extractJudulArray(rawText: string): Array<{ judul: string; deskripsi: string; referensi: string[] }> {
  if (!rawText) return [];

  const clean = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

  // 1. Try direct parse
  try {
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return normalizeJudulList(parsed);
    }
    if (parsed && typeof parsed === "object") {
      const candidate = (parsed as any).data || (parsed as any).results || (parsed as any).judul || (parsed as any).alternatif;
      if (Array.isArray(candidate) && candidate.length > 0) {
        return normalizeJudulList(candidate);
      }
    }
  } catch (_) {}

  // 2. Try extracting array between first '[' and last ']'
  const firstBracket = clean.indexOf("[");
  const lastBracket = clean.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      const slice = clean.substring(firstBracket, lastBracket + 1);
      const parsed = JSON.parse(slice);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return normalizeJudulList(parsed);
      }
    } catch (_) {}
  }

  // 3. Try regex matching individual JSON objects { ... "judul": ... }
  try {
    const objectRegex = /\{[\s\S]*?"judul"\s*:\s*[\s\S]*?\}/g;
    const matches = clean.match(objectRegex);
    if (matches && matches.length > 0) {
      const items: any[] = [];
      for (const m of matches) {
        try {
          const item = JSON.parse(m);
          if (item && item.judul) items.push(item);
        } catch (_) {}
      }
      if (items.length > 0) {
        return normalizeJudulList(items);
      }
    }
  } catch (_) {}

  return [];
}

function normalizeJudulList(items: any[]): Array<{ judul: string; deskripsi: string; referensi: string[] }> {
  return items.map((item, idx) => {
    const judul = typeof item?.judul === "string" ? item.judul.trim() : `Alternatif Judul ${idx + 1}`;
    const deskripsi = typeof item?.deskripsi === "string" 
      ? item.deskripsi.trim() 
      : typeof item?.alasan === "string" 
        ? item.alasan.trim() 
        : "Judul penelitian yang relevan dan memenuhi kaidah akademis.";
    
    let referensi: string[] = [];
    if (Array.isArray(item?.referensi)) {
      referensi = item.referensi.map((r: any) => String(r).trim()).filter(Boolean);
    } else if (typeof item?.referensi === "string") {
      referensi = [item.referensi.trim()];
    }

    if (referensi.length === 0) {
      referensi = [
        "Jurnal Penelitian Terkait (Terindeks SINTA/Scopus)",
        "Buku Metodologi Penelitian Akademik Terkini",
      ];
    }

    return { judul, deskripsi, referensi };
  });
}

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

    // Quota check
    const quotaCheck = await checkServerQuota(userId, role, "judulFinder");
    if (!quotaCheck.allowed) {
      return new Response(
        JSON.stringify({ error: "Kuota Judul Finder Anda sudah habis. Silakan upgrade atau beli add-on.", quota: quotaCheck }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

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
      model: MODELS.FAST_LIGHT,
      system_instruction: systemInstruction,
      input: prompt,
    });

    const textOutput = interaction.output_text || "";
    const results = extractJudulArray(textOutput);

    if (results.length === 0) {
      console.warn("[/api/ai/judul] Failed to parse JSON array from raw text:", textOutput);
      return new Response(
        JSON.stringify({ error: "Sistem gagal mengurai format judul AI. Silakan coba kembali." }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // Consume quota + log (fire-and-forget)
    consumeServerQuota(userId, role, "judulFinder").catch(console.error);
    logAiUsage({ userId, feature: "judulFinder", model: MODELS.FAST_LIGHT }).catch(console.error);

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("AI Error in /api/ai/judul:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Gagal menghasilkan respons AI. Silakan coba lagi." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
