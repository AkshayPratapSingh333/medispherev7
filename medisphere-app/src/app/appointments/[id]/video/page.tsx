// src/app/appointments/[id]/video/page.tsx
import { getSessionServer } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import MeetingRoomClient from '@/components/video/MeetingRoomClient';
import { redirect } from 'next/navigation';

export default async function VideoCallPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSessionServer();
  const user = session?.user;

  if (!user) {
    redirect('/auth/signin');
    return null;
  }

  // Fetch appointment details
  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      doctor: {
        include: { user: true },
      },
      patient: {
        include: { user: true },
      },
    },
  });

  if (!appointment) {
    redirect('/appointments');
    return null;
  }
  const safeAppointment = appointment;

  // Check if user is allowed to join this call
  const userId = user.id;
  const isDoctor = userId === safeAppointment.doctor.userId;
  const isPatient = userId === safeAppointment.patient.userId;

  if (!isDoctor && !isPatient) {
    redirect('/appointments');
  }

  return (
    <MeetingRoomClient roomId={safeAppointment.id} leavePath={`/appointments/${safeAppointment.id}`} />
  );
}
