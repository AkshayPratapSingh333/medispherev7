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

  if (!session?.user) {
    redirect('/auth/signin');
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
  }

  // Check if user is allowed to join this call
  const isDoctor = session.user.id === appointment.doctor.userId;
  const isPatient = session.user.id === appointment.patient.userId;

  if (!isDoctor && !isPatient) {
    redirect('/appointments');
  }

  return (
    <MeetingRoomClient roomId={appointment.id} leavePath={`/appointments/${appointment.id}`} />
  );
}
