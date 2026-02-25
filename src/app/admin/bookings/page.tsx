import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const metadata: Metadata = { title: "Bookings" };
export const dynamic = "force-dynamic";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Quoted", value: "quoted" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  quoted: "bg-blue-100 text-blue-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const allBookings = status
    ? await db
        .select()
        .from(bookings)
        .where(eq(bookings.status, status))
        .orderBy(desc(bookings.createdAt))
    : await db.select().from(bookings).orderBy(desc(bookings.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">{allBookings.length} booking{allBookings.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin/bookings?status=${tab.value}` : "/admin/bookings"}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              (status ?? "") === tab.value
                ? "bg-emerald-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-400"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {allBookings.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            No bookings found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">#</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Vaccines</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">City</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Date</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allBookings.map((b) => {
                  let vaccines: string[] = [];
                  try { vaccines = JSON.parse(b.vaccinesRequested); } catch { vaccines = [b.vaccinesRequested]; }
                  return (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-gray-400">#{b.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{b.customerName}</p>
                        <p className="text-gray-400 text-xs">{b.customerPhone}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600 max-w-xs">
                        <p className="truncate">{vaccines.slice(0, 2).join(", ")}{vaccines.length > 2 ? ` +${vaccines.length - 2} more` : ""}</p>
                        <p className="text-gray-400 text-xs">{b.numberOfPeople} person{b.numberOfPeople !== 1 ? "s" : ""}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{b.city}</td>
                      <td className="px-5 py-4 text-gray-600">
                        {b.preferredDate ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[b.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/bookings/${b.id}`}
                          className="text-emerald-600 font-medium hover:underline text-xs"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
