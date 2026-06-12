# PRD — Belajar Bareng Roselini (BBR) Platform

---

## 1. Overview

BBR (Belajar Bareng Roselini) adalah **platform digital all-in-one** untuk mahasiswa tingkat akhir Indonesia yang membutuhkan bantuan menyusun skripsi, tesis, atau disertasi. Dibuat oleh Kak Roselini — lulusan S3, mantan dosen aktif — yang ingin memperluas jangkauan bantuannya di luar keterbatasan waktu bimbingan personal.

**Filosofi platform:** _bukan joki, tapi partner belajar_. Setiap fitur dirancang agar mahasiswa **memahami prosesnya**, bukan sekadar mendapat output jadi.

### Value Proposition
- **Satu login, semua tools** — tidak perlu langganan banyak platform
- **Beli sekali, pakai selamanya** — bukan subscription bulanan
- **AI terintegrasi tanpa biaya tambahan** — zero-cost AI via prompt URL injection
- **Dibuat oleh praktisi nyata** — bukan template generic

---

## 2. Feature Audit

### 2.1 Fitur dari Prototype yang DIPERTAHANKAN ✅

| Fitur | Alasan dipertahankan |
|---|---|
| Dashboard + Progress Tracker | Core UX, mahasiswa butuh overview |
| Judul Checker | High-value, disebutkan di transkrip |
| Anti-Revisi Kit (Checklist) | Kebutuhan nyata pre-submit |
| Kompas Statistik | Disebutkan eksplisit di transkrip |
| Template Output SPSS/PLS-SEM | SPSS disebut sebagai fitur premium (700rb/sesi) |
| Persona Dosen Penguji | Flagship fitur, sangat distinctive |
| Sidang Simulator | Upgrade ke zero-cost AI launch system |
| Arena Sidang | Nilai tinggi, arsip pertanyaan sidang nyata |
| Script WA Dosen | Quick-win fitur, rendah effort tinggi value |

### 2.2 Fitur BARU dari Transkrip yang DITAMBAHKAN 🆕

| Fitur | Sumber | Keterangan |
|---|---|---|
| **Bibliometrik Generator** | Transkrip (disebutkan 3x) | Output berupa gambar visual peta literatur, bukan teks |
| **Parafrase Tool** | Transkrip (Kak Ros minta eksplisit) | Input teks → parafrase akademik via AI |
| **Onboarding System** | Transkrip + UX requirement | Data profil wajib lengkap sebelum akses platform |
| **Session Tracker (Bimbingan)** | Transkrip (sistem bundling) | Tracking sisa sesi bimbingan per user per paket |
| **Afiliasi / Referral** | Transkrip (komisi 30%→50%) | Link referral unik, split komisi via Lynk.id |

---

## 3. Final Feature List

### Auth & Onboarding
- `F01` Google OAuth login (NextAuth.js)
- `F02` **Onboarding Flow** — wajib dilengkapi sebelum akses dashboard *(detail di Bagian 6)*
- `F03` Profil user — tersimpan dari data onboarding

### Dashboard
- `F04` Dashboard overview (fitur aktif, progress bab, sesi tersisa, judul skripsi)
- `F05` Progress tracker per bab (Bab 1–5, manual update oleh user)
- `F06` CTA kontekstual — "Temukan Judul" (jika user belum punya judul saat onboarding)

### Sebelum Mulai
- `F07` **Judul Checker** — analisis kelayakan judul via AI (zero-cost)
- `F08` **Bibliometrik Generator** 🆕 — output berupa gambar visual peta literatur *(2-phase flow, detail di Bagian 7.1)*

### Penulisan
- `F09` **Anti-Revisi Kit** — checklist interaktif per bab, progress tersimpan per user
- `F10` **Parafrase Tool** 🆕 — input paragraf + gaya bahasa → generate prompt parafrase, launch ke AI

### Data & Statistik
- `F11` **Kompas Statistik** *(rename dari Uji Apa?)* — decision tree 3-step → rekomendasi uji statistik
- `F12` **Template Output SPSS/PLS-SEM** — input angka key output → generate kalimat interpretasi via AI

### Persiapan Sidang
- `F13` **Persona Dosen Penguji** — 8 kartu persona, sinyal pengenal, taktik, tombol simulasi
- `F14` **Sidang Simulator** — pilih persona + inject konteks skripsi user → launch ke AI
- `F15` **Arsenal Sidang** *(rename dari Bank Soal)* — 200+ pertanyaan sidang per jurusan/bab/difficulty

### Soft Skills
- `F16` **Script WA Dosen** — 6+ template pesan siap pakai, tombol salin

### Bimbingan (Summit Only)
- `F17` **Session Tracker** 🆕 — tampilkan sisa sesi bimbingan, histori sesi, jadwal berikutnya

### Monetisasi
- `F18` **Pricing Page** — 3 tier paket dengan tabel perbandingan fitur
- `F19` **Gated Content** — fitur dikunci berdasarkan tier user
- `F20` **Afiliasi Dashboard** 🆕 — referral link unik, tracking konversi, saldo komisi

---

## 4. Tech Stack

### Frontend
```
Framework    : Next.js 15 (App Router)
Language     : TypeScript
Styling      : Tailwind CSS v4
UI Components: shadcn/ui
Icons        : Lucide React
State        : Zustand (client) + TanStack Query (server)
Forms        : React Hook Form + Zod
Visualisasi  : D3.js (untuk render bibliometrik network diagram)
Typography   : Playfair Display (display/heading) + Plus Jakarta Sans (body/UI)
Fonts source : Google Fonts via next/font/google
```

### Backend
```
Runtime      : Next.js Route Handlers
Auth         : NextAuth.js v5 (Google Provider)
ORM          : Prisma
Database     : Supabase PostgreSQL
```

### Integrasi Eksternal
```
Payment      : Lynk.id (checkout link + webhook)
AI           : Zero-cost URL injection (Claude / ChatGPT / Perplexity)
```

### Deployment
```
Hosting      : Vercel
```

---

## 5. Design System

### 5.1 Prinsip Desain

Platform BBR ditujukan untuk mahasiswa Indonesia yang sedang dalam tekanan deadline tugas akhir. Desain harus terasa **tenang dan dapat dipercaya** — seperti catatan pinggir dari seorang senior yang sudah melewati fase yang sama. Warm, akademik, tanpa kegaduhan visual.

**Filosofi visual:** _Kertas tua yang dipenuhi catatan bermakna_ — palette parchment yang hangat dengan aksen krimson, seperti tanda tangan dosen di lembar revisi.

**Prinsip utama:**
- **Mobile-first** — Base design 375px, semua keputusan layout dimulai dari mobile
- **Warm & trusted** — Tidak ada warna dingin (biru/hijau tech-startup); semua warm tone
- **Readable above all** — Kontras teks selalu memenuhi WCAG AA minimum
- **Touch-friendly** — Semua interactive element min 44×44px touch target

