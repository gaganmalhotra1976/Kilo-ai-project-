import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { bookings, patients, quotes } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export const metadata: Metadata = { title: "Dashboard" };

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    totalCustomers,
    pendingQuotes,
  ] = await Promise.all([
    db.select({ count: count() }).from(bookings),
    db.select({ count: count() }).from(bookings).where(eq(bookings.status, "pending")),
    db.select({ count: count() }).from(bookings).where(eq(bookings.status, "confirmed")),
    db.select({ count: count() }).from(bookings).where(eq(bookings.status, "completed")),
    db.select({ count: count() }).from(patients),
    db.select({ count: count() }).from(quotes).where(eq(quotes.status, "draft")),
  ]);

  const recentBookings = await db
    .select()
    .from(bookings)
    .orderBy(bookings.createdAt)
    .limit(5);

  const stats = [
    {
      label: "Total Bookings",
      value: totalBookings[0].count,
      icon: "📋",
      href: "/admin/bookings",
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Pending Review",
      value: pendingBookings[0].count,
      icon: "⏳",
      href: "/admin/bookings?status=pending",
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Confirmed",
      value: confirmedBookings[0].count,
      icon: "✅",
      href: "/admin/bookings?status=confirmed",
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Completed",
      value: completedBookings[0].count,
      icon: "🏁",
      href: "/admin/bookings?status=completed",
      color: "bg-gray-50 text-gray-700",
    },
    {
      label: "Customers",
      value: totalCustomers[0].count,
      icon: "👥",
      href: "/admin/patients",
      color: "bg-purple-50 text-purple-700",
    },
    {
      label: "Quotes to Send",
      value: pendingQuotes[0].count,
      icon: "💰",
      href: "/admin/quotes",
      color: "bg-rose-50 text-rose-700",
    },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    quoted: "bg-blue-100 text-blue-800",
    confirmed: "bg-emerald-100 text-emerald-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Overview of all bookings, quotes, and patients.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium mb-3 ${s.color}`}>
              <span>{s.icon}</span>
              {s.label}
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
          </Link>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-emerald-600 text-sm font-medium hover:underline">
            View all →
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400">
            No bookings yet. They&apos;ll appear here when patients submit requests.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentBookings.map((b) => (
              <Link
                key={b.id}
                href={`/admin/bookings/${b.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900 text-sm">{b.customerName}</p>
                  <p className="text-gray-400 text-xs">{b.customerPhone} · {b.city}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[b.status] ?? "bg-gray-100 text-gray-700"}`}>
                    {b.status}
                  </span>
                  <span className="text-gray-300 text-xs">
                    {b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-IN") : "—"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/bookings?status=pending"
          className="bg-amber-50 border border-amber-200 rounded-2xl p-5 hover:shadow-md transition-shadow"
        >
          <p className="text-amber-800 font-bold mb-1">⏳ Review Pending</p>
          <p className="text-amber-700 text-sm">Check new booking requests and create quotes.</p>
        </Link>
        <Link
          href="/admin/quotes"
          className="bg-blue-50 border border-blue-200 rounded-2xl p-5 hover:shadow-md transition-shadow"
        >
          <p className="text-blue-800 font-bold mb-1">💰 Manage Quotes</p>
          <p className="text-blue-700 text-sm">Send, approve, or update customer quotes.</p>
        </Link>
        <Link
          href="/admin/patients"
          className="bg-purple-50 border border-purple-200 rounded-2xl p-5 hover:shadow-md transition-shadow"
        >
          <p className="text-purple-800 font-bold mb-1">👥 Customer Records</p>
          <p className="text-purple-700 text-sm">View and manage all customer profiles.</p>
        </Link>
      </div>
    </div>
  );
}
