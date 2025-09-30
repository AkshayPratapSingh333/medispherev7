// components/forms/AppointmentBookingForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AppointmentBookingForm({ doctorId }: { doctorId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: "",
    time: "",
    notes: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    if (!form.date || !form.time) {
      setSaving(false);
      alert("Please select date and time");
      return;
    }

    // Local ISO assembly (assumes local timezone)
    const scheduledAt = new Date(`${form.date}T${form.time}:00`);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId,
        scheduledAt: scheduledAt.toISOString(),
        notes: form.notes,
      }),
    });

    setSaving(false);
    if (res.ok) {
      const appt = await res.json();
      router.push(`/appointments/${appt.id}`);
    } else {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Booking failed");
    }
  }

  const input = "border border-cyan-200/70 bg-white/90 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 placeholder:text-cyan-600/50 shadow-sm";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-cyan-700/70 mb-1">Date</label>
          <input type="date" className={input + " w-full"} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-cyan-700/70 mb-1">Time</label>
          <input type="time" className={input + " w-full"} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
        </div>
      </div>

      <div>
        <label className="block text-sm text-cyan-700/70 mb-1">Notes (optional)</label>
        <textarea className={input + " w-full"} rows={4} placeholder="Reason for visit / symptoms" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>

      <button type="submit" disabled={saving} className="w-full py-3 rounded-xl font-semibold text-white shadow-md bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 disabled:opacity-70">
        {saving ? "Booking…" : "Book Appointment"}
      </button>
    </form>
  );
}
