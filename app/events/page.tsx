import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;

  const events = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      ...(category && { category: category as any }),
      ...(search && {
        title: { contains: search, mode: "insensitive" },
      }),
    },
    include: { organizer: { select: { name: true, image: true } } },
    orderBy: { startDate: "asc" },
  });

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-2">Campus Events</h1>
      <p className="text-gray-500 mb-8">
        Discover hackathons, workshops, and fests at your college
      </p>

      {/* Search + Filter */}
      <form className="flex gap-3 mb-8 flex-wrap">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search events..."
          className="border rounded-lg px-4 py-2 text-sm flex-1 min-w-[200px]"
        />
        <select
          name="category"
          defaultValue={category}
          className="border rounded-lg px-4 py-2 text-sm"
        >
          <option value="">All categories</option>
          <option value="HACKATHON">Hackathon</option>
          <option value="TECH_TALK">Tech Talk</option>
          <option value="WORKSHOP">Workshop</option>
          <option value="CULTURAL">Cultural</option>
          <option value="SPORTS">Sports</option>
        </select>
        <button
          type="submit"
          className="bg-black text-white rounded-lg px-5 py-2 text-sm"
        >
          Search
        </button>
      </form>

      {/* Event Grid */}
      {events.length === 0 ? (
        <p className="text-red-400-400 text-center py-20">
          No events found. Check back soon!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="border rounded-xl overflow-hidden hover:shadow-md transition"
            >
              {/* Cover Image */}
              <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                {event.coverImage ? (
                  <img
                    src={event.coverImage}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">🎉</span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4">
                <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                  {event.category.replace("_", " ")}
                </span>
                <h2 className="font-semibold text-red-950-900 mt-1 mb-1 line-clamp-2">
                  {event.title}
                </h2>
                <p className="text-xs text-gray-500 mb-3">
                  📍 {event.venue}, {event.city}
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  📅{" "}
                  {new Date(event.startDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">
                    {event.isFree
                      ? "Free"
                      : `₹${(event.price / 100).toLocaleString("en-IN")}`}
                  </span>
                  <span className="text-xs text-gray-400">
                    {event.totalCapacity - event.registeredCount} seats left
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}