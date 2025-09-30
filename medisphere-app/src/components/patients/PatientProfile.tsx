// components/patient/PatientProfile.tsx
type PatientProfileProps = {
  patient: {
    id: string;
    user?: { name?: string | null; email?: string | null } | null;
    dateOfBirth?: Date | string | null;
    gender?: string | null;
    phoneNumber?: string | null;
    emergencyContact?: string | null;
    medicalHistory?: string | null;
    allergies?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };
};

function fmtDate(d?: Date | string | null) {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dt.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(dt);
  } catch {
    return dt.toISOString().slice(0, 10);
  }
}

export default function PatientProfile({ patient }: PatientProfileProps) {
  return (
    <div className="rounded-3xl border border-cyan-100 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-cyan-100 bg-gradient-to-r from-sky-50 via-cyan-50 to-emerald-50">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-emerald-700">
          Patient Profile
        </h2>
        <p className="text-cyan-800/70">
          {patient.user?.name ?? "Patient"} · {patient.user?.email ?? "—"}
        </p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Date of Birth" value={fmtDate(patient.dateOfBirth)} />
        <Field label="Gender" value={patient.gender || "—"} />
        <Field label="Phone Number" value={patient.phoneNumber || "—"} />
        <Field label="Emergency Contact" value={patient.emergencyContact || "—"} />

        <Area label="Medical History" value={patient.medicalHistory || "—"} />
        <Area label="Allergies" value={patient.allergies || "—"} />
      </div>

      <div className="px-6 pb-6">
        <div className="rounded-xl bg-gradient-to-br from-sky-50 to-emerald-50 p-3 ring-1 ring-cyan-100">
          <div className="text-xs text-cyan-700/70">
            Last updated: {fmtDate(patient.updatedAt as any)}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-cyan-100 p-4 bg-white">
      <div className="text-xs text-cyan-700/70">{label}</div>
      <div className="mt-0.5 font-medium text-cyan-900">{value}</div>
    </div>
  );
}

function Area({ label, value }: { label: string; value: string }) {
  return (
    <div className="md:col-span-2 rounded-xl border border-cyan-100 p-4 bg-white">
      <div className="text-xs text-cyan-700/70">{label}</div>
      <div className="mt-1 text-cyan-900 whitespace-pre-line">{value}</div>
    </div>
  );
}
