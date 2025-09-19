"use client";
import { useState } from "react";

export default function ImageAnalyzer() {
  const [analysis, setAnalysis] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await fetch("/api/ai/analyze-image", { method: "POST" });
    const j = await res.json();
    setAnalysis(j.analysis);
  }

  return (
    <div className="space-y-2">
      <input type="file" onChange={handleFile} />
      {analysis && <div className="border p-2">{analysis}</div>}
    </div>
  );
}
