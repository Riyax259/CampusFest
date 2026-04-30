import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  // Verify signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event !== "payment.captured") {
    return NextResponse.json({ received: true });
  }

  const { order_id, id: paymentId } = event.payload.payment.entity;

  // Idempotency check
  const order = await prisma.order.findUnique({
    where: { razorpayOrderId: order_id },
  });

  if (!order || order.webhookProcessed) {
    return NextResponse.json({ received: true });
  }

  // Atomic transaction
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { razorpayOrderId: order_id },
      data: {
        status: "PAID",
        razorpayPaymentId: paymentId,
        webhookProcessed: true,
      },
    });

    await tx.registration.update({
      where: {
        userId_eventId: { userId: order.userId, eventId: order.eventId },
      },
      data: { status: "CONFIRMED", paymentId },
    });

    await tx.event.update({
      where: { id: order.eventId },
      data: { registeredCount: { increment: 1 } },
    });
  });

  return NextResponse.json({ received: true });
}