import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getRazorpayClient } from "@/lib/razorpay";

function secureHexEqual(a: string, b: string) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const doctorId = typeof body.doctorId === "string" ? body.doctorId.trim() : "";
  const scheduledAt = typeof body.scheduledAt === "string" ? body.scheduledAt.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  const orderId = typeof body.razorpayOrderId === "string" ? body.razorpayOrderId.trim() : "";
  const paymentId = typeof body.razorpayPaymentId === "string" ? body.razorpayPaymentId.trim() : "";
  const signature = typeof body.razorpaySignature === "string" ? body.razorpaySignature.trim() : "";

  if (!doctorId || !scheduledAt || !orderId || !paymentId || !signature) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 422 });
  }

  const when = new Date(scheduledAt);
  if (Number.isNaN(when.getTime())) {
    return NextResponse.json({ error: "Invalid scheduledAt" }, { status: 422 });
  }
  if (when.getTime() < Date.now() - 60_000) {
    return NextResponse.json({ error: "Cannot book in the past" }, { status: 422 });
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: { id: true, consultationFee: true },
  });
  if (!doctor) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }

  const amount = Math.round(Number(doctor.consultationFee ?? 0) * 100);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Doctor consultation fee is invalid" }, { status: 422 });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Razorpay secret is not configured" }, { status: 500 });
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (!secureHexEqual(expected, signature)) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  let order;
  let payment;
  try {
    const razorpay = getRazorpayClient();
    [order, payment] = await Promise.all([
      razorpay.orders.fetch(orderId),
      razorpay.payments.fetch(paymentId),
    ]);
  } catch (error) {
    console.error("Razorpay verification fetch failed", error);
    return NextResponse.json({ error: "Could not verify payment state" }, { status: 502 });
  }

  if (payment.order_id !== orderId) {
    return NextResponse.json({ error: "Payment does not belong to order" }, { status: 400 });
  }
  if (order.amount !== amount || order.currency !== "INR") {
    return NextResponse.json({ error: "Order amount or currency mismatch" }, { status: 400 });
  }

  const orderUserId = String(order.notes?.userId ?? "");
  const orderDoctorId = String(order.notes?.doctorId ?? "");
  if (orderUserId !== session.user.id || orderDoctorId !== doctor.id) {
    return NextResponse.json({ error: "Order metadata mismatch" }, { status: 400 });
  }

  if (!["captured", "authorized"].includes(String(payment.status ?? ""))) {
    return NextResponse.json({ error: "Payment is not successful" }, { status: 400 });
  }

  const patient = await prisma.patient.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  const paymentReference = `PaymentRef: ${paymentId} | OrderRef: ${orderId}`;
  const mergedNotes = [notes, paymentReference].filter(Boolean).join("\n\n");

  const appointment = await prisma.appointment.create({
    data: {
      doctorId: doctor.id,
      patientId: patient.id,
      scheduledAt: when,
      status: "PENDING",
      notes: mergedNotes || null,
    },
    select: { id: true },
  });

  return NextResponse.json({ id: appointment.id, alreadyProcessed: false });
}
