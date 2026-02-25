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
    <header className="sticky top-9 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-extrabold text-emerald-700 text-xl hover:opacity-90 transition-opacity">
            <span className="text-2xl">🐼</span>
            <span className="hidden sm:inline">The Vaccine Panda</span>
            <span className="sm:hidden">Vaccine Panda</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2" ref={dropdownRef}>
            {navItems.map((item, index) => (
              <div key={item.href} className="relative">
                {item.hasDropdown ? (
                  <button
                    onClick={() => setDropdownOpen(dropdownOpen === 'menu' ? null : 'menu')}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/70 rounded-lg transition-all duration-200"
                  >
                    {item.label}
                    <svg className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen === 'menu' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <Link href={item.href} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/70 rounded-lg transition-all duration-200">
                    {item.label}
                  </Link>
                )}

                {/* Dropdown Menu */}
                {item.hasDropdown && dropdownOpen === 'menu' && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 min-w-[180px] bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {item.dropdownItems?.map((dropdownItem, idx) => (
                      <Link
                        key={idx}
                        href={dropdownItem.href}
                        onClick={() => {
                          setDropdownOpen(null);
                          setMobileMenuOpen(false);
                        }}
                        className="block px-4 py-2.5 text-sm text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
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
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:flex text-emerald-700 text-sm font-semibold px-5 py-2 border-2 border-emerald-600 rounded-full hover:bg-emerald-50 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/book"
              className="bg-emerald-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Book Now
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="md:hidden py-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <div key={item.href}>
                  {item.hasDropdown ? (
                    <div className="space-y-1">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.label}</div>
                      {item.dropdownItems?.map((dropdownItem, idx) => (
                        <Link
                          key={idx}
                          href={dropdownItem.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block pl-6 pr-3 py-2.5 text-sm text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          {dropdownItem.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block sm:hidden mt-2 px-3 py-2.5 text-sm font-semibold text-emerald-700 border-2 border-emerald-600 rounded-full text-center hover:bg-emerald-50 transition-colors"
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
