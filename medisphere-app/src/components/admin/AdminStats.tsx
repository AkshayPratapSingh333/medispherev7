"use client";
import useSWR from "swr";

export default function AdminStats() {
  const { data, error } = useSWR("/api/admin/stats", (url) => fetch(url).then((r) => r.json()));
  if (error) return <p>Error loading stats</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {Object.keys(data).map((key) => (
        <div key={key} className="p-4 border rounded text-center">
          <p className="font-bold">{data[key]}</p>
          <p className="text-sm text-gray-600">{key}</p>
        </div>
      ))}
    </div>
  );
}
