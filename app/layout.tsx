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

   // 👇 BASE APP ID BURAYA EKLENİYOR 👇
  other: {
    'base:app_id': '694a54e84d3a403912ed7c66',
  },

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const miniAppMeta = JSON.stringify({
    version: "1",
    imageUrl: "https://hellobase.vercel.app/frame_image.png",
    button: {
      title: "Open HelloBase",
      action: {
        type: "launch_miniapp",
        name: "HelloBase",
        url: "https://hellobase.vercel.app",                    
        splashImageUrl: "https://hellobase.vercel.app/splash.png", 
        splashBackgroundColor: "#EEF0F3"                                    
      }
    }
  });

  return (
    <html lang="en">
      <head>
        {/* ASIL ÖNEMLİ OLAN BU SATIR */}
        <meta name="fc:miniapp" content={miniAppMeta} />

        {/* Geriye uyumluluk – dokümanda var */}
        <meta name="fc:frame" content={miniAppMeta.replace('launch_miniapp', 'launch_frame')} />

        {/* OG */}
        <meta property="og:image" content="https://hellobase.vercel.app/frame_image.png" />
        <meta property="og:title" content="HelloBase" />
      </head>
      {/* Hata çözümü: inter.className'i <body> etiketine ekleyin */}
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