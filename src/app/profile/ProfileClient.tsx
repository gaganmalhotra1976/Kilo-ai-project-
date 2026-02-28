"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CustomerFamilyMembers } from "./CustomerFamilyMembers";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string;
}

interface FamilyMember {
  id: number;
  customerId: number;
  name: string;
  dateOfBirth: string | null;
  gender: string | null;
  vaccineCardUrl: string | null;
}

interface Booking {
  id: number;
  status: string;
  vaccinesRequested: string;
  preferredDate: string | null;
  createdAt: Date;
}

export function ProfileClient() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const customerId = localStorage.getItem("customerId");
    if (!customerId) {
      router.push("/login");
      return;
    }

    async function loadProfile() {
      try {
        // Fetch customer data first — this is the critical auth check
        const customerRes = await fetch(`/api/customers/${customerId}`);
        if (customerRes.status === 401 || customerRes.status === 404) {
          // Customer not found or unauthorized — clear session and redirect
          localStorage.removeItem("authToken");
          localStorage.removeItem("customerId");
          localStorage.removeItem("customerName");
          router.push("/login");
          return;
        }
        if (!customerRes.ok) {
          // Server error — don't redirect, just show error state
          console.error("Failed to fetch customer:", customerRes.status);
          return;
        }
        const customerData = await customerRes.json();
        setCustomer(customerData);

        // Fetch family members — non-critical, don't redirect on failure
        try {
          const membersRes = await fetch(`/api/family-members/customer/${customerId}`);
          if (membersRes.ok) {
            const membersData = await membersRes.json();
            setFamilyMembers(membersData);
          }
        } catch (e) {
          console.error("Failed to fetch family members:", e);
        }

        // Fetch bookings — non-critical, don't redirect on failure
        try {
          const bookingsRes = await fetch(`/api/bookings/customer/${customerId}`);
          if (bookingsRes.ok) {
            const bookingsData = await bookingsRes.json();
            setBookings(bookingsData);
          }
        } catch (e) {
          console.error("Failed to fetch bookings:", e);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("customerId");
    localStorage.removeItem("customerName");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load profile. Please log in again.</p>
          <Link href="/login" className="text-emerald-600 hover:underline mt-2 inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">The Vaccine Panda</h1>
              <p className="text-sm text-gray-600">Your Profile</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-emerald-600 hover:underline">
                Home
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Name</label>
                <p className="text-gray-900 font-medium">{customer.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <p className="text-gray-900">{customer.phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="text-gray-900">{customer.email || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Address</label>
                <p className="text-gray-900">{customer.address || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">City</label>
                <p className="text-gray-900">{customer.city}</p>
              </div>
            </div>
          </div>

          {/* Family Members */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Family Members</h2>
            <CustomerFamilyMembers
              customerId={customer.id}
              initialFamilyMembers={familyMembers}
            />
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Bookings</h2>
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No bookings yet</p>
                <Link
                  href="/book"
                  className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors inline-block"
                >
                  Book a Vaccination
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {(() => {
                            try {
                              const parsed = JSON.parse(booking.vaccinesRequested);
                              return Array.isArray(parsed) ? parsed.join(", ") : booking.vaccinesRequested;
                            } catch {
                              return booking.vaccinesRequested;
                            }
                          })()}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {booking.preferredDate
                            ? new Date(booking.preferredDate).toLocaleDateString("en-IN")
                            : "Date not specified"}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "confirmed"
                            ? "bg-blue-100 text-blue-800"
                            : booking.status === "quoted"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
