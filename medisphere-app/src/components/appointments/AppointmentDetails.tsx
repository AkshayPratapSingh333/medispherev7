// components/appointments/AppointmentDetails.tsx
function fmt(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  try {
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
  } catch {
    return date.toString();
  }
}

export default function AppointmentDetails({ appointment }: { appointment: any }) {
  return (
    <div className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-emerald-700">
        Appointment
      </h2>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Doctor" value={`Dr. ${appointment.doctor.user.name}`} />
        <Field label="Patient" value={appointment.patient.user.name} />
        <Field label="Date & Time" value={fmt(appointment.scheduledAt)} />
        <Field label="Status" value={appointment.status} />
      </div>

      <div className="mt-4 rounded-xl border border-cyan-100 p-4">
        <div className="text-xs text-cyan-700/70">Notes</div>
        <div className="mt-1 text-cyan-900">{appointment.notes || "—"}</div>
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
