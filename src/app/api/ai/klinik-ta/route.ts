import { MODELS, generateText } from "@/lib/ai";

export const maxDuration = 60; // Allow longer duration for large documents

export async function POST(req: Request) {
  try {
    const { text, jenjang } = await req.json();

    if (!text || text.length < 50) {
      return new Response(JSON.stringify({ error: "Teks terlalu pendek atau kosong." }), { status: 400 });
    }

    const systemInstruction = `Kamu adalah Dokter Spesialis Tugas Akhir (${jenjang || "Skripsi"}) di sebuah "Klinik Tugas Akhir". 
Kamu teliti, sangat analitis, namun komunikatif layaknya dokter yang mendiagnosis pasien.
Kamu akan menerima ekstraksi teks lengkap dari draf tugas akhir mahasiswa ("pasien").
Tugas Kamu adalah me-review (mendiagnosis kesehatan) draf tersebut berdasarkan kriteria "Check-up Kelayakan".
Fokus evaluasi adalah pada kelengkapan anatomi tulisan, konsistensi antar bab, dan kedalaman materi.

EVALUASI CHECK-UP BERDASARKAN ID:
Kamu HARUS mendiagnosis SETIAP organ (poin) di bawah ini secara spesifik berdasarkan draf:

Bab 1 (Pendahuluan):
- "1.1": Latar belakang memuat data empiris/fenomena gap yang kuat (maks 3-5 tahun terakhir)
- "1.2": Rumusan masalah sinkron dengan tujuan penelitian
- "1.3": Manfaat penelitian mencakup aspek teoretis dan praktis

Bab 2 (Tinjauan Pustaka):
- "2.1": Grand theory dijelaskan relevansinya dengan variabel penelitian
- "2.2": Penelitian terdahulu disajikan dalam bentuk matriks/tabel mapping
- "2.3": Kerangka konseptual memuat semua variabel dan arah hubungan dengan jelas

Bab 3 (Metode Penelitian):
- "3.1": Populasi dan sampel didefinisikan beserta teknik samplingnya
- "3.2": Definisi operasional variabel mencakup indikator dan skala pengukuran
- "3.3": Teknik analisis data sinkron dengan hipotesis yang diajukan

Bab 4 (Hasil dan Pembahasan):
- "4.1": Karakteristik responden/objek disajikan secara komprehensif
- "4.2": Hasil uji asumsi klasik/prasyarat terpenuhi (khusus kuantitatif, jika kualitatif sesuaikan)
- "4.3": Pembahasan membandingkan temuan dengan penelitian terdahulu secara kritis

Bab 5 (Kesimpulan dan Saran):
- "5.1": Kesimpulan menjawab rumusan masalah secara langsung
- "5.2": Saran bersifat aplikatif, spesifik, dan tidak klise
- "5.3": Keterbatasan penelitian disebutkan dengan jujur

OUTPUT FORMAT (JSON ONLY):
Kembalikan respons murni dalam bentuk JSON dengan struktur berikut (tanpa awalan markdown apapun):
{
  "summary": "Ringkasan diagnosis kesehatan draf secara keseluruhan (1 paragraf). Sampaikan layaknya dokter memberi tahu kondisi pasien.",
  "items": {
    "1.1": {
      "pass": true, // true jika sehat/memenuhi standar, false jika butuh diobati/revisi
      "reason": "Diagnosis mengapa bagian ini sehat atau sakit (berdasarkan draf).",
      "suggestion": "Resep obat/saran perbaikan konkret jika fail, atau tips menjaga kesehatan bab ini jika pass."
    },
    "1.2": {
      "pass": false,
      "reason": "...",
      "suggestion": "..."
    },
    // Wajib sertakan SEMUA ID dari 1.1 sampai 5.3
  }
}
DILARANG KERAS mengembalikan apapun selain teks JSON murni. Pastikan format JSON valid.`;

    const result = await generateText({
      model: MODELS.REASONING,
      systemInstruction,
      prompt: text,
    });

    let jsonResult;
    try {
        let cleanStr = result.trim();
        if (cleanStr.startsWith('```json')) {
            cleanStr = cleanStr.replace(/^```json\n/, '').replace(/\n```$/, '');
        } else if (cleanStr.startsWith('```')) {
            cleanStr = cleanStr.replace(/^```\n/, '').replace(/\n```$/, '');
        }
        jsonResult = JSON.parse(cleanStr);
    } catch (e) {
        console.error("Failed to parse JSON:", result);
        throw new Error("Gagal mengurai respons AI.");
    }

    return new Response(JSON.stringify(jsonResult), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Review Error:", error);
    return new Response(JSON.stringify({ error: "Gagal memproses naskah. Silakan coba lagi nanti." }), { status: 500 });
  }
}
