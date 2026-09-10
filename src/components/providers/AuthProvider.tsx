"use client";

import { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { isUserAdmin } from "@/lib/roles";
import { createInitialQuota, saveUserQuota } from "@/lib/quota";

function SessionQuotaSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (typeof window !== "undefined" && session?.user) {
      const email = session.user.email?.toLowerCase().trim() || "";
      const role = (session.user as any)?.role || "free";
      const isAdmin = isUserAdmin(email, role);

      localStorage.setItem("bbr_user_email", email);
      localStorage.setItem("bbr_user_role", isAdmin ? "admin" : role);

      if (isAdmin) {
        const adminQuota = createInitialQuota("admin");
        saveUserQuota(adminQuota);
      }
    }
  }, [session]);

  return null;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionQuotaSync />
      {children}
    </SessionProvider>
  );
}
