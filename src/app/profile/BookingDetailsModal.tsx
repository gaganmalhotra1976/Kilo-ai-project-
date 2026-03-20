"use client";

import { useState, useEffect } from "react";

interface Booking {
  id: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  address: string;
  city: string;
  vaccinesRequested: string;
  numberOfPeople: number;
  bookingType: string;
  preferredDate: string | null;
  preferredTime: string | null;
  patientNames: string | null;
  status: string;
  paymentStatus: string;
  adminNotes: string | null;
  assignedNurse: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LineItem {
  vaccine: string;
  brand: string;
  patient: string;
  qty: number;
  unitPrice: number;
  gstPct: number;
  batch: string;
  expiry: string;
}

interface Quote {
  id: number;
  lineItems: string;
  subtotal: number;
  convenienceFee: number;
  discountType: string | null;
  discountValue: number;
  discountAmount: number;
  freeConsultations: number;
  freeConsultationsValue: number;
  gstAmount: number;
  total: number;
  status: string;
}

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingDetailsModal({ booking, isOpen, onClose }: BookingDetailsModalProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);

  useEffect(() => {
    if (!booking || !isOpen) {
      setQuote(null);
      return;
    }

    const bookingId = booking.id;
    
    async function fetchQuote() {
      setLoadingQuote(true);
      try {
        const res = await fetch(`/api/bookings/${bookingId}/quote`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setQuote(data.data);
          }
        }
      } catch (e) {
        console.log("Could not fetch quote");
      } finally {
        setLoadingQuote(false);
      }
    }

    fetchQuote();
  }, [booking, isOpen]);

  if (!isOpen || !booking) return null;

  const getVaccineList = () => {
    try {
      const parsed = JSON.parse(booking.vaccinesRequested);
      return Array.isArray(parsed) ? parsed : [booking.vaccinesRequested];
    } catch {
      return [booking.vaccinesRequested];
    }
  };

  const getPatientNames = () => {
    if (!booking.patientNames) return [];
    try {
      const parsed = JSON.parse(booking.patientNames);
      return Array.isArray(parsed) ? parsed : [booking.patientNames];
    } catch {
      return [booking.patientNames];
    }
  };

  const getLineItems = (): LineItem[] => {
    if (!quote) return [];
    try {
      const parsed = JSON.parse(quote.lineItems);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "quoted": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "partial": return "bg-yellow-100 text-yellow-800";
      default: return "bg-red-100 text-red-800";
    }
  };

  const lineItems = getLineItems();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentColor(booking.paymentStatus)}`}>
                {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
              </span>
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <p className="font-medium">{booking.customerName}</p>
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <p className="font-medium">{booking.customerPhone}</p>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="font-medium">{booking.customerEmail || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Address:</span>
                  <p className="font-medium">{booking.address}</p>
                </div>
                <div>
                  <span className="text-gray-500">City:</span>
                  <p className="font-medium">{booking.city}</p>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Booking ID:</span>
                  <p className="font-medium">#{booking.id}</p>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <p className="font-medium">{booking.bookingType.charAt(0).toUpperCase() + booking.bookingType.slice(1)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Number of People:</span>
                  <p className="font-medium">{booking.numberOfPeople}</p>
                </div>
                {getPatientNames().length > 0 && (
                  <div>
                    <span className="text-gray-500">Patient Names:</span>
                    <ul className="mt-1 space-y-1">
                      {getPatientNames().map((name, index) => (
                        <li key={index} className="font-medium">• {name}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Preferred Date:</span>
                  <p className="font-medium">
                    {booking.preferredDate
                      ? new Date(booking.preferredDate).toLocaleDateString("en-IN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Preferred Time:</span>
                  <p className="font-medium">{booking.preferredTime || "Not specified"}</p>
                </div>
              </div>
            </div>

            {/* Vaccines */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Vaccines Requested</h3>
              <ul className="space-y-2">
                {getVaccineList().map((vaccine, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span>{vaccine}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Billing Details */}
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <h3 className="font-semibold text-gray-900 mb-3">Billing Details</h3>
              
              {loadingQuote ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                </div>
              ) : quote ? (
                <div className="space-y-3">
                  {/* Line Items Table */}
                  {lineItems.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-emerald-200">
                            <th className="text-left py-2 text-gray-700">Vaccine</th>
                            <th className="text-left py-2 text-gray-700">Patient</th>
                            <th className="text-right py-2 text-gray-700">Qty</th>
                            <th className="text-right py-2 text-gray-700">Price</th>
                            <th className="text-right py-2 text-gray-700">GST</th>
                            <th className="text-right py-2 text-gray-700">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lineItems.map((item, index) => (
                            <tr key={index} className="border-b border-emerald-100">
                              <td className="py-2">
                                <p className="font-medium">{item.vaccine}</p>
                                {item.brand && <p className="text-xs text-gray-500">{item.brand}</p>}
                              </td>
                              <td className="py-2 text-gray-600">{item.patient}</td>
                              <td className="py-2 text-right">{item.qty}</td>
                              <td className="py-2 text-right">₹{item.unitPrice.toLocaleString()}</td>
                              <td className="py-2 text-right">{item.gstPct}%</td>
                              <td className="py-2 text-right font-medium">
                                ₹{(item.qty * item.unitPrice * (1 + item.gstPct / 100)).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Bill Summary */}
                  <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{quote.subtotal.toLocaleString()}</span>
                    </div>
                    {quote.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({quote.discountType === "percentage" ? `${quote.discountValue}%` : "Flat"})</span>
                        <span>-₹{quote.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Convenience Fee</span>
                      <span className="font-medium">₹{quote.convenienceFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST</span>
                      <span className="font-medium">₹{quote.gstAmount.toLocaleString()}</span>
                    </div>
                    {quote.freeConsultations > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Free Consultations ({quote.freeConsultations}x)</span>
                        <span>+₹{quote.freeConsultationsValue.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-emerald-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Total Amount</span>
                        <span className="font-bold text-lg text-emerald-700">₹{quote.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Free Consultations Info */}
                  {quote.freeConsultations > 0 && (
                    <div className="bg-emerald-100 rounded-lg p-3 mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🎟️</span>
                        <div>
                          <p className="font-medium text-emerald-800">
                            {quote.freeConsultations} Free Consultation{quote.freeConsultations > 1 ? "s" : ""} Included
                          </p>
                          <p className="text-sm text-emerald-700">
                            Worth ₹{quote.freeConsultationsValue.toLocaleString()} - Check your profile after payment to book
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No billing information available yet</p>
                  <p className="text-sm mt-1">A quote will be generated by our team</p>
                </div>
              )}
            </div>

            {/* Admin Notes */}
            {booking.adminNotes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Admin Notes</h3>
                <p className="text-sm text-gray-700">{booking.adminNotes}</p>
              </div>
            )}

            {/* Assigned Nurse */}
            {booking.assignedNurse && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Assigned Nurse</h3>
                <p className="text-sm text-gray-700">{booking.assignedNurse}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-gray-500 border-t pt-4">
              <div className="flex justify-between">
                <span>Created: {new Date(booking.createdAt).toLocaleString("en-IN")}</span>
                <span>Updated: {new Date(booking.updatedAt).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
