"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderOpen, ArrowRight, ShieldAlert, AlertTriangle, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { useJenjang } from "@/hooks/useJenjang";

const CATEGORIES = ["Semua", "Bab 1: Pendahuluan", "Bab 2: Tinjauan Pustaka", "Bab 3: Metodologi", "Bab 4: Hasil", "Bab 5: Kesimpulan"];

export default function ArenaSidangPage() {
  const { labelLower } = useJenjang();
  
  // Expanded to ~30 questions to represent the 200+ database
  const QUESTIONS = [
    { id: 1, bab: "Bab 1: Pendahuluan", q: "Apa urgensi penelitian Kamu ini dilakukan sekarang?", diff: "Sedang", color: "amber", insight: "Kaitkan dengan isu/fenomena terbaru yang sedang hangat (gap empiris) dan jelaskan apa ruginya jika penelitian ini tidak dilakukan sekarang." },
    { id: 2, bab: "Bab 1: Pendahuluan", q: "Coba jelaskan fenomena gap dalam penelitian Kamu tanpa melihat naskah!", diff: "Berat", color: "red", insight: "Hafalkan satu statistik/fakta kunci atau anomali di lapangan yang melatarbelakangi masalahmu. Jangan bertele-tele." },
    { id: 3, bab: "Bab 1: Pendahuluan", q: "Kenapa Kamu memilih objek penelitian di lokasi tersebut? Apa keistimewaannya dibanding tempat lain?", diff: "Ringan", color: "green", insight: "Hindari alasan 'karena dekat/mudah'. Berikan alasan akademis, misalnya karena kasus di lokasi tersebut paling tinggi atau memiliki karakteristik unik yang sesuai teori." },
    { id: 4, bab: "Bab 1: Pendahuluan", q: `Apa perbedaan paling mendasar penelitian ini dengan ${labelLower} kakak tingkat Kamu tahun lalu?`, diff: "Sedang", color: "amber", insight: "Tekankan pada 'Research Gap' (perbedaan variabel, metode, tahun, atau objek penelitian). Jangan katakan 'semuanya beda'." },
    { id: 5, bab: "Bab 1: Pendahuluan", q: "Apakah rumusan masalah ini benar-benar bisa dijawab dengan metode yang Kamu pilih?", diff: "Berat", color: "red", insight: "Pahami benar kaitan rumusan masalah dengan alat analisis (misal: uji komparasi untuk menjawab perbedaan, regresi untuk pengaruh)." },
    { id: 6, bab: "Bab 2: Tinjauan Pustaka", q: "Apa bedanya penelitian Kamu dengan penelitian si A tahun 2022 yang ada di matriks literatur Kamu?", diff: "Ringan", color: "green", insight: "Fokus pada satu variabel pembeda atau perbedaan konteks (lokasi/waktu). Tunjukkan bahwa penelitianmu menyempurnakan penelitian si A." },
    { id: 7, bab: "Bab 2: Tinjauan Pustaka", q: "Kenapa Kamu menggunakan Grand Theory dari tokoh X padahal tokoh Y punya teori yang lebih baru?", diff: "Berat", color: "red", insight: "Jangan panik. Jelaskan bahwa teori X lebih relevan (fit) dengan konteks/variabel spesifik yang kamu angkat, meski teori Y lebih baru." },
    { id: 8, bab: "Bab 2: Tinjauan Pustaka", q: "Coba sebutkan indikator variabel independen Kamu tanpa melihat teks!", diff: "Sedang", color: "amber", insight: "Hafalkan setidaknya 3-4 kata kunci utama dari indikator variabelmu. Ini menunjukkan penguasaanmu terhadap konsep inti." },
    { id: 9, bab: "Bab 2: Tinjauan Pustaka", q: "Bagaimana alur pikir kerangka konseptual Kamu? Mengapa panahnya mengarah ke situ?", diff: "Sedang", color: "amber", insight: "Jelaskan logika hubungan sebab-akibat berdasarkan teori (misal: mengapa A mempengaruhi B). Jangan hanya menjawab 'karena sudah template dari dosen'." },
    { id: 10, bab: "Bab 2: Tinjauan Pustaka", q: "Apakah ada grand theory yang saling bertentangan yang Kamu temukan saat review literatur?", diff: "Berat", color: "red", insight: "Sebutkan jika ada perdebatan (research gap teoretis). Jika tidak ada, jujurlah tapi sebutkan perbedaan kecil dari temuan sebelumnya." },
    { id: 11, bab: "Bab 3: Metodologi", q: "Mengapa Kamu menggunakan metode purposive sampling? Kenapa tidak random sampling?", diff: "Sedang", color: "amber", insight: "Jelaskan bahwa populasimu punya karakteristik spesifik yang harus dipenuhi (sebutkan kriterianya), sehingga random tidak cocok." },
    { id: 12, bab: "Bab 3: Metodologi", q: "Bagaimana Kamu membuktikan bahwa instrumen kuesioner Kamu valid dan reliabel sebelum disebar ke responden utama?", diff: "Berat", color: "red", insight: "Sebutkan pilot test (misal ke 30 orang), lalu sebutkan batas nilai r-tabel untuk validitas dan cronbach alpha > 0.6 untuk reliabilitas." },
    { id: 13, bab: "Bab 3: Metodologi", q: "Jelaskan definisi operasional dari variabel Y Kamu secara spesifik!", diff: "Ringan", color: "green", insight: "Fokus pada bagaimana variabel tersebut *diukur* dalam penelitianmu, bukan pengertian menurut KBBI." },
    { id: 14, bab: "Bab 3: Metodologi", q: "Mengapa Kamu menggunakan level signifikansi 5% (0.05), bukannya 1% atau 10%?", diff: "Sedang", color: "amber", insight: "Jelaskan bahwa 5% adalah standar umum dalam penelitian ilmu sosial/ekonomi. 1% biasanya untuk ilmu pasti/kedokteran." },
    { id: 15, bab: "Bab 3: Metodologi", q: "Jika data Kamu nanti ternyata tidak berdistribusi normal, apa plan B Kamu?", diff: "Berat", color: "red", insight: "Sebutkan alternatif uji non-parametrik (seperti Mann-Whitney, Kruskal-Wallis) atau melakukan transformasi data (logaritma)." },
    { id: 16, bab: "Bab 3: Metodologi", q: "Berapa lama waktu penyebaran kuesioner ini? Apakah cukup merepresentasikan fenomena?", diff: "Ringan", color: "green", insight: "Sebutkan durasinya dan yakinkan bahwa periode tersebut tidak ada anomali eksternal yang merusak objektivitas respons." },
    { id: 17, bab: "Bab 4: Hasil", q: "Nilai R Square Kamu hanya 0.20. Bukankah itu sangat kecil? Berarti model Kamu jelek?", diff: "Berat", color: "red", insight: "Jangan defensif. Akui nilainya, tapi jelaskan bahwa dalam ilmu sosial/perilaku manusia, R-square rendah wajar karena banyak faktor tak terukur. Yang penting sig < 0.05." },
    { id: 18, bab: "Bab 4: Hasil", q: "Mengapa ada satu hipotesis yang ditolak? Apa justifikasi teoretis dari penolakan tersebut?", diff: "Sedang", color: "amber", insight: "Kembalikan ke kondisi empiris di lapangan atau karakteristik unik respondenmu yang membuat teori dasar tidak berlaku penuh." },
    { id: 19, bab: "Bab 4: Hasil", q: "Dari karakteristik responden, mayoritas berjenis kelamin pria. Apakah ini membuat bias pada hasil penelitian?", diff: "Sedang", color: "amber", insight: "Argumenkan berdasarkan proporsi asli populasi, atau akui sebagai limitasi (keterbatasan penelitian) yang perlu dicatat di Bab 5." },
    { id: 20, bab: "Bab 4: Hasil", q: "Coba tunjukkan di mana tabel uji asumsi heteroskedastisitas Kamu. Bagaimana membacanya?", diff: "Ringan", color: "green", insight: "Hafalkan halaman lampirannya dan ketahui batas nilai probabilitas/sig (misal grafik scatterplot menyebar, atau uji Glejser > 0.05)." },
    { id: 21, bab: "Bab 4: Hasil", q: "Nilai koefisien variabel X bernilai negatif. Apa artinya secara praktis di lapangan?", diff: "Sedang", color: "amber", insight: "Beri contoh konkret. Negatif berarti berlawanan: 'Semakin tinggi X, maka akan menurunkan Y. Misalnya, makin tinggi stres, makin rendah performa'." },
    { id: 22, bab: "Bab 4: Hasil", q: "Apakah Kamu yakin responden mengisi kuesioner dengan jujur? Bagaimana Kamu memvalidasinya?", diff: "Berat", color: "red", insight: "Sebutkan adanya pernyataan screening di kuesioner, anonimitas responden, atau bahwa kamu membuang kuesioner yang diisi seragam (outlier)." },
    { id: 23, bab: "Bab 5: Kesimpulan", q: "Saran Kamu terlalu normatif. Coba berikan satu saran praktis spesifik untuk institusi X berdasarkan temuan Kamu!", diff: "Sedang", color: "amber", insight: "Berikan ide program atau perbaikan sistem yang nyata, terukur, dan *actionable* langsung dari hasil uji regresimu." },
    { id: 24, bab: "Bab 5: Kesimpulan", q: "Apakah kesimpulan Kamu benar-benar menjawab rumusan masalah nomor 2?", diff: "Ringan", color: "green", insight: "Tunjukkan benang merah langsung dari angka uji hipotesis 2 ke kalimat kesimpulan 2. Jangan tambahkan teori baru di kesimpulan." },
    { id: 25, bab: "Bab 5: Kesimpulan", q: "Apa keterbatasan paling fatal dalam penelitian Kamu ini?", diff: "Berat", color: "red", insight: "Pilih satu kelemahan teknis (seperti jumlah sampel, periode waktu, cakupan wilayah) tapi sertai argumen mengapa kelemahan itu tidak merusak keabsahan hasil." },
    { id: 26, bab: "Bab 5: Kesimpulan", q: "Jika ada peneliti lain yang ingin mereplikasi studi ini, saran metode apa yang akan Kamu berikan?", diff: "Sedang", color: "amber", insight: "Sarankan penambahan variabel moderasi/mediasi baru, perluasan sampel, atau perubahan metode dari kuantitatif ke kualitatif untuk pendalaman." },
    { id: 27, bab: "Semua", q: "Secara keseluruhan, apakah Kamu puas dengan hasil penelitian ini?", diff: "Ringan", color: "green", insight: "Jawablah dengan proporsional: Puas secara akademis karena membuktikan teori, namun sadar bahwa penelitian tidak luput dari kekurangan." },
    { id: 28, bab: "Semua", q: `Sebutkan satu kata yang merangkum keseluruhan ${labelLower} Kamu dan alasannya!`, diff: "Sedang", color: "amber", insight: "Siapkan kata kunci seperti 'Inovatif', 'Validasi', atau 'Eksplorasi', lalu jelaskan satu kalimat kuat mengenai temuan terpenting." },
    { id: 29, bab: "Semua", q: `Jika saya tolak ${labelLower} ini sekarang, apa argumen terkuat Kamu untuk mempertahankannya?`, diff: "Berat", color: "red", insight: "Tunjukkan keyakinan pada metodologi yang sudah diuji berlapis dan fakta bahwa penelitianmu memecahkan urgensi (gap) yang nyata di lapangan." }
  ];

  const [activeCat, setActiveCat] = useState("Semua");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);

  // Exclude 'Semua' tagged items from standard filtering unless 'Semua' is active
  let filtered = activeCat === "Semua" ? QUESTIONS : QUESTIONS.filter(q => q.bab === activeCat || q.bab === "Semua");
  
  const displayed = filtered.slice(0, visibleCount);
  
  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 10);
      setLoadingMore(false);
    }, 600); // Simulate network request for the rest of the 200 items
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-10">
      
      {/* Back Button */}
      <Link href="/sidang" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors mb-2">
        <ArrowLeft size={16} /> Kembali
      </Link>

      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)] flex items-center gap-3">
          Arena Sidang 
          <span className="text-xs font-semibold bg-[var(--color-brand-100)] text-[var(--color-brand-700)] px-3 py-1 rounded-full align-middle">214 Pola Soal Database</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-2">Kumpulan pertanyaan jebakan sidang {labelLower} dari berbagai penguji. Pelajari polanya dan siapkan argumenmu.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-[var(--color-bg-muted)]">
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => {
              setActiveCat(cat);
              setVisibleCount(10); // Reset pagination when switching tabs
            }}
            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${activeCat === cat ? 'border-b-2 border-[var(--color-brand-600)] text-[var(--color-brand-600)]' : 'text-[var(--color-text-body)] hover:text-[var(--color-brand-600)]'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center text-xs font-semibold text-[var(--color-text-secondary)]">
        <span>Menampilkan {displayed.length} dari estimasi {activeCat === 'Semua' ? '214' : '45'} pertanyaan</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 items-start">
        {displayed.map(q => (
          <div key={q.id} className="bg-white border-2 border-[var(--color-bg-muted)] rounded-2xl overflow-hidden hover:border-[var(--color-brand-200)] transition-all flex flex-col">
            <div className="p-5 cursor-pointer" onClick={() => setExpanded(expanded === q.id ? null : q.id)}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase">{q.bab}</span>
                <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase flex items-center gap-1 ${
                  q.color === 'green' ? 'bg-green-100 text-green-700' : 
                  q.color === 'amber' ? 'bg-amber-100 text-amber-700' : 
                  'bg-red-100 text-red-700'
                }`}>
                  {q.color === 'green' && <ShieldCheck size={12} />}
                  {q.color === 'amber' && <AlertTriangle size={12} />}
                  {q.color === 'red' && <ShieldAlert size={12} />}
                  Level {q.diff}
                </span>
              </div>
              <h3 className="font-semibold text-[var(--color-text-primary)] leading-relaxed">{q.q}</h3>
            </div>
            
            {expanded === q.id && (
              <div className="px-5 pb-5 pt-2 border-t border-[var(--color-bg-muted)] bg-[var(--color-bg-surface)]">
                <p className="text-sm text-[var(--color-text-secondary)] italic mb-4">
                  "{q.insight}"
                </p>
                <Link 
                  href={`/sidang?q=${encodeURIComponent(q.q)}`}
                  className="w-full py-2.5 bg-white border border-[var(--color-brand-600)] text-[var(--color-brand-600)] text-sm font-semibold rounded-lg hover:bg-[var(--color-brand-50)] transition-colors flex items-center justify-center gap-2"
                >
                  Latih Menjawab di Simulator <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {visibleCount < filtered.length && (
        <div className="flex justify-center mt-6 pt-4">
          <button 
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-[var(--color-bg-surface)] border-2 border-[var(--color-bg-muted)] text-[var(--color-text-body)] font-semibold rounded-xl hover:text-[var(--color-brand-600)] hover:border-[var(--color-brand-200)] transition-colors flex items-center gap-2"
          >
            {loadingMore ? <><RefreshCw size={18} className="animate-spin" /> Mengambil Data...</> : "Tampilkan Lebih Banyak"}
          </button>
        </div>
      )}
    </div>
  );
}