---

### 5.2 Color Palette

#### Brand & Primary

| Token | Hex | Penggunaan |
|---|---|---|
| `--brand-600` | `#7B2020` | CTA button, active nav, links, icon aksen |
| `--brand-500` | `#9B3535` | Hover state tombol brand |
| `--brand-400` | `#B85A5A` | Secondary brand, disabled border |
| `--brand-100` | `#F7EDED` | Tinted surface untuk card highlights |
| `--brand-50`  | `#FDF5F5` | Very light brand wash (badge bg, tag) |

#### Background (dari palette utama)

| Token | Hex | Penggunaan |
|---|---|---|
| `--bg-base`    | `#FBF7F0` | Background halaman utama |
| `--bg-surface` | `#F5EFE3` | Background card, sidebar, panel |
| `--bg-muted`   | `#E8DDD4` | Divider, border, input background, skeleton |

#### Text

| Token | Hex | Penggunaan |
|---|---|---|
| `--text-primary`   | `#1C0A0A` | Heading, judul, teks penting |
| `--text-body`      | `#3D2222` | Body copy, label form |
| `--text-secondary` | `#7A5F5F` | Caption, placeholder, help text |
| `--text-disabled`  | `#B8A8A8` | Disabled state |
| `--text-on-brand`  | `#FFFFFF` | Teks di atas background `--brand-600` |

#### Utility

| Token | Hex | Penggunaan |
|---|---|---|
| `--success` | `#2D6A4F` | Feedback sukses |
| `--warning` | `#B45309` | Peringatan |
| `--error`   | `#991B1B` | Error (intentionally close to brand) |

#### Tailwind CSS Custom Tokens (tailwind.config.ts)

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      brand: {
        50:  '#FDF5F5',
        100: '#F7EDED',
        400: '#B85A5A',
        500: '#9B3535',
        600: '#7B2020',
      },
      bg: {
        base:    '#FBF7F0',
        surface: '#F5EFE3',
        muted:   '#E8DDD4',
      },
      text: {
        primary:   '#1C0A0A',
        body:      '#3D2222',
        secondary: '#7A5F5F',
        disabled:  '#B8A8A8',
      },
    },
  },
},
```

#### CSS Variables (globals.css)

```css
:root {
  /* Brand */
  --brand-600: #7B2020;
  --brand-500: #9B3535;
  --brand-400: #B85A5A;
  --brand-100: #F7EDED;
  --brand-50:  #FDF5F5;

  /* Background */
  --bg-base:    #FBF7F0;
  --bg-surface: #F5EFE3;
  --bg-muted:   #E8DDD4;

  /* Text */
  --text-primary:   #1C0A0A;
  --text-body:      #3D2222;
  --text-secondary: #7A5F5F;
  --text-disabled:  #B8A8A8;
  --text-on-brand:  #FFFFFF;

  /* Utility */
  --success: #2D6A4F;
  --warning: #B45309;
  --error:   #991B1B;
}
```

---

### 5.3 Typography

#### Font Pairing

| Role | Font | Weight | Penggunaan |
|---|---|---|---|
| **Display** | Playfair Display | 700, 900 | Hero headline, nama fitur, section title besar |
| **Heading** | Plus Jakarta Sans | 600, 700 | Subheading, card title, nav label |
| **Body** | Plus Jakarta Sans | 400, 500 | Body copy, form label, deskripsi |
| **Mono** | JetBrains Mono | 400 | Preview prompt, contoh teks parafrase, nilai statistik |

> **Alasan pairing:** Playfair Display membawa otoritas akademik yang elegance (cocok untuk platform yang dibuat oleh lulusan S3). Plus Jakarta Sans sangat readable di ukuran kecil pada mobile screen. Keduanya tersedia gratis di Google Fonts.

#### Type Scale (Mobile-First)

| Token | Size (mobile) | Size (desktop) | Line Height | Penggunaan |
|---|---|---|---|---|
| `text-display` | 28px | 40px | 1.2 | Hero heading landing page |
| `text-h1` | 24px | 32px | 1.25 | Page title |
| `text-h2` | 20px | 24px | 1.3 | Section heading |
| `text-h3` | 16px | 18px | 1.4 | Card title, sub-section |
| `text-body` | 14px | 15px | 1.6 | Body copy |
| `text-sm` | 12px | 13px | 1.5 | Caption, badge, help text |
| `text-mono` | 13px | 13px | 1.5 | Prompt preview, code |

#### Font Load (next/font)

```typescript
// lib/fonts.ts
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import localFont from 'next/font/local';

export const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-display',
  display: 'swap',
});

export const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});
```

---

### 5.4 Spacing & Shape

#### Spacing Scale

Menggunakan 8px base unit. Semua spacing adalah kelipatan 4px.

```
4px   → gap kecil antar elemen inline
8px   → padding dalam badge, tag
12px  → gap antar item list kecil
16px  → padding card (mobile), gap antar section kecil
20px  → padding horizontal halaman (mobile)
24px  → gap section, padding card (desktop)
32px  → margin antar section
48px  → spacing besar antar block halaman
```

#### Border Radius

| Token | Value | Penggunaan |
|---|---|---|
| `rounded-sm` | 4px | Badge, tag, input kecil |
| `rounded` | 8px | Tombol, input field |
| `rounded-lg` | 12px | Card kecil |
| `rounded-xl` | 16px | Card utama, modal |
| `rounded-2xl` | 20px | Bottom sheet, overlay besar |
| `rounded-full` | 9999px | Avatar, chip, progress pill |

#### Shadow

```css
--shadow-card: 0 1px 3px rgba(28, 10, 10, 0.06), 0 1px 2px rgba(28, 10, 10, 0.04);
--shadow-modal: 0 20px 60px rgba(28, 10, 10, 0.15), 0 8px 24px rgba(28, 10, 10, 0.08);
--shadow-bottom-nav: 0 -1px 0 #E8DDD4, 0 -4px 16px rgba(28, 10, 10, 0.04);
```

---

### 5.5 Mobile-First Layout

#### Breakpoints

```typescript
// tailwind.config.ts
screens: {
  sm:  '375px',   // Mobile base (default)
  md:  '768px',   // Tablet
  lg:  '1024px',  // Small desktop
  xl:  '1280px',  // Desktop
}
```

> **Base design = 375px.** Semua komponen ditulis mobile-first, lalu di-override via `md:` dan `lg:` prefix.

#### Grid System

```
Mobile  (< 768px) : 1 kolom, padding horizontal 20px, max-width 100%
Tablet  (≥ 768px) : 2 kolom, padding horizontal 32px
Desktop (≥ 1280px): Sidebar fixed 240px + main area flex-1
```

---

### 5.6 Navigation — Mobile vs Desktop

#### Mobile: Bottom Tab Bar

Muncul di semua halaman dashboard pada viewport `< 768px`. Posisi `fixed bottom-0`.

```
┌─────────────────────────────────────────┐
│  Beranda  │  Tools  │  Sidang  │  Profil │
│    🏠     │   🔧    │   🎓    │   👤    │
└─────────────────────────────────────────┘
```

| Tab | Icon | Route |
|---|---|---|
| Beranda | Home | `/dashboard` |
| Tools | Wrench | `/dashboard/tools` (hub tools: Judul Checker, Bibliometrik, Parafrase, dsb) |
| Sidang | GraduationCap | `/dashboard/sidang` (hub: Persona Dosen, Sidang Simulator, Arsenal Sidang) |
| Profil | User | `/dashboard/profil` (profil, afiliasi, bimbingan, pricing) |

**Spesifikasi Bottom Tab Bar:**
- Background: `--bg-surface` (`#F5EFE3`)
- Border top: `1px solid --bg-muted` (`#E8DDD4`)
- Tab aktif: icon + label berwarna `--brand-600`, label size 11px
- Tab nonaktif: icon + label berwarna `--text-secondary`, label size 11px
- Tab height: 60px (safe area aware, tambahkan `pb-[env(safe-area-inset-bottom)]`)
- Touch target: min 44px

