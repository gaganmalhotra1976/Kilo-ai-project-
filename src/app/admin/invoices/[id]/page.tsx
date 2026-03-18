import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { invoices, bookings, customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSettingWithDefault } from "@/lib/adminAuth";

export const metadata: Metadata = { title: "Invoice" };
export const dynamic = "force-dynamic";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoiceId = parseInt(id, 10);

  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, invoiceId));

  if (!invoice) notFound();

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, invoice.bookingId));

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, invoice.customerId));

  const gstin = await getSettingWithDefault("gstin");
  const companyName = await getSettingWithDefault("companyName");
  const companyPhone = await getSettingWithDefault("companyPhone");
  const companyEmail = await getSettingWithDefault("companyEmail");

  let lineItems: any[] = [];
  try {
    lineItems = JSON.parse(invoice.lineItems);
  } catch {
    lineItems = [];
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-emerald-700 mb-2">{companyName}</h1>
          <p className="text-gray-600 text-sm">
            Home Vaccination Services<br />
            GSTIN: {gstin}<br />
            Phone: {companyPhone}<br />
            Email: {companyEmail}
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
          <p className="text-gray-600 text-sm font-mono">{invoice.invoiceNumber}</p>
          <p className="text-gray-600 text-sm">
            Date: {invoice.generatedAt ? new Date(invoice.generatedAt).toLocaleDateString("en-IN") : "—"}
          </p>
        </div>
      </div>

      {/* Billing To */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-bold text-gray-800 mb-2">Bill To:</h3>
        <p className="font-semibold text-gray-900">{customer?.name || "Customer"}</p>
        <p className="text-gray-600">{customer?.phone}</p>
        {customer?.email && <p className="text-gray-600">{customer.email}</p>}
        <p className="text-gray-600">{booking?.address}, {booking?.city}</p>
      </div>

      {/* Booking Reference */}
      <div className="mb-6 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Booking Reference:</strong> #{booking?.id} | 
          Date: {booking?.createdAt ? new Date(booking.createdAt).toLocaleDateString("en-IN") : "—"}
        </p>
      </div>

      {/* Line Items Table */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="bg-emerald-700 text-white">
            <th className="text-left p-3">Item</th>
            <th className="text-center p-3">HSN</th>
            <th className="text-center p-3">Qty</th>
            <th className="text-right p-3">Unit Price</th>
            <th className="text-right p-3">Taxable</th>
            <th className="text-right p-3">CGST {invoice.cgstRate}%</th>
            <th className="text-right p-3">SGST {invoice.sgstRate}%</th>
            <th className="text-right p-3">IGST {invoice.igstRate}%</th>
            <th className="text-right p-3">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item: any, i: number) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="p-3">
                <p className="font-medium">{item.vaccine}</p>
              </td>
              <td className="text-center p-3 text-gray-500 font-mono text-sm">{item.hsnCode}</td>
              <td className="text-center p-3">{item.qty}</td>
              <td className="text-right p-3">₹{item.unitPrice.toFixed(2)}</td>
              <td className="text-right p-3">₹{item.taxableAmount.toFixed(2)}</td>
              <td className="text-right p-3">₹{item.cgst}</td>
              <td className="text-right p-3">₹{item.sgst}</td>
              <td className="text-right p-3">₹{item.igst}</td>
              <td className="text-right p-3 font-medium">₹{item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-72">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">₹{invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.discountAmount && invoice.discountAmount > 0 && (
            <div className="flex justify-between py-2">
              <span className="text-gray-600">
                Discount ({invoice.discountType === "percentage" ? `${invoice.discountValue}%` : "Flat"}):
              </span>
              <span className="font-medium text-red-600">-₹{invoice.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-2">
            <span className="text-gray-600">CGST:</span>
            <span className="font-medium">₹{(invoice.cgstAmount || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">SGST:</span>
            <span className="font-medium">₹{(invoice.sgstAmount || 0).toFixed(2)}</span>
          </div>
          {(invoice.igstAmount || 0) > 0 && (
            <div className="flex justify-between py-2">
              <span className="text-gray-600">IGST:</span>
              <span className="font-medium">₹{(invoice.igstAmount || 0).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-t-2 border-gray-300">
            <span className="font-bold text-gray-900">Total (Including Tax):</span>
            <span className="font-bold text-xl text-emerald-700">₹{invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Tax Breakdown Summary */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-bold text-gray-800 mb-2">Tax Summary:</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">CGST (9%):</span>
            <span className="ml-2 font-medium">₹{(invoice.cgstAmount || 0).toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-500">SGST (9%):</span>
            <span className="ml-2 font-medium">₹{(invoice.sgstAmount || 0).toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-500">IGST (0%):</span>
            <span className="ml-2 font-medium">₹{(invoice.igstAmount || 0).toFixed(2)}</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <span className="text-gray-600">Total Tax:</span>
          <span className="ml-2 font-bold">₹{(invoice.totalTax || 0).toFixed(2)}</span>
        </div>
      </div>

      {/* Terms */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="font-bold text-gray-800 mb-2">Terms & Conditions:</h4>
        <ul className="text-sm text-gray-600 list-disc list-inside">
          <li>Payment can be made via Cash, UPI, or Bank Transfer</li>
          <li>This is a GST-compliant tax invoice</li>
          <li>Please quote invoice number when making payment</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4 no-print">
        <button
          onClick={() => window.print()}
          className="bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors"
        >
          Print Invoice
        </button>
        <Link
          href={`/admin/bookings/${invoice.bookingId}`}
          className="bg-gray-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
        >
          Back to Booking
        </Link>
      </div>
    </div>
  );
}
