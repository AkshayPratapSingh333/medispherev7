// components/appointments/AppointmentCard.tsx
"use client";
import Link from "next/link";

function fmt(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  try {
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
  } catch {
    return date.toString();
  }
}

export default function AppointmentCard({ appointment }: { appointment: any }) {
  const doc = appointment.doctor?.user;
  const pat = appointment.patient?.user;

  return (
    <div className="group rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-200 to-emerald-200 ring-1 ring-cyan-200 overflow-hidden" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-cyan-900 truncate">
            {doc?.name ? `Dr. ${doc.name}` : "Doctor"}
          </h3>
          <div className="text-sm text-cyan-800/80">{fmt(appointment.scheduledAt)}</div>
          <div className="mt-1 text-xs">
            <span className="inline-flex items-center rounded-md bg-cyan-600/10 px-2 py-0.5 text-cyan-800 ring-1 ring-cyan-200">
              Status: {appointment.status}
            </span>
            {pat?.name && (
              <span className="ml-2 text-cyan-700/70">Patient: {pat.name}</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href={`/appointments/${appointment.id}`}
          className="inline-flex items-center rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-3 py-2 text-white text-sm font-medium hover:from-cyan-600 hover:to-emerald-600"
        >
          View details
        </Link>
      </div>
    </div>
  );
}