#### Tablet (768px–1023px): Collapsible Sidebar

Sidebar dapat dikollaps menjadi icon-only (64px wide) atau expand penuh (240px). Toggle via hamburger button di topbar.

#### Desktop (≥ 1024px): Fixed Sidebar

```
┌──────────────┬───────────────────────────────┐
│              │  Header                        │
│   Sidebar    ├───────────────────────────────┤
│   240px      │                               │
│   fixed      │  Main Content Area            │
│              │  max-w: 800px, centered        │
│              │                               │
└──────────────┴───────────────────────────────┘
```

**Sidebar (desktop) contents:**
- Brand logo + nama platform (top)
- Avatar + nama user (bawah logo)
- Navigation links dengan active state (maroon left-border 3px)
- Sisa sesi bimbingan (jika Summit tier) — mini widget di bawah nav
- Logout (paling bawah)

---

### 5.7 Component Specifications

#### Button

```
Variant: Primary
  - Background   : --brand-600 (#7B2020)
  - Text         : #FFFFFF
  - Hover bg     : --brand-500 (#9B3535)
  - Height mobile: 48px
  - Height desktop: 44px
  - Width mobile : 100% (full-width default)
  - Width desktop: auto (fit content)
  - Border radius: 8px
  - Font         : Plus Jakarta Sans 600 14px

Variant: Secondary (outlined)
  - Background   : transparent
  - Border       : 1.5px solid --brand-600
  - Text         : --brand-600
  - Hover bg     : --brand-50

Variant: Ghost
  - Background   : transparent
  - Text         : --brand-600
  - Hover bg     : --brand-100

Variant: Muted
  - Background   : --bg-muted (#E8DDD4)
  - Text         : --text-body
  - Hover bg     : darken 5%
```

#### Card

```
Background    : --bg-surface (#F5EFE3)
Border        : 1px solid --bg-muted (#E8DDD4)
Border radius : 16px (mobile) / 16px (desktop)
Padding       : 16px (mobile) / 20px (desktop)
Shadow        : --shadow-card
Hover         : shadow-md, border-color --brand-400

Varian locked (gated feature):
  - Opacity     : 0.6
  - Overlay     : blur(2px) pada konten
  - Badge       : "🔒 Upgrade" di sudut kanan atas
  - Background  : --bg-muted
```

#### Feature Card (di halaman Tools hub)

```
Layout    : 2 kolom grid (mobile) → 3 kolom (desktop)
Height    : auto (min 120px mobile)
Struktur  :
  ┌──────────────────┐
  │  [Icon 24px]     │
  │  Nama Fitur      │  ← Plus Jakarta Sans 600
  │  Deskripsi 1brs  │  ← Plus Jakarta Sans 400 12px text-secondary
  │  [Status badge]  │  ← "Tersedia" / "🔒 Upgrade"
  └──────────────────┘
Active card: left border 3px solid --brand-600
```

#### Form Input

```
Background    : #FFFFFF (bukan --bg-surface agar kontrast jelas)
Border        : 1.5px solid --bg-muted
Border focus  : 1.5px solid --brand-600
Border radius : 8px
Padding       : 12px 16px
Font          : Plus Jakarta Sans 400 14px
Label         : Plus Jakarta Sans 600 13px --text-body
Placeholder   : --text-secondary
Error         : border --error, helper text --error 12px
Height        : 48px (single line), auto (textarea)
```

#### Badge / Chip

```
Tier badge:
  - Spark  : bg --brand-50, text --brand-600, border --brand-100
  - Drive  : bg #FFF3E0, text #B45309, border #FFE0B2
  - Summit : bg #F3E8FF, text #7C3AED, border #DDD6FE

Status badge:
  - Locked : bg --bg-muted, text --text-secondary
  - New    : bg --brand-600, text white
  - Beta   : bg --warning/10, text --warning
```

#### Modal / Bottom Sheet

```
Mobile:
  - Menggunakan Bottom Sheet (slide up dari bawah)
  - Max height: 90vh
  - Border radius top: 20px
  - Handle bar: 4px × 32px rounded, --bg-muted, centered top
  - Background: #FFFFFF
  - Backdrop: rgba(28,10,10,0.4) blur(4px)

Desktop:
  - Menggunakan centered modal
  - Max width: 560px
  - Border radius: 16px
  - Background: #FFFFFF
```

#### AI Launch Button (Komponen Khusus)

```
Trigger button:
  - Variant: Primary
  - Label: "Buka di AI →"
  - Full width (mobile)

Modal preview prompt:
  - Title: "Preview Prompt"
  - Prompt area: --bg-surface background, font mono 13px, max-h 240px overflow scroll
  - Separator line
  - 3 platform buttons (horizontal scroll mobile, flex row desktop):
    ┌──────────┐ ┌───────────┐ ┌────────────┐
    │  Claude  │ │  ChatGPT  │ │ Perplexity │
    │ ⭐ Rekom │ │           │ │            │
    └──────────┘ └───────────┘ └────────────┘
  - Platform rekomendasi: ada badge "Rekomendasi", border --brand-600
  - Tombol "Salin Prompt" (ghost, bottom)
```

#### Progress Bar (bab progress)

```
Track       : --bg-muted, height 6px, rounded-full
Fill        : --brand-600
Label above : "Bab 1" (Plus Jakarta Sans 600 12px)
Percentage  : right-aligned (Plus Jakarta Sans 500 12px --text-secondary)
```

#### Bottom Navigation Bar (Mobile)

