import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // First create a test organizer user
  const organizer = await prisma.user.upsert({
    where: { email: "organizer@test.com" },
    update: {},
    create: {
      email: "organizer@test.com",
      name: "Test Organizer",
      role: "ORGANIZER",
    },
  });

  // Create a test event
  await prisma.event.upsert({
    where: { slug: "hackfest-2025" },
    update: {},
    create: {
      title: "HackFest 2025",
      slug: "hackfest-2025",
      description:
        "A 24-hour hackathon where students build innovative solutions. Join us for an exciting night of coding, creativity, and collaboration!",
      category: "HACKATHON",
      status: "PUBLISHED",
      venue: "Main Auditorium",
      city: "Ludhiana",
      startDate: new Date("2025-12-15T09:00:00"),
      endDate: new Date("2025-12-16T09:00:00"),
      totalCapacity: 200,
      price: 19900,
      isFree: false,
      organizerId: organizer.id,
    },
  });

  console.log("Seeded successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());