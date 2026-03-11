import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { quotes, bookings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import QuoteStatusButton from "./QuoteStatusButton";

export const metadata: Metadata = { title: "Quotes" };
export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-orange-100 text-orange-800",
};

export default async function AdminQuotesPage() {
  const allQuotes = await db
    .select({
      quote: quotes,
      booking: {
        id: bookings.id,
        customerName: bookings.customerName,
        customerPhone: bookings.customerPhone,
        city: bookings.city,
      },
    })
    .from(quotes)
    .leftJoin(bookings, eq(quotes.bookingId, bookings.id))
    .orderBy(desc(quotes.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
        <p className="text-gray-500 text-sm mt-1">{allQuotes.length} quote{allQuotes.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {allQuotes.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            No quotes yet. Create one from a booking detail page.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Quote #</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Booking</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Total</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Created</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allQuotes.map(({ quote: q, booking: b }) => (
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-gray-400">#{q.id}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{b?.customerName ?? "—"}</p>
                      <p className="text-gray-400 text-xs">{b?.customerPhone}</p>
                    </td>
                    <td className="px-5 py-4">
                      {b ? (
                        <Link
                          href={`/admin/bookings/${b.id}`}
                          className="text-emerald-600 hover:underline text-xs font-medium"
                        >
                          Booking #{b.id}
                        </Link>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      ₹{q.total.toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[q.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {q.createdAt ? new Date(q.createdAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <QuoteStatusButton quoteId={q.id} currentStatus={q.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/quotes/${q.id}`}
                          className="text-emerald-600 hover:underline text-xs font-medium"
                          target="_blank"
                        >
                          View/Print
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
