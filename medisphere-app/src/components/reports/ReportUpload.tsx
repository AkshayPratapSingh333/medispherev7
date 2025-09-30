// components/reports/ReportUpload.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReportUpload({ endpoint = "/api/reports/upload" }: { endpoint?: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!file) return setMsg("Please choose a file.");

    const fd = new FormData();
    fd.set("file", file);
    if (fileName.trim()) fd.set("fileName", fileName.trim());
    if (description.trim()) fd.set("description", description.trim());

    try {
      setBusy(true);
      const res = await fetch(endpoint, { method: "POST", body: fd }); // do NOT set Content-Type
      const j = await res.json().catch(() => ({}));
      setBusy(false);
      if (!res.ok) {
        setMsg(j.error || "Upload failed");
        return;
      }
      router.push(`/reports/${j.id}`);
    } catch {
      setBusy(false);
      setMsg("Network error");
    }
  }

  const input = "w-full rounded-lg border border-cyan-200/70 bg-white/90 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-300/70";

  return (
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
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="e.g., CBC Report June 2025"
          className={input}
        />
      </div>

      <div>
        <label className="block text-sm text-cyan-700/70 mb-1">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Brief notes about this report"
          className={input}
        />
      </div>

      {msg && (
        <div className="rounded-lg bg-rose-50 text-rose-700 border border-rose-100 px-4 py-2 text-sm">
          {msg}
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
  );
}
