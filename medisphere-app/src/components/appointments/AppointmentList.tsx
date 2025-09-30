// components/appointments/AppointmentList.tsx
"use client";
import useSWR from "swr";
import AppointmentCard from "./AppointmentCard";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed");
    return r.json();
  });

function Skeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
      <div className="h-4 w-1/3 bg-cyan-100 rounded" />
      <div className="mt-2 h-3 w-1/2 bg-cyan-100 rounded" />
    </div>
  );
}

export default function AppointmentList({ endpoint = "/api/appointments" }: { endpoint?: string }) {
  const { data, error, isLoading } = useSWR(endpoint, fetcher, { revalidateOnFocus: false });

  if (error)
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-rose-700">
        Error loading appointments.
      </div>
    );

  if (isLoading || !data)
    return <div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)}</div>;

  if (!Array.isArray(data) || data.length === 0)
    return (
      <div className="rounded-2xl border border-cyan-100 bg-white p-8 text-center text-cyan-800">
        No appointments found.
      </div>
    );

  return (
    <div className="grid gap-4">
      {data.map((a: any) => (
        <AppointmentCard key={a.id} appointment={a} />
      ))}
    </div>
  );
}
