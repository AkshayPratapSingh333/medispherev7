import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// Fetch all appointments (Admin or debugging purpose)
export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });
    return NextResponse.json(appointments);
  } catch (err) {
    console.error("GET /appointments error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Book a new appointment (Patient only)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { doctorId, scheduledAt, duration, notes } = await req.json();

  try {
    // Ensure current user is a patient
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
    });

    if (!patient) {
      return NextResponse.json({ error: "Not a patient" }, { status: 403 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientId: patient.id,
        scheduledAt: new Date(scheduledAt),
        duration,
        notes,
      },
    });

    return NextResponse.json(appointment);
  } catch (err) {
    console.error("POST /appointments error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
