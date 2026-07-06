"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, BookOpen, PenTool, Presentation, BarChart, Network, FileSearch,
  Calculator, MessageSquare, ShieldCheck, CheckCircle2, Star, ChevronDown,
  ChevronRight, Zap, Clock, Award, Users, Menu, X, Sparkles, GraduationCap,
  TrendingUp, Brain, Target, Heart, Shield
} from "lucide-react";

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let current = 0;
        const step = Math.max(1, Math.floor(target / 60));
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(timer); }
          setCount(current);
        }, 25);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{prefix}{count.toLocaleString("id-ID")}{suffix}</span>;
}

/* ─── FAQ Item ─── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--color-bg-muted)] last:border-b-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left group">
        <span className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-600)] transition-colors pr-4">{q}</span>
        <ChevronDown size={20} className={`text-[var(--color-text-secondary)] transition-transform duration-300 shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-[var(--color-text-secondary)] leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ─── Feature Tab ─── */
const FEATURES = [
  { icon: FileSearch, title: "Judul Finder & Checker", emoji: "🎯", desc: "AI menemukan dan memvalidasi ide judul tugas akhir yang unik, relevan, dan minim revisi dari dosen pembimbing.", detail: "Masukkan bidang studi, objek, dan metode, lalu AI akan langsung menghasilkan 5 rekomendasi judul beserta alasan akademiknya.", color: "bg-blue-500" },
  { icon: PenTool, title: "Parafrase Pintar", emoji: "✍️", desc: "Tulis ulang paragraf dengan 6 gaya bahasa akademik berbeda untuk lolos Turnitin tanpa kehilangan makna.", detail: "Pilih gaya: Jurnal Q1, Standar Akademik, Sederhana, Ringkas, Elaboratif, atau Anti-Turnitin. AI langsung memparafrasenya.", color: "bg-green-500" },
  { icon: Network, title: "Bibliometrik Generator", emoji: "🗺️", desc: "Petakan state-of-the-art, temukan research gap, dan analisis trend penelitian terkini di bidangmu.", detail: "Input kata kunci topik dan rentang tahun, AI akan memetakan tren, tema besar, dan celah penelitian yang bisa kamu ambil.", color: "bg-purple-500" },
  { icon: Calculator, title: "Kompas Statistik", emoji: "🧭", desc: "Bingung pilih metode analisis data? AI merekomendasikan alat statistik yang tepat berdasarkan tujuan penelitianmu.", detail: "Jawab 3 pertanyaan tentang jenis variabel dan tujuan risetmu, AI langsung merekomendasikan uji statistik beserta alasannya.", color: "bg-orange-500" },
  { icon: BarChart, title: "SPSS / PLS Interpreter", emoji: "📊", desc: "Ubah angka output SPSS, SmartPLS, EViews, atau AMOS jadi kalimat interpretasi Bab 4 yang siap pakai.", detail: "Input nilai t hitung, p-value, R-square dll, AI akan menyusun kalimat interpretasi akademik lengkap beserta kesimpulannya.", color: "bg-teal-500" },
  { icon: Presentation, title: "Simulator Sidang AI", emoji: "🎤", desc: "Latih sidang dengan 8 persona dosen penguji berbeda, mulai dari Si Metodologi sampai Si Dosen Killer.", detail: "Pilih tipe dosen penguji, input judul & abstrakmu, lalu mulai sesi tanya jawab real-time layaknya sidang sungguhan.", color: "bg-red-500" },
  { icon: ShieldCheck, title: "Klinik Tugas Akhir", emoji: "🏥", desc: "Check-up kesehatan draf Tugas Akhirmu sebelum menghadap dosen. Dapatkan diagnosis dan resep perbaikan.", detail: "Uji kelayakan draf dari Bab 1 hingga 5. AI bertindak sebagai dokter yang akan mendiagnosis 'penyakit' pada tulisanmu dan memberikan resep perbaikan.", color: "bg-rose-500" },
  { icon: MessageSquare, title: "Script WA Dosen", emoji: "💬", desc: "Template chat WhatsApp sopan dan profesional untuk berbagai situasi komunikasi dengan dosen.", detail: "Pilih konteks: minta bimbingan, izin perpanjangan, konfirmasi revisi, dan AI akan membuatkan pesan WA yang tinggal disalin.", color: "bg-emerald-500" },
];

