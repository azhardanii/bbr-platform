"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileEdit, Wrench, GraduationCap, User, LogOut } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Beranda", icon: Home },
    { href: "/workspace", label: "Workspace", icon: FileEdit, badge: "Draf" },
    { href: "/tools", label: "Tools", icon: Wrench },
    { href: "/sidang", label: "Sidang", icon: GraduationCap },
    { href: "/profil", label: "Profil", icon: User },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-[240px] border-r border-[var(--color-bg-muted)] bg-[var(--color-bg-surface)] h-full">
      <div className="p-6 border-b border-[var(--color-bg-muted)]">
        <h1 className="font-display font-bold text-2xl text-[var(--color-brand-600)]">BBR</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Platform Belajar</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive 
                  ? "bg-[var(--color-brand-100)] text-[var(--color-brand-600)] border-l-4 border-[var(--color-brand-600)]" 
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] border-l-4 border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <link.icon size={20} className={isActive ? "text-[var(--color-brand-600)]" : "text-[var(--color-text-secondary)]"} />
                <span>{link.label}</span>
              </div>
              {link.badge && !isActive && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-600)] border border-[var(--color-brand-200)]">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-[var(--color-bg-muted)]">
        <Link href="/api/auth/signout" className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-error)] font-medium transition-colors px-4 py-2">
          <LogOut size={18} /> Keluar
        </Link>
      </div>
    </aside>
  );
}
