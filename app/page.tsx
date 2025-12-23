"use client";
import dynamic from "next/dynamic";

const HomeScene = dynamic(() => import("@/components/HomeScene"), { ssr: false });

export default function Home() {
  return <HomeScene />;
}