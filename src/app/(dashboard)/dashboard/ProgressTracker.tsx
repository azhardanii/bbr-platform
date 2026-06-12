"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { useJenjang } from "@/hooks/useJenjang";

export default function ProgressTracker() {
  const [progress, setProgress] = useState([
    { bab: 1, pct: 0 },
    { bab: 2, pct: 0 },
    { bab: 3, pct: 0 },
    { bab: 4, pct: 0 },
    { bab: 5, pct: 0 },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("bbr_progress");
    if (saved) {
      try { setProgress(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const handleUpdate = (bab: number) => {
    const newProgress = progress.map(p => {
      if (p.bab === bab) {
        // Simple cycle: 0 -> 25 -> 50 -> 75 -> 100 -> 0
        const nextPct = p.pct >= 100 ? 0 : p.pct + 25;
        return { ...p, pct: nextPct };
      }
      return p;
    });
    setProgress(newProgress);
    localStorage.setItem("bbr_progress", JSON.stringify(newProgress));
  };

  const { label } = useJenjang();

  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] p-5 md:p-6 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg text-[var(--color-text-primary)]">Progress {label}</h2>
        <span className="text-xs font-medium text-[var(--color-brand-600)] bg-[var(--color-brand-100)] px-2 py-1 rounded-full">Ketuk bar untuk update</span>
      </div>
      <div className="space-y-5">
        {progress.map((p) => (
          <div key={p.bab} className="group cursor-pointer" onClick={() => handleUpdate(p.bab)}>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-[var(--color-text-body)] flex items-center gap-2">
                Bab {p.bab}
                {p.pct === 100 && <Check size={12} className="text-[var(--color-success)]" />}
              </span>
              <span className={p.pct === 100 ? "text-[var(--color-success)]" : "text-[var(--color-text-secondary)]"}>{p.pct}%</span>
            </div>
            <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-[var(--color-bg-muted)]">
              <div 
                className={`${p.pct === 100 ? 'bg-[var(--color-success)]' : 'bg-[var(--color-brand-600)]'} h-full transition-all duration-300 rounded-full`} 
                style={{ width: `${p.pct}%` }} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
