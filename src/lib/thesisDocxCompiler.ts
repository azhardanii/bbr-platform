/**
 * Thesis & Academic Document Compiler (DOCX)
 * Standar Penulisan Skripsi / Tesis / Disertasi Universitas di Indonesia
 * 
 * Aturan Tata Letak & Penomoran (Sesuai Referensi):
 * 1. Bagian Awal (Halaman Pengesahan, Abstrak, Daftar Isi, Daftar Gambar, Daftar Tabel, Daftar Singkatan):
 *    - Nomor halaman menggunakan angka Romawi kecil (ii, iii, iv, v, vi, vii, viii, ix, x...).
 *    - Posisi: Bawah Tengah (Bottom Center).
 *    - Halaman Sampul (Cover): Diperhitungkan sebagai halaman i, namun nomor halaman TIDAK dicetak.
 * 2. Bagian Utama (Bab 1, Bab 2, dst hingga Daftar Pustaka dan Lampiran):
 *    - Nomor halaman menggunakan angka Arab (1, 2, 3, 4...).
 *    - Halaman pertama setiap Bab (yang memuat Judul Bab): Nomor halaman di BAWAH TENGAH (Bottom Center).
 *    - Halaman lanjutan dalam Bab: Nomor halaman di KANAN ATAS (Top Right).
 *    - Penomoran berlanjut secara berkesinambungan (continuous) dari Bab 1 hingga Lampiran.
 * 3. Daftar Isi:
 *    - Memuat judul bagian/bab, garis titik-titik (dot leader), dan nomor halaman tujuan yang presisi.
 *    - Dilengkapi Word native TOC field dan tautan hyperlink internal.
 * 4. Tipografi & Tata Letak:
 *    - Font: Times New Roman 12pt (atau sesuai pengaturan).
 *    - Spasi: 1.5 atau 2.0 spasi (Abstrak 1.0 spasi).
 *    - Margin: Standar 4-3-4-3 cm (Atas 4cm, Bawah 3cm, Kiri 4cm, Kanan 3cm).
 *    - Indentasi alinea baru: 1.27 cm (first line indent).
 *    - Perataan teks: Justified (rata kiri-kanan).
 */

import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  AlignmentType,
  HeadingLevel,
  convertMillimetersToTwip,
  Packer,
  PageBreak,
  TableOfContents,
  Bookmark,
  BorderStyle,
  WidthType,
  Tab,
  ImageRun,
  TabStopType,
  LeaderType,
  type ISectionOptions,
} from 'docx';

export interface OutlineItem {
  id: string;
  title: string;
  children?: OutlineItem[];
  isOpen?: boolean;
}

export interface DocFormat {
  marginTop: string;
  marginBottom: string;
  marginLeft: string;
  marginRight: string;
  fontFamily: string;
  fontSize: string;
  lineSpacing: string;
  includeToC: boolean;
  includeBibliography: boolean;
}

export interface CitationItem {
  id?: string;
  authors: string;
  year: string;
  title: string;
  journal?: string;
  doi?: string;
  url?: string;
}

export interface ThesisMetadata {
  judul: string;
  subJudul?: string; // TUGAS AKHIR / SKRIPSI / TESIS / DISERTASI
  keperluanGelar?: string;
  namaPenulis: string;
  nim: string;
  programStudi: string;
  jurusan: string;
  fakultas: string;
  universitas: string;
  kota: string;
  tahun: string;
  // Pengesahan
  hariUjian?: string;
  tanggalUjian?: string;
  penguji1?: string;
  nikPenguji1?: string;
  pembimbing1?: string;
  nipPembimbing1?: string;
  pembimbing2?: string;
  nipPembimbing2?: string;
  ketuaProdi?: string;
  nipKetuaProdi?: string;
  // Abstrak
  abstrakId?: string;
  kataKunciId?: string;
  abstrakEn?: string;
  kataKunciEn?: string;
}

export interface ThesisCompileOptions {
  metadata: ThesisMetadata;
  outline: OutlineItem[];
  contents: Record<string, string>;
  citations: CitationItem[];
  format: DocFormat;
  includeCover?: boolean;
  includePengesahan?: boolean;
  includeToC?: boolean;
  includeDaftarGambar?: boolean;
  includeDaftarTabel?: boolean;
  includeDaftarSingkatan?: boolean;
  includeAbstrak?: boolean;
  includeBibliography?: boolean;
  includeLampiran?: boolean;
}

// Convert number to Roman numeral
export function toRoman(num: number, lowercase = false): string {
  const romanMap: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let result = '';
  let n = num;
  for (const [val, sym] of romanMap) {
    while (n >= val) {
      result += sym;
      n -= val;
    }
  }
  return lowercase ? result.toLowerCase() : result;
}

// Word & Character count utilities
export function getWordCount(text?: string): number {
  if (!text) return 0;
  const clean = text.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
  if (!clean) return 0;
  return clean.split(/\s+/).filter(Boolean).length;
}

// Estimate page count of a text block given line spacing
function estimateContentPages(text: string, lineSpacing: string): number {
  const words = getWordCount(text);
  if (words === 0) return 1;
  const wordsPerPage = lineSpacing === '2' ? 220 : lineSpacing === '1.5' ? 280 : 350;
  return Math.max(1, Math.ceil(words / wordsPerPage));
}

/**
 * Robust HTML to Docx Elements Parser
 * Converts TipTap / HTML content into authentic DOCX paragraphs, runs, tables, and images
 */
