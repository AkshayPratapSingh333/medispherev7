// components/forms/AppointmentBookingForm.tsx
"use client";
import { useState } from "react";

export default function AppointmentBookingForm({ doctorId }: { doctorId: string }) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId, scheduledAt, duration, notes }),
    });
    const j = await res.json();
    if (res.ok) alert("Appointment booked!");
    else alert(j.error);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="datetime-local"
        className="border p-2 w-full"
        value={scheduledAt}
        onChange={(e) => setScheduledAt(e.target.value)}
        required
      />
      <input
        type="number"
        className="border p-2 w-full"
        value={duration}
        onChange={(e) => setDuration(+e.target.value)}
      />
      <textarea
        className="border p-2 w-full"
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Book</button>
    </form>
  );
}
