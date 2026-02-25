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

export default function BookingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVaccines, setSelectedVaccines] = useState<string[]>([]);

  // Family member selection state
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<string[]>(["myself"]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    const customerId = localStorage.getItem("customerId");
    const storedName = localStorage.getItem("customerName");
    if (customerId) {
      setIsLoggedIn(true);
      setCustomerName(storedName || "Myself");
      // Fetch family members
      fetch(`/api/family-members/customer/${customerId}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data: FamilyMember[]) => setFamilyMembers(data))
        .catch(() => setFamilyMembers([]));
    }
  }, []);

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

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6"
    >
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

            {familyMembers.length === 0 && (
              <p className="sm:col-span-2 text-sm text-gray-400 italic">
                No family members added yet.{" "}
                <a href="/profile" className="text-emerald-600 hover:underline">
                  Add them in your profile →
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Address */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Visit Address</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              required
              rows={3}
              placeholder="Flat 4B, Green Park Apartments, Sector 18..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <select
              name="city"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="Delhi">Delhi</option>
              <option value="Noida">Noida</option>
              <option value="Gurgaon">Gurgaon</option>
            </select>
          </div>
        </div>
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
