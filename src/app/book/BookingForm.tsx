"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const VACCINE_OPTIONS = [
  "Flu (Influenza)",
  "Hepatitis A",
  "Hepatitis B",
  "Hepatitis A+B (Combined)",
  "Typhoid",
  "Chickenpox (Varicella)",
  "MMR (Measles, Mumps, Rubella)",
  "Pneumococcal",
  "HPV",
  "Rabies",
  "Meningococcal",
  "Japanese Encephalitis",
  "Yellow Fever",
  "Cholera",
  "Tdap (Tetanus, Diphtheria, Pertussis)",
  "COVID-19 Booster",
  "Other (specify in notes)",
];

interface FamilyMember {
  id: number;
  name: string;
  dateOfBirth?: string | null;
  gender?: string | null;
}

interface CustomerProfile {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string;
  pinCode: string | null;
  landmark: string | null;
}

export default function BookingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVaccines, setSelectedVaccines] = useState<string[]>([]);
  const [authChecking, setAuthChecking] = useState(true);

  // Family member selection state
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<string[]>(["myself"]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);

  // Address change confirmation
  const [showAddressConfirm, setShowAddressConfirm] = useState(false);
  const [useDifferentAddress, setUseDifferentAddress] = useState(false);

  // Form values (pre-filled from profile)
  const [formValues, setFormValues] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    address: "",
    city: "Delhi",
    pinCode: "",
    landmark: "",
  });

  // Add family member inline form
  const [showAddMember, setShowAddMember] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [addMemberError, setAddMemberError] = useState("");
  const [newMember, setNewMember] = useState({ name: "", dateOfBirth: "", gender: "" });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const custId = localStorage.getItem("customerId");
    const storedName = localStorage.getItem("customerName");

    if (!token) {
      // Not logged in — redirect to login with return URL
      router.replace("/login?redirect=/book");
      return;
    }

    setIsLoggedIn(true);
    setCustomerName(storedName || "Myself");
    setCustomerId(custId);
    setAuthChecking(false);

    if (custId) {
      // Fetch customer profile to auto-populate form
      fetch(`/api/customer/profile?customerId=${custId}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data?.success && data.data) {
            const profile = data.data;
            setCustomerProfile(profile);
            setFormValues({
              customerName: profile.name || storedName || "",
              customerPhone: profile.phone || "",
              customerEmail: profile.email || "",
              address: profile.address || "",
              city: profile.city || "Delhi",
              pinCode: profile.pinCode || "",
              landmark: profile.landmark || "",
            });
            
            // Show address confirmation if address exists
            if (profile.address) {
              setShowAddressConfirm(true);
            }
          }
        })
        .catch(() => console.log("Could not load profile"));

      // Fetch family members
      fetch(`/api/family-members/customer/${custId}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data: FamilyMember[]) => setFamilyMembers(data))
        .catch(() => setFamilyMembers([]));
    }
  }, [router]);

  function toggleVaccine(v: string) {
    setSelectedVaccines((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  }

  function togglePatient(key: string) {
    setSelectedPatients((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newMember.name.trim()) return;
    setAddMemberLoading(true);
    setAddMemberError("");
    try {
      const res = await fetch("/api/family-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newMember, customerId: Number(customerId) }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to add member");
      }
      const added: FamilyMember = await res.json();
      setFamilyMembers((prev) => [...prev, added]);
      setSelectedPatients((prev) => [...prev, String(added.id)]);
      setNewMember({ name: "", dateOfBirth: "", gender: "" });
      setShowAddMember(false);
    } catch (err) {
      setAddMemberError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setAddMemberLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (selectedVaccines.length === 0) {
      setError("Please select at least one vaccine.");
      return;
    }

    if (isLoggedIn && selectedPatients.length === 0) {
      setError("Please select at least one person for this booking.");
      return;
    }

    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    // Build patient names list
    let patientNames: string[] | null = null;
    if (isLoggedIn) {
      patientNames = selectedPatients.map((key) => {
        if (key === "myself") return customerName;
        const member = familyMembers.find((m) => String(m.id) === key);
        return member ? member.name : key;
      });
    }

    const payload = {
      customerName: data.get("customerName") as string,
      customerPhone: data.get("customerPhone") as string,
      customerEmail: data.get("customerEmail") as string,
      address: data.get("address") as string,
      city: data.get("city") as string,
      vaccinesRequested: selectedVaccines,
      numberOfPeople: patientNames ? patientNames.length : (parseInt(data.get("numberOfPeople") as string, 10) || 1),
      bookingType: data.get("bookingType") as string,
      preferredDate: data.get("preferredDate") as string,
      preferredTime: data.get("preferredTime") as string,
      patientNames,
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Something went wrong");
      }

      router.push("/book/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  // Show spinner while checking auth (avoids flash of form before redirect)
  if (authChecking) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6"
    >
      {/* Profile data notice */}
      {customerProfile && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600">✓</span>
            <p className="text-sm text-emerald-800">
              <span className="font-medium">Using data from your profile.</span> You can edit fields below if needed.
            </p>
          </div>
        </div>
      )}

      {/* Personal details */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Your Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              name="customerName"
              type="text"
              required
              value={formValues.customerName}
              onChange={(e) => setFormValues({ ...formValues, customerName: e.target.value })}
              placeholder="Priya Sharma"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              name="customerPhone"
              type="tel"
              required
              value={formValues.customerPhone}
              onChange={(e) => setFormValues({ ...formValues, customerPhone: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              name="customerEmail"
              type="email"
              value={formValues.customerEmail}
              onChange={(e) => setFormValues({ ...formValues, customerEmail: e.target.value })}
              placeholder="priya@example.com"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Who is this booking for? — shown only when logged in */}
      {isLoggedIn && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Who is this booking for? <span className="text-red-500">*</span>
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Select yourself and/or family members who need vaccination.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Myself option */}
            <label
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors text-sm ${
                selectedPatients.includes("myself")
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-medium"
                  : "border-gray-200 hover:border-emerald-300 text-gray-700"
              }`}
            >
              <input
                type="checkbox"
                className="accent-emerald-600"
                checked={selectedPatients.includes("myself")}
                onChange={() => togglePatient("myself")}
              />
              <span>
                {customerName || "Myself"}
                <span className="ml-1.5 text-xs text-emerald-600 font-normal">(You)</span>
              </span>
            </label>

            {/* Family members */}
            {familyMembers.map((member) => (
              <label
                key={member.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors text-sm ${
                  selectedPatients.includes(String(member.id))
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-medium"
                    : "border-gray-200 hover:border-emerald-300 text-gray-700"
                }`}
              >
                <input
                  type="checkbox"
                  className="accent-emerald-600"
                  checked={selectedPatients.includes(String(member.id))}
                  onChange={() => togglePatient(String(member.id))}
                />
                <span>
                  {member.name}
                  {member.dateOfBirth && (
                    <span className="ml-1.5 text-xs text-gray-400 font-normal">
                      (DOB: {member.dateOfBirth})
                    </span>
                  )}
                </span>
              </label>
            ))}

          </div>

          {/* Add family member button + inline form */}
          <div className="mt-3">
            {!showAddMember ? (
              <button
                type="button"
                onClick={() => setShowAddMember(true)}
                className="flex items-center gap-2 text-sm text-emerald-700 font-medium border border-emerald-300 rounded-xl px-4 py-2 hover:bg-emerald-50 transition-colors"
              >
                <span className="text-lg leading-none">+</span> Add Family Member
              </button>
            ) : (
              <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50 space-y-3">
                <p className="text-sm font-semibold text-emerald-800">Add a Family Member</p>
                {addMemberError && (
                  <p className="text-xs text-red-600">{addMemberError}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={newMember.name}
                      onChange={(e) => setNewMember((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Full name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={newMember.dateOfBirth}
                      onChange={(e) => setNewMember((p) => ({ ...p, dateOfBirth: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                    <select
                      value={newMember.gender}
                      onChange={(e) => setNewMember((p) => ({ ...p, gender: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddMember}
                    disabled={addMemberLoading || !newMember.name.trim()}
                    className="bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {addMemberLoading ? "Saving…" : "Save Member"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddMember(false); setAddMemberError(""); setNewMember({ name: "", dateOfBirth: "", gender: "" }); }}
                    className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Address */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Visit Address</h2>
        
        {/* Address confirmation for existing users */}
        {showAddressConfirm && formValues.address && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm font-medium text-blue-800 mb-2">Use your saved address?</p>
            <div className="bg-white rounded-lg p-3 mb-3 text-sm">
              <p className="font-medium">{formValues.address}</p>
              <p className="text-gray-500">{formValues.city} - {formValues.pinCode || "N/A"}</p>
              {formValues.landmark && <p className="text-gray-500">Near {formValues.landmark}</p>}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setUseDifferentAddress(false);
                  setShowAddressConfirm(false);
                }}
                className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Yes, use this address
              </button>
              <button
                type="button"
                onClick={() => {
                  setUseDifferentAddress(true);
                  setShowAddressConfirm(false);
                  setFormValues({
                    ...formValues,
                    address: "",
                    city: "Delhi",
                    pinCode: "",
                    landmark: "",
                  });
                }}
                className="border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                No, use different address
              </button>
            </div>
          </div>
        )}

        {(!showAddressConfirm || useDifferentAddress) && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                required
                rows={3}
                value={formValues.address}
                onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
                placeholder="Flat 4B, Green Park Apartments, Sector 18..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  name="city"
                  required
                  value={formValues.city}
                  onChange={(e) => setFormValues({ ...formValues, city: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Delhi">Delhi</option>
                  <option value="Noida">Noida</option>
                  <option value="Gurgaon">Gurgaon</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PIN Code
                </label>
                <input
                  type="text"
                  name="pinCode"
                  value={formValues.pinCode}
                  onChange={(e) => setFormValues({ ...formValues, pinCode: e.target.value })}
                  placeholder="110001"
                  maxLength={6}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formValues.landmark}
                  onChange={(e) => setFormValues({ ...formValues, landmark: e.target.value })}
                  placeholder="Near Metro Station"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vaccines */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Vaccines Required <span className="text-red-500">*</span>
        </h2>
        <p className="text-gray-500 text-sm mb-4">Select all that apply. Not sure? Select &ldquo;Other&rdquo; and we&apos;ll advise.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {VACCINE_OPTIONS.map((v) => (
            <label
              key={v}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors text-sm ${
                selectedVaccines.includes(v)
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-medium"
                  : "border-gray-200 hover:border-emerald-300 text-gray-700"
              }`}
            >
              <input
                type="checkbox"
                className="accent-emerald-600"
                checked={selectedVaccines.includes(v)}
                onChange={() => toggleVaccine(v)}
              />
              {v}
            </label>
          ))}
        </div>
      </div>

      {/* Booking details */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Booking Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Only show number of people if not logged in (when logged in, count is derived from selected patients) */}
          {!isLoggedIn && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of People <span className="text-red-500">*</span>
              </label>
              <input
                name="numberOfPeople"
                type="number"
                min={1}
                max={100}
                defaultValue={1}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Booking Type
            </label>
            <select
              name="bookingType"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="individual">Individual</option>
              <option value="family">Family (3+ people)</option>
              <option value="corporate">Corporate / Group Drive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Date
            </label>
            <input
              name="preferredDate"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Time
            </label>
            <select
              name="preferredTime"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">Any time</option>
              <option value="morning">Morning (8am – 12pm)</option>
              <option value="afternoon">Afternoon (12pm – 4pm)</option>
              <option value="evening">Evening (4pm – 7pm)</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors text-lg disabled:opacity-60 disabled:cursor-not-allowed shadow"
      >
        {loading ? "Submitting…" : "Submit Booking Request →"}
      </button>

      <p className="text-center text-xs text-gray-400">
        By submitting, you agree to be contacted by our team. We never share your data.
      </p>
    </form>
  );
}