```
Height         : 60px + safe-area-inset-bottom
Background     : --bg-surface (#F5EFE3)
Border top     : 1px solid --bg-muted
Active tab     : icon --brand-600, label --brand-600, font-weight 600
Inactive tab   : icon --text-secondary, label --text-secondary, font-weight 400
Active indicator: dot kecil 4px di bawah icon, bg --brand-600
Label font     : Plus Jakarta Sans 400/600 11px
```

---

### 5.8 Page-Specific Design Notes

#### Landing Page (`/`)
- Hero: Background `--bg-base`, headline **Playfair Display 900** 28px/40px, warna `--brand-600`
- Sub-headline: Plus Jakarta Sans 400 16px `--text-body`
- Hero CTA: Primary button full-width (mobile) / 200px (desktop)
- Social proof: foto testimonial + kutipan singkat, layout horizontal scroll (mobile)
- Pricing: Card per tier, tier Summit dengan border `--brand-600` 2px dan badge "Terlaris"
- Signature element: **Thin maroon left-border (3px, `--brand-600`)** pada setiap feature highlight card — seperti tanda garis merah di pinggir catatan tesis

#### Dashboard (`/dashboard`)
- Header: Greeting "Halo, [Nama]!" Playfair Display 700
- Progress section: Card berisi 5 progress bar bab, background `--bg-surface`
- Judul skripsi: ditampilkan dalam italic Playfair Display di bawah greeting
- CTA "Temukan Judul" (jika belum ada judul): Full-width card dengan icon + tombol brand

#### Onboarding (`/onboarding`)
- Background: `--bg-base`
- Progress indicator: Step dots horizontal (4 dots), aktif = `--brand-600`, nonaktif = `--bg-muted`
- Form dalam card putih, shadow `--shadow-card`
- Step title: Playfair Display 700 24px
- Navigation: "Lanjut →" tombol primary kanan bawah, "← Kembali" ghost kiri bawah

#### Fitur Pages (Tools hub)
- Page header: Playfair Display 700 untuk nama fitur, Plus Jakarta Sans 400 untuk deskripsi singkat
- Input area: Card `--bg-surface` padding 20px
- Output/prompt preview: Card `--bg-base` dengan border `--brand-100`, font mono
- Sticky bottom (mobile): AI Launch Button `fixed bottom-16 left-4 right-4` (di atas bottom tab bar)

#### Arsenal Sidang (Bank Soal)
- Filter chips horizontal scroll: `--bg-muted` background, aktif = `--brand-600` text + bg `--brand-100`
- Kartu soal: collapsible, judul `--text-primary`, bawah ada tombol "Latih dengan AI" ghost
- Difficulty badge: Ringan (green) / Sedang (amber) / Berat (red brand)

---

### 5.9 Aksesibilitas & Motion

```
Kontras minimum  : WCAG AA (4.5:1 untuk body text, 3:1 untuk large text)
Focus indicator  : outline 2px --brand-600 offset 2px — tidak dihapus
Touch target min : 44 × 44px untuk semua interactive element
Reduced motion   : @media (prefers-reduced-motion) → disable semua transisi
Font size min    : 12px (tidak ada teks di bawah 12px)
```

---

## 6. Alur Utama (User Flow)

### 5.1 Pembelian → Akses Platform

```
Landing page → Pilih paket → Klik "Beli Sekarang"
       ↓
Redirect ke Lynk.id checkout → User bayar
       ↓
Lynk.id kirim webhook → POST /api/webhooks/lynkid
       ↓
Route Handler verifikasi signature Lynk.id
       ↓
Trigger n8n workflow via HTTP Request
       ↓
n8n: INSERT ke tabel users (email, nama, tier, paid_at, expired_at)
       ↓
n8n: Kirim email konfirmasi + instruksi login via Resend
       ↓
User klik link login → Google OAuth
       ↓
NextAuth cek email di tabel users
  ├─ Ada & payment valid → buat session → redirect /onboarding
  └─ Tidak ada          → tampilkan error "Akun belum terverifikasi"
```

### 5.2 Onboarding → Dashboard

```
Session dibuat pertama kali → Middleware cek onboarding_completed
       ↓
onboarding_completed = false → Redirect /onboarding
       ↓
User isi form onboarding (WAJIB semua field)
       ↓
Step terakhir: Disclaimer → User klik "Saya Mengerti & Setuju"
       ↓
PATCH /api/user/onboarding → Simpan semua data + set onboarding_completed = true
       ↓
Redirect /dashboard
```

### 5.3 Login Berikutnya (Return User)

```
User login → Middleware cek:
  ├─ onboarding_completed = false → Redirect /onboarding (tetap wajib)
  └─ onboarding_completed = true  → Redirect /dashboard
```

---

## 7. Onboarding System (F02) — Spesifikasi Lengkap

### 6.1 Prinsip

Onboarding **wajib dan tidak bisa dilewati**. Jika user login dan `onboarding_completed = false`, middleware selalu redirect ke `/onboarding`. Data dari onboarding digunakan oleh hampir semua fitur (prompt, personalisasi, dashboard) sehingga platform tidak bisa berfungsi optimal tanpa data ini.

### 6.2 Struktur Step Onboarding

Onboarding terdiri dari **4 step** dalam satu halaman wizard dengan progress indicator.

---

#### STEP 1 — Profil Akademik

**Field yang dikumpulkan:**

| Field | Tipe | Opsi | Validasi |
|---|---|---|---|
| Nama lengkap | Text | — | Required, min 3 karakter |
| Universitas | Text | — | Required |
| Jenjang | Radio | S1 / S2 / S3 | Required |
| Jurusan / Program Studi | Text | — | Required |
| Semester saat ini | Select | 1 – 14+ | Required |

---

#### STEP 2 — Status Judul

**Field:** "Sudah punya judul skripsi/tesis/disertasi?"  
**Tipe:** Radio button → `Ya` / `Belum`

**Kondisi `Ya`:**
> Muncul input field:  
> **Label:** "Tulis judul kamu sekarang"  
> **Tipe:** Textarea  
> **Placeholder:** *"Contoh: Pengaruh Penggunaan Media Sosial terhadap Motivasi Belajar Mahasiswa Universitas X Tahun 2024"*  
> **Validasi:** Required jika pilih Ya, min 20 karakter

**Kondisi `Belum`:**
> Tampilkan info card:  
> *"Oke! Kamu bisa gunakan Judul Checker di dashboard untuk menemukan dan memvalidasi judul yang tepat."*  
> — Tidak ada field tambahan, user lanjut ke step berikutnya.  
> — Di dashboard, muncul **CTA card khusus**: "Belum punya judul? Temukan sekarang →" yang trigger popup Judul Finder.

**Popup Judul Finder (dipanggil dari dashboard CTA):**
Form modal dengan field:
- Bidang ilmu / jurusan (text)
- Jenis penelitian (radio: Kuantitatif / Kualitatif / Mixed Method)
- Topik atau isu yang diminati (textarea)
- Metode yang sudah dipelajari di kampus (opsional)

