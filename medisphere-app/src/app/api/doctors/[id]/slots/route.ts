// app/api/doctors/[id]/slots/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      select: { availableSchedule: true },
    });
    if (!doctor) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(doctor.availableSchedule);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
