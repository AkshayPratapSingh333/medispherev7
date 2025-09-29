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
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

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
  } = body;

  try {
    const doctor = await prisma.doctor.upsert({
      where: { userId },
      update: {
        licenseNumber,
        specialization,
        experience: Number(experience),
        qualification,
        hospitalName: hospitalName || null,
        consultationFee: Number(consultationFee),
        bio: bio || null,
        availableSchedule: availableSchedule ?? {},
        languages: Array.isArray(languages) ? languages : [],
      },
      create: {
        userId,
        licenseNumber,
        specialization,
        experience: Number(experience),
        qualification,
        hospitalName: hospitalName || null,
        consultationFee: Number(consultationFee),
        bio: bio || null,
        availableSchedule: availableSchedule ?? {},
        languages: Array.isArray(languages) ? languages : [],
        status: "PENDING",
        rating: 0,
        totalRatings: 0,
      },
    });

    // Ensure the user role is updated
    await prisma.user.update({
      where: { id: userId },
      data: { role: "DOCTOR" },
    });

    return NextResponse.json({ doctor });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: `Duplicate value for unique field: ${err.meta?.target}` },
        { status: 409 }
      );
    }
    console.error("POST /doctors/register error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
