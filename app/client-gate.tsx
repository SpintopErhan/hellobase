"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

// Providers bileşenini burada SSR kapalı şekilde yüklüyoruz.
// Burası Client Component olduğu için hata vermeyecek.
const DynamicProviders = dynamic(
  () => import("./providers").then((mod) => mod.Providers),
  { ssr: false }
);

export function ClientGate({ children }: { children: ReactNode }) {
  return <DynamicProviders>{children}</DynamicProviders>;
}