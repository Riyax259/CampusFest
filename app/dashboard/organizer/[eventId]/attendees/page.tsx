import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";

export default async function AttendeesPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { eventId } = await params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.organizerId !== session.user.id) redirect("/dashboard");

  const registrations = await prisma.registration.findMany({
    where: { eventId, status: { in: ["CONFIRMED", "ATTENDED"] } },
    include: { user: { select: { name: true, email: true, image: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <a href="/dashboard/organizer" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to dashboard
        </a>
        <h1 className="text-3xl font-semibold mt-2">{event.title}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {registrations.length} of {event.totalCapacity} registered
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div
          className="bg-indigo-500 h-2 rounded-full"
          style={{
            width: `${Math.min(
              (registrations.length / event.totalCapacity) * 100,
              100
            )}%`,
          }}
        />
      </div>

      {registrations.length === 0 ? (
        <p className="text-center text-gray-400 py-20">
          No registrations yet
        </p>
      ) : (
        <div className="border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">
                  Attendee
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">
                  Email
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">
                  Registered
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {registrations.map((reg, i) => (
                <tr key={reg.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-medium">
                      {reg.user.name?.charAt(0).toUpperCase()}
                    </span>
                    {reg.user.name}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{reg.user.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        reg.status === "ATTENDED"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(reg.createdAt).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}