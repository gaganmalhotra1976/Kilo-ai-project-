"use client";

import { useState, useEffect } from "react";

interface Voucher {
  id: number;
  voucherCode: string;
  patientName: string;
  bookingId: number;
  issueDate: string;
  expiryDate: string;
  status: string;
  redeemedDate: string | null;
  redeemedBy: string | null;
  discountAmountApplied: number | null;
  convertedToBookingId: number | null;
}

interface ConsultationVouchersProps {
  customerId: number;
}

export function ConsultationVouchers({ customerId }: ConsultationVouchersProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCount, setActiveCount] = useState(0);
  const [redeemedCount, setRedeemedCount] = useState(0);
  const [convertedCount, setConvertedCount] = useState(0);

  useEffect(() => {
    async function loadVouchers() {
      try {
        // Use the consultation-vouchers API to get vouchers for this customer
        const res = await fetch(`/api/consultation-vouchers?customerId=${customerId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.vouchers) {
            setVouchers(data.data.vouchers);
            setActiveCount(data.data.summary?.active || 0);
            setRedeemedCount(data.data.summary?.redeemed || 0);
            setConvertedCount(data.data.summary?.converted || 0);
          }
        }
      } catch (e) {
        console.log("Could not load vouchers");
      } finally {
        setLoading(false);
      }
    }

    loadVouchers();
  }, [customerId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "redeemed": return "bg-blue-100 text-blue-700 border-blue-200";
      case "expired": return "bg-gray-100 text-gray-700 border-gray-200";
      case "converted": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return "🎟️";
      case "redeemed": return "✅";
      case "expired": return "⏰";
      case "converted": return "💊";
      default: return "📋";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Free Consultation Vouchers</h2>
          <p className="text-sm text-gray-500 mt-1">Earned with your vaccination bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
            {activeCount} Active
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-700">{activeCount}</div>
          <div className="text-xs text-emerald-600">Active Vouchers</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{redeemedCount}</div>
          <div className="text-xs text-blue-600">Redeemed</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-700">{convertedCount}</div>
          <div className="text-xs text-purple-600">Converted</div>
        </div>
      </div>

      {vouchers.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎟️</div>
          <p className="text-gray-500 font-medium">No vouchers yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Vouchers are automatically generated after completing and paying for vaccination bookings
          </p>
          <div className="mt-4 p-4 bg-emerald-50 rounded-xl text-left">
            <h3 className="font-medium text-emerald-800 mb-2">How to earn vouchers:</h3>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li>• Complete a vaccination booking</li>
              <li>• Pay the invoice for the booking</li>
              <li>• Free consultation vouchers are automatically issued</li>
              <li>• Each patient receives one free consultation voucher</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Vouchers Section */}
          {vouchers.filter(v => v.status === "active").length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Active Vouchers</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {vouchers.filter(v => v.status === "active").map((voucher) => (
                  <div
                    key={voucher.id}
                    className={`border-2 rounded-xl p-4 ${getStatusColor(voucher.status)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-900">{voucher.patientName}</p>
                        <p className="text-xs text-gray-500">Free Doctor Consultation</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(voucher.status)}`}>
                        {voucher.status}
                      </span>
                    </div>

                    <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Voucher Code</p>
                      <p className="font-mono font-bold text-lg text-emerald-700">
                        {voucher.voucherCode}
                      </p>
                    </div>

                    <div className="flex justify-between text-xs text-gray-600">
                      <span>
                        <span className="font-medium">Issued:</span>{" "}
                        {new Date(voucher.issueDate).toLocaleDateString("en-IN")}
                      </span>
                      <span>
                        <span className="font-medium">Expires:</span>{" "}
                        {new Date(voucher.expiryDate).toLocaleDateString("en-IN")}
                      </span>
                    </div>

                    <p className="text-xs text-emerald-600 mt-3 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Present this code at your next consultation
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Vouchers (Redeemed/Converted) */}
          {vouchers.filter(v => v.status !== "active").length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Used Vouchers</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {vouchers.filter(v => v.status !== "active").map((voucher) => (
                  <div
                    key={voucher.id}
                    className={`border rounded-xl p-4 ${getStatusColor(voucher.status)} opacity-75`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{voucher.patientName}</p>
                        <p className="text-xs text-gray-500">Free Doctor Consultation</p>
                      </div>
                      <div className="text-2xl">{getStatusIcon(voucher.status)}</div>
                    </div>

                    <div className="bg-white rounded-lg p-2 mb-2 border border-gray-200">
                      <p className="font-mono text-sm text-gray-700">{voucher.voucherCode}</p>
                    </div>

                    <div className="text-xs text-gray-600">
                      <p>
                        <span className="font-medium">Used:</span>{" "}
                        {voucher.redeemedDate 
                          ? new Date(voucher.redeemedDate).toLocaleDateString("en-IN")
                          : voucher.convertedToBookingId 
                            ? `Converted for Booking #${voucher.convertedToBookingId}`
                            : "N/A"}
                      </p>
                      {voucher.discountAmountApplied && (
                        <p>
                          <span className="font-medium">Discount Applied:</span> ₹{voucher.discountAmountApplied}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h3 className="font-medium text-gray-900 mb-2">About Free Consultation Vouchers</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• Earned automatically with each vaccination booking completion</p>
          <p>• One voucher per patient in the booking</p>
          <p>• Valid for 1 year from issue date</p>
          <p>• Can be redeemed for a free doctor consultation</p>
          <p>• Can be converted to ₹50 discount on future bookings (max ₹100 per booking)</p>
        </div>
      </div>
    </div>
  );
}
