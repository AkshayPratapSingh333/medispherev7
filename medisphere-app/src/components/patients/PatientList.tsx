// components/patients/PatientList.tsx
"use client";

import useSWR from "swr";
import PatientCard from "./PatientCard";

const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error("Failed to load");
  return r.json();
});

function Skeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
      <div className="h-4 w-1/3 bg-cyan-100 rounded" />
      <div className="mt-2 h-3 w-1/2 bg-cyan-100 rounded" />
      <div className="mt-2 h-3 w-1/4 bg-cyan-100 rounded" />
    </div>
  );
}

export default function PatientList() {
  const { data, error, isLoading } = useSWR("/api/admin/patients", fetcher, { revalidateOnFocus: false });

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-rose-700">
        Error loading patients.
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="rounded-2xl border border-cyan-100 bg-white p-8 text-center text-cyan-800">
        No patients found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((p: any) => (
        <PatientCard key={p.id} patient={p} />
      ))}
    </div>
  );
}
