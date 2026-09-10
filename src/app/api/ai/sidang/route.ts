import { MODELS, generateStreamingChat, generateText } from "@/lib/ai";
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

  // Quota check — only count the FIRST message in a session (session initiation)
  const { messages, systemInstruction } = await req.json();
  const isFirstMessage = messages.filter((m: any) => m.role !== "system").length === 1;

  if (isFirstMessage) {
    const quotaCheck = await checkServerQuota(userId, role, "sidang");
    if (!quotaCheck.allowed) {
      return new Response(
        JSON.stringify({ error: "Kuota Simulator Sidang Anda sudah habis. Silakan upgrade atau beli add-on.", quota: quotaCheck }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  try {
    const genaiMessages = messages
      .filter((m: any) => m.role !== "system")
      .map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        content: m.content,
      }));

    let modelToUse: string = MODELS.REASONING;

    if (genaiMessages.length > 1) {
      const latestUserMessage = genaiMessages[genaiMessages.length - 1].content;
      const classificationPrompt = `Evaluasi tingkat kerumitan (complexity) dari jawaban mahasiswa berikut ini dalam simulasi sidang skripsi.
Jawaban Mahasiswa: "${latestUserMessage}"

Kategori:
- LOW: Sangat singkat, hanya berisi persetujuan (contoh: "Baik pak", "Siap"), sapaan ringan, atau jawaban yang sangat dangkal tanpa penjelasan.
- MEDIUM: Penjelasan sedang, argumen standar, panjang kalimat wajar (agak deep).
- HIGH: Analisis mendalam, argumen kompleks, menantang penguji, atau rincian metodologi/teori yang sangat detail (memang deep).

Berikan respons HANYA SATU KATA saja: LOW, MEDIUM, atau HIGH.`;

      try {
        const complexityResult = await generateText({ model: MODELS.FAST, prompt: classificationPrompt });
        const complexity = complexityResult.trim().toUpperCase();
        if (complexity.includes("HIGH")) modelToUse = MODELS.REASONING;
        else if (complexity.includes("MEDIUM")) modelToUse = MODELS.CREATIVE;
        else modelToUse = MODELS.FAST;
        console.log(`[Sidang Smart Routing] Complexity: ${complexity} -> Model: ${modelToUse}`);
      } catch {
        modelToUse = MODELS.REASONING;
      }
    }

    const stream = await generateStreamingChat({
      model: modelToUse,
      systemInstruction: systemInstruction || undefined,
      messages: genaiMessages,
    });

    // Consume quota only on first message (session start)
    if (isFirstMessage) {
      consumeServerQuota(userId, role, "sidang").catch(console.error);
      logAiUsage({ userId, feature: "sidang", model: modelToUse }).catch(console.error);
    }

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
