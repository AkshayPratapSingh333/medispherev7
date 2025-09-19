// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET() {
  const stats = {
    users: await prisma.user.count(),
    doctors: await prisma.doctor.count(),
    patients: await prisma.patient.count(),
    appointments: await prisma.appointment.count(),
    reports: await prisma.report.count(),
  };
  return NextResponse.json(stats);
}
