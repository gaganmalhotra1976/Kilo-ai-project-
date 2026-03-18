"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Quote = {
  id: number;
  bookingId: number;
  lineItems: string;
  total: number;
  status: string;
  validUntil: string | null;
  createdAt: string;
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const customerId = typeof window !== "undefined" ? localStorage.getItem("portal_customerId") : null;

  useEffect(() => {
    if (!customerId) return;
    fetch(`/api/portal/quotes?customerId=${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        setQuotes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [customerId]);

  async function updateQuoteStatus(quoteId: number, status: string) {
    setUpdating(quoteId);
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setQuotes((prev) =>
          prev.map((q) => (q.id === quoteId ? { ...q, status } : q))
        );
      }
    } finally {
      setUpdating(null);
    }
  }

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    sent: "bg-blue-100 text-blue-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    expired: "bg-orange-100 text-orange-700",
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">My Quotes</h2>

      {quotes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">💰</div>
          <p className="text-gray-500">No quotes yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => {
            let items: any[] = [];
            try {
              items = JSON.parse(quote.lineItems);
            } catch {}

            return (
              <div key={quote.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">Quote #{quote.id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(quote.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[quote.status] || "bg-gray-100 text-gray-700"}`}>
                      {quote.status}
                    </span>
                    <p className="text-xl font-bold text-emerald-700 mt-1">₹{quote.total.toFixed(2)}</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                  <div className="space-y-1">
                    {items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm text-gray-600">
                        <span>{item.vaccine} × {item.qty}</span>
                        <span>₹{(item.qty * item.unitPrice).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {quote.validUntil && (
                  <p className="text-sm text-gray-500 mb-3">
                    Valid until: {new Date(quote.validUntil).toLocaleDateString("en-IN")}
                  </p>
                )}

                {quote.status === "sent" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateQuoteStatus(quote.id, "approved")}
                      disabled={updating === quote.id}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
                    >
                      Accept Quote
                    </button>
                    <button
                      onClick={() => updateQuoteStatus(quote.id, "rejected")}
                      disabled={updating === quote.id}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                )}

                <Link
                  href={`/admin/quotes/${quote.id}`}
                  target="_blank"
                  className="text-sm text-emerald-600 hover:underline mt-2 inline-block"
                >
                  View Full Quote →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
