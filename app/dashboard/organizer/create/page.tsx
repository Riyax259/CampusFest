"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = {
      title: form.get("title"),
      description: form.get("description"),
      category: form.get("category"),
      venue: form.get("venue"),
      city: form.get("city"),
      startDate: form.get("startDate"),
      endDate: form.get("endDate"),
      totalCapacity: Number(form.get("totalCapacity")),
      price: Math.round(Number(form.get("price")) * 100), // convert to paise
      isFree: form.get("isFree") === "on",
    };

    const res = await fetch("/api/organizer/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Failed to create event");
    } else {
      router.push("/dashboard/organizer");
    }
    setLoading(false);
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-2">Create Event</h1>
      <p className="text-gray-500 text-sm mb-8">
        Fill in the details to publish your event
      </p>

      {error && (
        <p className="text-red-500 text-sm mb-4 bg-red-50 rounded-lg py-2 px-3">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Event Title</label>
          <input
            name="title"
            required
            placeholder="HackFest 2025"
            className="w-full border rounded-lg px-4 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            required
            rows={4}
            placeholder="Tell attendees what this event is about..."
            className="w-full border rounded-lg px-4 py-2.5 text-sm resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              className="w-full border rounded-lg px-4 py-2.5 text-sm"
            >
              <option value="HACKATHON">Hackathon</option>
              <option value="TECH_TALK">Tech Talk</option>
              <option value="WORKSHOP">Workshop</option>
              <option value="CULTURAL">Cultural</option>
              <option value="SPORTS">Sports</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              name="city"
              required
              placeholder="Chandigarh"
              className="w-full border rounded-lg px-4 py-2.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Venue</label>
          <input
            name="venue"
            required
            placeholder="Main Auditorium, PEC"
            className="w-full border rounded-lg px-4 py-2.5 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date & Time</label>
            <input
              name="startDate"
              type="datetime-local"
              required
              className="w-full border rounded-lg px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date & Time</label>
            <input
              name="endDate"
              type="datetime-local"
              required
              className="w-full border rounded-lg px-4 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Total Capacity
            </label>
            <input
              name="totalCapacity"
              type="number"
              required
              min="1"
              placeholder="100"
              className="w-full border rounded-lg px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Price (₹)
            </label>
            <input
              name="price"
              type="number"
              min="0"
              placeholder="199"
              className="w-full border rounded-lg px-4 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="isFree" id="isFree" />
          <label htmlFor="isFree" className="text-sm text-gray-600">
            This is a free event
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Publish Event"}
        </button>
      </form>
    </main>
  );
}