"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  BarChart2, Activity, Users, Zap, RefreshCw, Filter,
  ChevronLeft, ChevronRight, Clock, TrendingUp,
  Bot, Search, Download, CreditCard, ArrowRightLeft,
  Calendar, Check, Copy, ExternalLink, MessageSquare,
  Sparkles, X, ChevronDown, CheckCircle2, UserCheck,
  ShoppingBag, ShieldCheck, HelpCircle
} from "lucide-react";
import { isUserAdmin } from "@/lib/roles";

// ─── Types ──────────────────────────────────────────────────────────────────

type TimeRange = "today" | "7days" | "this_month" | "last_month" | "3months" | "all";
type ActiveTab = "transactions" | "funnel" | "ai_monitoring";

interface TransactionItem {
  title: string;
  price: number;
  qty: number;
  priceFormatted: string;
}

interface TransactionRecord {
  id: string;
  refId: string;
  buyerEmail: string;
  buyerName: string;
  buyerPhone: string;
  waLink: string | null;
  grandTotal: number;
  grandTotalFormatted: string;
  items: TransactionItem[];
  status: string;
  processed: boolean;
  buyerType: "converted" | "direct" | "guest";
  isRegistered: boolean;
  registeredUserId: string | null;
  createdAt: string;
  rawPayload: any;
}

interface FunnelUserRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  tier: string;
  onboardingCompleted: boolean;
  createdAt: string | null;
  paidAt: string | null;
  transactionCount: number;
  totalSpent: number;
  totalSpentFormatted: string;
  funnelStage: "admin" | "converted_paid" | "direct_paid" | "free_active" | "free_new";
}

interface TransactionsSummary {
  timeRange: TimeRange;
  totalRevenue: number;
  totalRevenueFormatted: string;
  totalTransactions: number;
  totalSignups: number;
  freeUsersCount: number;
  totalFreeEver: number;
  convertedUsersCount: number;
  directPaidCount: number;
  convertedTxCount: number;
  conversionRatePct: string;
}

interface TransactionsApiResponse {
  summary: TransactionsSummary;
  transactions: TransactionRecord[];
  funnelUsers: FunnelUserRecord[];
}

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

