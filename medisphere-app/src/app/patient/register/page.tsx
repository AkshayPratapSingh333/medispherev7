"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PatientRegisterPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    emergencyContact: "",
    medicalHistory: "",
    allergies: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/patients/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (res.ok) {
      router.push("/patient/dashboard");
    } else {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Registration failed");
    }
  }

  const input =
    "border border-cyan-200/70 bg-white/90 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 placeholder:text-cyan-600/50 shadow-sm";

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-100/60 via-teal-100/60 to-sky-100/60 blur-xl" />
          <div className="relative bg-white/90 backdrop-blur-sm border border-cyan-100 rounded-3xl px-6 py-6 shadow">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-emerald-700">
              Patient Registration
            </h1>
            <p className="text-cyan-800/70">
              Create your patient profile to book and manage appointments.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl border border-cyan-100 p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-cyan-700/70 mb-1">Date of Birth</label>
              <input
                type="date"
                className={input + " w-full"}
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-cyan-700/70 mb-1">Gender</label>
              <input
                className={input + " w-full"}
                placeholder="Gender"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-cyan-700/70 mb-1">Phone Number</label>
              <input
                className={input + " w-full"}
                placeholder="Phone Number"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm text-cyan-700/70 mb-1">Emergency Contact</label>
              <input
                className={input + " w-full"}
                placeholder="Emergency Contact"
                value={form.emergencyContact}
                onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
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
              onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm text-cyan-700/70 mb-1">Allergies</label>
            <textarea
              className={input + " w-full"}
              rows={3}
              placeholder="Allergies"
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl font-semibold text-white shadow-md bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 disabled:opacity-70"
          >
            {saving ? "Saving…" : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
