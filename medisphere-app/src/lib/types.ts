// lib/types.ts
export type Role = "ADMIN" | "DOCTOR" | "PATIENT";

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";

export interface SessionUser {
  id: string;
  email?: string;
  name?: string;
  role?: Role;
}
