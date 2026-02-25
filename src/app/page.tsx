import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Vaccine Panda — Home Vaccination Delhi NCR",
  description:
    "Certified nurses bring vaccines to your doorstep in Delhi, Noida & Gurgaon. Book a home vaccination visit today.",
};

const features = [
  {
    icon: "🏠",
    title: "At Your Doorstep",
    desc: "Certified nurses visit your home at a time that suits you — no clinic queues, no travel.",
  },
  {
    icon: "❄️",
    title: "Cold-Chain Maintained",
    desc: "Vaccines are transported in certified cold-chain carriers to preserve full efficacy.",
  },
  {
    icon: "🧾",
    title: "GST Invoice Included",
    desc: "Every booking comes with a fully compliant GST invoice — perfect for reimbursements.",
  },
  {
    icon: "📋",
    title: "Transparent Quotes",
    desc: "You see the full price before you confirm. No surprises at the door.",
  },
  {
    icon: "🔁",
    title: "Dose Reminders",
    desc: "We remind you when your next dose is due via WhatsApp, SMS, or email.",
  },
  {
    icon: "🏢",
    title: "Corporate Drives",
    desc: "Bulk vaccination drives for offices and housing societies at special rates.",
  },
];

const steps = [
  {
    step: "1",
    title: "Tell Us What You Need",
    desc: "Fill in a quick form — vaccines, number of people, preferred date and your address.",
  },
  {
    step: "2",
    title: "Receive Your Quote",
    desc: "Our team checks live stock and sends you a detailed, GST-inclusive quotation within hours.",
  },
  {
    step: "3",
    title: "Approve & We Come to You",
    desc: "Approve the quote, pay securely, and a certified nurse visits your home.",
  },
];

const vaccines = [
  { name: "Flu (Influenza)", icon: "🤧", category: "Annual" },
  { name: "Hepatitis A & B", icon: "💉", category: "Travel" },
  { name: "Typhoid", icon: "🌡️", category: "Travel" },
  { name: "Chickenpox (Varicella)", icon: "🔴", category: "Paediatric" },
  { name: "MMR", icon: "👶", category: "Paediatric" },
  { name: "Pneumococcal", icon: "🫁", category: "Adult" },
  { name: "HPV", icon: "🩺", category: "Adult" },
  { name: "Rabies", icon: "🐕", category: "Travel" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-emerald-200 text-sm font-semibold uppercase tracking-widest mb-4">
            Delhi · Noida · Gurgaon
          </p>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Vaccines Delivered<br />
            <span className="text-amber-300">To Your Home</span>
          </h1>
          <p className="text-emerald-100 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Certified nurses bring your vaccines to your doorstep. Cold-chain maintained.
            GST invoice included. Serving Delhi NCR since 2023.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              className="inline-block bg-white text-emerald-700 font-bold px-10 py-4 rounded-full shadow-xl hover:bg-emerald-50 transition-colors text-lg"
            >
              Book a Home Visit →
            </Link>
            <Link
              href="/vaccines"
              className="inline-block border-2 border-white text-white font-bold px-10 py-4 rounded-full hover:bg-emerald-600 transition-colors text-lg"
            >
              View Vaccines
            </Link>
          </div>
          <p className="text-emerald-300 text-sm mt-8">
            ✓ Free quote &nbsp;·&nbsp; ✓ No hidden charges &nbsp;·&nbsp; ✓ Free rescheduling
          </p>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div className="bg-emerald-50 border-y border-emerald-100 py-5 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-8 text-sm font-medium text-emerald-800">
          <span>🏥 Certified Nurses</span>
          <span>❄️ Cold-Chain Certified</span>
          <span>🧾 GST Invoices</span>
          <span>📍 Delhi · Noida · Gurgaon</span>
          <span>⭐ 500+ Happy Families</span>
        </div>
      </div>

      {/* ── How it works ── */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          How It Works
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto mb-14 text-lg">
          Getting vaccinated at home is simple. Here&apos;s what happens after you submit your request.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white font-extrabold text-2xl flex items-center justify-center mb-5 shadow-lg">
                {s.step}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <Link
            href="/book"
            className="inline-block bg-emerald-600 text-white font-bold px-10 py-4 rounded-full hover:bg-emerald-700 transition-colors text-lg shadow"
          >
            Get My Free Quote
          </Link>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-14">
            Why Families Choose Us
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-7 flex gap-4 shadow-sm border border-gray-100">
                <span className="text-3xl flex-shrink-0">{f.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vaccine preview ── */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
          Popular Vaccines We Offer
        </h2>
        <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
          We carry a wide range of vaccines for all age groups. View the full catalogue for details.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {vaccines.map((v) => (
            <div key={v.name} className="bg-gray-50 rounded-2xl p-5 text-center border border-gray-100">
              <div className="text-3xl mb-2">{v.icon}</div>
              <p className="font-semibold text-gray-900 text-sm">{v.name}</p>
              <span className="inline-block mt-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                {v.category}
              </span>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/vaccines"
            className="inline-block border-2 border-emerald-600 text-emerald-600 font-bold px-8 py-3 rounded-full hover:bg-emerald-50 transition-colors"
          >
            View Full Catalogue →
          </Link>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-emerald-50 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Priya S.",
                location: "Noida",
                text: "Booked flu shots for my whole family. The nurse was on time, professional, and the whole process was seamless. Will definitely use again!",
              },
              {
                name: "Rahul M.",
                location: "Gurgaon",
                text: "Got a quote within 2 hours of submitting the form. The pricing was transparent and the GST invoice was perfect for my company reimbursement.",
              },
              {
                name: "Anita K.",
                location: "Delhi",
                text: "Organised a vaccination drive for our housing society. The team handled everything professionally. Highly recommended for corporate bookings.",
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-7 shadow-sm border border-emerald-100">
                <div className="flex text-amber-400 mb-3">{"★★★★★"}</div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                <p className="text-gray-400 text-xs">{t.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white py-20 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
          Ready to Get Vaccinated at Home?
        </h2>
        <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
          Get a free, no-obligation quote in minutes. Serving Delhi, Noida & Gurgaon.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/book"
            className="inline-block bg-white text-emerald-700 font-bold px-10 py-4 rounded-full shadow hover:bg-emerald-50 transition-colors text-lg"
          >
            Book Now
          </Link>
          <Link
            href="/contact"
            className="inline-block border-2 border-white text-white font-bold px-10 py-4 rounded-full hover:bg-emerald-600 transition-colors text-lg"
          >
            Talk to Us
          </Link>
        </div>
      </section>
    </main>
  );
}
