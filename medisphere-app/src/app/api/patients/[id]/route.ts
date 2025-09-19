// app/api/patients/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: { user: true, appointments: true, reports: true },
    });
    if (!patient) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(patient);
  } catch (err) {
    console.error("GET /patients/[id] error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const patient = await prisma.patient.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(patient);
  } catch (err) {
    console.error("PUT /patients/[id] error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
