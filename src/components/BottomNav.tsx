"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, FileEdit, Wrench, GraduationCap, User, BarChart2 } from "lucide-react";
import { isUserAdmin } from "@/lib/roles";

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = isUserAdmin(session?.user?.email, (session?.user as any)?.role);

  const links = [
    { href: "/dashboard", label: "Beranda", icon: Home },
    { href: "/workspace", label: "Workspace", icon: FileEdit },
    { href: "/tools", label: "Tools", icon: Wrench },
    { href: "/sidang", label: "Sidang", icon: GraduationCap },
    ...(isAdmin ? [{ href: "/monitoring", label: "Monitor", icon: BarChart2, isAdmin: true }] : []),
    { href: "/profil", label: "Profil", icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 w-full h-[60px] pb-[env(safe-area-inset-bottom)] bg-[var(--color-bg-surface)] border-t border-[var(--color-bg-muted)] flex items-center justify-around z-50">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
        const adminLink = (link as any).isAdmin;
        return (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center justify-center w-full h-full relative"
          >
            <link.icon
              size={22}
              className={`mb-0.5 transition-colors ${
                isActive
                  ? adminLink ? "text-violet-600" : "text-[var(--color-brand-600)]"
                  : "text-[var(--color-text-secondary)]"
              }`}
            />
            <span className={`text-[10px] transition-colors ${
              isActive
                ? adminLink ? "text-violet-600 font-semibold" : "text-[var(--color-brand-600)] font-semibold"
                : "text-[var(--color-text-secondary)] font-normal"
            }`}>
              {link.label}
            </span>
            {isActive && (
              <span className={`absolute bottom-1 w-1 h-1 rounded-full ${adminLink ? "bg-violet-600" : "bg-[var(--color-brand-600)]"}`} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
