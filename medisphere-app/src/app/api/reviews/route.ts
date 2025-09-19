import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // check if current user is a patient
  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  });

  if (!patient) {
    return NextResponse.json({ error: "Not a patient" }, { status: 403 });
  }

  const { doctorId, rating, comment } = await req.json();

  // create new review
  const review = await prisma.review.create({
    data: {
      doctorId,
      patientId: patient.id,
      rating,
      comment,
    },
  });

  // update doctor's aggregated rating
  const agg = await prisma.review.aggregate({
    where: { doctorId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.doctor.update({
    where: { id: doctorId },
    data: {
      rating: agg._avg.rating ?? 0,
      totalRatings: agg._count.rating,
    },
  });

  return NextResponse.json(review);
}

export async function GET() {
  const reviews = await prisma.review.findMany({
    include: {
      patient: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}
