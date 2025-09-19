// types/patient.ts
export interface PatientDTO {
  id: string;
  userId: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  phoneNumber?: string | null;
  emergencyContact?: string | null;
  medicalHistory?: string | null;
  allergies?: string | null;
}
