import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Vaccine Catalogue",
  description:
    "Browse all vaccines available for home delivery in Delhi, Noida & Gurgaon. Paediatric, adult, travel, and flu vaccines.",
};

const vaccineCategories = [
  {
    category: "Flu & Respiratory",
    icon: "🤧",
    vaccines: [
      {
        name: "Influenza (Flu)",
        brand: "Multiple brands available",
        doses: 1,
        ageGroup: "6 months+",
        desc: "Annual flu vaccine recommended for all age groups, especially children, elderly, and immunocompromised individuals.",
      },
      {
        name: "Pneumococcal (PCV13 / PPSV23)",
        brand: "Prevenar / Pneumovax",
        doses: 1,
        ageGroup: "Adults 65+ / High-risk",
        desc: "Protects against pneumococcal bacteria that cause pneumonia, meningitis, and bloodstream infections.",
      },
    ],
  },
  {
    category: "Travel Vaccines",
    icon: "✈️",
    vaccines: [
      {
        name: "Hepatitis A",
        brand: "Havrix / Avaxim",
        doses: 2,
        ageGroup: "1 year+",
        desc: "Essential for travel to developing countries. Two doses provide long-term protection.",
      },
      {
        name: "Hepatitis B",
        brand: "Engerix-B / Recombivax",
        doses: 3,
        ageGroup: "All ages",
        desc: "Three-dose series protecting against hepatitis B virus. Often combined with Hep A.",
      },
      {
        name: "Hepatitis A+B (Combined)",
        brand: "Twinrix",
        doses: 3,
        ageGroup: "1 year+",
        desc: "Combined vaccine for both Hepatitis A and B in a single series.",
      },
      {
        name: "Typhoid",
        brand: "Typbar TCV / Typhim Vi",
        doses: 1,
        ageGroup: "2 years+",
        desc: "Recommended for travel to South Asia and other endemic regions.",
      },
      {
        name: "Rabies (Pre-exposure)",
        brand: "Rabipur / Verorab",
        doses: 3,
        ageGroup: "All ages",
        desc: "Pre-exposure prophylaxis for travellers to high-risk areas or those working with animals.",
      },
      {
        name: "Japanese Encephalitis",
        brand: "JENVAC / Imojev",
        doses: 2,
        ageGroup: "1 year+",
        desc: "For travel to rural Asia. Recommended for extended stays in endemic areas.",
      },
      {
        name: "Yellow Fever",
        brand: "Stamaril",
        doses: 1,
        ageGroup: "9 months+",
        desc: "Required for entry to certain African and South American countries.",
      },
      {
        name: "Cholera",
        brand: "Dukoral / Shanchol",
        doses: 2,
        ageGroup: "2 years+",
        desc: "Oral vaccine for travellers to cholera-endemic regions.",
      },
    ],
  },
  {
    category: "Paediatric",
    icon: "👶",
    vaccines: [
      {
        name: "MMR (Measles, Mumps, Rubella)",
        brand: "M-M-R II / Priorix",
        doses: 2,
        ageGroup: "12 months+",
        desc: "Two-dose series protecting against measles, mumps, and rubella.",
      },
      {
        name: "Chickenpox (Varicella)",
        brand: "Varivax / Varilrix",
        doses: 2,
        ageGroup: "12 months+",
        desc: "Two-dose series for children. Also recommended for unvaccinated adults.",
      },
      {
        name: "Rotavirus",
        brand: "Rotarix / RotaTeq",
        doses: 2,
        ageGroup: "6–24 weeks",
        desc: "Oral vaccine protecting infants against severe rotavirus gastroenteritis.",
      },
    ],
  },
  {
    category: "Adult & Adolescent",
    icon: "🩺",
    vaccines: [
      {
        name: "HPV (Human Papillomavirus)",
        brand: "Gardasil 9 / Cervarix",
        doses: 2,
        ageGroup: "9–45 years",
        desc: "Protects against HPV strains that cause cervical cancer and genital warts.",
      },
      {
        name: "Tdap (Tetanus, Diphtheria, Pertussis)",
        brand: "Boostrix / Adacel",
        doses: 1,
        ageGroup: "10 years+",
        desc: "Booster for tetanus, diphtheria, and whooping cough. Recommended every 10 years.",
      },
      {
        name: "Meningococcal",
        brand: "Menveo / Nimenrix",
        doses: 1,
        ageGroup: "2 months+",
        desc: "Protects against bacterial meningitis. Recommended for college students and travellers.",
      },
    ],
  },
];

export default function VaccinesPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white py-16 px-4 text-center">
        <p className="text-emerald-200 text-sm font-semibold uppercase tracking-widest mb-3">
          Home Delivery · Delhi NCR
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Vaccine Catalogue
        </h1>
        <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-8">
          Browse all vaccines we offer. Prices are quote-based — submit a booking
          request and we&apos;ll send you a personalised, GST-inclusive quote.
        </p>
        <Link
          href="/book"
          className="inline-block bg-white text-emerald-700 font-bold px-8 py-4 rounded-full shadow-lg hover:bg-emerald-50 transition-colors text-lg"
        >
          Request a Quote →
        </Link>
      </section>

      {/* Catalogue */}
      <section className="max-w-5xl mx-auto px-4 py-16 space-y-14">
        {vaccineCategories.map((cat) => (
          <div key={cat.category}>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{cat.icon}</span>
              <h2 className="text-2xl font-bold text-gray-900">{cat.category}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cat.vaccines.map((v) => (
                <div
                  key={v.name}
                  className="bg-gray-50 rounded-2xl border border-gray-100 p-6"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900">{v.name}</h3>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                      {v.doses} dose{v.doses > 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{v.brand}</p>
                  <p className="text-xs text-emerald-700 font-medium mb-3">
                    Age: {v.ageGroup}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="bg-emerald-600 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-extrabold mb-4">
          Don&apos;t See What You Need?
        </h2>
        <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
          We carry many more vaccines. Contact us and our team will check
          availability for your specific requirements.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/book"
            className="inline-block bg-white text-emerald-700 font-bold px-8 py-4 rounded-full shadow hover:bg-emerald-50 transition-colors"
          >
            Request a Quote
          </Link>
          <Link
            href="/contact"
            className="inline-block border-2 border-white text-white font-bold px-8 py-4 rounded-full hover:bg-emerald-700 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
