"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CustomerFamilyMembers } from "./CustomerFamilyMembers";
import { ProfilePictureUpload } from "./ProfilePictureUpload";
import { BookingDetailsModal } from "./BookingDetailsModal";
import { ConsultationVouchers } from "./ConsultationVouchers";
import { FreeConsultationBooking } from "./FreeConsultationBooking";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string;
  pinCode: string | null;
  landmark: string | null;
  pictureUrl: string | null;
}

interface FamilyMember {
  id: number;
  customerId: number;
  name: string;
  dateOfBirth: string | null;
  gender: string | null;
  pictureUrl: string | null;
  vaccineCardUrl: string | null;
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

export function ProfileClient() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [editForm, setEditForm] = useState({ 
    name: "", 
    phone: "", 
    email: "", 
    address: "", 
    city: "Delhi",
    pinCode: "",
    landmark: "",
    pictureUrl: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

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
      phone: "",
      email: null,
      address: null,
      city: "Delhi",
      pinCode: null,
      landmark: null,
      pictureUrl: null,
    });

    // Initialize edit form
    setEditForm({
      name: customerName,
      phone: "",
      email: "",
      address: "",
      city: "Delhi",
      pinCode: "",
      landmark: "",
      pictureUrl: "",
    });

    // Try to fetch additional data from API (non-critical)
    async function loadAdditionalData() {
      try {
        // Use the new customer profile API
        const customerRes = await fetch(`/api/customer/profile?customerId=${customerId}`);
        if (customerRes.ok) {
          const data = await customerRes.json();
          if (data.success && data.data) {
            setCustomer(data.data);
            // Update edit form with fetched data
            setEditForm({
              name: data.data.name || customerName,
              phone: data.data.phone || "",
              email: data.data.email || "",
              address: data.data.address || "",
              city: data.data.city || "Delhi",
              pinCode: data.data.pinCode || "",
              landmark: data.data.landmark || "",
              pictureUrl: data.data.pictureUrl || "",
            });
          }
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
        pinCode: customer.pinCode || "",
        landmark: customer.landmark || "",
        pictureUrl: customer.pictureUrl || "",
      });
    }
  };

  // Auto-fetch GPS location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use reverse geocoding to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          
          if (response.ok) {
            const data = await response.json();
            const address = data.address || {};
            
            // Build address from components
            const streetParts = [];
            if (address.house_number) streetParts.push(address.house_number);
            if (address.road) streetParts.push(address.road);
            if (address.neighbourhood) streetParts.push(address.neighbourhood);
            
            const fullAddress = streetParts.join(", ") || data.display_name?.split(",").slice(0, 2).join(",") || "";
            const city = address.city || address.town || address.state_district || "Delhi";
            const pinCode = address.postcode || "";
            const landmark = address.suburb || address.neighbourhood || "";
            
            setEditForm(prev => ({
              ...prev,
              address: fullAddress,
              city: city,
              pinCode: pinCode,
              landmark: landmark,
            }));
          }
        } catch (e) {
          // Just use coordinates if geocoding fails
          setEditForm(prev => ({
            ...prev,
            address: `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          }));
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        setLocationError("Could not get your location. Please enter manually.");
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveProfile = async () => {
    if (!customer) return;
    
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          ...editForm,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCustomer(data.data);
        // Update localStorage with new name
        localStorage.setItem("customerName", editForm.name);
        setIsEditing(false);
        setSaveSuccess(true);
      } else {
        setSaveError(data.error || "Failed to update profile. Please try again.");
      }
    } catch (e) {
      setSaveError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePictureChange = (url: string) => {
    setEditForm({ ...editForm, pictureUrl: url });
    if (customer) {
      setCustomer({ ...customer, pictureUrl: url });
    }
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
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
                <div className="flex justify-center mb-4">
                  <ProfilePictureUpload
                    currentImage={editForm.pictureUrl}
                    onImageChange={handleProfilePictureChange}
                    label="Profile Picture"
                    size="lg"
                  />
                </div>
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
                
                {/* GPS Location Button */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Auto-detect Location</p>
                      <p className="text-sm text-gray-500">Use GPS to fill address automatically</p>
                    </div>
                    <button
                      onClick={handleGetLocation}
                      disabled={isGettingLocation}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isGettingLocation ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Getting...
                        </>
                      ) : (
                        <>
                          📍 Get Location
                        </>
                      )}
                    </button>
                  </div>
                  {locationError && (
                    <p className="text-red-600 text-sm mt-2">{locationError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    rows={3}
                    placeholder="House/Flat No., Street Name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={editForm.pinCode}
                      onChange={(e) => setEditForm({ ...editForm, pinCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="110001"
                      maxLength={6}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                  <input
                    type="text"
                    value={editForm.landmark}
                    onChange={(e) => setEditForm({ ...editForm, landmark: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Near Metro Station, Behind Temple, etc."
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
                <div className="flex items-center gap-4 mb-4">
                  {customer.pictureUrl ? (
                    <img
                      src={customer.pictureUrl}
                      alt={customer.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-emerald-600 text-2xl font-bold">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-xl font-bold text-gray-900">{customer.name}</p>
                    <p className="text-gray-500">{customer.city}</p>
                  </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">City</label>
                    <p className="text-gray-900">{customer.city}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">PIN Code</label>
                    <p className="text-gray-900">{customer.pinCode || "Not provided"}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Landmark</label>
                  <p className="text-gray-900">{customer.landmark || "Not provided"}</p>
                </div>
              </div>
            )}
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
                  <div 
                    key={booking.id} 
                    onClick={() => handleBookingClick(booking)}
                    className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
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
                        <p className="text-xs text-gray-400 mt-1">
                          Booking #{booking.id} • {booking.bookingType}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "confirmed"
                              ? "bg-blue-100 text-blue-800"
                              : booking.status === "quoted"
                              ? "bg-yellow-100 text-yellow-800"
                              : booking.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">Click for details</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Free Consultation Vouchers */}
          <div className="lg:col-span-2">
            <ConsultationVouchers customerId={customer.id} />
          </div>

          {/* Free Consultation Booking */}
          <div className="lg:col-span-2">
            <FreeConsultationBooking customerId={customer.id} />
          </div>
        </div>
      </main>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedBooking(null);
        }}
      />
    </div>
  );
}