→ Compile prompt → Launch ke platform AI pilihan user

---

#### STEP 3 — Platform AI Pilihan

**Deskripsi:** BBR menggunakan AI untuk hampir semua fiturnya. Pilih platform yang sudah kamu punya akunnya.

**Field:** Radio button pilih satu:
- 🟣 **Claude** (Anthropic) — *Direkomendasikan: paling akurat untuk penulisan akademik*
- 🟢 **ChatGPT** (OpenAI) — *Paling populer dan mudah digunakan*
- 🔵 **Perplexity** — *Terbaik untuk riset dan cari referensi*

**Setelah memilih salah satu → Muncul Modal Alert:**

```
┌─────────────────────────────────────────────┐
│                                             │
│  ⚠️  Pastikan Kamu Sudah Login              │
│                                             │
│  Agar fitur BBR bisa langsung terbuka       │
│  dan berjalan, kamu perlu sudah login       │
│  di [Platform yang dipilih].               │
│                                             │
│  Sudah login di [Platform]?                │
│                                             │
│  [Belum, Login Dulu]  [Sudah Login ✓]      │
│                                             │
└─────────────────────────────────────────────┘
```

**Behavior tombol:**

| Tombol | Aksi |
|---|---|
| **Sudah Login ✓** | Tutup modal, lanjut ke Step 4 |
| **Belum, Login Dulu** | Buka tab baru ke halaman login platform AI → Tutup modal secara otomatis |

Referensi URL login per platform:
- Claude: `https://claude.ai/login`
- ChatGPT: `https://chat.openai.com/auth/login`
- Perplexity: `https://www.perplexity.ai/`

> **Catatan UX:** Modal ditutup otomatis setelah user klik **salah satu** tombol (baik "Sudah" maupun "Belum"). User tidak perlu konfirmasi ulang — assumsikan mereka sudah mengerti dan lanjut.

---

#### STEP 4 — Disclaimer & Persetujuan

**Judul:** *"Satu hal penting sebelum kamu mulai"*

**Konten disclaimer:**
> Platform BBR dibuat untuk **membantumu memahami dan mengerjakan** tugas akhir, bukan mengerjakannya untukmu.
>
> Semua output AI yang dihasilkan adalah **titik awal untuk dipelajari, dipahami, dan ditulis ulang** dengan bahasa dan pemahamanmu sendiri.
>
> Menggunakan output AI secara langsung tanpa pemahaman dan proses penulisan ulang adalah **pelanggaran integritas akademik** yang sepenuhnya menjadi tanggung jawabmu.
>
> Dengan melanjutkan, kamu menyatakan memahami dan menyetujui hal di atas.

**CTA:** Tombol `Saya Mengerti & Mulai Belajar →`

→ Klik tombol: PATCH `/api/user/onboarding` dengan semua data + `onboarding_completed: true` → Redirect `/dashboard`

---

### 6.3 Validasi & Re-trigger

- Semua field Step 1, 2, 3, 4 adalah **required** kecuali yang ditandai opsional.
- Jika API call gagal saat save, tampilkan error toast dan biarkan user coba lagi.
- Middleware mengecek `onboarding_completed` di setiap request ke route yang dilindungi. Jika `false`, **selalu redirect ke /onboarding tanpa exception**.

---

### 6.4 Data Onboarding di Database

Tambahan kolom ke tabel `users`:

```sql
-- Kolom tambahan untuk onboarding
nama_lengkap         TEXT,
universitas          TEXT,
jenjang              TEXT,           -- s1 | s2 | s3
jurusan              TEXT,
semester             INT,
punya_judul          BOOLEAN,
judul_skripsi        TEXT,           -- NULL jika belum punya judul
preferred_ai         TEXT,           -- claude | chatgpt | perplexity
onboarding_completed BOOLEAN DEFAULT false,
```

---

## 8. Feature Specifications Detail

### 7.1 Bibliometrik Generator (F08) — 2-Phase Visual Output

**Deskripsi:**  
Tool untuk memetakan landscape literatur dari topik penelitian. Output akhir berupa **gambar visual** berupa network diagram / peta bibliometrik yang bisa didownload sebagai PNG. Highly trending di kalangan mahasiswa S2/S3.

**Karena platform ini tidak memanggil API AI berbayar**, alur dibuat dalam 2 fase: AI menghasilkan data terstruktur (JSON), lalu BBR me-render data tersebut menjadi visual network diagram menggunakan D3.js.

---

#### Phase 1 — Generate Data dari AI

**Input form:**
| Field | Tipe | Keterangan |
|---|---|---|
| Topik penelitian | Text | Required |
| Kata kunci utama | Tag input | Min 3, maks 7 keyword |
| Bidang ilmu | Select | Sesuai jurusan user (pre-fill dari profil) |
| Jenjang | Auto-fill | Dari profil onboarding |

**Prompt yang dikompilasi:**

```
Return ONLY valid JSON. No explanation, no markdown, no code block. Pure JSON only.

Generate a bibliometric network map for academic research:
Topic: "{topik}"
Keywords: {keywords}
Field: {bidang_ilmu}
Level: {jenjang}

JSON schema to follow exactly:
{
  "title": "Judul peta bibliometrik",
  "clusters": [
    { "id": "c1", "label": "Nama Cluster", "color": "#hexcolor" }
  ],
  "nodes": [
    {
      "id": "n1",
      "label": "Nama Topik/Konsep",
      "cluster": "c1",
      "size": 3,
      "description": "Penjelasan singkat 1 kalimat"
    }
  ],
  "edges": [
    { "source": "n1", "target": "n2", "weight": 3 }
  ]
}

Rules:
- 4–6 clusters representing major research themes
- 18–25 nodes total, distributed across clusters
- node.size range: 1–5 (higher = more central/prominent topic)
- edge.weight range: 1–5 (higher = stronger connection)
- All labels in Bahasa Indonesia
- Colors: use distinct, academic-looking hex colors per cluster
```

**Platform AI:** Claude direkomendasikan (mengikuti instruksi JSON-only paling konsisten)

**Tombol launch:** `Buka di [Platform AI pilihan user]` → buka tab baru

---

#### Phase 2 — Render Visual dari JSON

Setelah AI menghasilkan JSON, user kembali ke BBR dan paste hasil AI ke textarea "Paste hasil AI".

**Render engine:** D3.js force-directed graph

**Spesifikasi visual:**
- Setiap cluster = warna berbeda (dari `cluster.color`)
- Node size = proporsional dengan `node.size`
- Edge thickness = proporsional dengan `edge.weight`
- Label tampil di dalam/bawah node
- Hover tooltip: tampilkan `node.description`
- Interaktif: zoom, pan, drag node
- Legend: list cluster + warna

