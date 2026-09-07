"use client";

import { useState, useEffect } from "react";
import { 
  User, Mail, Shield, LogOut, Video, Link as LinkIcon, Copy, CheckCircle2, 
  Zap, ShoppingCart, AlertCircle, RefreshCw, Sparkles, ArrowRight, Check 
} from "lucide-react";
import Link from "next/link";
import { 
  getUserQuota, checkFeatureQuota, consumeFeatureQuota, 
  setPlanTier, resetUserQuotaDemo, FEATURES_CONFIG, FeatureKey, 
  UserQuotaState 
} from "@/lib/quota";
import QuotaModal from "@/components/quota/QuotaModal";

export default function ProfilPage() {
  const [activeTab, setActiveTab] = useState("kuota");
  const [copied, setCopied] = useState(false);
  const [quotaState, setQuotaState] = useState<UserQuotaState>(() => getUserQuota());
  const [selectedFeatureForModal, setSelectedFeatureForModal] = useState<FeatureKey | null>(null);

  const refreshQuota = () => {
    setQuotaState(getUserQuota());
  };

  useEffect(() => {
    window.addEventListener("bbr-quota-updated", refreshQuota);
    return () => window.removeEventListener("bbr-quota-updated", refreshQuota);
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
    if (typeof window !== "undefined") {
      const ob = localStorage.getItem("bbr_onboarding");
      if (ob) {
        try {
          const parsed = JSON.parse(ob);
          setUserData(parsed);
          setEditForm({ namaLengkap: parsed.namaLengkap || "", jenjang: parsed.jenjang || "S1", jurusan: parsed.jurusan || "" });
        } catch (e) {}
      }
    }
  }, []);

  const handleSaveProfile = () => {
    const ob = localStorage.getItem("bbr_onboarding");
    let parsed = {};
    if (ob) {
      try { parsed = JSON.parse(ob); } catch (e) {}
    }
    const updated = { ...parsed, ...editForm };
    localStorage.setItem("bbr_onboarding", JSON.stringify(updated));
    setUserData(updated);
    setIsEditing(false);
    window.dispatchEvent(new Event("storage"));
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
                  onClick={() => setPlanTier('lifetime')}
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

              {/* Demo Mode Toggle Button */}
              <button
                onClick={handleToggleTier}
                className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs transition-colors border border-zinc-200 cursor-pointer"
                title="Beralih tier untuk demo pengujian kuota"
              >
                Simulasi: {quotaState.planTier === 'free' ? 'Ubah ke Lifetime' : 'Ubah ke Free'}
              </button>
              <button
                onClick={() => { resetUserQuotaDemo(quotaState.planTier); refreshQuota(); }}
                className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors border border-zinc-200 cursor-pointer"
                title="Reset Kuota ke Default"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Feature Quota Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h3 className="font-bold text-base text-zinc-900">Rincian Pemakaian Kuota Tiap Fitur</h3>
                <p className="text-xs text-zinc-500">Pantau sisa kuota dan lakukan top-up satuan tanpa langganan bulanan</p>
              </div>
              <span className="text-xs font-bold text-[var(--color-brand-700)] bg-[var(--color-brand-50)] px-3 py-1 rounded-xl border border-[var(--color-brand-200)]">
                8 Fitur Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(FEATURES_CONFIG) as FeatureKey[]).map((key) => {
                const feature = FEATURES_CONFIG[key];
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
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
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
                      {/* Simulate Usage Button */}
                      <button
                        onClick={() => handleSimulateConsume(key)}
                        disabled={isZero}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-[11px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        title="Simulasi pakai 1x untuk tes limit"
                      >
                        + Pakai 1x
                      </button>

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
          {quotaState.purchasedAddons && quotaState.purchasedAddons.length > 0 && (
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
          <div className="w-24 h-24 bg-[var(--color-brand-100)] text-[var(--color-brand-600)] rounded-full flex items-center justify-center mb-6 shadow-inner">
            <User size={48} />
          </div>
          
          {!isEditing ? (
            <>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1 text-center">{userData.namaLengkap}</h2>
              <p className="text-[var(--color-brand-600)] font-semibold mb-2">{userData.jenjang} {userData.jurusan ? `- ${userData.jurusan}` : ''}</p>
              <p className="text-[var(--color-text-secondary)] mb-6 flex items-center gap-2 text-center">
                <Mail size={16} /> {userData.namaLengkap.toLowerCase().replace(/\s+/g, '')}@kampus.ac.id
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
                  className="flex-1 py-2 bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveProfile}
                  className="flex-1 py-2 bg-[var(--color-brand-600)] text-white font-semibold rounded-lg hover:bg-[var(--color-brand-500)] transition-colors"
                >
                  Simpan
                </button>
              </div>
            </div>
          )}

          <div className="w-full space-y-4">
            <div className="p-4 rounded-xl border border-[var(--color-bg-muted)] bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className={quotaState.planTier === 'lifetime' ? "text-emerald-600" : "text-amber-600"} size={20} />
                <div>
                  <p className="font-semibold text-[var(--color-text-primary)]">
                    {quotaState.planTier === 'lifetime' ? 'Paket Lifetime Mahasiswa' : 'Paket Coba Gratis (Free Starter)'}
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {quotaState.planTier === 'lifetime' ? 'Akses AI Penuh + Kuota Melimpah' : 'Kuota Starter Uji Coba'}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                quotaState.planTier === 'lifetime'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-zinc-100 text-zinc-700 border-zinc-200'
              }`}>
                {quotaState.planTier === 'lifetime' ? 'LIFETIME PRO' : 'FREE TRIAL'}
              </span>
            </div>
            
            <Link href="/login" className="block">
              <button className="w-full py-3 mt-4 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 border border-red-200">
                <LogOut size={18} /> Keluar Akun
              </button>
            </Link>
          </div>
        </div>
      )}

      {activeTab === "bimbingan" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 animate-in slide-in-from-right-4">
          <div className="bg-[var(--color-brand-600)] text-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-semibold mb-1">Sisa Sesi Bimbingan</p>
              <h2 className="text-4xl font-display font-bold">2 <span className="text-xl font-normal opacity-80">sesi</span></h2>
            </div>
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <Video size={32} />
            </div>
          </div>
          
          <div className="bg-white border-2 border-[var(--color-brand-100)] p-6 rounded-2xl shadow-sm flex flex-col justify-center">
            <h3 className="font-bold text-[var(--color-brand-600)] mb-2">Jadwal Berikutnya</h3>
            <p className="text-lg font-semibold text-[var(--color-text-primary)]">Belum ada jadwal aktif</p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Silakan hubungi Kak Roselini via WhatsApp untuk mengatur jadwal bimbingan Kamu.</p>
            <button className="mt-4 px-4 py-2 bg-[var(--color-brand-50)] text-[var(--color-brand-600)] font-semibold rounded-lg border border-[var(--color-brand-100)] w-fit hover:bg-[var(--color-brand-100)] transition-colors">
              Chat Admin WA
            </button>
          </div>

          <div className="md:col-span-2 bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-[var(--color-text-primary)] mb-4">Riwayat Bimbingan</h3>
            <div className="p-4 bg-white border border-[var(--color-bg-muted)] rounded-xl flex items-center justify-between opacity-70 grayscale">
              <div>
                <p className="font-semibold text-[var(--color-text-primary)]">Sesi 1: Bedah Judul & Kerangka</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">12 Mei 2024, 19:00 WIB via Google Meet</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Selesai</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "afiliasi" && (
        <div className="space-y-6 mt-6 animate-in slide-in-from-right-4">
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-amber-900 mb-2">Program Afiliasi BBR</h3>
            <p className="text-amber-800 text-sm">Rekomendasikan platform ini ke teman kampusmu dan dapatkan komisi <strong>30% hingga 50%</strong> dari setiap penjualan yang menggunakan link referral kamu!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] p-5 rounded-2xl shadow-sm">
              <p className="text-[var(--color-text-secondary)] text-xs font-semibold mb-1">Total Klik</p>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">24</h2>
            </div>
            <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] p-5 rounded-2xl shadow-sm">
              <p className="text-[var(--color-text-secondary)] text-xs font-semibold mb-1">Konversi</p>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">2 <span className="text-sm font-normal opacity-70">pembelian</span></h2>
            </div>
            <div className="bg-[var(--color-brand-600)] text-white p-5 rounded-2xl shadow-sm">
              <p className="text-white/80 text-xs font-semibold mb-1">Total Komisi</p>
              <h2 className="text-2xl font-bold">Rp 238.000</h2>
            </div>
          </div>

          <div className="bg-white border-2 border-[var(--color-bg-muted)] p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-[var(--color-text-primary)] mb-4">Link Referral Kamu</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-[var(--color-bg-base)] border border-[var(--color-bg-muted)] rounded-lg">
                <LinkIcon size={18} className="text-[var(--color-text-secondary)]" />
                <span className="text-sm font-mono text-[var(--color-text-primary)] truncate">https://belajarbarengroselini.com/ref/BBR-MHS-2024</span>
              </div>
              <button 
                onClick={handleCopyLink}
                className={`px-6 py-3 font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${copied ? 'bg-[var(--color-success)] text-white' : 'bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-500)]'}`}
              >
                {copied ? <><CheckCircle2 size={18} /> Tersalin</> : <><Copy size={18} /> Salin Link</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PEMBELIAN ADDON KUOTA */}
      {selectedFeatureForModal && (
        <QuotaModal
          featureKey={selectedFeatureForModal}
          isOpen={true}
          onClose={() => setSelectedFeatureForModal(null)}
          onPurchased={() => {
            refreshQuota();
            setSelectedFeatureForModal(null);
          }}
        />
      )}
    </div>
  );
}
