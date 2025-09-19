"use client";
import useSWR from "swr";

export default function SystemHealth() {
  const { data } = useSWR("/api/admin/alerts", (url) => fetch(url).then((r) => r.json()));

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">System Alerts</h2>
      <ul>
        {data?.map((a: any) => (
          <li key={a.id} className={`p-2 rounded ${a.level === "critical" ? "bg-red-200" : "bg-yellow-100"}`}>
            {a.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