const TESTIMONIALS = [
  { name: "Rina A.", univ: "Univ. Brawijaya", text: "Saya pakai Judul Finder dan langsung ACC dosen pembimbing di percobaan pertama. Biasanya butuh 3-4x revisi!", rating: 5, jenjang: "S1" },
  { name: "Dimas W.", univ: "UGM", text: "Simulator Sidang benar-benar menguji ketajaman argumen disertasi saya. Pas sidang tertutup, saya jauh lebih tenang dan siap.", rating: 5, jenjang: "S3" },
  { name: "Putri N.", univ: "UI", text: "Parafrase Tool-nya ajaib. Turnitin saya turun dari 45% ke 12% tanpa mengubah makna sama sekali. Sangat terbantu!", rating: 5, jenjang: "S2" },
  { name: "Bayu K.", univ: "Univ. Airlangga", text: "SPSS Interpreter-nya bikin saya ngerti angka-angka yang selama ini cuma asal salin. Bab 4 jadi lebih berbobot.", rating: 5, jenjang: "S1" },
  { name: "Mega S.", univ: "ITS", text: "Bibliometrik Generator-nya luar biasa. Research gap saya langsung ketemu, dan dosen bilang analisis saya lebih kuat.", rating: 5, jenjang: "S2" },
  { name: "Budi T.", univ: "ITB", text: "Analisis trend penelitiannya sangat membantu menemukan celah kebaruan untuk disertasi saya. Promotor saya sangat puas.", rating: 5, jenjang: "S3" },
];

const PAIN_POINTS = [
  { emoji: "😫", text: "Judul ditolak dosen berkali-kali" },
  { emoji: "😰", text: "Turnitin merah, deadline mendekat" },
  { emoji: "😱", text: "Grogi dan blank saat sidang" },
  { emoji: "🤯", text: "Bingung pilih metode statistik" },
  { emoji: "😵", text: "Revisi Bab 4 tanpa akhir" },
  { emoji: "😶", text: "Mau chat dosen tapi bingung bahasa" },
];

const FAQS = [
  { q: "Apakah ini sama dengan ChatGPT biasa?", a: "Tidak. BBR menggunakan prompt yang sudah dioptimasi khusus untuk konteks tugas akhir Indonesia, bukan prompt generik. Setiap tool dirancang untuk kebutuhan spesifik mahasiswa tingkat akhir dengan output yang langsung relevan untuk skripsi/tesis/disertasi." },
  { q: "Apakah hasilnya bisa langsung di-copy paste ke skripsi?", a: "Semua output AI adalah titik awal untuk dipahami dan ditulis ulang dengan bahasamu sendiri. Belajar Bareng Roselini membantu kamu memahami dan mengerjakan tugas akhir, ini bukan tempat untuk jokiin tugas akhirmu! Ini sesuai dengan integritas akademik." },
  { q: "Akses Lifetime itu sampai kapan?", a: "Selamanya. Sekali bayar, kamu bisa akses semua tools AI dan update fitur baru tanpa biaya tambahan. Tidak ada langganan bulanan, tidak ada biaya tersembunyi." },
  { q: "Bisa dipakai untuk S2 dan S3 juga?", a: "Tentu! BBR mendukung jenjang S1 (Skripsi), S2 (Tesis), dan S3 (Disertasi). Sistem otomatis menyesuaikan terminologi dan kedalaman analisis sesuai jenjangmu." },
  { q: "Apakah data skripsi saya aman?", a: "Kami tidak menyimpan konten tugas akhirmu di server manapun. Semua proses berjalan secara real-time dan data-mu hanya tersimpan lokal di perangkatmu sendiri." },
  { q: "Apakah tools ini terus di-update?", a: "Ya! Tim kami terus menambahkan fitur baru dan mengoptimasi prompt berdasarkan feedback mahasiswa. Semua update gratis untuk pengguna lifetime." },
];

