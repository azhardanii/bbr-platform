import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';
import ScrollToTop from "@/components/ScrollToTop";
import AuthProvider from "@/components/providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#DC2626",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://belajarbarengroselini.site"),
  title: {
    default: "Belajar Bareng Roselini | Platform AI Skripsi & Riset Akademik #1 di Indonesia",
    template: "%s | Belajar Bareng Roselini",
  },
  description:
    "Solusi cerdas mahasiswa akhir menyelesaikan tugas akhir & skripsi lebih cepat. Dilengkapi 8 tools AI canggih: Parafrase Anti-Turnitin 6 Gaya, Simulator Sidang AI interaktif, Olah Data SPSS Bab 4, Judul Finder, dan Sitasi Jurnal APA 7th otomatis.",
  keywords: [
    "Belajar Bareng Roselini",
    "BBR",
    "BBR Platform",
    "AI Skripsi",
    "Asisten Skripsi",
    "Parafrase AI",
    "Parafrase Anti Turnitin",
    "Judul Skripsi",
    "Judul Finder",
    "Simulator Sidang Skripsi",
    "Olah Data SPSS",
    "SmartPLS Interpreter",
    "Klinik Naskah Skripsi",
    "Sitasi Jurnal Otomatis",
    "Script WA Dosen",
    "Bimbingan Skripsi AI",
    "Tugas Akhir Mahasiswa",
    "Tesis dan Disertasi",
  ],
  applicationName: "Belajar Bareng Roselini",
  authors: [{ name: "Belajar Bareng Roselini", url: "https://belajarbarengroselini.site" }],
  creator: "Belajar Bareng Roselini",
  publisher: "Belajar Bareng Roselini",
  category: "Education",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://belajarbarengroselini.site",
    siteName: "Belajar Bareng Roselini (BBR)",
    title: "Belajar Bareng Roselini | Platform AI Skripsi & Riset Akademik #1 di Indonesia",
    description:
      "Solusi cerdas mahasiswa akhir menyelesaikan tugas akhir & skripsi lebih cepat. Dilengkapi 8 tools AI canggih: Parafrase Anti-Turnitin 6 Gaya, Simulator Sidang AI interaktif, Olah Data SPSS Bab 4, dan Klinik Naskah.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Belajar Bareng Roselini - Asisten AI Tugas Akhir Mahasiswa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Belajar Bareng Roselini | Platform AI Skripsi & Riset Akademik #1",
    description:
      "Solusi cerdas mahasiswa akhir menyelesaikan skripsi lebih cepat dengan 8 tools AI canggih: Parafrase, Simulator Sidang, SPSS, dan Sitasi Otomatis.",
    images: ["/og-image.png"],
    creator: "@belajarbarengroselini",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Belajar Bareng Roselini",
    alternateName: "BBR Platform",
    url: "https://belajarbarengroselini.site",
    applicationCategory: "EducationalApplication",
    operatingSystem: "All",
    description:
      "Platform asisten kecerdasan buatan (AI) terpadu untuk mendampingi mahasiswa akhir menyusun proposal, bab 1-5, olah data statistik, dan simulasi sidang skripsi.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IDR",
      category: "Freemium",
    },
    author: {
      "@type": "Organization",
      name: "Belajar Bareng Roselini",
      url: "https://belajarbarengroselini.site",
      logo: "https://belajarbarengroselini.site/icon-512.png",
    },
  };

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <NextTopLoader color="#7B2020" showSpinner={true} shadow="0 0 10px #7B2020,0 0 5px #7B2020" />
        <ScrollToTop />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
