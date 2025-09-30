// components/patients/PatientCard.tsx
export default function PatientCard({ patient }: { patient: any }) {
  return (
    <div className="group rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-cyan-900 font-semibold">
        {patient?.user?.name ?? "Patient"}
      </h3>
      <div className="mt-1 text-sm text-cyan-700/80">
        {patient?.gender || "—"}
      </div>
      <div className="mt-1 text-sm text-cyan-700/80">
        {patient?.phoneNumber || "—"}
      </div>
      <a
        href={`/admin/patients/${patient.id}`}
        className="mt-3 inline-flex items-center rounded-lg bg-cyan-600/10 px-3 py-2 text-sm font-medium text-cyan-800 ring-1 ring-cyan-200 hover:bg-cyan-600/15"
      >
        View
      </a>
    </div>
  );
}
