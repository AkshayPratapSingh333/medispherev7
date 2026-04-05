"use client";
import useSWR from "swr";

type AlertItem = {
  id: string | number;
  message: string;
  level: "critical" | "warning" | "info";
};

type Stats = {
  users: number;
  doctors: number;
  patients: number;
  appointments: number;
  reports: number;
};

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j?.error || "Request failed");
  }
  return (await res.json()) as T;
};

export default function SystemHealth() {
  const {
    data: alerts,
    error: alertsError,
    isLoading: alertsLoading,
  } = useSWR<AlertItem[]>("/api/admin/alerts", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: false,
  });

  const {
    data: stats,
    error: statsError,
    isLoading: statsLoading,
  } = useSWR<Stats>("/api/admin/stats", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: false,
  });

  return (
    <section className="rounded-xl border border-cyan-100 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-xl font-semibold text-slate-900">System Health</h2>

      {statsError ? <p className="mb-2 text-sm text-rose-700">{statsError.message}</p> : null}
      {alertsError ? <p className="mb-2 text-sm text-rose-700">{alertsError.message}</p> : null}

      {statsLoading ? (
        <p className="text-sm text-slate-500">Loading system stats...</p>
      ) : stats ? (
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="rounded-lg border border-slate-200 p-3 text-center">
            <p className="text-xs text-slate-500">Users</p>
            <p className="text-lg font-semibold text-slate-900">{stats.users}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 text-center">
            <p className="text-xs text-slate-500">Doctors</p>
            <p className="text-lg font-semibold text-slate-900">{stats.doctors}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 text-center">
            <p className="text-xs text-slate-500">Patients</p>
            <p className="text-lg font-semibold text-slate-900">{stats.patients}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 text-center">
            <p className="text-xs text-slate-500">Appointments</p>
            <p className="text-lg font-semibold text-slate-900">{stats.appointments}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 text-center">
            <p className="text-xs text-slate-500">Reports</p>
            <p className="text-lg font-semibold text-slate-900">{stats.reports}</p>
          </div>
        </div>
      ) : null}

      <h3 className="mb-2 text-sm font-semibold text-slate-700">Alerts</h3>
      {alertsLoading ? <p className="text-sm text-slate-500">Loading alerts...</p> : null}

      {!alertsLoading && alerts && alerts.length === 0 ? (
        <p className="text-sm text-emerald-700">No active alerts.</p>
      ) : null}

      {alerts && alerts.length > 0 ? (
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li
              key={a.id}
              className={`rounded-md p-2 text-sm ${
                a.level === "critical"
                  ? "bg-rose-50 text-rose-700"
                  : a.level === "warning"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-cyan-50 text-cyan-700"
              }`}
            >
              {a.message}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
