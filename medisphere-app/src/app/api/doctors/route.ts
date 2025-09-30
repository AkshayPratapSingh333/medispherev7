import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

// GET /api/doctors
// Returns ALL doctors (no status filter) for the public directory.
// If you later want filtering, add ?status=APPROVED|PENDING|REJECTED.
export async function GET() {
  const doctors = await prisma.doctor.findMany({
    select: {
      id: true,
      specialization: true,
      experience: true,
      hospitalName: true,
      consultationFee: true,
      languages: true,
      rating: true,
      totalRatings: true,
      user: { select: { name: true, image: true } },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  return NextResponse.json(doctors);
}
