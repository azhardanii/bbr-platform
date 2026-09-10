'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { getWorkspaceProgressData, WorkspaceProgressData } from '@/lib/workspaceProgress';

export default function ProgressTrackerSidebar() {
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
    const handleSync = () => refreshProgress();
    window.addEventListener("storage", handleSync);
    window.addEventListener("bbr_workspace_updated", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("bbr_workspace_updated", handleSync);
    };
  }, []);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Progres Keseluruhan</h3>
        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{data.overallPercentage}%</span>
      </div>

      <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${data.overallPercentage}%` }}
        />
      </div>

      <div className="space-y-3 pt-2">
        {data.items.slice(0, 5).map((item) => {
          const isDone = item.percentage === 100;
          const isInProgress = item.percentage > 0 && item.percentage < 100;

          return (
            <div key={item.id} className={`flex items-start gap-3 ${!isDone && !isInProgress ? 'opacity-60' : ''}`}>
              {isDone ? (
                <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
              ) : isInProgress ? (
                <Clock size={18} className="text-amber-500 mt-0.5 shrink-0" />
              ) : (
                <Circle size={18} className="text-zinc-300 dark:text-zinc-700 mt-0.5 shrink-0" />
              )}
              <div className="w-full">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{item.title}</p>
                  <span className={`text-xs font-medium ${isDone ? 'text-emerald-600' : isInProgress ? 'text-amber-600' : 'text-zinc-400'}`}>
                    {item.percentage}%
                  </span>
                </div>
                {isInProgress && (
                  <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                )}
                <p className="text-xs text-zinc-500">
                  {item.words > 0 ? `${item.words.toLocaleString('id-ID')} kata` : 'Belum ada ketikan'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
