"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  User, Mail, Shield, LogOut, Video, Link as LinkIcon, Copy, CheckCircle2, 
  Zap, ShoppingCart, AlertCircle, RefreshCw, Sparkles, ArrowRight, Check,
  BarChart2, FileEdit
} from "lucide-react";
import Link from "next/link";
import { 
  getUserQuota, checkFeatureQuota, consumeFeatureQuota, 
  setPlanTier, resetUserQuotaDemo, FEATURES_CONFIG, FeatureKey, 
  UserQuotaState, createInitialQuota, saveUserQuota
} from "@/lib/quota";
import { isUserAdmin } from "@/lib/roles";
import QuotaModal from "@/components/quota/QuotaModal";
import PaymentCheckoutModal, { CheckoutTarget } from "@/components/payment/PaymentCheckoutModal";

const FEATURE_ROUTES: Record<FeatureKey, string> = {
  parafrase: "/tools/parafrase",
  writingAssistant: "/tools/klinik-ta",
  judulFinder: "/tools/judul-finder",
  spss: "/tools/spss-pls",
  sidang: "/sidang",
  sitasi: "/tools/bibliometrik",
  scriptWa: "/tools/script-wa",
  kompilasi: "/workspace",
};

export default function ProfilPage() {
  const { data: session, update: updateSession } = useSession();
  const userId = session?.user?.id || "default";
  const userEmail = session?.user?.email?.toLowerCase().trim() || "";
  const userRole = (session?.user as any)?.role || "free";
  const isAdmin = isUserAdmin(userEmail, userRole);

  const [activeTab, setActiveTab] = useState("kuota");
  const [copied, setCopied] = useState(false);
  const [quotaState, setQuotaState] = useState<UserQuotaState>(() => {
    if (isAdmin) return createInitialQuota("admin");
    return getUserQuota();
  });
  const [selectedFeatureForModal, setSelectedFeatureForModal] = useState<FeatureKey | null>(null);
  const [checkoutTarget, setCheckoutTarget] = useState<CheckoutTarget | null>(null);

  const refreshQuota = () => {
    if (isAdmin) {
      setQuotaState(createInitialQuota("admin"));
    } else {
      setQuotaState(getUserQuota());
    }
  };

  useEffect(() => {
    window.addEventListener("bbr-quota-updated", refreshQuota);
    return () => window.removeEventListener("bbr-quota-updated", refreshQuota);
  }, [isAdmin]);

  // Fetch authoritative user quota & profile from PostgreSQL database
  useEffect(() => {
    fetch("/api/user/quota")
      .then((res) => res.json())
      .then((data) => {
        if (data.isAdmin || data.role === "admin") {
          const adminQuota = createInitialQuota("admin");
          setQuotaState(adminQuota);
          saveUserQuota(adminQuota);
        } else if (data.quota) {
          const features = {} as any;
          Object.keys(data.quota).forEach((k) => {
            features[k] = {
              limit: data.quota[k].limit,
              used: data.quota[k].used,
            };
          });
          const newState: UserQuotaState = {
            planTier: data.role === "member" ? "lifetime" : "free",
            purchasedAddons: [],
            features,
            lastUpdated: new Date().toISOString(),
          };
          setQuotaState(newState);
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://belajarbarengroselini.com/ref/BBR-MHS-2024");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [userData, setUserData] = useState<any>({ namaLengkap: "Mahasiswa", jenjang: "S1", jurusan: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ namaLengkap: "", jenjang: "S1", jurusan: "" });

  useEffect(() => {
    // 1. Instant load from local cache if present
    if (typeof window !== "undefined") {
      const ob = localStorage.getItem(`bbr_${userId}_onboarding`) || localStorage.getItem("bbr_onboarding");
      if (ob) {
        try {
          const parsed = JSON.parse(ob);
          setUserData(parsed);
          setEditForm({ namaLengkap: parsed.namaLengkap || "", jenjang: parsed.jenjang || "S1", jurusan: parsed.jurusan || "" });
        } catch (e) {}
      }
    }

    // 2. Fetch authoritative profile from database
    fetch("/api/user/onboarding")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          const u = data.user;
          const fresh = {
            namaLengkap: u.nama_lengkap || "Mahasiswa",
            jenjang: u.jenjang || "S1",
            jurusan: u.jurusan || "",
            universitas: u.universitas || "",
            semester: u.semester || 8,
            punyaJudul: u.punya_judul ? "Sudah" : "Belum",
            judulSkripsi: u.judul_skripsi || "",
          };
          setUserData(fresh);
          setEditForm({ namaLengkap: fresh.namaLengkap, jenjang: fresh.jenjang, jurusan: fresh.jurusan });
          if (typeof window !== "undefined") {
            if (userId) localStorage.setItem(`bbr_${userId}_onboarding`, JSON.stringify(fresh));
            localStorage.setItem("bbr_onboarding", JSON.stringify(fresh));
          }
        }
      })
      .catch(() => {});
  }, [userId]);

  const handleSaveProfile = async () => {
    const ob = localStorage.getItem(`bbr_${userId}_onboarding`) || localStorage.getItem("bbr_onboarding");
    let parsed = {};
    if (ob) {
      try { parsed = JSON.parse(ob); } catch (e) {}
    }
    const updated = { ...parsed, ...editForm };
    localStorage.setItem(`bbr_${userId}_onboarding`, JSON.stringify(updated));
    localStorage.setItem("bbr_onboarding", JSON.stringify(updated));
    setUserData(updated);
    setIsEditing(false);
    window.dispatchEvent(new Event("storage"));

    // Sync to PostgreSQL database
    try {
      await fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (updateSession) {
        await updateSession({ name: updated.namaLengkap });
      }
    } catch (e) {
      console.warn("[ProfilPage] Could not update profile in database:", e);
    }
  };

  const handleToggleTier = () => {
    const nextTier = quotaState.planTier === "free" ? "lifetime" : "free";
    setPlanTier(nextTier);
    refreshQuota();
  };

  const handleSimulateConsume = (key: FeatureKey) => {
    consumeFeatureQuota(key);
    refreshQuota();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-10">
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)]">Profil & Pengaturan Akun</h1>
        <p className="text-[var(--color-text-secondary)] mt-1 text-sm">Kelola kuota fitur, add-on naskah, informasi akun, dan sesi bimbingan.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-[var(--color-bg-muted)]">
        {[
          { id: "kuota", label: "Kuota & Pemakaian Fitur" },
          { id: "akun", label: "Informasi Akun" },
          { id: "bimbingan", label: "Sesi Bimbingan" },
          { id: "afiliasi", label: "Program Afiliasi" },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? 'border-b-2 border-[var(--color-brand-600)] text-[var(--color-brand-600)]' 
                : 'text-[var(--color-text-body)] hover:text-[var(--color-brand-600)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: KUOTA & PEMAKAIAN FITUR */}
      {activeTab === "kuota" && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          {/* Active Plan Banner */}
          {isAdmin ? (
            <div className="rounded-3xl border-2 border-violet-300 bg-gradient-to-br from-white via-violet-50/40 to-purple-50/50 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-md ring-4 ring-violet-100">
                  <Shield size={28} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-xl md:text-2xl font-black text-zinc-900">
                      Akun Administrator Platform
                    </h2>
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200 shadow-2xs">
                      Unlimited Access
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-1.5 max-w-xl leading-relaxed">
                    Anda terdaftar sebagai <strong>Administrator Belajar Bareng Roselini</strong>. Anda memiliki akses tanpa batas kuota (unlimited) untuk seluruh fitur AI, simulator sidang, interpretasi olah data SPSS, dan akses ke sistem Monitoring platform.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  href="/monitoring"
                  className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 hover:scale-[1.02]"
                >
                  <BarChart2 size={15} />
                  <span>Dashboard Monitoring</span>
                </Link>
                <Link
                  href="/workspace"
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-xs transition-all border border-zinc-200 shadow-2xs flex items-center gap-2"
                >
                  <FileEdit size={15} />
                  <span>Buka Workspace</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-[var(--color-brand-200)] bg-white p-6 md:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-50)] text-[var(--color-brand-700)] flex items-center justify-center shrink-0 border border-[var(--color-brand-200)] shadow-xs">
                  {quotaState.planTier === 'lifetime' ? <Sparkles size={28} /> : <Zap size={28} />}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-black text-zinc-900">
                      {quotaState.planTier === 'lifetime' ? 'Paket Lifetime Mahasiswa' : 'Paket Coba Gratis (Free Starter)'}
                    </h2>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      quotaState.planTier === 'lifetime' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}>
                      {quotaState.planTier === 'lifetime' ? 'Aktif Selamanya' : 'Free Trial'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xl">
                    {quotaState.planTier === 'lifetime'
                      ? 'Akses penuh ke seluruh 8 tools AI BBR dengan kuota ribuan pemakaian untuk menyelesaikan skripsi sampai wisuda.'
                      : 'Anda menggunakan kuota percobaan gratis. Saat kuota habis, Anda dapat membeli add-on satuan per fitur atau upgrade ke Lifetime.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {quotaState.planTier === 'free' ? (
                  <button
                    onClick={() => setCheckoutTarget({ type: 'membership', packageId: 'lifetime' })}
                    className="px-5 py-2.5 rounded-xl bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles size={14} />
                    <span>Upgrade ke Lifetime (Rp 199.000)</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Akses Penuh Aktif
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Feature Quota Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h3 className="font-bold text-base text-zinc-900">
                  {isAdmin ? "Status Akses Seluruh Fitur AI" : "Rincian Pemakaian Kuota Tiap Fitur"}
                </h3>
                <p className="text-xs text-zinc-500">
                  {isAdmin 
                    ? "Sebagai Administrator, seluruh fitur AI dapat digunakan tanpa batas kuota."
                    : "Pantau sisa kuota dan lakukan top-up satuan tanpa langganan bulanan."}
                </p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                isAdmin 
                  ? "bg-violet-50 text-violet-700 border-violet-200" 
                  : "bg-[var(--color-brand-50)] text-[var(--color-brand-700)] border-[var(--color-brand-200)]"
              }`}>
                {isAdmin ? "Akses Unlimited Aktif" : "8 Fitur Aktif"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(FEATURES_CONFIG) as FeatureKey[]).map((key) => {
                const feature = FEATURES_CONFIG[key];
                const route = FEATURE_ROUTES[key] || "/tools";

                if (isAdmin) {
                  return (
                    <div 
                      key={key}
                      className="rounded-2xl border-2 border-violet-100 hover:border-violet-300 p-5 bg-white transition-all flex flex-col justify-between shadow-xs group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div>
                            <h4 className="font-bold text-sm text-zinc-900 group-hover:text-violet-700 transition-colors">{feature.name}</h4>
                            <p className="text-[11px] text-zinc-500 line-clamp-1">{feature.description}</p>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 shrink-0">
                            Unlimited
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between text-xs mb-1.5 font-medium">
                          <span className="text-zinc-500">Status Kuota:</span>
                          <span className="text-violet-700 font-bold flex items-center gap-1">
                            <Sparkles size={12} className="text-violet-600" /> Bebas Kuota (Admin)
                          </span>
                        </div>

                        <div className="w-full bg-violet-100 h-2 rounded-full overflow-hidden mb-4">
                          <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full w-full" />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-zinc-100">
                        <Link
                          href={route}
                          className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>Buka Fitur</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  );
                }

                const usage = quotaState.features[key] || { limit: feature.freeLimit, used: 0 };
                const remaining = Math.max(0, usage.limit - usage.used);
                const pct = usage.limit > 0 ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 100;
                
                const isZero = remaining === 0;
                const isNear = !isZero && (quotaState.planTier === 'free' ? remaining === 1 : remaining <= Math.max(5, Math.ceil(usage.limit * 0.15)));

                return (
                  <div 
                    key={key}
                    className={`rounded-2xl border p-5 bg-white transition-all flex flex-col justify-between shadow-xs ${
                      isZero 
                        ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20' 
                        : isNear 
                        ? 'border-amber-300 ring-2 ring-amber-100 bg-amber-50/20' 
                        : 'border-zinc-200/90 hover:border-zinc-300'
                    }`}
                  >
                    <div>
                      {/* Top status */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div>
                          <h4 className="font-bold text-sm text-zinc-900">{feature.name}</h4>
                          <p className="text-[11px] text-zinc-500 line-clamp-1">{feature.description}</p>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${
                          isZero 
                            ? 'bg-rose-100 text-rose-700 border-rose-200' 
                            : isNear 
                            ? 'bg-amber-100 text-amber-800 border-amber-200' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {isZero ? 'Habis (0)' : isNear ? `Menipis (${remaining})` : `Sisa ${remaining}`}
                        </span>
                      </div>

                      {/* Usage Numbers */}
                      <div className="flex items-baseline justify-between text-xs mb-1.5 font-medium">
                        <span className="text-zinc-500">Pemakaian:</span>
                        <span className="text-zinc-900 font-bold">
                          {usage.used} / {usage.limit} <span className="font-normal text-zinc-400">{feature.unit}</span> ({pct}%)
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden border border-zinc-200/60 mb-4">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isZero 
                              ? 'bg-rose-500' 
                              : isNear 
                              ? 'bg-amber-500' 
                              : 'bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-500)]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-zinc-100">
                      <Link
                        href={route}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-700 hover:text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] transition-colors flex items-center gap-1"
                      >
                        <span>Buka</span>
                        <ArrowRight size={12} />
                      </Link>

                      {/* Buy Addon Button */}
                      <button
                        onClick={() => setSelectedFeatureForModal(key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                          isZero 
                            ? 'bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] text-white' 
                            : 'bg-zinc-100 hover:bg-[var(--color-brand-50)] text-zinc-800 hover:text-[var(--color-brand-700)] border border-zinc-200 hover:border-[var(--color-brand-200)]'
                        }`}
                      >
                        <ShoppingCart size={13} />
                        <span>Beli Addon ({feature.addon.priceFormatted})</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Purchased Addons History */}
          {!isAdmin && quotaState.purchasedAddons && quotaState.purchasedAddons.length > 0 && (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs">
              <h3 className="font-bold text-sm text-zinc-900 mb-3">Riwayat Pembelian Add-on Kuota</h3>
              <div className="space-y-2">
                {quotaState.purchasedAddons.map((add, idx) => (
                  <div key={idx} className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
                        <Check size={13} />
                      </span>
                      <div>
                        <span className="font-bold text-zinc-900">{add.name}</span>
                        <span className="text-zinc-500 ml-2">+{add.amount} kuota</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-[var(--color-brand-700)]">Rp {add.price.toLocaleString('id-ID')}</span>
                      <span className="text-[10px] text-zinc-400 block">{new Date(add.purchasedAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INFORMASI AKUN */}
      {activeTab === "akun" && (
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] p-8 rounded-2xl shadow-sm flex flex-col items-center max-w-2xl mx-auto mt-6 animate-in slide-in-from-right-4">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-inner ${
            isAdmin ? "bg-violet-100 text-violet-700 ring-4 ring-violet-50" : "bg-[var(--color-brand-100)] text-[var(--color-brand-600)]"
          }`}>
            {isAdmin ? <Shield size={46} /> : <User size={48} />}
          </div>
          
          {!isEditing ? (
            <>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1 text-center">{userData.namaLengkap}</h2>
              <p className="text-[var(--color-brand-600)] font-semibold mb-2">{userData.jenjang} {userData.jurusan ? `- ${userData.jurusan}` : ''}</p>
              
              <div className="flex items-center gap-2 mb-4">
                {isAdmin ? (
                  <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-violet-100 text-violet-700 border border-violet-200 flex items-center gap-1.5 shadow-2xs">
                    <Shield size={13} className="text-violet-600" /> Administrator Platform
                  </span>
                ) : userRole === 'member' || quotaState.planTier === 'lifetime' ? (
                  <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600" /> Member Lifetime
                  </span>
                ) : (
                  <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200">
                    Free Starter
                  </span>
                )}
              </div>

              <p className="text-[var(--color-text-secondary)] mb-6 flex items-center gap-2 text-center text-sm">
                <Mail size={16} /> {session?.user?.email || `${userData.namaLengkap.toLowerCase().replace(/\s+/g, "")}@gmail.com`}
              </p>
              
              <button 
                onClick={() => setIsEditing(true)}
                className="mb-8 px-6 py-2 bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Ubah Profil
              </button>
            </>
          ) : (
            <div className="w-full max-w-sm mb-8 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-body)] mb-1">Nama Panggilan</label>
                <input 
                  type="text" 
                  value={editForm.namaLengkap}
                  onChange={e => setEditForm({...editForm, namaLengkap: e.target.value})}
                  className="w-full p-3 border-2 border-[var(--color-bg-muted)] rounded-lg focus:border-[var(--color-brand-600)] outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-body)] mb-1">Jurusan / Program Studi</label>
                <input 
                  type="text" 
                  value={editForm.jurusan}
                  onChange={e => setEditForm({...editForm, jurusan: e.target.value})}
                  className="w-full p-3 border-2 border-[var(--color-bg-muted)] rounded-lg focus:border-[var(--color-brand-600)] outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-body)] mb-1">Jenjang</label>
                <select 
                  value={editForm.jenjang}
                  onChange={e => setEditForm({...editForm, jenjang: e.target.value})}
                  className="w-full p-3 border-2 border-[var(--color-bg-muted)] rounded-lg focus:border-[var(--color-brand-600)] outline-none bg-white"
                >
                  <option>S1</option>
                  <option>S2</option>
                  <option>S3</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 bg-[var(--color-bg-muted)] text-[var(--color-text-body)] font-semibold rounded-lg"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveProfile}
                  className="flex-1 py-2 bg-[var(--color-brand-600)] text-white font-semibold rounded-lg"
                >
                  Simpan
                </button>
              </div>
            </div>
          )}

          <div className="w-full border-t border-[var(--color-bg-muted)] pt-6 flex justify-between items-center text-sm text-[var(--color-text-secondary)]">
            <span>Draf Tugas Akhir Tersimpan</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 size={16} /> Tersinkronisasi PostgreSQL
            </span>
          </div>
        </div>
      )}

      {/* TAB 3: SESI BIMBINGAN */}
      {activeTab === "bimbingan" && (
        <div className="space-y-4 max-w-3xl mx-auto mt-6 animate-in slide-in-from-right-4">
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isAdmin ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"
              }`}>
                {isAdmin ? "Admin Priority Bimbingan" : "Summit Tier Aktif"}
              </span>
              <h3 className="font-bold text-lg text-[var(--color-text-primary)] mt-2">Bimbingan 1-on-1 bersama Kak Roseline</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {isAdmin ? "Akun Admin memiliki kuota konsultasi tak terbatas." : "Sisa 2 dari 2 sesi bimbingan private bulan ini."}
              </p>
            </div>
            <a 
              href="https://calendar.google.com" 
              target="_blank" 
              rel="noreferrer"
              className="w-full md:w-auto px-5 py-2.5 bg-[var(--color-brand-600)] text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-[var(--color-brand-500)] transition-colors whitespace-nowrap shadow-sm"
            >
              <Video size={18} /> Booking Jadwal
            </a>
          </div>
        </div>
      )}

      {/* TAB 4: AFILIASI */}
      {activeTab === "afiliasi" && (
        <div className="space-y-6 max-w-3xl mx-auto mt-6 animate-in slide-in-from-right-4">
          <div className="bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-700)] text-white p-8 rounded-2xl shadow-md">
            <h2 className="font-display font-bold text-2xl mb-2">Program Mitra Belajar Bareng Roselini</h2>
            <p className="text-white/80 text-sm max-w-xl">
              Bagikan link referral unikmu ke teman sejurusan. Dapatkan komisi 20% untuk setiap teman yang meng-upgrade ke Summit Tier!
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-xl flex-1 flex items-center justify-between text-sm font-mono backdrop-blur-xs">
                <span className="truncate">https://belajarbarengroselini.com/ref/BBR-MHS-2024</span>
              </div>
              <button 
                onClick={handleCopyLink}
                className="px-6 py-3 bg-white text-[var(--color-brand-600)] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors shrink-0 shadow-sm"
              >
                {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                {copied ? "Tersalin!" : "Salin Link"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Addon Quota */}
      {selectedFeatureForModal && (
        <QuotaModal
          featureKey={selectedFeatureForModal}
          isOpen={!!selectedFeatureForModal}
          onClose={() => setSelectedFeatureForModal(null)}
          onPurchased={refreshQuota}
        />
      )}

      {/* Direct Payment Checkout Modal */}
      {checkoutTarget && (
        <PaymentCheckoutModal
          isOpen={!!checkoutTarget}
          target={checkoutTarget}
          onClose={() => setCheckoutTarget(null)}
          onSuccess={refreshQuota}
        />
      )}
    </div>
  );
}
