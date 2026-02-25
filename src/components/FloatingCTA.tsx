"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const VACCINES = [
  "Flu (Influenza)",
  "Hepatitis A",
  "Hepatitis B",
  "Typhoid",
  "Chickenpox (Varicella)",
  "MMR",
  "Pneumococcal",
  "HPV",
  "Rabies",
  "COVID-19 Booster",
  "Meningococcal",
  "Tetanus (Td/Tdap)",
  "Rotavirus",
  "Polio (IPV)",
  "Dengue",
];

const PROMOS = [
  "🎉 Free home visit for orders above ₹2,000 — Book now!",
  "💉 Family pack: vaccinate 4 people, get 10% off — Limited slots!",
  "🏢 Corporate drives available — Call 9999109040 for bulk pricing",
  "⭐ 500+ happy families in Delhi NCR — Join them today!",
  "❄️ Cold-chain certified vaccines delivered to your door",
  "🧾 GST invoice included — Perfect for company reimbursements",
];

export default function FloatingCTA() {
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVaccines, setFilteredVaccines] = useState<string[]>([]);
  const [area, setArea] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [promoIndex, setPromoIndex] = useState(0);
  const [promoVisible, setPromoVisible] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  // Rotate promo banner
  useEffect(() => {
    const interval = setInterval(() => {
      setPromoVisible(false);
      setTimeout(() => {
        setPromoIndex((i) => (i + 1) % PROMOS.length);
        setPromoVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Vaccine search filter
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setFilteredVaccines([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFilteredVaccines(VACCINES.filter((v) => v.toLowerCase().includes(q)));
  }, [searchQuery]);

  // Auto-fetch GPS area
  const fetchArea = () => {
    if (!navigator.geolocation) {
      setArea("Geolocation not supported");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const suburb =
            data.address?.suburb ||
            data.address?.neighbourhood ||
            data.address?.city_district ||
            data.address?.city ||
            "your area";
          setArea(suburb);
        } catch {
          setArea("Unable to fetch area");
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        setArea("Location access denied");
        setGpsLoading(false);
      }
    );
  };

  return (
    <>
      {/* ── Publicity Scroll Banner ── */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-amber-400 text-amber-900 text-sm font-semibold overflow-hidden h-9 flex items-center">
        <div className="flex items-center gap-2 px-4 w-full">
          <span className="shrink-0 text-amber-700 font-bold">📢</span>
          <span
            className={`transition-opacity duration-400 ${promoVisible ? "opacity-100" : "opacity-0"}`}
          >
            {PROMOS[promoIndex]}
          </span>
        </div>
      </div>

      {/* ── Floating Action Buttons (bottom-right) ── */}
      <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3">
        {/* WhatsApp */}
        <a
          href="https://wa.me/919999109040?text=Hi%2C%20I%20want%20to%20book%20a%20home%20vaccination"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-3 rounded-full shadow-lg transition-colors text-sm"
          aria-label="WhatsApp us"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>

        {/* Call 1 */}
        <a
          href="tel:+919999109040"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-3 rounded-full shadow-lg transition-colors text-sm"
          aria-label="Call 9999109040"
        >
          📞 9999109040
        </a>

        {/* Call 2 */}
        <a
          href="tel:+919999771577"
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-3 rounded-full shadow-lg transition-colors text-sm"
          aria-label="Call 9999771577"
        >
          📞 9999771577
        </a>

        {/* Search / GPS toggle button */}
        <button
          onClick={() => setShowPopup(true)}
          className="flex items-center gap-2 bg-white border-2 border-emerald-600 text-emerald-700 font-semibold px-4 py-3 rounded-full shadow-lg hover:bg-emerald-50 transition-colors text-sm"
          aria-label="Search vaccines or find your area"
        >
          🔍 Find Vaccines
        </button>
      </div>

      {/* ── Search / GPS Popup ── */}
      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPopup(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold"
              aria-label="Close"
            >
              ✕
            </button>

            <h2 className="text-xl font-extrabold text-gray-900 mb-1">
              🔍 Search Vaccines
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              Type a vaccine name to check availability
            </p>

            {/* Search input */}
            <div className="relative mb-4">
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Flu, Hepatitis, HPV…"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Results */}
            {filteredVaccines.length > 0 && (
              <ul className="mb-4 border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                {filteredVaccines.map((v) => (
                  <li key={v}>
                    <Link
                      href={`/book?vaccine=${encodeURIComponent(v)}`}
                      onClick={() => setShowPopup(false)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-emerald-50 text-sm text-gray-800 transition-colors"
                    >
                      <span>💉 {v}</span>
                      <span className="text-emerald-600 font-semibold text-xs">Book →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {searchQuery && filteredVaccines.length === 0 && (
              <p className="text-sm text-gray-500 mb-4">
                No match found. <Link href="/vaccines" className="text-emerald-600 underline" onClick={() => setShowPopup(false)}>View full catalogue →</Link>
              </p>
            )}

            {/* GPS Area */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">📍 Detect Your Area</p>
              {area ? (
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3">
                  <span>✅ Serving: <strong>{area}</strong></span>
                </div>
              ) : (
                <button
                  onClick={fetchArea}
                  disabled={gpsLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                >
                  {gpsLoading ? "Detecting…" : "📍 Auto-detect My Location"}
                </button>
              )}
            </div>

            {/* Quick CTA */}
            <div className="mt-4 flex gap-3">
              <Link
                href="/book"
                onClick={() => setShowPopup(false)}
                className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition-colors"
              >
                Book a Visit
              </Link>
              <a
                href="https://wa.me/919999109040?text=Hi%2C%20I%20want%20to%20book%20a%20home%20vaccination"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowPopup(false)}
                className="flex-1 text-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-sm transition-colors"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
