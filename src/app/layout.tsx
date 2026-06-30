import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';
import ScrollToTop from "@/components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Belajar Bareng Roselini",
  description: "Platform cerdas untuk mahasiswa akhir, dibantu oleh AI Belajar Bareng Roselini",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextTopLoader color="#7B2020" showSpinner={true} shadow="0 0 10px #7B2020,0 0 5px #7B2020" />
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}
