"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wrench, GraduationCap, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Beranda", icon: Home },
    { href: "/tools", label: "Tools", icon: Wrench },
    { href: "/sidang", label: "Sidang", icon: GraduationCap },
    { href: "/profil", label: "Profil", icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 w-full h-[60px] pb-[env(safe-area-inset-bottom)] bg-[var(--color-bg-surface)] border-t border-[var(--color-bg-muted)] flex items-center justify-around z-50">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center justify-center w-full h-full relative"
          >
            <link.icon 
              size={24} 
              className={`mb-1 transition-colors ${isActive ? "text-[var(--color-brand-600)]" : "text-[var(--color-text-secondary)]"}`} 
            />
            <span className={`text-[11px] transition-colors ${isActive ? "text-[var(--color-brand-600)] font-semibold" : "text-[var(--color-text-secondary)] font-normal"}`}>
              {link.label}
            </span>
            {isActive && (
              <span className="absolute bottom-1 w-1 h-1 bg-[var(--color-brand-600)] rounded-full"></span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
