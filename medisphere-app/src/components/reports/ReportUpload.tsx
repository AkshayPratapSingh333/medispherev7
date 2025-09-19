"use client";
import { useState } from "react";

export default function ReportUpload() {
  const [file, setFile] = useState<File | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/reports/upload", { method: "POST", body: formData });
    if (res.ok) alert("Uploaded");
    else alert("Upload failed");
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button className="bg-blue-600 text-white px-3 py-1 rounded">Upload</button>
    </form>
  );
}
