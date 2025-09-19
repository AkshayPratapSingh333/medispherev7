// app/api/admin/alerts/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Placeholder — could fetch from monitoring system
  return NextResponse.json([
    { id: 1, message: "Server load high", level: "warning" },
    { id: 2, message: "Failed login attempts detected", level: "critical" },
  ]);
}
