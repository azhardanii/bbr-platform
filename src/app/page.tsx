"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, BookOpen, PenTool, Presentation, BarChart3, Network, FileSearch,
  Calculator, MessageSquare, ShieldCheck, CheckCircle2, Star, ChevronDown,
  ChevronRight, Zap, Clock, Award, Users, Menu, X, Sparkles, GraduationCap,
  TrendingUp, Brain, Target, Heart, Shield, SendHorizontal, RefreshCw,
  FileText, Wand2, Check, Copy, Flame, Coffee, HelpCircle, Layers, FileCheck
} from "lucide-react";

/* ─── Animated Counter Component ─── */
function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let current = 0;
        const step = Math.max(1, Math.floor(target / 50));
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          setCount(current);
        }, 25);
      }
    }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{prefix}{count.toLocaleString("id-ID")}{suffix}</span>;
}

/* ─── FAQ Accordion Item ─── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200/80 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group transition-colors"
      >
        <span className="font-semibold text-slate-800 text-base group-hover:text-red-600 transition-colors pr-4">
          {q}
        </span>
        <ChevronDown
          size={18}
          className={`text-slate-400 group-hover:text-red-500 transition-transform duration-300 shrink-0 ${open ? "rotate-180 text-red-600" : ""}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 pb-5" : "max-h-0"}`}>
        <p className="text-slate-600 leading-relaxed text-sm md:text-base">{a}</p>
      </div>
    </div>
  );
}

/* ─── Data Constants ─── */
const BBR_FEATURES = [
  {
    id: "judul",
    icon: FileSearch,
    title: "Judul Finder & Checker",
    badge: "Rekomendasi Akurat",
    desc: "AI memvalidasi dan menemukan ide judul tugas akhir yang orisinal, bernovelty kuat, serta minim risiko penolakan dosen pembimbing.",
    detail: "Cukup masukkan bidang studi, objek penelitian, dan metode analisis. AI akan menyajikan 5 alternatif judul lengkap dengan justifikasi akademik dan research gap.",
    highlight: "Research Gap & ACC Predictor",
    color: "from-blue-600 to-indigo-600",
    bgIcon: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    id: "parafrase",
    icon: PenTool,
    title: "Parafrase Pintar",
    badge: "Turnitin-Ready",
    desc: "Tulis ulang paragraf naskah dengan 6 mode gaya bahasa akademik untuk menurunkan skor Turnitin tanpa merusak makna substantif.",
    detail: "Mendukung gaya Standar Akademik, Jurnal Q1, Ringkas, Elaboratif, Formal, dan Anti-Turnitin. Kalimat tetap alami dan lolos deteksi AI.",
    highlight: "6 Mode Akademik + Lolos AI",
    color: "from-emerald-600 to-teal-600",
    bgIcon: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    id: "bibliometrik",
    icon: Network,
    title: "Bibliometrik Generator",
    badge: "Analisis Literatur",
    desc: "Petakan state-of-the-art, temukan novelty penelitian, dan visualisasikan peta literatur dari ribuan publikasi relevan.",
    detail: "Hasilkan matriks tinjauan pustaka Bab 2 secara komprehensif, memetakan tema besar, tren riset 5 tahun terakhir, dan ruang kebaruan untuk naskahmu.",
    highlight: "Peta Novelty & Tren Riset",
    color: "from-purple-600 to-pink-600",
    bgIcon: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    id: "kompas",
    icon: Calculator,
    title: "Kompas Statistik",
    badge: "Panduan Riset",
    desc: "Bingung menentukan uji statistik? AI merekomendasikan metode analisis data yang tepat sesuai hipotesis dan jenis variabelmu.",
    detail: "Jawab kuesioner singkat mengenai skala data dan tujuan uji, AI akan memandu pemilihan uji parametrik/non-parametrik beserta asumsi klasiknya.",
    highlight: "Rekomendasi Uji & Syarat Data",
    color: "from-amber-600 to-orange-600",
    bgIcon: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    id: "spss",
    icon: BarChart3,
    title: "SPSS / PLS Interpreter",
    badge: "Bab 4 Instan",
    desc: "Terjemahkan tabel output SPSS, SmartPLS, EViews, atau AMOS menjadi narasi pembahasan Bab 4 yang siap disematkan ke naskah.",
    detail: "Input koefisien regresi, nilai F, t-statistik, R-Square, atau p-value. AI langsung menyusun interpretasi formal dan kesimpulan pengujian hipotesis.",
    highlight: "Output Angka Jadi Paragraf Bab 4",
    color: "from-red-600 to-rose-600",
    bgIcon: "bg-red-50 text-red-600 border-red-200",
  },
  {
    id: "sidang",
    icon: Presentation,
    title: "Simulator Sidang AI",
    badge: "Fitur Unggulan",
    desc: "Simulasikan sidang skripsi/tesis dengan 8 persona dosen penguji interaktif yang menanyakan kelemahan naskahmu secara tajam.",
    detail: "Pilih dosen Si Metodologi, Si Teori, atau Si Dosen Killer. Dapatkan evaluasi langsung berupa skor kesiapan, feedback, dan tips menjawab.",
    highlight: "8 Persona Penguji + Scoring Real-time",
    color: "from-rose-600 to-red-600",
    bgIcon: "bg-rose-50 text-rose-600 border-rose-200",
  },
  {
    id: "klinik",
    icon: ShieldCheck,
    title: "Klinik Tugas Akhir",
    badge: "Diagnosis Draf",
    desc: "Audit kesehatan draf skripsi sebelum menghadap dosen. Diagnosis inkonsistensi dari Bab 1 sampai Bab 5 dan dapatkan resep perbaikan.",
    detail: "AI memeriksa benang merah antara rumusan masalah, tinjauan pustaka, metodologi, dan kesimpulan untuk mencegah pembantaian saat bimbingan.",
    highlight: "Cek Konsistensi & Benang Merah",
    color: "from-violet-600 to-indigo-600",
    bgIcon: "bg-violet-50 text-violet-600 border-violet-200",
  },
  {
    id: "scriptwa",
    icon: MessageSquare,
    title: "Script WA Dosen",
    badge: "Komunikasi Santun",
    desc: "Generator template pesan WhatsApp yang sopan, terstruktur, dan disukai dosen untuk meminta bimbingan, revisi, atau tanda tangan.",
    detail: "Pilih situasi (minta jadwal bimbingan, follow-up draf yang belum dibaca, izin sidang), AI menyusun pesan etis sesuai etika akademik.",
    highlight: "Etika Akademik & Tinggal Salin",
    color: "from-emerald-600 to-green-600",
    bgIcon: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
];

const DOSEN_PERSONAS = [
  {
    id: "killer",
    name: "Si Dosen Killer",
    avatar: "🔥",
    tag: "Uji Mental & Ketahanan",
    role: "Penguji Utama",
    desc: "Mengejar setiap kelemahan argumen, mempertanyakan urgensi penelitian, dan menguji penguasaan materi secara menyeluruh.",
    sampleQuestion: "Kenapa fenomena ini layak dijadikan skripsi? Apa kontribusi nyata risetmu selain sekadar memenuhi syarat lulus?",
    difficulty: "Sangat Berat",
    accent: "border-red-500 bg-red-50 text-red-700",
  },
  {
    id: "metodologi",
    name: "Si Metodologi",
    avatar: "😤",
    tag: "Ketat Soal Sampling & Validitas",
    role: "Penguji Metodologi",
    desc: "Fokus membongkar teknik sampling, instrumen penelitian, uji reliabilitas, dan kecukupan jumlah responden.",
    sampleQuestion: "Coba jelaskan alasan pemilihan rumus Slovin dengan margin of error 5%? Kenapa tidak memakai purposive sampling?",
    difficulty: "Tinggi",
    accent: "border-blue-500 bg-blue-50 text-blue-700",
  },
  {
    id: "teori",
    name: "Si Pengabdi Teori",
    avatar: "📚",
    tag: "Kupas Grand Theory",
    role: "Penguji Substansi",
    desc: "Menguji kedalaman landasan teori, keterkaitan grand theory dengan variabel riset, serta pembaruan referensi jurnal.",
    sampleQuestion: "Apa grand theory yang melandasi hubungan variabel X dan Y? Mengapa teori tahun 2010 masih kamu gunakan tanpa kritik?",
    difficulty: "Sedang",
    accent: "border-purple-500 bg-purple-50 text-purple-700",
  },
  {
    id: "statistik",
    name: "Si Raja Statistik",
    avatar: "🧮",
    tag: "Detail Angka & P-Value",
    role: "Penguji Kuantitatif",
    desc: "Memeriksa output olah data, uji asumsi klasik, multikolinearitas, nilai R-square, dan signifikansi koefisien.",
    sampleQuestion: "Bagaimana kamu menjelaskan nilai R-Square sebesar 0.34? Ke mana 66% variasi variabel dependen lainnya dijelaskan?",
    difficulty: "Tinggi",
    accent: "border-amber-500 bg-amber-50 text-amber-700",
  },
  {
    id: "detektif",
    name: "Si Detektif Celah",
    avatar: "🔍",
    tag: "Cari Inkonsistensi Bab",
    role: "Penguji Kritis",
    desc: "Menemukan ketidakcocokan antara rumusan masalah di Bab 1 dengan hasil pembahasan di Bab 4 dan kesimpulan Bab 5.",
    sampleQuestion: "Di Bab 1 kamu merumuskan 3 pertanyaan riset, tapi kenapa di kesimpulan Bab 5 hanya ada 2 poin yang terjawab?",
    difficulty: "Sedang",
    accent: "border-emerald-500 bg-emerald-50 text-emerald-700",
  },
  {
    id: "santai",
    name: "Si Dosen Santai",
    avatar: "☕",
    tag: "Menjebak di Konsep Dasar",
    role: "Penguji Konseptual",
    desc: "Bertanya dengan nada bersahabat namun menguji pemahaman definisi konseptual paling mendasar dari judul penelitianmu.",
    sampleQuestion: "Coba jelaskan dengan bahasamu sendiri secara sederhana, apa sebenarnya definisi variabel mediasi dalam penelitianmu?",
    difficulty: "Sedang",
    accent: "border-teal-500 bg-teal-50 text-teal-700",
  },
];

const WORKFLOW_STEPS = [
  {
    step: 1,
    title: "Eksplorasi & Validasi Judul",
    tool: "Judul Finder & Checker",
    desc: "Input minat bidang riset atau masalah yang kamu amati di lapangan. AI menemukan 5 ide judul unik beserta celah penelitian (research gap) yang disukai dosen pembimbing.",
    mockupBadge: "Langkah 1: Judul ACC",
    previewTitle: "Pengaruh Mobile Payment terhadap Inklusi Keuangan UMKM",
    previewMeta: "Research Gap: Valid • Skor Novelty: 89% • ACC Dosen: Tinggi",
  },
  {
    step: 2,
    title: "Susun Outline & Landasan Teori",
    tool: "Generator Bab 1 - 3",
    desc: "AI memetakan kerangka konseptual, latar belakang berdasar data riil, tinjauan pustaka, dan metodologi sesuai pedoman penulisan kampusmu.",
    mockupBadge: "Langkah 2: Draf Bab 1-3",
    previewTitle: "Outline 3 Bab Terstruktur",
    previewMeta: "7.420 kata • 38 referensi terverifikasi • Format APA 7th",
  },
  {
    step: 3,
    title: "Olah Data & Pembahasan Bab 4",
    tool: "SPSS & PLS Interpreter",
    desc: "Masukkan angka hasil olah data SPSS atau SmartPLS. AI otomatis mengubah tabel koefisien dan p-value menjadi narasi ilmiah Bab 4 yang siap cetak.",
    mockupBadge: "Langkah 3: Pembahasan Data",
    previewTitle: "Uji Hipotesis & Pembahasan Bab 4",
    previewMeta: "T-Statistik: 3.42 • P-Value: 0.001 • Signifikan pada alpha 5%",
  },
  {
    step: 4,
    title: "Review & Parafrase Anti-Turnitin",
    tool: "Parafrase Pintar & Klinik",
    desc: "Lakukan diagnosis draf secara menyeluruh. Tulis ulang bagian berisiko tinggi dengan 6 gaya akademik agar lolos Turnitin dengan skor hijau aman.",
    mockupBadge: "Langkah 4: Polish & Orisinalitas",
    previewTitle: "Turnitin Safety: 11% (Aman)",
    previewMeta: "6 Gaya Parafrase • Struktur Kalimat Akademik Alami",
  },
  {
    step: 5,
    title: "Simulasi Sidang & Script Dosen",
    tool: "Simulator Sidang AI",
    desc: "Latih mentalmu menghadapi 8 persona dosen penguji. Jawab pertanyaan simulasi, pelajari feedbacknya, dan gunakan script WA santun untuk bimbingan.",
    mockupBadge: "Langkah 5: Siap Sidang & Lulus",
    previewTitle: "Prediksi Nilai Sidang: A (88/100)",
    previewMeta: "Feedback Dosen Killer Teratasi • Siap Yudisium",
  },
];

const SAMPLE_TEXT = `Penelitian ini bertujuan untuk menguji dan menganalisis pengaruh adopsi teknologi finansial terhadap inklusi keuangan pada pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) di wilayah Jawa Barat. Data dikumpulkan melalui kuesioner kepada 250 responden pemilik UMKM dan dianalisis menggunakan Structural Equation Modeling berbasis Partial Least Squares (SEM-PLS). Hasil penelitian menunjukkan bahwa persepsi kemudahan penggunaan dan kemanfaatan teknologi secara simultan berpengaruh signifikan terhadap peningkatan aksesibilitas layanan keuangan formal.`;

const TESTIMONIALS_DATA = [
  {
    name: "Rina Anggraini",
    univ: "Universitas Brawijaya",
    jurusan: "Manajemen Keuangan",
    jenjang: "S1",
    rating: 5,
    text: "Pakai Judul Finder langsung di-ACC dospem pada pengajuan pertama! Padahal senior saya bilang dospem ini terkenal sering nolak judul minimal 3 kali. Fitur research gap-nya beneran ngebantu banget pas ditanya alasan milih topik.",
  },
  {
    name: "Dimas Wahyudi",
    univ: "Universitas Gadjah Mada",
    jurusan: "Ilmu Ekonomi",
    jenjang: "S2 Tesis",
    rating: 5,
    text: "Simulator Sidang AI dengan persona 'Si Dosen Killer' bener-bener melatih mental saya. Pas sidang tesis kemarin, pertanyaan penguji mirip banget sama yang keluar di simulasi BBR. Hasilnya dapat nilai A dan tanpa revisi mayor!",
  },
  {
    name: "Putri Nurhaliza",
    univ: "Universitas Indonesia",
    jurusan: "Ilmu Komunikasi",
    jenjang: "S1",
    rating: 5,
    text: "Parafrase Pintar BBR sangat presisi. Skor Turnitin saya dari 42% turun drastis jadi 11% tanpa merusak arti kalimat ilmiahnya. Beda banget sama AI lain yang bahasanya kaku kayak terjemahan Google Translate jadul.",
  },
  {
    name: "Bayu Kurniawan",
    univ: "Universitas Airlangga",
    jurusan: "Akuntansi",
    jenjang: "S1",
    rating: 5,
    text: "Penyelamat Bab 4! Dulu bingung setengah mati cara menarasikan angka output SPSS dan nilai R-Square. Pakai SPSS Interpreter BBR, langsung keluar paragraf pembahasan akademik yang runut dan logis.",
  },
  {
    name: "Mega Safitri",
    univ: "Institut Teknologi Sepuluh Nopember",
    jurusan: "Sistem Informasi",
    jenjang: "S2 Tesis",
    rating: 5,
    text: "Bibliometrik generatornya luar biasa rapi. Pemetaan tren riset dan novelty tesis saya jadi sangat meyakinkan. Promotor saya mengapresiasi kajian pustaka yang terstruktur.",
  },
  {
    name: "Budi Triprasetyo",
    univ: "Institut Teknologi Bandung",
    jurusan: "Teknik Industri",
    jenjang: "S3 Disertasi",
    rating: 5,
    text: "Alat bantu yang sangat etis dan mendidik. BBR bukan joki, melainkan sparing partner yang melatih kita memahami riset kita sendiri secara mendalam. Sangat saya rekomendasikan untuk mahasiswa akhir.",
  },
];

const FAQS_DATA = [
  {
    q: "Apa perbedaan Belajar Bareng Roselini dengan ChatGPT biasa?",
    a: "ChatGPT biasa adalah AI umum yang sering berhalusinasi rujukan ilmiah dan tidak memahami format naskah akademik Indonesia. BBR dirancang khusus dengan metodologi akademik perguruan tinggi di Indonesia: mengidentifikasi research gap nyata, menarasikan output SPSS/SmartPLS sesuai standar Bab 4, memparafrase sesuai EYD & kaidah ilmiah, serta menyediakan simulasi sidang interaktif dengan karakter dosen penguji nyata.",
  },
  {
    q: "Apakah menggunakan platform BBR melanggar etika akademik?",
    a: "Sama sekali tidak. Belajar Bareng Roselini berprinsip sebagai asisten belajar dan bimbingan cerdas, BUKAN jasa joki tugas akhir. BBR membantu mahasiswa memahami konsep, merumuskan hipotesis, menerjemahkan data statistik, dan melatih kemampuan presentasi saat sidang. Mahasiswa tetap menjadi pengambil keputusan utama dan penulis seutuhnya.",
  },
  {
    q: "Apakah naskah tugas akhir yang saya masukkan aman dan terjaga kerahasiaannya?",
    a: "Sangat aman. Privasi dan orisinalitas risetmu adalah prioritas nomor satu kami. Data draf yang kamu masukkan tidak pernah kami publikasikan, tidak dibagikan ke pihak ketiga, dan tidak digunakan untuk melatih model publik. Hak cipta naskah 100% milikmu.",
  },
  {
    q: "Apakah BBR bisa digunakan untuk jenjang S2 (Tesis) dan S3 (Disertasi)?",
    a: "Ya, tentu saja. BBR mendukung kebutuhan penulisan untuk jenjang S1 (Skripsi), S2 (Tesis), hingga S3 (Disertasi). Kamu bisa menyesuaikan level kedalaman analisis teori, kompleksitas metodologi, serta tingkat ketajaman tanya jawab pada Simulator Sidang.",
  },
  {
    q: "Apa yang dimaksud dengan Akses Lifetime (Sekali Bayar)?",
    a: "Dengan sekali pembayaran promo Rp 199.000, akunmu akan aktif selamanya tanpa biaya langganan bulanan maupun tahunan. Kamu berhak menikmati seluruh 8 tools AI BBR saat ini, serta mendapatkan update fitur-fitur baru di masa depan secara gratis.",
  },
  {
    q: "Bagaimana cara kerja Garansi Uang Kembali 7 Hari?",
    a: "Jika dalam waktu 7 hari setelah aktivasi kamu merasa platform Belajar Bareng Roselini tidak memberikan manfaat nyata untuk proses pengerjaan tugas akhirmu, cukup hubungi tim support WhatsApp kami. Kami akan mengembalikan 100% dana investasimu tanpa syarat berbelit-belit.",
  },
];

const CAMPUSES = [
  "Universitas Indonesia (UI)", "Universitas Gadjah Mada (UGM)", "Institut Teknologi Bandung (ITB)",
  "Institut Pertanian Bogor (IPB)", "Universitas Airlangga (UNAIR)", "Institut Teknologi Sepuluh Nopember (ITS)",
  "Universitas Diponegoro (UNDIP)", "Universitas Padjadjaran (UNPAD)", "Universitas Brawijaya (UB)",
  "Universitas Hasanuddin (UNHAS)", "Universitas Sebelas Maret (UNS)", "Universitas Sumatera Utara (USU)",
  "Universitas Negeri Yogyakarta (UNY)", "Universitas Pendidikan Indonesia (UPI)", "Universitas Negeri Semarang (UNNES)",
  "Universitas Andalas (UNAND)", "Universitas Udayana (UNUD)", "Universitas Telkom", "Universitas Islam Indonesia", "Universitas Bina Nusantara"
];

export default function Home() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState(0);
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);
  const [selectedPersona, setSelectedPersona] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Hero Quick Search Interactive State
  const [heroPrompt, setHeroPrompt] = useState("");
  const [heroSubmitted, setHeroSubmitted] = useState(false);

  // Mini Interactive Tool States
  const [demoInput, setDemoInput] = useState(SAMPLE_TEXT);
  const [paraStyle, setParaStyle] = useState<"akademik" | "ringkas" | "elaboratif">("akademik");
  const [copied, setCopied] = useState(false);

  // Auto rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Text analysis metrics calculation
  const wordCount = demoInput.trim() ? demoInput.trim().split(/\s+/).length : 0;
  const charCount = demoInput.length;
  const sentenceCount = demoInput.trim() ? demoInput.split(/[.!?]+/).filter(Boolean).length : 0;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 180));
  const estimatedPages = (wordCount / 280).toFixed(1);

  // Simulated AI Paraphrase outputs
  const paraphraseOutputs = {
    akademik: `Studi empiris ini menginvestigasi dampak penetrasi financial technology terhadap perluasan inklusi keuangan pada sektor UMKM di Jawa Barat. Dengan menerapkan teknik Structural Equation Modeling berbasis PLS terhadap 250 pelaku usaha, hasil analisis mengonfirmasi bahwa kemudahan dan kegunaan sistemik berkontribusi signifikan terhadap peningkatan adopsi layanan finansial formal.`,
    ringkas: `Penelitian pada 250 UMKM di Jawa Barat membuktikan bahwa kemudahan dan manfaat teknologi finansial secara signifikan mendorong inklusi dan aksesibilitas layanan keuangan formal.`,
    elaboratif: `Melalui pendekatan kuantitatif yang komprehensif pada 250 pelaku UMKM di Jawa Barat, penelitian ini mempertegas urgensi transformasi digital finansial. Analisis SEM-PLS memvalidasi bahwa persepsi kemudahan penggunaan serta ekspektasi kemanfaatan bertindak sebagai determinan kunci yang secara nyata memperluas jangkauan inklusi keuangan formal.`,
  };

  const handleCopyParaphrase = () => {
    navigator.clipboard.writeText(paraphraseOutputs[paraStyle]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-red-500 selection:text-white">
      {/* ═══════════════════════════════════════════════════════════════
          1. STICKY HEADER & MEGA-MENU
         ═══════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
        <div className="container max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 px-2.5 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white font-black text-xs tracking-wider shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform select-none">
              BBR
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight text-slate-900">
                Belajar<span className="text-red-600">Bareng</span>Roselini
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                belajarbarengroselini.site • Asisten AI Tugas Akhir
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            {/* Mega Menu Fitur */}
            <div className="relative group/menu">
              <button
                type="button"
                className="flex items-center gap-1 hover:text-red-600 transition-colors py-2 cursor-pointer"
              >
                <span>Fitur AI</span>
                <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover/menu:rotate-180 text-slate-400 group-hover/menu:text-red-600" />
              </button>

              <div className="invisible opacity-0 group-hover/menu:visible group-hover/menu:opacity-100 absolute left-1/2 -translate-x-1/2 top-full pt-2 transition-all duration-200 w-[580px]">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xl shadow-slate-900/10">
                  <div className="grid grid-cols-2 gap-x-4">
                    <div>
                      <p className="px-3 py-1.5 text-[11px] font-bold text-red-600 uppercase tracking-wider">
                        Fitur Utama Skripsi
                      </p>
                      <Link
                        href="#fitur"
                        className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-red-50/60 transition-colors group/item"
                      >
                        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 text-blue-600 mt-0.5 border border-blue-100">
                          <FileSearch className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 group-hover/item:text-red-600">Judul Finder & Checker</div>
                          <div className="text-[11px] text-slate-500">Ide judul novelty & research gap</div>
                        </div>
                      </Link>

                      <Link
                        href="#fitur"
                        className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-red-50/60 transition-colors group/item"
                      >
                        <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600 mt-0.5 border border-emerald-100">
                          <PenTool className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 group-hover/item:text-red-600">Parafrase Pintar</div>
                          <div className="text-[11px] text-slate-500">6 gaya penulisan anti-Turnitin</div>
                        </div>
                      </Link>

                      <Link
                        href="#fitur"
                        className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-red-50/60 transition-colors group/item"
                      >
                        <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 text-red-600 mt-0.5 border border-red-100">
                          <BarChart3 className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 group-hover/item:text-red-600">SPSS / PLS Interpreter</div>
                          <div className="text-[11px] text-slate-500">Angka statistik jadi narasi Bab 4</div>
                        </div>
                      </Link>

                      <Link
                        href="#sidang"
                        className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-red-50/60 transition-colors group/item"
                      >
                        <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0 text-rose-600 mt-0.5 border border-rose-100">
                          <Presentation className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 group-hover/item:text-red-600">Simulator Sidang AI</div>
                          <div className="text-[11px] text-slate-500">8 persona dosen penguji killer</div>
                        </div>
                      </Link>
                    </div>

                    <div>
                      <p className="px-3 py-1.5 text-[11px] font-bold text-red-600 uppercase tracking-wider">
                        Alat Bantu & Akselerator
                      </p>
                      <Link
                        href="#fitur"
                        className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-red-50/60 transition-colors group/item"
                      >
                        <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 text-purple-600 mt-0.5 border border-purple-100">
                          <Network className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 group-hover/item:text-red-600">Bibliometrik Generator</div>
                          <div className="text-[11px] text-slate-500">State-of-the-art literatur riset</div>
                        </div>
                      </Link>

                      <Link
                        href="#fitur"
                        className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-red-50/60 transition-colors group/item"
                      >
                        <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 text-amber-600 mt-0.5 border border-amber-100">
                          <Calculator className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 group-hover/item:text-red-600">Kompas Statistik</div>
                          <div className="text-[11px] text-slate-500">Pemilihan uji & metodologi data</div>
                        </div>
                      </Link>

                      <Link
                        href="#fitur"
                        className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-red-50/60 transition-colors group/item"
                      >
                        <div className="h-8 w-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 text-violet-600 mt-0.5 border border-violet-100">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 group-hover/item:text-red-600">Klinik Tugas Akhir</div>
                          <div className="text-[11px] text-slate-500">Check-up benang merah Bab 1-5</div>
                        </div>
                      </Link>

                      <Link
                        href="#fitur"
                        className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-red-50/60 transition-colors group/item"
                      >
                        <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600 mt-0.5 border border-emerald-100">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 group-hover/item:text-red-600">Script WA Dosen</div>
                          <div className="text-[11px] text-slate-500">Template chat bimbingan santun</div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 px-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Sekali bayar, akses 8 tools selamanya
                    </span>
                    <Link href="#harga" className="text-red-600 font-semibold hover:underline">
                      Lihat Promo Lifetime →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <a href="#cara-kerja" className="hover:text-red-600 transition-colors">Alur Pengerjaan</a>
            <a href="#demo" className="hover:text-red-600 transition-colors">Coba Analisis</a>
            <a href="#sidang" className="hover:text-red-600 transition-colors">Simulasi Sidang</a>
            <a href="#harga" className="hover:text-red-600 transition-colors">Biaya & Paket</a>
            <a href="#faq" className="hover:text-red-600 transition-colors">FAQ</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-slate-700 hover:text-red-600 px-3 py-2 transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="h-4 w-4" />
              <span>Coba Gratis</span>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenu && (
          <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-4 py-6 space-y-4">
            <nav className="flex flex-col gap-3 font-semibold text-slate-800">
              <a href="#fitur" onClick={() => setMobileMenu(false)} className="py-2 border-b border-slate-100">8 Fitur AI BBR</a>
              <a href="#cara-kerja" onClick={() => setMobileMenu(false)} className="py-2 border-b border-slate-100">Alur Pengerjaan</a>
              <a href="#demo" onClick={() => setMobileMenu(false)} className="py-2 border-b border-slate-100">Coba Analisis Instan</a>
              <a href="#sidang" onClick={() => setMobileMenu(false)} className="py-2 border-b border-slate-100">Simulator Sidang</a>
              <a href="#harga" onClick={() => setMobileMenu(false)} className="py-2 border-b border-slate-100">Biaya & Lifetime</a>
              <a href="#faq" onClick={() => setMobileMenu(false)} className="py-2 border-b border-slate-100">Pertanyaan Umum</a>
            </nav>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenu(false)}
                className="w-full py-3 text-center rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-500/20"
              >
                Masuk ke Workspace
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* ═══════════════════════════════════════════════════════════════
            2. HERO SECTION WITH INTERACTIVE TOPIC PROMPT
           ═══════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-red-500/10 via-rose-400/10 to-transparent blur-[140px]" />
            <div className="absolute top-[20%] right-[-5%] h-[350px] w-[350px] rounded-full bg-red-400/10 blur-[100px]" />
            <div className="absolute top-[30%] left-[-5%] h-[350px] w-[350px] rounded-full bg-amber-400/10 blur-[100px]" />
            {/* Subtle Grid Lines */}
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
                backgroundSize: "64px 64px"
              }}
            />
          </div>

          <div className="container max-w-screen-xl mx-auto px-4">
            {/* Pill Tag */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50/80 px-4 py-1.5 text-xs md:text-sm font-semibold text-red-700 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
                </span>
                <span>Asisten AI Bimbingan Skripsi & Tugas Akhir #1 di Indonesia</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900 max-w-4xl mx-auto">
              Lebih Cerdas & Terarah,
              <br />
              <span className="bg-gradient-to-r from-red-600 via-red-500 to-rose-500 bg-clip-text text-transparent">
                Khusus untuk Skripsi & Tugas Akhir.
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-center text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Bukan AI obrolan biasa. 8 tools yang dirancang spesifik untuk alur tugas akhir mahasiswa Indonesia:
              menemukan judul bernovelty, olah data Bab 4, parafrase Turnitin, hingga simulasi sidang killer.
            </p>

            {/* Interactive Hero Topic Input */}
            <div className="mt-10 mx-auto max-w-2xl w-full">
              <p className="mb-2.5 text-center text-xs md:text-sm font-semibold text-red-600 flex items-center justify-center gap-1.5">
                <Sparkles className="h-4 w-4" /> Coba langsung topik skripsimu sekarang:
              </p>

              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-red-500/20 via-rose-500/20 to-amber-500/20 blur-md opacity-75 animate-pulse" />
                <div className="relative flex items-center rounded-2xl border-2 border-red-200/90 bg-white shadow-xl shadow-red-500/10 transition-all focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100">
                  <input
                    type="text"
                    value={heroPrompt}
                    onChange={(e) => setHeroPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setHeroSubmitted(true);
                    }}
                    placeholder="Contoh: Pengaruh fintech terhadap inklusi keuangan UMKM..."
                    className="flex-1 bg-transparent px-5 py-4 md:py-5 text-sm md:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  <Link
                    href={`/dashboard?prompt=${encodeURIComponent(heroPrompt || "Rekomendasi Judul Skripsi")}`}
                    className="mr-2.5 flex h-11 w-11 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/30 hover:scale-105 active:scale-95 transition-transform"
                    aria-label="Proses Topik"
                  >
                    <SendHorizontal className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              {/* Quick Topic Chips */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">Contoh topik:</span>
                {[
                  "Fintech & UMKM",
                  "Pemasaran Digital Gen Z",
                  "Machine Learning Deteksi",
                  "Hukum Perlindungan Data Pribadi",
                  "Analisis Kinerja Keuangan"
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setHeroPrompt(chip);
                      setHeroSubmitted(true);
                    }}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {heroSubmitted && (
                <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-left animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Analisis Awal BBR untuk: &quot;{heroPrompt}&quot;
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                      Potensi ACC: 94%
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Topik ini memiliki <strong>research gap yang kuat</strong> di kategori adopsi teknologi pasca-pandemi.
                    Direkomendasikan memakai metode SEM-PLS atau Regresi Berganda dengan instrumen survei terverifikasi.
                  </p>
                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-red-200/60">
                    <span className="text-[11px] text-slate-500">Lanjutkan ke analisis komprehensif Bab 1-5?</span>
                    <Link
                      href={`/dashboard?prompt=${encodeURIComponent(heroPrompt)}`}
                      className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                    >
                      Buka di Workspace BBR <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Feature Badges Banner */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 shadow-xs">
                <GraduationCap className="h-3.5 w-3.5 text-red-600" /> Skripsi S1, Tesis S2 & Disertasi S3
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Turnitin-Ready 6 Gaya Bahasa
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 shadow-xs">
                <Presentation className="h-3.5 w-3.5 text-rose-600" /> 8 Persona Dosen Penguji AI
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 shadow-xs">
                <BarChart3 className="h-3.5 w-3.5 text-blue-600" /> SPSS & SmartPLS Interpreter
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 shadow-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" /> Standar 50+ Universitas RI
              </span>
            </div>

            {/* ─── Hero Interactive App Mockup Window ─── */}
            <div className="relative mx-auto mt-14 max-w-4xl">
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-red-600/15 via-rose-500/10 to-amber-500/10 blur-3xl opacity-70" />
              
              <div className="relative rounded-2xl border-2 border-slate-200/90 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden">
                {/* Window Topbar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50/80">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="rounded-lg bg-white border border-slate-200 px-4 py-1 text-[11px] font-medium text-slate-500 flex items-center gap-2 shadow-2xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      belajarbarengroselini.site/workspace
                    </div>
                  </div>
                  <div className="text-[11px] font-semibold text-red-600 hidden sm:block">
                    Platform BBR v2.4
                  </div>
                </div>

                {/* Mockup Body: Split Layout */}
                <div className="grid md:grid-cols-12 min-h-[420px]">
                  {/* Left Stepper Sidebar */}
                  <div className="md:col-span-4 border-r border-slate-100 bg-slate-50/50 p-3.5 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-2">
                        Alur Bimbingan Cepat
                      </p>
                      <div className="space-y-1">
                        {WORKFLOW_STEPS.map((step, idx) => (
                          <button
                            key={step.step}
                            onClick={() => setActiveWorkflow(idx)}
                            className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                              activeWorkflow === idx
                                ? "bg-white shadow-md border border-red-200/80 text-red-700"
                                : "hover:bg-slate-100/70 text-slate-600"
                            }`}
                          >
                            <span
                              className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                                activeWorkflow === idx
                                  ? "bg-red-600 text-white"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {step.step}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold leading-snug truncate">{step.title}</p>
                              <p className="text-[10px] text-slate-400 truncate">{step.tool}</p>
                            </div>
                            {activeWorkflow === idx && (
                              <ChevronRight className="h-4 w-4 text-red-600 shrink-0 self-center" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-red-50/70 border border-red-100 text-left">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 mb-1">
                        <Award className="h-4 w-4" /> Garansi ACC Dosen
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight">
                        Template disesuaikan format Fakultas Ekonomi, Teknik, Hukum, & Kedokteran.
                      </p>
                    </div>
                  </div>

                  {/* Right Preview Pane */}
                  <div className="md:col-span-8 p-5 md:p-6 flex flex-col justify-between bg-white">
                    <div>
                      {/* Step Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                            {WORKFLOW_STEPS[activeWorkflow].mockupBadge}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            Tool: {WORKFLOW_STEPS[activeWorkflow].tool}
                          </span>
                        </div>
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Terverifikasi
                        </span>
                      </div>

                      {/* Content Details */}
                      <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">
                        {WORKFLOW_STEPS[activeWorkflow].previewTitle}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-600 leading-relaxed mb-4">
                        {WORKFLOW_STEPS[activeWorkflow].desc}
                      </p>

                      {/* Interactive Demonstration Box */}
                      {activeWorkflow === 0 && (
                        <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800">5 Rekomendasi Judul Terpilih:</span>
                            <span className="text-red-600 text-[11px] font-bold">ACC Probability 92%</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-white border border-red-200 text-xs text-slate-800 shadow-2xs font-medium">
                            1. Pengaruh Financial Technology terhadap Inklusi Keuangan UMKM dengan Literasi Keuangan sebagai Variabel Mediasi
                          </div>
                          <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-2xs">
                            2. Analisis Minat Adopsi QRIS pada Pedagang Pasar Tradisional Menggunakan Model UTAUT 2
                          </div>
                          <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-2xs">
                            3. Peran Perbankan Digital dalam Meningkatkan Efisiensi Operasional UMKM Pasca-Pandemi
                          </div>
                        </div>
                      )}

                      {activeWorkflow === 1 && (
                        <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                            <span>Status Penyusunan Bab 1-3</span>
                            <span className="text-emerald-600">Selesai 100%</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="p-2 bg-white rounded-lg border border-slate-200">
                              <p className="text-[10px] text-slate-400">Bab 1</p>
                              <p className="font-bold text-slate-800">Pendahuluan</p>
                              <p className="text-[10px] text-emerald-600">2.410 kata</p>
                            </div>
                            <div className="p-2 bg-white rounded-lg border border-slate-200">
                              <p className="text-[10px] text-slate-400">Bab 2</p>
                              <p className="font-bold text-slate-800">Landasan Teori</p>
                              <p className="text-[10px] text-emerald-600">3.850 kata</p>
                            </div>
                            <div className="p-2 bg-white rounded-lg border border-slate-200">
                              <p className="text-[10px] text-slate-400">Bab 3</p>
                              <p className="font-bold text-slate-800">Metodologi</p>
                              <p className="text-[10px] text-emerald-600">1.920 kata</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeWorkflow === 2 && (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                          <div className="flex items-center justify-between font-semibold text-slate-800">
                            <span>Interpretasi Regresi Linear & Uji t:</span>
                            <span className="text-blue-600">R² = 0.584</span>
                          </div>
                          <p className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 leading-relaxed">
                            &ldquo;Nilai t-hitung sebesar 3.420 lebih besar dari t-tabel (1.970) dengan signifikansi 0.001 &lt; 0.05,
                            sehingga H1 diterima. Artinya, fintech terbukti berpengaruh positif dan signifikan terhadap inklusi keuangan.&rdquo;
                          </p>
                        </div>
                      )}

                      {activeWorkflow === 3 && (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
                          <div className="relative h-16 w-16 shrink-0 flex items-center justify-center rounded-full bg-emerald-50 border-4 border-emerald-500">
                            <span className="text-base font-extrabold text-emerald-600">11%</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                              <ShieldCheck className="h-4 w-4" /> Turnitin Hijau & Aman Lolos
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                              Paragraf diparafrase otomatis dengan sinonim akademik presisi tanpa kehilangan esensi grand theory penelitian.
                            </p>
                          </div>
                        </div>
                      )}

                      {activeWorkflow === 4 && (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-slate-800">
                            <span className="font-bold flex items-center gap-1.5 text-red-700">
                              <Flame className="h-3.5 w-3.5" /> Pertanyaan Dosen Penguji (Killer Mode):
                            </span>
                            <span className="text-xs font-semibold text-emerald-600">Skor: 88/100 (A-)</span>
                          </div>
                          <p className="p-2.5 rounded-lg bg-white border border-red-200 text-slate-700 italic">
                            &ldquo;Apa landasan teoritis Saudara memilih 250 sampel? Mengapa tidak menggunakan rumus Yamane? Buktikan data Anda berdistribusi normal!&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">
                        {WORKFLOW_STEPS[activeWorkflow].previewMeta}
                      </span>
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700"
                      >
                        Buka Tool Ini <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            3. SOCIAL PROOF STATS STRIP
           ═══════════════════════════════════════════════════════════════ */}
        <section className="border-y border-slate-200/80 bg-slate-50/60 py-8">
          <div className="container max-w-screen-xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="flex items-center gap-3.5 justify-center">
                <div className="h-11 w-11 rounded-xl bg-red-100/80 flex items-center justify-center shrink-0 text-red-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    <AnimatedCounter target={2847} suffix="+" />
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Mahasiswa Aktif Terbantu</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 justify-center">
                <div className="h-11 w-11 rounded-xl bg-emerald-100/80 flex items-center justify-center shrink-0 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    <AnimatedCounter target={98} suffix="%" />
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Tingkat Kepuasan & ACC</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 justify-center">
                <div className="h-11 w-11 rounded-xl bg-blue-100/80 flex items-center justify-center shrink-0 text-blue-600">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    <AnimatedCounter target={54} suffix="+" />
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Universitas di Indonesia</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 justify-center">
                <div className="h-11 w-11 rounded-xl bg-rose-100/80 flex items-center justify-center shrink-0 text-rose-600">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    <span>8 Tools</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">AI Khusus Tugas Akhir</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            4. WORKFLOW STEPPER CARDS (CARA KERJA)
           ═══════════════════════════════════════════════════════════════ */}
        <section id="cara-kerja" className="py-20 md:py-28 bg-white border-b border-slate-200/80 scroll-mt-20">
          <div className="container max-w-screen-xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold tracking-widest text-red-600 uppercase mb-2 block">
                Sistematis & Terstruktur
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                30 Detik Mulai. 5 Langkah Selesai.
              </h2>
              <p className="mt-4 text-slate-600 text-base md:text-lg leading-relaxed">
                Nggak ada lagi drama nunggu balasan chat dosen berminggu-minggu. Platform BBR memandu dari penetapan judul hingga kamu berdiri percaya diri di depan dewan penguji.
              </p>
            </div>

            {/* Steps Visual Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {WORKFLOW_STEPS.map((s, idx) => (
                <div
                  key={s.step}
                  className="group relative rounded-2xl border-2 border-slate-200/80 bg-slate-50/40 p-5 hover:bg-white hover:border-red-400 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
                        {s.step}
                      </span>
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        Step {s.step}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-red-600 transition-colors mb-2">
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      {s.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>{s.tool}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>

            {/* Guarantee Tagline Banner */}
            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border border-red-200/70 max-w-2xl mx-auto text-center shadow-xs">
              <p className="text-sm md:text-base text-slate-800 font-semibold">
                ✨ Membantu mahasiswa jenjang <span className="text-red-700 font-bold">S1 (Skripsi)</span>, <span className="text-red-700 font-bold">S2 (Tesis)</span>, dan <span className="text-red-700 font-bold">S3 (Disertasi)</span> dengan terminologi baku universitas Indonesia.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            5. LIVE INTERACTIVE MINI-TOOL WIDGET ("TEMPEL TEKS & ANALISIS")
           ═══════════════════════════════════════════════════════════════ */}
        <section id="demo" className="py-20 md:py-24 bg-slate-50/70 border-b border-slate-200/80 scroll-mt-20">
          <div className="container max-w-screen-xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600 mb-3">
                <Sparkles className="h-3.5 w-3.5" /> Uji Coba Langsung di Browser
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                Tempel Draf Skripsi, Analisis Seketika
              </h2>
              <p className="mt-3 text-slate-600 text-sm md:text-base">
                Ketik atau tempel paragraf skripsimu untuk menguji metrik keterbacaan, estimasi Turnitin, dan hasil parafrase instan.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 max-w-5xl mx-auto items-start">
              {/* Input Area */}
              <div className="lg:col-span-6 bg-white rounded-2xl border-2 border-slate-200 p-4 md:p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-red-600" /> Teks Naskah Asli
                  </span>
                  <button
                    type="button"
                    onClick={() => setDemoInput(SAMPLE_TEXT)}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" /> Pakai Contoh Skripsi
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  placeholder="Ketik atau tempelkan draf paragraf skripsi/tesismu di sini..."
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-xs md:text-sm text-slate-800 leading-relaxed placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 resize-none font-sans"
                />

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>{charCount} karakter</span>
                  <button
                    type="button"
                    onClick={() => setDemoInput("")}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    Bersihkan
                  </button>
                </div>
              </div>

              {/* Analysis & Parafrase Output */}
              <div className="lg:col-span-6 space-y-3.5">
                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs text-center">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Kata</p>
                    <p className="text-xl font-extrabold text-slate-900 mt-0.5">{wordCount}</p>
                    <p className="text-[10px] text-slate-500">~{estimatedPages} Halaman A4</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs text-center">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Kalimat</p>
                    <p className="text-xl font-extrabold text-blue-600 mt-0.5">{sentenceCount}</p>
                    <p className="text-[10px] text-slate-500">{estimatedReadTime} mnt baca</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 shadow-2xs text-center">
                    <p className="text-[10px] text-emerald-700 font-semibold uppercase">Turnitin Safety</p>
                    <p className="text-xl font-extrabold text-emerald-600 mt-0.5">Aman</p>
                    <p className="text-[10px] text-emerald-700">Skor Rendah</p>
                  </div>
                </div>

                {/* Paraphrase Preview Box */}
                <div className="rounded-2xl border-2 border-red-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                      <Wand2 className="h-4 w-4" /> Hasil Parafrase Pintar BBR
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyParaphrase}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Style Toggle Chips */}
                  <div className="flex gap-1.5 mt-3 mb-2.5">
                    {[
                      { key: "akademik", label: "Standar Akademik" },
                      { key: "ringkas", label: "Ringkas & Padat" },
                      { key: "elaboratif", label: "Elaboratif (Q1)" },
                    ].map((style) => (
                      <button
                        key={style.key}
                        type="button"
                        onClick={() => setParaStyle(style.key as any)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                          paraStyle === style.key
                            ? "bg-red-600 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>

                  {/* Paraphrase Text Result */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs md:text-sm text-slate-800 leading-relaxed italic">
                    &ldquo;{paraphraseOutputs[paraStyle]}&rdquo;
                  </div>

                  <p className="mt-2.5 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Struktur dioptimasi untuk mempertahankan istilah baku dan lolos sensor plagiarisme.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            6. 8 TOOLS AI FITUR UNGGULAN BBR
           ═══════════════════════════════════════════════════════════════ */}
        <section id="fitur" className="py-20 md:py-28 bg-white border-b border-slate-200/80 scroll-mt-20">
          <div className="container max-w-screen-xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold tracking-widest text-red-600 uppercase mb-2 block">
                Semua Kebutuhan dalam 1 Tempat
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                8 Tools AI Khusus Tugas Akhir
              </h2>
              <p className="mt-4 text-slate-600 text-base md:text-lg leading-relaxed">
                Setiap alat dibangun berdasarkan studi kasus nyata ribuan mahasiswa, bukan sekadar chatbot biasa.
              </p>
            </div>

            {/* Desktop Tabs & Preview */}
            <div className="hidden lg:grid grid-cols-12 gap-8 items-start">
              {/* Tab List */}
              <div className="col-span-5 space-y-2">
                {BBR_FEATURES.map((feat, idx) => {
                  const Icon = feat.icon;
                  const isActive = activeFeatureTab === idx;
                  return (
                    <button
                      key={feat.id}
                      type="button"
                      onClick={() => setActiveFeatureTab(idx)}
                      className={`w-full flex items-start gap-3.5 p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                        isActive
                          ? "bg-red-50/70 border-2 border-red-500 shadow-sm"
                          : "bg-slate-50/60 border-2 border-transparent hover:bg-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${feat.bgIcon}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className={`text-sm font-bold truncate ${isActive ? "text-red-700" : "text-slate-800"}`}>
                            {feat.title}
                          </h3>
                          <span className="text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                            {feat.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">{feat.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Showcase Panel */}
              <div className="col-span-7 sticky top-24">
                <div className="rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-xl space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border ${BBR_FEATURES[activeFeatureTab].bgIcon}`}>
                        {(() => {
                          const CurrentIcon = BBR_FEATURES[activeFeatureTab].icon;
                          return <CurrentIcon className="h-7 w-7" />;
                        })()}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                          {BBR_FEATURES[activeFeatureTab].badge}
                        </span>
                        <h3 className="text-2xl font-extrabold text-slate-900">
                          {BBR_FEATURES[activeFeatureTab].title}
                        </h3>
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1">
                      Fitur Siap Digunakan
                    </span>
                  </div>

                  <p className="text-base text-slate-600 leading-relaxed">
                    {BBR_FEATURES[activeFeatureTab].desc}
                  </p>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Cara Kerjanya di Platform BBR:
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {BBR_FEATURES[activeFeatureTab].detail}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{BBR_FEATURES[activeFeatureTab].highlight}</span>
                    </div>

                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-md shadow-red-500/20 hover:scale-105 transition-transform"
                    >
                      Buka di Dashboard <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Cards Grid */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
              {BBR_FEATURES.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.id}
                    className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 ${feat.bgIcon}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-red-600 uppercase">{feat.badge}</span>
                        <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                      <strong>Cara Kerja:</strong> {feat.detail}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            7. SIMULATOR SIDANG & 8 PERSONA DOSEN PENGUJI
           ═══════════════════════════════════════════════════════════════ */}
        <section id="sidang" className="py-20 md:py-28 bg-slate-50/60 border-b border-slate-200/80 scroll-mt-20">
          <div className="container max-w-screen-xl mx-auto px-4">
            <div className="grid lg:grid-cols-12 gap-10 items-center max-w-6xl mx-auto">
              {/* Left Explanatory Column */}
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                  <Flame className="h-3.5 w-3.5" /> Latihan Mental Sidang Skripsi
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
                  Simulasi Sidang dengan 8 Dosen Penguji AI
                </h2>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                  Banyak mahasiswa gagal bukan karena naskahnya jelek, tapi karena gugup dan blank saat dibombardir pertanyaan penguji.
                  BBR menghadirkan simulasi realistis dengan beragam persona dosen kampus.
                </p>

                <div className="space-y-3 pt-2">
                  {[
                    "200+ bank soal sidang nyata dari berbagai program studi",
                    "Simulasi interaktif tanya-jawab real-time",
                    "Feedback langsung terhadap kekurangan argumenmu",
                    "Prediksi skor kelulusan dan tips mitigasi revisi",
                  ].map((bullet, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs md:text-sm text-slate-700 font-medium">
                      <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-sm shadow-md shadow-red-500/20 hover:scale-105 transition-transform"
                  >
                    <Presentation className="h-4 w-4" /> Coba Simulasi Sidang Sekarang
                  </Link>
                </div>
              </div>

              {/* Right Persona Cards Showcase */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {DOSEN_PERSONAS.map((persona, idx) => (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => setSelectedPersona(idx)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        selectedPersona === idx
                          ? "bg-white border-red-500 shadow-md scale-[1.02]"
                          : "bg-white/80 border-slate-200 hover:border-red-300 hover:bg-white"
                      }`}
                    >
                      <span className="text-3xl block mb-1.5">{persona.avatar}</span>
                      <p className="font-bold text-xs md:text-sm text-slate-900 truncate">{persona.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{persona.tag}</p>
                    </button>
                  ))}
                </div>

                {/* Active Persona Dialogue Box */}
                <div className="rounded-2xl border-2 border-red-200 bg-white p-5 md:p-6 shadow-md space-y-3.5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{DOSEN_PERSONAS[selectedPersona].avatar}</span>
                      <div>
                        <h4 className="font-bold text-sm md:text-base text-slate-900">
                          {DOSEN_PERSONAS[selectedPersona].name}
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          Peran: {DOSEN_PERSONAS[selectedPersona].role} • Tingkat Tekanan: {DOSEN_PERSONAS[selectedPersona].difficulty}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-full">
                      Persona Aktif
                    </span>
                  </div>

                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                    {DOSEN_PERSONAS[selectedPersona].desc}
                  </p>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> Contoh Pertanyaan Sidang:
                    </span>
                    <p className="text-xs md:text-sm font-semibold text-slate-800 italic leading-relaxed">
                      &ldquo;{DOSEN_PERSONAS[selectedPersona].sampleQuestion}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">
                      Nilai kesiapanmu dievaluasi otomatis (A, B+, B, atau Ujian Ulang).
                    </span>
                    <Link
                      href="/dashboard"
                      className="font-bold text-red-600 hover:text-red-700 hover:underline"
                    >
                      Mulai Tanya Jawab →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            8. UNIVERSITAS KAMPUS CLOUD
           ═══════════════════════════════════════════════════════════════ */}
        <section className="py-14 bg-white border-b border-slate-200/80">
          <div className="container max-w-screen-xl mx-auto px-4 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Format Pedoman Penulisan Dikalibrasi Untuk
            </p>
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-6">
              Mahasiswa dari 50+ Universitas Negeri & Swasta di Indonesia
            </h3>

            <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
              {CAMPUSES.map((univ) => (
                <span
                  key={univ}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  {univ}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            9. COMPARISON MATRIX: AI BIASA VS BBR
           ═══════════════════════════════════════════════════════════════ */}
        <section className="py-20 md:py-28 bg-slate-50/60 border-b border-slate-200/80">
          <div className="container max-w-screen-xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold tracking-widest text-red-600 uppercase mb-2 block">
                Mengapa Memilih BBR?
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                AI Generik Biasa vs Belajar Bareng Roselini
              </h2>
              <p className="mt-4 text-slate-600 text-base md:text-lg">
                ChatGPT sering halusinasi kutipan ilmiah dan tak kenal sistematika skripsi Indonesia.
                BBR dibangun spesifik untuk menyelesaikan tugas akhirmu.
              </p>
            </div>

            <div className="max-w-4xl mx-auto rounded-3xl border-2 border-slate-200 bg-white overflow-hidden shadow-xl">
              {/* Header */}
              <div className="grid grid-cols-12 p-4 md:p-6 bg-slate-100/70 border-b border-slate-200 font-bold text-xs md:text-sm text-slate-800">
                <div className="col-span-5 md:col-span-4">Aspek Kebutuhan Skripsi</div>
                <div className="col-span-3 md:col-span-4 text-center text-slate-500">ChatGPT / AI Biasa</div>
                <div className="col-span-4 text-center text-red-600 font-extrabold flex items-center justify-center gap-1">
                  <Sparkles className="h-4 w-4" /> Belajar Bareng Roselini
                </div>
              </div>

              {/* Rows */}
              {[
                {
                  aspek: "Penulisan Bab 1 s.d 5",
                  generic: "Hanya tanya jawab sepotong, tak ada alur naskah",
                  bbr: "Terstruktur utuh dari Judul sampai Kesimpulan",
                },
                {
                  aspek: "Sitasi & Rujukan Ilmiah",
                  generic: "Sering mengarang DOI dan buku fiktif",
                  bbr: "Kajian pustaka berbasis riset riil & research gap",
                },
                {
                  aspek: "Olah Data Statistik (Bab 4)",
                  generic: "Sulit memahami output tabel SPSS/PLS",
                  bbr: "Otomatis konversi nilai uji ke narasi pembahasan",
                },
                {
                  aspek: "Lolos Uji Turnitin",
                  generic: "Terdeteksi pola AI, struktur monoton",
                  bbr: "6 gaya parafrase akademik dengan skor rendah",
                },
                {
                  aspek: "Persiapan Mental Sidang",
                  generic: "Tidak ada fitur simulasi sidang penguji",
                  bbr: "8 persona dosen killer dengan penilaian riil",
                },
                {
                  aspek: "Biaya & Langganan",
                  generic: "Langganan bulanan mahal (~$20/bulan)",
                  bbr: "Sekali Bayar Rp 199.000, Akses Seumur Hidup",
                },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 p-4 md:p-5 border-b border-slate-100 last:border-b-0 items-center text-xs md:text-sm hover:bg-slate-50/60 transition-colors"
                >
                  <div className="col-span-5 md:col-span-4 font-semibold text-slate-800">
                    {row.aspek}
                  </div>
                  <div className="col-span-3 md:col-span-4 text-center text-slate-500 px-2">
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <X className="h-4 w-4 text-red-400 shrink-0 hidden sm:inline" />
                      {row.generic}
                    </span>
                  </div>
                  <div className="col-span-4 text-center text-slate-900 font-bold px-2">
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      {row.bbr}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            10. TESTIMONIALS CAROUSEL & CARDS
           ═══════════════════════════════════════════════════════════════ */}
        <section id="testimoni" className="py-20 md:py-28 bg-white border-b border-slate-200/80 scroll-mt-20">
          <div className="container max-w-screen-xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold tracking-widest text-red-600 uppercase mb-2 block">
                Cerita Kelulusan
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                Mereka yang Berhasil Lolos & Wisuda Tepat Waktu
              </h2>
              <p className="mt-4 text-slate-600 text-base md:text-lg">
                Ulasan jujur dari mahasiswa pejuang skripsi dan tesis di berbagai penjuru Indonesia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {TESTIMONIALS_DATA.map((t, idx) => (
                <div
                  key={t.name}
                  className={`rounded-3xl border-2 p-6 transition-all flex flex-col justify-between ${
                    idx === activeTestimonial
                      ? "border-red-500 bg-red-50/30 shadow-lg scale-[1.02]"
                      : "border-slate-200 bg-white hover:border-red-300 hover:shadow-md"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs md:text-sm text-slate-700 leading-relaxed mb-6 italic">
                      &ldquo;{t.text}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-600 to-rose-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
                      {t.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-900 truncate">{t.name}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {t.jenjang} • {t.univ}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial Nav Indicators */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {TESTIMONIALS_DATA.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    activeTestimonial === i ? "w-8 bg-red-600" : "w-2.5 bg-slate-200 hover:bg-slate-300"
                  }`}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            11. PRICING (COBA GRATIS & LIFETIME ACCESS PLAN)
           ═══════════════════════════════════════════════════════════════ */}
        <section id="harga" className="py-20 md:py-28 bg-slate-50/70 border-b border-slate-200/80 scroll-mt-20">
          <div className="container max-w-screen-xl mx-auto px-4 text-center">
            <span className="text-xs font-bold tracking-widest text-[var(--color-brand-700)] uppercase mb-2 block">
              Pilihan Paket Fleksibel
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
              Mulai Gratis, Upgrade Kapan Saja
            </h2>
            <p className="mt-4 text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
              Coba langsung kecanggihan AI tanpa risiko. Atau pilih Paket Lifetime sekali bayar untuk kuota melimpah hingga resmi wisuda.
            </p>

            {/* Pricing Grid: 2 Cards Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mt-12 items-stretch text-left">
              {/* Card 1: Paket Coba Gratis */}
              <div className="rounded-3xl border border-zinc-200 bg-white p-8 md:p-9 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900">Paket Coba Gratis</h3>
                      <p className="text-xs text-slate-500">Starter kuota untuk uji coba fitur</p>
                    </div>
                    <span className="rounded-lg bg-zinc-100 text-zinc-700 font-bold text-xs px-3 py-1 border border-zinc-200">
                      Free Starter
                    </span>
                  </div>

                  <div className="mb-2 flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                      Rp 0
                    </span>
                    <span className="text-xs font-semibold text-slate-500">/ selamanya</span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium mb-6">
                    Tanpa kartu kredit • Langsung pakai setelah daftar
                  </p>

                  {/* Free Features List */}
                  <div className="space-y-3 mb-8">
                    <div className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Kuota Fitur Starter:</div>
                    <ul className="space-y-2.5">
                      {[
                        "3x Parafrase AI (Anti-Turnitin 6 Gaya)",
                        "3x Asisten Penulisan & Bedah Draf Naskah",
                        "3x Judul Finder & ACC Checker",
                        "2x SPSS & SmartPLS Interpreter Bab 4",
                        "1 Sesi Simulator Sidang AI Interaktif",
                        "5x Sitasi Jurnal Otomatis (APA 7th)",
                        "5x Script WA Dosen Pembimbing",
                        "1x Kompilasi Dokumen Word Standar",
                      ].map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <Link
                    href="/dashboard"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-sm transition-all text-center border border-zinc-300/80"
                  >
                    <span>Mulai Coba Gratis Sekarang</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <p className="text-[11px] text-center text-zinc-400 mt-2.5">
                    Bisa beli add-on kuota satuan kapan saja jika butuh tambahan
                  </p>
                </div>
              </div>

              {/* Card 2: Paket Lifetime Mahasiswa (Pro) */}
              <div className="relative rounded-3xl border-2 border-[var(--color-brand-600)] bg-white p-8 md:p-9 shadow-xl flex flex-col justify-between">
                {/* Popular Pill */}
                <div className="absolute -top-3.5 right-8 rounded-full bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-500)] px-3.5 py-1 text-xs font-extrabold text-white uppercase tracking-wider shadow-md">
                  🔥 Paling Populer & Hemat
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900">Paket Lifetime Mahasiswa</h3>
                      <p className="text-xs text-[var(--color-brand-700)] font-semibold">Akses penuh dengan kuota melimpah</p>
                    </div>
                    <span className="rounded-lg bg-[var(--color-brand-50)] text-[var(--color-brand-700)] font-bold text-xs px-3 py-1 border border-[var(--color-brand-200)]">
                      Hemat 60%
                    </span>
                  </div>

                  <div className="mb-2 flex items-baseline gap-3">
                    <span className="text-sm text-slate-400 line-through">Rp 499.000</span>
                    <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                      Rp 199<span className="text-2xl font-bold">.000</span>
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-brand-700)] font-semibold mb-6">
                    Sekali bayar untuk selamanya • Tanpa biaya perpanjangan
                  </p>

                  {/* Pro Features List */}
                  <div className="space-y-3 mb-8">
                    <div className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Kuota Melimpah Hingga Lulus:</div>
                    <ul className="space-y-2.5">
                      {[
                        "250x Parafrase AI (Anti-Turnitin)",
                        "150x Asisten Penulisan & Bedah Draf Naskah",
                        "50x Judul Finder & ACC Checker",
                        "50x SPSS & SmartPLS Interpreter Bab 4",
                        "15 Sesi Simulator Sidang AI Penuh (Audio TTS)",
                        "100x Sitasi & Metadata Jurnal APA 7th",
                        "100x Script WA Dosen Pembimbing",
                        "30x Kompilasi Dokumen Word Standar Kampus",
                        "Akses update fitur & tools baru selamanya",
                      ].map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-800 font-medium">
                          <CheckCircle2 className="h-4 w-4 text-[var(--color-brand-600)] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <a
                    href="https://lynk.id/belajarbarengroseline/s/lifetime-bbr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] text-white font-extrabold text-sm shadow-lg shadow-[var(--color-brand-600)]/20 hover:scale-[1.01] active:scale-100 transition-all text-center"
                  >
                    <span>Aktivasi Akses Penuh (Rp 199.000)</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            12. FAQ SECTION
           ═══════════════════════════════════════════════════════════════ */}
        <section id="faq" className="py-20 md:py-28 bg-white border-b border-slate-200/80 scroll-mt-20">
          <div className="container max-w-screen-xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold tracking-widest text-red-600 uppercase mb-2 block">
                Punya Pertanyaan?
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="mt-4 text-slate-600 text-base md:text-lg">
                Semua yang perlu kamu ketahui tentang cara kerja, legalitas, dan keamanan platform BBR.
              </p>
            </div>

            <div className="max-w-3xl mx-auto rounded-2xl border-2 border-slate-200 bg-slate-50/40 p-6 md:p-8">
              {FAQS_DATA.map((faq, idx) => (
                <FAQItem key={idx} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            13. FINAL HIGH-CONVERTING CTA BANNER
           ═══════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-r from-red-600 via-red-600 to-rose-600 text-white">
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
                backgroundSize: "28px 28px"
              }}
            />
          </div>

          <div className="container max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              Teman Seangkatanmu Sudah Mulai Bab 4.<br />
              Kapan Giliranmu Selesai?
            </h2>
            <p className="text-white/85 text-base md:text-lg mb-10 leading-relaxed max-w-xl mx-auto">
              Jangan biarkan skripsi berlarut-larut sampai kena denda semester. Dapatkan asisten AI bimbingan pribadi sekarang dan raih gelarmu tepat waktu.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-red-600 font-extrabold text-base shadow-xl hover:bg-red-50 hover:scale-105 active:scale-100 transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Coba Belajar Bareng Roselini Sekarang</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 text-xs text-white/70">
              <span>🔒 Pembayaran Aman</span>
              <span>•</span>
              <span>⚡ Akses Instan</span>
              <span>•</span>
              <span>🎓 Garansi 7 Hari</span>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════════════════
          14. FOOTER
         ═══════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 px-2 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white font-black text-xs tracking-wider shadow-xs select-none">
                  BBR
                </div>
                <span className="font-bold text-base text-slate-900 tracking-tight">
                  BelajarBarengRoselini
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Platform bimbingan dan akselerasi tugas akhir AI untuk mahasiswa Indonesia. Lulus tepat waktu dengan integritas akademik.
              </p>
              <div className="text-xs text-slate-400">
                belajarbarengroselini.site • All rights reserved
              </div>
            </div>

            {/* Links Fitur */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Fitur Unggulan
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><a href="#fitur" className="hover:text-red-600 transition-colors">Judul Finder & Checker</a></li>
                <li><a href="#fitur" className="hover:text-red-600 transition-colors">Parafrase Pintar</a></li>
                <li><a href="#fitur" className="hover:text-red-600 transition-colors">SPSS / PLS Interpreter</a></li>
                <li><a href="#sidang" className="hover:text-red-600 transition-colors">Simulator Sidang AI</a></li>
                <li><a href="#fitur" className="hover:text-red-600 transition-colors">Bibliometrik Generator</a></li>
                <li><a href="#fitur" className="hover:text-red-600 transition-colors">Script WA Dosen</a></li>
              </ul>
            </div>

            {/* Links Navigasi */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Navigasi
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><a href="#cara-kerja" className="hover:text-red-600 transition-colors">Alur Pengerjaan</a></li>
                <li><a href="#demo" className="hover:text-red-600 transition-colors">Uji Analisis Draf</a></li>
                <li><a href="#harga" className="hover:text-red-600 transition-colors">Biaya Lifetime Promo</a></li>
                <li><a href="#testimoni" className="hover:text-red-600 transition-colors">Testimoni Mahasiswa</a></li>
                <li><a href="#faq" className="hover:text-red-600 transition-colors">Pertanyaan Umum (FAQ)</a></li>
                <li><Link href="/dashboard" className="hover:text-red-600 transition-colors">Login Workspace</Link></li>
              </ul>
            </div>

            {/* Legal & Kontak */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Bantuan & Kontak
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><span>📧 support@belajarbarengroselini.site</span></li>
                <li><span>💬 WhatsApp: +62 812-3456-7890</span></li>
                <li><span>📍 Jakarta & Bandung, Indonesia</span></li>
                <li className="pt-2 text-[11px] text-slate-400">
                  Operasional Bimbingan 24/7
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <p>© {new Date().getFullYear()} Belajar Bareng Roselini (BBR). Hak cipta dilindungi.</p>
            <p className="flex items-center gap-1 text-slate-400">
              Dibuat dengan <Heart className="h-3 w-3 text-red-500 fill-red-500" /> untuk mahasiswa pejuang skripsi Indonesia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
