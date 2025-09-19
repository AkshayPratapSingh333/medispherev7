import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const body = await req.json();
  const {
    licenseNumber,
    specialization,
    experience,
    qualification,
    hospitalName,
    consultationFee,
    bio,
    availableSchedule,
    languages,
  } = body ?? {};

  try {
    const doctor = await prisma.doctor.create({
      data: {
        userId,
        licenseNumber,
        specialization,
        experience: parseInt(experience, 10),
        qualification,
        hospitalName,
        consultationFee: parseFloat(consultationFee),
        bio,
        availableSchedule: availableSchedule ?? {}, // 👈 directly JSON
        languages: Array.isArray(languages) ? languages : [], // 👈 directly JSON
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { role: "DOCTOR" },
    });

    return NextResponse.json({ doctor });
  } catch (err: unknown) {
    console.error("POST /doctors/register error", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
