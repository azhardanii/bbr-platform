"use client";

import { useState, useEffect } from "react";
import { User, Mail, Shield, LogOut, Video, Link as LinkIcon, Copy, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ProfilPage() {
  const [activeTab, setActiveTab] = useState("akun");
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://belajarbarengroselini.com/ref/BBR-MHS-2024");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const [userData, setUserData] = useState<any>({ namaLengkap: "Mahasiswa", jenjang: "S1" });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ namaLengkap: "", jenjang: "S1" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ob = localStorage.getItem("bbr_onboarding");
      if (ob) {
        try {
          const parsed = JSON.parse(ob);
          setUserData(parsed);
          setEditForm({ namaLengkap: parsed.namaLengkap || "", jenjang: parsed.jenjang || "S1" });
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
    // Dispatch event so other components (like VaultWidget) can update
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-10">
      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)]">Profil & Pengaturan</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">Kelola informasi akun, sesi bimbingan, dan program afiliasi.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-[var(--color-bg-muted)]">
        {["akun", "bimbingan", "afiliasi"].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors capitalize ${activeTab === tab ? 'border-b-2 border-[var(--color-brand-600)] text-[var(--color-brand-600)]' : 'text-[var(--color-text-body)] hover:text-[var(--color-brand-600)]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "akun" && (
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-muted)] p-8 rounded-2xl shadow-sm flex flex-col items-center max-w-2xl mx-auto mt-6 animate-in slide-in-from-right-4">
          <div className="w-24 h-24 bg-[var(--color-brand-100)] text-[var(--color-brand-600)] rounded-full flex items-center justify-center mb-6 shadow-inner">
            <User size={48} />
          </div>
          
          {!isEditing ? (
            <>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1 text-center">{userData.namaLengkap}</h2>
              <p className="text-[var(--color-brand-600)] font-semibold mb-2">{userData.jenjang}</p>
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
                <Shield className="text-[#7C3AED]" size={20} />
                <div>
                  <p className="font-semibold text-[var(--color-text-primary)]">Paket Aktif</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Akses AI Premium + Bimbingan</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE] text-xs font-bold rounded-full">SUMMIT</span>
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
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Silakan hubungi Kak Roselini via WhatsApp untuk mengatur jadwal bimbingan Anda.</p>
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
    </div>
  );
}
