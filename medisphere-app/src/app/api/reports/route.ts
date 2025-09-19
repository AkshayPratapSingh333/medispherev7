import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // check if user is a patient
  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  });

  if (!patient) {
    return NextResponse.json({ error: "Not a patient" }, { status: 403 });
  }

  const reports = await prisma.report.findMany({
    where: { patientId: patient.id },
  });

  return NextResponse.json(reports);
}
