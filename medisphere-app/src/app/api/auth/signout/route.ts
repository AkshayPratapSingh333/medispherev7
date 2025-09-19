// app/api/auth/signout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // For JWT sessions NextAuth handles signOut via client. Keep placeholder for hooks if needed.
  return NextResponse.json({ ok: true });
}
