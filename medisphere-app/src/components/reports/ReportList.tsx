// components/reports/ReportList.tsx
"use client";

import useSWR, { mutate } from "swr";
import Link from "next/link";
import { useState } from "react";

const fetcher = (url: string) =>
  fetch(url).then(async (r) => {
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      throw new Error(j.error || `HTTP ${r.status}`);
    }
    return r.json();
  });

export default function ReportList() {
  const { data, error, isLoading } = useSWR("/api/reports", fetcher, {
    revalidateOnFocus: false,
  });
  const [busyId, setBusyId] = useState<string | null>(null);

  const items: any[] = Array.isArray(data) ? data : data?.items ?? [];

  async function remove(id: string) {
    if (!confirm("Delete this report? This cannot be undone.")) return;
    setBusyId(id);

    // Optimistic update
    const cacheKey = "/api/reports";
    const previous = data;
    mutate(
      cacheKey,
      (current: any) => {
        const list = Array.isArray(current) ? current : current?.items ?? [];
        const filtered = list.filter((x: any) => x.id !== id);
        return Array.isArray(current)
          ? filtered
          : { ...current, items: filtered, total: Math.max(0, (current?.total ?? 1) - 1) };
      },
      false
    );

    try {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Delete failed");
      }
      mutate(cacheKey); // revalidate
    } catch (e: any) {
      alert(e.message || "Delete failed");
      mutate(cacheKey, previous, false); // rollback
    } finally {
      setBusyId(null);
    }
  }

  if (error)
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
        Failed to load reports: {error.message}
      </div>
    );

  if (isLoading)
    return (
      <div className="grid gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-cyan-100 bg-white p-4">
            <div className="h-4 w-1/3 bg-cyan-100 rounded" />
            <div className="mt-2 h-3 w-1/2 bg-cyan-100 rounded" />
          </div>
        ))}
      </div>
    );

  if (!items.length)
    return (
      <div className="rounded-xl border border-cyan-100 bg-white p-6 text-cyan-800">
        No reports yet. Upload one to get started.
      </div>
    );

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((r: any) => {
        const kb = (r.fileSize / 1024).toFixed(1);
        // Prefer /download if you created it; else fall back to /file
        const downloadHref = r.id ? `/api/reports/${r.id}/download` : "#";
        const fileHref = r.id ? `/api/reports/${r.id}/file` : "#";

        return (
          <li key={r.id} className="group rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="font-semibold text-cyan-900 truncate">{r.fileName}</div>
            <div className="text-sm text-cyan-800/80 truncate">{r.fileType}</div>
            <div className="mt-1 text-xs text-cyan-700/70">{kb} KB • {new Date(r.uploadedAt).toLocaleDateString("en-IN")}</div>
            {r.description ? (
              <div className="mt-2 text-xs text-cyan-800/80 line-clamp-2">{r.description}</div>
            ) : null}

            <div className="mt-3 flex items-center gap-2">
              <Link
                href={`/reports/${r.id}`}
                className="inline-flex items-center rounded-lg bg-cyan-600/10 px-3 py-1.5 text-sm font-medium text-cyan-800 ring-1 ring-cyan-200 hover:bg-cyan-600/15"
              >
                View
              </Link>

              <a
                href={downloadHref}
                onClick={(e) => {
                  // If /download route does not exist, try /file in a new tab
                  if (downloadHref === "#") {
                    e.preventDefault();
                    window.open(fileHref, "_blank");
                  }
                }}
                className="inline-flex items-center rounded-lg bg-emerald-600/10 px-3 py-1.5 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-600/15"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download
              </a>

              <button
                onClick={() => remove(r.id)}
                disabled={busyId === r.id}
                className="ml-auto inline-flex items-center rounded-lg bg-rose-600/10 px-3 py-1.5 text-sm font-medium text-rose-800 ring-1 ring-rose-200 hover:bg-rose-600/15 disabled:opacity-60"
              >
                {busyId === r.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
