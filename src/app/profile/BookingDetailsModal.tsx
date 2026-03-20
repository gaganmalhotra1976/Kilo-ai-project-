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

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingDetailsModal({ booking, isOpen, onClose }: BookingDetailsModalProps) {
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
