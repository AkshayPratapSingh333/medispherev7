// components/forms/ProfileUpdateForm.tsx
"use client";
import { useState } from "react";

export default function ProfileUpdateForm({ patient }: { patient: any }) {
  const [form, setForm] = useState({
    dateOfBirth: patient.dateOfBirth || "",
    gender: patient.gender || "",
    phoneNumber: patient.phoneNumber || "",
    emergencyContact: patient.emergencyContact || "",
    medicalHistory: patient.medicalHistory || "",
    allergies: patient.allergies || "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/patients/${patient.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const j = await res.json();
    if (res.ok) alert("Profile updated");
    else alert(j.error);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        className="border p-2 w-full"
        type="date"
        value={form.dateOfBirth}
        onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
      />
      <input
        className="border p-2 w-full"
        placeholder="Gender"
        value={form.gender}
        onChange={(e) => setForm({ ...form, gender: e.target.value })}
      />
      <input
        className="border p-2 w-full"
        placeholder="Phone Number"
        value={form.phoneNumber}
        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
      />
      <input
        className="border p-2 w-full"
        placeholder="Emergency Contact"
        value={form.emergencyContact}
        onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
      />
      <textarea
        className="border p-2 w-full"
        placeholder="Medical History"
        value={form.medicalHistory}
        onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })}
      />
      <textarea
        className="border p-2 w-full"
        placeholder="Allergies"
        value={form.allergies}
        onChange={(e) => setForm({ ...form, allergies: e.target.value })}
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
    </form>
  );
}
