"use client";
import { useState } from "react";

export default function MedicineForm() {
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    startDate: "",
    endDate: "",
    reminders: [] as string[],
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      alert("Medicine saved");
    } else {
      alert("Error saving medicine");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        className="w-full rounded-lg bg-white/60 border border-amber-200/40 px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
        placeholder="Medicine Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        className="w-full rounded-lg bg-white/60 border border-amber-200/40 px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
        placeholder="Dosage"
        value={form.dosage}
        onChange={(e) => setForm({ ...form, dosage: e.target.value })}
      />
      <input
        className="w-full rounded-lg bg-white/60 border border-amber-200/40 px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
        placeholder="Frequency"
        value={form.frequency}
        onChange={(e) => setForm({ ...form, frequency: e.target.value })}
      />
      <input
        type="date"
        className="w-full rounded-lg bg-white/60 border border-amber-200/40 px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
        value={form.startDate}
        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
      />
      <input
        type="date"
        className="w-full rounded-lg bg-white/60 border border-amber-200/40 px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
        value={form.endDate}
        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
      />
      <button className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold px-4 py-3 transition shadow-lg shadow-emerald-500/20">Save Medicine</button>
    </form>
  );
}
