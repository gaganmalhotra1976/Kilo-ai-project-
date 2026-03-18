"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Invoice = {
  id: number;
  invoiceNumber: string;
  total: number;
  status: string;
  generatedAt: string;
  bookingId: number;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const customerId = typeof window !== "undefined" ? localStorage.getItem("portal_customerId") : null;

  useEffect(() => {
    if (!customerId) return;
    fetch(`/api/portal/invoices?customerId=${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        setInvoices(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [customerId]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">My Invoices</h2>

      <p className="text-gray-600 text-sm">
        Download GST-compliant invoices for your completed bookings
      </p>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">🧾</div>
          <p className="text-gray-500">No invoices yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Invoices are generated after booking completion
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-gray-500">
                    Booking #{invoice.bookingId} •{" "}
                    {invoice.generatedAt
                      ? new Date(invoice.generatedAt).toLocaleDateString("en-IN")
                      : "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-emerald-700">
                    ₹{invoice.total.toFixed(2)}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    invoice.status === "generated" 
                      ? "bg-emerald-100 text-emerald-700" 
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  href={`/admin/invoices/${invoice.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:underline"
                >
                  <span>🖨️</span>
                  View & Download Invoice
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
