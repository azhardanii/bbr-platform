import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt, jenjang = "skripsi" } = await req.json();

    const result = await streamText({
      model: google("gemini-1.5-flash"),
      system: `Anda adalah ahli statistika dan analisis data kuantitatif/kualitatif yang berpengalaman dalam membimbing metodologi penelitian ${jenjang}.`,
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate AI response" }), { status: 500 });
  }
}
