"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Individual vaccines for ad-hoc selection
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

// Schedule packages for babies / infants
const SCHEDULE_PACKAGES = [
  {
    id: "6week",
    label: "6 Week Package",
    emoji: "👶",
    subtitle: "Primary immunization begins",
    duration: "6 weeks",
    vaccines: [
      "DPT + IPV + Hib + Hep B (Hexavalent) – 1st dose",
      "OPV – 1st dose",
      "Rotavirus – 1st dose",
      "PCV (Pneumococcal) – 1st dose",
    ],
    priceRange: "₹5,400 – ₹6,400",
  },
  {
    id: "10week",
    label: "10 Week Package",
    emoji: "🍼",
    subtitle: "Second round of primary immunization",
    duration: "10 weeks",
    vaccines: [
      "DPT + IPV + Hib + Hep B (Hexavalent) – 2nd dose",
      "OPV – 2nd dose",
      "Rotavirus – 2nd dose",
      "PCV (Pneumococcal) – 2nd dose",
    ],
    priceRange: "₹5,400 – ₹6,400",
  },
  {
    id: "14week",
    label: "14 Week Package",
    emoji: "🥛",
    subtitle: "Third round of primary immunization",
    duration: "14 weeks",
    vaccines: [
      "DPT + IPV + Hib + Hep B (Hexavalent) – 3rd dose",
      "OPV – 3rd dose",
      "Rotavirus – 3rd dose",
      "PCV (Pneumococcal) – 3rd dose",
    ],
    priceRange: "₹5,400 – ₹6,400",
  },
  {
    id: "1yr",
    label: "1 Year Package",
    emoji: "🎂",
    subtitle: "First birthday boosters",
    duration: "12 months",
    vaccines: [
      "MMR – 1st dose",
      "Varicella (Chickenpox) – 1st dose",
      "Hepatitis A – 1st dose",
      "PCV (Pneumococcal) – Booster",
      "Typhoid Conjugate – 1st dose",
    ],
    priceRange: "On Request",
  },
  {
    id: "custom",
    label: "Custom Package",
    emoji: "🎯",
    subtitle: "Pick any vaccines you need",
    duration: "Flexible",
    vaccines: [],
    priceRange: "Varies",
  },
];

// Pain level options
const PAIN_OPTIONS = [
  { id: "normal", label: "Normal", desc: "Standard vaccine formulation", icon: "💉" },
  { id: "lowPain", label: "Low Pain / Pain-Free", desc: "Pre-filled syringes, reduced sting", icon: "🩹" },
];

