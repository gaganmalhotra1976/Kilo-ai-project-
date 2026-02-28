import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { banners, youtubeVideos, vaccineCategories, vaccineCategoryItems } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import HeroCarousel from "@/components/HeroCarousel";
import YouTubeSection from "@/components/YouTubeSection";
import VaccineCategoriesAccordion from "@/components/VaccineCategoriesAccordion";

export const metadata: Metadata = {
  title: "The Vaccine Panda — Home Vaccination Delhi NCR",
  description:
    "Certified nurses bring vaccines to your doorstep in Delhi, Noida & Gurgaon. Book a home vaccination visit today.",
};

export const dynamic = "force-dynamic";

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

// Default hero content shown when no banners are in DB
function DefaultHero() {
  return (
    <section className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white py-14 sm:py-20 md:py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-emerald-200 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-3 sm:mb-4">
          Delhi · Noida · Gurgaon
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 sm:mb-6">
          Home Vaccinations for Kids,<br />
          <span className="text-amber-300">& Families</span>
        </h1>
        {/* Upper Strip */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-emerald-100 text-sm sm:text-base font-medium mb-7 sm:mb-10">
          <span>👨‍⚕️ Senior Pediatrician-Led</span>
          <span className="hidden sm:inline text-emerald-400">·</span>
          <span>💉 Trained Nurses</span>
          <span className="hidden sm:inline text-emerald-400">·</span>
          <span>🏠 Free Home Visit</span>
          <span className="hidden sm:inline text-emerald-400">·</span>
          <span>💰 Lowest Prices Guaranteed</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            href="/book"
            className="inline-block bg-white text-emerald-700 font-bold px-7 sm:px-10 py-3 sm:py-4 rounded-full shadow-xl hover:bg-emerald-50 transition-colors text-base sm:text-lg"
          >
            Book a Home Visit →
          </Link>
          <Link
            href="/vaccines"
            className="inline-block border-2 border-white text-white font-bold px-7 sm:px-10 py-3 sm:py-4 rounded-full hover:bg-emerald-600 transition-colors text-base sm:text-lg"
          >
            View Vaccines
          </Link>
        </div>
      </div>
    </section>
  );
}

// Demo data shown when DB tables are empty
const demoVideos = [
  {
    id: 1,
    title: "Why Home Vaccination is the Future of Healthcare",
    videoId: "dQw4w9WgXcQ",
    description: "Learn how home vaccination is making healthcare more accessible for families.",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 2,
    title: "Cold Chain Explained: How We Keep Your Vaccines Safe",
    videoId: "dQw4w9WgXcQ",
    description: "Our certified cold-chain process ensures every vaccine reaches you at full efficacy.",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 3,
    title: "Flu Season 2024: Who Should Get Vaccinated?",
    videoId: "dQw4w9WgXcQ",
    description: "Expert advice on flu vaccination for children, seniors, and high-risk groups.",
    sortOrder: 3,
    isActive: true,
  },
];

const demoCategories = [
  {
    id: 1,
    name: "Baby & Infant Vaccines",
    description: "Essential vaccines for newborns and infants (0–12 months)",
    icon: "👶",
    sortOrder: 1,
    isActive: true,
    items: [
      { id: 1, categoryId: 1, name: "BCG (Tuberculosis)", description: "Protects against tuberculosis", ageGroup: "At birth", dosesRequired: 1, notes: "Single dose", sortOrder: 1, isActive: true },
      { id: 2, categoryId: 1, name: "Hepatitis B", description: "Protects against Hepatitis B virus", ageGroup: "0–6 months", dosesRequired: 3, notes: "3-dose series", sortOrder: 2, isActive: true },
      { id: 3, categoryId: 1, name: "OPV (Polio)", description: "Oral polio vaccine", ageGroup: "0–5 years", dosesRequired: 4, notes: "Multiple doses", sortOrder: 3, isActive: true },
      { id: 4, categoryId: 1, name: "DTP (Diphtheria, Tetanus, Pertussis)", description: "Combined protection against 3 diseases", ageGroup: "6 weeks+", dosesRequired: 5, notes: "Primary + boosters", sortOrder: 4, isActive: true },
    ],
  },
  {
    id: 2,
    name: "Child Vaccines (1–5 years)",
    description: "Recommended vaccines for toddlers and young children",
    icon: "🧒",
    sortOrder: 2,
    isActive: true,
    items: [
      { id: 5, categoryId: 2, name: "MMR (Measles, Mumps, Rubella)", description: "Triple protection against common childhood diseases", ageGroup: "12–15 months", dosesRequired: 2, notes: "2-dose series", sortOrder: 1, isActive: true },
      { id: 6, categoryId: 2, name: "Varicella (Chickenpox)", description: "Prevents chickenpox infection", ageGroup: "12–18 months", dosesRequired: 2, notes: "2 doses", sortOrder: 2, isActive: true },
      { id: 7, categoryId: 2, name: "Typhoid Conjugate Vaccine", description: "Protection against typhoid fever", ageGroup: "9 months+", dosesRequired: 1, notes: "Booster every 3 years", sortOrder: 3, isActive: true },
    ],
  },
  {
    id: 3,
    name: "Adult & Senior Vaccines",
    description: "Vaccines recommended for adults and elderly individuals",
    icon: "👨‍👩‍👧",
    sortOrder: 3,
    isActive: true,
    items: [
      { id: 8, categoryId: 3, name: "Influenza (Flu Shot)", description: "Annual flu vaccine for all age groups", ageGroup: "6 months+", dosesRequired: 1, notes: "Annual dose", sortOrder: 1, isActive: true },
      { id: 9, categoryId: 3, name: "Pneumococcal (PCV)", description: "Protects against pneumonia and meningitis", ageGroup: "65+ years", dosesRequired: 2, notes: "Recommended for seniors", sortOrder: 2, isActive: true },
      { id: 10, categoryId: 3, name: "Hepatitis A", description: "Protection against Hepatitis A virus", ageGroup: "All adults", dosesRequired: 2, notes: "2-dose series", sortOrder: 3, isActive: true },
    ],
  },
  {
    id: 4,
    name: "Travel Vaccines",
    description: "Vaccines required or recommended for international travel",
    icon: "✈️",
    sortOrder: 4,
    isActive: true,
    items: [
      { id: 11, categoryId: 4, name: "Yellow Fever", description: "Required for travel to certain African and South American countries", ageGroup: "9 months+", dosesRequired: 1, notes: "Valid for life", sortOrder: 1, isActive: true },
      { id: 12, categoryId: 4, name: "Japanese Encephalitis", description: "For travel to rural Asia", ageGroup: "All ages", dosesRequired: 2, notes: "2-dose series", sortOrder: 2, isActive: true },
      { id: 13, categoryId: 4, name: "Meningococcal", description: "Required for Hajj/Umrah pilgrims", ageGroup: "All ages", dosesRequired: 1, notes: "Booster every 5 years", sortOrder: 3, isActive: true },
    ],
  },
];

export default async function HomePage() {
  // Fetch all CMS data in parallel
  const [heroBanners, dbVideos, dbCategories, categoryItems] = await Promise.all([
    db.select().from(banners).where(eq(banners.isActive, true)).orderBy(asc(banners.sortOrder)),
    db.select().from(youtubeVideos).where(eq(youtubeVideos.isActive, true)).orderBy(asc(youtubeVideos.sortOrder)),
    db.select().from(vaccineCategories).where(eq(vaccineCategories.isActive, true)).orderBy(asc(vaccineCategories.sortOrder)),
    db.select().from(vaccineCategoryItems).where(eq(vaccineCategoryItems.isActive, true)).orderBy(asc(vaccineCategoryItems.sortOrder)),
  ]);

  // Attach items to categories
  const dbCategoriesWithItems = dbCategories.map((cat) => ({
    ...cat,
    items: categoryItems.filter((item) => item.categoryId === cat.id),
  }));

  // Use DB data if available, otherwise fall back to demo data so sections always show
  const videos = dbVideos.length > 0 ? dbVideos : demoVideos;
  const categoriesWithItems = dbCategoriesWithItems.length > 0 ? dbCategoriesWithItems : demoCategories;

  return (
    <main className="min-h-screen bg-white">
      {/* ── Hero Carousel (or default hero if no banners) ── */}
      {/* DefaultHero is always the first slide; DB banners follow in the carousel */}
      <HeroCarousel banners={heroBanners} defaultSlide={<DefaultHero />} />

      {/* ── Trust bar ── */}
      <div className="bg-emerald-50 border-y border-emerald-100 py-4 sm:py-5 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-8 text-xs sm:text-sm font-medium text-emerald-800">
          <span>❄️ Cold-Chain Certified</span>
          <span>💊 All Brands</span>
          <span>🛡️ 100% Genuine Vaccines</span>
          <span>📋 GST Invoice</span>
          <span>⭐ 5000+ Happy Families</span>
          <span>📍 Delhi · Noida · Gurgaon</span>
        </div>
      </div>

      {/* ── How it works ── */}
      <section className="max-w-5xl mx-auto px-4 py-12 sm:py-16 md:py-20 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          How It Works
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto mb-10 sm:mb-14 text-base sm:text-lg">
          Getting vaccinated at home is simple. Here&apos;s what happens after you submit your request.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((s) => (
            <div key={s.step} className="flex flex-col items-center px-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-600 text-white font-extrabold text-xl sm:text-2xl flex items-center justify-center mb-4 sm:mb-5 shadow-lg">
                {s.step}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 sm:mt-12">
          <Link
            href="/book"
            className="inline-block bg-emerald-600 text-white font-bold px-7 sm:px-10 py-3 sm:py-4 rounded-full hover:bg-emerald-700 transition-colors text-base sm:text-lg shadow"
          >
            Get My Free Quote
          </Link>
        </div>
      </section>

      {/* ── Vaccine Categories Accordion (dynamic from DB, with demo fallback) ── */}
      <div className="bg-gray-50">
        <VaccineCategoriesAccordion categories={categoriesWithItems} />
      </div>

      {/* ── Features ── */}
      <section className="bg-white py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-10 sm:mb-14">
            Why Families Choose Us
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-gray-50 rounded-2xl p-5 sm:p-7 flex gap-3 sm:gap-4 shadow-sm border border-gray-100">
                <span className="text-2xl sm:text-3xl flex-shrink-0">{f.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{f.title}</h3>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── YouTube Section (dynamic from DB, with demo fallback) ── */}
      <YouTubeSection videos={videos} />

      {/* ── Testimonials ── */}
      <section className="bg-emerald-50 py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
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
      <section className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white py-12 sm:py-16 md:py-20 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4">
          Ready to Get Vaccinated at Home?
        </h2>
        <p className="text-emerald-100 text-base sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
          Get a free, no-obligation quote in minutes. Serving Delhi, Noida & Gurgaon.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            href="/book"
            className="inline-block bg-white text-emerald-700 font-bold px-7 sm:px-10 py-3 sm:py-4 rounded-full shadow hover:bg-emerald-50 transition-colors text-base sm:text-lg"
          >
            Book Now
          </Link>
          <Link
            href="/contact"
            className="inline-block border-2 border-white text-white font-bold px-7 sm:px-10 py-3 sm:py-4 rounded-full hover:bg-emerald-600 transition-colors text-base sm:text-lg"
          >
            Talk to Us
          </Link>
        </div>
      </section>
    </main>
  );
}
