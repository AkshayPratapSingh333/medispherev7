import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = await req.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID required" },
        { status: 400 }
      );
    }

    // Verify appointment exists and user has access
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    const isAuthorized =
      appointment.doctor.userId === userId ||
      appointment.patient.userId === userId;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate shareable meeting link with instant room ID format
    const roomId = `instant-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const meetingLink = `${baseUrl}/meet/${roomId}`;

    // Optionally update appointment with meeting link
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { meetingLink },
    });

    return NextResponse.json({
      meetingLink,
      roomId: roomId,
    });
  } catch (error) {
    console.error("Error generating meeting link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
