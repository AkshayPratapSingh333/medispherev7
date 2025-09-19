"use client";
import useSWR from "swr";

export default function ReviewList({ doctorId }: { doctorId: string }) {
  const { data, error } = useSWR("/api/reviews", (url) => fetch(url).then((r) => r.json()));

  if (error) return <p>Error loading reviews</p>;
  if (!data) return <p>Loading…</p>;

  const filtered = doctorId ? data.filter((r: any) => r.doctorId === doctorId) : data;

  return (
    <ul className="space-y-2">
      {filtered.map((r: any) => (
        <li key={r.id} className="border p-2 rounded">
          <p>
            ⭐ {r.rating} — {r.comment}
          </p>
          <p className="text-sm text-gray-600">
            By {r.patient.user.name} on {new Date(r.createdAt).toLocaleDateString()}
          </p>
        </li>
      ))}
    </ul>
  );
}
