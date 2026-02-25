import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import FloatingCTA from "@/components/FloatingCTA";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: {
    default: "The Vaccine Panda — Home Vaccination Delhi NCR",
    template: "%s | The Vaccine Panda",
  },
  description:
    "Certified nurses bring vaccines to your doorstep in Delhi, Noida & Gurgaon. Book a home vaccination visit today.",
  metadataBase: new URL("https://vaccinepanda.com"),
};

const navLinks = [
  { href: "/vaccines", label: "Vaccines" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="antialiased font-sans bg-white text-gray-900">
        {/* ── Navigation ── */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 font-extrabold text-emerald-700 text-xl">
              🐼 The Vaccine Panda
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} className="hover:text-emerald-700 transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/book"
              className="bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-emerald-700 transition-colors shadow"
            >
              Book Now
            </Link>
          </div>
        </header>

        {/* ── Page content ── */}
        {/* Offset for promo banner height (36px) */}
        <div className="pt-9">
          {children}
        </div>
        <FloatingCTA />

        {/* ── Footer ── */}
        <footer className="bg-gray-900 text-gray-400 py-12 px-4 mt-0">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <p className="text-white font-bold text-lg mb-2">🐼 The Vaccine Panda</p>
              <p className="text-sm leading-relaxed">
                Certified home vaccination service in Delhi NCR. Cold-chain maintained. GST invoice included.
              </p>
            </div>
            <div>
              <p className="text-white font-semibold mb-3">Services</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/vaccines" className="hover:text-white transition-colors">Vaccine Catalogue</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/book" className="hover:text-white transition-colors">Book a Visit</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-3">Company</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-3">Contact</p>
              <ul className="space-y-2 text-sm">
                <li>📞 <a href="tel:+919999109040" className="hover:text-white transition-colors">9999109040</a></li>
                <li>📞 <a href="tel:+919999771577" className="hover:text-white transition-colors">9999771577</a></li>
                <li>✉️ <a href="mailto:hello@vaccinepanda.com" className="hover:text-white transition-colors">hello@vaccinepanda.com</a></li>
                <li>📍 19/1 B Tilak Nagar, New Delhi</li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-xs text-center">
            © {new Date().getFullYear()} GCPL OPC PVT LTD · GSTIN 07AAHCG7509E1ZN · All rights reserved
          </div>
        </footer>
      </body>
    </html>
  );
}
