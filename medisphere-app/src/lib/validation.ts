// lib/validation.ts
import { z } from "zod";

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export const DoctorApplicationSchema = z.object({
  licenseNumber: z.string(),
  specialization: z.string(),
  experience: z.number().int().nonnegative(),
  qualification: z.string(),
  consultationFee: z.number().nonnegative(),
  bio: z.string().optional(),
  availableSchedule: z.any().optional(),
  languages: z.any().optional(),
});