export default function Home() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((p) => (p + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-base)] font-sans">
      {/* ═══════════════ NAVBAR ═══════════════ */}
      <header className="px-6 md:px-12 py-4 flex items-center justify-between border-b border-[var(--color-bg-muted)] bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-brand-600)] flex items-center justify-center text-white font-bold text-lg shadow-inner">R</div>
          <span className="font-display font-bold text-xl md:text-2xl text-[var(--color-text-primary)] tracking-tight">
            Belajar<span className="text-[var(--color-brand-600)]">Bareng</span>Roselini
          </span>
        </div>
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-[var(--color-text-secondary)] font-medium text-sm">
          <a href="#masalah" className="hover:text-[var(--color-brand-600)] transition-colors">Masalah</a>
          <a href="#fitur" className="hover:text-[var(--color-brand-600)] transition-colors">Fitur</a>
          <a href="#testimoni" className="hover:text-[var(--color-brand-600)] transition-colors">Testimoni</a>
          <a href="#harga" className="hover:text-[var(--color-brand-600)] transition-colors">Harga</a>
          <a href="#faq" className="hover:text-[var(--color-brand-600)] transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-3 relative z-10">
          <Link href="/dashboard" className="hidden md:flex px-6 py-2.5 bg-[var(--color-brand-600)] text-white text-sm font-semibold rounded-full hover:bg-[var(--color-brand-500)] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
            Masuk
          </Link>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-[var(--color-text-primary)]">
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden fixed inset-0 top-[73px] bg-white/95 backdrop-blur-xl z-40 p-6 animate-in fade-in slide-in-from-top-2">
          <nav className="flex flex-col gap-4 text-lg font-semibold text-[var(--color-text-primary)]">
            <a href="#masalah" onClick={() => setMobileMenu(false)} className="py-3 border-b border-[var(--color-bg-muted)]">Masalah</a>
            <a href="#fitur" onClick={() => setMobileMenu(false)} className="py-3 border-b border-[var(--color-bg-muted)]">Fitur</a>
            <a href="#testimoni" onClick={() => setMobileMenu(false)} className="py-3 border-b border-[var(--color-bg-muted)]">Testimoni</a>
            <a href="#harga" onClick={() => setMobileMenu(false)} className="py-3 border-b border-[var(--color-bg-muted)]">Harga</a>
            <a href="#faq" onClick={() => setMobileMenu(false)} className="py-3 border-b border-[var(--color-bg-muted)]">FAQ</a>
            <Link href="/dashboard" className="mt-4 py-4 bg-[var(--color-brand-600)] text-white text-center font-semibold rounded-2xl">Masuk</Link>
          </nav>
        </div>
      )}

      <main className="flex-1">
        {/* ═══════════════ HERO ═══════════════ */}
        <section className="relative overflow-hidden px-6 py-20 md:py-28">
          {/* Background Blobs */}
          <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full bg-[var(--color-brand-100)] opacity-40 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[var(--color-bg-muted)] opacity-40 blur-[120px] pointer-events-none" />
          <div className="absolute top-[30%] right-[20%] w-[20%] h-[20%] rounded-full bg-amber-100 opacity-30 blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[var(--color-brand-100)] text-[var(--color-brand-600)] text-sm font-semibold mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-400)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-brand-600)]" />
              </span>
              🚀 Asisten AI #1 untuk Tugas Akhir Mahasiswa Indonesia
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-extrabold text-[var(--color-text-primary)] tracking-tight leading-[1.08] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              Lulus Tepat Waktu,<br className="hidden sm:block" />
              <span className="text-[var(--color-brand-600)] relative inline-block">
                Tanpa Drama Revisi
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-[var(--color-brand-100)] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5 L 100 10 L 0 10 Z" fill="currentColor" />
                </svg>
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-[var(--color-text-secondary)] mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
              8 tools AI yang dirancang khusus untuk mahasiswa tingkat akhir Indonesia, mulai dari menemukan judul sampai latihan sidang. <strong className="text-[var(--color-text-primary)]">Sekali bayar, akses selamanya.</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <a href="#harga" className="group flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto bg-[var(--color-brand-600)] text-white text-base font-bold rounded-2xl hover:bg-[var(--color-brand-500)] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                Dapatkan Akses Lifetime
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#fitur" className="flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto bg-white text-[var(--color-text-primary)] border-2 border-[var(--color-bg-muted)] text-base font-semibold rounded-2xl hover:border-[var(--color-brand-400)] transition-all">
                Lihat 8 Fitur AI
                <ChevronDown size={18} />
              </a>
            </div>

            {/* Social Proof Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
              {[
                { n: 2847, s: "+", l: "Mahasiswa Aktif" },
                { n: 98, s: "%", l: "Tingkat Kepuasan" },
                { n: 200, s: "+", l: "Bank Soal Sidang" },
                { n: 8, s: "", l: "Tools AI Premium" },
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80">
                  <p className="text-2xl md:text-3xl font-display font-extrabold text-[var(--color-brand-600)]">
                    <AnimatedCounter target={stat.n} suffix={stat.s} />
                  </p>
                  <p className="text-xs md:text-sm text-[var(--color-text-secondary)] font-medium mt-1">{stat.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ PAIN POINTS ═══════════════ */}
        <section id="masalah" className="px-6 py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-sm font-bold text-[var(--color-brand-600)] tracking-widest uppercase mb-3">Kenali Masalahnya</p>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-[var(--color-text-primary)] mb-4">
              Pernah Merasakan Ini?
            </h2>
            <p className="max-w-2xl mx-auto text-[var(--color-text-secondary)] text-lg mb-12">
              Kamu tidak sendirian. <strong>87% mahasiswa</strong> mengalami setidaknya 3 dari masalah ini saat mengerjakan tugas akhir.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {PAIN_POINTS.map((p, i) => (
                <div key={i} className="group p-6 bg-[var(--color-bg-base)] rounded-2xl border-2 border-transparent hover:border-[var(--color-brand-400)] transition-all hover:shadow-lg hover:-translate-y-1 cursor-default">
                  <span className="text-4xl md:text-5xl block mb-3">{p.emoji}</span>
                  <p className="font-semibold text-[var(--color-text-primary)] text-sm md:text-base">{p.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 p-6 bg-[var(--color-brand-50)] rounded-2xl border border-[var(--color-brand-100)] max-w-2xl mx-auto">
              <p className="text-[var(--color-brand-600)] font-bold text-lg md:text-xl">
                ✨ BBR dirancang untuk menyelesaikan <span className="underline decoration-wavy decoration-[var(--color-brand-400)]">semua masalah di atas</span> dalam satu platform.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════ FEATURES ═══════════════ */}
        <section id="fitur" className="px-6 py-20 md:py-28">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-bold text-[var(--color-brand-600)] tracking-widest uppercase mb-3">8 Tools AI Premium</p>
              <h2 className="text-3xl md:text-5xl font-display font-extrabold text-[var(--color-text-primary)] mb-4">
                Semua yang Kamu Butuhkan, dalam Satu Platform
              </h2>
              <p className="max-w-2xl mx-auto text-[var(--color-text-secondary)] text-lg">
                Setiap tool dirancang khusus untuk kebutuhan mahasiswa tingkat akhir Indonesia, bukan sekadar AI generik.
                <span className="block mt-2 font-semibold text-[var(--color-brand-600)]">👇 Klik pada masing-masing fitur di bawah ini untuk melihat detailnya</span>
              </p>
            </div>

            {/* Feature Tabs - Desktop */}
            <div className="hidden md:grid grid-cols-12 gap-8">
              {/* Tab List */}
              <div className="col-span-5 space-y-3">
                {FEATURES.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveFeature(i)}
                    className={`group w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 cursor-pointer ${activeFeature === i ? 'bg-white shadow-xl border-2 border-[var(--color-brand-400)] scale-[1.02]' : 'bg-white/60 shadow-sm hover:shadow-md hover:bg-white border-2 border-[var(--color-bg-muted)] hover:border-[var(--color-brand-300)] hover:-translate-y-0.5'}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-colors ${activeFeature === i ? f.color + ' text-white shadow-md' : 'bg-[var(--color-bg-muted)]'}`}>
                      {f.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-base transition-colors ${activeFeature === i ? 'text-[var(--color-brand-600)]' : 'text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-600)]'}`}>{f.title}</h3>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-0.5 line-clamp-1">{f.desc}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${activeFeature === i ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-600)]' : 'bg-transparent text-[var(--color-text-disabled)] group-hover:bg-[var(--color-brand-50)] group-hover:text-[var(--color-brand-400)] group-hover:translate-x-1'}`}>
                      <ChevronRight size={18} />
                    </div>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="col-span-7 flex items-center">
                <div className="w-full bg-white rounded-3xl shadow-xl border-2 border-[var(--color-bg-muted)] overflow-hidden">
                  <div className={`${FEATURES[activeFeature].color} p-8 text-white`}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl">{FEATURES[activeFeature].emoji}</span>
                      <h3 className="text-2xl font-display font-bold">{FEATURES[activeFeature].title}</h3>
                    </div>
                    <p className="text-white/90 text-lg leading-relaxed">{FEATURES[activeFeature].desc}</p>
                  </div>
                  <div className="p-8">
                    <div className="flex items-start gap-3 mb-6">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-brand-50)] flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles size={16} className="text-[var(--color-brand-600)]" />
                      </div>
                      <div>
                        <p className="font-bold text-[var(--color-text-primary)] mb-1">Cara Kerjanya:</p>
                        <p className="text-[var(--color-text-secondary)] leading-relaxed">{FEATURES[activeFeature].detail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-brand-600)] font-semibold">
                      <CheckCircle2 size={16} />
                      <span>Termasuk dalam paket Lifetime Access</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Cards - Mobile */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {FEATURES.map((f, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border-2 border-[var(--color-bg-muted)] shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{f.emoji}</span>
                    <div>
                      <h3 className="font-bold text-lg text-[var(--color-text-primary)]">{f.title}</h3>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1">{f.desc}</p>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-[var(--color-bg-base)] rounded-xl">
                    <p className="text-sm text-[var(--color-text-body)] leading-relaxed">{f.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ SIDANG SHOWCASE ═══════════════ */}
        <section className="px-6 py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-sm font-bold text-[var(--color-brand-600)] tracking-widest uppercase mb-3">Fitur Unggulan</p>
                <h2 className="text-3xl md:text-4xl font-display font-extrabold text-[var(--color-text-primary)] mb-6">
                  Latihan Sidang dengan 8 Tipe AI Dosen Penguji
                </h2>
                <p className="text-[var(--color-text-secondary)] text-lg mb-8 leading-relaxed">
                  Mulai dari <strong>Si Paling Metodologi</strong> sampai <strong>Si Dosen Killer</strong>. Simulasikan sidang tugas akhirmu dengan AI yang berperilaku persis seperti dosen penguji sungguhan.
                </p>
                <div className="space-y-4">
                  {[
                    "200+ kumpulan pertanyaan sidang nyata mahasiswa",
                    "8 persona dosen dengan gaya bertanya berbeda",
                    "Feedback real-time untuk setiap jawabanmu",
                    "Tingkat kesulitan: Ringan, Sedang, Berat"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[var(--color-brand-50)] flex items-center justify-center shrink-0">
                        <CheckCircle2 size={14} className="text-[var(--color-brand-600)]" />
                      </div>
                      <span className="text-[var(--color-text-body)] font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dosen Penguji Preview */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { emoji: "😤", name: "Si Metodologi", desc: "Ketat soal metode & sampling" },
                  { emoji: "📚", name: "Si Pengabdi Teori", desc: "Fokus kutipan & grand theory" },
                  { emoji: "🔍", name: "Si Detektif", desc: "Cari novelty & urgensi riset" },
                  { emoji: "🧮", name: "Si Raja Statistik", desc: "Detail angka & interpretasi" },
                  { emoji: "🗣️", name: "Si Pencari Celah", desc: "Cari inkonsistensi antar bab" },
                  { emoji: "🔥", name: "Si Dosen Killer", desc: "Push back semua argumenmu" },
                ].map((d, i) => (
                  <div key={i} className="p-4 bg-[var(--color-bg-base)] rounded-2xl border border-[var(--color-bg-muted)] hover:border-[var(--color-brand-400)] transition-all hover:shadow-md hover:-translate-y-0.5 cursor-default">
                    <span className="text-3xl block mb-2">{d.emoji}</span>
                    <p className="font-bold text-sm text-[var(--color-text-primary)]">{d.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{d.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ SOCIAL PROOF ═══════════════ */}
        <section className="px-6 py-16 md:py-20 bg-[var(--color-brand-600)]">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
            {[
              { icon: GraduationCap, n: "45+", l: "Universitas" },
              { icon: Award, n: "97%", l: "Lulus Tepat Waktu" },
              { icon: TrendingUp, n: "3.8x", l: "Lebih Cepat Selesai" },
              { icon: Heart, n: "4.9/5", l: "Rating Mahasiswa" },
            ].map((s, i) => (
              <div key={i} className="p-4">
                <s.icon size={28} className="mx-auto mb-2 text-white/80" />
                <p className="text-2xl md:text-3xl font-display font-extrabold">{s.n}</p>
                <p className="text-sm text-white/70 font-medium mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════ TESTIMONIALS ═══════════════ */}
        <section id="testimoni" className="px-6 py-20 md:py-28">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-bold text-[var(--color-brand-600)] tracking-widest uppercase mb-3">Apa Kata Mereka</p>
              <h2 className="text-3xl md:text-5xl font-display font-extrabold text-[var(--color-text-primary)] mb-4">
                Mahasiswa yang Sudah Merasakan Manfaatnya
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className={`bg-white p-6 rounded-2xl border-2 shadow-sm transition-all duration-500 ${i === currentTestimonial ? 'border-[var(--color-brand-400)] shadow-lg scale-[1.02]' : 'border-[var(--color-bg-muted)]'}`}>
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} size={16} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-[var(--color-text-body)] leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-brand-100)] flex items-center justify-center text-[var(--color-brand-600)] font-bold text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[var(--color-text-primary)]">{t.name}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{t.jenjang} di {t.univ}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ PRICING ═══════════════ */}
        <section id="harga" className="px-6 py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-sm font-bold text-[var(--color-brand-600)] tracking-widest uppercase mb-3">Investasi Masa Depanmu</p>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-[var(--color-text-primary)] mb-4">
              Satu Kali Bayar, Akses Selamanya
            </h2>
            <p className="max-w-2xl mx-auto text-[var(--color-text-secondary)] text-lg mb-12">
              Tidak ada langganan bulanan. Tidak ada biaya tersembunyi. Investasi sekali untuk kelancaran tugas akhirmu.
            </p>

            <div className="max-w-xl mx-auto">
              {/* Lifetime Plan */}
              <div className="relative bg-white p-8 rounded-3xl border-2 border-[var(--color-brand-600)] text-left shadow-2xl">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[var(--color-brand-600)] text-white text-xs font-bold rounded-full uppercase tracking-wide shadow-lg">
                  🔥 Paling Populer
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Award size={20} className="text-[var(--color-brand-600)]" />
                  <span className="text-sm font-bold text-[var(--color-brand-600)] uppercase tracking-wide">Lifetime Access</span>
                </div>
                <div className="mb-2">
                  <span className="text-sm text-[var(--color-text-secondary)] line-through mr-2">Rp 499.000</span>
                </div>
                <div className="mb-1">
                  <span className="text-5xl font-display font-extrabold text-[var(--color-text-primary)]">Rp 199<span className="text-2xl">.000</span></span>
                </div>
                <p className="text-xs text-[var(--color-brand-600)] font-semibold mb-6">Hemat 60% (Harga Promo Terbatas!)</p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Semua 8 Tools AI tanpa batas",
                    "200+ Bank Soal Arena Sidang",
                    "8 Persona Dosen Penguji AI",
                    "SPSS/PLS Interpreter unlimited",
                    "Bibliometrik Generator",
                    "Anti-Revisi Kit lengkap",
                    "Update fitur baru gratis selamanya",
                    "Prioritas support via WhatsApp",
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-body)]">
                      <CheckCircle2 size={16} className="text-[var(--color-brand-600)] mt-0.5 shrink-0" />
                      <strong>{f}</strong>
                    </li>
                  ))}
                </ul>
                <a href="https://wa.me/6281234567890?text=Halo%20Kak%2C%20saya%20mau%20order%20Lifetime%20Access%20BBR!" target="_blank" rel="noopener noreferrer" className="block w-full py-4 text-center bg-[var(--color-brand-600)] text-white font-bold rounded-xl hover:bg-[var(--color-brand-500)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg">
                  Beli Sekarang seharga Rp 199.000
                </a>
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-[var(--color-text-secondary)]">
                  <span className="flex items-center gap-1"><Shield size={12} /> Garansi 7 Hari</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> Akses Instant</span>
                </div>
              </div>
            </div>

            {/* Money Back Guarantee */}
            <div className="mt-12 p-6 bg-green-50 rounded-2xl border border-green-200 max-w-2xl mx-auto flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Shield size={24} className="text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-green-800 text-lg">Garansi Uang Kembali 7 Hari</p>
                <p className="text-green-700 text-sm mt-1">Jika kamu merasa BBR tidak membantu tugas akhirmu, hubungi kami dalam 7 hari dan kami kembalikan 100% uangmu. Tanpa pertanyaan.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ COMPARISON ═══════════════ */}
        <section className="px-6 py-20 md:py-28">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-extrabold text-[var(--color-text-primary)] mb-4">
                Pilih Mana Perjalananmu?
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Tanpa BBR */}
              <div className="p-8 bg-red-50 rounded-2xl border-2 border-red-200">
                <h3 className="font-bold text-xl text-red-700 mb-6 flex items-center gap-2">❌ POV: Ngerjain Tanpa BBR</h3>
                <ul className="space-y-4">
                  {[
                    "Judul ditolak 3-5 kali sebelum ACC",
                    "Turnitin merah, revisi berulang",
                    "Grogi dan blank saat ditanya penguji",
                    "Bab 4 copy-paste tanpa pemahaman",
                    "Chat dosen awkward & sering cuma di-read",
                    "Lulus molor 1-2 semester",
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-red-700 text-sm">
                      <X size={16} className="mt-0.5 shrink-0" /> <span className="font-medium">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dengan BBR */}
              <div className="p-8 bg-green-50 rounded-2xl border-2 border-green-200">
                <h3 className="font-bold text-xl text-green-700 mb-6 flex items-center gap-2">✅ POV: Ngerjain Pakai BBR</h3>
                <ul className="space-y-4">
                  {[
                    "Judul ACC dosen di percobaan pertama",
                    "Turnitin hijau, naskah tetap orisinal",
                    "Sidang PD dan jawab dengan percaya diri",
                    "Paham betul interpretasi statistik Bab 4",
                    "Chat dosen sopan & langsung dibalas",
                    "Lulus tepat waktu, wisuda on-time",
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-green-700 text-sm">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> <span className="font-medium">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ FAQ ═══════════════ */}
        <section id="faq" className="px-6 py-20 md:py-28 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm font-bold text-[var(--color-brand-600)] tracking-widest uppercase mb-3">FAQ</p>
              <h2 className="text-3xl md:text-4xl font-display font-extrabold text-[var(--color-text-primary)]">
                Pertanyaan yang Sering Ditanyakan
              </h2>
            </div>
            <div className="bg-[var(--color-bg-base)] rounded-2xl p-6 md:p-8">
              {FAQS.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
            </div>
          </div>
        </section>

        {/* ═══════════════ FINAL CTA ═══════════════ */}
        <section className="px-6 py-20 md:py-28 bg-[var(--color-brand-600)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMyIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white mb-6 leading-tight">
              Jangan Tunda Lagi.<br />Mulai Selesaikan Tugas Akhirmu Hari Ini.
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
              Bergabung bersama <strong className="text-white">2,847+ mahasiswa</strong> yang sudah mempercayai BBR untuk membantu mereka lulus tepat waktu.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://wa.me/6281234567890?text=Halo%20Kak%2C%20saya%20mau%20order%20Lifetime%20Access%20BBR!" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-2 px-10 py-4 w-full sm:w-auto bg-white text-[var(--color-brand-600)] text-lg font-bold rounded-2xl hover:bg-[var(--color-brand-50)] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                Beli Lifetime Access seharga Rp 199.000
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <p className="text-white/60 text-sm mt-6">🔒 Pembayaran aman • Garansi 7 hari • Akses instant</p>
          </div>
        </section>

        {/* ═══════════════ TENTANG ═══════════════ */}
        <section id="tentang" className="px-6 py-20 md:py-28">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-sm font-bold text-[var(--color-brand-600)] tracking-widest uppercase mb-3">Tentang BBR</p>
                <h2 className="text-3xl md:text-4xl font-display font-extrabold text-[var(--color-text-primary)] mb-6">
                  Dibuat oleh Mahasiswa, untuk Mahasiswa
                </h2>
                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
                  Belajar Bareng Roselini lahir dari pengalaman nyata mahasiswa yang pernah merasakan betapa sulitnya menyelesaikan tugas akhir sendirian: judul ditolak, Turnitin merah, hingga sidang bikin panik.
                </p>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  Kami percaya setiap mahasiswa berhak punya asisten pintar yang membantu <em>memahami</em> proses, bukan menggantikannya. BBR bukan joki, melainkan teman belajar yang membantumu jadi lebih paham dan percaya diri.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Brain, label: "AI Teroptimasi", desc: "Prompt dirancang khusus untuk konteks akademik Indonesia" },
                  { icon: Shield, label: "Anti-Plagiasi", desc: "Semua output dirancang untuk ditulis ulang oleh mahasiswa" },
                  { icon: Target, label: "Tepat Sasaran", desc: "Fitur sesuai kebutuhan nyata mahasiswa tingkat akhir" },
                  { icon: Users, label: "Komunitas", desc: "Bergabung dengan ribuan mahasiswa se-Indonesia" },
                ].map((item, i) => (
                  <div key={i} className="p-5 bg-white rounded-2xl border border-[var(--color-bg-muted)] hover:border-[var(--color-brand-400)] transition-all hover:shadow-md">
                    <item.icon size={24} className="text-[var(--color-brand-600)] mb-3" />
                    <p className="font-bold text-sm text-[var(--color-text-primary)]">{item.label}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="bg-[var(--color-text-primary)] text-white/70 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[var(--color-brand-600)] flex items-center justify-center text-white font-bold text-sm">R</div>
                <span className="font-display font-bold text-lg text-white">BelajarBarengRoselini</span>
              </div>
              <p className="text-sm leading-relaxed">Asisten AI bimbingan tugas akhir yang membantu mahasiswa Indonesia lulus tepat waktu dengan percaya diri.</p>
            </div>
            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#fitur" className="hover:text-white transition-colors">Fitur</a></li>
                <li><a href="#harga" className="hover:text-white transition-colors">Harga</a></li>
                <li><a href="#testimoni" className="hover:text-white transition-colors">Testimoni</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-4">Kontak</h4>
              <ul className="space-y-2 text-sm">
                <li>📧 hello@belajarbarengroselini.com</li>
                <li>💬 WhatsApp: 0812-3456-7890</li>
                <li>📍 Indonesia</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-sm">
            <p>&copy; {new Date().getFullYear()} Belajar Bareng Roselini. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Dibuat dengan ❤️ untuk mahasiswa Indonesia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
