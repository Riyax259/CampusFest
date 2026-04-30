import { auth } from "@/app/lib/auth";
import { signOut } from "@/app/lib/auth";
import Link from "next/link";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b px-4 py-3 flex items-center justify-between max-w-5xl mx-auto">
      <Link href="/events" className="font-semibold text-lg">
        🎉 CampusFest
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/events" className="text-sm text-gray-500 hover:text-gray-900">
          Events
        </Link>

        {session?.user ? (
          <>
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              My Tickets
            </Link>
            {(session.user as any).role === "ORGANIZER" && (
  <Link
    href="/dashboard/organizer"
    className="text-sm text-gray-500 hover:text-gray-900"
  >
    My Events
  </Link>
)}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition">
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/login"
            className="text-sm bg-black text-white px-4 py-1.5 rounded-lg hover:bg-gray-800 transition"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}