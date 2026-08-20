"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileSearch, CheckCircle2, Search, Edit2, Trash2, GraduationCap, FileEdit } from "lucide-react";
import { useJenjang } from "@/hooks/useJenjang";

export default function JudulStatusCard() {
  const { judulTugasAkhir, labelLower, removeJudul, saveJudul } = useJenjang();
  const [mounted, setMounted] = useState(false);

  // States for Edit Mode (ketika sudah ada judul)
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  // States for Manual Input Mode (ketika belum ada judul)
  const [isInputtingManual, setIsInputtingManual] = useState(false);
  const [manualValue, setManualValue] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleStartEdit = () => {
    setEditValue(judulTugasAkhir);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editValue.trim()) {
      saveJudul(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleSaveManual = () => {
    if (manualValue.trim()) {
      saveJudul(manualValue.trim());
      setIsInputtingManual(false);
      setManualValue("");
    }
  };

  if (judulTugasAkhir) {
    return (
      <div className="bg-[var(--color-brand-600)] border-2 border-[var(--color-brand-600)] p-6 md:p-8 rounded-2xl flex flex-col shadow-md relative overflow-hidden group min-h-[240px] justify-center">
        {/* Dekorasi Background Transparan */}
        <div className="absolute -bottom-8 -right-8 opacity-10 text-white transform -rotate-12 scale-150 transition-transform group-hover:scale-110 pointer-events-none">
          <GraduationCap size={160} />
        </div>

        {/* Icon Aksi Pojok Kanan Atas */}
        {!isEditing && (
          <div className="absolute top-4 right-4 flex items-center gap-1 z-20">
            <button
              onClick={handleStartEdit}
              className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
              title="Edit Judul"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={removeJudul}
              className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
              title="Hapus Judul"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}

        {isEditing ? (
          <div className="relative z-10 text-white w-full">
            <h3 className="font-bold text-lg mb-3">Edit Judul Kamu:</h3>
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full bg-white/10 border border-white/30 rounded-xl p-4 text-white placeholder-white/50 outline-none focus:border-white/70 resize-none font-display font-bold text-lg md:text-xl leading-snug"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2.5 bg-white text-[var(--color-brand-600)] rounded-xl font-semibold text-sm hover:bg-[var(--color-brand-50)] transition-colors shadow-sm"
              >
                Simpan
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 bg-white/10 border border-white/30 text-white rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center relative z-10 text-white max-w-3xl mx-auto w-full pt-2 pb-2">
            <div className="w-12 h-12 mb-4 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-sm shrink-0">
              <CheckCircle2 size={24} className="text-white" />
            </div>

            <h3 className="font-bold text-base md:text-lg mb-2 text-white/90">
              Judul {labelLower.charAt(0).toUpperCase() + labelLower.slice(1)} Kamu:
            </h3>

            <p className="font-display text-2xl md:text-3xl font-bold leading-snug drop-shadow-sm text-white mb-6">
              "{judulTugasAkhir}"
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/workspace"
                className="px-6 py-3.5 bg-white text-[var(--color-brand-600)] text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[var(--color-brand-50)] transition-all hover:scale-105 shadow-md"
              >
                <FileEdit size={18} /> Buka Workspace & Tulis Naskah
              </Link>
              <Link
                href="/tools/judul-finder"
                className="px-5 py-3.5 bg-white/15 border border-white/30 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-white/25 transition-colors backdrop-blur-sm"
              >
                <Search size={18} /> Evaluasi Judul
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isInputtingManual) {
    return (
      <div className="bg-white border-2 border-[var(--color-brand-100)] p-5 md:p-6 rounded-2xl flex flex-col shadow-sm gap-3 animate-in zoom-in-95 duration-200">
        <h3 className="font-bold text-lg text-[var(--color-text-primary)]">Input Judul Manual</h3>
        <textarea
          value={manualValue}
          onChange={(e) => setManualValue(e.target.value)}
          placeholder={`Ketikkan judul ${labelLower} Kamu di sini...`}
          className="w-full px-4 py-3 font-semibold text-[var(--color-text-body)] rounded-xl border-2 border-[var(--color-bg-muted)] focus:border-[var(--color-brand-600)] outline-none bg-[var(--color-bg-surface)] h-24 resize-none transition-colors"
          autoFocus
        />
        <div className="flex flex-col sm:flex-row gap-2 mt-1">
          <button
            onClick={handleSaveManual}
            className="w-full sm:w-auto px-5 py-2.5 bg-[var(--color-brand-600)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--color-brand-500)] transition-colors shadow-sm"
          >
            Simpan Judul
          </button>
          <button
            onClick={() => setIsInputtingManual(false)}
            className="w-full sm:w-auto px-5 py-2.5 bg-white text-[var(--color-text-body)] border-2 border-[var(--color-bg-muted)] rounded-xl font-semibold text-sm hover:border-[var(--color-brand-300)] hover:text-[var(--color-brand-600)] transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-[var(--color-brand-100)] p-5 md:p-6 rounded-2xl flex flex-col md:flex-row items-center gap-4 justify-between shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 rounded-full bg-[var(--color-brand-50)] flex items-center justify-center text-[var(--color-brand-600)] shrink-0">
          <FileSearch size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--color-text-primary)]">Belum punya judul?</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Gunakan AI untuk mencari inspirasi, atau input judul Kamu secara manual.
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 mt-2 md:mt-0">
        <button
          onClick={() => setIsInputtingManual(true)}
          className="w-full sm:w-auto px-5 py-3 bg-[var(--color-bg-surface)] text-[var(--color-text-body)] border-2 border-[var(--color-bg-muted)] text-sm font-semibold rounded-xl text-center hover:border-[var(--color-brand-300)] hover:text-[var(--color-brand-600)] transition-colors"
        >
          Tulis Judul
        </button>
        <Link
          href="/tools/judul-finder"
          className="w-full sm:w-auto px-6 py-3 bg-[var(--color-brand-600)] text-white text-sm font-semibold rounded-xl text-center hover:bg-[var(--color-brand-500)] transition-colors shadow-sm"
        >
          Temukan Judul &rarr;
        </Link>
      </div>
    </div>
  );
}
