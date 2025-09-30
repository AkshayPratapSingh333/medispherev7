import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    dateOfBirth, // string "YYYY-MM-DD"
    gender,
    phoneNumber,
    emergencyContact,
    medicalHistory,
    allergies,
  } = body;

  const dob = typeof dateOfBirth === "string" && dateOfBirth.trim()
    ? new Date(dateOfBirth)
    : null;

  try {
    const patient = await prisma.patient.upsert({
      where: { userId },
      update: {
        dateOfBirth: dob,
        gender: gender ?? null,
        phoneNumber: phoneNumber ?? null,
        emergencyContact: emergencyContact ?? null,
        medicalHistory: medicalHistory ?? null,
        allergies: allergies ?? null,
      },
      create: {
        userId,
        dateOfBirth: dob,
        gender: gender ?? null,
        phoneNumber: phoneNumber ?? null,
        emergencyContact: emergencyContact ?? null,
        medicalHistory: medicalHistory ?? null,
        allergies: allergies ?? null,
      },
    });

    return NextResponse.json({ ok: true, patient });
  } catch (err) {
    console.error("POST /patients/register error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
