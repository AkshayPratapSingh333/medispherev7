// components/forms/DoctorApplicationForm.tsx
"use client";
import { useState } from "react";

export default function DoctorApplicationForm() {
  const [form, setForm] = useState({
    licenseNumber: "",
    specialization: "",
    experience: 0,
    qualification: "",
    hospitalName: "",
    consultationFee: 0,
    bio: "",
    availableSchedule: {},
    languages: [],
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/doctors/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const j = await res.json();
    if (res.ok) alert("Application submitted");
    else alert(j.error);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        className="border p-2 w-full"
        placeholder="License Number"
        value={form.licenseNumber}
        onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
      />
      <input
        className="border p-2 w-full"
        placeholder="Specialization"
        value={form.specialization}
        onChange={(e) => setForm({ ...form, specialization: e.target.value })}
      />
      <input
        type="number"
        className="border p-2 w-full"
        placeholder="Experience (years)"
        value={form.experience}
        onChange={(e) => setForm({ ...form, experience: +e.target.value })}
      />
      <input
        className="border p-2 w-full"
        placeholder="Qualification"
        value={form.qualification}
        onChange={(e) => setForm({ ...form, qualification: e.target.value })}
      />
      <input
        className="border p-2 w-full"
        placeholder="Hospital Name"
        value={form.hospitalName}
        onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
      />
      <input
        type="number"
        className="border p-2 w-full"
        placeholder="Consultation Fee"
        value={form.consultationFee}
        onChange={(e) => setForm({ ...form, consultationFee: +e.target.value })}
      />
      <textarea
        className="border p-2 w-full"
        placeholder="Bio"
        value={form.bio}
        onChange={(e) => setForm({ ...form, bio: e.target.value })}
      />
      <button className="bg-green-600 text-white px-4 py-2 rounded">Apply</button>
    </form>
  );
}
