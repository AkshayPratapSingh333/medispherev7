// components/appointments/RescheduleModal.tsx
"use client";

import { useState } from "react";

export default function RescheduleModal({
  appointmentId,
  onSuccess,
}: {
  appointmentId: string;
  onSuccess?: (updated: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: "", time: "", reason: "" });

  const input =
    "border border-cyan-200/70 bg-white/90 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 placeholder:text-cyan-600/50";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.date || !form.time) {
      alert("Please select date and time.");
      return;
    }
    setSaving(true);
    const when = new Date(`${form.date}T${form.time}:00`);
    const res = await fetch(`/api/appointments/${appointmentId}/reschedule`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledAt: when.toISOString(), reason: form.reason }),
    });
    const j = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      setOpen(false);
      onSuccess?.(j);
    } else {
      alert(j.error || "Failed to reschedule");
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-lg bg-emerald-600/10 px-3 py-2 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-600/15"
      >
        Reschedule
      </button>

      {!open ? null : (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          {/* Dialog */}
          <div className="relative w-full max-w-md rounded-2xl border border-cyan-100 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-cyan-900">Reschedule Appointment</h3>
            <p className="text-sm text-cyan-800/70">Pick a new date & time and add an optional reason.</p>

            <form onSubmit={submit} className="mt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-cyan-700/70 mb-1">Date</label>
                  <input
                    type="date"
                    className={input + " w-full"}
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-cyan-700/70 mb-1">Time</label>
                  <input
                    type="time"
                    className={input + " w-full"}
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-cyan-700/70 mb-1">Reason (optional)</label>
                <textarea
                  className={input + " w-full"}
                  rows={3}
                  placeholder="Brief reason for rescheduling"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </div>

              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-cyan-200 px-3 py-2 text-sm text-cyan-800 hover:bg-cyan-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {saving ? "Saving…" : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
