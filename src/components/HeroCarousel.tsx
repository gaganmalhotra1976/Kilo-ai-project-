"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface Banner {
  id: number;
  headline: string;
  subtext: string | null;
  imageUrl: string | null;
  desktopImageUrl: string | null;
  mobileImageUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface HeroCarouselProps {
  banners: Banner[];
  fallback?: React.ReactNode;
  /** Always shown as the first slide, even when DB banners exist */
  defaultSlide?: React.ReactNode;
}

export default function HeroCarousel({ banners, fallback, defaultSlide }: HeroCarouselProps) {
  // Total slides = defaultSlide (if provided) + DB banners
  const totalSlides = (defaultSlide ? 1 : 0) + banners.length;
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating || index === current) return;
      setIsAnimating(true);
      setCurrent(index);
      setTimeout(() => setIsAnimating(false), 500);
    },
    [isAnimating, current]
  );

  const next = useCallback(() => {
    goTo((current + 1) % totalSlides);
  }, [current, totalSlides, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + totalSlides) % totalSlides);
  }, [current, totalSlides, goTo]);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [totalSlides, next]);

  // No banners and no defaultSlide → show fallback
  if (totalSlides === 0) {
    return <>{fallback}</>;
  }

  // Only the defaultSlide, no DB banners → render it directly (no carousel chrome)
  if (totalSlides === 1 && defaultSlide) {
    return <>{defaultSlide}</>;
  }

  // Only DB banners, no defaultSlide → original single-slide fallback
  if (!defaultSlide && banners.length === 0) {
    return <>{fallback}</>;
  }

  const slide = current === 0 && defaultSlide ? null : banners[current - (defaultSlide ? 1 : 0)];

  return (
    <section className="relative overflow-hidden">
      {/* Slides */}
      <div className="relative">
        {/* Default slide (always first) */}
        {defaultSlide && (
          <div
            className={`transition-opacity duration-500 ${
              current === 0 ? "opacity-100" : "opacity-0 absolute inset-0"
            }`}
            aria-hidden={current !== 0}
          >
            {defaultSlide}
          </div>
        )}
        {/* DB banner slides */}
        {banners.map((banner, idx) => {
          const slideIdx = idx + (defaultSlide ? 1 : 0);
          return (
          <div
            key={banner.id}
            className={`transition-opacity duration-500 ${
              slideIdx === current ? "opacity-100" : "opacity-0 absolute inset-0"
            }`}
            aria-hidden={slideIdx !== current}
          >
            {(banner.desktopImageUrl || banner.mobileImageUrl || banner.imageUrl) ? (() => {
              const desktopSrc = banner.desktopImageUrl ?? banner.imageUrl;
              const mobileSrc = banner.mobileImageUrl ?? banner.imageUrl;
              return (
              <div className="relative h-[420px] sm:h-[520px] md:h-[600px] w-full">
                {/* Responsive image: show mobile image below md, desktop image from md up */}
                {mobileSrc && desktopSrc && mobileSrc !== desktopSrc ? (
                  <>
                    {/* Mobile image (hidden on md+) */}
                    <Image
                      src={mobileSrc}
                      alt={banner.headline}
                      fill
                      className="object-cover md:hidden"
                      priority={idx === 0}
                    />
                    {/* Desktop image (hidden below md) */}
                    <Image
                      src={desktopSrc}
                      alt={banner.headline}
                      fill
                      className="object-cover hidden md:block"
                      priority={idx === 0}
                    />
                  </>
                ) : (
                  <Image
                    src={(desktopSrc ?? mobileSrc)!}
                    alt={banner.headline}
                    fill
                    className="object-cover"
                    priority={idx === 0}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
                <div className="absolute inset-0 flex items-center justify-center px-4">
                  <div className="text-center text-white max-w-3xl">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">
                      {banner.headline}
                    </h1>
                    {banner.subtext && (
                      <p className="text-white/90 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-7 leading-relaxed drop-shadow">
                        {banner.subtext}
                      </p>
                    )}
                    {banner.buttonText && banner.buttonLink && (
                      <Link
                        href={banner.buttonLink}
                        className="inline-block bg-white text-emerald-700 font-bold px-7 sm:px-10 py-3 sm:py-4 rounded-full shadow-xl hover:bg-emerald-50 transition-colors text-base sm:text-lg"
                      >
                        {banner.buttonText}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              );
            })() : (
              <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white py-14 sm:py-20 md:py-24 px-4">
                <div className="max-w-4xl mx-auto text-center">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 sm:mb-6">
                    {banner.headline}
                  </h1>
                  {banner.subtext && (
                    <p className="text-emerald-100 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-7 sm:mb-10 leading-relaxed">
                      {banner.subtext}
                    </p>
                  )}
                  {banner.buttonText && banner.buttonLink && (
                    <Link
                      href={banner.buttonLink}
                      className="inline-block bg-white text-emerald-700 font-bold px-7 sm:px-10 py-3 sm:py-4 rounded-full shadow-xl hover:bg-emerald-50 transition-colors text-base sm:text-lg"
                    >
                      {banner.buttonText}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>

      {/* Navigation arrows (only if multiple slides) */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-colors shadow-lg"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-colors shadow-lg"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`rounded-full transition-all duration-300 ${
                  idx === current
                    ? "bg-white w-6 h-2.5"
                    : "bg-white/50 hover:bg-white/75 w-2.5 h-2.5"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Slide counter */}
      {totalSlides > 1 && (
        <div className="absolute top-4 right-4 z-10 bg-black/30 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
          {current + 1} / {totalSlides}
        </div>
      )}

      {/* Hidden: current slide info for screen readers */}
      <div className="sr-only" aria-live="polite">
        Slide {current + 1} of {totalSlides}{slide ? `: ${slide.headline}` : ""}
      </div>
    </section>
  );
}
