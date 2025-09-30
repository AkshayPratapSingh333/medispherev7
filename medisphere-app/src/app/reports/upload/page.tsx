// app/reports/upload/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadReportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) { setError("Please choose a file"); return; }

    const fd = new FormData();
    fd.set("file", file);
    if (name.trim()) fd.set("fileName", name.trim());
    if (description.trim()) fd.set("description", description.trim());

    setBusy(true);
    const res = await fetch("/api/reports/upload", { method: "POST", body: fd });
    setBusy(false);
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { setError(j.error || "Upload failed"); return; }
    router.push(`/reports/${j.id}`);
  }

  const input = "w-full rounded-lg border border-cyan-200/70 bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-300/70";

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50">
      <div className="max-w-xl mx-auto px-6 py-8">
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-100/60 via-teal-100/60 to-sky-100/60 blur-xl" />
          <div className="relative bg-white/90 backdrop-blur-sm border border-cyan-100 rounded-3xl px-6 py-6 shadow">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-emerald-700">
              Upload Report (MySQL)
            </h1>
            <p className="text-cyan-800/70">PDF, PNG, JPG, WEBP (max 10MB) — stored in DB.</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 bg-white rounded-2xl border border-cyan-100 p-6 shadow-sm">
          <div>
            <label className="block text-sm text-cyan-700/70 mb-1">File</label>
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className={input}
            />
          </div>

          <div>
            <label className="block text-sm text-cyan-700/70 mb-1">Display name (optional)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., CBC Report June 2025"
              className={input}
            />
          </div>

          <div>
            <label className="block text-sm text-cyan-700/70 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief notes about this report"
              rows={4}
              className={input}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-rose-50 text-rose-700 border border-rose-100 px-4 py-2 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl font-semibold text-white shadow-md bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 disabled:opacity-70"
          >
            {busy ? "Uploading…" : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
}
