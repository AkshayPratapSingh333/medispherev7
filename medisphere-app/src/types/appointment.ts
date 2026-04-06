// types/appointment.ts
export interface AppointmentDTO {
  id: string;
  doctorId: string;
  patientId: string;
  scheduledAt: string;
  duration: number;
  status: string;
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentOrderId?: string | null;
  paymentId?: string | null;
  paymentAmount?: number | null;
  paymentCurrency?: string | null;
  meetingLink?: string | null;
  notes?: string | null;
}
