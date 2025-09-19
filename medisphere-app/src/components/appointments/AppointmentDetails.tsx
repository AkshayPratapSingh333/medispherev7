// components/appointments/AppointmentDetails.tsx
export default function AppointmentDetails({ appointment }: { appointment: any }) {
  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold">Appointment with Dr. {appointment.doctor.user.name}</h2>
      <p>Patient: {appointment.patient.user.name}</p>
      <p>Date: {new Date(appointment.scheduledAt).toLocaleString()}</p>
      <p>Status: {appointment.status}</p>
      <p>Notes: {appointment.notes}</p>
    </div>
  );
}
