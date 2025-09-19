"use client";
import useSWR from "swr";

export default function ReportList() {
  const { data, error } = useSWR("/api/reports", (url) => fetch(url).then((r) => r.json()));

  if (error) return <p>Error loading reports</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <ul className="space-y-2">
      {data.map((r: any) => (
        <li key={r.id} className="border p-2 rounded">
          {r.fileName} — {r.fileType} ({r.fileSize} bytes)
          <a href={`/api/reports/${r.id}/download`} className="ml-2 text-blue-600 underline">
            Download
          </a>
        </li>
      ))}
    </ul>
  );
}
