import { auth } from "@/lib/auth";
import Link from "next/link";
import { FileSearch, ArrowRight } from "lucide-react";
import ProgressTracker from "./ProgressTracker";
import VaultWidget from "./VaultWidget";
export const metadata = {
  title: "Dashboard - BBR Platform",
};

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as any;


  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-10">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)]">
          Halo, {user?.name?.split(' ')[0] || 'Mahasiswa'}!
        </h1>
        {/* Example: If they have a title */}
        {/* <p className="font-display italic text-[var(--color-text-secondary)] mt-2">
          "Pengaruh X terhadap Y di Masa Z"
        </p> */}
      </div>

      {/* Vault Widget */}
      <VaultWidget />

      {/* CTA Temukan Judul (Tampil jika belum punya judul) */}
      <div className="bg-white border-2 border-[var(--color-brand-100)] p-5 md:p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-4 sm:justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--color-brand-50)] flex items-center justify-center text-[var(--color-brand-600)]">
            <FileSearch size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)]">Belum punya judul?</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Gunakan Judul Finder untuk menemukan dan memvalidasi judul yang tepat.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/tools/judul-finder"
          className="w-full sm:w-auto px-6 py-3 bg-[var(--color-brand-600)] text-white text-sm font-semibold rounded-xl text-center hover:bg-[var(--color-brand-500)] transition-colors"
        >
          Temukan Judul &rarr;
        </Link>
      </div>

      {/* Progress Section */}
      <ProgressTracker />

      {/* Tautan Cepat */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-[var(--color-text-primary)]">Mulai Mengerjakan</h2>
          <Link href="/dashboard/tools" className="text-sm font-semibold text-[var(--color-brand-600)] hover:underline flex items-center gap-1">
            Lihat Semua Tools <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/dashboard/sidang/arena" className="p-4 bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] rounded-xl hover:border-[var(--color-brand-400)] transition-colors group">
            <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-600)] transition-colors">🎯 Arena Sidang</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1.5">Pelajari 200+ bocoran jebakan dosen penguji.</p>
          </Link>
          <Link href="/dashboard/tools/parafrase" className="p-4 bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] rounded-xl hover:border-[var(--color-brand-400)] transition-colors group">
            <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-600)] transition-colors">🔄 Parafrase Tool</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1.5">Ubah gaya bahasa tanpa menghilangkan makna.</p>
          </Link>
          <Link href="/dashboard/tools/script-wa" className="p-4 bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] rounded-xl hover:border-[var(--color-brand-400)] transition-colors group">
            <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-600)] transition-colors">💬 Script WA Dosen</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1.5">Template chat dosen sopan & anti-drama.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
