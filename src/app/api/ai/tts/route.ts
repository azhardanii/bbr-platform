import { NextRequest } from "next/server";

export const maxDuration = 60;

/**
 * Clean and format text specifically for clear, fluent Indonesian pronunciation
 */
function sanitizeIndonesianText(raw: string): string {
  if (!raw) return "";

  return raw
    .replace(/\[SISTEM\]/gi, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/<[^>]*>/g, "")
    // Abbreviations expansion for natural speech
    .replace(/\bdst\./gi, "dan seterusnya")
    .replace(/\bdll\./gi, "dan lain-lain")
    .replace(/\bdsb\./gi, "dan sebagainya")
    .replace(/\byg\b/gi, "yang")
    .replace(/\bdgn\b/gi, "dengan")
    .replace(/\butk\b/gi, "untuk")
    .replace(/\btahu\./gi, "tahun")
    .replace(/\bhal\.\s*/gi, "halaman ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Split text into small sentence chunks (max 150 chars) suitable for Google TTS API
 */
function splitIntoChunks(text: string, maxLen = 150): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];

  for (let sentence of sentences) {
    sentence = sentence.trim();
    if (!sentence) continue;

    if (sentence.length <= maxLen) {
      chunks.push(sentence);
    } else {
      const words = sentence.split(" ");
      let current = "";

      for (const word of words) {
        if ((current + " " + word).trim().length > maxLen) {
          if (current.trim()) chunks.push(current.trim());
          current = word;
        } else {
          current += (current ? " " : "") + word;
        }
      }

      if (current.trim()) chunks.push(current.trim());
    }
  }

  return chunks.length > 0 ? chunks : [text.slice(0, maxLen)];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawText = searchParams.get("text") || "";
    const speed = searchParams.get("speed") || "1";

    const cleanText = sanitizeIndonesianText(rawText);
    if (!cleanText) {
      return new Response("Text parameter is required", { status: 400 });
    }

    const chunks = splitIntoChunks(cleanText);
    const audioBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      const encoded = encodeURIComponent(chunk);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=id&client=tw-ob`;

      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (res.ok) {
        const ab = await res.arrayBuffer();
        audioBuffers.push(Buffer.from(ab));
      }
    }

    if (audioBuffers.length === 0) {
      return new Response("Failed to generate speech audio", { status: 500 });
    }

    const combinedAudio = Buffer.concat(audioBuffers);

    return new Response(combinedAudio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": combinedAudio.length.toString(),
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error: any) {
    console.error("TTS generation error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawText = body.text || "";

    const cleanText = sanitizeIndonesianText(rawText);
    if (!cleanText) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const chunks = splitIntoChunks(cleanText);
    const audioBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      const encoded = encodeURIComponent(chunk);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=id&client=tw-ob`;

      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (res.ok) {
        const ab = await res.arrayBuffer();
        audioBuffers.push(Buffer.from(ab));
      }
    }

    if (audioBuffers.length === 0) {
      return new Response(
        JSON.stringify({ error: "Gagal menghasilkan audio suara" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const combinedAudio = Buffer.concat(audioBuffers);

    return new Response(combinedAudio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": combinedAudio.length.toString(),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error: any) {
    console.error("TTS POST error:", error);
    return new Response(
      JSON.stringify({ error: "Gagal memproses suara" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
