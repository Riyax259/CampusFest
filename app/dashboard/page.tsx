import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import QRCode from "react-qr-code";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const registrations = await prisma.registration.findMany({
    where: {
      userId: session.user.id,
      status: "CONFIRMED",
    },
    include: {
      event: {
        select: {
          title: true,
          slug: true,
          startDate: true,
          venue: true,
          city: true,
          category: true,
          coverImage: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">My Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, {session.user.name?.split(" ")[0]}
          </p>
        </div>
        <Link
          href="/events"
          className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          Browse Events
        </Link>
      </div>

      {registrations.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl">
          <p className="text-4xl mb-4">🎟️</p>
          <p className="text-gray-500 text-sm mb-4">
            You haven't registered for any events yet
          </p>
          <Link
            href="/events"
            className="text-sm bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition"
          >
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className="border rounded-2xl overflow-hidden"
            >
              {/* Top color bar */}
              <div className="h-2 bg-gradient-to-r from-indigo-400 to-purple-400" />

              <div className="p-5">
                <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                  {reg.event.category.replace("_", " ")}
                </span>
                <h2 className="font-semibold text-lg mt-1 mb-3">
                  {reg.event.title}
                </h2>

                <div className="space-y-1 text-sm text-gray-500 mb-4">
                  <p>
                    📅{" "}
                    {new Date(reg.event.startDate).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p>📍 {reg.event.venue}, {reg.event.city}</p>
                </div>

                {/* Real QR Code */}
<div className="bg-white rounded-xl p-4 flex flex-col items-center mb-4 border">
  <QRCode
    value={reg.qrCode}
    size={96}
    style={{ height: "auto", maxWidth: "100%", width: "96px" }}
  />
  <p className="text-xs text-gray-400 font-mono mt-2">
    {reg.qrCode.slice(0, 16)}...
  </p>
</div>

                {/* Status badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      reg.status === "ATTENDED"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {reg.status === "ATTENDED" ? "✓ Attended" : "Registered"}
                  </span>
                  <Link
                    href={`/events/${reg.event.slug}`}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    View event →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}