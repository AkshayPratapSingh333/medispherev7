// app/api/appointments/[id]/status/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json();
    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: { status },
    });
    return NextResponse.json(appointment);
  } catch (err) {
    console.error("PUT /appointments/[id]/status error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
