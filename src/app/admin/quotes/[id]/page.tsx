import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { quotes, bookings, patients } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = { title: "Quote Template" };
export const dynamic = "force-dynamic";

export default async function QuoteTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quoteId = parseInt(id, 10);

  const [quote] = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, quoteId));

  if (!quote) notFound();

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, quote.bookingId));

  let customer = null;
  if (booking?.customerId) {
    [customer] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, booking.customerId));
  }

  let lineItems: any[] = [];
  try {
    lineItems = JSON.parse(quote.lineItems);
  } catch {
    lineItems = [];
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-emerald-700 mb-2">The Vaccine Panda</h1>
          <p className="text-gray-600 text-sm">
            Home Vaccination Services<br />
            GSTIN: 07AABCU9603R1ZM<br />
            Email: info@thevaccinepanda.com
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-800">QUOTATION</h2>
          <p className="text-gray-600 text-sm">Quote #{quote.id}</p>
          <p className="text-gray-600 text-sm">
            Date: {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString("en-IN") : "—"}
          </p>
          {quote.validUntil && (
            <p className="text-red-600 text-sm">
              Valid Until: {new Date(quote.validUntil).toLocaleDateString("en-IN")}
            </p>
          )}
        </div>
      </div>

      {/* Customer Details */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-bold text-gray-800 mb-2">Bill To:</h3>
        <p className="font-semibold text-gray-900">{booking?.customerName || "Customer"}</p>
        <p className="text-gray-600">{booking?.customerPhone}</p>
        {booking?.customerEmail && <p className="text-gray-600">{booking.customerEmail}</p>}
        <p className="text-gray-600">{booking?.address}, {booking?.city}</p>
      </div>

      {/* Line Items Table */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="bg-emerald-700 text-white">
            <th className="text-left p-3">Item</th>
            <th className="text-center p-3">Qty</th>
            <th className="text-right p-3">Unit Price</th>
            <th className="text-center p-3">GST %</th>
            <th className="text-right p-3">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item: any, i: number) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="p-3">
                <p className="font-medium">{item.vaccine}</p>
                {item.batch && <p className="text-xs text-gray-500">Batch: {item.batch}</p>}
                {item.expiry && <p className="text-xs text-gray-500">Expiry: {item.expiry}</p>}
              </td>
              <td className="text-center p-3">{item.qty}</td>
              <td className="text-right p-3">₹{item.unitPrice.toFixed(2)}</td>
              <td className="text-center p-3">{item.gstPct}%</td>
              <td className="text-right p-3">₹{(item.qty * item.unitPrice).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">₹{quote.subtotal.toFixed(2)}</span>
          </div>
          {quote.discountAmount > 0 && (
            <div className="flex justify-between py-2">
              <span className="text-gray-600">
                Discount ({quote.discountType === "percentage" ? `${quote.discountValue}%` : "Flat"}):
              </span>
              <span className="font-medium text-red-600">-₹{quote.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Convenience Fee:</span>
            <span className="font-medium">₹{quote.convenienceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-t-2 border-gray-300">
            <span className="font-bold text-gray-900">Total (Including GST):</span>
            <span className="font-bold text-xl text-emerald-700">₹{quote.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="mt-12 pt-6 border-t border-gray-200">
        <h4 className="font-bold text-gray-800 mb-2">Terms & Conditions:</h4>
        <ul className="text-sm text-gray-600 list-disc list-inside">
          <li>Quote valid until the date mentioned above</li>
          <li>Prices include GST as mentioned</li>
          <li>Payment can be made via Cash, UPI, or Bank Transfer</li>
          <li>Please confirm acceptance of this quote to proceed with booking</li>
          <li>Home vaccination service available at your preferred location</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4 no-print">
        <button
          onClick={() => window.print()}
          className="bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors"
        >
          Print Quote
        </button>
        <Link
          href={`/admin/bookings/${quote.bookingId}`}
          className="bg-gray-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
        >
          Back to Booking
        </Link>
      </div>
    </div>
  );
}
