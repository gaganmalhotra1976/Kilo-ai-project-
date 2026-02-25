import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { bookings, quotes } from "@/db/schema";
import { eq } from "drizzle-orm";
import BookingActions from "./BookingActions";

export const metadata: Metadata = { title: "Booking Detail" };
export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  quoted: "bg-blue-100 text-blue-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bookingId = parseInt(id, 10);

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId));

  if (!booking) notFound();

  const bookingQuotes = await db
    .select()
    .from(quotes)
    .where(eq(quotes.bookingId, bookingId));

  let vaccines: string[] = [];
  try { vaccines = JSON.parse(booking.vaccinesRequested); } catch { vaccines = [booking.vaccinesRequested]; }

  let patientNames: string[] = [];
  if (booking.patientNames) {
    try { patientNames = JSON.parse(booking.patientNames); } catch { patientNames = [booking.patientNames]; }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/bookings" className="text-gray-400 hover:text-gray-700 text-sm">
          ← Bookings
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600 text-sm">Booking #{booking.id}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{booking.customerName}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Booking #{booking.id} · Created{" "}
            {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}
          </p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${statusColors[booking.status] ?? "bg-gray-100 text-gray-700"}`}>
          {booking.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Customer Details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex gap-3">
              <dt className="text-gray-400 w-24 flex-shrink-0">Name</dt>
              <dd className="text-gray-900 font-medium">{booking.customerName}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-gray-400 w-24 flex-shrink-0">Phone</dt>
              <dd className="text-gray-900 font-medium">
                <a href={`tel:${booking.customerPhone}`} className="hover:text-emerald-700">
                  {booking.customerPhone}
                </a>
              </dd>
            </div>
            {booking.customerEmail && (
              <div className="flex gap-3">
                <dt className="text-gray-400 w-24 flex-shrink-0">Email</dt>
                <dd className="text-gray-900 font-medium">
                  <a href={`mailto:${booking.customerEmail}`} className="hover:text-emerald-700">
                    {booking.customerEmail}
                  </a>
                </dd>
              </div>
            )}
            <div className="flex gap-3">
              <dt className="text-gray-400 w-24 flex-shrink-0">Address</dt>
              <dd className="text-gray-900">{booking.address}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-gray-400 w-24 flex-shrink-0">City</dt>
              <dd className="text-gray-900">{booking.city}</dd>
            </div>
          </dl>
        </div>

        {/* Booking details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Booking Details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex gap-3">
              <dt className="text-gray-400 w-28 flex-shrink-0">Type</dt>
              <dd className="text-gray-900 capitalize">{booking.bookingType}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-gray-400 w-28 flex-shrink-0">People</dt>
              <dd className="text-gray-900">{booking.numberOfPeople}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-gray-400 w-28 flex-shrink-0">Pref. Date</dt>
              <dd className="text-gray-900">{booking.preferredDate ?? "—"}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-gray-400 w-28 flex-shrink-0">Pref. Time</dt>
              <dd className="text-gray-900 capitalize">{booking.preferredTime ?? "—"}</dd>
            </div>
            {patientNames.length > 0 && (
              <div className="flex gap-3">
                <dt className="text-gray-400 w-28 flex-shrink-0">Patients</dt>
                <dd className="text-gray-900">
                  <ul className="space-y-1">
                    {patientNames.map((name) => (
                      <li key={name} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        {name}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            <div className="flex gap-3">
              <dt className="text-gray-400 w-28 flex-shrink-0">Vaccines</dt>
              <dd className="text-gray-900">
                <ul className="space-y-1">
                  {vaccines.map((v) => (
                    <li key={v} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      {v}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Admin actions */}
      <BookingActions booking={booking} quotes={bookingQuotes} />
    </div>
  );
}
