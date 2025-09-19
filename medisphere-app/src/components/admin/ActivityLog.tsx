"use client";
import useSWR from "swr";

export default function AuditLog() {
  const { data } = useSWR("/api/admin/activity", (url) => fetch(url).then((r) => r.json()));

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
      <ul className="space-y-1">
        {data?.map((log: any) => (
          <li key={log.id} className="text-sm">
            <span className="font-bold">{log.action}</span> — {log.resource} at{" "}
            {new Date(log.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
