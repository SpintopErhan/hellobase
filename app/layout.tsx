import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientGate } from "./client-gate"; // Yeni oluşturduğumuz bileşeni al

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HelloBase MiniApp",
  description: "Farcaster MiniApp on Base",
  other: {
    'base:app_id': '694a54e84d3a403912ed7c66',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <meta name="fc:miniapp" content={miniAppMeta} />
        <meta name="fc:frame" content={miniAppMeta.replace('launch_miniapp', 'launch_frame')} />
        <meta property="og:image" content="https://hellobase.vercel.app/frame_image.png" />
        <meta property="og:title" content="HelloBase" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Wagmi ve WalletConnect kodlarını build-time render'dan tamamen izole ediyoruz */}
        <ClientGate>
          {children}
        </ClientGate>
      </body>
    </html>
  );
}