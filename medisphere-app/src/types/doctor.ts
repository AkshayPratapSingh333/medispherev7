// types/doctor.ts
export interface DoctorDTO {
  id: string;
  userId: string;
  licenseNumber: string;
  specialization: string;
  experience: number;
  qualification: string;
  hospitalName?: string;
  consultationFee: number;
  status: string;
  bio?: string;
  availableSchedule?: any;
  languages?: string[];
}
