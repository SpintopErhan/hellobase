// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Font importlarınız sizde farklı olabilir
import "./globals.css"; // Global CSS dosyanızın yolunu doğrulayın
import { ReactNode } from 'react';

// !!! ÖNEMLİ: app/providers.tsx'ten doğru Providers bileşenini named import olarak içeri aktarın
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HelloBase MiniApp", // Başlık güncellendi
  description: "Farcaster MiniApp on Base", // Açıklama güncellendi
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers> {/* Tüm children'ı (sayfalarınızı) Providers ile sarın */}
          {children}
        </Providers>
      </body>
    </html>
  );
}