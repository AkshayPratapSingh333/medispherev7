// app/appointments/page.tsx
import AppointmentList from "../../components/appointments/AppointmentList";

export const metadata = { title: "Appointments" };

export default function AppointmentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-100/60 via-teal-100/60 to-sky-100/60 blur-xl" />
          <div className="relative bg-white/90 backdrop-blur-sm border border-cyan-100 rounded-3xl px-6 py-6 shadow">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-emerald-700">
              Appointments
            </h1>
            <p className="text-cyan-800/70">View and manage your appointments.</p>
          </div>
        </div>
        <AppointmentList />
      </div>
    </div>
  );
}
