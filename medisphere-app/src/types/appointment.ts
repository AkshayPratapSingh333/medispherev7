// types/appointment.ts
export interface AppointmentDTO {
  id: string;
  doctorId: string;
  patientId: string;
  scheduledAt: string;
  duration: number;
  status: string;
  meetingLink?: string | null;
  notes?: string | null;
}
