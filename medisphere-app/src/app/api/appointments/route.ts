import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// Fetch all appointments (Admin or debugging purpose)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uid = session.user.id;
  const role = (session.user as any).role as "PATIENT" | "DOCTOR" | "ADMIN" | undefined;

  const where =
    role === "DOCTOR"
      ? { doctor: { userId: uid } }
      : role === "ADMIN"
      ? {}
      : { patient: { userId: uid } }; // default to patient

  const items = await prisma.appointment.findMany({
    where,
    orderBy: { scheduledAt: "asc" },
    include: {
      doctor: { include: { user: { select: { name: true, image: true, email: true } } } },
      patient: { include: { user: { select: { name: true, image: true, email: true } } } },
    },
    take: 200,
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { doctorId, scheduledAt, notes } = body as {
    doctorId?: string;
    scheduledAt?: string;
    notes?: string;
  };

  if (!doctorId || !scheduledAt) {
    return NextResponse.json({ error: "doctorId and scheduledAt are required" }, { status: 422 });
  }

  const when = new Date(scheduledAt);
  if (isNaN(when.getTime())) return NextResponse.json({ error: "Invalid scheduledAt" }, { status: 422 });
  if (when.getTime() < Date.now() - 60_000) {
    return NextResponse.json({ error: "Cannot book in the past" }, { status: 422 });
  }

  // Ensure doctor exists
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

  // Ensure current user has a patient row
  const patient = await prisma.patient.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  // Create appointment
  const appt = await prisma.appointment.create({
    data: {
      doctorId: doctor.id,
      patientId: patient.id,
      scheduledAt: when,
      status: "PENDING",
      notes: notes?.trim() || null,
    },
  });

  return NextResponse.json(appt, { status: 201 });
}