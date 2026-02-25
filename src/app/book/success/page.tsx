import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Booking Request Received",
};

export default function BookingSuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
          Request Received!
        </h1>
        <p className="text-gray-500 text-lg mb-6 leading-relaxed">
          Thank you for booking with The Vaccine Panda. Our team will review your
          request and send you a personalised, GST-inclusive quote within a few
          hours.
        </p>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-8 text-left space-y-2 text-sm text-emerald-800">
          <p className="font-semibold text-emerald-900">What happens next?</p>
          <p>📋 We check live vaccine stock for your requirements</p>
          <p>💬 We send you a detailed quote via WhatsApp / email</p>
          <p>✅ You approve the quote and confirm the booking</p>
          <p>🏠 A certified nurse visits your home on the chosen date</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-block bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="inline-block border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
}
