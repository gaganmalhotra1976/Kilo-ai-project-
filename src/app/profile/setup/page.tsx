"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Indian mobile: optional +91 prefix then 10 digits starting with 6-9
const INDIAN_PHONE_RE = /^(?:\+91[-\s]?)?[6-9]\d{9}$/;

function validatePhone(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Phone number is required";
  if (!INDIAN_PHONE_RE.test(trimmed)) {
    return "Enter a valid Indian mobile number (e.g. +91XXXXXXXXXX or 10-digit)";
  }
  return null;
}

export default function ProfileSetupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  function validate(): boolean {
    const newErrors: { fullName?: string; phone?: string } = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    const phoneErr = validatePhone(phone);
    if (phoneErr) newErrors.phone = phoneErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/profile/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          dateOfBirth: dateOfBirth || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      // Profile saved — redirect to home (middleware will allow through now)
      router.push("/");
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-88px)] bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl">🐼</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Complete Your Profile</h1>
          <p className="text-gray-500 text-sm mt-2">
            We need a few details to get you started with home vaccination bookings.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="As on Aadhaar / ID proof"
              className={`w-full px-4 py-3 rounded-xl border text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                errors.fullName ? "border-red-400 bg-red-50" : "border-gray-200"
              }`}
              disabled={submitting}
              autoComplete="name"
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91XXXXXXXXXX"
              className={`w-full px-4 py-3 rounded-xl border text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                errors.phone ? "border-red-400 bg-red-50" : "border-gray-200"
              }`}
              disabled={submitting}
              autoComplete="tel"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">
              We&apos;ll use this to confirm your bookings via WhatsApp/SMS
            </p>
          </div>

          {/* Date of Birth (optional) */}
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              disabled={submitting}
            />
          </div>

          {/* Server error */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save & Continue"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