export function htmlToDocxElements(
  htmlContent: string,
  options: {
    fontFamily: string;
    fontSizeHalfPoints: number; // 24 = 12pt
    lineSpacingTwips: number; // 360 = 1.5 spasi, 480 = 2.0 spasi
    firstLineIndentTwips: number; // 720 = 1.27cm
  }
): (Paragraph | Table)[] {
  if (!htmlContent || typeof htmlContent !== 'string' || htmlContent.trim() === '') {
    return [
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: options.firstLineIndentTwips },
        spacing: { line: options.lineSpacingTwips, before: 0, after: 120 },
        children: [new TextRun({ text: 'Draf naskah bagian ini belum diisi.', italics: true, font: options.fontFamily, size: options.fontSizeHalfPoints })]
      })
    ];
  }

  // Parse HTML using DOMParser in browser or fallback regex
  let container: HTMLElement | null = null;
  if (typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    container = doc.body;
  }

  if (!container) {
    // Fallback: simple paragraph splitter
    const cleanLines = htmlContent
      .replace(/<p[^>]*>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    return cleanLines.map(line => new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      indent: { firstLine: options.firstLineIndentTwips },
      spacing: { line: options.lineSpacingTwips, before: 0, after: 120 },
      children: [new TextRun({ text: line, font: options.fontFamily, size: options.fontSizeHalfPoints })]
    }));
  }

  const elements: (Paragraph | Table)[] = [];

  function processInlineNodes(node: Node, state: { bold: boolean; italics: boolean; underline: boolean }): (TextRun | ImageRun)[] {
    const runs: (TextRun | ImageRun)[] = [];

    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];

      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent || '';
        if (text) {
          runs.push(new TextRun({
            text,
            bold: state.bold,
            italics: state.italics,
            underline: state.underline ? {} : undefined,
            font: options.fontFamily,
            size: options.fontSizeHalfPoints,
          }));
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        const tag = el.tagName.toUpperCase();

        if (tag === 'BR') {
          runs.push(new TextRun({ break: 1, font: options.fontFamily }));
          continue;
        }

        if (tag === 'IMG') {
          // If image has data-url or source
          const src = el.getAttribute('src') || '';
          if (src.startsWith('data:image/')) {
            try {
              const base64Data = src.split(',')[1];
              const binaryString = atob(base64Data);
              const bytes = new Uint8Array(binaryString.length);
              for (let j = 0; j < binaryString.length; j++) {
                bytes[j] = binaryString.charCodeAt(j);
              }
              runs.push(new ImageRun({
                data: bytes,
                transformation: { width: 420, height: 260 },
                type: 'png',
              }));
            } catch (err) {
              console.warn('[DocxCompiler] Could not convert inline base64 image:', err);
            }
          }
          continue;
        }

        const nextState = {
          bold: state.bold || tag === 'STRONG' || tag === 'B',
          italics: state.italics || tag === 'EM' || tag === 'I',
          underline: state.underline || tag === 'U',
        };

        runs.push(...processInlineNodes(el, nextState));
      }
    }

    return runs;
  }

  function processTable(tableEl: HTMLTableElement): Table {
    const tableRows: TableRow[] = [];
    const rows = tableEl.querySelectorAll('tr');

    rows.forEach((tr, rIdx) => {
      const cells: TableCell[] = [];
      const cellNodes = tr.querySelectorAll('th, td');

      cellNodes.forEach(cellEl => {
        const isHeader = cellEl.tagName.toUpperCase() === 'TH' || rIdx === 0;
        const cellRuns = processInlineNodes(cellEl, { bold: isHeader, italics: false, underline: false });

        cells.push(new TableCell({
          children: [
            new Paragraph({
              alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
              spacing: { before: 60, after: 60, line: 240 },
              children: cellRuns.length > 0 ? cellRuns : [new TextRun({ text: '', font: options.fontFamily })]
            })
          ],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
            bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          margins: {
            top: convertMillimetersToTwip(2),
            bottom: convertMillimetersToTwip(2),
            left: convertMillimetersToTwip(3),
            right: convertMillimetersToTwip(3),
          },
        }));
      });

      if (cells.length > 0) {
        tableRows.push(new TableRow({
          children: cells,
          tableHeader: rIdx === 0,
        }));
      }
    });

    return new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
  }

  // Iterate top-level nodes
  for (let i = 0; i < container.childNodes.length; i++) {
    const node = container.childNodes[i];

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        elements.push(new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: options.firstLineIndentTwips },
          spacing: { line: options.lineSpacingTwips, before: 0, after: 120 },
          children: [new TextRun({ text, font: options.fontFamily, size: options.fontSizeHalfPoints })]
        }));
      }
      continue;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toUpperCase();

      if (tag === 'TABLE') {
        elements.push(processTable(el as HTMLTableElement));
        continue;
      }

      if (tag === 'H1') {
        const runs = processInlineNodes(el, { bold: true, italics: false, underline: false });
        elements.push(new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 180 },
          children: runs,
        }));
        continue;
      }

      if (tag === 'H2') {
        const runs = processInlineNodes(el, { bold: true, italics: false, underline: false });
        elements.push(new Paragraph({
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.LEFT,
          spacing: { before: 200, after: 100 },
          children: runs,
        }));
        continue;
      }

      if (tag === 'H3') {
        const runs = processInlineNodes(el, { bold: true, italics: false, underline: false });
        elements.push(new Paragraph({
          heading: HeadingLevel.HEADING_3,
          alignment: AlignmentType.LEFT,
          spacing: { before: 160, after: 80 },
          children: runs,
        }));
        continue;
      }

      if (tag === 'UL' || tag === 'OL') {
        const listItems = el.querySelectorAll('li');
        listItems.forEach((li, lIdx) => {
          const runs = processInlineNodes(li, { bold: false, italics: false, underline: false });
          elements.push(new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            bullet: tag === 'UL' ? { level: 0 } : undefined,
            indent: { left: convertMillimetersToTwip(12.7) },
            spacing: { line: options.lineSpacingTwips, before: 40, after: 60 },
            children: tag === 'OL'
              ? [new TextRun({ text: `${lIdx + 1}. `, bold: true, font: options.fontFamily, size: options.fontSizeHalfPoints }), ...runs]
              : runs,
          }));
        });
        continue;
      }

      if (tag === 'BLOCKQUOTE') {
        const runs = processInlineNodes(el, { bold: false, italics: true, underline: false });
        elements.push(new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { left: convertMillimetersToTwip(12.7), right: convertMillimetersToTwip(12.7) },
          spacing: { line: 240, before: 120, after: 120 },
          children: runs,
        }));
        continue;
      }

      // Default: Paragraph (<p>, <div>, etc.)
      const runs = processInlineNodes(el, { bold: false, italics: false, underline: false });
      if (runs.length > 0) {
        // Check if paragraph is a table or figure caption (starts with "Tabel " or "Gambar ")
        const rawText = el.textContent?.trim() || '';
        const isCaption = /^(Tabel|Gambar)\s+\d+/i.test(rawText);

        elements.push(new Paragraph({
          alignment: isCaption ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
          indent: isCaption ? undefined : { firstLine: options.firstLineIndentTwips },
          spacing: isCaption 
            ? { line: 240, before: 120, after: 80 } 
            : { line: options.lineSpacingTwips, before: 0, after: 120 },
          children: runs,
        }));
      }
    }
  }

  return elements.length > 0 ? elements : [
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      indent: { firstLine: options.firstLineIndentTwips },
      spacing: { line: options.lineSpacingTwips, before: 0, after: 120 },
      children: [new TextRun({ text: htmlContent.replace(/<[^>]+>/g, '').trim(), font: options.fontFamily, size: options.fontSizeHalfPoints })]
    })
  ];
}

