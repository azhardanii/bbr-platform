/**
 * Workspace Progress Management & Synchronization Service
 * Menghubungkan progress riil naskah skripsi/tesis di Workspace dengan Beranda/Dashboard
 */

export interface OutlineItem {
  id: string;
  title: string;
  children?: OutlineItem[];
  isOpen?: boolean;
}

export interface UploadedBab {
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

export interface BabProgressItem {
  id: string;
  title: string;
  babNumber: number;
  subBabCount: number;
  words: number;
  targetWords: number;
  upload?: UploadedBab;
  percentage: number;
  isCompleted: boolean;
  statusLabel: string;
}

export interface WorkspaceProgressData {
  jenjang: string;
  totalBabs: number;
  filledCount: number;
  completedCount: number;
  overallPercentage: number;
  totalWords: number;
  items: BabProgressItem[];
}

export const DEFAULT_OUTLINES: Record<string, OutlineItem[]> = {
  S1: [
    { id: '1', title: 'BAB I PENDAHULUAN', isOpen: true, children: [
      { id: '1-1', title: '1.1 Latar Belakang Masalah' },
      { id: '1-2', title: '1.2 Rumusan Masalah' },
      { id: '1-3', title: '1.3 Tujuan Penelitian' },
      { id: '1-4', title: '1.4 Manfaat Penelitian' },
    ]},
    { id: '2', title: 'BAB II TINJAUAN PUSTAKA', isOpen: false, children: [
      { id: '2-1', title: '2.1 Landasan Teori' },
      { id: '2-2', title: '2.2 Penelitian Terdahulu' },
      { id: '2-3', title: '2.3 Kerangka Pemikiran' },
      { id: '2-4', title: '2.4 Hipotesis Penelitian' },
    ]},
    { id: '3', title: 'BAB III METODE PENELITIAN', isOpen: false, children: [
      { id: '3-1', title: '3.1 Jenis Penelitian' },
      { id: '3-2', title: '3.2 Populasi dan Sampel' },
      { id: '3-3', title: '3.3 Teknik Pengumpulan Data' },
      { id: '3-4', title: '3.4 Teknik Analisis Data' },
    ]},
    { id: '4', title: 'BAB IV HASIL DAN PEMBAHASAN', isOpen: false, children: [
      { id: '4-1', title: '4.1 Gambaran Umum Objek Penelitian' },
      { id: '4-2', title: '4.2 Hasil Pengujian' },
      { id: '4-3', title: '4.3 Pembahasan' },
    ]},
    { id: '5', title: 'BAB V PENUTUP', isOpen: false, children: [
      { id: '5-1', title: '5.1 Kesimpulan' },
      { id: '5-2', title: '5.2 Saran' },
    ]},
  ],
  S2: [
    { id: '1', title: 'BAB I PENDAHULUAN', isOpen: true, children: [
      { id: '1-1', title: '1.1 Latar Belakang' },
      { id: '1-2', title: '1.2 Identifikasi Masalah' },
      { id: '1-3', title: '1.3 Rumusan Masalah' },
      { id: '1-4', title: '1.4 Tujuan Penelitian' },
      { id: '1-5', title: '1.5 Manfaat Penelitian' },
      { id: '1-6', title: '1.6 Kebaruan Penelitian (Novelty)' },
    ]},
    { id: '2', title: 'BAB II KAJIAN PUSTAKA', isOpen: false, children: [
      { id: '2-1', title: '2.1 Landasan Teoretis' },
      { id: '2-2', title: '2.2 Kajian Empiris (Penelitian Terdahulu)' },
      { id: '2-3', title: '2.3 Kerangka Konseptual' },
      { id: '2-4', title: '2.4 Hipotesis' },
    ]},
    { id: '3', title: 'BAB III METODE PENELITIAN', isOpen: false, children: [
      { id: '3-1', title: '3.1 Paradigma dan Pendekatan Penelitian' },
      { id: '3-2', title: '3.2 Desain Penelitian' },
      { id: '3-3', title: '3.3 Populasi, Sampel, dan Sampling' },
      { id: '3-4', title: '3.4 Instrumen Penelitian' },
      { id: '3-5', title: '3.5 Teknik Analisis Data' },
    ]},
    { id: '4', title: 'BAB IV HASIL PENELITIAN', isOpen: false, children: [
      { id: '4-1', title: '4.1 Deskripsi Data' },
      { id: '4-2', title: '4.2 Hasil Pengujian Hipotesis' },
    ]},
    { id: '5', title: 'BAB V PEMBAHASAN', isOpen: false, children: [
      { id: '5-1', title: '5.1 Diskusi Hasil Temuan' },
      { id: '5-2', title: '5.2 Implikasi Teoritis dan Praktis' },
    ]},
    { id: '6', title: 'BAB VI PENUTUP', isOpen: false, children: [
      { id: '6-1', title: '6.1 Kesimpulan' },
      { id: '6-2', title: '6.2 Keterbatasan dan Saran' },
    ]},
  ],
  S3: [
    { id: '1', title: 'BAB I PENDAHULUAN', isOpen: true, children: [
      { id: '1-1', title: '1.1 Latar Belakang' },
      { id: '1-2', title: '1.2 Rumusan Masalah' },
      { id: '1-3', title: '1.3 Tujuan Penelitian' },
      { id: '1-4', title: '1.4 Kontribusi Orisinal (Original Contribution)' },
    ]},
    { id: '2', title: 'BAB II TINJAUAN LITERATUR', isOpen: false, children: [
      { id: '2-1', title: '2.1 Kerangka Teoretis' },
      { id: '2-2', title: '2.2 State of the Art' },
      { id: '2-3', title: '2.3 Research Gap dan Proposisi' },
    ]},
    { id: '3', title: 'BAB III KERANGKA KONSEPTUAL', isOpen: false, children: [
      { id: '3-1', title: '3.1 Model Konseptual' },
      { id: '3-2', title: '3.2 Proposisi Penelitian' },
    ]},
    { id: '4', title: 'BAB IV METODE PENELITIAN', isOpen: false, children: [
      { id: '4-1', title: '4.1 Paradigma Penelitian' },
      { id: '4-2', title: '4.2 Desain dan Prosedur' },
      { id: '4-3', title: '4.3 Pengumpulan Data' },
      { id: '4-4', title: '4.4 Strategi Analisis' },
    ]},
    { id: '5', title: 'BAB V HASIL PENELITIAN', isOpen: false, children: [
      { id: '5-1', title: '5.1 Temuan Utama' },
      { id: '5-2', title: '5.2 Pengujian Proposisi' },
    ]},
    { id: '6', title: 'BAB VI PEMBAHASAN', isOpen: false, children: [
      { id: '6-1', title: '6.1 Interpretasi Temuan' },
      { id: '6-2', title: '6.2 Kontribusi pada Ilmu Pengetahuan' },
    ]},
    { id: '7', title: 'BAB VII PENUTUP', isOpen: false, children: [
      { id: '7-1', title: '7.1 Kesimpulan' },
      { id: '7-2', title: '7.2 Keterbatasan' },
      { id: '7-3', title: '7.3 Agenda Penelitian Lanjutan' },
    ]},
  ],
};

const DEFAULT_TARGET_WORDS: Record<number, number> = {
  1: 1500,
  2: 3000,
  3: 2000,
  4: 3000,
  5: 1000,
  6: 2000,
  7: 2000,
};

export function getWordCount(html?: string): number {
  if (!html) return 0;
  const clean = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
  if (!clean) return 0;
  return clean.split(/\s+/).filter(Boolean).length;
}

export function getWorkspaceProgressData(): WorkspaceProgressData {
  if (typeof window === 'undefined') {
    return {
      jenjang: 'S1',
      totalBabs: 5,
      filledCount: 0,
      completedCount: 0,
      overallPercentage: 0,
      totalWords: 0,
      items: [],
    };
  }

  // 1. Get Jenjang
  let jenjang = 'S1';
  try {
    const ob = localStorage.getItem('bbr_onboarding');
    if (ob) {
      const parsed = JSON.parse(ob);
      if (parsed.jenjang) jenjang = parsed.jenjang;
    }
  } catch (e) {}

  // 2. Get Outline
  let outline: OutlineItem[] = [];
  try {
    const savedOutline = localStorage.getItem('bbr_outline');
    if (savedOutline) {
      const parsed = JSON.parse(savedOutline);
      if (Array.isArray(parsed) && parsed.length > 0) {
        outline = parsed;
      }
    }
  } catch (e) {}

  if (outline.length === 0) {
    outline = DEFAULT_OUTLINES[jenjang] || DEFAULT_OUTLINES['S1'];
  }

  // 3. Get Contents & Uploads
  let contents: Record<string, string> = {};
  let uploads: Record<string, UploadedBab> = {};
  let manualMilestones: Record<string, number> = {};

  try {
    const savedContents = localStorage.getItem('bbr_bab_contents');
    if (savedContents) contents = JSON.parse(savedContents);
  } catch (e) {}

  try {
    const savedUploads = localStorage.getItem('bbr_bab_uploads');
    if (savedUploads) uploads = JSON.parse(savedUploads);
  } catch (e) {}

  try {
    const savedMilestones = localStorage.getItem('bbr_bab_milestones');
    if (savedMilestones) manualMilestones = JSON.parse(savedMilestones);
  } catch (e) {}

  // 4. Calculate progress per bab
  let totalWords = 0;
  let filledCount = 0;
  let completedCount = 0;

  const items: BabProgressItem[] = outline.map((bab, index) => {
    const babNumber = index + 1;
    const subBabCount = bab.children ? bab.children.length : 0;
    const babHtml = contents[bab.id] || '';
    const words = getWordCount(babHtml);
    totalWords += words;

    const upload = uploads[bab.id];
    const targetWords = DEFAULT_TARGET_WORDS[babNumber] || 2000;

    // Check if filled
    const isFilled = !!upload || words > 0;
    if (isFilled) filledCount++;

    // Calculate completion percentage:
    let pct = 0;
    const manualPct = manualMilestones[bab.id];

    if (upload) {
      // If user uploaded a full draft file, default to 100% unless manually adjusted
      pct = typeof manualPct === 'number' ? manualPct : 100;
    } else if (words > 0) {
      // Proportion based on target words
      const calculatedPct = Math.min(100, Math.round((words / targetWords) * 100));
      // Give minimum 20% if there is real content written
      const basePct = Math.max(20, calculatedPct);
      pct = typeof manualPct === 'number' ? manualPct : basePct;
    } else {
      pct = typeof manualPct === 'number' ? manualPct : 0;
    }

    if (pct >= 100) completedCount++;

    // Status label
    let statusLabel = 'Belum dimulai';
    if (upload) {
      statusLabel = `Berkas: ${upload.fileName}`;
    } else if (words > 0) {
      statusLabel = `${words.toLocaleString('id-ID')} kata / target ${targetWords.toLocaleString('id-ID')} kata`;
    }

    return {
      id: bab.id,
      title: bab.title,
      babNumber,
      subBabCount,
      words,
      targetWords,
      upload,
      percentage: pct,
      isCompleted: pct >= 100,
      statusLabel,
    };
  });

  const totalBabs = outline.length;
  const overallPercentage = totalBabs > 0
    ? Math.round(items.reduce((acc, item) => acc + item.percentage, 0) / totalBabs)
    : 0;

  return {
    jenjang,
    totalBabs,
    filledCount,
    completedCount,
    overallPercentage,
    totalWords,
    items,
  };
}

export function updateBabMilestone(babId: string, percentage: number): void {
  if (typeof window === 'undefined') return;

  try {
    let milestones: Record<string, number> = {};
    const saved = localStorage.getItem('bbr_bab_milestones');
    if (saved) milestones = JSON.parse(saved);

    milestones[babId] = Math.max(0, Math.min(100, percentage));
    localStorage.setItem('bbr_bab_milestones', JSON.stringify(milestones));

    // Also update legacy bbr_progress for compatibility
    const data = getWorkspaceProgressData();
    const legacy = data.items.map(item => ({ bab: item.babNumber, pct: item.percentage }));
    localStorage.setItem('bbr_progress', JSON.stringify(legacy));

    // Emit workspace updated event
    window.dispatchEvent(new CustomEvent('bbr_workspace_updated'));
  } catch (e) {
    console.error('Failed to update bab milestone', e);
  }
}

export function cycleBabMilestone(babId: string, currentPercentage: number): number {
  // Cycle: 0 -> 25 -> 50 -> 75 -> 100 -> 0
  const steps = [0, 25, 50, 75, 100];
  let nextPct = 0;
  if (currentPercentage < 25) nextPct = 25;
  else if (currentPercentage < 50) nextPct = 50;
  else if (currentPercentage < 75) nextPct = 75;
  else if (currentPercentage < 100) nextPct = 100;
  else nextPct = 0;

  updateBabMilestone(babId, nextPct);
  return nextPct;
}
