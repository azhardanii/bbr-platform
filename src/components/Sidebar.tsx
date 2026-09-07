"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, FileEdit, Wrench, GraduationCap, User, LogOut,
  PanelLeftClose, PanelLeftOpen
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  const links = [
    { href: "/dashboard", label: "Beranda", icon: Home },
    { href: "/workspace", label: "Workspace", icon: FileEdit, badge: "Draf" },
    { href: "/tools", label: "Tools", icon: Wrench },
    { href: "/sidang", label: "Sidang", icon: GraduationCap },
    { href: "/profil", label: "Profil", icon: User },
  ];

  return (
    <aside className={`hidden lg:flex flex-col border-r border-[var(--color-bg-muted)] bg-[var(--color-bg-surface)] h-full transition-all duration-300 relative ${isOpen ? "w-[260px]" : "w-[80px]"}`}>
      {/* Header with Logo & Integrated Toggle Button */}
      <div className={`border-b border-[var(--color-bg-muted)] flex items-center min-h-[72px] transition-all ${isOpen ? "justify-between px-5 py-3.5" : "flex-col justify-center gap-1.5 p-3"
        }`}>
        {isOpen ? (
          <>
            <div className="flex flex-col select-none">
              <span className="font-display font-bold text-xs tracking-wider text-[var(--color-brand-800)]/80 uppercase leading-tight">
                BelajarBareng
              </span>
              <span className="font-display font-black text-2xl bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-400)] bg-clip-text text-transparent leading-tight tracking-tight">
                Roselini
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              title="Tutup Sidebar"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-[var(--color-brand-700)] hover:bg-[var(--color-brand-50)] border border-zinc-200/70 hover:border-[var(--color-brand-200)] transition-all cursor-pointer shadow-2xs shrink-0"
              aria-label="Tutup Sidebar"
            >
              <PanelLeftClose size={17} />
            </button>
          </>
        ) : (
          <>
            <span className="font-display font-black text-xl bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-400)] bg-clip-text text-transparent tracking-wider select-none leading-none">
              BBR
            </span>
            <button
              onClick={() => setIsOpen(true)}
              title="Buka Sidebar"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-500 hover:text-[var(--color-brand-700)] hover:bg-[var(--color-brand-50)] border border-zinc-200/80 hover:border-[var(--color-brand-200)] transition-all shadow-2xs cursor-pointer"
              aria-label="Buka Sidebar"
            >
              <PanelLeftOpen size={16} />
            </button>
          </>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              title={!isOpen ? link.label : undefined}
              className={`flex items-center ${isOpen ? "justify-between px-3.5 py-2.5" : "justify-center p-3"} rounded-xl transition-all font-medium ${isActive
                ? "bg-[var(--color-brand-100)] text-[var(--color-brand-600)] border-l-4 border-[var(--color-brand-600)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)] border-l-4 border-transparent"
                }`}
            >
              <div className="flex items-center gap-3">
                <link.icon size={20} className={isActive ? "text-[var(--color-brand-600)]" : "text-[var(--color-text-secondary)]"} />
                {isOpen && <span className="text-sm font-semibold">{link.label}</span>}
              </div>
              {isOpen && link.badge && !isActive && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-600)] border border-[var(--color-brand-200)]">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Area with Expand/Collapse & Logout */}
      <div className="p-3 border-t border-[var(--color-bg-muted)] flex flex-col gap-1">
        <Link
          href="/api/auth/signout"
          title={!isOpen ? "Keluar" : undefined}
          className={`flex items-center gap-3 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-error)] font-medium transition-colors ${isOpen ? "px-3.5 py-2" : "justify-center p-2"
            }`}
        >
          <LogOut size={17} /> {isOpen && <span>Keluar</span>}
        </Link>
      </div>
    </aside>
  );
}
