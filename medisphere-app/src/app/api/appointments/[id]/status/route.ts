// app/api/appointments/[id]/status/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

const ALLOWED = ["PENDING","CONFIRMED","COMPLETED","CANCELLED","RESCHEDULED"] as const;
type Status = typeof ALLOWED[number];

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await req.json().catch(() => ({}));
  if (!ALLOWED.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 422 });

  const appt = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: { doctor: { select: { userId: true } }, patient: { select: { userId: true } } },
  });
  if (!appt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const uid = session.user.id;
  const isDoctorOwner = appt.doctor.userId === uid;
  const isPatientOwner = appt.patient.userId === uid;
  const isAdmin = (session.user as any).role === "ADMIN";

  // Authorization rules
  if (isDoctorOwner || isAdmin) {
    // doctor/admin can set any allowed status
  } else if (isPatientOwner) {
    if (status !== "CANCELLED") {
      return NextResponse.json({ error: "Patients may only cancel" }, { status: 403 });
    }
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.appointment.update({
    where: { id: appt.id },
    data: { status },
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}