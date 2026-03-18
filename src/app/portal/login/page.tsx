"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PortalLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem("portal_token");
    const customerId = localStorage.getItem("portal_customerId");
    if (token && customerId) {
      router.push(`/portal/${customerId}`);
    }
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  async function sendOTP() {
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        return;
      }

      setStep("otp");
      setCountdown(60);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOTP() {
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid OTP");
        return;
      }

      localStorage.setItem("portal_token", data.token);
      localStorage.setItem("portal_customerId", data.customer.id.toString());
      localStorage.setItem("portal_customerName", data.customer.name);

      router.push(`/portal/${data.customer.id}`);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🐼</div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Portal</h1>
          <p className="text-gray-500 mt-2">The Vaccine Panda</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {step === "phone" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter your phone number"
                maxLength={10}
              />
            </div>

            <button
              onClick={sendOTP}
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-gray-600">
                OTP sent to <span className="font-medium">{phone}</span>
              </p>
              <button
                onClick={() => { setStep("phone"); setOtp(""); }}
                className="text-emerald-600 text-sm hover:underline"
              >
                Change number
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                autoFocus
              />
            </div>

            <button
              onClick={verifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Login"}
            </button>

            {countdown > 0 ? (
              <p className="text-center text-gray-500 text-sm">
                Resend OTP in {countdown}s
              </p>
            ) : (
              <button
                onClick={sendOTP}
                className="w-full text-emerald-600 text-sm hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-500 hover:underline">
            ← Back to Website
          </a>
        </div>
      </div>
    </div>
  );
}
