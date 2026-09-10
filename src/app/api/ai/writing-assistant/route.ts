import { MODELS, generateText } from "@/lib/ai";
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
  const quotaCheck = await checkServerQuota(userId, role, "writingAssistant");
  if (!quotaCheck.allowed) {
    return new Response(
      JSON.stringify({ error: "Kuota Asisten Penulisan Anda sudah habis. Silakan upgrade atau beli add-on.", quota: quotaCheck }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { text, mode } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Teks tidak boleh kosong" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let targetModel: string = MODELS.ACADEMIC_PARAPHRASE;
    let systemInstruction = "";
    let prompt = `Teks naskah yang akan diproses:\n"""\n${text}\n"""`;

    switch (mode) {
      case "expand":
        targetModel = MODELS.ACADEMIC_DEEP;
        systemInstruction = `Kamu adalah Guru Besar dan Reviewer Jurnal Ilmiah Internasional bereputasi tinggi.
Tugas:
1. Perluas dan perkaya argumen pada teks ilmiah yang diberikan dengan penjelasan akademis berbobot, logika ilmiah runtut, serta menyisipkan sitasi rujukan jurnal ilmiah yang BENAR-BENAR TERPUBLIKASI (real published scholarly papers).
2. Sisipkan in-text citation di dalam kalimat (contoh: (Sugiyono, 2021) atau (Creswell, 2018) atau (Davis et al., 2020)).
3. Berikan metadata referensi jurnal yang disitasi tersebut secara lengkap dan valid (Judul artikel, Nama penulis, Tahun publikasi, Nama jurnal bereputasi, dan tautan resmi DOI/URL).

Format Output WAJIB berupa format JSON valid tanpa tanda markdown pembungkus di luar JSON, dengan struktur:
{
  "expandedText": "Teks paragraf naskah yang sudah diperluas lengkap dengan in-text citation...",
  "citation": {
    "title": "Judul Lengkap Artikel Jurnal Ilmiah",
    "authors": "Nama Penulis 1, Nama Penulis 2",
    "year": "2022",
    "journal": "Nama Jurnal Ilmiah Terindeks (e.g. Jurnal Sistem Informasi / IEEE / Elsevier / Springer)",
    "doi": "10.xxxx/xxxxx",
    "url": "https://doi.org/10.xxxx/xxxxx"
  }
}`;
        break;

      case "grammar":
        targetModel = MODELS.FAST_LIGHT;
        systemInstruction = `Kamu adalah pakar bahasa dan editor PUEBI/EYD Edisi V bahasa Indonesia untuk karya tulis ilmiah.
Tugas: Perbaiki kesalahan ejaan, tanda baca, huruf kapital, dan kata-kata tidak baku pada teks yang diberikan.
Aturan:
- Pertahankan struktur kalimat asli sebanyak mungkin, fokus pada perbaikan kata tidak baku, ejaan, dan typo.
- JANGAN sertakan penjelasan pembuka atau penutup. Langsung berikan hasil teks yang sudah diperbaiki secara utuh.`;
        break;

      case "shorten":
        targetModel = MODELS.FAST_LIGHT;
        systemInstruction = `Kamu adalah editor jurnal ilmiah spesialis ringkasan teks akademik.
Tugas: Persingkat dan padatkan teks berikut agar lebih to-the-point, hilangkan kata-kata mubazir/bertele-tele tanpa menghilangkan data dan pesan substansialnya.
Aturan:
- Gunakan bahasa Indonesia baku dan efektif.
- JANGAN sertakan penjelasan pembuka atau penutup. Langsung berikan hasil teks ringkas.`;
        break;

      case "paraphrase":
      default:
        targetModel = MODELS.ACADEMIC_PARAPHRASE;
        systemInstruction = `Kamu adalah editor jurnal akademik profesional dengan keahlian tinggi dalam memparafrase teks ilmiah berbahasa Indonesia.
Tugas: Ubah struktur kalimat secara signifikan menjadi kalimat ilmiah akademis yang elegan, objektif, dan formal.
Aturan:
- Ubah struktur kalimat (aktif-pasif, pemecahan/penggabungan klausa) agar lolos uji plagiasi/Turnitin.
- Pertahankan makna data, istilah teknis, dan konteks asli secara akurat.
- Gunakan kosakata baku tingkat tinggi yang lazim di jurnal ilmiah.
- JANGAN sertakan penjelasan pembuka atau penutup. Langsung berikan hasil naskah yang diparafrase.`;
        break;
    }

    const rawResponse = await generateText({ model: targetModel, systemInstruction, prompt });

    // Consume quota + log
    consumeServerQuota(userId, role, "writingAssistant").catch(console.error);
    logAiUsage({ userId, feature: "writingAssistant", model: targetModel }).catch(console.error);

    if (mode === "expand") {
      try {
        const cleaned = rawResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return new Response(JSON.stringify({
          result: parsed.expandedText || rawResponse,
          citation: parsed.citation || null,
        }), { headers: { "Content-Type": "application/json" } });
      } catch {
        return new Response(JSON.stringify({ result: rawResponse, citation: null }), {
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ result: rawResponse.trim() }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Writing Assistant AI Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Gagal memproses dengan AI." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
