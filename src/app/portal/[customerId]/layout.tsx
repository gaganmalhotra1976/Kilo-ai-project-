"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ customerId: string }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("portal_token");
    const name = localStorage.getItem("portal_customerName");
    const storedId = localStorage.getItem("portal_customerId");

    if (!token || !storedId) {
      router.push("/portal/login");
      return;
    }

    params.then(({ customerId }) => {
      if (storedId !== customerId) {
        router.push(`/portal/${storedId}`);
        return;
      }
      setCustomerName(name || "Customer");
      setLoading(false);
    });
  }, [router, params]);

  function logout() {
    localStorage.removeItem("portal_token");
    localStorage.removeItem("portal_customerId");
    localStorage.removeItem("portal_customerName");
    router.push("/portal/login");
  }

  const navItems = [
    { href: "/bookings", label: "My Bookings", icon: "📋" },
    { href: "/quotes", label: "My Quotes", icon: "💰" },
    { href: "/vouchers", label: "Vouchers", icon: "🎟️" },
    { href: "/family", label: "Family", icon: "👨‍👩‍👧‍👦" },
    { href: "/invoices", label: "Invoices", icon: "🧾" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-600 text-white py-4 px-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href={`/portal/${localStorage.getItem("portal_customerId")}`} className="flex items-center gap-2">
            <span className="text-2xl">🐼</span>
            <span className="font-bold text-lg">The Vaccine Panda</span>
          </Link>
          <button
            onClick={logout}
            className="text-sm bg-emerald-700 px-3 py-1 rounded-full hover:bg-emerald-800"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {customerName}</h1>
        </div>

        <nav className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={`/portal/${localStorage.getItem("portal_customerId")}${item.href}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                pathname === `/portal/[customerId]${item.href}`
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-gray-600 hover:bg-emerald-50 border border-gray-200"
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </div>
  );
}
