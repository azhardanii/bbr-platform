"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    universitas: "",
    jenjang: "s1",
    jurusan: "",
    semester: 1,
    punya_judul: false,
    judul_skripsi: "",
    preferred_ai: "claude",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    if (type === "radio" && name === "punya_judul") {
      finalValue = value === "true";
    }
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const submitOnboarding = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        alert("Gagal menyimpan data. Silakan coba lagi.");
      }
    } catch (e) {
      alert("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-bg-surface)] rounded-2xl shadow-lg border border-[var(--color-bg-muted)] overflow-hidden">
      {/* Progress */}
      <div className="flex justify-center gap-2 p-6 pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full ${step >= i ? "bg-[var(--color-brand-600)]" : "bg-[var(--color-bg-muted)]"}`}
          />
        ))}
      </div>

      <div className="p-6">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <h1 className="font-display font-bold text-2xl text-[var(--color-text-primary)] mb-6">Profil Akademik</h1>
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Nama Lengkap</label>
              <input required name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Universitas</label>
              <input required name="universitas" value={formData.universitas} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Jenjang</label>
              <select name="jenjang" value={formData.jenjang} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white">
                <option value="s1">S1 (Sarjana)</option>
                <option value="s2">S2 (Magister)</option>
                <option value="s3">S3 (Doktoral)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Jurusan / Program Studi</label>
              <input required name="jurusan" value={formData.jurusan} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Semester Saat Ini</label>
              <input type="number" required name="semester" value={formData.semester} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <h1 className="font-display font-bold text-2xl text-[var(--color-text-primary)] mb-6">Status Judul</h1>
            <label className="block text-sm font-semibold mb-3 text-[var(--color-text-body)]">Sudah punya judul skripsi/tesis/disertasi?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="punya_judul" value="true" checked={formData.punya_judul === true} onChange={handleChange} className="w-5 h-5 accent-[var(--color-brand-600)]" />
                <span className="text-[var(--color-text-body)]">Ya</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="punya_judul" value="false" checked={formData.punya_judul === false} onChange={handleChange} className="w-5 h-5 accent-[var(--color-brand-600)]" />
                <span className="text-[var(--color-text-body)]">Belum</span>
              </label>
            </div>

            {formData.punya_judul ? (
              <div className="mt-4">
                <label className="block text-sm font-semibold mb-1 text-[var(--color-text-body)]">Tulis judul kamu sekarang</label>
                <textarea 
                  name="judul_skripsi" 
                  value={formData.judul_skripsi} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-white resize-none h-32"
                  placeholder="Contoh: Pengaruh Penggunaan Media Sosial terhadap Motivasi Belajar..."
                />
              </div>
            ) : (
              <div className="mt-4 p-4 bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] rounded-lg text-sm text-[var(--color-text-body)]">
                Oke! Kamu bisa gunakan Judul Checker di dashboard untuk menemukan dan memvalidasi judul yang tepat.
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <h1 className="font-display font-bold text-2xl text-[var(--color-text-primary)] mb-6">Platform AI Pilihan</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">BBR menggunakan AI untuk hampir semua fiturnya. Pilih platform yang sudah kamu punya akunnya.</p>
            
            <div className="space-y-3">
              <label className={`block border-2 p-4 rounded-xl cursor-pointer transition-all ${formData.preferred_ai === 'claude' ? 'border-[var(--color-brand-600)] bg-[var(--color-brand-50)]' : 'border-[var(--color-bg-muted)] bg-white hover:border-[var(--color-brand-400)]'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">🟣 Claude (Anthropic) <span className="text-[10px] bg-[var(--color-brand-600)] text-white px-2 py-0.5 rounded-full">Rekomendasi</span></div>
                    <div className="text-xs text-[var(--color-text-secondary)] mt-1">Paling akurat untuk penulisan akademik</div>
                  </div>
                  <input type="radio" name="preferred_ai" value="claude" checked={formData.preferred_ai === 'claude'} onChange={handleChange} className="w-5 h-5 accent-[var(--color-brand-600)]" />
                </div>
              </label>

              <label className={`block border-2 p-4 rounded-xl cursor-pointer transition-all ${formData.preferred_ai === 'chatgpt' ? 'border-[var(--color-brand-600)] bg-[var(--color-brand-50)]' : 'border-[var(--color-bg-muted)] bg-white hover:border-[var(--color-brand-400)]'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[var(--color-text-primary)]">🟢 ChatGPT (OpenAI)</div>
                    <div className="text-xs text-[var(--color-text-secondary)] mt-1">Paling populer dan mudah digunakan</div>
                  </div>
                  <input type="radio" name="preferred_ai" value="chatgpt" checked={formData.preferred_ai === 'chatgpt'} onChange={handleChange} className="w-5 h-5 accent-[var(--color-brand-600)]" />
                </div>
              </label>

              <label className={`block border-2 p-4 rounded-xl cursor-pointer transition-all ${formData.preferred_ai === 'perplexity' ? 'border-[var(--color-brand-600)] bg-[var(--color-brand-50)]' : 'border-[var(--color-bg-muted)] bg-white hover:border-[var(--color-brand-400)]'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[var(--color-text-primary)]">🔵 Perplexity</div>
                    <div className="text-xs text-[var(--color-text-secondary)] mt-1">Terbaik untuk riset dan cari referensi</div>
                  </div>
                  <input type="radio" name="preferred_ai" value="perplexity" checked={formData.preferred_ai === 'perplexity'} onChange={handleChange} className="w-5 h-5 accent-[var(--color-brand-600)]" />
                </div>
              </label>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <h1 className="font-display font-bold text-2xl text-[var(--color-text-primary)] mb-6">Satu hal penting sebelum kamu mulai</h1>
            <div className="p-5 bg-white border border-[var(--color-bg-muted)] rounded-xl space-y-4 text-sm text-[var(--color-text-body)] leading-relaxed shadow-sm">
              <p>Platform BBR dibuat untuk <strong>membantumu memahami dan mengerjakan</strong> tugas akhir, bukan mengerjakannya untukmu.</p>
              <p>Semua output AI yang dihasilkan adalah <strong>titik awal untuk dipelajari, dipahami, dan ditulis ulang</strong> dengan bahasa dan pemahamanmu sendiri.</p>
              <p>Menggunakan output AI secara langsung tanpa pemahaman dan proses penulisan ulang adalah <strong>pelanggaran integritas akademik</strong> yang sepenuhnya menjadi tanggung jawabmu.</p>
              <p>Dengan melanjutkan, kamu menyatakan memahami dan menyetujui hal di atas.</p>
            </div>
          </div>
        )}

        {/* Nav Controls */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--color-bg-muted)]">
          {step > 1 ? (
            <button onClick={prevStep} className="px-5 py-2.5 text-sm font-semibold text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] rounded-lg transition-colors">
              &larr; Kembali
            </button>
          ) : <div />}

          {step < 4 ? (
            <button onClick={nextStep} className="px-6 py-2.5 bg-[var(--color-brand-600)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--color-brand-500)] shadow-sm transition-all ml-auto">
              Lanjut &rarr;
            </button>
          ) : (
            <button disabled={loading} onClick={submitOnboarding} className="px-6 py-2.5 bg-[var(--color-brand-600)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--color-brand-500)] shadow-sm transition-all ml-auto disabled:opacity-70 flex items-center gap-2">
              {loading ? "Menyimpan..." : "Saya Mengerti & Mulai Belajar \u2192"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
