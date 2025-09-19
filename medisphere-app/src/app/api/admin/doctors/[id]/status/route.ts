// app/api/admin/doctors/[id]/status/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { status } = await req.json();
  const doctor = await prisma.doctor.update({
    where: { id: params.id },
    data: { status },
  });
  return NextResponse.json(doctor);
}
