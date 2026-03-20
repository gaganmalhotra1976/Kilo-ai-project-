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
  voucherValue: number;
}

interface Slot {
  time: string;
  bookedCount: number;
  maxBookings: number;
  available: boolean;
  remaining: number;
}

interface ConsultationBooking {
  id: number;
  voucherId: number;
  consultationDate: string;
  consultationTime: string;
  status: string;
  patientName: string;
}

interface FreeConsultationBookingProps {
  customerId: number;
}

export function FreeConsultationBooking({ customerId }: FreeConsultationBookingProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [consultationBookings, setConsultationBookings] = useState<ConsultationBooking[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load vouchers and consultation bookings
  useEffect(() => {
    async function loadData() {
      try {
        // Load active vouchers
        const vouchersRes = await fetch(`/api/consultation-vouchers?customerId=${customerId}&status=active`);
        if (vouchersRes.ok) {
          const data = await vouchersRes.json();
          if (data.success && data.data?.vouchers) {
            setVouchers(data.data.vouchers);
          }
        }

        // Load consultation bookings
        const bookingsRes = await fetch(`/api/consultation-bookings/book?customerId=${customerId}`);
        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          if (data.success && data.data) {
            setConsultationBookings(data.data);
          }
        }
      } catch (e) {
        console.log("Could not load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [customerId]);

  // Load available slots when date changes
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    async function loadSlots() {
      setLoadingSlots(true);
      setError("");
      
      try {
        const res = await fetch(`/api/consultation-bookings/slots?date=${selectedDate}&customerId=${customerId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setAvailableSlots(data.data.slots);
            if (data.data.isWeekend) {
              setError("Consultations are only available on weekdays (Monday to Friday)");
            }
          }
        }
      } catch (e) {
        console.log("Could not load slots");
      } finally {
        setLoadingSlots(false);
      }
    }

    loadSlots();
  }, [selectedDate, customerId]);

  // Generate dates for next 30 days (weekdays only)
  const getNextDates = () => {
    const dates: { date: string; label: string; dayName: string }[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayOfWeek = date.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      
      const dateStr = date.toISOString().split('T')[0];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      dates.push({
        date: dateStr,
        label: `${dayNames[dayOfWeek]} ${date.getDate()} ${monthNames[date.getMonth()]}`,
        dayName: dayNames[dayOfWeek]
      });
    }
    
    return dates;
  };

  const availableDates = getNextDates();

  const handleBookConsultation = async () => {
    if (!selectedVoucher || !selectedDate || !selectedSlot) {
      setError("Please select a voucher, date, and time slot");
      return;
    }

    setBooking(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/consultation-bookings/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucherId: selectedVoucher.id,
          customerId,
          patientName: selectedVoucher.patientName,
          consultationDate: selectedDate,
          consultationTime: selectedSlot
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess("Consultation booked successfully!");
        // Refresh data
        const vouchersRes = await fetch(`/api/consultation-vouchers?customerId=${customerId}&status=active`);
        if (vouchersRes.ok) {
          const vouchersData = await vouchersRes.json();
          if (vouchersData.success && vouchersData.data?.vouchers) {
            setVouchers(vouchersData.data.vouchers);
          }
        }

        const bookingsRes = await fetch(`/api/consultation-bookings/book?customerId=${customerId}`);
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          if (bookingsData.success && bookingsData.data) {
            setConsultationBookings(bookingsData.data);
          }
        }

        // Reset selection
        setSelectedVoucher(null);
        setSelectedDate("");
        setSelectedSlot("");
      } else {
        setError(data.error || "Failed to book consultation");
      }
    } catch (e) {
      setError("Failed to book consultation. Please try again.");
    } finally {
      setBooking(false);
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

  const activeVouchers = vouchers.filter(v => v.status === "active");
  const bookedConsultations = consultationBookings.filter(b => b.status === "booked");

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Book Free Consultation</h2>
        <p className="text-sm text-gray-500 mt-1">
          Use your vouchers to book free doctor consultations
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      {activeVouchers.length === 0 && bookedConsultations.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎟️</div>
          <p className="text-gray-500 font-medium">No active vouchers</p>
          <p className="text-sm text-gray-400 mt-2">
            Complete vaccination bookings to earn free consultation vouchers
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Vouchers Selection */}
          {activeVouchers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Select a Voucher ({activeVouchers.length} available)
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {activeVouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    onClick={() => setSelectedVoucher(voucher)}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-colors ${
                      selectedVoucher?.id === voucher.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">{voucher.patientName}</span>
                      <span className="text-emerald-600 font-medium">₹{voucher.voucherValue}</span>
                    </div>
                    <p className="font-mono text-sm text-gray-700">{voucher.voucherCode}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Expires: {new Date(voucher.expiryDate).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Date Selection */}
          {selectedVoucher && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Select a Date
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableDates.map((dateObj) => (
                  <button
                    key={dateObj.date}
                    onClick={() => setSelectedDate(dateObj.date)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedDate === dateObj.date
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {dateObj.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time Slot Selection */}
          {selectedDate && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Select a Time Slot
                <span className="ml-2 text-xs text-gray-500">
                  (Working hours: 11 AM - 2 PM, 7 PM - 9 PM)
                </span>
              </h3>
              
              {loadingSlots ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No slots available for this date</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Morning Slots */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Morning (11 AM - 2 PM)</p>
                    <div className="flex flex-wrap gap-2">
                      {availableSlots
                        .filter(slot => parseInt(slot.time.split(":")[0]) < 14)
                        .map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedSlot(slot.time)}
                            disabled={!slot.available}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              selectedSlot === slot.time
                                ? "bg-emerald-600 text-white"
                                : slot.available
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {slot.time}
                            {slot.available && (
                              <span className="ml-1 text-xs">({slot.remaining} left)</span>
                            )}
                            {!slot.available && (
                              <span className="ml-1 text-xs">Full</span>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Evening Slots */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Evening (7 PM - 9 PM)</p>
                    <div className="flex flex-wrap gap-2">
                      {availableSlots
                        .filter(slot => parseInt(slot.time.split(":")[0]) >= 19)
                        .map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedSlot(slot.time)}
                            disabled={!slot.available}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              selectedSlot === slot.time
                                ? "bg-emerald-600 text-white"
                                : slot.available
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {slot.time}
                            {slot.available && (
                              <span className="ml-1 text-xs">({slot.remaining} left)</span>
                            )}
                            {!slot.available && (
                              <span className="ml-1 text-xs">Full</span>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Book Button */}
          {selectedVoucher && selectedDate && selectedSlot && (
            <div className="pt-4 border-t border-gray-200">
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Patient:</span> {selectedVoucher.patientName}</p>
                  <p><span className="font-medium">Voucher:</span> {selectedVoucher.voucherCode}</p>
                  <p><span className="font-medium">Date:</span> {new Date(selectedDate).toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><span className="font-medium">Time:</span> {selectedSlot}</p>
                  <p><span className="font-medium">Value:</span> ₹{selectedVoucher.voucherValue}</p>
                </div>
              </div>

              <button
                onClick={handleBookConsultation}
                disabled={booking}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-medium"
              >
                {booking ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          )}

          {/* Upcoming Bookings */}
          {bookedConsultations.length > 0 && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Your Upcoming Consultations</h3>
              <div className="space-y-3">
                {bookedConsultations.map((booking) => (
                  <div key={booking.id} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{booking.patientName}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.consultationDate).toLocaleDateString("en-IN", { weekday: 'short', month: 'short', day: 'numeric' })} at {booking.consultationTime}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        Booked
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
