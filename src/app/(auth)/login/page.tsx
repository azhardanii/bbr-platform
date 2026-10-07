"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Sparkles, ShieldCheck, BookOpen, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

function LoginCard() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const isLoggedOut = searchParams.get("logout") === "1";
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If arriving from logout, clean the URL so ?logout=1 is not in history
    if (isLoggedOut && typeof window !== "undefined") {
      window.history.replaceState(null, "", "/login");
    }
  }, [isLoggedOut]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { callbackUrl });
    } catch (err) {
      console.error("Login failed:", err);
      setIsLoading(false);
    }
  };

  const getErrorMessage = (code: string | null) => {
    if (!code) return null;
    switch (code) {
      case "AccessDenied":
        return "Akses ditolak. Pastikan email Anda sudah terdaftar atau memiliki izin akses.";
      case "OAuthAccountNotLinked":
        return "Email ini sudah terhubung dengan metode login lain.";
      case "Configuration":
      case "OAuthCallbackError":
        return "Terjadi kendala konfigurasi OAuth. Silakan coba kembali sesaat lagi.";
      default:
        return "Gagal masuk ke akun. Silakan coba login kembali.";
    }
  };

  const errorMessage = getErrorMessage(errorParam);

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[var(--color-bg-muted)] overflow-hidden transition-all animate-in zoom-in-95 duration-300">
      {/* Brand Header */}
      <div className="bg-[var(--color-brand-50)] p-6 sm:p-7 text-center border-b border-[var(--color-brand-100)] relative">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-brand-600)] to-[var(--color-brand-500)] text-white font-black text-sm shadow-md mb-3 ring-4 ring-[var(--color-brand-100)] select-none tracking-wider">
          BBR
        </div>
        <div className="flex flex-col items-center select-none">
          <span className="font-display font-bold text-[10px] tracking-widest text-[var(--color-brand-800)]/80 uppercase">
            Belajar Bareng
          </span>
          <span className="font-display font-black text-2xl sm:text-3xl bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-500)] bg-clip-text text-transparent tracking-tight">
            Roselini
          </span>
        </div>
        <p className="text-[var(--color-text-secondary)] text-xs mt-1.5">
          Partner Cerdas Tugas Akhir & Skripsi Mahasiswa
        </p>
      </div>

      {/* Main Content */}
      <div className="p-6 sm:p-8 space-y-5">
        {isLoggedOut && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <div className="leading-snug">Anda telah berhasil keluar dari akun. Sesi login telah diakhiri dengan aman.</div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <div className="leading-snug">Gagal masuk. Silakan coba kembali dengan akun Google Anda.</div>
          </div>
        )}

        <div className="text-center space-y-1">
          <h2 className="font-display font-bold text-lg text-[var(--color-text-primary)]">
            Masuk atau Mulai Coba Gratis
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Satu klik langsung terhubung ke workspace naskah dan AI tools Anda.
          </p>
        </div>

        {/* Google Sign In Button */}
        <button
          id="btn-login-google"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-5 bg-white hover:bg-[var(--color-bg-base)] text-[var(--color-text-primary)] border-2 border-[var(--color-bg-muted)] hover:border-[var(--color-brand-600)] rounded-xl font-semibold text-sm transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin text-[var(--color-brand-600)]" />
              <span>Menghubungkan ke Google...</span>
            </>
          ) : (
            <>
              {/* Official Google SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Lanjutkan dengan Google</span>
              <ArrowRight size={15} className="ml-auto text-zinc-400 group-hover:text-[var(--color-brand-600)] group-hover:translate-x-0.5 transition-all" />
            </>
          )}
        </button>

        {/* Friendly Footer Note */}
        <div className="pt-3 text-center">
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
            Belum punya akun? Akun starter gratis otomatis aktif begitu Anda login.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 size={32} className="animate-spin text-[var(--color-brand-600)]" />
        </div>
      }
    >
      <LoginCard />
    </Suspense>
  );
}
