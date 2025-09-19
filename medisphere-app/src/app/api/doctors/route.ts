// app/api/doctors/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { status: "APPROVED" },
      include: { user: true },
    });
    return NextResponse.json(doctors);
  } catch (err) {
    console.error("GET /doctors error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
