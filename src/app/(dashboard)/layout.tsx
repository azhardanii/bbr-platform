import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import OnboardingGuard from "@/components/OnboardingGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[var(--color-bg-base)]">
      <OnboardingGuard />
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Mobile/Tablet (Optional, or just padding) */}
        <div className="lg:hidden p-4 border-b border-[var(--color-bg-muted)] bg-[var(--color-bg-surface)] flex justify-between items-center">
          <h1 className="font-display font-bold text-xl text-[var(--color-brand-600)]">BBR</h1>
          {/* Hamburger menu would go here */}
        </div>
        
        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 p-4 md:p-8">
          <div className="max-w-[800px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
