"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Booking = {
  id: number;
  customerName: string;
  customerPhone: string;
  vaccinesRequested: string;
  numberOfPeople: number;
  preferredDate: string | null;
  preferredTime: string | null;
  city: string;
  status: string;
  createdAt: string;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const customerId = typeof window !== "undefined" ? localStorage.getItem("portal_customerId") : null;

  useEffect(() => {
    if (!customerId) return;
    fetch(`/api/portal/bookings?customerId=${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [customerId]);

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    quoted: "bg-blue-100 text-blue-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    completed: "bg-gray-100 text-gray-700",
    cancelled: "bg-red-100 text-red-700",
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">My Bookings</h2>
        <Link
          href="/book"
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
        >
          + New Booking
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-500 mb-4">No bookings yet</p>
          <Link
            href="/book"
            className="text-emerald-600 hover:underline font-medium"
          >
            Book your first vaccination →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            let vaccines: string[] = [];
            try {
              vaccines = JSON.parse(booking.vaccinesRequested);
            } catch {
              vaccines = [booking.vaccinesRequested];
            }

            return (
              <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">
                      Booking #{booking.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status] || "bg-gray-100 text-gray-700"}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Vaccines:</span> {vaccines.join(", ")}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">People:</span> {booking.numberOfPeople}
                  </p>
                  {booking.preferredDate && (
                    <p className="text-gray-600">
                      <span className="font-medium">Preferred Date:</span> {booking.preferredDate}
                    </p>
                  )}
                  {booking.preferredTime && (
                    <p className="text-gray-600">
                      <span className="font-medium">Preferred Time:</span> {booking.preferredTime}
                    </p>
                  )}
                  <p className="text-gray-600">
                    <span className="font-medium">Location:</span> {booking.city}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  {booking.status === "pending" && (
                    <button
                      onClick={() => {
                        // TODO: Implement reschedule
                        alert("Reschedule feature coming soon!");
                      }}
                      className="text-sm text-emerald-600 hover:underline"
                    >
                      Request Reschedule
                    </button>
                  )}
                  <Link
                    href={`/portal/${customerId}/bookings/${booking.id}`}
                    className="text-sm text-emerald-600 hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
