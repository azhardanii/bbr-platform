import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import OnboardingGuard from "@/components/OnboardingGuard";
import InteractiveGuide from "@/components/InteractiveGuide";
import FloatingFAQ from "@/components/FloatingFAQ";
import DashboardContentWrapper from "@/components/DashboardContentWrapper";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[var(--color-bg-base)] overflow-hidden">
      <OnboardingGuard />
      <InteractiveGuide />
      <FloatingFAQ />

      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header Mobile/Tablet */}
        <div className="lg:hidden p-4 border-b border-[var(--color-bg-muted)] bg-[var(--color-bg-surface)] flex justify-between items-center shrink-0">
          <h1 className="font-display font-bold text-xl text-[var(--color-brand-600)]">BBR</h1>
        </div>
        
        {/* Dynamic Responsive Content Area */}
        <DashboardContentWrapper>
          {children}
        </DashboardContentWrapper>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
