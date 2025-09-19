import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  });

  if (!patient) {
    return NextResponse.json({ error: "Not a patient" }, { status: 403 });
  }

  const meds = await prisma.medication.findMany({
    where: { patientId: patient.id },
  });

  return NextResponse.json(meds);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  });

  if (!patient) {
    return NextResponse.json({ error: "Not a patient" }, { status: 403 });
  }

  const { name, dosage, frequency, startDate, endDate, reminders } = await req.json();

  const med = await prisma.medication.create({
    data: {
      patientId: patient.id,
      name,
      dosage,
      frequency,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      reminders: JSON.stringify(reminders || []),
    },
  });

  return NextResponse.json(med);
}
