"use client";

import { usePathname } from "next/navigation";

export default function DashboardContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWorkspace = pathname.startsWith("/workspace");

  if (isWorkspace) {
    return (
      <main className="flex-1 flex flex-col h-full w-full overflow-hidden relative">
        {children}
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto pb-24 lg:pb-10 p-4 md:p-8">
      <div className="max-w-[920px] mx-auto">
        {children}
      </div>
    </main>
  );
}