**Tombol output:**
- `Download PNG` — canvas.toBlob() → download file
- `Reset` — hapus hasil, kembali ke Phase 1

**Error handling:**
- Jika JSON tidak valid saat di-parse: tampilkan toast error "JSON tidak valid. Pastikan kamu copy semua output dari AI, lalu coba lagi."
- Jika struktur JSON tidak sesuai schema: tampilkan pesan spesifik field mana yang bermasalah

---

### 7.2 Onboarding CTA — Judul Finder (F06)

Hanya muncul di dashboard jika `punya_judul = false`.

**CTA Card di dashboard:**
```
┌────────────────────────────────────────────┐
│  🎯  Kamu belum punya judul                │
│  Gunakan Judul Finder untuk menemukan      │
│  dan memvalidasi judul yang tepat.         │
│                                            │
│  [Temukan Judul Sekarang →]               │
└────────────────────────────────────────────┘
```

**Klik tombol → buka modal Judul Finder:**

Form fields:
- Bidang ilmu / jurusan (pre-fill dari profil)
- Jenis penelitian (radio: Kuantitatif / Kualitatif / Mixed Method)
- Topik atau isu yang diminati (textarea, required)
- Metode yang sudah dipelajari (text, opsional)

→ Compile prompt rekomendasi judul → Launch ke AI

Jika user berhasil menemukan judul dan ingin menyimpannya, tersedia tombol `Simpan Judul` yang update field `judul_skripsi` + set `punya_judul = true` → CTA card di dashboard hilang.

---

### 7.3 Judul Checker (F07)

**Input:**
- Judul skripsi (pre-fill dari profil jika `punya_judul = true`)
- Jurusan (pre-fill dari profil)
- Jenjang (pre-fill dari profil)
- Metode penelitian (radio: Kuantitatif / Kualitatif / Mixed Method)

**Prompt template:**
```
Kamu adalah konsultan metodologi skripsi Indonesia berpengalaman.
Analisis kelayakan judul berikut untuk skripsi {jenjang} jurusan {jurusan}:

JUDUL: "{judul}"
METODE: {metode}

Berikan analisis dalam format ini:

## SKOR KELAYAKAN: [0-100]/100

## KELEBIHAN
- [poin 1]
- [poin 2]
- [poin 3]

## PERLU DIPERBAIKI
- [poin 1 dengan penjelasan konkret]
- [poin 2 dengan penjelasan konkret]

## SARAN PERBAIKAN JUDUL
[1 alternatif judul yang lebih kuat dan spesifik]

## CATATAN UNTUK PEMBIMBING
[1 paragraf singkat untuk persiapan konsultasi]

Jawab dalam Bahasa Indonesia, nada profesional namun mudah dipahami mahasiswa.
```

---

### 7.4 Parafrase Tool (F10)

**Input:**
- Teks asli (textarea, max 800 kata)
- Gaya parafrase: `Akademik Formal` / `Akademik Semi-formal`
- Instruksi tambahan (opsional)

**Prompt template:**
```
Kamu adalah editor akademik Indonesia ahli parafrase ilmiah.

TEKS ASLI:
"{teks_asli}"

INSTRUKSI:
- Gaya: {gaya}
- Pertahankan makna dan data/angka dengan akurat
- Ubah struktur kalimat secara signifikan — bukan hanya sinonim
- Gunakan diksi yang lazim di penulisan akademik Indonesia
{instruksi_tambahan_jika_ada}

Berikan:
1. HASIL PARAFRASE
2. CATATAN: apa yang paling diubah strukturnya dan kenapa
```

---

### 7.5 Kompas Statistik (F11) — rename dari Uji Apa?

Fitur identik dengan prototype, dengan perubahan:
- Nama diubah dari "Uji Apa?" → **"Kompas Statistik"**
- Tagline: *"3 pertanyaan, 1 rekomendasi uji yang tepat"*
- Setelah mendapat rekomendasi, tombol "Minta penjelasan AI" me-launch prompt penjelasan uji tersebut ke platform AI user
- Terintegrasi dengan Template Output SPSS (F12): tombol "Buka template interpretasi →" langsung membawa rekomendasi uji ke F12

---

### 7.6 Arsenal Sidang (F15) — rename dari Bank Soal

Fitur identik dengan prototype, dengan perubahan:
- Nama diubah dari "Bank Soal" → **"Arsenal Sidang"**
- Tagline: *"200+ pertanyaan sidang nyata. Latih semuanya sebelum hari H."*
- Filter: per jurusan, per bab (1–5), per difficulty (Ringan / Sedang / Berat), per persona dosen
- Setiap soal ada tombol "Latih dengan AI" → launch ke platform AI untuk simulasi jawaban

---

### 7.7 Sidang Simulator (F14) — Upgraded

**Perbedaan utama dari prototype:**  
Di prototype, user hanya salin prompt generik. Di versi baru, BBR **otomatis menginjeksi konteks skripsi user** (judul, jurusan, jenjang) ke dalam prompt sehingga simulasi jauh lebih relevan dan personal.

**Alur:**
1. Pilih persona dosen (8 kartu — linked ke F13 Persona Dosen Penguji)
2. Pilih fokus bab untuk simulasi (Bab 1 / Bab 2 / Bab 3 / Bab 4 / Bab 5 / Keseluruhan)
3. Konfirmasi data konteks (pre-fill dari profil, bisa edit sementara):
   - Judul skripsi
   - Jurusan
   - Jenjang
4. Preview prompt yang telah dikompilasi (bisa scroll)
5. Pilih platform AI → `Mulai Simulasi Sidang →`

**Prompt template (Contoh: Si Metodologi Polisi + konteks user):**
```
{persona.prompt}

KONTEKS MAHASISWA YANG SEDANG DIUJI:
- Judul: "{judul_skripsi}"
- Jurusan: {jurusan}
- Jenjang: {jenjang}
- Fokus sidang: {fokus_bab}

Mulai sesi simulasi sidang sekarang berdasarkan judul dan jurusan mahasiswa di atas.
Ajukan pertanyaan pertama sesuai persona {persona.name} yang kamu mainkan.
```

---

## 9. AI Integration Architecture

### 8.1 Prinsip Zero-Cost

Platform BBR **tidak memanggil API AI berbayar**. Semua AI interaction terjadi di sisi user via browser tab baru. BBR berperan sebagai **prompt engineering layer**: merangkai konteks user + template → generate URL → buka tab.

### 8.2 Platform AI yang Didukung

| Platform | URL Pattern | Best For |
|---|---|---|
| Claude | `https://claude.ai/new?q={encoded}` | Penulisan akademik, parafrase, analisis |
| ChatGPT | `https://chatgpt.com/?prompt={encoded}` | General purpose, familiar |
| Perplexity | `https://perplexity.ai/?q={encoded}` | Riset, cari jurnal |

### 8.3 Rekomendasi Platform per Fitur

