"use client";
import useSWR from "swr";

export default function PrescriptionList() {
  const { data, error } = useSWR("/api/prescriptions", (url) => fetch(url).then((r) => r.json()));

  if (error) return <p>Error loading prescriptions</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <ul className="space-y-2">
      {data.map((p: any) => (
        <li key={p.id} className="border p-2 rounded">
          <strong>Doctor: {p.doctor.user.name}</strong>
          <p>Instructions: {p.instructions}</p>
          <pre className="text-sm">{JSON.stringify(p.medications, null, 2)}</pre>
        </li>
      ))}
    </ul>
  );
}
