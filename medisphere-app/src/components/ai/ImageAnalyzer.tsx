// components/ai/ImageAnalyzer.tsx
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ImageAnalyzer() {
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setMsg(null);
    setAnalysis("");
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const base64 = await fileToBase64(file);
    setBusy(true);
    try {
      const res = await fetch("/api/ai/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(j.error || "Image analysis failed");
      } else {
        setAnalysis(j.result || "[No analysis]");
      }
    } catch {
      setMsg("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
      <div className="mb-3">
        <div className="text-lg font-semibold text-cyan-900">Image Analyzer</div>
        <div className="text-sm text-cyan-800/70">
          Upload a medical image (X-ray, scan, report photo).
        </div>
      </div>

      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFile}
        className="w-full rounded-lg border border-cyan-200/70 bg-white/90 px-3 py-2"
      />

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="preview"
          className="mt-3 max-h-64 rounded-xl border border-cyan-100"
        />
      )}

      {busy && <div className="mt-3 text-sm text-cyan-800/90">Analyzing…</div>}

      {msg && (
        <div className="mt-3 rounded-md bg-rose-50 border border-rose-100 px-3 py-2 text-rose-700 text-sm">
          {msg}
        </div>
      )}

      {analysis && (
        <div className="mt-3 rounded-xl bg-gradient-to-br from-sky-50 to-emerald-50 p-4 ring-1 ring-cyan-100 text-cyan-900">
          <article className="prose prose-sm max-w-none prose-headings:text-cyan-900 prose-strong:text-cyan-900 prose-li:marker:text-cyan-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis}</ReactMarkdown>
          </article>
        </div>
      )}
    </div>
  );
}

async function fileToBase64(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  return dataUrl.split(",")[1] || "";
}
