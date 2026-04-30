"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");




  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  async function handlePayment() {
    setLoading(true);
    setError("");

    try {
      // Get event ID from slug first
      const eventRes = await fetch(`/api/events/by-slug/${params.slug}`);
      const eventData = await eventRes.json();

      if (!eventData.id) {
        setError("Event not found");
        setLoading(false);
        return;
      }

      // Create order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: eventData.id }),
      });

      const order = await orderRes.json();

      if (!orderRes.ok) {
        setError(order.error || "Failed to create order");
        setLoading(false);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: "rzp_test_SjHGHBuOBRRwxj",
        amount: order.amount,
        currency: order.currency,
        name: "CampusFest",
        description: order.eventName,
        order_id: order.orderId,
        handler: function () {
          // Payment successful — redirect to dashboard
          router.push("/dashboard?registered=true");
        },
        prefill: {name:"" , email:""},
        theme: { color: "#000000" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white border rounded-2xl p-8 w-full max-w-md text-center shadow-sm">
        <h1 className="text-2xl font-semibold mb-2">Complete Registration</h1>
        <p className="text-gray-500 text-sm mb-8">
          You will be redirected to a secure payment page
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 rounded-lg py-2 px-3">
            {error}
          </p>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? "Processing..." : "Pay & Register"}
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Secured by Razorpay
        </p>
      </div>
    </main>
  );
}