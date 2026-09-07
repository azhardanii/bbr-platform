"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  CheckCircle2, ArrowRight, FileEdit, Clock, FileText, 
  Sparkles, BookOpen, Layers, Check, ExternalLink
} from "lucide-react";
import { useJenjang } from "@/hooks/useJenjang";
import { 
  getWorkspaceProgressData, 
  cycleBabMilestone, 
  WorkspaceProgressData 
} from "@/lib/workspaceProgress";

export default function ProgressTracker() {
  const { label } = useJenjang();
  const [data, setData] = useState<WorkspaceProgressData>({
    jenjang: "S1",
    totalBabs: 5,
    filledCount: 0,
    completedCount: 0,
    overallPercentage: 0,
    totalWords: 0,
    items: [],
  });

  const refreshProgress = () => {
    const current = getWorkspaceProgressData();
    setData(current);
  };

  useEffect(() => {
    refreshProgress();

    const handleSync = () => {
      refreshProgress();
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener("bbr_workspace_updated", handleSync);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("bbr_workspace_updated", handleSync);
    };
  }, []);

  const handleCycleMilestone = (babId: string, currentPct: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    cycleBabMilestone(babId, currentPct);
    refreshProgress();
  };

  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] p-5 md:p-6 rounded-2xl shadow-sm space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg md:text-xl text-[var(--color-text-primary)]">
              Progress Real Naskah {label}
            </h2>
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)]">
              {data.overallPercentage}% Selesai
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Terhubung langsung dengan draf dan bab aktif di Workspace tugas akhirmu.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/workspace"
            className="text-xs font-bold bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
          >
            <FileEdit size={14} />
            <span>Buka Workspace Naskah</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* 2. Overall Progress Summary Card */}
      <div className="bg-[var(--color-bg-base)] border border-[var(--color-bg-muted)] p-4 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-4 text-zinc-600">
            <span className="font-semibold flex items-center gap-1.5">
              <Layers size={14} className="text-[var(--color-brand-600)]" />
              Bab Terisi: <strong className="text-zinc-900">{data.filledCount}</strong> dari {data.totalBabs} Bab
            </span>
            <span className="font-semibold flex items-center gap-1.5">
              <FileText size={14} className="text-[var(--color-brand-600)]" />
              Total Kata: <strong className="text-zinc-900">{data.totalWords.toLocaleString("id-ID")}</strong> kata
            </span>
          </div>

          <span className="text-[11px] font-bold text-[var(--color-brand-700)]">
            Target Naskah Siap Ujian: 100%
          </span>
        </div>

        {/* Dynamic Gradient Bar */}
        <div className="w-full bg-zinc-200/80 h-3 rounded-full overflow-hidden border border-zinc-200">
          <div
            className="h-full bg-gradient-to-r from-[var(--color-brand-600)] via-[var(--color-brand-500)] to-[var(--color-brand-400)] transition-all duration-500 rounded-full"
            style={{ width: `${Math.max(data.overallPercentage, 3)}%` }}
          />
        </div>
      </div>

      {/* 3. Detailed Chapter Cards (Synced with Workspace Outline) */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
          Daftar Kelengkapan Per Bab:
        </div>

        {data.items.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-500 bg-[var(--color-bg-base)] rounded-xl border border-[var(--color-bg-muted)]">
            Belum ada struktur bab naskah. Buka Workspace untuk mulai menyusun tugas akhir.
          </div>
        ) : (
          data.items.map((item) => {
            const isFinished = item.percentage >= 100;
            const hasDraft = item.words > 0 || !!item.upload;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isFinished
                    ? "bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-300"
                    : hasDraft
                    ? "bg-white border-zinc-200 hover:border-[var(--color-brand-300)] shadow-2xs"
                    : "bg-zinc-50/50 border-zinc-200/70 hover:border-zinc-300"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  {/* Left: Bab Title & Sub-bab info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {isFinished ? (
                        <CheckCircle2 size={18} className="text-emerald-600" />
                      ) : hasDraft ? (
                        <Clock size={18} className="text-[var(--color-brand-600)]" />
                      ) : (
                        <div className="w-4.5 h-4.5 rounded-full border-2 border-zinc-300 flex items-center justify-center text-[9px] font-bold text-zinc-400">
                          {item.babNumber}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-zinc-900 truncate">
                          {item.title}
                        </span>
                        {item.subBabCount > 0 && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 shrink-0">
                            {item.subBabCount} sub-bab
                          </span>
                        )}
                        {item.upload && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                            Berkas Terlampir
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-500 mt-0.5">
                        {item.statusLabel}
                      </p>
                    </div>
                  </div>

                  {/* Right: Interactive Percentage & Direct Link */}
                  <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                    {/* Interactive Milestone Button */}
                    <button
                      onClick={(e) => handleCycleMilestone(item.id, item.percentage, e)}
                      title="Klik untuk ubah milestone progress (0%, 25%, 50%, 75%, 100%)"
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all border flex items-center gap-1 ${
                        isFinished
                          ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-2xs"
                          : item.percentage > 0
                          ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)] border-[var(--color-brand-200)] hover:bg-[var(--color-brand-100)]"
                          : "bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200"
                      }`}
                    >
                      {isFinished && <Check size={12} />}
                      <span>{item.percentage}%</span>
                    </button>

                    {/* Direct Chapter Link to Workspace */}
                    <Link
                      href={`/workspace?bab=${item.id}`}
                      className="px-3 py-1 bg-white hover:bg-[var(--color-brand-50)] text-zinc-700 hover:text-[var(--color-brand-700)] border border-zinc-200 hover:border-[var(--color-brand-300)] text-xs font-semibold rounded-lg flex items-center gap-1 transition-all shadow-2xs"
                      title={`Tulis naskah ${item.title} langsung di Workspace`}
                    >
                      <span>Tulis</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>

                {/* Individual Chapter Progress Bar */}
                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden mt-3 border border-zinc-200/50">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      isFinished
                        ? "bg-emerald-500"
                        : item.percentage > 0
                        ? "bg-[var(--color-brand-600)]"
                        : "bg-transparent"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
