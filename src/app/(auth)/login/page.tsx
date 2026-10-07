"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Sparkles, ShieldCheck, BookOpen, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

function LoginCard() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [isLoading, setIsLoading] = useState(false);

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
      <div className="bg-[var(--color-brand-50)] p-8 text-center border-b border-[var(--color-brand-100)] relative">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-brand-600)] to-[var(--color-brand-500)] text-white font-black text-base shadow-md mb-4 ring-4 ring-[var(--color-brand-100)] select-none tracking-wider">
          BBR
        </div>
        <div className="flex flex-col items-center select-none">
          <span className="font-display font-bold text-xs tracking-widest text-[var(--color-brand-800)]/80 uppercase">
            Belajar Bareng
          </span>
          <span className="font-display font-black text-3xl bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-500)] bg-clip-text text-transparent tracking-tight">
            Roselini
          </span>
        </div>
        <p className="text-[var(--color-text-secondary)] text-sm mt-2 max-w-xs mx-auto">
          Platform all-in-one partner bimbingan tugas akhir & skripsi terintegrasi.
        </p>
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-6">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-[var(--color-error)] text-xs flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <div className="space-y-3 text-center">
          <h2 className="font-display font-bold text-xl text-[var(--color-text-primary)]">
            Masuk ke Akun Anda
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Gunakan akun Google Anda untuk mengakses draf naskah, AI tools, dan workspace personal.
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
              <span>Masuk dengan Akun Google</span>
              <ArrowRight size={15} className="ml-auto text-zinc-400 group-hover:text-[var(--color-brand-600)] group-hover:translate-x-0.5 transition-all" />
            </>
          )}
        </button>

        {/* Security & Feature Badges */}
        <div className="pt-4 border-t border-[var(--color-bg-muted)] space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs text-[var(--color-text-secondary)]">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>Data naskah & draf tersimpan terisolasi per akun user.</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-[var(--color-text-secondary)]">
            <Sparkles size={16} className="text-[var(--color-brand-600)] shrink-0" />
            <span>Akses langsung ke Workspace, AI Sidang, dan Klinik TA.</span>
          </div>
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
