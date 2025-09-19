import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const prescriptions = await prisma.prescription.findMany({
    where: {
      OR: [
        { doctor: { userId } },
        { appointment: { patient: { userId } } },
      ],
    },
    include: {
      appointment: true,
      doctor: { include: { user: true } },
    },
  });

  return NextResponse.json(prescriptions);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { appointmentId, medications, instructions } = await req.json();

  // check if user is a doctor
  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
  });

  if (!doctor) {
    return NextResponse.json({ error: "Not a doctor" }, { status: 403 });
  }

  const prescription = await prisma.prescription.create({
    data: {
      appointmentId,
      doctorId: doctor.id,
      medications,
      instructions,
    },
  });

  return NextResponse.json(prescription);
}
