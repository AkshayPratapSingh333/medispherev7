// components/doctors/DoctorList.tsx
"use client";
import useSWR from "swr";
import DoctorCard from "./DoctorCard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DoctorList() {
  const { data, error } = useSWR("/api/doctors", fetcher);

  if (error) return <p>Error loading doctors</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((doc: any) => (
        <DoctorCard key={doc.id} doctor={doc} />
      ))}
    </div>
  );
}
