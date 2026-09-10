"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  BarChart2, Activity, Users, Zap, RefreshCw, Filter,
  ChevronLeft, ChevronRight, Shield, Clock, TrendingUp,
  Bot, Search, Download
} from "lucide-react";
import { isUserAdmin } from "@/lib/roles";

// ─── Types ──────────────────────────────────────────────────────────────────

interface LogEntry {
  id: string;
  feature: string;
  model: string | null;
  created_at: string;
  user: {
    id: string;
    email: string;
    nama_lengkap: string | null;
    role: string;
  };
}

interface FeatureStat {
  feature: string;
  _count: { id: number };
}

interface MonitoringData {
  logs: LogEntry[];
  total: number;
  featureStats: FeatureStat[];
  page: number;
  limit: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const FEATURE_LABELS: Record<string, string> = {
  parafrase: "Parafrase AI",
  writingAssistant: "Klinik Naskah",
  judulFinder: "Judul Finder",
  spss: "SPSS Interpreter",
  sidang: "Simulator Sidang",
  sitasi: "Sitasi & Bibliometrik",
  scriptWa: "Script WA Dosen",
  kompilasi: "Kompilasi Word",
};

const FEATURE_COLORS: Record<string, string> = {
  parafrase: "#6366f1",
  writingAssistant: "#8b5cf6",
  judulFinder: "#3b82f6",
  spss: "#10b981",
  sidang: "#f59e0b",
  sitasi: "#ef4444",
  scriptWa: "#ec4899",
  kompilasi: "#64748b",
};

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-violet-100 text-violet-700 border-violet-200",
  member: "bg-blue-100 text-blue-700 border-blue-200",
  free: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MonitoringPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ feature: "", search: "" });
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  // Guard: admin only
  useEffect(() => {
    if (status === "authenticated") {
      const email = session?.user?.email;
      const role = (session?.user as any)?.role;
      if (!isUserAdmin(email, role)) {
        router.replace("/dashboard");
      }
    }
  }, [status, session, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
      });
      if (filter.feature) params.set("feature", filter.feature);

      const res = await fetch(`/api/admin/monitoring?${params}`);
      if (!res.ok) throw new Error("Forbidden");
      const json = await res.json();
      setData(json);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, filter.feature]);

  useEffect(() => {
    if (status === "authenticated") fetchData();
  }, [fetchData, status]);

  if (status === "loading" || (status === "authenticated" && (session?.user as any)?.role !== "admin")) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-[var(--color-brand-600)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  // Filtered logs by search
  const displayedLogs = data?.logs.filter(log =>
    !filter.search ||
    log.user.email.toLowerCase().includes(filter.search.toLowerCase()) ||
    (log.user.nama_lengkap || "").toLowerCase().includes(filter.search.toLowerCase())
  ) ?? [];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
              <BarChart2 size={18} className="text-violet-600" />
            </div>
            <h1 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
              Monitoring AI
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-600 text-white">
              Admin Only
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Track semua pemakaian fitur AI oleh seluruh user BBR secara real-time.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-bg-muted)] bg-[var(--color-bg-surface)] text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] hover:border-[var(--color-brand-300)] transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Activity size={20} className="text-violet-600" />}
          bg="bg-violet-50"
          label="Total AI Calls"
          value={data?.total ?? 0}
          sub="semua fitur"
        />
        <StatCard
          icon={<Users size={20} className="text-blue-600" />}
          bg="bg-blue-50"
          label="Fitur Terpopuler"
          value={data?.featureStats[0]
            ? FEATURE_LABELS[data.featureStats[0].feature] || data.featureStats[0].feature
            : "—"}
          sub={data?.featureStats[0] ? `${data.featureStats[0]._count.id}x dipakai` : ""}
          isText
        />
        <StatCard
          icon={<Zap size={20} className="text-amber-600" />}
          bg="bg-amber-50"
          label="Calls Hari Ini"
          value={data?.logs.filter(l => {
            const d = new Date(l.created_at);
            const today = new Date();
            return d.toDateString() === today.toDateString();
          }).length ?? 0}
          sub="24 jam terakhir"
        />
        <StatCard
          icon={<TrendingUp size={20} className="text-emerald-600" />}
          bg="bg-emerald-50"
          label="Fitur Aktif"
          value={data?.featureStats.length ?? 0}
          sub="dari 8 fitur"
        />
      </div>

      {/* Feature Usage Bar Chart */}
      {data && data.featureStats.length > 0 && (
        <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-bg-muted)] p-5">
          <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
            <Bot size={16} className="text-[var(--color-brand-600)]" />
            Distribusi Penggunaan per Fitur
          </h2>
          <div className="space-y-3">
            {data.featureStats.map((stat) => {
              const maxCount = data.featureStats[0]._count.id;
              const pct = Math.round((stat._count.id / maxCount) * 100);
              const color = FEATURE_COLORS[stat.feature] || "#6366f1";
              return (
                <div key={stat.feature} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[var(--color-text-secondary)] w-36 truncate shrink-0">
                    {FEATURE_LABELS[stat.feature] || stat.feature}
                  </span>
                  <div className="flex-1 h-5 bg-[var(--color-bg-muted)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[var(--color-text-primary)] w-10 text-right shrink-0">
                    {stat._count.id}x
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari user (nama / email)..."
            value={filter.search}
            onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
            className="w-full pl-9 pr-4 py-2 text-sm border border-[var(--color-bg-muted)] rounded-xl bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] transition-all"
          />
        </div>
        <div className="relative">
          <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <select
            value={filter.feature}
            onChange={(e) => { setFilter(f => ({ ...f, feature: e.target.value })); setPage(1); }}
            className="pl-9 pr-8 py-2 text-sm border border-[var(--color-bg-muted)] rounded-xl bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] cursor-pointer transition-all appearance-none"
          >
            <option value="">Semua Fitur</option>
            {Object.entries(FEATURE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-bg-muted)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--color-bg-muted)] flex items-center justify-between">
          <span className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Clock size={15} className="text-[var(--color-brand-600)]" />
            Log Penggunaan AI
          </span>
          <span className="text-xs text-[var(--color-text-secondary)]">
            {data?.total ?? 0} total entri
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--color-brand-600)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayedLogs.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-text-secondary)]">
            <Bot size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">Belum ada data penggunaan AI.</p>
            <p className="text-xs mt-1 opacity-60">Log akan muncul saat user memakai fitur AI BBR.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-bg-muted)]/50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Fitur</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider hidden md:table-cell">Model</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-bg-muted)]">
                {displayedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--color-bg-muted)]/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--color-brand-600)] to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(log.user.nama_lengkap || log.user.email)?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--color-text-primary)] text-xs truncate max-w-[140px]">
                            {log.user.nama_lengkap || "—"}
                          </p>
                          <p className="text-[11px] text-[var(--color-text-secondary)] truncate max-w-[140px]">
                            {log.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${ROLE_BADGE[log.user.role] || ROLE_BADGE.free}`}>
                        {log.user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: FEATURE_COLORS[log.feature] || "#6366f1" }}
                        />
                        <span className="font-medium text-[var(--color-text-primary)] text-xs">
                          {FEATURE_LABELS[log.feature] || log.feature}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-[11px] text-[var(--color-text-secondary)] font-mono bg-[var(--color-bg-muted)] px-1.5 py-0.5 rounded">
                        {log.model ? log.model.split("/").pop()?.slice(0, 20) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[11px] text-[var(--color-text-secondary)]" title={formatDate(log.created_at)}>
                        {timeAgo(log.created_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-[var(--color-bg-muted)] flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-secondary)]">
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="p-1.5 rounded-lg border border-[var(--color-bg-muted)] hover:bg-[var(--color-bg-muted)] disabled:opacity-40 transition-all cursor-pointer"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="p-1.5 rounded-lg border border-[var(--color-bg-muted)] hover:bg-[var(--color-bg-muted)] disabled:opacity-40 transition-all cursor-pointer"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── StatCard helper ─────────────────────────────────────────────────────────

function StatCard({
  icon, bg, label, value, sub, isText = false,
}: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: number | string;
  sub: string;
  isText?: boolean;
}) {
  return (
    <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-bg-muted)] p-4 flex flex-col gap-2">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-[var(--color-text-secondary)]">{label}</p>
        <p className={`font-black text-[var(--color-text-primary)] ${isText ? "text-base leading-tight mt-0.5" : "text-2xl"}`}>
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
        </p>
        {sub && <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