interface AIMonitoringData {
  logs: LogEntry[];
  total: number;
  featureStats: FeatureStat[];
  page: number;
  limit: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TIME_RANGE_OPTIONS: { id: TimeRange; label: string; desc: string }[] = [
  { id: "today", label: "Hari Ini", desc: "24 jam terakhir" },
  { id: "7days", label: "7 Hari", desc: "7 hari terakhir" },
  { id: "this_month", label: "Bulan Ini", desc: "Bulan berjalan" },
  { id: "last_month", label: "Bulan Kemarin", desc: "1 bulan penuh lalu" },
  { id: "3months", label: "3 Bulan", desc: "Kuartal terakhir" },
  { id: "all", label: "Semua Waktu", desc: "Keseluruhan data" },
];

const CHECKOUT_LINKS = [
  {
    name: "Akses Lifetime Belajar Bareng Roselini",
    code: "xq66xon40g7v",
    url: "http://lynk.id/belajarbarengroselini/xq66xon40g7v/checkout",
    type: "Tier Akses",
  },
  {
    name: "Add-on Kuota: Parafrase AI",
    code: "g4wwlxme885k",
    url: "http://lynk.id/belajarbarengroselini/g4wwlxme885k/checkout",
    type: "Addon AI",
  },
  {
    name: "Add-on Kuota: Judul Finder",
    code: "owee9o276po8",
    url: "http://lynk.id/belajarbarengroselini/owee9o276po8/checkout",
    type: "Addon AI",
  },
  {
    name: "Add-on Kuota: Simulator Sidang",
    code: "w9gg3p895v4j",
    url: "http://lynk.id/belajarbarengroselini/w9gg3p895v4j/checkout",
    type: "Addon AI",
  },
  {
    name: "Add-on Kuota: Sitasi & Bibliometrik",
    code: "z1mm52x949gw",
    url: "http://lynk.id/belajarbarengroselini/z1mm52x949gw/checkout",
    type: "Addon AI",
  },
  {
    name: "Add-on Kuota: Script WA Dosen",
    code: "3v99moeqjwqq",
    url: "http://lynk.id/belajarbarengroselini/3v99moeqjwqq/checkout",
    type: "Addon AI",
  },
  {
    name: "Add-on Kuota: Kompilasi Word & Dokumen",
    code: "yn11o5jp2weo",
    url: "http://lynk.id/belajarbarengroselini/yn11o5jp2weo/checkout",
    type: "Addon AI",
  },
  {
    name: "Add-on Kuota: Klinik Naskah & Bedah Draft",
    code: "yyggjn4pg3ym",
    url: "http://lynk.id/belajarbarengroselini/yyggjn4pg3ym/checkout",
    type: "Addon AI",
  },
  {
    name: "Add-on Kuota: Olah Data SPSS & Statistik",
    code: "l8qqg9dkpnx6",
    url: "http://lynk.id/belajarbarengroselini/l8qqg9dkpnx6/checkout",
    type: "Addon AI",
  },
];

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
  admin: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800",
  member: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  free: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function timeAgo(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "baru saja";
    if (m < 60) return `${m} menit lalu`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} jam lalu`;
    return `${Math.floor(h / 24)} hari lalu`;
  } catch {
    return "—";
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MonitoringPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState<ActiveTab>("transactions");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [funnelFilter, setFunnelFilter] = useState<string>("all");

  // Data States
  const [txData, setTxData] = useState<TransactionsApiResponse | null>(null);
  const [txLoading, setTxLoading] = useState(true);

  // AI Monitoring Data States
  const [aiData, setAiData] = useState<AIMonitoringData | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiFeatureFilter, setAiFeatureFilter] = useState("");
  const [aiPage, setAiPage] = useState(1);
  const AI_LIMIT = 20;

  // Modals & UI States
  const [selectedTxDetail, setSelectedTxDetail] = useState<TransactionRecord | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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

  // Fetch Transactions & Funneling Data
  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const params = new URLSearchParams({
        range: timeRange,
        search: searchTerm,
      });
      const res = await fetch(`/api/admin/transactions?${params}`);
      if (!res.ok) throw new Error("Gagal mengambil data transaksi");
      const json: TransactionsApiResponse = await res.json();
      setTxData(json);
    } catch (err) {
      console.error("[Fetch Transactions Error]:", err);
    } finally {
      setTxLoading(false);
    }
  }, [timeRange, searchTerm]);

  // Fetch AI Monitoring Data
  const fetchAiData = useCallback(async () => {
    setAiLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(aiPage),
        limit: String(AI_LIMIT),
      });
      if (aiFeatureFilter) params.set("feature", aiFeatureFilter);

      const res = await fetch(`/api/admin/monitoring?${params}`);
      if (!res.ok) throw new Error("Forbidden");
      const json = await res.json();
      setAiData(json);
    } catch (err) {
      console.error("[Fetch AI Monitoring Error]:", err);
    } finally {
      setAiLoading(false);
    }
  }, [aiPage, aiFeatureFilter]);

  // Initial and reactive effects
  useEffect(() => {
    if (status === "authenticated") {
      fetchTransactions();
    }
  }, [fetchTransactions, status]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAiData();
    }
  }, [fetchAiData, status]);

  // Filtered Funnel Users
  const displayedFunnelUsers = useMemo(() => {
    if (!txData?.funnelUsers) return [];
    return txData.funnelUsers.filter((u) => {
      if (funnelFilter === "converted") return u.funnelStage === "converted_paid";
      if (funnelFilter === "free") return u.funnelStage === "free_active" || u.funnelStage === "free_new";
      if (funnelFilter === "direct") return u.funnelStage === "direct_paid";
      if (funnelFilter === "admin") return u.funnelStage === "admin";
      return true;
    });
  }, [txData?.funnelUsers, funnelFilter]);

  // Export Transactions to CSV
  const exportTransactionsToCsv = () => {
    if (!txData?.transactions || txData.transactions.length === 0) return;
    const headers = [
      "Tanggal",
      "Order Ref ID",
      "Nama Pembeli",
      "Email",
      "No Telepon",
      "Produk",
      "Grand Total (IDR)",
      "Status",
      "Tipe Funneling",
    ];

    const rows = txData.transactions.map((tx) => [
      `"${new Date(tx.createdAt).toLocaleString("id-ID")}"`,
      `"${tx.refId}"`,
      `"${tx.buyerName.replace(/"/g, '""')}"`,
      `"${tx.buyerEmail}"`,
      `"${tx.buyerPhone}"`,
      `"${tx.items.map((it) => `${it.title} (x${it.qty})`).join("; ")}"`,
      tx.grandTotal,
      `"${tx.status}"`,
      `"${tx.buyerType}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transaksi-lynkid-${timeRange}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (status === "loading" || (status === "authenticated" && (session?.user as any)?.role !== "admin")) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-[var(--color-brand-600)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const summary = txData?.summary;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* ── Top Header & Global Controls ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center shadow-xs">
              <CreditCard size={20} className="text-violet-600 dark:text-violet-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
              Dashboard Transaksi & Funneling
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-violet-600 text-white shadow-xs">
              Admin Portal
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Pantau arus pembelian Lynk.id, status konversi user free ke berbayar, dan performa AI secara transparan.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowCheckoutModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-violet-200 dark:border-violet-800/60 bg-violet-50/70 dark:bg-violet-950/30 text-xs font-bold text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-all cursor-pointer shadow-xs"
          >
            <ShoppingBag size={14} />
            Daftar Link Checkout Lynk.id
          </button>
          <button
            onClick={() => {
              fetchTransactions();
              if (activeTab === "ai_monitoring") fetchAiData();
            }}
            disabled={txLoading || aiLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--color-bg-muted)] bg-[var(--color-bg-surface)] text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] hover:border-[var(--color-brand-300)] transition-all cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <RefreshCw size={14} className={txLoading ? "animate-spin" : ""} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* ── Time Range Filter Bar ── */}
      <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-bg-muted)] p-3 md:p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)]">
            <Calendar size={15} className="text-violet-600" />
            <span>Pilih Rentang Waktu:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {TIME_RANGE_OPTIONS.map((opt) => {
              const isActive = timeRange === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setTimeRange(opt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-violet-600 text-white shadow-xs ring-2 ring-violet-400/30"
                      : "bg-[var(--color-bg-muted)]/70 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)]"
                  }`}
                  title={opt.desc}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Top Summary / KPI Metric Cards (Reflects Selected Time Range) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* 1. Total Revenue */}
        <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-bg-muted)] p-4 flex flex-col justify-between shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Total Omset Lynk.id</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <p className="text-xl md:text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
              {summary ? summary.totalRevenueFormatted : "Rp 0"}
            </p>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 flex items-center gap-1">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {summary?.totalTransactions ?? 0} transaksi
              </span>{" "}
              sukses terproses
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-150 transition-all pointer-events-none" />
        </div>

        {/* 2. Total Transactions */}
        <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-bg-muted)] p-4 flex flex-col justify-between shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Volume Transaksi</span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center text-violet-600">
              <CreditCard size={16} />
            </div>
          </div>
          <div>
            <p className="text-xl md:text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
              {summary?.totalTransactions ?? 0}
            </p>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
              {summary?.convertedTxCount ?? 0} dari Free • {summary?.directPaidCount ?? 0} Langsung
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-violet-500/5 rounded-full blur-xl group-hover:scale-150 transition-all pointer-events-none" />
        </div>

        {/* 3. Free Users Registered */}
        <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-bg-muted)] p-4 flex flex-col justify-between shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">User Free (Organik)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Users size={16} />
            </div>
          </div>
          <div>
            <p className="text-xl md:text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
              {summary?.freeUsersCount ?? 0}
            </p>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
              Total {summary?.totalFreeEver ?? 0} user free saat ini
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-blue-500/5 rounded-full blur-xl group-hover:scale-150 transition-all pointer-events-none" />
        </div>

        {/* 4. Conversion Rate */}
        <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-bg-muted)] p-4 flex flex-col justify-between shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Tingkat Konversi (Funnel)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <Sparkles size={16} />
            </div>
          </div>
          <div>
            <p className="text-xl md:text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
              {summary?.conversionRatePct ?? "0%"}
            </p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 font-semibold">
              {summary?.convertedUsersCount ?? 0} user free berhasil upgrade
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-amber-500/5 rounded-full blur-xl group-hover:scale-150 transition-all pointer-events-none" />
        </div>
      </div>

      {/* ── Main Tab Navigation ── */}
      <div className="border-b border-[var(--color-bg-muted)] flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "transactions"
                ? "border-violet-600 text-violet-600 dark:text-violet-400"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <CreditCard size={16} />
            <span>Tabel Transaksi Lynk.id</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-bold">
              {txData?.transactions.length ?? 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("funnel")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "funnel"
                ? "border-violet-600 text-violet-600 dark:text-violet-400"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <ArrowRightLeft size={16} />
            <span>Data Funneling (Free ➔ Paid)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
              {txData?.funnelUsers.length ?? 0} User
            </span>
          </button>

          <button
            onClick={() => setActiveTab("ai_monitoring")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "ai_monitoring"
                ? "border-violet-600 text-violet-600 dark:text-violet-400"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Bot size={16} />
            <span>Monitoring AI & Fitur</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">
              {aiData?.total ?? 0} Calls
            </span>
          </button>
        </div>

        {activeTab === "transactions" && (
          <button
            onClick={exportTransactionsToCsv}
            disabled={!txData?.transactions || txData.transactions.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-[var(--color-bg-muted)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer disabled:opacity-40 shrink-0"
          >
            <Download size={13} />
            <span>Ekspor CSV</span>
          </button>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: TABEL TRANSAKSI LYNK.ID ────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "transactions" && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari transaksi berdasarkan nama pembeli, email, nomor order refId, atau produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-[var(--color-bg-muted)] rounded-xl bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-400/40 transition-all"
            />
          </div>

          {/* Table Container */}
          <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-bg-muted)] overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-[var(--color-bg-muted)] flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <CreditCard size={15} className="text-violet-600" />
                Daftar Transaksi Masuk via Webhook Lynk.id
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {txData?.transactions.length ?? 0} data tercatat
              </span>
            </div>

            {txLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !txData?.transactions || txData.transactions.length === 0 ? (
              <div className="text-center py-20 px-4 text-[var(--color-text-secondary)]">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center mx-auto mb-3 text-violet-500">
                  <CreditCard size={28} />
                </div>
                <p className="text-base font-bold text-[var(--color-text-primary)]">Belum Ada Transaksi Lynk.id Tercatat</p>
                <p className="text-xs max-w-md mx-auto mt-1 opacity-70">
                  Data pembelian akan otomatis muncul di sini begitu ada webhook checkout dari Lynk.id yang terkirim ke platform.
                </p>
                <button
                  onClick={() => setShowCheckoutModal(true)}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-all cursor-pointer shadow-xs"
                >
                  <ShoppingBag size={14} />
                  Cek Link Checkout Aktif
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-[var(--color-bg-muted)]/50 text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      <th className="px-4 py-3">Order Ref ID</th>
                      <th className="px-4 py-3">Pembeli</th>
                      <th className="px-4 py-3">Produk / Add-on</th>
                      <th className="px-4 py-3 text-right">Total Bayar</th>
                      <th className="px-4 py-3 text-center">Tipe Buyer</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Waktu</th>
                      <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-bg-muted)]">
                    {txData.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[var(--color-bg-muted)]/30 transition-colors">
                        {/* Ref ID */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 px-2 py-0.5 rounded-md border border-violet-200 dark:border-violet-800/60 max-w-[130px] truncate" title={tx.refId}>
                              {tx.refId}
                            </span>
                            <button
                              onClick={() => handleCopy(tx.refId, `ref-${tx.id}`)}
                              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors p-1"
                              title="Salin Ref ID"
                            >
                              {copiedId === `ref-${tx.id}` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </td>

                        {/* Pembeli */}
                        <td className="px-4 py-3.5">
                          <div className="min-w-[160px]">
                            <p className="font-bold text-xs text-[var(--color-text-primary)]">
                              {tx.buyerName}
                            </p>
                            <p className="text-[11px] text-[var(--color-text-secondary)] truncate">
                              {tx.buyerEmail}
                            </p>
                            {tx.buyerPhone && tx.buyerPhone !== "-" && (
                              <div className="mt-1 flex items-center gap-1.5">
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  {tx.buyerPhone}
                                </span>
                                {tx.waLink && (
                                  <a
                                    href={tx.waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                                    title="Hubungi Pembeli via WhatsApp"
                                  >
                                    <MessageSquare size={10} />
                                    <span>WA</span>
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Items */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-1 max-w-[220px]">
                            {tx.items.length === 0 ? (
                              <span className="text-xs text-zinc-400 italic">Produk Digital BBR</span>
                            ) : (
                              tx.items.map((it, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-[var(--color-text-primary)] truncate">
                                    {it.title}
                                  </span>
                                  {it.qty > 1 && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                      x{it.qty}
                                    </span>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </td>

                        {/* Grand Total */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <span className="font-black text-xs text-emerald-600 dark:text-emerald-400">
                            {tx.grandTotalFormatted}
                          </span>
                        </td>

                        {/* Buyer Funnel Type */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          {tx.buyerType === "converted" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <Sparkles size={10} />
                              Konversi dari Free
                            </span>
                          ) : tx.buyerType === "direct" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              <Zap size={10} />
                              Beli Langsung
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                              Guest
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          {tx.processed || tx.status === "processed" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 size={10} />
                              Sukses
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              {tx.status}
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                            {formatDate(tx.createdAt)}
                          </p>
                          <p className="text-[10px] text-[var(--color-text-secondary)]">
                            {timeAgo(tx.createdAt)}
                          </p>
                        </td>

                        {/* Detail Action */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedTxDetail(tx)}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg border border-[var(--color-bg-muted)] bg-[var(--color-bg-surface)] text-zinc-600 dark:text-zinc-300 hover:text-violet-600 hover:border-violet-300 transition-all cursor-pointer shadow-2xs"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: DATA FUNNELING PENGGUNA (FREE ➔ PAID) ──────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "funnel" && (
        <div className="space-y-4">
          {/* Funnel Concept Banner */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={18} className="text-amber-300" />
                <h3 className="font-extrabold text-base">Alur Funneling Pengguna Mahasiswa</h3>
              </div>
              <p className="text-xs text-white/80 max-w-xl">
                Pantau konversi mulai dari user mendaftar akun gratis, mencoba kuota AI, hingga berhasil meng-upgrade ke akses berbayar atau membeli add-on.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl shrink-0">
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-white/70">Konversi Rate</p>
                <p className="text-xl font-black text-amber-300">{summary?.conversionRatePct ?? "0%"}</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-white/70">User Free Terkonversi</p>
                <p className="text-xl font-black">{summary?.convertedUsersCount ?? 0}</p>
              </div>
            </div>
          </div>

          {/* Sub Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
              {[
                { id: "all", label: "Semua Pengguna" },
                { id: "converted", label: "⭐ Konversi (Free ➔ Beli)" },
                { id: "free", label: "🌱 Pengguna Free" },
                { id: "direct", label: "⚡ Pembeli Langsung" },
                { id: "admin", label: "🛡️ Admin" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFunnelFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    funnelFilter === f.id
                      ? "bg-violet-600 text-white shadow-xs"
                      : "bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari user (nama / email)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-[var(--color-bg-muted)] rounded-xl bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-400/40 transition-all"
              />
            </div>
          </div>

          {/* Funnel Directory Table */}
          <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-bg-muted)] overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-[var(--color-bg-muted)] flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <Users size={15} className="text-violet-600" />
                Direktori Funnel Pengguna
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                Menampilkan {displayedFunnelUsers.length} pengguna
              </span>
            </div>

            {txLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : displayedFunnelUsers.length === 0 ? (
              <div className="text-center py-16 text-[var(--color-text-secondary)]">
                <Users size={36} className="mx-auto mb-2 opacity-25" />
                <p className="text-sm font-semibold">Tidak ada pengguna pada kategori ini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-[var(--color-bg-muted)]/50 text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      <th className="px-4 py-3">Nama & Email User</th>
                      <th className="px-4 py-3 text-center">Tahap Funnel</th>
                      <th className="px-4 py-3 text-center">Role & Tier</th>
                      <th className="px-4 py-3 text-center">Onboarding</th>
                      <th className="px-4 py-3 text-right">Total Belanja</th>
                      <th className="px-4 py-3 text-right">Tanggal Daftar</th>
                      <th className="px-4 py-3 text-right">Tanggal Pembelian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-bg-muted)]">
                    {displayedFunnelUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[var(--color-bg-muted)]/30 transition-colors">
                        {/* User Identity */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {(u.name || u.email)?.[0]?.toUpperCase() ?? "U"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-[var(--color-text-primary)] truncate max-w-[160px]">
                                {u.name}
                              </p>
                              <p className="text-[11px] text-[var(--color-text-secondary)] truncate max-w-[160px]">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Funnel Stage Badge */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          {u.funnelStage === "converted_paid" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <Sparkles size={10} />
                              Konversi (Free ➔ Paid)
                            </span>
                          ) : u.funnelStage === "free_active" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              <UserCheck size={10} />
                              Free Aktif (Onboarding Selesai)
                            </span>
                          ) : u.funnelStage === "free_new" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                              🌱 Free Baru
                            </span>
                          ) : u.funnelStage === "direct_paid" ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              <Zap size={10} />
                              Pembeli Langsung
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                              <ShieldCheck size={10} />
                              Admin
                            </span>
                          )}
                        </td>

                        {/* Role & Tier */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${ROLE_BADGE[u.role] || ROLE_BADGE.free}`}>
                            {u.tier} ({u.role})
                          </span>
                        </td>

                        {/* Onboarding */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          {u.onboardingCompleted ? (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                              Selesai
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                              Belum
                            </span>
                          )}
                        </td>

                        {/* Total Spent */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          {u.totalSpent > 0 ? (
                            <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                              {u.totalSpentFormatted}
                            </span>
                          ) : (
                            <span className="text-xs text-zinc-400">—</span>
                          )}
                        </td>

                        {/* Register Date */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <span className="text-xs text-[var(--color-text-secondary)]">
                            {formatDate(u.createdAt)}
                          </span>
                        </td>

                        {/* Paid Date */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                            {formatDate(u.paidAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 3: MONITORING PENGGUNAAN AI & FITUR ────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "ai_monitoring" && (
        <div className="space-y-6">
          {/* AI Usage KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Activity size={20} className="text-violet-600" />}
              bg="bg-violet-50 dark:bg-violet-950/40"
              label="Total AI Calls"
              value={aiData?.total ?? 0}
              sub="semua fitur"
            />
            <StatCard
              icon={<Users size={20} className="text-blue-600" />}
              bg="bg-blue-50 dark:bg-blue-950/40"
              label="Fitur Terpopuler"
              value={
                aiData?.featureStats[0]
                  ? FEATURE_LABELS[aiData.featureStats[0].feature] || aiData.featureStats[0].feature
                  : "—"
              }
              sub={aiData?.featureStats[0] ? `${aiData.featureStats[0]._count.id}x dipakai` : ""}
              isText
            />
            <StatCard
              icon={<Zap size={20} className="text-amber-600" />}
              bg="bg-amber-50 dark:bg-amber-950/40"
              label="Calls Hari Ini"
              value={
                aiData?.logs.filter((l) => {
                  const d = new Date(l.created_at);
                  const today = new Date();
                  return d.toDateString() === today.toDateString();
                }).length ?? 0
              }
              sub="24 jam terakhir"
            />
            <StatCard
              icon={<TrendingUp size={20} className="text-emerald-600" />}
              bg="bg-emerald-50 dark:bg-emerald-950/40"
              label="Fitur Aktif"
              value={aiData?.featureStats.length ?? 0}
              sub="dari 8 fitur skripsi"
            />
          </div>

          {/* Feature Usage Bar Chart */}
          {aiData && aiData.featureStats.length > 0 && (
            <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-bg-muted)] p-5 shadow-xs">
              <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                <Bot size={16} className="text-[var(--color-brand-600)]" />
                Distribusi Penggunaan per Fitur AI
              </h2>
              <div className="space-y-3">
                {aiData.featureStats.map((stat) => {
                  const maxCount = aiData.featureStats[0]._count.id;
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

          {/* AI Log Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari user (nama / email)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-[var(--color-bg-muted)] rounded-xl bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] transition-all"
              />
            </div>
            <div className="relative">
              <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <select
                value={aiFeatureFilter}
                onChange={(e) => {
                  setAiFeatureFilter(e.target.value);
                  setAiPage(1);
                }}
                className="pl-9 pr-8 py-2 text-sm border border-[var(--color-bg-muted)] rounded-xl bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] cursor-pointer transition-all appearance-none"
              >
                <option value="">Semua Fitur</option>
                {Object.entries(FEATURE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AI Log Table */}
          <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-bg-muted)] overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-[var(--color-bg-muted)] flex items-center justify-between">
              <span className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <Clock size={15} className="text-[var(--color-brand-600)]" />
                Log Pemanggilan AI Terkini
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {aiData?.total ?? 0} total entri
              </span>
            </div>

            {aiLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-[var(--color-brand-600)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !aiData?.logs || aiData.logs.length === 0 ? (
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
                    {aiData.logs.map((log) => (
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
            {aiData && Math.ceil(aiData.total / AI_LIMIT) > 1 && (
              <div className="px-5 py-3 border-t border-[var(--color-bg-muted)] flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-secondary)]">
                  Halaman {aiPage} dari {Math.ceil(aiData.total / AI_LIMIT)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAiPage((p) => Math.max(1, p - 1))}
                    disabled={aiPage === 1 || aiLoading}
                    className="p-1.5 rounded-lg border border-[var(--color-bg-muted)] hover:bg-[var(--color-bg-muted)] disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    onClick={() => setAiPage((p) => Math.min(Math.ceil(aiData.total / AI_LIMIT), p + 1))}
                    disabled={aiPage === Math.ceil(aiData.total / AI_LIMIT) || aiLoading}
                    className="p-1.5 rounded-lg border border-[var(--color-bg-muted)] hover:bg-[var(--color-bg-muted)] disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: DETAIL TRANSAKSI LYNK.ID ───────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--color-bg-muted)] pb-3">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-violet-600" />
                <h3 className="font-extrabold text-base text-[var(--color-text-primary)]">
                  Rincian Transaksi Lynk.id
                </h3>
              </div>
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="p-1 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-[var(--color-bg-muted)] transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Info Grid */}
            <div className="space-y-3 text-xs">
              <div className="bg-[var(--color-bg-muted)]/50 p-3.5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Order Ref ID:</span>
                  <span className="font-mono font-bold text-violet-700 dark:text-violet-300">
                    {selectedTxDetail.refId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Waktu Pembelian:</span>
                  <span className="font-semibold">{formatDate(selectedTxDetail.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Status Transaksi:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedTxDetail.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Klasifikasi Funneling:</span>
                  <span className="font-bold text-violet-600 dark:text-violet-400">
                    {selectedTxDetail.buyerType === "converted"
                      ? "⭐ Konversi dari Pengguna Free"
                      : selectedTxDetail.buyerType === "direct"
                      ? "⚡ Beli Langsung (Direct)"
                      : "👤 Guest"}
                  </span>
                </div>
              </div>

              {/* Pembeli Box */}
              <div className="border border-[var(--color-bg-muted)] p-3.5 rounded-2xl space-y-1.5">
                <p className="font-bold text-zinc-500 uppercase text-[10px] tracking-wider">Identitas Pembeli</p>
                <p className="font-bold text-sm text-[var(--color-text-primary)]">{selectedTxDetail.buyerName}</p>
                <p className="text-[var(--color-text-secondary)]">{selectedTxDetail.buyerEmail}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-zinc-400">No. WhatsApp/HP:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{selectedTxDetail.buyerPhone}</span>
                    {selectedTxDetail.waLink && (
                      <a
                        href={selectedTxDetail.waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md"
                      >
                        <MessageSquare size={11} />
                        Chat WA
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Produk Dibeli */}
              <div className="border border-[var(--color-bg-muted)] p-3.5 rounded-2xl space-y-2">
                <p className="font-bold text-zinc-500 uppercase text-[10px] tracking-wider">Item Pembelian</p>
                <div className="space-y-1.5 divide-y divide-[var(--color-bg-muted)]">
                  {selectedTxDetail.items.map((it, i) => (
                    <div key={i} className="pt-1.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[var(--color-text-primary)]">{it.title}</p>
                        <p className="text-[10px] text-zinc-400">Jumlah: {it.qty} unit</p>
                      </div>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{it.priceFormatted}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-[var(--color-bg-muted)] flex items-center justify-between font-black text-sm">
                  <span>Grand Total</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {selectedTxDetail.grandTotalFormatted}
                  </span>
                </div>
              </div>

              {/* Raw JSON Payload (collapsible) */}
              <details className="border border-[var(--color-bg-muted)] rounded-2xl p-3 text-[11px]">
                <summary className="font-bold text-zinc-500 cursor-pointer select-none">
                  Lihat Raw Webhook Payload Lynk.id
                </summary>
                <pre className="mt-2 p-2.5 rounded-xl bg-zinc-900 text-zinc-200 overflow-x-auto text-[10px] font-mono leading-relaxed">
                  {JSON.stringify(selectedTxDetail.rawPayload, null, 2)}
                </pre>
              </details>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="w-full py-2.5 rounded-xl bg-violet-600 text-white font-bold text-xs hover:bg-violet-700 transition-all cursor-pointer shadow-xs"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: DAFTAR LINK CHECKOUT LYNK.ID ───────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--color-bg-muted)] pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-violet-600" />
                <h3 className="font-extrabold text-base text-[var(--color-text-primary)]">
                  Katalog Link Checkout Lynk.id
                </h3>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="p-1 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-[var(--color-bg-muted)] transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)]">
              Gunakan link ini untuk dibagikan ke calon pembeli atau dipasang pada landing page. Setiap transaksi dari link ini otomatis terhubung ke akun BBR melalui webhook.
            </p>

            <div className="space-y-2.5">
              {CHECKOUT_LINKS.map((link) => (
                <div
                  key={link.code}
                  className="bg-[var(--color-bg-muted)]/40 hover:bg-[var(--color-bg-muted)]/70 border border-[var(--color-bg-muted)] p-3 rounded-2xl flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300">
                        {link.type}
                      </span>
                      <p className="font-bold text-xs text-[var(--color-text-primary)] truncate">
                        {link.name}
                      </p>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-mono truncate">{link.url}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopy(link.url, link.code)}
                      className="px-2.5 py-1.5 rounded-xl border border-[var(--color-bg-muted)] bg-[var(--color-bg-surface)] text-xs font-semibold hover:border-violet-400 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Salin Link Checkout"
                    >
                      {copiedId === link.code ? (
                        <>
                          <Check size={12} className="text-emerald-500" />
                          <span className="text-emerald-500 text-[11px] font-bold">Disalin</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span className="text-[11px]">Salin</span>
                        </>
                      )}
                    </button>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl border border-[var(--color-bg-muted)] bg-[var(--color-bg-surface)] text-zinc-500 hover:text-violet-600 transition-all"
                      title="Buka Link di Tab Baru"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="w-full py-2.5 rounded-xl bg-violet-600 text-white font-bold text-xs hover:bg-violet-700 transition-all cursor-pointer shadow-xs"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── StatCard helper ─────────────────────────────────────────────────────────

function StatCard({
  icon,
  bg,
  label,
  value,
  sub,
  isText = false,
}: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: number | string;
  sub: string;
  isText?: boolean;
}) {
  return (
    <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-bg-muted)] p-4 flex flex-col gap-2 shadow-xs">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-[var(--color-text-secondary)]">{label}</p>
        <p className={`font-black text-[var(--color-text-primary)] ${isText ? "text-base leading-tight mt-0.5" : "text-2xl tracking-tight"}`}>
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
        </p>
        {sub && <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
