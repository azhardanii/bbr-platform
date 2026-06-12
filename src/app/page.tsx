import Link from "next/link";
import { ArrowRight, BookOpen, PenTool, Presentation } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-base)] font-sans">
      {/* Navbar */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between border-b border-[var(--color-bg-muted)] bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-brand-600)] flex items-center justify-center text-white font-bold text-lg shadow-inner">
            R
          </div>
          <span className="font-display font-bold text-xl md:text-2xl text-[var(--color-text-primary)] tracking-tight">
            Belajar<span className="text-[var(--color-brand-600)]">Bareng</span>Roselini
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-[var(--color-text-secondary)] font-medium text-sm">
          <Link href="#fitur" className="hover:text-[var(--color-brand-600)] transition-colors">Fitur</Link>
          <Link href="#tentang" className="hover:text-[var(--color-brand-600)] transition-colors">Tentang</Link>
        </nav>
        <Link 
          href="/dashboard"
          className="hidden md:flex px-6 py-2.5 bg-[var(--color-brand-600)] text-white text-sm font-semibold rounded-full hover:bg-[var(--color-brand-500)] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          Masuk
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 md:py-32 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-brand-100)] opacity-50 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-bg-muted)] opacity-50 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[var(--color-brand-100)] text-[var(--color-brand-600)] text-sm font-semibold mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-400)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-brand-600)]"></span>
          </span>
          Platform AI Bimbingan Tugas Akhir
        </div>
        
        <h1 className="relative z-10 max-w-4xl text-5xl md:text-7xl font-display font-extrabold text-[var(--color-text-primary)] tracking-tight leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          Lulus Tepat Waktu dengan <br className="hidden md:block"/>
          <span className="text-[var(--color-brand-600)] relative inline-block">
            Belajar Bareng Roselini
            <svg className="absolute w-full h-3 -bottom-1 left-0 text-[var(--color-brand-100)] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 10 100 5 L 100 10 L 0 10 Z" fill="currentColor"></path>
            </svg>
          </span>
        </h1>
        
        <p className="relative z-10 max-w-2xl text-lg md:text-xl text-[var(--color-text-secondary)] mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
          Asisten pintar yang membantumu menemukan judul, memparafrase kalimat akademik, dan melatih presentasi sidang tugas akhir.
        </p>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Link 
            href="/dashboard"
            className="group flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto bg-[var(--color-brand-600)] text-white text-base font-semibold rounded-2xl hover:bg-[var(--color-brand-500)] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            Mulai Belajar Sekarang
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/onboarding"
            className="flex items-center justify-center px-8 py-4 w-full sm:w-auto bg-white text-[var(--color-text-primary)] border-2 border-[var(--color-bg-muted)] text-base font-semibold rounded-2xl hover:bg-[var(--color-bg-surface)] hover:border-[var(--color-brand-400)] transition-all"
          >
            Pelajari Lebih Lanjut
          </Link>
        </div>

        {/* Feature Highlights */}
        <div id="fitur" className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mt-32 text-left">
          <div className="group bg-white p-8 rounded-3xl border-2 border-[var(--color-bg-muted)] shadow-sm hover:border-[var(--color-brand-400)] transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen size={28} />
            </div>
            <h3 className="font-bold text-2xl text-[var(--color-text-primary)] mb-3">Judul Finder</h3>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              Temukan dan validasi ide judul tugas akhir yang relevan dan minim revisi dari dosen pembimbing.
            </p>
          </div>
          
          <div className="group bg-white p-8 rounded-3xl border-2 border-[var(--color-bg-muted)] shadow-sm hover:border-[var(--color-brand-400)] transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <PenTool size={28} />
            </div>
            <h3 className="font-bold text-2xl text-[var(--color-text-primary)] mb-3">Parafrase Pintar</h3>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              Tulis ulang paragraf dengan gaya bahasa akademik yang profesional untuk menghindari plagiasi.
            </p>
          </div>
          
          <div className="group bg-white p-8 rounded-3xl border-2 border-[var(--color-bg-muted)] shadow-sm hover:border-[var(--color-brand-400)] transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-50)] text-[var(--color-brand-600)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Presentation size={28} />
            </div>
            <h3 className="font-bold text-2xl text-[var(--color-text-primary)] mb-3">Simulasi Sidang</h3>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              Latih mental dan presentasimu dengan AI Dosen Penguji agar siap menghadapi sidang sesungguhnya.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-[var(--color-text-secondary)] border-t border-[var(--color-bg-muted)] bg-white/30 backdrop-blur-sm">
        <p className="text-sm font-medium">
          &copy; {new Date().getFullYear()} Belajar Bareng Roselini. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
