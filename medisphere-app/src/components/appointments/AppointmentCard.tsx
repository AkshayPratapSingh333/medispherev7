// components/appointments/AppointmentCard.tsx
import Link from "next/link";

export default function AppointmentCard({ appointment }: { appointment: any }) {
  return (
    <div className="border rounded p-4">
      <h3 className="font-semibold">{appointment.doctor.user.name}</h3>
      <p>{new Date(appointment.scheduledAt).toLocaleString()}</p>
      <p>Status: {appointment.status}</p>
      <Link href={`/appointments/${appointment.id}`} className="text-blue-600 text-sm underline">
        View details
      </Link>
    </div>
  );
}