| Fitur | Platform Rekomendasi | Alasan |
|---|---|---|
| Bibliometrik Generator | Claude | Paling akurat menghasilkan JSON terstruktur |
| Judul Checker | Claude | Analisis nuanced, ikuti format output |
| Parafrase Tool | Claude | Terbaik untuk parafrase akademik Indonesia |
| Kompas Statistik (penjelasan) | Claude / ChatGPT | Keduanya cukup baik |
| Template Output SPSS | Claude | Format interpretasi konsisten |
| Sidang Simulator | Claude / ChatGPT | Role-play intensif |
| Arsenal Sidang (latih jawaban) | ChatGPT | Conversational, cepat |

### 8.4 Komponen `<AILaunchButton />`

Komponen reusable yang dipakai di semua fitur AI-enabled:

```tsx
interface AILaunchButtonProps {
  promptFn: () => string;            // Lazy evaluate saat tombol diklik
  feature: string;                   // Untuk analytics tracking
  label?: string;                    // Label tombol (default: "Buka di AI")
  recommendedPlatform?: 'claude' | 'chatgpt' | 'perplexity';
}

const AI_PLATFORMS = {
  claude:     (p: string) => `https://claude.ai/new?q=${encodeURIComponent(p)}`,
  chatgpt:    (p: string) => `https://chatgpt.com/?prompt=${encodeURIComponent(p)}`,
  perplexity: (p: string) => `https://perplexity.ai/?q=${encodeURIComponent(p)}`,
};
```

**UX Flow saat tombol diklik:**
1. Modal terbuka — tampilkan preview prompt (bisa scroll)
2. 3 tombol platform dengan platform rekomendasi di-highlight
3. Klik platform → `window.open(url, '_blank')` → modal tutup otomatis
4. Tombol "Salin Prompt" untuk paste manual jika URL terlalu panjang

**Constraint:** Panjang prompt di-cap maksimal **3000 karakter** untuk mencegah URL truncation di browser.

---

## 10. Payment & n8n Integration

### 9.1 Lynk.id Webhook Handler

**Endpoint:** `POST /api/webhooks/lynkid`

```typescript
// 1. Verifikasi HMAC signature dari header X-Lynkid-Signature
// 2. Parse payload: email, nama, product_id, amount, status, payment_ref
// 3. Jika status === 'paid':
//    a. Determine tier dari product_id mapping
//    b. POST ke n8n webhook URL dengan payload terstruktur
//    c. Log ke tabel webhook_logs
//    d. Return 200
// 4. Jika status !== 'paid': return 200 (acknowledge tapi tidak proses)
```

> **Penting:** Endpoint ini **tidak boleh** diproteksi oleh auth middleware.

### 9.2 n8n Workflow: "BBR — User Registration"

**Trigger:** Webhook (dipanggil dari Next.js)

**Nodes:**
1. **Webhook** — terima payload dari Next.js
2. **IF** — cek apakah email sudah ada di tabel users (query Postgres)
3. **Postgres: INSERT** — jika user baru: insert row baru
4. **Postgres: UPDATE** — jika user lama (upgrade): update `tier` + `expired_at`
5. **Function** — generate `affiliate_code` unik (format: `BBR-[6char]`)
6. **Postgres: UPDATE** — simpan `affiliate_code` ke user row
7. **HTTP Request** — panggil Resend API untuk kirim email konfirmasi
8. **Respond to Webhook** — return `{ success: true }`

**Idempotency:** Node IF mengecek `payment_ref`. Jika `payment_ref` sudah ada, skip INSERT/UPDATE dan return tanpa proses duplikat.

---

## 11. Database Schema Lengkap

### Tabel `users`

```sql
CREATE TABLE users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Auth
  email                 TEXT UNIQUE NOT NULL,
  google_id             TEXT,

  -- Profil Onboarding
  nama_lengkap          TEXT,
  universitas           TEXT,
  jenjang               TEXT,              -- s1 | s2 | s3
  jurusan               TEXT,
  semester              INT,
  punya_judul           BOOLEAN DEFAULT false,
  judul_skripsi         TEXT,              -- NULL jika belum
  preferred_ai          TEXT,              -- claude | chatgpt | perplexity
  onboarding_completed  BOOLEAN DEFAULT false,

  -- Payment & Tier
  tier                  TEXT NOT NULL DEFAULT 'spark',  -- spark | drive | summit
  payment_ref           TEXT,
  paid_at               TIMESTAMPTZ,
  expired_at            TIMESTAMPTZ,      -- NULL = lifetime

  -- Bimbingan (Summit)
  sessions_total        INT DEFAULT 0,
  sessions_used         INT DEFAULT 0,

  -- Afiliasi
  affiliate_code        TEXT UNIQUE,
  referred_by           TEXT,             -- affiliate_code dari referrer

  -- Timestamps
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);
```

### Tabel `checklist_progress`

```sql
CREATE TABLE checklist_progress (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  bab         INT NOT NULL,               -- 1–5
  item_id     TEXT NOT NULL,
  checked     BOOLEAN DEFAULT false,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, bab, item_id)
);
```

### Tabel `bab_progress`

```sql
CREATE TABLE bab_progress (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  bab         INT NOT NULL,               -- 1–5
  percentage  INT DEFAULT 0,              -- 0–100
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, bab)
);
```

### Tabel `commissions`

```sql
CREATE TABLE commissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_code  TEXT NOT NULL,
  buyer_email     TEXT NOT NULL,
  product_tier    TEXT NOT NULL,
  amount          NUMERIC,
  commission      NUMERIC,
  rate            NUMERIC,               -- 0.30 atau 0.50
  status          TEXT DEFAULT 'pending', -- pending | paid
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### Tabel `webhook_logs`

```sql
CREATE TABLE webhook_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source      TEXT,                       -- lynkid
  payload     JSONB,
  status      TEXT,
  processed   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

---

## 12. Gated Content — Akses per Tier

| Fitur | Spark | Drive | Summit |
|---|---|---|---|
| Dashboard + Progress | ✅ | ✅ | ✅ |
| Judul Checker | ✅ | ✅ | ✅ |
| Script WA Dosen | ✅ | ✅ | ✅ |
| Anti-Revisi Kit | ✅ | ✅ | ✅ |
| Kompas Statistik | ❌ | ✅ | ✅ |
| Template Output SPSS | ❌ | ✅ | ✅ |
| Parafrase Tool | ❌ | ✅ | ✅ |
| Bibliometrik Generator | ❌ | ✅ | ✅ |
| Persona Dosen | ❌ | ✅ | ✅ |
| Sidang Simulator | ❌ | ✅ | ✅ |
| Arsenal Sidang | ❌ | ❌ | ✅ |
| Session Tracker (Bimbingan) | ❌ | ❌ | ✅ |
| Afiliasi Dashboard | ✅ | ✅ | ✅ |

> **Catatan harga:** Final pricing ditentukan Kak Ros. Estimasi: Spark Rp 50–100rb, Drive Rp 150–200rb, Summit Rp 250–300rb (bundling bimbingan).

---

## 13. Sistem Afiliasi

### Mekanisme
1. Setiap user yang sudah beli **otomatis mendapat kode afiliasi unik** (format: `BBR-XXXXXX`)
2. Link afiliasi: `https://bbr.id/?ref=BBR-XXXXXX`
3. Saat ada pembelian dari link tersebut, `referred_by` diisi kode afiliasi referrer
4. Komisi dicatat di tabel `commissions`
5. Rate: **30%** untuk konversi 1–99, **50%** untuk konversi ke-100 dan seterusnya
6. Pencairan manual oleh admin (Kak Ros) via Lynk.id ke rekening affiliator

