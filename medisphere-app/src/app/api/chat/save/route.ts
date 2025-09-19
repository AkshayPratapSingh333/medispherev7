import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function POST(req: Request) {
  const { roomId, text, sender } = await req.json();

  // Ensure appointmentId is string, since schema expects String
  const appointmentId = String(roomId).replace("appointment_", "");

  // Ensure senderId is string too
  const senderId = String(sender?.id ?? "");

  if (!senderId) {
    return NextResponse.json({ error: "Missing senderId" }, { status: 400 });
  }

  const msg = await prisma.chatMessage.create({
    data: {
      appointmentId,
      senderId,
      senderType: sender?.role ?? "PATIENT",
      message: text,
      messageType: "text",
    },
  });

  return NextResponse.json({ ok: true, msg });
}
