import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getRazorpayClient, getRazorpayPublicKey } from "@/lib/razorpay";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const doctorId = typeof body?.doctorId === "string" ? body.doctorId.trim() : "";
  if (!doctorId) {
    return NextResponse.json({ error: "doctorId is required" }, { status: 422 });
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: {
      id: true,
      consultationFee: true,
      user: { select: { name: true } },
    },
  });

  if (!doctor) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }

  const fee = Number(doctor.consultationFee ?? 0);
  if (!Number.isFinite(fee) || fee <= 0) {
    return NextResponse.json({ error: "Doctor consultation fee is invalid" }, { status: 422 });
  }

  const amount = Math.round(fee * 100);
  const receipt = `ms_${doctor.id.slice(0, 8)}_${Date.now()}`;

  let order;
  try {
    const razorpay = getRazorpayClient();
    order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt,
      notes: {
        doctorId: doctor.id,
        userId: session.user.id,
      },
    });
  } catch (error) {
    console.error("Razorpay order creation failed", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }

  const keyId = getRazorpayPublicKey();
  if (!keyId) {
    return NextResponse.json({ error: "Razorpay public key is not configured" }, { status: 500 });
  }

  return NextResponse.json({
    keyId,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    doctorName: doctor.user?.name ?? "Doctor",
  });
}
