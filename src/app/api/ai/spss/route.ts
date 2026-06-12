import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt, jenjang = "skripsi" } = await req.json();
    const data = JSON.parse(prompt);

    const systemPrompt = `Anda adalah dosen statistik senior yang ahli membaca output ${data.software}. 
Tugas Anda adalah merangkai kalimat interpretasi dari angka-angka output statistik untuk dimasukkan ke dalam Bab 4 ${jenjang} mahasiswa.
Jenis Uji: ${data.jenisUji}
Variabel Independen (X): ${data.variabelX}
Variabel Dependen (Y): ${data.variabelY}

Gunakan gaya bahasa akademik yang baku, objektif, dan formal. Jangan menjelaskan rumus, langsung berikan kalimat interpretasi matang. Sertakan kesimpulan hipotesis (diterima/ditolak) berdasarkan nilai output tersebut.`;

    const result = await streamText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      prompt: `Berikut adalah nilai output yang saya peroleh: ${data.nilaiOutput}. Tolong buatkan interpretasinya.`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate AI response" }), { status: 500 });
  }
}
