import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with The Vaccine Panda. We serve Delhi, Noida & Gurgaon.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Get in Touch
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Have a question? Want to discuss a corporate vaccination drive? We&apos;d
            love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-5">
            {[
              {
                icon: "📞",
                title: "Phone / WhatsApp",
                value: "+91 12345 67890",
                href: "tel:+911234567890",
              },
              {
                icon: "✉️",
                title: "Email",
                value: "hello@vaccinepanda.com",
                href: "mailto:hello@vaccinepanda.com",
              },
              {
                icon: "📍",
                title: "Address",
                value: "19/1 B Tilak Nagar, New Delhi – 110018",
                href: null,
              },
              {
                icon: "🕐",
                title: "Hours",
                value: "Mon–Sat: 8am – 7pm\nSun: 9am – 5pm",
                href: null,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4"
              >
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    {item.title}
                  </p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-gray-900 font-medium hover:text-emerald-700 transition-colors"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-gray-900 font-medium whitespace-pre-line">
                      {item.value}
                    </p>
                  )}
                </div>
              </div>
            ))}

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <p className="text-emerald-800 font-semibold mb-1">Service Area</p>
              <p className="text-emerald-700 text-sm">
                Delhi · Noida · Gurgaon
              </p>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}
