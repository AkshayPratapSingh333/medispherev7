// components/ai/ImageAnalyzerLoader.tsx  (Client Component)
"use client";
import dynamic from "next/dynamic";
const ImageAnalyzer = dynamic(() => import("./ImageAnalyzer"), { ssr: false });
export default function ImageAnalyzerLoader() {
  return <ImageAnalyzer />;
}
