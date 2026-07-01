"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, UploadCloud, FileText, Download, Trash2, Clock, CheckCircle } from "lucide-react";

export default function VaultPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [jenjang, setJenjang] = useState<string>("S1");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bbr_vault_files");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          parsed.sort((a: any, b: any) => b.timestamp - a.timestamp);
          setFiles(parsed);
        } catch (e) { }
      }
      
      const ob = localStorage.getItem("bbr_onboarding");
      if (ob) {
        try {
          const parsedOb = JSON.parse(ob);
          if (parsedOb.jenjang) setJenjang(parsedOb.jenjang);
        } catch (e) {}
      }
    }
  }, []);

  const saveFiles = (newFiles: any[]) => {
    newFiles.sort((a: any, b: any) => b.timestamp - a.timestamp);
    setFiles(newFiles);
    localStorage.setItem("bbr_vault_files", JSON.stringify(newFiles));
    window.dispatchEvent(new Event('vault-updated'));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    let uploadedFile: File | null = null;
    if ('dataTransfer' in e) {
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        uploadedFile = e.dataTransfer.files[0];
      }
    } else if (e.target.files && e.target.files.length > 0) {
      uploadedFile = e.target.files[0];
    }

    if (!uploadedFile) return;

    // Simulate upload delay
    setIsUploading(true);
    setTimeout(() => {
      const newFile = {
        id: Date.now().toString(),
        name: uploadedFile.name,
        size: (uploadedFile.size / 1024 / 1024).toFixed(2) + ' MB',
        timestamp: Date.now(),
        version: files.length + 1
      };

      saveFiles([newFile, ...files]);
      setIsUploading(false);
    }, 1500);
  };

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus draf ini dari riwayat?")) {
      saveFiles(files.filter(f => f.id !== id));
    }
  };

  const getLabel = () => {
    if (jenjang === "S2") return "Tesis";
    if (jenjang === "S3") return "Disertasi";
    return "Skripsi";
  };

  const label = getLabel();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-10">
      <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors mb-2">
        <ArrowLeft size={16} /> Kembali
      </Link>

      <div>
        <h1 className="font-display font-bold text-3xl text-[var(--color-text-primary)] uppercase">{label}-ku</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">Simpan draf {label.toLowerCase()} di sini agar rapi. File yang paling baru akan selalu jadi versi utama.</p>
      </div>

      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all bg-[var(--color-bg-surface)]
          ${isDragging ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)] scale-[1.02]' : 'border-[var(--color-bg-muted)] hover:border-[var(--color-brand-300)]'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={handleFileUpload}
      >
        <div className="w-16 h-16 bg-[var(--color-brand-100)] text-[var(--color-brand-600)] rounded-full flex items-center justify-center mb-4">
          {isUploading ? <CheckCircle className="animate-pulse" size={32} /> : <UploadCloud size={32} />}
        </div>
        <h3 className="font-bold text-lg text-[var(--color-text-primary)] mb-2">
          {isUploading ? 'Sedang Mengamankan Draf...' : 'Upload Revisi Terbarumu Di Sini'}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-sm">
          Tarik file Word/PDF kamu ke area ini, atau klik tombol di bawah untuk memilih file. (Simulasi: file tidak benar-benar diunggah ke server)
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-6 py-2.5 bg-[var(--color-brand-600)] text-white font-semibold rounded-xl hover:bg-[var(--color-brand-500)] transition-colors disabled:opacity-50 shadow-sm"
        >
          Pilih File Skripsi
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".doc,.docx,.pdf"
          onChange={handleFileUpload}
        />
      </div>

      {/* Latest File Hero */}
      {files.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold text-lg text-[var(--color-text-primary)] mb-4">Draf Utama (Paling Update)</h2>
          <div className="bg-gradient-to-r from-[var(--color-brand-50)] to-white border-2 border-[var(--color-brand-200)] p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-brand-600)] flex items-center justify-center text-white shrink-0 shadow-sm">
              <FileText size={32} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-block bg-[var(--color-brand-100)] text-[var(--color-brand-700)] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider mb-2">Versi {files[0].version}</div>
              <h3 className="font-bold text-[var(--color-text-primary)] text-xl mb-1 truncate" title={files[0].name}>{files[0].name}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] flex items-center justify-center sm:justify-start gap-2">
                <Clock size={14} /> {new Date(files[0].timestamp).toLocaleString('id-ID')} &bull; {files[0].size}
              </p>
            </div>
            <button className="w-full sm:w-auto px-6 py-3 bg-[var(--color-brand-600)] text-white font-semibold rounded-xl hover:bg-[var(--color-brand-500)] transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0">
              <Download size={18} /> Unduh
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {files.length > 1 && (
        <div className="mt-8">
          <h2 className="font-semibold text-lg text-[var(--color-text-primary)] mb-4">Riwayat Versi Sebelumnya</h2>
          <div className="bg-white border border-[var(--color-bg-muted)] rounded-2xl overflow-hidden shadow-sm">
            {files.slice(1).map((f: any, idx: number) => (
              <div key={f.id} className={`p-4 flex flex-col sm:flex-row items-center gap-4 hover:bg-[var(--color-bg-surface)] transition-colors ${idx !== files.length - 2 ? 'border-b border-[var(--color-bg-muted)]' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-muted)] flex items-center justify-center text-[var(--color-text-secondary)] shrink-0">
                  <FileText size={20} />
                </div>
                <div className="flex-1 text-center sm:text-left min-w-0 w-full">
                  <h4 className="font-semibold text-[var(--color-text-primary)] truncate" title={f.name}>{f.name}</h4>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-[var(--color-text-secondary)] mt-1">
                    <span className="font-medium bg-[var(--color-bg-surface)] px-1.5 py-0.5 rounded border border-[var(--color-bg-muted)]">v{f.version}</span>
                    <span>{new Date(f.timestamp).toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] rounded-lg transition-colors" title="Unduh">
                    <Download size={18} />
                  </button>
                  <button onClick={() => handleDelete(f.id)} className="p-2 text-[var(--color-text-secondary)] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus riwayat">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
