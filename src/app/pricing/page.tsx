import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — The Vaccine Panda | Home Vaccination Delhi NCR",
  description:
    "Transparent home vaccination pricing for Delhi, Noida & Gurgaon. No hidden charges. GST-inclusive quotes delivered to your door.",
};

const faqs = [
  {
    q: "Is the consultation fee included in the vaccine price?",
    a: "A small home-visit convenience fee applies per booking. It is waived for families booking 3 or more vaccines in a single visit. Your exact quote is confirmed before payment.",
  },
  {
    q: "Are prices GST-inclusive?",
    a: "All prices shown are inclusive of applicable GST. A GST-compliant invoice is generated for every booking.",
  },
  {
    q: "Can I get a custom quote for my family or corporate group?",
    a: "Yes. Share your requirements and our team will send a detailed quotation within a few hours. Corporate and bulk bookings receive preferential pricing.",
  },
  {
    q: "What if the vaccine is out of stock?",
    a: "We will notify you immediately and offer the next available slot or a full refund — your choice.",
  },
  {
    q: "Do you charge extra for Noida or Gurgaon visits?",
    a: "Our service area covers Delhi, Noida, and Gurgaon. The convenience fee is the same across all three zones.",
  },
  {
    q: "Can I cancel or reschedule?",
    a: "Free cancellation up to 24 hours before your appointment. Rescheduling is always free.",
  },
];

const whyUs = [
  {
    icon: "🏠",
    title: "At Your Doorstep",
    desc: "Certified nurses visit your home at a time that suits you — no clinic queues.",
  },
  {
    icon: "🧾",
    title: "GST Invoice Every Time",
    desc: "Fully compliant tax invoices for every booking, useful for reimbursements.",
  },
  {
    icon: "❄️",
    title: "Cold-Chain Maintained",
    desc: "Vaccines are transported in certified cold-chain carriers to preserve efficacy.",
  },
  {
    icon: "📋",
    title: "Transparent Quotes",
    desc: "You see the full price before you confirm. No surprises at the door.",
  },
  {
    icon: "🔁",
    title: "Dose Reminders",
    desc: "We remind you when your next dose is due — via WhatsApp, SMS, or email.",
  },
  {
    icon: "🏢",
    title: "Corporate Packages",
    desc: "Bulk vaccination drives for offices and housing societies at special rates.",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white font-sans">
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white py-20 px-4 text-center">
        <p className="text-emerald-200 text-sm font-semibold uppercase tracking-widest mb-3">
          Delhi · Noida · Gurgaon
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-emerald-100 text-lg md:text-xl max-w-2xl mx-auto mb-8">
          Get a personalised quote in minutes. No hidden fees. GST invoice
          included with every booking.
        </p>
        <Link
          href="/book"
          className="inline-block bg-white text-emerald-700 font-bold px-8 py-4 rounded-full shadow-lg hover:bg-emerald-50 transition-colors text-lg"
        >
          Get My Free Quote →
        </Link>
      </section>

      {/* ── How Pricing Works ── */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          How Our Pricing Works
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto mb-12">
          Vaccine prices are set by manufacturers and vary by brand and batch.
          Rather than show outdated list prices, we generate a live, accurate
          quote for your specific requirements.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Tell Us What You Need",
              desc: "Select the vaccines, number of people, and your preferred date and time.",
            },
            {
              step: "2",
              title: "Receive Your Quote",
              desc: "Our team checks live stock and sends you a detailed, GST-inclusive quotation.",
            },
            {
              step: "3",
              title: "Approve & Book",
              desc: "Approve the quote online, pay securely, and a certified nurse visits your home.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-gray-50 rounded-2xl p-8 flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing Cards ── */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Booking Options
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Choose the option that fits your family or organisation. Vaccine
            costs are added to your personalised quote.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Individual */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col">
              <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wide mb-2">
                Individual
              </p>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-1">
                Single Visit
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                One person, one or more vaccines
              </p>
              <ul className="space-y-3 text-sm text-gray-600 mb-8 flex-1">
                {[
                  "Home visit by certified nurse",
                  "Cold-chain maintained delivery",
                  "GST-compliant invoice",
                  "WhatsApp dose reminders",
                  "Free rescheduling",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/book"
                className="block text-center bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Get Quote
              </Link>
            </div>

            {/* Family — highlighted */}
            <div className="bg-emerald-600 rounded-2xl p-8 flex flex-col text-white relative shadow-xl">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
                Most Popular
              </span>
              <p className="text-emerald-200 font-semibold text-sm uppercase tracking-wide mb-2">
                Family
              </p>
              <h3 className="text-2xl font-extrabold mb-1">Family Visit</h3>
              <p className="text-emerald-200 text-sm mb-6">
                3 or more people in one visit
              </p>
              <ul className="space-y-3 text-sm text-emerald-100 mb-8 flex-1">
                {[
                  "Everything in Individual",
                  "Convenience fee waived",
                  "Single invoice for the family",
                  "Priority scheduling",
                  "Dedicated support contact",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-amber-300 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/book"
                className="block text-center bg-white text-emerald-700 font-semibold py-3 rounded-xl hover:bg-emerald-50 transition-colors"
              >
                Get Quote
              </Link>
            </div>

            {/* Corporate */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col">
              <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wide mb-2">
                Corporate / B2B
              </p>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-1">
                Group Drive
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Offices, societies & bulk bookings
              </p>
              <ul className="space-y-3 text-sm text-gray-600 mb-8 flex-1">
                {[
                  "On-site vaccination drive",
                  "Preferential bulk pricing",
                  "Dedicated account manager",
                  "Consolidated GST invoice",
                  "Flexible scheduling",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="block text-center border-2 border-emerald-600 text-emerald-600 font-semibold py-3 rounded-xl hover:bg-emerald-50 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Vaccine Panda ── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Why Choose The Vaccine Panda?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyUs.map((item) => (
            <div
              key={item.title}
              className="flex gap-4 p-6 bg-gray-50 rounded-2xl"
            >
              <span className="text-3xl flex-shrink-0">{item.icon}</span>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="bg-white rounded-2xl border border-gray-200 group"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 font-semibold text-gray-900 list-none">
                  {faq.q}
                  <span className="text-emerald-600 text-xl font-light ml-4 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-5 text-gray-500 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-emerald-600 text-white py-16 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
          Ready to Book Your Home Vaccination?
        </h2>
        <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
          Get a free, no-obligation quote in minutes. Serving Delhi, Noida &
          Gurgaon.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/book"
            className="inline-block bg-white text-emerald-700 font-bold px-8 py-4 rounded-full shadow hover:bg-emerald-50 transition-colors text-lg"
          >
            Book Now
          </Link>
          <Link
            href="/contact"
            className="inline-block border-2 border-white text-white font-bold px-8 py-4 rounded-full hover:bg-emerald-700 transition-colors text-lg"
          >
            Talk to Us
          </Link>
        </div>
      </section>

      {/* ── Footer note ── */}
      <div className="text-center py-6 text-xs text-gray-400 px-4">
        GCPL OPC PVT LTD · GSTIN 07AAHCG7509E1ZN · 19/1 B Tilak Nagar, New
        Delhi · vaccinepanda.com
      </div>
    </main>
  );
}
