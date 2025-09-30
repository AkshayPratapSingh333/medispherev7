// app/api/appointments/[id]/reschedule/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object")
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { scheduledAt, reason } = body as { scheduledAt?: string; reason?: string };

  if (!scheduledAt) {
    return NextResponse.json({ error: "scheduledAt (ISO) is required" }, { status: 422 });
  }

  const when = new Date(scheduledAt);
  if (isNaN(when.getTime())) {
    return NextResponse.json({ error: "Invalid scheduledAt" }, { status: 422 });
  }
  if (when.getTime() < Date.now() - 60_000) {
    return NextResponse.json({ error: "Cannot reschedule to a past time" }, { status: 422 });
  }

  const appt = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      doctor: { select: { id: true, userId: true } },
      patient: { select: { id: true, userId: true } },
    },
  });
  if (!appt) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });

  const uid = session.user.id;
  const role = (session.user as any).role as "ADMIN" | "DOCTOR" | "PATIENT" | undefined;

  const isDoctorOwner = appt.doctor.userId === uid;
  const isPatientOwner = appt.patient.userId === uid;
  const isAdmin = role === "ADMIN";

  if (!(isDoctorOwner || isPatientOwner || isAdmin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Optional conflict check: block exact overlaps for the same doctor within ±30 min window
  const windowMinutes = 30;
  const start = new Date(when.getTime() - windowMinutes * 60_000);
  const end = new Date(when.getTime() + windowMinutes * 60_000);

  const conflict = await prisma.appointment.findFirst({
    where: {
      id: { not: appt.id },
      doctorId: appt.doctor.id,
      scheduledAt: { gte: start, lte: end },
      status: { in: ["PENDING", "CONFIRMED", "RESCHEDULED"] },
    },
    select: { id: true },
  });

  if (conflict) {
    return NextResponse.json(
      { error: "Selected time conflicts with another appointment" },
      { status: 409 }
    );
  }

  const updated = await prisma.appointment.update({
    where: { id: appt.id },
    data: {
      scheduledAt: when,
      status: "RESCHEDULED",
      // If you track an audit trail, you could write reason to a notes log table.
      // For simplicity, we append reason to notes.
      notes:
        reason?.trim()
          ? `${appt.notes ? appt.notes + "\n" : ""}[Reschedule] ${reason.trim()}`
          : appt.notes,
    },
    include: {
      doctor: { include: { user: true } },
      patient: { include: { user: true } },
    },
  });

  return NextResponse.json(updated);
}