// Package duration options
const DURATION_OPTIONS = [
  { id: "1year", label: "1 Year Plan", desc: "All doses within 12 months", icon: "📅" },
  { id: "custom", label: "Custom Plan", desc: "Flexible scheduling as per your baby's needs", icon: "🔄" },
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

interface Voucher {
  id: number;
  voucherCode: string;
  patientName: string;
  status: string;
  voucherValue: number;
  expiryDate: string;
}

function BookingFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Booking mode: "schedule" (package) or "vaccines" (individual)
  const [bookingMode, setBookingMode] = useState<"schedule" | "vaccines">("vaccines");

  // Schedule package selection
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [painLevel, setPainLevel] = useState<string>("normal");
  const [packageDuration, setPackageDuration] = useState<string>("1year");

  // Individual vaccine selection
  const preSelected = searchParams.getAll("vaccine");
  const [selectedVaccines, setSelectedVaccines] = useState<string[]>(
    preSelected.length > 0 ? preSelected : []
  );
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
  const [savedAddress, setSavedAddress] = useState<{address: string; city: string; pinCode: string; landmark: string} | null>(null);

  // Date selection (for Sunday detection)
  const [selectedDate, setSelectedDate] = useState("");
  const isSunday = selectedDate ? new Date(selectedDate).getDay() === 0 : false;

  // Preferred time (for premium slot detection)
  const [preferredTime, setPreferredTime] = useState("");

  // Consultation preference
  const [consultationPreference, setConsultationPreference] = useState<"include" | "discount" | "convert">("include");

  // Available vouchers for conversion
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);

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
      router.replace("/login?redirect=/book");
      return;
    }

    setIsLoggedIn(true);
    setCustomerName(storedName || "Myself");
    setCustomerId(custId);
    setAuthChecking(false);

    if (custId) {
      // Fetch customer profile
      fetch(`/api/customer/profile?customerId=${custId}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data?.success && data.data) {
            const profile = data.data;
            setCustomerProfile(profile);
            const profileAddress = {
              address: profile.address || "",
              city: profile.city || "Delhi",
              pinCode: profile.pinCode || "",
              landmark: profile.landmark || "",
            };
            setSavedAddress(profileAddress);
            setFormValues({
              customerName: profile.name || storedName || "",
              customerPhone: profile.phone || "",
              customerEmail: profile.email || "",
              ...profileAddress,
            });
            if (profile.address) {
              setShowAddressConfirm(true);
            }
          }
        })
        .catch(() => console.log("Could not load profile"));

      // Fetch family members via new self-service endpoint
      fetch(`/api/customer/family?customerId=${custId}`)
        .then((res) => (res.ok ? res.json() : { data: [] }))
        .then((json) => {
          const members = json.success ? json.data : (Array.isArray(json) ? json : []);
          setFamilyMembers(members);
        })
        .catch(() => setFamilyMembers([]));

      // Fetch active consultation vouchers
      fetch(`/api/consultation-vouchers?customerId=${custId}&status=active`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data?.success && data.data?.vouchers) {
            setAvailableVouchers(data.data.vouchers);
          }
        })
        .catch(() => setAvailableVouchers([]));
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

  async function handleAddMember(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!newMember.name.trim()) {
      setAddMemberError("Please enter a name");
      return;
    }
    if (!customerId || customerId === "null") {
      setAddMemberError("Session error. Please refresh and try again.");
      return;
    }
    setAddMemberLoading(true);
    setAddMemberError("");
    try {
      // Use the new /api/customer/family endpoint (self-service, no admin auth)
      const res = await fetch("/api/customer/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: parseInt(customerId),
          name: newMember.name.trim(),
          dateOfBirth: newMember.dateOfBirth || null,
          gender: newMember.gender || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to add member");
      }
      const added: FamilyMember = json.data;
      setFamilyMembers((prev) => [...prev, added]);
      setSelectedPatients((prev) => [...prev, String(added.id)]);
      setNewMember({ name: "", dateOfBirth: "", gender: "" });
      setShowAddMember(false);
      setAddMemberError("");
    } catch (err) {
      setAddMemberError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setAddMemberLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    // Validate selection based on booking mode
    if (bookingMode === "schedule") {
      if (!selectedPackage) {
        setError("Please select a schedule package.");
        return;
      }
    } else {
      if (selectedVaccines.length === 0) {
        setError("Please select at least one vaccine.");
        return;
      }
    }

    if (isLoggedIn && selectedPatients.length === 0) {
      setError("Please select at least one person for this booking.");
      return;
    }

    // Sunday booking validation
    const isSundayBooking = selectedDate && new Date(selectedDate).getDay() === 0;
    const formEl = e.currentTarget;
    const sundayCheckbox = formEl.querySelector<HTMLInputElement>('input[name="sundayAdvanceAccepted"]');
    const sundayAdvanceAccepted = sundayCheckbox?.checked ?? false;

    if (isSundayBooking && !sundayAdvanceAccepted) {
      setError("Please accept the non-refundable Sunday advance to proceed.");
      return;
    }

    setLoading(true);
    const data = new FormData(formEl);

    // Premium slot validation (after data is defined)
    const preferredTime = (data.get("preferredTime") as string) || "";
    const isPremiumSlot = preferredTime === "premium-1hr";
    const premiumCheckbox = formEl.querySelector<HTMLInputElement>('input[name="premiumAccepted"]');
    const premiumAccepted = premiumCheckbox?.checked ?? false;

    if (isPremiumSlot && !premiumAccepted) {
      setLoading(false);
      setError("Please accept the full prepayment requirement for the premium slot.");
      return;
    }

    // Build patient names list
    let patientNames: string[] | null = null;
    if (isLoggedIn) {
      patientNames = selectedPatients.map((key) => {
        if (key === "myself") return customerName;
        const member = familyMembers.find((m) => String(m.id) === key);
        return member ? member.name : key;
      });
    }

    // Build selected vaccines list based on mode
    let vaccinesList: string[] = [];
    if (bookingMode === "schedule" && selectedPackage) {
      const pkg = SCHEDULE_PACKAGES.find((p) => p.id === selectedPackage);
      if (pkg) {
        vaccinesList = pkg.id === "custom" ? selectedVaccines : pkg.vaccines;
      }
    } else {
      vaccinesList = selectedVaccines;
    }

    // Calculate voucher conversion discount (10% of total consultation value, max ₹100)
    let voucherConversionDiscount = 0;
    if (consultationPreference === "convert" && availableVouchers.length > 0) {
      const totalVoucherValue = availableVouchers.reduce((sum, v) => sum + v.voucherValue, 0);
      voucherConversionDiscount = Math.min(totalVoucherValue * 0.1, 100);
    }

    const payload = {
      customerName: data.get("customerName") as string,
      customerPhone: data.get("customerPhone") as string,
      customerEmail: data.get("customerEmail") as string,
      address: data.get("address") as string,
      city: data.get("city") as string,
      vaccinesRequested: vaccinesList,
      numberOfPeople: patientNames ? patientNames.length : (parseInt(data.get("numberOfPeople") as string, 10) || 1),
      bookingType: data.get("bookingType") as string,
      preferredDate: selectedDate,
      preferredTime: data.get("preferredTime") as string,
      patientNames,
      isSundayBooking,
      sundayAdvanceAccepted,
      ...(isSundayBooking && { advanceAmount: 200 }),
      // New fields
      bookingMode,
      selectedPackage: selectedPackage || null,
      painLevel,
      packageDuration,
      consultationPreference,
      voucherConversionDiscount,
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

  // Show spinner while checking auth
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
      {/* Pre-selected vaccines notice */}
      {preSelected.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">💉</span>
            <p className="text-sm text-blue-800">
              <span className="font-medium">{preSelected.length} vaccine{preSelected.length > 1 ? "s" : ""} pre-selected</span> from the schedule. You can add or remove below.
            </p>
          </div>
        </div>
      )}

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

      {/* Who is this booking for? */}
      {isLoggedIn && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Who is this booking for? <span className="text-red-500">*</span>
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Select yourself and/or family members who need vaccination.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

          <div className="mt-3">
            {!showAddMember ? (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setShowAddMember(true); }}
                className="flex items-center gap-2 text-sm text-emerald-700 font-medium border border-emerald-300 rounded-xl px-4 py-2 hover:bg-emerald-50 transition-colors"
              >
                <span className="text-lg leading-none">+</span> Add Family Member
              </button>
            ) : (
              <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50 space-y-3">
                <p className="text-sm font-semibold text-emerald-800">Add a Family Member</p>
                {addMemberError && <p className="text-xs text-red-600">{addMemberError}</p>}
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
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddMember(e); }}
                    disabled={addMemberLoading || !newMember.name.trim()}
                    className="bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {addMemberLoading ? "Saving…" : "Save Member"}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAddMember(false); setAddMemberError(""); setNewMember({ name: "", dateOfBirth: "", gender: "" }); }}
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
                onClick={() => { setUseDifferentAddress(false); setShowAddressConfirm(false); }}
                className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Yes, use this address
              </button>
              <button
                type="button"
                onClick={() => {
                  setUseDifferentAddress(true);
                  setShowAddressConfirm(false);
                  setFormValues({ ...formValues, address: "", city: "Delhi", pinCode: "", landmark: "" });
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
            {/* Option to go back to saved address */}
            {useDifferentAddress && savedAddress && savedAddress.address && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  <p className="font-medium">Saved address available</p>
                  <p>{savedAddress.address}, {savedAddress.city} - {savedAddress.pinCode}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUseDifferentAddress(false);
                    setShowAddressConfirm(false);
                    setFormValues({ ...formValues, ...savedAddress });
                  }}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Use saved address
                </button>
              </div>
            )}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
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

      {/* ═══════════════════════════════════════════════════════════
          SCHEDULE PACKAGES / INDIVIDUAL VACCINES
          ═══════════════════════════════════════════════════════════ */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Choose Your Vaccination Plan
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          Select a pre-built schedule package or pick individual vaccines.
        </p>

        {/* Booking mode toggle */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setBookingMode("schedule")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              bookingMode === "schedule"
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            📦 Schedule Packages
          </button>
          <button
            type="button"
            onClick={() => setBookingMode("vaccines")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              bookingMode === "vaccines"
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            💉 Individual Vaccines
          </button>
        </div>

        {bookingMode === "schedule" ? (
          <div className="space-y-4">
            {/* Package selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SCHEDULE_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    selectedPackage === pkg.id
                      ? "border-emerald-500 bg-emerald-50 shadow-md"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{pkg.emoji}</span>
                      <div>
                        <p className="font-bold text-gray-900">{pkg.label}</p>
                        <p className="text-xs text-gray-500">{pkg.subtitle}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPackage === pkg.id ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
                    }`}>
                      {selectedPackage === pkg.id && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {pkg.vaccines.length > 0 && (
                    <ul className="text-xs text-gray-600 space-y-0.5 mb-2">
                      {pkg.vaccines.slice(0, 3).map((v, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0" />
                          {v}
                        </li>
                      ))}
                      {pkg.vaccines.length > 3 && (
                        <li className="text-emerald-600">+{pkg.vaccines.length - 3} more</li>
                      )}
                    </ul>
                  )}
                  <p className="text-xs font-semibold text-emerald-700">{pkg.priceRange}</p>
                </div>
              ))}
            </div>

            {/* Sub-options: Pain level & Duration */}
            {selectedPackage && selectedPackage !== "custom" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pain level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vaccine Type
                  </label>
                  <div className="space-y-2">
                    {PAIN_OPTIONS.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setPainLevel(opt.id)}
                        className={`border rounded-lg p-3 cursor-pointer transition-all text-sm ${
                          painLevel === opt.id
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 hover:border-emerald-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{opt.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900">{opt.label}</p>
                            <p className="text-xs text-gray-500">{opt.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Duration
                  </label>
                  <div className="space-y-2">
                    {DURATION_OPTIONS.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setPackageDuration(opt.id)}
                        className={`border rounded-lg p-3 cursor-pointer transition-all text-sm ${
                          packageDuration === opt.id
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 hover:border-emerald-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{opt.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900">{opt.label}</p>
                            <p className="text-xs text-gray-500">{opt.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* If custom, show individual vaccine picker */}
            {selectedPackage === "custom" && (
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Pick your vaccines:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {VACCINE_OPTIONS.map((v) => (
                    <label
                      key={v}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm transition-all ${
                        selectedVaccines.includes(v)
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-emerald-300"
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
            )}
          </div>
        ) : (
          /* Individual vaccines grid */
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
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CONSULTATION PREFERENCE
          ═══════════════════════════════════════════════════════════ */}
      <div className="border border-gray-200 rounded-xl p-4">
        <h2 className="text-base font-bold text-gray-900 mb-1">
          🩺 Free Pediatrician Consultations
        </h2>
        <p className="text-gray-500 text-xs mb-4">
          Every booking includes free pediatrician consultations. Choose your preference:
        </p>

        <div className="space-y-3">
          {/* Option 1: Include consultations */}
          <div
            onClick={() => setConsultationPreference("include")}
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
              consultationPreference === "include"
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-200 hover:border-emerald-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                consultationPreference === "include" ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
              }`}>
                {consultationPreference === "include" && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">Include Free Consultations</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Get free pediatrician consultations as per your billing amount. Consultations are valid for 1 year.
                </p>
              </div>
            </div>
          </div>

          {/* Option 2: Opt out with discount */}
          <div
            onClick={() => setConsultationPreference("discount")}
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
              consultationPreference === "discount"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                consultationPreference === "discount" ? "border-blue-500 bg-blue-500" : "border-gray-300"
              }`}>
                {consultationPreference === "discount" && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Opt Out — Get <span className="text-blue-600">2% Discount</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Skip free consultations and get an instant 2% discount on your total bill.
                </p>
              </div>
            </div>
          </div>

          {/* Option 3: Convert vouchers to discount (only if vouchers available) */}
          {availableVouchers.length > 0 && (
            <div
              onClick={() => setConsultationPreference("convert")}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                consultationPreference === "convert"
                  ? "border-amber-500 bg-amber-50"
                  : "border-gray-200 hover:border-amber-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                  consultationPreference === "convert" ? "border-amber-500 bg-amber-500" : "border-gray-300"
                }`}>
                  {consultationPreference === "convert" && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    Convert Vouchers — <span className="text-amber-600">Up to ₹100 Discount</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Convert your {availableVouchers.length} available consultation voucher{availableVouchers.length > 1 ? "s" : ""} to a discount. 10% of ₹500 = ₹50 per voucher, max ₹100 per booking.
                  </p>
                  <div className="mt-2 bg-white rounded-lg p-2 border border-amber-200">
                    <p className="text-xs text-amber-700 font-medium">
                      💡 Vouchers: {availableVouchers.length} | Value: ₹{availableVouchers.reduce((s, v) => s + v.voucherValue, 0)} | Discount: ₹{Math.min(availableVouchers.reduce((s, v) => s + v.voucherValue, 0) * 0.1, 100)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking details */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Booking Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Time
            </label>
            <select
              name="preferredTime"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">Any time</option>
              <option value="12pm-4pm">12 PM – 4 PM</option>
              <option value="4pm-7pm">4 PM – 7 PM</option>
              <option value="premium-1hr">★ Premium Fixed 1 Hour Slot (+₹200, Full Prepayment)</option>
            </select>
          </div>
        </div>

        {/* Sunday booking notice */}
        {isSunday && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">⚠️</span>
              <div>
                <p className="font-semibold text-orange-800">Sunday Booking</p>
                <p className="text-sm text-orange-700 mt-1">
                  Sunday bookings require a <span className="font-bold">non-refundable advance payment</span> of ₹200.
                  This advance is adjusted against your final invoice but will not be refunded if cancelled.
                </p>
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="sundayAdvanceAccepted"
                    className="accent-orange-600 w-4 h-4"
                  />
                  <span className="text-sm text-orange-800 font-medium">I accept the non-refundable Sunday advance</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Premium slot notice */}
        {preferredTime === "premium-1hr" && (
          <div className="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">★</span>
              <div>
                <p className="font-semibold text-purple-800">Premium Fixed 1 Hour Slot</p>
                <p className="text-sm text-purple-700 mt-1">
                  This option requires <span className="font-bold">full prepayment</span> of ₹200 extra.
                  You will receive a dedicated 1-hour time slot for your appointment.
                </p>
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="premiumAccepted"
                    className="accent-purple-600 w-4 h-4"
                  />
                  <span className="text-sm text-purple-800 font-medium">I accept full prepayment for premium slot</span>
                </label>
              </div>
            </div>
          </div>
        )}
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

export default function BookingForm() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BookingFormInner />
    </Suspense>
  );
}
