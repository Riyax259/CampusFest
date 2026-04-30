import { signIn } from "@/app/lib/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-2">Welcome to CampusFest</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Discover and register for events at your college
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition"
          >
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}