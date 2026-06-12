import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 30; // Allow longer duration for AI response

export async function POST(req: Request) {
  try {
    const { prompt, jenjang = "skripsi" } = await req.json();

    const result = await streamText({
      model: google("gemini-1.5-flash"),
      system: `Anda adalah dosen pembimbing akademik yang sangat ahli dalam menyusun judul ${jenjang} untuk mahasiswa tingkat akhir di Indonesia.`,
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate AI response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
