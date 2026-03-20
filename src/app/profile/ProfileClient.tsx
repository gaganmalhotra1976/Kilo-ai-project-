"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", address: "", city: "Delhi" });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Get customer data from localStorage (set during login)
    const customerId = localStorage.getItem("customerId");
    const customerName = localStorage.getItem("customerName");
    
    if (!customerId || !customerName) {
      router.push("/login");
      return;
    }

    // Set basic customer info from localStorage
    setCustomer({
      id: parseInt(customerId),
      name: customerName,
      phone: "", // Will be fetched if needed
      email: null,
      address: null,
      city: "Delhi",
    });

    // Initialize edit form
    setEditForm({
      name: customerName,
      phone: "",
      email: "",
      address: "",
      city: "Delhi",
    });

    // Try to fetch additional data from API (non-critical)
    async function loadAdditionalData() {
      try {
        // Try to fetch customer details (may fail if no database)
        const customerRes = await fetch(`/api/customers/${customerId}`);
        if (customerRes.ok) {
          const customerData = await customerRes.json();
          setCustomer(customerData);
          // Update edit form with fetched data
          setEditForm({
            name: customerData.name || customerName,
            phone: customerData.phone || "",
            email: customerData.email || "",
            address: customerData.address || "",
            city: customerData.city || "Delhi",
          });
        }
      } catch (e) {
        console.log("Using basic profile data");
      }

      try {
        const membersRes = await fetch(`/api/family-members/customer/${customerId}`);
        if (membersRes.ok) {
          const membersData = await membersRes.json();
          setFamilyMembers(membersData);
        }
      } catch (e) {
        console.log("Could not load family members");
      }

      try {
        const bookingsRes = await fetch(`/api/bookings/customer/${customerId}`);
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData);
        }
      } catch (e) {
        console.log("Could not load bookings");
      }
    }

    loadAdditionalData().finally(() => setIsLoading(false));
  }, [router]);

  const handleEditProfile = () => {
    setIsEditing(true);
    setSaveError("");
    setSaveSuccess(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to current customer data
    if (customer) {
      setEditForm({
        name: customer.name,
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
        city: customer.city,
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!customer) return;
    
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedCustomer = await response.json();
        setCustomer(updatedCustomer);
        // Update localStorage with new name
        localStorage.setItem("customerName", editForm.name);
        setIsEditing(false);
        setSaveSuccess(true);
      } else {
        setSaveError("Failed to update profile. Please try again.");
      }
    } catch (e) {
      setSaveError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              {!isEditing && (
                <button
                  onClick={handleEditProfile}
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  Edit Profile
                </button>
              )}
            </div>
            
            {saveError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {saveError}
              </div>
            )}
            
            {saveSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                Profile updated successfully!
              </div>
            )}
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter your address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Name</label>
                  <p className="text-gray-900 font-medium">{customer.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <p className="text-gray-900">{customer.phone || "Not provided"}</p>
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
            )}
          </div>

          {/* Family Members */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Family Members</h2>
            {familyMembers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No family members added</p>
            ) : (
              <div className="space-y-3">
                {familyMembers.map((member) => (
                  <div key={member.id} className="border border-gray-100 rounded-lg p-3">
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">
                      {member.gender} • {member.dateOfBirth || "DOB not set"}
                    </p>
                  </div>
                ))}
              </div>
            )}
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
