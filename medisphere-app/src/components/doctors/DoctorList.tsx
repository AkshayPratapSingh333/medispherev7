// components/doctors/DoctorList.tsx
"use client";

import useSWR from "swr";
import DoctorCard from "./DoctorCard";

const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error("Failed");
  return r.json();
});

function Skeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
      <div className="flex gap-4">
        <div className="h-16 w-16 rounded-xl bg-cyan-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 bg-cyan-100 rounded" />
          <div className="h-3 w-1/4 bg-cyan-100 rounded" />
          <div className="h-3 w-1/2 bg-cyan-100 rounded" />
        </div>
      </div>
      <div className="mt-4 h-9 w-full bg-cyan-100 rounded-xl" />
    </div>
  );
}

export default function DoctorList() {
  const { data, error, isLoading } = useSWR("/api/doctors", fetcher, { revalidateOnFocus: false });

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-rose-700">
        Error loading doctors. Please try again.
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="rounded-2xl border border-cyan-100 bg-white p-8 text-center text-cyan-800">
        No doctors available yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((doc: any) => (
        <DoctorCard key={doc.id} doctor={doc} />
      ))}
    </div>
  );
}
