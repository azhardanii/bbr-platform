import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = await streamText({
      model: google("gemini-1.5-flash"),
      system: "Anda adalah editor jurnal akademik profesional yang sangat ahli dalam memparafrase teks untuk menghindari plagiasi dan menyesuaikan gaya penulisan ilmiah.",
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate AI response" }), { status: 500 });
  }
}
