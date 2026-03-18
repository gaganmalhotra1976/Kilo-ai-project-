"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Booking = {
  id: number;
  status: string;
  vaccinesRequested: string;
  createdAt: string;
};

type Quote = {
  id: number;
  status: string;
  total: number;
};

type Voucher = {
  id: number;
  status: string;
};

export default function CustomerDashboard() {
  const [stats, setStats] = useState({
    bookings: 0,
    pendingQuotes: 0,
    activeVouchers: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const customerId = typeof window !== "undefined" ? localStorage.getItem("portal_customerId") : null;

  useEffect(() => {
    if (!customerId) return;

    Promise.all([
      fetch(`/api/portal/bookings?customerId=${customerId}`).then((r) => r.json()),
      fetch(`/api/portal/quotes?customerId=${customerId}`).then((r) => r.json()),
      fetch(`/api/portal/vouchers?customerId=${customerId}`).then((r) => r.json()),
    ]).then(([bookings, quotes, vouchers]) => {
      setStats({
        bookings: bookings.length,
        pendingQuotes: quotes.filter((q: any) => q.status === "sent").length,
        activeVouchers: vouchers.filter((v: any) => v.status === "active").length,
      });
      setRecentBookings(bookings.slice(0, 3));
      setLoading(false);
    });
  }, [customerId]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    quoted: "bg-blue-100 text-blue-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    completed: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-emerald-600">{stats.bookings}</p>
          <p className="text-sm text-gray-500">Total Bookings</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.pendingQuotes}</p>
          <p className="text-sm text-gray-500">Pending Quotes</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-purple-600">{stats.activeVouchers}</p>
          <p className="text-sm text-gray-500">Active Vouchers</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/book"
          className="bg-emerald-600 text-white rounded-xl p-5 text-center hover:bg-emerald-700 transition-colors"
        >
          <div className="text-2xl mb-2">💉</div>
          <p className="font-bold">Book Vaccination</p>
          <p className="text-sm text-emerald-100">Schedule a home visit</p>
        </Link>
        <a
          href="tel:9999109040"
          className="bg-teal-600 text-white rounded-xl p-5 text-center hover:bg-teal-700 transition-colors"
        >
          <div className="text-2xl mb-2">📞</div>
          <p className="font-bold">Call Us</p>
          <p className="text-sm text-teal-100">9999 109 040</p>
        </a>
      </div>

      {/* Recent Bookings */}
      {recentBookings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
            <Link
              href={`/portal/${customerId}/bookings`}
              className="text-sm text-emerald-600 hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentBookings.map((booking) => {
              let vaccines: string[] = [];
              try {
                vaccines = JSON.parse(booking.vaccinesRequested);
              } catch {
                vaccines = [booking.vaccinesRequested];
              }
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">Booking #{booking.id}</p>
                    <p className="text-sm text-gray-500">{vaccines.join(", ")}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status] || "bg-gray-100 text-gray-700"}`}>
                    {booking.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Support */}
      <div className="bg-gray-100 rounded-xl p-5">
        <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
        <p className="text-sm text-gray-600 mb-3">
          Contact our support team for any queries about your bookings or vaccinations.
        </p>
        <a
          href="tel:9999109040"
          className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Call Support
        </a>
      </div>
    </div>
  );
}
