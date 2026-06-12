import OnboardingWizard from "@/components/OnboardingWizard";

export const metadata = {
  title: "Onboarding - BBR Platform",
};

export default function OnboardingPage() {
  return (
    <div className="w-full max-w-md mx-auto">
      <OnboardingWizard />
    </div>
  );
}
