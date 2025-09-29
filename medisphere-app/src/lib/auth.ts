// lib/auth.ts
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "../app/api/auth/[...nextauth]/route";

/**
 * Get the NextAuth server session (typed).
 */
export async function getSessionServer(): Promise<Session | null> {
  // In App Router, getServerSession accepts (authOptions) only.
  return getServerSession(authOptions);
}

/**
 * Get just the typed user from the session (or null).
 */
export async function getCurrentUser() {
  const session = await getSessionServer();
  return session?.user ?? null; // user has { id, role, name?, email?, image? } per type augmentation
}

/**
 * Require that someone is logged in. Throws if not.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

/**
 * Require a specific role. Throws if mismatch.
 */
export async function requireRole(required: "ADMIN" | "DOCTOR" | "PATIENT") {
  const user = await requireUser();
  if (user.role !== required) throw new Error("Forbidden");
  return user;
}

/**
 * Role guards (convenience checks).
 */
export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN";
}
export async function isDoctor() {
  const user = await getCurrentUser();
  return user?.role === "DOCTOR";
}
export async function isPatient() {
  const user = await getCurrentUser();
  return user?.role === "PATIENT";
}
