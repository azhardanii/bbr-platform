import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import OnboardingGuard from "@/components/OnboardingGuard";
import InteractiveGuide from "@/components/InteractiveGuide";
import FloatingFAQ from "@/components/FloatingFAQ";
import DashboardContentWrapper from "@/components/DashboardContentWrapper";
import MobileHeader from "@/components/MobileHeader";

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
        <MobileHeader />
        
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
