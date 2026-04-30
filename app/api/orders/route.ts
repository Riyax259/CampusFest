import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await req.json();

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Check capacity
  if (event.registeredCount >= event.totalCapacity) {
    return NextResponse.json({ error: "Event is sold out" }, { status: 409 });
  }

  // Check duplicate registration
  const existing = await prisma.registration.findUnique({
    where: { userId_eventId: { userId: session.user.id, eventId } },
  });
  if (existing?.status === "CONFIRMED") {
    return NextResponse.json({ error: "Already registered" }, { status: 409 });
  }

  // Create Razorpay order
  const rpOrder = await razorpay.orders.create({
    amount: event.price,
    currency: "INR",
    receipt: `evt_${eventId.slice(-6)}_usr_${session.user.id.slice(-6)}`,
  });

  // Save order to DB
  await prisma.order.create({
    data: {
      razorpayOrderId: rpOrder.id,
      userId: session.user.id,
      eventId,
      amount: event.price,
      status: "CREATED",
    },
  });

  // Create pending registration
  await prisma.registration.upsert({
    where: { userId_eventId: { userId: session.user.id, eventId } },
    create: {
      userId: session.user.id,
      eventId,
      orderId: rpOrder.id,
      status: "PENDING",
    },
    update: { orderId: rpOrder.id, status: "PENDING" },
  });

  return NextResponse.json({
    orderId: rpOrder.id,
    amount: event.price,
    currency: "INR",
    eventName: event.title,
  });
}