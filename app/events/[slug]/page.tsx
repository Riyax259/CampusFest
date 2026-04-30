import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      organizer: { select: { name: true, image: true } },
      _count: { select: { registrations: true } },
    },
  });

  if (!event) notFound();

  const session = await auth();

  // Check if current user already registered
  let alreadyRegistered = false;
  if (session?.user?.id) {
    const existing = await prisma.registration.findUnique({
      where: {
        userId_eventId: { userId: session.user.id, eventId: event.id },
      },
    });
    alreadyRegistered = existing?.status === "CONFIRMED";
  }

  const seatsLeft = event.totalCapacity - event.registeredCount;
  const isSoldOut = seatsLeft <= 0;

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      {/* Back button */}
      <Link href="/events" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">
        ← Back to events
      </Link>

      {/* Cover */}
      <div className="h-56 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-8">
        <span className="text-7xl">🎉</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left — event info */}
        <div className="md:col-span-2">
          <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
            {event.category.replace("_", " ")}
          </span>
          <h1 className="text-3xl font-semibold mt-1 mb-4">{event.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
            <span>📍 {event.venue}, {event.city}</span>
            <span>
              📅{" "}
              {new Date(event.startDate).toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span>👤 Organised by {event.organizer.name}</span>
          </div>

          <h2 className="font-semibold text-lg mb-2">About this event</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        </div>

        {/* Right — registration card */}
        <div className="md:col-span-1">
          <div className="border rounded-2xl p-6 sticky top-6">
            <div className="text-2xl font-bold mb-1">
              {event.isFree ? "Free" : `₹${(event.price / 100).toLocaleString("en-IN")}`}
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {isSoldOut ? (
                <span className="text-red-500 font-medium">Sold out</span>
              ) : (
                <span className="text-green-600 font-medium">{seatsLeft} seats left</span>
              )}
            </p>

            {/* Capacity bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
              <div
                className="bg-indigo-500 h-1.5 rounded-full"
                style={{
                  width: `${Math.min(
                    (event.registeredCount / event.totalCapacity) * 100,
                    100
                  )}%`,
                }}
              />
            </div>

            {alreadyRegistered ? (
              <div className="w-full text-center bg-green-50 text-green-700 border border-green-200 rounded-xl py-3 text-sm font-medium">
                ✓ You are registered!
              </div>
            ) : isSoldOut ? (
              <button
                disabled
                className="w-full bg-gray-100 text-gray-400 rounded-xl py-3 text-sm font-medium cursor-not-allowed"
              >
                Sold Out
              </button>
            ) : !session ? (
              <Link
                href="/login"
                className="block w-full text-center bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition"
              >
                Sign in to Register
              </Link>
            ) : (
              <Link
                href={`/events/${event.slug}/register`}
                className="block w-full text-center bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition"
              >
                Register Now
              </Link>
            )}

            <p className="text-xs text-gray-400 text-center mt-3">
              {event.registeredCount} people registered
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}