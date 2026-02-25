"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  dropdownItems?: { label: string; href: string }[];
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems: NavItem[] = [
    { label: "Vaccines", href: "/vaccines" },
    { label: "Pricing", href: "/pricing" },
    { 
      label: "Menu", 
      href: "#", 
      hasDropdown: true,
      dropdownItems: [
        { label: "About Us", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "My Profile", href: "/profile" },
        { label: "Family Members", href: "/profile" },
      ]
    },
  ];

  return (
    <header className="sticky top-8 sm:top-9 z-40 bg-white/98 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 md:gap-2 font-extrabold text-emerald-700 text-lg md:text-xl hover:opacity-90 transition-opacity">
            <span className="text-2xl">🐼</span>
            <span className="hidden xs:inline text-sm md:text-base">The Vaccine Panda</span>
            <span className="xs:hidden text-sm">Vaccine Panda</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
            {navItems.map((item) => (
              <div key={item.href} className="relative">
                {item.hasDropdown ? (
                  <button
                    onClick={() => setDropdownOpen(dropdownOpen === 'menu' ? null : 'menu')}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                  >
                    {item.label}
                    <svg className={`w-4 h-4 transition-transform ${dropdownOpen === 'menu' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <Link href={item.href} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all">
                    {item.label}
                  </Link>
                )}

                {/* Dropdown Menu */}
                {item.hasDropdown && dropdownOpen === 'menu' && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 min-w-[160px] bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2">
                    {item.dropdownItems?.map((dropdownItem, idx) => (
                      <Link
                        key={idx}
                        href={dropdownItem.href}
                        onClick={() => {
                          setDropdownOpen(null);
                          setMobileMenuOpen(false);
                        }}
                        className="block px-4 py-2 text-sm text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      >
                        {dropdownItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right side - Login & Book Now */}
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/login"
              className="hidden sm:flex text-emerald-700 text-xs md:text-sm font-semibold px-3 md:px-4 py-1.5 md:py-2 border-2 border-emerald-600 rounded-full hover:bg-emerald-50 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/book"
              className="bg-emerald-600 text-white text-xs md:text-sm font-semibold px-4 md:px-5 py-1.5 md:py-2 rounded-full hover:bg-emerald-700 transition-all shadow-md"
            >
              Book Now
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 md:py-4 border-t border-gray-100">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <div key={item.href}>
                  {item.hasDropdown ? (
                    <div className="space-y-1">
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.label}</div>
                      {item.dropdownItems?.map((dropdownItem, idx) => (
                        <Link
                          key={idx}
                          href={dropdownItem.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block pl-4 pr-2 py-2.5 text-sm text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          {dropdownItem.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-2 py-2.5 text-sm font-medium text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="sm:hidden mt-2 px-2 py-2.5 text-sm font-semibold text-emerald-700 border-2 border-emerald-600 rounded-full text-center hover:bg-emerald-50 transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
