// components/doctors/DoctorProfile.tsx
import DoctorAvailability from "./DoctorAvailability";

type DoctorProfileProps = {
  doctor: {
    id: string;
    user: { name?: string | null; image?: string | null; email?: string | null };
    specialization: string;
    experience: number;
    qualification: string;
    hospitalName?: string | null;
    consultationFee: number;
    bio?: string | null;
    languages?: string[] | null;
    rating?: number | null;
    totalRatings?: number | null;
    availableSchedule?: Record<string, { from: string; to: string }[]> | null;
  };
};

export default function DoctorProfile({ doctor }: DoctorProfileProps) {
  const {
    user, specialization, experience, qualification, hospitalName,
    consultationFee, bio, languages = [], rating = 0, totalRatings = 0,
    availableSchedule,
  } = doctor;

  const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format;

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-200 to-emerald-200 ring-1 ring-cyan-200 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {user.image ? <img src={user.image} alt={user.name ?? "Doctor"} className="h-full w-full object-cover" /> : null}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-cyan-900">{user.name ?? "Doctor"}</h2>
              <p className="text-cyan-800/80">{specialization}</p>
              {hospitalName && <p className="text-sm text-cyan-700/70">{hospitalName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full sm:w-auto sm:grid-cols-3">
            <Stat label="Experience" value={`${experience} yrs`} />
            <Stat label="Fee" value={inr(consultationFee)} />
            <Stat label="Rating" value={`${Number(rating).toFixed(1)} (${totalRatings})`} />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-cyan-900">About</h3>
            <p className="mt-2 text-cyan-800/80 whitespace-pre-line">
              {bio || "No bio provided."}
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-cyan-900">Qualification</h3>
            <p className="mt-2 text-cyan-800/80">{qualification}</p>
          </div>

          {languages?.length ? (
            <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-cyan-900">Languages</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {languages.map((l, i) => (
                  <span key={i} className="rounded-lg bg-white px-2 py-1 text-sm text-cyan-800 ring-1 ring-cyan-200">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <DoctorAvailability slots={availableSchedule as any} />
        </div>

        {/* CTA card */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-cyan-900">Book a Session</h3>
            <p className="mt-2 text-sm text-cyan-800/80">
              Choose a suitable time from the availability and proceed to book.
            </p>
            <a
              href={`/appointments/book?doctorId=${doctor.id}`}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-white font-medium hover:from-cyan-600 hover:to-emerald-600"
            >
              Book Appointment
            </a>
          </div>

          <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-cyan-900">Contact</h3>
            <p className="mt-2 text-sm text-cyan-800/80">
              {user.email ?? "Not available"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-sky-50 to-emerald-50 p-3 text-center ring-1 ring-cyan-100">
      <div className="text-xs text-cyan-700/70">{label}</div>
      <div className="text-lg font-semibold text-cyan-900">{value}</div>
    </div>
  );
}
