// types/auth.ts
export interface UserDTO {
  id: string;
  name?: string;
  email: string;
  role?: "ADMIN" | "DOCTOR" | "PATIENT";
}
