import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[60vh] animate-in fade-in duration-300 text-[var(--color-brand-600)]">
      <Loader2 className="animate-spin mb-4" size={48} />
      <h2 className="font-semibold text-lg">Memuat Halaman...</h2>
      <p className="text-sm text-[var(--color-text-secondary)]">Mohon tunggu sebentar.</p>
    </div>
  );
}
