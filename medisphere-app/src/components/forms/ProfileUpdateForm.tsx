// components/forms/ProfileUpdateForm.tsx
"use client";

import { useState } from "react";

type Patient = {
  id: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  phoneNumber?: string | null;
  emergencyContact?: string | null;
  medicalHistory?: string | null;
  allergies?: string | null;
};

export default function ProfileUpdateForm({ patient }: { patient: Patient }) {
  const [form, setForm] = useState({
    dateOfBirth: patient.dateOfBirth ?? "",
    gender: patient.gender ?? "",
    phoneNumber: patient.phoneNumber ?? "",
    emergencyContact: patient.emergencyContact ?? "",
    medicalHistory: patient.medicalHistory ?? "",
    allergies: patient.allergies ?? "",
  });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    // very light client validation
    if (form.phoneNumber && !/^[0-9+\-() ]{7,20}$/.test(form.phoneNumber)) {
      setSaving(false);
      alert("Please enter a valid phone number.");
      return;
    }

    const res = await fetch(`/api/patients/${patient.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const j = await res.json().catch(() => ({}));
    setSaving(false);

    if (res.ok) {
      alert("Profile updated");
    } else {
      alert(j.error || "Failed to update profile");
    }
  }

  const input =
    "border border-cyan-200/70 bg-white/90 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 placeholder:text-cyan-600/50 shadow-sm";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-cyan-700/70 mb-1">Date of Birth</label>
          <input
            className={input + " w-full"}
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => set("dateOfBirth", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-cyan-700/70 mb-1">Gender</label>
          <input
            className={input + " w-full"}
            placeholder="Gender"
            value={form.gender}
            onChange={(e) => set("gender", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-cyan-700/70 mb-1">Phone Number</label>
          <input
            className={input + " w-full"}
            placeholder="Phone Number"
            value={form.phoneNumber}
            onChange={(e) => set("phoneNumber", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm text-cyan-700/70 mb-1">Emergency Contact</label>
          <input
            className={input + " w-full"}
            placeholder="Emergency Contact"
            value={form.emergencyContact}
            onChange={(e) => set("emergencyContact", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-cyan-700/70 mb-1">Medical History</label>
        <textarea
          className={input + " w-full"}
          rows={4}
          placeholder="Medical History"
          value={form.medicalHistory}
          onChange={(e) => set("medicalHistory", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm text-cyan-700/70 mb-1">Allergies</label>
        <textarea
          className={input + " w-full"}
          rows={3}
          placeholder="Allergies"
          value={form.allergies}
          onChange={(e) => set("allergies", e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 rounded-xl font-semibold text-white shadow-md bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 disabled:opacity-70"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
