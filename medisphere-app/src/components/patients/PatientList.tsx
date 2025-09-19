// components/patients/PatientList.tsx
"use client";
import useSWR from "swr";
import PatientCard from "./PatientCard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PatientList() {
  const { data, error } = useSWR("/api/admin/patients", fetcher);

  if (error) return <p>Error loading patients</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((p: any) => (
        <PatientCard key={p.id} patient={p} />
      ))}
    </div>
  );
}
