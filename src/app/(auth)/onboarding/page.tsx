"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, ArrowRight, User, BookOpen, Bot, ShieldAlert, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    namaLengkap: "",
    universitas: "",
    jenjang: "S1",
    jurusan: "",
    semester: "8",
    punyaJudul: "Belum",
    judulSkripsi: "",
  });
  const [agreed, setAgreed] = useState(false);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      // 1. Save directly to Database via API
      await fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // 2. Save user-scoped cache to local storage
      const userId = session?.user?.id || "default";
      localStorage.setItem(`bbr_${userId}_onboarding`, JSON.stringify(formData));
      localStorage.setItem("bbr_onboarding", JSON.stringify(formData));
      localStorage.setItem("bbr_progress", JSON.stringify([
        { bab: 1, pct: 0 }, { bab: 2, pct: 0 }, { bab: 3, pct: 0 }, { bab: 4, pct: 0 }, { bab: 5, pct: 0 }
      ]));

      // 3. Update NextAuth session
      if (updateSession) {
        await updateSession({ onboarding_completed: true, name: formData.namaLengkap });
      }

      window.dispatchEvent(new Event("storage"));
      router.push("/dashboard");
    } catch (e) {
      console.error("Onboarding submission error:", e);
      // Fallback
      localStorage.setItem("bbr_onboarding", JSON.stringify(formData));
      router.push("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= i ? 'bg-[var(--color-brand-600)] text-white' : 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]'}`}>
            {step > i ? <Check size={16} /> : i}
          </div>
          {i < 3 && (
            <div className={`w-12 h-1 ${step > i ? 'bg-[var(--color-brand-600)]' : 'bg-[var(--color-bg-muted)]'}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-[var(--color-brand-50)] p-6 text-center border-b border-[var(--color-brand-100)]">
          <h1 className="font-display font-bold text-2xl text-[var(--color-brand-600)]">Selamat Datang di BBR!</h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">Mari siapkan ruang belajarmu sebelum mulai.</p>
        </div>

        <div className="p-8">
          {renderStepIndicator()}

          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <h2 className="font-display font-bold text-xl text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
                <User className="text-[var(--color-brand-600)]" /> Profil Akademik
              </h2>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-body)] mb-1">Nama Panggilan</label>
                <input 
                  type="text" 
                  value={formData.namaLengkap}
                  onChange={e => setFormData({...formData, namaLengkap: e.target.value})}
                  className="w-full p-3 border-2 border-[var(--color-bg-muted)] rounded-lg focus:border-[var(--color-brand-600)] outline-none" 
                  placeholder="Misal: Budi"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-body)] mb-1">Jenjang</label>
                  <select 
                    value={formData.jenjang}
                    onChange={e => setFormData({...formData, jenjang: e.target.value})}
                    className="w-full p-3 border-2 border-[var(--color-bg-muted)] rounded-lg focus:border-[var(--color-brand-600)] outline-none bg-white"
                  >
                    <option>S1</option>
                    <option>S2</option>
                    <option>S3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-body)] mb-1">Semester</label>
                  <input 
                    type="number" 
                    value={formData.semester}
                    onChange={e => setFormData({...formData, semester: e.target.value})}
                    className="w-full p-3 border-2 border-[var(--color-bg-muted)] rounded-lg focus:border-[var(--color-brand-600)] outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-body)] mb-1">Jurusan / Program Studi</label>
                <input 
                  type="text" 
                  value={formData.jurusan}
                  onChange={e => setFormData({...formData, jurusan: e.target.value})}
                  className="w-full p-3 border-2 border-[var(--color-bg-muted)] rounded-lg focus:border-[var(--color-brand-600)] outline-none" 
                  placeholder="Misal: Ilmu Komunikasi"
                />
              </div>
            </div>
          )}

          {step === 2 && (() => {
            const jenjangLabel = formData.jenjang === "S1" ? "Skripsi" : formData.jenjang === "S2" ? "Tesis" : "Disertasi";
            return (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <h2 className="font-display font-bold text-xl text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
                <BookOpen className="text-[var(--color-brand-600)]" /> Status Judul
              </h2>
              <p className="text-[var(--color-text-secondary)] text-sm mb-4">Apakah kamu sudah memiliki judul {jenjangLabel.toLowerCase()} yang pasti?</p>
              
              <div className="flex gap-4">
                <label className={`flex-1 p-4 border-2 rounded-xl cursor-pointer text-center font-semibold ${formData.punyaJudul === 'Ya' ? 'border-[var(--color-brand-600)] bg-[var(--color-brand-50)] text-[var(--color-brand-600)]' : 'border-[var(--color-bg-muted)] text-[var(--color-text-body)]'}`}>
                  <input type="radio" className="hidden" checked={formData.punyaJudul === 'Ya'} onChange={() => setFormData({...formData, punyaJudul: 'Ya'})} />
                  Sudah Punya
                </label>
                <label className={`flex-1 p-4 border-2 rounded-xl cursor-pointer text-center font-semibold ${formData.punyaJudul === 'Belum' ? 'border-[var(--color-brand-600)] bg-[var(--color-brand-50)] text-[var(--color-brand-600)]' : 'border-[var(--color-bg-muted)] text-[var(--color-text-body)]'}`}>
                  <input type="radio" className="hidden" checked={formData.punyaJudul === 'Belum'} onChange={() => setFormData({...formData, punyaJudul: 'Belum'})} />
                  Belum Punya
                </label>
              </div>

              {formData.punyaJudul === 'Ya' && (
                <div className="mt-6 animate-in fade-in">
                  <label className="block text-sm font-semibold text-[var(--color-text-body)] mb-1">Tulis Judul {jenjangLabel} Lengkapmu</label>
                  <textarea 
                    value={formData.judulSkripsi}
                    onChange={e => setFormData({...formData, judulSkripsi: e.target.value})}
                    className="w-full p-3 border-2 border-[var(--color-bg-muted)] rounded-lg focus:border-[var(--color-brand-600)] outline-none h-24 resize-none" 
                    placeholder="Contoh: Pengaruh Algoritma Terhadap Persepsi Mahasiswa di Kampus X"
                  />
                </div>
              )}
            </div>
          );
          })()}

          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <h2 className="font-display font-bold text-xl text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
                <ShieldAlert className="text-[var(--color-brand-600)]" /> Satu Hal Penting
              </h2>
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-900 text-sm leading-relaxed text-justify">
                  Belajar Bareng Roselini dibuat untuk <strong>membantumu memahami dan mengerjakan</strong> tugas akhir, ini bukan tempat untuk jokiin tugas akhirmu! Semua output AI yang dihasilkan adalah <strong>titik awal untuk dipelajari, dipahami, dan ditulis ulang</strong> dengan bahasamu sendiri. Menggunakan output AI mentah adalah pelanggaran integritas akademik.
                </p>
              </div>
              <label className="flex items-start gap-3 mt-4 cursor-pointer p-2">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[var(--color-brand-600)]" 
                  required 
                />
                <span className="text-sm font-semibold text-[var(--color-text-body)]">Saya mengerti dan berjanji akan menulis ulang hasil AI dengan bahasa saya sendiri.</span>
              </label>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <button 
              onClick={() => setStep(step - 1)}
              className={`px-6 py-3 font-semibold rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] transition-colors ${step === 1 ? 'invisible' : ''}`}
            >
              Kembali
            </button>
            <button 
              disabled={(step === 3 && !agreed) || isSubmitting}
              onClick={step === 3 ? handleFinish : handleNext}
              className={`px-6 py-3 font-semibold rounded-lg text-white transition-colors flex items-center gap-2 shadow-md ${(step === 3 && !agreed) || isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)]'}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <span>{step === 3 ? 'Mulai Belajar' : 'Lanjut'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
