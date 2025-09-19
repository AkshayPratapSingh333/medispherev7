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
        className="border p-2 w-full"
        placeholder="Medicine Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        className="border p-2 w-full"
        placeholder="Dosage"
        value={form.dosage}
        onChange={(e) => setForm({ ...form, dosage: e.target.value })}
      />
      <input
        className="border p-2 w-full"
        placeholder="Frequency"
        value={form.frequency}
        onChange={(e) => setForm({ ...form, frequency: e.target.value })}
      />
      <input
        type="date"
        className="border p-2 w-full"
        value={form.startDate}
        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
      />
      <input
        type="date"
        className="border p-2 w-full"
        value={form.endDate}
        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
      />
      <button className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
    </form>
  );
}
