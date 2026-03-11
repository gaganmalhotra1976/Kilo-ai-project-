"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Booking = {
  id: number;
  status: string;
  adminNotes: string | null;
  bookingType: string;
  numberOfPeople: number;
};

type Quote = {
  id: number;
  status: string;
  total: number;
  subtotal: number;
  gstAmount: number;
  convenienceFee: number;
  discountType: string | null;
  discountValue: number;
  discountAmount: number;
  lineItems: string;
  createdAt: Date | null;
};

type LineItem = {
  vaccine: string;
  qty: number;
  unitPrice: number;
  gstPct: number;
  batch?: string;
  expiry?: string;
};

const BOOKING_STATUSES = ["pending", "quoted", "confirmed", "completed", "cancelled"];

const quoteStatusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-orange-100 text-orange-800",
};

export default function BookingActions({
  booking,
  quotes,
}: {
  booking: Booking;
  quotes: Quote[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(booking.status);
  const [adminNotes, setAdminNotes] = useState(booking.adminNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { vaccine: "", qty: 1, unitPrice: 0, gstPct: 12, batch: "", expiry: "" },
  ]);
  const [convenienceFee, setConvenienceFee] = useState(
    booking.bookingType === "family" || booking.numberOfPeople >= 3 ? 0 : 200
  );
  const [discountType, setDiscountType] = useState<string>("");
  const [discountValue, setDiscountValue] = useState(0);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  async function saveBooking() {
    setSaving(true);
    await fetch(`/api/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes }),
    });
    setSaving(false);
    router.refresh();
  }

  function addLineItem() {
    setLineItems((prev) => [...prev, { vaccine: "", qty: 1, unitPrice: 0, gstPct: 12, batch: "", expiry: "" }]);
  }

  function removeLineItem(i: number) {
    setLineItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateLineItem(i: number, field: keyof LineItem, value: string | number) {
    setLineItems((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item))
    );
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0) + convenienceFee;
  
  // Calculate discount amount
  let discountAmount = 0;
  if (discountType === "percentage") {
    discountAmount = (subtotal * discountValue) / 100;
  } else if (discountType === "flat") {
    discountAmount = discountValue;
  }
  
  const afterDiscount = subtotal - discountAmount;
  
  // GST Inclusive calculation: price shown to customer includes GST
  // GST Amount = Total - (Total / (1 + GST%))
  const gstAmount = lineItems.reduce(
    (sum, item) => {
      const itemTotal = item.qty * item.unitPrice;
      const itemDiscount = discountType && discountValue > 0 ? (itemTotal / subtotal) * discountAmount : 0;
      const itemAfterDiscount = itemTotal - itemDiscount;
      const basePrice = itemAfterDiscount / (1 + item.gstPct / 100);
      return sum + (itemAfterDiscount - basePrice);
    },
    0
  );
  
  const total = afterDiscount;

  async function createQuote() {
    setQuoteError("");
    if (lineItems.some((l) => !l.vaccine || l.unitPrice <= 0)) {
      setQuoteError("Please fill in all vaccine names and prices.");
      return;
    }
    setQuoteLoading(true);
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId: booking.id,
        lineItems,
        convenienceFee,
        discountType: discountType || null,
        discountValue,
        subtotal,
        discountAmount,
        gstAmount,
        total,
      }),
    });
    if (!res.ok) {
      const json = await res.json();
      setQuoteError(json.error ?? "Failed to create quote");
      setQuoteLoading(false);
      return;
    }
    setShowQuoteForm(false);
    setQuoteLoading(false);
    router.refresh();
  }

  async function updateQuoteStatus(quoteId: number, newStatus: string) {
    await fetch(`/api/quotes/${quoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Status & notes */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Update Booking</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {BOOKING_STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            placeholder="Internal notes (not visible to customer)…"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>
        <button
          onClick={saveBooking}
          disabled={saving}
          className="bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60 text-sm"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Quotes */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Quotes</h2>
          <button
            onClick={() => setShowQuoteForm((v) => !v)}
            className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors font-medium"
          >
            {showQuoteForm ? "Cancel" : "+ Create Quote"}
          </button>
        </div>

        {/* Existing quotes */}
        {quotes.length > 0 && (
          <div className="space-y-3 mb-6">
            {quotes.map((q) => {
              let items: LineItem[] = [];
              try { items = JSON.parse(q.lineItems); } catch { /* empty */ }
              return (
                <div key={q.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${quoteStatusColors[q.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {q.status}
                      </span>
                      <span className="text-gray-400 text-xs ml-3">
                        Quote #{q.id} · {q.createdAt ? new Date(q.createdAt).toLocaleDateString("en-IN") : "—"}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900">₹{q.total.toFixed(2)}</p>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1 mb-3">
                    {items.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{item.vaccine} × {item.qty}</span>
                        <span>₹{(item.qty * item.unitPrice).toFixed(2)}</span>
                      </div>
                    ))}
                    {q.convenienceFee > 0 && (
                      <div className="flex justify-between">
                        <span>Convenience fee</span>
                        <span>₹{q.convenienceFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-100 pt-1">
                      <span>GST</span>
                      <span>₹{q.gstAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  {q.status === "draft" && (
                    <button
                      onClick={() => updateQuoteStatus(q.id, "sent")}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Mark as Sent
                    </button>
                  )}
                  {q.status === "sent" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateQuoteStatus(q.id, "approved")}
                        className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                      >
                        Mark Approved
                      </button>
                      <button
                        onClick={() => updateQuoteStatus(q.id, "rejected")}
                        className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Mark Rejected
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Quote creation form */}
        {showQuoteForm && (
          <div className="border border-emerald-200 rounded-xl p-5 bg-emerald-50 space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm">New Quote</h3>

            {/* Line items */}
            <div className="space-y-3">
              {lineItems.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <input
                      className="col-span-3 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Vaccine name"
                      value={item.vaccine}
                      onChange={(e) => updateLineItem(i, "vaccine", e.target.value)}
                    />
                    <input
                      className="col-span-1 border border-gray-300 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => updateLineItem(i, "qty", parseInt(e.target.value, 10) || 1)}
                    />
                    <input
                      className="col-span-2 border border-gray-300 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      type="number"
                      min={0}
                      placeholder="Unit price ₹"
                      value={item.unitPrice || ""}
                      onChange={(e) => updateLineItem(i, "unitPrice", parseFloat(e.target.value) || 0)}
                    />
                    <select
                      className="col-span-2 border border-gray-300 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                      value={item.gstPct}
                      onChange={(e) => updateLineItem(i, "gstPct", parseFloat(e.target.value))}
                    >
                      <option value={0}>0%</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                    </select>
                    <button
                      onClick={() => removeLineItem(i)}
                      className="col-span-1 text-red-400 hover:text-red-600 text-lg font-bold"
                      disabled={lineItems.length === 1}
                    >
                      ×
                    </button>
                  </div>
                  {/* Batch & Expiry row */}
                  <div className="grid grid-cols-12 gap-2 items-center ml-1">
                    <input
                      className="col-span-3 col-start-2 border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Batch No."
                      value={item.batch || ""}
                      onChange={(e) => updateLineItem(i, "batch", e.target.value)}
                    />
                    <input
                      className="col-span-2 border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      type="date"
                      placeholder="Expiry"
                      value={item.expiry || ""}
                      onChange={(e) => updateLineItem(i, "expiry", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addLineItem}
              className="text-xs text-emerald-700 font-medium hover:underline"
            >
              + Add line item
            </button>

            {/* Discount Section */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="font-medium text-gray-900 text-xs mb-3">Discount</h4>
              <div className="flex items-center gap-2 mb-3">
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  <option value="">No Discount</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
                {discountType && (
                  <input
                    type="number"
                    min={0}
                    placeholder={discountType === "percentage" ? "%" : "₹"}
                    value={discountValue || ""}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-gray-700">Convenience fee ₹</label>
              <input
                type="number"
                min={0}
                value={convenienceFee}
                onChange={(e) => setConvenienceFee(parseFloat(e.target.value) || 0)}
                className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Totals */}
            <div className="bg-white rounded-lg p-4 text-sm space-y-1 border border-gray-200">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount ({discountType === "percentage" ? `${discountValue}%` : "Flat"})</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>GST (Inclusive)</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-1">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {quoteError && (
              <p className="text-red-600 text-xs">{quoteError}</p>
            )}

            <button
              onClick={createQuote}
              disabled={quoteLoading}
              className="bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60 text-sm"
            >
              {quoteLoading ? "Creating…" : "Create Quote"}
            </button>
          </div>
        )}

        {quotes.length === 0 && !showQuoteForm && (
          <p className="text-gray-400 text-sm">No quotes yet. Create one above.</p>
        )}
      </div>
    </div>
  );
}
