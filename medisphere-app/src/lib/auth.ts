// lib/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "../app/api/auth/[...nextauth]/route";
import type { Session } from "next-auth";

export async function getSessionServer(): Promise<Session | null> {
  return await getServerSession(authOptions);
}

export async function requireRole(required: "ADMIN" | "DOCTOR" | "PATIENT") {
  const session = await getSessionServer();
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== required) throw new Error("Forbidden");
  return session;
}
