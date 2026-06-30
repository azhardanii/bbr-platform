import { MODELS, generateStreamingChat, generateText } from "@/lib/ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, systemInstruction } = await req.json();

    // Convert the messages from frontend format to GenAI format
    // Frontend sends: { role: "user"|"assistant"|"system", content: string }
    // GenAI expects: { role: "user"|"model", content: string }
    const genaiMessages = messages
      .filter((m: any) => m.role !== "system")
      .map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        content: m.content,
      }));

    let modelToUse: string = MODELS.REASONING;

    // Smart Routing Logic
    // If the conversation has more than 1 message, it's not the first prompt. We evaluate the user's latest reply.
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
        const complexityResult = await generateText({
          model: MODELS.FAST,
          prompt: classificationPrompt
        });
        
        const complexity = complexityResult.trim().toUpperCase();
        
        if (complexity.includes("HIGH")) {
          modelToUse = MODELS.REASONING;
        } else if (complexity.includes("MEDIUM")) {
          modelToUse = MODELS.CREATIVE;
        } else {
          modelToUse = MODELS.FAST;
        }
        
        console.log(`[Sidang Smart Routing] Evaluated Complexity: ${complexity} -> Selected Model: ${modelToUse}`);
      } catch (e) {
        console.error("Smart routing failed, defaulting to REASONING", e);
        modelToUse = MODELS.REASONING;
      }
    } else {
      console.log(`[Sidang Smart Routing] First message detected -> Selected Model: ${modelToUse}`);
    }

    const stream = await generateStreamingChat({
      model: modelToUse,
      systemInstruction: systemInstruction || undefined,
      messages: genaiMessages,
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
