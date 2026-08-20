import { auth } from "@/lib/auth";
import Link from "next/link";
import { ArrowRight, FileEdit } from "lucide-react";
import ProgressTracker from "./ProgressTracker";
import VaultWidget from "./VaultWidget";
import DashboardHeader from "./DashboardHeader";
import JudulStatusCard from "./JudulStatusCard";

export const metadata = {
  title: "Dashboard - BBR Platform",
};

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as any;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-10">
      {/* 1. Header Sambutan */}
      <div>
        <DashboardHeader defaultName={user?.name?.split(' ')[0] || 'Mahasiswa'} />
      </div>

      {/* 2. Section Judul (Dipindahkan ke Paling Atas sesuai request) */}
      <JudulStatusCard />

      {/* 3. Section Draf / Hasil Kompilasi Dokumen */}
      <VaultWidget />

      {/* 4. Section Progress Milestone Bab */}
      <ProgressTracker />

      {/* 5. Tautan Cepat & Workspace CTA */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-[var(--color-text-primary)]">Mulai Mengerjakan</h2>
          <Link href="/tools" className="text-sm font-semibold text-[var(--color-brand-600)] hover:underline flex items-center gap-1">
            Lihat Semua Tools <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/workspace" className="p-4 bg-[var(--color-brand-50)] border-2 border-[var(--color-brand-200)] rounded-xl hover:border-[var(--color-brand-500)] transition-all group shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[var(--color-brand-700)] group-hover:text-[var(--color-brand-600)] transition-colors flex items-center gap-1.5">
                <FileEdit size={18} /> Workspace Draf
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-brand-600)] text-white">Utama</span>
            </div>
            <p className="text-xs text-[var(--color-brand-900)]/80 mt-1.5">Upload naskah per bab, atur format & AI parafrase.</p>
          </Link>
          <Link href="/sidang/arena" className="p-4 bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] rounded-xl hover:border-[var(--color-brand-400)] transition-colors group">
            <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-600)] transition-colors">🎯 Arena Sidang</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1.5">Pelajari 200+ bocoran jebakan dosen penguji.</p>
          </Link>
          <Link href="/tools/parafrase" className="p-4 bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] rounded-xl hover:border-[var(--color-brand-400)] transition-colors group">
            <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-600)] transition-colors">🔄 Parafrase Tool</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1.5">Ubah gaya bahasa tanpa menghilangkan makna.</p>
          </Link>
          <Link href="/tools/script-wa" className="p-4 bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] rounded-xl hover:border-[var(--color-brand-400)] transition-colors group">
            <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-600)] transition-colors">💬 Script WA Dosen</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1.5">Template chat dosen sopan & anti-drama.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
