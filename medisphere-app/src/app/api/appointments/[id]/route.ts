// app/api/appointments/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
        chatMessages: true,
      },
    });
    if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(appointment);
  } catch (err) {
    console.error("GET /appointments/[id] error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
