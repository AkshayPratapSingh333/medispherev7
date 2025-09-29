"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DoctorApplicationForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    licenseNumber: "",
    specialization: "",
    experience: 0,
    qualification: "",
    hospitalName: "",
    consultationFee: 0,
    bio: "",
    languages: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      ...form,
      experience: Number(form.experience),
      consultationFee: Number(form.consultationFee),
      languages: form.languages
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    const res = await fetch("/api/doctors/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      router.push("/doctor/dashboard");
      alert("Application submitted ✅");
    } else {
      alert(data.error || "Failed to submit");
    }
  }

  const inputClass =
    "border border-cyan-200 bg-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6"
      >
        <h1 className="text-2xl font-bold text-center text-cyan-700">
          Doctor Application Form
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className={inputClass}
            placeholder="License Number"
            value={form.licenseNumber}
            onChange={(e) =>
              setForm({ ...form, licenseNumber: e.target.value })
            }
            required
          />
          <input
            className={inputClass}
            placeholder="Specialization"
            value={form.specialization}
            onChange={(e) =>
              setForm({ ...form, specialization: e.target.value })
            }
            required
          />
          <input
            type="number"
            className={inputClass}
            placeholder="Experience (years)"
            value={form.experience}
            onChange={(e) =>
              setForm({ ...form, experience: +e.target.value })
            }
            required
          />
          <input
            className={inputClass}
            placeholder="Education / Qualification"
            value={form.qualification}
            onChange={(e) =>
              setForm({ ...form, qualification: e.target.value })
            }
            required
          />
          <input
            className={inputClass}
            placeholder="Hospital / Clinic Name"
            value={form.hospitalName}
            onChange={(e) =>
              setForm({ ...form, hospitalName: e.target.value })
            }
          />
          <input
            type="number"
            className={inputClass}
            placeholder="Consultation Fee"
            value={form.consultationFee}
            onChange={(e) =>
              setForm({ ...form, consultationFee: +e.target.value })
            }
            required
          />
        </div>

        <textarea
          className={`${inputClass} w-full`}
          rows={4}
          placeholder="Short Bio"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />

        <input
          className={inputClass + " w-full"}
          placeholder="Languages (comma separated)"
          value={form.languages}
          onChange={(e) => setForm({ ...form, languages: e.target.value })}
        />

        <button
          type="submit"
          className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-emerald-500"
        >
          Submit Application
        </button>
      </form>
    </div>
  );
}
