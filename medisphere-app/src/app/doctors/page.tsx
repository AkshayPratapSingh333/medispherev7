import DoctorList from "../../components/doctors/DoctorList";

export const metadata = {
  title: "Find Doctors",
  description: "Browse all registered doctors and book appointments",
};

export default function DoctorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50">
      <section className="max-w-6xl mx-auto px-6 pt-8">
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-100/60 via-teal-100/60 to-sky-100/60 blur-xl" />
          <div className="relative bg-white/90 backdrop-blur-sm border border-cyan-100 rounded-3xl px-6 py-6 shadow">
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-emerald-700">
              Doctors
            </h1>
            <p className="mt-1 text-cyan-800/70">
              All registered doctors at a glance. Pick one to see availability and book.
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <a
            href="/appointments/book"
            className="inline-flex items-center rounded-lg bg-cyan-600/10 px-3 py-2 text-sm font-medium text-cyan-800 ring-1 ring-cyan-200 hover:bg-cyan-600/15"
          >
            Book Appointment
          </a>
          <a
            href="/doctors/apply"
            className="inline-flex items-center rounded-lg bg-emerald-600/10 px-3 py-2 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-600/15"
          >
            Apply as Doctor
          </a>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-10">
        <DoctorList />
      </section>
    </div>
  );
}
