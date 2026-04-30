import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OrganizerDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "ORGANIZER") redirect("/dashboard");

  const events = await prisma.event.findMany({
    where: { organizerId: session.user.id },
    include: { _count: { select: { registrations: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Organizer Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your events</p>
        </div>
        <Link
          href="/dashboard/organizer/create"
          className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          + Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl">
          <p className="text-4xl mb-4">📅</p>
          <p className="text-gray-500 text-sm mb-4">No events yet</p>
          <Link
            href="/dashboard/organizer/create"
            className="bg-black text-white text-sm px-5 py-2.5 rounded-lg hover:bg-gray-800 transition"
          >
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="border rounded-2xl p-5 flex items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      event.status === "PUBLISHED"
                        ? "bg-green-100 text-green-700"
                        : event.status === "DRAFT"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {event.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {event.category.replace("_", " ")}
                  </span>
                </div>
                <h2 className="font-semibold text-gray-900">{event.title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  📅{" "}
                  {new Date(event.startDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · 📍 {event.venue}, {event.city}
                </p>
              </div>

              <div className="text-center px-4">
                <p className="text-2xl font-semibold">
                  {event._count.registrations}
                </p>
                <p className="text-xs text-gray-400">registered</p>
                <p className="text-xs text-gray-400">
                  of {event.totalCapacity}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href={`/dashboard/organizer/${event.id}/attendees`}
                  className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 transition text-center"
                >
                  View Attendees
                </Link>
                <Link
                  href={`/events/${event.slug}`}
                  className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50 transition text-center"
                >
                  View Event
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}