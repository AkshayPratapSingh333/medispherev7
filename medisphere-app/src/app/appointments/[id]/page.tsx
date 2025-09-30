// app/appointments/[id]/page.tsx
import prisma from "../../../lib/prisma";
import AppointmentDetails from "../../../components/appointments/AppointmentDetails";
import AppointmentStatus from "../../../components/appointments/AppointmentStatus";

export default async function AppointmentPage({ params }: { params: { id: string } }) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: { doctor: { include: { user: true } }, patient: { include: { user: true } } },
  });

  if (!appointment) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-cyan-800">Appointment not found</div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">
        <AppointmentDetails appointment={appointment} />
        <AppointmentStatus id={appointment.id} current={appointment.status} />
      </div>
    </div>
  );
}