### Halaman Afiliasi (F20)
- Tampilkan link afiliasi + tombol salin
- Statistik: total klik, total konversi, total komisi pending, total komisi dibayar
- Tabel riwayat konversi (tanggal, tier produk, komisi)

---

## 14. Middleware Logic

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getSession(request);
  const { pathname } = request.nextUrl;

  // Public routes: skip semua cek
  if (isPublicRoute(pathname)) return NextResponse.next();

  // 1. Auth check
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Onboarding check — WAJIB, tidak ada exception untuk route manapun
  if (!session.user.onboarding_completed && pathname !== '/onboarding') {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // 3. Tier/gated content check
  const requiredTier = getRequiredTier(pathname);
  if (requiredTier && !hasTierAccess(session.user.tier, requiredTier)) {
    return NextResponse.redirect(new URL('/pricing?upgrade=true', request.url));
  }

  return NextResponse.next();
}
```

---

## 15. Struktur Proyek Next.js 15

```
bbr-platform/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # Landing page
│   │   └── pricing/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── onboarding/page.tsx         # Multi-step wizard
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # Sidebar + topbar
│   │   ├── dashboard/page.tsx
│   │   ├── judul-checker/page.tsx
│   │   ├── bibliometrik/page.tsx       # 2-phase: input + render
│   │   ├── anti-revisi/page.tsx
│   │   ├── parafrase/page.tsx
│   │   ├── kompas-statistik/page.tsx
│   │   ├── template-output/page.tsx
│   │   ├── persona-dosen/page.tsx
│   │   ├── sidang-simulator/page.tsx
│   │   ├── arsenal-sidang/page.tsx
│   │   ├── script-wa/page.tsx
│   │   ├── bimbingan/page.tsx          # Session tracker (Summit)
│   │   └── afiliasi/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── webhooks/lynkid/route.ts
│       ├── user/
│       │   ├── onboarding/route.ts     # PATCH — simpan data onboarding
│       │   ├── profile/route.ts
│       │   ├── progress/route.ts
│       │   └── checklist/route.ts
│       └── afiliasi/
│           └── stats/route.ts
├── components/
│   ├── ui/                             # shadcn/ui
│   ├── AILaunchButton.tsx              # Universal AI launcher
│   ├── PromptPreviewModal.tsx          # Preview prompt sebelum launch
│   ├── GatedFeature.tsx               # Wrapper konten terkunci
│   ├── BiblioRenderer.tsx             # D3.js bibliometrik renderer
│   ├── OnboardingWizard.tsx           # Multi-step form
│   ├── AIPlatformAlert.tsx            # Modal reminder login AI
│   └── Sidebar.tsx
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── tier.ts
│   ├── ai-launcher.ts
│   └── prompts/
│       ├── judul-checker.ts
│       ├── bibliometrik.ts
│       ├── parafrase.ts
│       ├── kompas-statistik.ts
│       ├── template-output.ts
│       ├── sidang-simulator.ts
│       └── judul-finder.ts
├── prisma/
│   └── schema.prisma
└── middleware.ts
```

---

## 16. Estimasi Scope & Prioritas

### Phase 1 — MVP (4–6 minggu)
*Target: Platform bisa dibeli, onboarding, dan akses fitur core.*

- [ ] Google OAuth + NextAuth
- [ ] Onboarding wizard (4 step, semua validasi)
- [ ] Lynk.id webhook → n8n integration
- [ ] Dashboard + Progress tracker + CTA judul finder
- [ ] Judul Checker
- [ ] Anti-Revisi Kit (save progress)
- [ ] Persona Dosen Penguji
- [ ] Sidang Simulator (upgraded dengan konteks user)
- [ ] Script WA Dosen
- [ ] Pricing page + Gated content

### Phase 2 — Feature Complete (2–3 minggu setelah MVP)
*Target: Semua fitur core berjalan.*

- [ ] Bibliometrik Generator (Phase 1: generate JSON + Phase 2: render D3)
- [ ] Parafrase Tool
- [ ] Kompas Statistik + Template Output SPSS
- [ ] Arsenal Sidang
- [ ] Session Tracker (bimbingan)
- [ ] Afiliasi dashboard

### Phase 3 — Growth (Ongoing)
- [ ] Admin panel: update sesi bimbingan, lihat daftar user, proses komisi
- [ ] Email automation: reminder sesi, sesi hampir habis
- [ ] Analytics: fitur paling sering dipakai, drop-off onboarding
- [ ] Mobile responsive optimization

---

## 17. Catatan Penting Developer

### Onboarding
- Halaman `/onboarding` tidak perlu tier check, hanya perlu auth check.
- `onboarding_completed` hanya bisa di-set `true` via endpoint `/api/user/onboarding` setelah **semua field tervalidasi** di server-side.
- Jangan percaya validasi client-side saja untuk flag ini.

### Bibliometrik JSON Parsing
- AI tidak selalu mengembalikan pure JSON. Tambahkan fallback: coba strip markdown code fence (` ```json ... ``` `) sebelum parse.
- Jika parse tetap gagal, tampilkan pesan yang memandu user menyalin ulang output dari AI.
- Validasi schema JSON sebelum di-render ke D3 untuk mencegah runtime error.

### Lynk.id Webhook
- Endpoint tidak diproteksi auth, tapi **wajib** verifikasi HMAC signature.
- Simpan semua payload ke `webhook_logs` sebelum proses apapun — untuk debugging.
- Handle idempotency: cek `payment_ref` sebelum insert user baru.

### n8n
- Workflow harus idempotent: dua webhook dengan payment_ref sama tidak boleh buat user duplikat.
- Gunakan Postgres node (bukan HTTP Request ke Supabase REST) untuk reliability lebih tinggi.
- Set timeout webhook di n8n minimal 30 detik.

### Prompt Length
- Cap semua prompt di **3000 karakter** sebelum URL encode.
- Jika user input terlalu panjang (terutama Parafrase Tool), potong dan tampilkan warning.

---

*End of PRD v2.0*
