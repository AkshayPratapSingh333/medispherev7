// components/appointments/AppointmentStatus.tsx
"use client";
import { useState } from "react";
import RescheduleModal from "./RescheduleModal";

const ACTIONS: { key: string; label: string }[] = [
  { key: "CONFIRMED", label: "Confirm" },
  { key: "COMPLETED", label: "Complete" },
  { key: "CANCELLED", label: "Cancel" },
  
];

export default function AppointmentStatus({ id, current }: { id: string; current: string }) {
  const [status, setStatus] = useState(current);
  const [busy, setBusy] = useState<string | null>(null);

  async function updateStatus(newStatus: string) {
    setBusy(newStatus);
    const res = await fetch(`/api/appointments/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const j = await res.json().catch(() => ({}));
    setBusy(null);
    if (res.ok) setStatus(j.status);
    else alert(j.error || "Update failed");
  }

  return (
    <div className="mt-4 rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
      <div className="text-sm text-cyan-700/70">Current status</div>
      <div className="mt-1 font-semibold text-cyan-900">{status}</div>

      <div className="mt-3 flex flex-wrap gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.key}
            disabled={busy === a.key}
            onClick={() => updateStatus(a.key)}
            className="inline-flex items-center rounded-lg bg-cyan-600/10 px-3 py-2 text-sm font-medium text-cyan-800 ring-1 ring-cyan-200 hover:bg-cyan-600/15 disabled:opacity-60"
          >
            {busy === a.key ? "…" : a.label}
          </button>
        ))}

        {/* New: reschedule modal */}
        <RescheduleModal
          appointmentId={id}
          onSuccess={(updated) => setStatus(updated.status)}
        />
      </div>
    </div>
  );
}
