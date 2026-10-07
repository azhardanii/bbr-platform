import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import OnboardingGuard from "@/components/OnboardingGuard";
import AuthGuard from "@/components/AuthGuard";
import InteractiveGuide from "@/components/InteractiveGuide";
import FloatingFAQ from "@/components/FloatingFAQ";
import DashboardContentWrapper from "@/components/DashboardContentWrapper";
import MobileHeader from "@/components/MobileHeader";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Server-side authentication guard:
  // If session is absent, immediately redirect to login page.
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-[var(--color-bg-base)] overflow-hidden">
      {/* Client-side guards for session expiration and bfcache back-navigation */}
      <AuthGuard />
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
