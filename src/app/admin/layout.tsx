"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/reports", label: "Reports", icon: "📈" },
  { href: "/admin/bookings", label: "Bookings", icon: "📋" },
  { href: "/admin/quotes", label: "Quotes", icon: "💰" },
  { href: "/admin/invoices", label: "Invoices", icon: "🧾" },
  { href: "/admin/customers", label: "Patients", icon: "👥" },
  { href: "/admin/vaccines", label: "Vaccines", icon: "💉" },
  { href: "/admin/banners", label: "Hero Banners", icon: "🖼️" },
  { href: "/admin/youtube-videos", label: "YouTube Videos", icon: "▶️" },
  { href: "/admin/promo-popup", label: "Promo Popup", icon: "🎉" },
  { href: "/admin/vaccine-categories", label: "Vaccine Categories", icon: "🗂️" },
  { href: "/admin/blog-posts", label: "Blog Posts", icon: "✍️" },
  { href: "/admin/pipelines", label: "Pipelines", icon: "🗃️" },
  { href: "/admin/webhooks", label: "Webhooks", icon: "🔗" },
  { href: "/admin/settings/audit-log", label: "Audit Log", icon: "📝" },
];

interface StaffInfo {
  id: number;
  name: string;
  email: string;
  role: string;
}

function getInitialStaffInfo(): StaffInfo | null {
  if (typeof window === "undefined") return null;
  const storedStaffId = localStorage.getItem("admin_staffId");
  const storedAdminName = localStorage.getItem("admin_name");
  const storedAdminToken = localStorage.getItem("admin_token");
  
  if (storedStaffId && storedAdminName && storedAdminToken) {
    return {
      id: parseInt(storedStaffId, 10),
      name: storedAdminName,
      email: "",
      role: "admin",
    };
  }
  return null;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [staffInfo, setStaffInfo] = useState<StaffInfo | null>(getInitialStaffInfo);

  const handleStaffLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_staffId");
    localStorage.removeItem("admin_name");
    setStaffInfo(null);
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-2xl">🐼</span>
            <div>
              <p className="font-bold text-white text-sm">Vaccine Panda</p>
              <p className="text-gray-400 text-xs">Admin Panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← View Website
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-gray-900 font-semibold">The Vaccine Panda — CRM</h1>
          
          <div className="flex items-center gap-4">
            {staffInfo ? (
              <>
                <span className="text-sm text-gray-600">
                  Logged in as: <strong>{staffInfo.name}</strong>
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
                  Staff
                </span>
                <button
                  onClick={handleStaffLogout}
                  className="text-sm text-red-600 hover:underline"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                  Admin
                </span>
                <Link
                  href="/admin/login"
                  className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Staff Login
                </Link>
              </>
            )}
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}