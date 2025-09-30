// components/ai/AIChatLoader.tsx  (Client Component)
"use client";
import dynamic from "next/dynamic";
const AIChat = dynamic(() => import("./AIChat"), { ssr: false });
export default function AIChatLoader() {
  return <AIChat />;
}
