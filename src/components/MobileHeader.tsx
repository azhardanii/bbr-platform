'use client';

import Link from 'next/link';
import { LogOut, User } from 'lucide-react';
import { performLogout } from '@/lib/logout';

export default function MobileHeader() {
  return (
    <div className="lg:hidden px-4 py-3 border-b border-[var(--color-bg-muted)] bg-[var(--color-bg-surface)] flex justify-between items-center shrink-0">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="h-7 px-2 rounded-lg bg-gradient-to-br from-[var(--color-brand-600)] to-[var(--color-brand-500)] flex items-center justify-center text-white font-black text-xs tracking-wider shadow-xs">
          BBR
        </div>
        <span className="font-display font-black text-sm text-[var(--color-text-primary)]">
          Belajar Bareng <span className="text-[var(--color-brand-600)]">Roselini</span>
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/profil"
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
          title="Profil Akun"
        >
          <User size={18} />
        </Link>
        <button
          type="button"
          onClick={() => performLogout()}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          title="Keluar dari Akun"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}