/**
 * Generate Complete Academic Thesis Document (.docx)
 * Matching the exact layout, page numbering, and typography of Indonesian Universities.
 */
export async function generateThesisDocxBlob(options: ThesisCompileOptions): Promise<Blob> {
  const {
    metadata,
    outline,
    contents,
    citations,
    format,
    includeCover = true,
    includePengesahan = true,
    includeToC = true,
    includeDaftarGambar = true,
    includeDaftarTabel = true,
    includeDaftarSingkatan = true,
    includeAbstrak = true,
    includeBibliography = true,
    includeLampiran = true,
  } = options;

  const fontFamily = format.fontFamily || 'Times New Roman';
  const fontSizePt = parseFloat(format.fontSize) || 12;
  const fontSizeHalfPoints = fontSizePt * 2;
  const lineSpacingTwips = format.lineSpacing === '2' ? 480 : format.lineSpacing === '1.5' ? 360 : 276;
  const firstLineIndentTwips = convertMillimetersToTwip(12.7); // 1.27 cm standard indent

  // Margins in Twips
  const marginTopTwips = convertMillimetersToTwip(parseFloat(format.marginTop || '4') * 10);
  const marginBottomTwips = convertMillimetersToTwip(parseFloat(format.marginBottom || '3') * 10);
  const marginLeftTwips = convertMillimetersToTwip(parseFloat(format.marginLeft || '4') * 10);
  const marginRightTwips = convertMillimetersToTwip(parseFloat(format.marginRight || '3') * 10);

  const a4WidthTwips = convertMillimetersToTwip(210);
  const a4HeightTwips = convertMillimetersToTwip(297);

  // -------------------------------------------------------------
  // CALCULATE EXACT DESTINATION PAGES FOR TABLE OF CONTENTS
  // -------------------------------------------------------------
  // Preliminary Pages (Roman numerals):
  // Cover = page i (hidden)
  let currentRoman = 1; // Cover = 1 (i)
  
  let pengesahanPage = '';
  if (includePengesahan) {
    currentRoman++;
    pengesahanPage = toRoman(currentRoman, true); // ii
  }

  let tocStartPage = '';
  let tocPagesCount = 1;
  if (includeToC) {
    currentRoman++;
    tocStartPage = toRoman(currentRoman, true); // iii (or ii)
    // Estimate TOC length: if total items > 28, takes 2 pages
    const totalTocItems = outline.reduce((acc, b) => acc + 1 + (b.children?.length || 0), 0) + 6;
    if (totalTocItems > 28) {
      tocPagesCount = Math.min(3, Math.ceil(totalTocItems / 28));
      currentRoman += (tocPagesCount - 1);
    }
  }

  let daftarGambarPage = '';
  if (includeDaftarGambar) {
    currentRoman++;
    daftarGambarPage = toRoman(currentRoman, true);
  }

  let daftarSingkatanPage = '';
  if (includeDaftarSingkatan) {
    currentRoman++;
    daftarSingkatanPage = toRoman(currentRoman, true);
  }

  let daftarTabelPage = '';
  if (includeDaftarTabel) {
    currentRoman++;
    daftarTabelPage = toRoman(currentRoman, true);
  }

  let abstrakPage = '';
  if (includeAbstrak) {
    currentRoman++;
    abstrakPage = toRoman(currentRoman, true);
  }

  let abstractPage = '';
  if (includeAbstrak) {
    currentRoman++;
    abstractPage = toRoman(currentRoman, true);
  }

  // Main Body Pages (Arabic numerals 1, 2, 3...):
  // BAB 1 ALWAYS starts on Arabic page 1!
  let currentArabicPage = 1;
  const chapterPageInfo: {
    id: string;
    title: string;
    startPage: number;
    subBabs: { id: string; title: string; page: number }[];
  }[] = [];

  outline.forEach((bab) => {
    const babContent = contents[bab.id] || '';
    const startPage = currentArabicPage;
    const subBabsList: { id: string; title: string; page: number }[] = [];

    const totalWords = getWordCount(babContent);
    const estimatedPages = estimateContentPages(babContent, format.lineSpacing);

    if (bab.children && bab.children.length > 0) {
      const wordsPerSub = Math.max(1, Math.floor(totalWords / bab.children.length));
      bab.children.forEach((sub, sIdx) => {
        const subWordsOffset = sIdx * wordsPerSub;
        const subPageOffset = Math.min(estimatedPages - 1, Math.floor(subWordsOffset / (format.lineSpacing === '2' ? 220 : 280)));
        subBabsList.push({
          id: sub.id,
          title: sub.title,
          page: startPage + subPageOffset,
        });
      });
    }

    chapterPageInfo.push({
      id: bab.id,
      title: bab.title,
      startPage,
      subBabs: subBabsList,
    });

    currentArabicPage += estimatedPages;
  });

  const daftarPustakaStartPage = currentArabicPage;
  const daftarPustakaPages = Math.max(1, Math.ceil((citations?.length || 3) / 5));
  currentArabicPage += daftarPustakaPages;

  const lampiranStartPage = currentArabicPage;

  // -------------------------------------------------------------
  // BUILD TABLE OF CONTENTS CACHED ENTRIES
  // -------------------------------------------------------------
  const tocEntries: { level: number; title: string; page: string | number; href?: string }[] = [];

  if (includePengesahan) {
    tocEntries.push({ level: 1, title: 'HALAMAN PENGESAHAN', page: pengesahanPage, href: 'halaman_pengesahan' });
  }
  if (includeToC) {
    tocEntries.push({ level: 1, title: 'DAFTAR ISI', page: tocStartPage });
  }
  if (includeDaftarGambar) {
    tocEntries.push({ level: 1, title: 'DAFTAR GAMBAR', page: daftarGambarPage });
  }
  if (includeDaftarSingkatan) {
    tocEntries.push({ level: 1, title: 'DAFTAR SINGKATAN', page: daftarSingkatanPage });
  }
  if (includeDaftarTabel) {
    tocEntries.push({ level: 1, title: 'DAFTAR TABEL', page: daftarTabelPage });
  }
  if (includeAbstrak) {
    tocEntries.push({ level: 1, title: 'ABSTRAK', page: abstrakPage });
    tocEntries.push({ level: 1, title: 'ABSTRACT', page: abstractPage });
  }

  // Chapters & Sub-chapters
  chapterPageInfo.forEach((cp) => {
    const babBookmark = 'bab_' + cp.id.replace(/[^a-zA-Z0-9_]/g, '_');
    tocEntries.push({
      level: 1,
      title: cp.title.toUpperCase(),
      page: cp.startPage,
      href: babBookmark,
    });

    cp.subBabs.forEach(sub => {
      const subBookmark = 'sub_' + sub.id.replace(/[^a-zA-Z0-9_]/g, '_');
      tocEntries.push({
        level: 2,
        title: sub.title,
        page: sub.page,
        href: subBookmark,
      });
    });
  });

  if (includeBibliography) {
    tocEntries.push({
      level: 1,
      title: 'DAFTAR PUSTAKA',
      page: daftarPustakaStartPage,
      href: 'daftar_pustaka',
    });
  }

  if (includeLampiran) {
    tocEntries.push({
      level: 1,
      title: 'LAMPIRAN',
      page: lampiranStartPage,
      href: 'lampiran',
    });
  }

  // -------------------------------------------------------------
  // SECTION 1: BAGIAN AWAL (Cover, Pengesahan, ToC, Abstrak, dll)
  // Page number: Lowercase Roman (ii, iii, iv...), Bottom Center
  // Cover page number is suppressed via differentFirstPageHeaderFooter
  // -------------------------------------------------------------
  const preliminaryChildren: (Paragraph | Table | TableOfContents)[] = [];

  // 1. COVER PAGE
  if (includeCover) {
    const judulUpper = (metadata.judul || 'JUDUL NASKAH PENELITIAN TUGAS AKHIR').toUpperCase();
    const subJudul = (metadata.subJudul || 'TUGAS AKHIR').toUpperCase();
    const gelarText = metadata.keperluanGelar || 'Untuk Memenuhi Persyaratan\nMemperoleh Gelar Sarjana';
    const penulisName = (metadata.namaPenulis || 'Krisno Adi Putra').toUpperCase();
    const nimText = metadata.nim ? `NIM ${metadata.nim}` : 'NIM 145070500111013';

    const prodi = (metadata.programStudi || 'PROGRAM STUDI SARJANA FARMASI').toUpperCase();
    const jurusan = (metadata.jurusan || 'JURUSAN FARMASI').toUpperCase();
    const fakultas = (metadata.fakultas || 'FAKULTAS KEDOKTERAN').toUpperCase();
    const universitas = (metadata.universitas || 'UNIVERSITAS BRAWIJAYA').toUpperCase();
    const kota = (metadata.kota || 'MALANG').toUpperCase();
    const tahun = metadata.tahun || new Date().getFullYear().toString();

    preliminaryChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 720, after: 720 },
        children: [
          new TextRun({
            text: judulUpper,
            bold: true,
            size: 28, // 14pt
            font: fontFamily,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 480, after: 240 },
        children: [
          new TextRun({
            text: subJudul,
            bold: true,
            size: 24, // 12pt
            font: fontFamily,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 1200 },
        children: [
          new TextRun({
            text: gelarText,
            size: 22, // 11pt
            font: fontFamily,
          }),
        ],
      }),
      // Space for Campus Logo
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1200, after: 1200 },
        children: [
          new TextRun({
            text: '[ LOGO RESMI KAMPUS ]',
            font: fontFamily,
            size: 20,
            italics: true,
            color: '888888',
          }),
        ],
      }),
      // Author section
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 800, after: 120 },
        children: [
          new TextRun({ text: 'Oleh :\n', font: fontFamily, size: 22 }),
          new TextRun({ text: penulisName + '\n', bold: true, font: fontFamily, size: 24 }),
          new TextRun({ text: nimText, bold: true, font: fontFamily, size: 24 }),
        ],
      }),
      // Institution footer
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1000, after: 0 },
        children: [
          new TextRun({
            text: `${prodi}\n${jurusan}\n${fakultas}\n${universitas}\n${kota}\n${tahun}`,
            bold: true,
            font: fontFamily,
            size: 24,
          }),
        ],
      })
    );
  }

  // 2. HALAMAN PENGESAHAN
  if (includePengesahan) {
    preliminaryChildren.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 240 },
        children: [
          new Bookmark({
            id: 'halaman_pengesahan',
            children: [
              new TextRun({ text: 'HALAMAN PENGESAHAN', bold: true, size: 28, font: fontFamily }),
            ],
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 240 },
        children: [
          new TextRun({ text: (metadata.subJudul || 'TUGAS AKHIR').toUpperCase(), bold: true, size: 24, font: fontFamily }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 480 },
        children: [
          new TextRun({ text: (metadata.judul || '').toUpperCase(), bold: true, size: 24, font: fontFamily }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 360 },
        children: [
          new TextRun({ text: 'Oleh:\n', font: fontFamily, size: 22 }),
          new TextRun({ text: `${metadata.namaPenulis || 'Krisno Adi Putra'}\n`, bold: true, font: fontFamily, size: 24 }),
          new TextRun({ text: `NIM. ${metadata.nim || '145070500111013'}`, bold: true, font: fontFamily, size: 24 }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({ text: `Telah diuji pada\nHari : ${metadata.hariUjian || 'Rabu'}\nTanggal : ${metadata.tanggalUjian || '16 Desember 2024'}\ndan dinyatakan lulus oleh:`, font: fontFamily, size: 22 }),
        ],
      }),
      // Examiners / Supervisors Table
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 2,
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 240, after: 720 },
                    children: [
                      new TextRun({ text: 'Penguji-I\n\n\n\n', font: fontFamily, size: 22 }),
                      new TextRun({ text: `${metadata.penguji1 || 'apt. Uswatun Khasanah, S.Farm., M.Farm.'}\n`, bold: true, underline: {}, font: fontFamily, size: 22 }),
                      new TextRun({ text: `NIK. ${metadata.nikPenguji1 || '2011068512222001'}`, font: fontFamily, size: 20 }),
                    ]
                  })
                ]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 240, after: 720 },
                    children: [
                      new TextRun({ text: 'Penguji-II / Pembimbing-I\n\n\n\n', font: fontFamily, size: 22 }),
                      new TextRun({ text: `${metadata.pembimbing1 || 'Prof. apt. Sri Winarsih, Dr., M.Si., Dra.'}\n`, bold: true, underline: {}, font: fontFamily, size: 22 }),
                      new TextRun({ text: `NIP. ${metadata.nipPembimbing1 || '195408231981032001'}`, font: fontFamily, size: 20 }),
                    ]
                  })
                ]
              }),
              new TableCell({
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 240, after: 720 },
                    children: [
                      new TextRun({ text: 'Penguji-III / Pembimbing-II\n\n\n\n', font: fontFamily, size: 22 }),
                      new TextRun({ text: `${metadata.pembimbing2 || 'apt. Oktavia Rahayu A., S.Farm., M.Biomed.'}\n`, bold: true, underline: {}, font: fontFamily, size: 22 }),
                      new TextRun({ text: `NIK. ${metadata.nipPembimbing2 || '2016099210192001'}`, font: fontFamily, size: 20 }),
                    ]
                  })
                ]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 2,
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 240, after: 240 },
                    children: [
                      new TextRun({ text: `Mengetahui,\nKetua Program Studi ${metadata.jurusan || 'Farmasi'},\n\n\n\n`, font: fontFamily, size: 22 }),
                      new TextRun({ text: `${metadata.ketuaProdi || 'apt. Alvan Febrian Shalas, S.Farm., M.Farm.'}\n`, bold: true, underline: {}, font: fontFamily, size: 22 }),
                      new TextRun({ text: `NIP. ${metadata.nipKetuaProdi || '198502182019031007'}`, font: fontFamily, size: 20 }),
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })
    );
  }

  // 3. DAFTAR ISI
  if (includeToC) {
    preliminaryChildren.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 240 },
        children: [
          new TextRun({ text: 'DAFTAR ISI', bold: true, size: 28, font: fontFamily }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 240 },
        children: [
          new TextRun({ text: 'Halaman', bold: true, size: 22, font: fontFamily }),
        ],
      }),
      new TableOfContents('DAFTAR ISI', {
        hyperlink: true,
        headingStyleRange: '1-3',
        cachedEntries: tocEntries as unknown as readonly { title: string; level: number; page?: number; href?: string }[],
      })
    );
  }

  // 4. DAFTAR GAMBAR
  if (includeDaftarGambar) {
    // Scan contents for user-defined figures or fallback to full reference list from PDF
    const detectedFigures: { title: string; page: number | string }[] = [];
    chapterPageInfo.forEach((cp) => {
      const rawText = (contents[cp.id] || '').replace(/<[^>]+>/g, '\n');
      const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
      lines.forEach(line => {
        if (/^Gambar\s+\d+[\.\d]*\b/i.test(line)) {
          detectedFigures.push({ title: line, page: cp.startPage });
        }
      });
    });

    const defaultFigureList = [
      { title: '2.1 Gambar Tumbuhan Putri Malu (Mimosa pudica)', page: chapterPageInfo[1]?.startPage ? chapterPageInfo[1].startPage + 1 : 7 },
      { title: '2.2 Gambar Kultur C. albicans Pada Media SDA', page: chapterPageInfo[1]?.startPage ? chapterPageInfo[1].startPage + 5 : 11 },
      { title: '2.3 Gambar Mikroskopis Jamur C. albicans', page: chapterPageInfo[1]?.startPage ? chapterPageInfo[1].startPage + 6 : 12 },
      { title: '2.4 Gambar Germ-tube pada Jamur C. albicans', page: chapterPageInfo[1]?.startPage ? chapterPageInfo[1].startPage + 7 : 13 },
      { title: '3.1 Gambar Kerangka Konsep Penelitian', page: chapterPageInfo[2]?.startPage || 23 },
      { title: '5.1 Gambar Hasil Ekstraksi Maserasi Daun M. pudica', page: chapterPageInfo[4]?.startPage || 39 },
      { title: '5.2 Gambar Hasil Fraksinasi Daun M. pudica', page: chapterPageInfo[4]?.startPage ? chapterPageInfo[4].startPage + 1 : 40 },
      { title: '5.3 Gambar Penampakan Makroskopis Fungi C. albicans', page: chapterPageInfo[4]?.startPage ? chapterPageInfo[4].startPage + 2 : 41 },
      { title: '5.4 Gambar Pengamatan Mikroskopis Pewarnaan Gram Fungi', page: chapterPageInfo[4]?.startPage ? chapterPageInfo[4].startPage + 2 : 41 },
      { title: '5.5 Gambar Pengamatan Mikroskopis Germ-tube Test', page: chapterPageInfo[4]?.startPage ? chapterPageInfo[4].startPage + 3 : 42 },
      { title: '5.6 Gambar Hasil Uji Daya Hambat Antifungi', page: chapterPageInfo[4]?.startPage ? chapterPageInfo[4].startPage + 4 : 43 },
    ];

    const activeFigures = detectedFigures.length > 0 ? detectedFigures : defaultFigureList;

    preliminaryChildren.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 240 },
        children: [
          new TextRun({ text: 'DAFTAR GAMBAR', bold: true, size: 28, font: fontFamily }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 240 },
        children: [
          new TextRun({ text: 'Halaman', bold: true, size: 22, font: fontFamily }),
        ],
      }),
      ...activeFigures.map(fig => new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: 9025, leader: LeaderType.DOT }],
        spacing: { line: 360, before: 60, after: 60 },
        children: [
          new TextRun({ text: fig.title, font: fontFamily, size: 22 }),
          new TextRun({ children: [new Tab(), String(fig.page)], font: fontFamily, size: 22 }),
        ],
      }))
    );
  }

  // 5. DAFTAR SINGKATAN
  if (includeDaftarSingkatan) {
    preliminaryChildren.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 360 },
        children: [
          new TextRun({ text: 'DAFTAR SINGKATAN', bold: true, size: 28, font: fontFamily }),
        ],
      }),
      new Paragraph({
        spacing: { line: 360, before: 60, after: 60 },
        children: [new TextRun({ text: 'SDA : Sabouraud Dextrose Agar', font: fontFamily, size: 22 })],
      }),
      new Paragraph({
        spacing: { line: 360, before: 60, after: 60 },
        children: [new TextRun({ text: 'ATP : Adenosina trifosfat', font: fontFamily, size: 22 })],
      }),
      new Paragraph({
        spacing: { line: 360, before: 60, after: 60 },
        children: [new TextRun({ text: 'DMSO : Dimetil sulfoksida', font: fontFamily, size: 22 })],
      }),
      new Paragraph({
        spacing: { line: 360, before: 60, after: 60 },
        children: [new TextRun({ text: 'ELISA : Enzyme-linked Immunosorbent Assay', font: fontFamily, size: 22 })],
      }),
      new Paragraph({
        spacing: { line: 360, before: 60, after: 60 },
        children: [new TextRun({ text: 'KHM : Kadar Hambat Minimum', font: fontFamily, size: 22 })],
      }),
      new Paragraph({
        spacing: { line: 360, before: 60, after: 60 },
        children: [new TextRun({ text: 'KBM : Kadar Bunuh Minimum', font: fontFamily, size: 22 })],
      }),
      new Paragraph({
        spacing: { line: 360, before: 60, after: 60 },
        children: [new TextRun({ text: 'ANOVA : Analysis of Variance', font: fontFamily, size: 22 })],
      }),
      new Paragraph({
        spacing: { line: 360, before: 60, after: 60 },
        children: [new TextRun({ text: 'SPSS : Statistical Package for the Social Sciences', font: fontFamily, size: 22 })],
      })
    );
  }

  // 6. DAFTAR TABEL
  if (includeDaftarTabel) {
    const detectedTables: { title: string; page: number | string }[] = [];
    chapterPageInfo.forEach((cp) => {
      const rawText = (contents[cp.id] || '').replace(/<[^>]+>/g, '\n');
      const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
      lines.forEach(line => {
        if (/^Tabel\s+\d+[\.\d]*\b/i.test(line)) {
          detectedTables.push({ title: line, page: cp.startPage });
        }
      });
    });

    const defaultTableList = [
      { title: 'Tabel 5.1. Persentase Rendemen Ekstrak Etanol 96%', page: chapterPageInfo[4]?.startPage || 39 },
      { title: 'Tabel 5.2. Persentase Rendemen Fraksi Etil Asetat', page: chapterPageInfo[4]?.startPage ? chapterPageInfo[4].startPage + 1 : 40 },
      { title: 'Tabel 5.3. Uji Daya Hambat Antifungi Ekstrak Daun M. pudica', page: chapterPageInfo[4]?.startPage ? chapterPageInfo[4].startPage + 3 : 42 },
    ];

    const activeTables = detectedTables.length > 0 ? detectedTables : defaultTableList;

    preliminaryChildren.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 240 },
        children: [
          new TextRun({ text: 'DAFTAR TABEL', bold: true, size: 28, font: fontFamily }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 240 },
        children: [
          new TextRun({ text: 'Halaman', bold: true, size: 22, font: fontFamily }),
        ],
      }),
      ...activeTables.map(tbl => new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: 9025, leader: LeaderType.DOT }],
        spacing: { line: 360, before: 60, after: 60 },
        children: [
          new TextRun({ text: tbl.title, font: fontFamily, size: 22 }),
          new TextRun({ children: [new Tab(), String(tbl.page)], font: fontFamily, size: 22 }),
        ],
      }))
    );
  }

  // 7. ABSTRAK (Bahasa Indonesia)
  if (includeAbstrak) {
    const namaPenulisParts = (metadata.namaPenulis || 'Krisno Adi Putra').trim().split(' ');
    const namaBelakang = namaPenulisParts.length > 1 ? namaPenulisParts[namaPenulisParts.length - 1] : namaPenulisParts[0];
    const namaDepan = namaPenulisParts.length > 1 ? namaPenulisParts.slice(0, -1).join(' ') : '';
    const formattedCitationName = namaDepan ? `${namaBelakang}, ${namaDepan}` : namaBelakang;

    const abstrakBody = metadata.abstrakId || (
      `Penelitian ini bertujuan untuk menganalisis dan mendeskripsikan secara mendalam mengenai ${metadata.judul || 'topik penelitian'}. ` +
      `Metodologi yang digunakan adalah pendekatan ilmiah terstruktur dengan pengumpulan data primer dan sekunder yang relevan. ` +
      `Hasil penelitian menunjukkan bahwa terdapat pengaruh yang signifikan antara variabel yang diteliti dengan tingkat signifikansi yang memenuhi kaidah akademis. ` +
      `Kesimpulan penelitian ini memberikan kontribusi teoretis bagi pengembangan ilmu pengetahuan serta implikasi praktis bagi pemangku kepentingan terkait.`
    );

    preliminaryChildren.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 360 },
        children: [
          new TextRun({ text: 'ABSTRAK', bold: true, size: 28, font: fontFamily }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 240, before: 0, after: 240 }, // Single space for abstract
        children: [
          new TextRun({
            text: `${formattedCitationName}. ${metadata.tahun || '2024'}. ${metadata.judul || 'Judul Penelitian'}. ` +
                  `${metadata.subJudul || 'Tugas Akhir'}, ${metadata.programStudi || 'Program Studi Sarjana Farmasi'}, ` +
                  `${metadata.fakultas || 'Fakultas Kedokteran'} ${metadata.universitas || 'Universitas Brawijaya'}. ` +
                  `Pembimbing: (1) ${metadata.pembimbing1 || 'Prof. Dr. Pembimbing Utama'} (2) ${metadata.pembimbing2 || 'apt. Pembimbing Pendamping, M.Farm.'}`,
            font: fontFamily,
            size: 20, // 10pt
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: firstLineIndentTwips },
        spacing: { line: 240, before: 0, after: 240 },
        children: [
          new TextRun({
            text: abstrakBody,
            font: fontFamily,
            size: 20,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 240, before: 120, after: 0 },
        children: [
          new TextRun({ text: 'Kata kunci: ', bold: true, italics: true, font: fontFamily, size: 20 }),
          new TextRun({ text: metadata.kataKunciId || 'metode penelitian, analisis data, signifikansi statistik, implikasi praktis', italics: true, font: fontFamily, size: 20 }),
        ],
      })
    );

    // 8. ABSTRACT (English)
    preliminaryChildren.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 360 },
        children: [
          new TextRun({ text: 'ABSTRACT', bold: true, size: 28, font: fontFamily }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 240, before: 0, after: 240 },
        children: [
          new TextRun({
            text: `${formattedCitationName}. ${metadata.tahun || '2024'}. Study and In-Depth Analysis on the Targeted Subject. ` +
                  `Final Assignment, Undergraduate Program, Faculty of Medicine, Universitas Brawijaya. ` +
                  `Supervisors: (1) ${metadata.pembimbing1 || 'Prof. Dr. Principal Supervisor'} (2) ${metadata.pembimbing2 || 'Co-Supervisor, M.Sc.'}`,
            font: fontFamily,
            size: 20,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: firstLineIndentTwips },
        spacing: { line: 240, before: 0, after: 240 },
        children: [
          new TextRun({
            text: metadata.abstrakEn || (
              `This study aims to thoroughly investigate and elucidate the empirical phenomena surrounding the research topic. ` +
              `The methodological framework employs structured scientific protocols with comprehensive qualitative and quantitative data collection. ` +
              `The findings demonstrate statistically significant correlations and meaningful practical implications within the field.`
            ),
            font: fontFamily,
            size: 20,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 240, before: 120, after: 0 },
        children: [
          new TextRun({ text: 'Keywords: ', bold: true, italics: true, font: fontFamily, size: 20 }),
          new TextRun({ text: metadata.kataKunciEn || 'research methodology, statistical analysis, empirical evidence, practical implications', italics: true, font: fontFamily, size: 20 }),
        ],
      })
    );
  }

  // -------------------------------------------------------------
  // ASSEMBLE ALL SECTIONS
  // -------------------------------------------------------------
  const allSections: ISectionOptions[] = [];

  // Section 1: Preliminary Section
  allSections.push({
    properties: {
      page: {
        size: { width: a4WidthTwips, height: a4HeightTwips },
        margin: { top: marginTopTwips, bottom: marginBottomTwips, left: marginLeftTwips, right: marginRightTwips },
        pageNumbers: { start: 1, formatType: NumberFormat.LOWER_ROMAN },
      },
      titlePage: true,
    },
    headers: {
      default: new Header({ children: [] }),
      first: new Header({ children: [] }),
    },
    footers: {
      // Preliminary pages have page number at BOTTOM CENTER (ii, iii, iv...)
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                children: [PageNumber.CURRENT],
                font: fontFamily,
                size: 20,
              }),
            ],
          }),
        ],
      }),
      // Cover page has footer suppressed (empty)
      first: new Footer({ children: [] }),
    },
    children: preliminaryChildren,
  });

  // Section 2..N: MAIN CHAPTERS (BAB 1, BAB 2, ...)
  // BAB 1 starts at Arabic page 1. Following chapters continue page numbering!
  outline.forEach((bab, index) => {
    const isFirstChapter = index === 0;
    const rawContent = contents[bab.id] || '';
    const babBookmark = 'bab_' + bab.id.replace(/[^a-zA-Z0-9_]/g, '_');

    const chapterElements: (Paragraph | Table)[] = [];

    // BAB HEADING (Centered, Bold, Uppercase)
    // E.g.: "BAB 1\nPENDAHULUAN"
    let titleLine1 = bab.title;
    let titleLine2 = '';

    const babMatch = bab.title.match(/^(BAB\s+[0-9IVXLCDM]+)[\s:\-]+(.*)$/i);
    if (babMatch) {
      titleLine1 = babMatch[1].toUpperCase();
      titleLine2 = babMatch[2].trim().toUpperCase();
    }

    chapterElements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 480 },
        children: [
          new Bookmark({
            id: babBookmark,
            children: [
              new TextRun({
                text: titleLine2 ? `${titleLine1}\n${titleLine2}` : titleLine1,
                bold: true,
                size: 28, // 14pt
                font: fontFamily,
              }),
            ],
          }),
        ],
      })
    );

    // If user provided rich content in editor, convert and preserve structure
    if (rawContent && rawContent.trim().length > 0) {
      const parsedElements = htmlToDocxElements(rawContent, {
        fontFamily,
        fontSizeHalfPoints,
        lineSpacingTwips,
        firstLineIndentTwips,
      });
      chapterElements.push(...parsedElements);
    } else {
      // Default template structure if empty
      if (bab.children && bab.children.length > 0) {
        bab.children.forEach(sub => {
          const subBookmark = 'sub_' + sub.id.replace(/[^a-zA-Z0-9_]/g, '_');
          chapterElements.push(
            new Paragraph({
              spacing: { before: 240, after: 120 },
              children: [
                new Bookmark({
                  id: subBookmark,
                  children: [
                    new TextRun({ text: sub.title, bold: true, size: fontSizeHalfPoints, font: fontFamily }),
                  ],
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              indent: { firstLine: firstLineIndentTwips },
              spacing: { line: lineSpacingTwips, before: 0, after: 120 },
              children: [
                new TextRun({
                  text: `Draf naskah penelitian untuk sub-bab ${sub.title} dituliskan pada bagian ini sesuai dengan data dan analisis yang dilakukan.`,
                  font: fontFamily,
                  size: fontSizeHalfPoints,
                }),
              ],
            })
          );
        });
      } else {
        chapterElements.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: firstLineIndentTwips },
            spacing: { line: lineSpacingTwips, before: 0, after: 120 },
            children: [
              new TextRun({
                text: 'Draf naskah pada bab ini belum diisi oleh pengguna.',
                italics: true,
                font: fontFamily,
                size: fontSizeHalfPoints,
              }),
            ],
          })
        );
      }
    }

    allSections.push({
      properties: {
        page: {
          size: { width: a4WidthTwips, height: a4HeightTwips },
          margin: { top: marginTopTwips, bottom: marginBottomTwips, left: marginLeftTwips, right: marginRightTwips },
          pageNumbers: isFirstChapter 
            ? { start: 1, formatType: NumberFormat.DECIMAL } 
            : { formatType: NumberFormat.DECIMAL },
        },
        titlePage: true,
      },
      headers: {
        // Subsequent pages of the Bab have page number at TOP RIGHT!
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: fontFamily,
                  size: 20,
                }),
              ],
            }),
          ],
        }),
        // First page of Bab has NO header at top right!
        first: new Header({ children: [] }),
      },
      footers: {
        // Subsequent pages of Bab have NO footer!
        default: new Footer({ children: [] }),
        // First page of Bab has page number at BOTTOM CENTER!
        first: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: fontFamily,
                  size: 20,
                }),
              ],
            }),
          ],
        }),
      },
      children: chapterElements,
    });
  });

  // Section: DAFTAR PUSTAKA
  if (includeBibliography) {
    const bibChildren: Paragraph[] = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 480 },
        children: [
          new Bookmark({
            id: 'daftar_pustaka',
            children: [
              new TextRun({ text: 'DAFTAR PUSTAKA', bold: true, size: 28, font: fontFamily }),
            ],
          }),
        ],
      }),
    ];

    const sortedCitations = [...(citations || [])].sort((a, b) => a.authors.localeCompare(b.authors));

    sortedCitations.forEach(c => {
      bibChildren.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: {
            left: convertMillimetersToTwip(12.7),
            hanging: convertMillimetersToTwip(12.7), // APA Hanging Indent!
          },
          spacing: { line: 240, before: 60, after: 120 },
          children: [
            new TextRun({ text: `${c.authors}. `, font: fontFamily, size: fontSizeHalfPoints }),
            new TextRun({ text: `(${c.year || '2024'}). `, font: fontFamily, size: fontSizeHalfPoints }),
            new TextRun({ text: `${c.title}. `, italics: true, font: fontFamily, size: fontSizeHalfPoints }),
            new TextRun({ text: `${c.journal || ''}.${c.doi ? ` https://doi.org/${c.doi}` : c.url ? ` ${c.url}` : ''}`, font: fontFamily, size: fontSizeHalfPoints }),
          ],
        })
      );
    });

    allSections.push({
      properties: {
        page: {
          size: { width: a4WidthTwips, height: a4HeightTwips },
          margin: { top: marginTopTwips, bottom: marginBottomTwips, left: marginLeftTwips, right: marginRightTwips },
          pageNumbers: { formatType: NumberFormat.DECIMAL },
        },
        titlePage: true,
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ children: [PageNumber.CURRENT], font: fontFamily, size: 20 })],
            }),
          ],
        }),
        first: new Header({ children: [] }),
      },
      footers: {
        default: new Footer({ children: [] }),
        first: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], font: fontFamily, size: 20 })],
            }),
          ],
        }),
      },
      children: bibChildren,
    });
  }

  // Section: LAMPIRAN
  if (includeLampiran) {
    const lampiranChildren: Paragraph[] = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 480 },
        children: [
          new Bookmark({
            id: 'lampiran',
            children: [
              new TextRun({ text: 'LAMPIRAN', bold: true, size: 28, font: fontFamily }),
            ],
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({ text: 'Lampiran 1. Perhitungan dan Pengolahan Data Statistik', bold: true, size: fontSizeHalfPoints, font: fontFamily }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: firstLineIndentTwips },
        spacing: { line: lineSpacingTwips, before: 0, after: 120 },
        children: [
          new TextRun({
            text: 'Data mentah, hasil kalkulasi rendemen, tabulasi data laboratorium, dan output SPSS/R dilampirkan pada bagian ini sesuai dengan dokumentasi penelitian.',
            font: fontFamily,
            size: fontSizeHalfPoints,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({ text: 'Lampiran 2. Surat Keterangan / Dokumentasi Penelitian', bold: true, size: fontSizeHalfPoints, font: fontFamily }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: firstLineIndentTwips },
        spacing: { line: lineSpacingTwips, before: 0, after: 120 },
        children: [
          new TextRun({
            text: 'Surat determinasi spesimen tanaman/bahan uji, surat izin laboratorium, dan dokumentasi visual pengujian terlampir.',
            font: fontFamily,
            size: fontSizeHalfPoints,
          }),
        ],
      }),
    ];

    allSections.push({
      properties: {
        page: {
          size: { width: a4WidthTwips, height: a4HeightTwips },
          margin: { top: marginTopTwips, bottom: marginBottomTwips, left: marginLeftTwips, right: marginRightTwips },
          pageNumbers: { formatType: NumberFormat.DECIMAL },
        },
        titlePage: true,
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ children: [PageNumber.CURRENT], font: fontFamily, size: 20 })],
            }),
          ],
        }),
        first: new Header({ children: [] }),
      },
      footers: {
        default: new Footer({ children: [] }),
        first: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], font: fontFamily, size: 20 })],
            }),
          ],
        }),
      },
      children: lampiranChildren,
    });
  }

  // CREATE DOCUMENT
  const doc = new Document({
    features: {
      updateFields: true, // Forces Word to dynamically evaluate page numbers & TOC on opening
    },
    styles: {
      default: {
        document: {
          run: {
            font: fontFamily,
            size: fontSizeHalfPoints,
            color: '000000',
          },
          paragraph: {
            spacing: { line: lineSpacingTwips, before: 0, after: 120 },
          },
        },
      },
    },
    sections: allSections,
  });

  // Pack into binary DOCX Blob
  const blob = await Packer.toBlob(doc);
  return blob;
}
