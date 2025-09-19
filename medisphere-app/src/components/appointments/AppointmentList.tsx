// components/appointments/AppointmentList.tsx
"use client";
import useSWR from "swr";
import AppointmentCard from "./AppointmentCard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AppointmentList() {
  const { data, error } = useSWR("/api/appointments", fetcher);

  if (error) return <p>Error loading appointments</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className="grid gap-4">
      {data.map((a: any) => (
        <AppointmentCard key={a.id} appointment={a} />
      ))}
    </div>
  );
}
