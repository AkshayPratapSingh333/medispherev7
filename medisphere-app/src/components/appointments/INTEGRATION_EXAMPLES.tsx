// Example: Add QuickMeeting to your appointment detail page
/* eslint-disable @typescript-eslint/no-explicit-any */

import QuickMeeting from "@/components/appointments/QuickMeeting";

export default function AppointmentDetail({ appointment }: { appointment: any }) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Appointment Info */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="text-2xl font-bold mb-4">Appointment Details</h2>
        <div className="space-y-2">
          <p><strong>Doctor:</strong> {appointment.doctor.user.name}</p>
          <p><strong>Patient:</strong> {appointment.patient.user.name}</p>
          <p><strong>Time:</strong> {new Date(appointment.scheduledAt).toLocaleString()}</p>
          <p><strong>Status:</strong> {appointment.status}</p>
        </div>
      </div>

      {/* Video Meeting Component */}
      <QuickMeeting
        appointmentId={appointment.id}
        doctorName={appointment.doctor.user.name}
        patientName={appointment.patient.user.name}
      />

      {/* Other appointment sections... */}
    </div>
  );
}

// Example: Direct navigation to meeting
import { useRouter } from "next/navigation";
