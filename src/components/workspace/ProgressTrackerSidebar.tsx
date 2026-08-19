'use client';

import { CheckCircle2, Circle, Clock } from 'lucide-react';

export default function ProgressTrackerSidebar() {
  const overallProgress = 35; // Mock data

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Progres Keseluruhan</h3>
        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{overallProgress}%</span>
      </div>

      <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Bab I: Pendahuluan</p>
            <p className="text-xs text-zinc-500">Selesai • 1.200 kata</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock size={18} className="text-amber-500 mt-0.5 shrink-0" />
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Bab II: Tinjauan Pustaka</p>
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">45%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: '45%' }} />
            </div>
            <p className="text-xs text-zinc-500 mt-1">Target: 3.000 kata • Saat ini: 1.350</p>
          </div>
        </div>

        <div className="flex items-start gap-3 opacity-60">
          <Circle size={18} className="text-zinc-300 dark:text-zinc-700 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Bab III: Metodologi</p>
            <p className="text-xs text-zinc-500">Belum dimulai</p>
          </div>
        </div>
      </div>
    </div>
  );
}
