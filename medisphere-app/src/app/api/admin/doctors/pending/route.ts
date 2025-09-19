// app/api/admin/doctors/pending/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function GET() {
  const pending = await prisma.doctor.findMany({
    where: { status: "PENDING" },
    include: { user: true },
  });
  return NextResponse.json(pending);
}
