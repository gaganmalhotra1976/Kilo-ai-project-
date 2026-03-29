"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProfileClientWrapperProps {
  clerkUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string;
  pinCode: string | null;
  landmark: string | null;
  pictureData: string | null;
}

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

interface FamilyMember {
  id: number;
  customerId: number;
  name: string;
  dateOfBirth: string | null;
  gender: string | null;
  vaccineCardUrl: string | null;
}

export function ProfileClientWrapper({ email, firstName, lastName, phone }: ProfileClientWrapperProps) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [familyMembersList, setFamilyMembersList] = useState<FamilyMember[]>([]);
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!email) {
        setIsLoading(false);
        return;
      }

      try {
        // First sync this Clerk user to create/find patient record
        setIsSyncing(true);
        await fetch("/api/clerk/sync-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: email, // Using email as identifier for now
            email,
            firstName,
            lastName,
            phone,
          }),
        });
        setIsSyncing(false);

        // Then load profile data
        const res = await fetch(`/api/customer/profile-by-email?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setCustomer(data.data);

            // Load bookings for this patient
            const bookingsRes = await fetch(`/api/bookings/customer/${data.data.id}`);
            if (bookingsRes.ok) {
              const bookingsData = await bookingsRes.json();
              setBookingsList(Array.isArray(bookingsData) ? bookingsData : (bookingsData.bookings || []));
            }

            // Load family members
            const familyRes = await fetch(`/api/family-members/customer/${data.data.id}`);
            if (familyRes.ok) {
              const familyData = await familyRes.json();
              setFamilyMembersList(Array.isArray(familyData) ? familyData : []);
            }
          }
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      }

      setIsLoading(false);
    }

    loadData();
  }, [email, firstName, lastName, phone]);

  if (isLoading || isSyncing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{isSyncing ? "Setting up your profile..." : "Loading profile..."}</p>
        </div>
      </div>
    );
  }

  const displayName = `${firstName} ${lastName}`.trim() || email.split("@")[0];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Welcome, {displayName}!</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <p className="font-medium">{displayName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <p className="font-medium">{email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <p className="font-medium">{phone || "Not set"}</p>
          </div>
          {customer && (
            <>
              <div>
                <label className="text-sm text-gray-600">City</label>
                <p className="font-medium">{customer.city}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Patient ID</label>
                <p className="font-medium">#{customer.id}</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Your Bookings ({bookingsList.length})</h2>
        {bookingsList.length === 0 ? (
          <p className="text-gray-500">No bookings yet. <a href="/book" className="text-emerald-600 hover:underline">Book a vaccination</a></p>
        ) : (
          <div className="space-y-4">
            {bookingsList.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Booking #{booking.id}</p>
                    <p className="text-sm text-gray-600">{booking.vaccinesRequested}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    booking.status === "completed" ? "bg-green-100 text-green-800" :
                    booking.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                    booking.status === "cancelled" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {booking.preferredDate ? new Date(booking.preferredDate).toLocaleDateString() : "Date not set"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Family Members ({familyMembersList.length})</h2>
        {familyMembersList.length === 0 ? (
          <p className="text-gray-500">No family members added yet.</p>
        ) : (
          <div className="space-y-2">
            {familyMembersList.map((member) => (
              <div key={member.id} className="border rounded-lg p-4">
                <p className="font-medium">{member.name}</p>
                {member.dateOfBirth && (
                  <p className="text-sm text-gray-500">DOB: {member.dateOfBirth}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}