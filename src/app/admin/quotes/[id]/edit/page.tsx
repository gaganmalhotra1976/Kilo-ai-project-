"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type LineItem = {
  vaccine: string;
  qty: number;
  unitPrice: number;
  gstPct: number;
  batch?: string;
  expiry?: string;
};

type Quote = {
  id: number;
  bookingId: number | null;
  lineItems: string;
  subtotal: number;
  discountType: string | null;
  discountValue: number;
  discountAmount: number;
  gstAmount: number;
  convenienceFee: number;
  total: number;
  status: string;
  validUntil: string | null;
  createdAt: string | null;
};

export default function QuoteEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { vaccine: "", qty: 1, unitPrice: 0, gstPct: 12, batch: "", expiry: "" },
  ]);
  const [convenienceFee, setConvenienceFee] = useState(0);
  const [discountType, setDiscountType] = useState<string>("");
  const [discountValue, setDiscountValue] = useState(0);
  const [validUntil, setValidUntil] = useState("");

  useEffect(() => {
    params.then(async ({ id }) => {
      const res = await fetch(`/api/quotes/${id}`);
      if (!res.ok) {
        setError("Quote not found");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setQuote(data);
      
      try {
        const items = JSON.parse(data.lineItems);
        if (Array.isArray(items) && items.length > 0) {
          setLineItems(items);
        }
      } catch {
        // keep defaults
      }
      
      setConvenienceFee(data.convenienceFee || 0);
      setDiscountType(data.discountType || "");
      setDiscountValue(data.discountValue || 0);
      setValidUntil(data.validUntil ? data.validUntil.split("T")[0] : "");
      setLoading(false);
    });
  }, [params]);

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
  
  let discountAmount = 0;
  if (discountType === "percentage") {
    discountAmount = (subtotal * discountValue) / 100;
  } else if (discountType === "flat") {
    discountAmount = discountValue;
  }
  
  const afterDiscount = subtotal - discountAmount;
  
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

  async function saveQuote() {
    if (lineItems.some((l) => !l.vaccine || l.unitPrice <= 0)) {
      setError("Please fill in all vaccine names and prices.");
      return;
    }
    setError("");
    setSaving(true);
    
    const res = await fetch(`/api/quotes/${quote!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lineItems,
        convenienceFee,
        discountType: discountType || null,
        discountValue,
        discountAmount,
        subtotal,
        gstAmount,
        total,
        validUntil: validUntil ? new Date(validUntil).toISOString() : null,
      }),
    });
    
    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Failed to save quote");
      setSaving(false);
      return;
    }
    
    setSaving(false);
    router.push("/admin/quotes");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error && !quote) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-red-600">{error}</div>
        <Link href="/admin/quotes" className="text-emerald-600 hover:underline mt-4 inline-block">
          ← Back to Quotes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/quotes" className="text-gray-400 hover:text-gray-700 text-sm">
          ← Quotes
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600 text-sm">Edit Quote #{quote?.id}</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Quote</h1>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Line Items</h3>
            <div className="space-y-3">
              {lineItems.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <input
                      className="col-span-4 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Vaccine name"
                      value={item.vaccine}
                      onChange={(e) => updateLineItem(i, "vaccine", e.target.value)}
                    />
                    <input
                      className="col-span-2 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => updateLineItem(i, "qty", parseInt(e.target.value, 10) || 1)}
                    />
                    <input
                      className="col-span-3 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      type="number"
                      min={0}
                      placeholder="Unit price ₹"
                      value={item.unitPrice || ""}
                      onChange={(e) => updateLineItem(i, "unitPrice", parseFloat(e.target.value) || 0)}
                    />
                    <select
                      className="col-span-2 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
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
                      className="col-span-1 text-red-400 hover:text-red-600 text-xl font-bold"
                      disabled={lineItems.length === 1}
                    >
                      ×
                    </button>
                  </div>
                  <div className="grid grid-cols-12 gap-2 items-center ml-2">
                    <input
                      className="col-span-3 col-start-3 border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
              className="text-sm text-emerald-700 font-medium hover:underline mt-2"
            >
              + Add line item
            </button>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-900 text-sm mb-3">Discount</h4>
            <div className="flex items-center gap-2">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
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
                  className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Convenience fee ₹</label>
            <input
              type="number"
              min={0}
              value={convenienceFee}
              onChange={(e) => setConvenienceFee(parseFloat(e.target.value) || 0)}
              className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
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
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1">
              <span>Total</span>
              <span className="text-xl text-emerald-700">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={saveQuote}
              disabled={saving}
              className="bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href="/admin/quotes"
              className="bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
