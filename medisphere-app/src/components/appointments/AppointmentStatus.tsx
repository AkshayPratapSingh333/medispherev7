// components/appointments/AppointmentStatus.tsx
"use client";
import { useState } from "react";

export default function AppointmentStatus({ id, current }: { id: string; current: string }) {
  const [status, setStatus] = useState(current);

  async function updateStatus(newStatus: string) {
    const res = await fetch(`/api/appointments/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const j = await res.json();
    if (res.ok) {
      setStatus(j.status);
    } else {
      alert(j.error);
    }
  }

  return (
    <div className="space-x-2">
      <span>Status: {status}</span>
      {["CONFIRMED", "COMPLETED", "CANCELLED", "RESCHEDULED"].map((s) => (
        <button
          key={s}
          className="bg-gray-200 px-2 py-1 rounded"
          onClick={() => updateStatus(s)}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
