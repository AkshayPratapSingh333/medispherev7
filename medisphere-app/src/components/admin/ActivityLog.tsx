"use client";
import useSWR from "swr";

type AuditItem = {
  id: string;
  action: string;
  resource: string;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: string;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j?.error || "Failed to load activity");
  }
  return (await res.json()) as AuditItem[];
};

export default function AuditLog() {
  const { data, error, isLoading } = useSWR("/api/admin/activity", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: false,
  });

  return (
    <section className="rounded-xl border border-cyan-100 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-xl font-semibold text-slate-900">Recent Activity</h2>

      {error ? <p className="text-sm text-rose-700">{error.message}</p> : null}

      {isLoading ? <p className="text-sm text-slate-500">Loading activity...</p> : null}

      {!isLoading && !error && (!data || data.length === 0) ? (
        <p className="text-sm text-slate-500">No activity logs found.</p>
      ) : null}

      {data && data.length > 0 ? (
        <ul className="space-y-2">
          {data.slice(0, 25).map((log) => (
            <li key={log.id} className="rounded-md border border-slate-100 p-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-800">{log.action}</span>
                <span className="text-slate-600">on {log.resource}</span>
                <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
              {log.details ? <p className="mt-1 text-xs text-slate-600">{log.details}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
