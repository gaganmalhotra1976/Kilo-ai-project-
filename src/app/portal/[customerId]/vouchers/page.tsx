"use client";

import { useEffect, useState } from "react";

type Voucher = {
  id: number;
  voucherCode: string;
  patientName: string;
  issueDate: string;
  expiryDate: string;
  status: string;
};

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const customerId = typeof window !== "undefined" ? localStorage.getItem("portal_customerId") : null;

  useEffect(() => {
    if (!customerId) return;
    fetch(`/api/portal/vouchers?customerId=${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        setVouchers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [customerId]);

  const statusColors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    redeemed: "bg-blue-100 text-blue-700",
    expired: "bg-gray-100 text-gray-700",
    converted: "bg-purple-100 text-purple-700",
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">My Vouchers</h2>

      <p className="text-gray-600 text-sm">
        Free consultation vouchers earned with your bookings
      </p>

      {vouchers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">🎟️</div>
          <p className="text-gray-500">No vouchers yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Vouchers are generated automatically with qualifying bookings
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {vouchers.map((voucher) => (
            <div
              key={voucher.id}
              className={`bg-white rounded-xl border-2 p-5 ${
                voucher.status === "active"
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900">{voucher.patientName}</p>
                  <p className="text-xs text-gray-500">Free Doctor Consultation</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[voucher.status] || "bg-gray-100 text-gray-700"}`}>
                  {voucher.status}
                </span>
              </div>

              <div className="bg-white rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-500">Voucher Code</p>
                <p className="font-mono font-bold text-lg text-emerald-700">
                  {voucher.voucherCode}
                </p>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Issued:</span>{" "}
                  {new Date(voucher.issueDate).toLocaleDateString("en-IN")}
                </p>
                <p>
                  <span className="font-medium">Expires:</span>{" "}
                  {new Date(voucher.expiryDate).toLocaleDateString("en-IN")}
                </p>
              </div>

              {voucher.status === "active" && (
                <p className="text-xs text-emerald-600 mt-3">
                  Present this code at your next consultation
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
