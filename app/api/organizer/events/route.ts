import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import slugify from "slugify";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Make user an organizer if not already
  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "ORGANIZER" },
  });

  const body = await req.json();

  const slug = slugify(body.title, { lower: true, strict: true }) +
    "-" + Date.now().toString().slice(-4);

  const event = await prisma.event.create({
    data: {
      title: body.title,
      slug,
      description: body.description,
      category: body.category,
      venue: body.venue,
      city: body.city,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      totalCapacity: body.totalCapacity,
      price: body.isFree ? 0 : body.price,
      isFree: body.isFree,
      status: "PUBLISHED",
      organizerId: session.user.id,
    },
  });

  return NextResponse.json(event);
}