// app/appointments/[id]/page.tsx
import prisma from "../../../lib/prisma";
import AppointmentDetails from "../../../components/appointments/AppointmentDetails";
import AppointmentStatus from "../../../components/appointments/AppointmentStatus";

export default async function AppointmentPage({ params }: { params: { id: string } }) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: { doctor: { include: { user: true } }, patient: { include: { user: true } } },
  });

  if (!appointment) return <div>Not found</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <AppointmentDetails appointment={appointment} />
      <AppointmentStatus id={appointment.id} current={appointment.status} />
    </div>
  );
}
