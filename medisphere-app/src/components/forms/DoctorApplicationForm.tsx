"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
      toast.success("Application submitted successfully");
      router.push("/doctor/dashboard");
    } else {
      toast.error(data.error || "Failed to submit application");
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
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Medical License Number</label>
            <input
              className={inputClass}
              placeholder="Enter your registration/license number"
              value={form.licenseNumber}
              onChange={(e) =>
                setForm({ ...form, licenseNumber: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Specialization</label>
            <input
              className={inputClass}
              placeholder="e.g. Cardiology, Pediatrics"
              value={form.specialization}
              onChange={(e) =>
                setForm({ ...form, specialization: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Experience (in years)</label>
            <input
              type="number"
              className={inputClass}
              placeholder="e.g. 5"
              value={form.experience}
              onChange={(e) =>
                setForm({ ...form, experience: +e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Education / Qualification</label>
            <input
              className={inputClass}
              placeholder="e.g. MBBS, MD"
              value={form.qualification}
              onChange={(e) =>
                setForm({ ...form, qualification: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Hospital / Clinic Name</label>
            <input
              className={inputClass}
              placeholder="Where you currently practice"
              value={form.hospitalName}
              onChange={(e) =>
                setForm({ ...form, hospitalName: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Consultation Fee (INR per session)</label>
            <input
              type="number"
              className={inputClass}
              placeholder="e.g. 500"
              value={form.consultationFee}
              onChange={(e) =>
                setForm({ ...form, consultationFee: +e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Short Professional Bio</label>
          <textarea
            className={`${inputClass} w-full`}
            rows={4}
            placeholder="Briefly describe your expertise and patient care approach"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Languages Spoken</label>
          <input
            className={inputClass + " w-full"}
            placeholder="e.g. English, Hindi, Gujarati"
            value={form.languages}
            onChange={(e) => setForm({ ...form, languages: e.target.value })}
          />
        </div>

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
