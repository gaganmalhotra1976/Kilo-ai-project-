import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about The Vaccine Panda — Delhi NCR's trusted home vaccination service operated by GCPL OPC PVT LTD.",
};

const values = [
  {
    icon: "🛡️",
    title: "Safety First",
    desc: "Every nurse is certified and trained. Every vaccine is transported in cold-chain certified carriers.",
  },
  {
    icon: "🔍",
    title: "Transparency",
    desc: "You see the full price before you confirm. No hidden charges, ever.",
  },
  {
    icon: "❤️",
    title: "Patient-Centred",
    desc: "We work around your schedule. Morning, afternoon, or evening — we come to you.",
  },
  {
    icon: "🌱",
    title: "Community Health",
    desc: "We believe preventive healthcare should be accessible to every family, not just those who can visit clinics.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">About Us</h1>
        <p className="text-emerald-100 text-xl max-w-2xl mx-auto">
          We&apos;re on a mission to make preventive healthcare effortless for every
          family in Delhi NCR.
        </p>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
        <div className="prose prose-gray max-w-none space-y-4 text-gray-600 leading-relaxed">
          <p>
            The Vaccine Panda was founded with a simple observation: millions of
            families in Delhi NCR skip important vaccinations not because they
            don&apos;t care, but because visiting a clinic is inconvenient — long
            queues, traffic, and the challenge of taking time off work.
          </p>
          <p>
            We set out to remove every barrier between a family and their
            vaccines. Our certified nurses bring the vaccines to your doorstep,
            at a time that suits you, with full cold-chain integrity maintained
            throughout.
          </p>
          <p>
            Operated by <strong>GCPL OPC PVT LTD</strong> (GSTIN: 07AAHCG7509E1ZN),
            we are registered and compliant with all applicable healthcare
            regulations. Every booking generates a GST-compliant invoice.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl p-7 flex gap-4 shadow-sm border border-gray-100">
                <span className="text-3xl flex-shrink-0">{v.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service area */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Service Area</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          We currently serve the following areas in the Delhi NCR region:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { city: "Delhi", areas: "All major areas including South Delhi, West Delhi, North Delhi, East Delhi, Central Delhi" },
            { city: "Noida", areas: "Sectors 1–168, Greater Noida, Noida Extension" },
            { city: "Gurgaon", areas: "DLF phases, Sohna Road, Golf Course Road, Cyber City" },
          ].map((s) => (
            <div key={s.city} className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
              <h3 className="font-bold text-emerald-800 mb-2">📍 {s.city}</h3>
              <p className="text-sm text-emerald-700">{s.areas}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Company info */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Information</h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3 text-sm">
            <div className="flex gap-3"><span className="text-gray-400 w-32 flex-shrink-0">Company</span><span className="text-gray-900 font-medium">GCPL OPC PVT LTD</span></div>
            <div className="flex gap-3"><span className="text-gray-400 w-32 flex-shrink-0">GSTIN</span><span className="text-gray-900 font-medium">07AAHCG7509E1ZN</span></div>
            <div className="flex gap-3"><span className="text-gray-400 w-32 flex-shrink-0">Address</span><span className="text-gray-900 font-medium">19/1 B Tilak Nagar, New Delhi – 110018</span></div>
            <div className="flex gap-3"><span className="text-gray-400 w-32 flex-shrink-0">Website</span><span className="text-gray-900 font-medium">vaccinepanda.com</span></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-600 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-extrabold mb-4">Ready to Book?</h2>
        <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
          Get a free, no-obligation quote in minutes.
        </p>
        <Link
          href="/book"
          className="inline-block bg-white text-emerald-700 font-bold px-10 py-4 rounded-full shadow hover:bg-emerald-50 transition-colors text-lg"
        >
          Book a Home Visit →
        </Link>
      </section>
    </main>
  );
}
