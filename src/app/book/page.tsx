import type { Metadata } from "next";
import BookingForm from "./BookingForm";

export const metadata: Metadata = {
  title: "Book a Home Vaccination",
  description:
    "Request a home vaccination visit in Delhi, Noida or Gurgaon. Fill in your details and we'll send you a personalised quote.",
};

export default function BookPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-emerald-600 text-sm font-semibold uppercase tracking-widest mb-2">
            Step 1 of 3
          </p>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Book Your Home Vaccination
          </h1>
          <p className="text-gray-500 text-lg">
            Fill in the form below. We&apos;ll send you a personalised, GST-inclusive
            quote within a few hours.
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 text-xs font-medium text-emerald-700">
          <span className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">✓ Free quote</span>
          <span className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">✓ No hidden charges</span>
          <span className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">✓ Free rescheduling</span>
          <span className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">✓ GST invoice</span>
        </div>

        <BookingForm />
      </div>
    </main>
  );
}
