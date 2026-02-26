"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface PromoPopupData {
  id: number;
  title: string;
  content: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  expiresAt: string | null;
  showOnce: boolean;
  isActive: boolean;
}

const SESSION_KEY = "promo_popup_seen";

export default function PromoPopup() {
  const [popup, setPopup] = useState<PromoPopupData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    async function fetchPopup() {
      try {
        const res = await fetch("/api/promo-popup");
        if (!res.ok) return;
        const data: PromoPopupData | null = await res.json();
        if (!data) return;

        // Check if already seen this session
        if (data.showOnce) {
          const seen = sessionStorage.getItem(`${SESSION_KEY}_${data.id}`);
          if (seen) return;
        }

        setPopup(data);
        // Small delay before showing for better UX
        setTimeout(() => setVisible(true), 1500);
      } catch {
        // Silently fail — promo popup is non-critical
      }
    }
    fetchPopup();
  }, []);

  const dismiss = () => {
    setVisible(false);
    if (popup?.showOnce) {
      sessionStorage.setItem(`${SESSION_KEY}_${popup.id}`, "1");
    }
    // Remove from DOM after animation
    setTimeout(() => setPopup(null), 300);
  };

  if (!popup) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={dismiss}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none`}
      >
        <div
          className={`bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto transition-all duration-300 overflow-hidden ${
            visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
          }`}
        >
          {/* Close button */}
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 z-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            aria-label="Close promotion"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image */}
          {popup.imageUrl && (
            <div className="relative h-48 sm:h-56 w-full bg-emerald-50">
              <Image
                src={popup.imageUrl}
                alt={popup.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Badge */}
            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              🎉 Special Offer
            </span>

            <h3 className="text-xl font-bold text-gray-900 mb-3">{popup.title}</h3>

            {popup.content && (
              <div
                className="text-gray-600 text-sm leading-relaxed mb-5"
                dangerouslySetInnerHTML={{ __html: popup.content }}
              />
            )}

            <div className="flex gap-3">
              {popup.buttonText && popup.buttonLink && (
                <Link
                  href={popup.buttonLink}
                  onClick={dismiss}
                  className="flex-1 bg-emerald-600 text-white font-bold py-3 px-5 rounded-xl hover:bg-emerald-700 transition-colors text-center text-sm"
                >
                  {popup.buttonText}
                </Link>
              )}
              <button
                onClick={dismiss}
                className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 px-5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
