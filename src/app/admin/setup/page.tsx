"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminSetupPage() {
  const [setupStatus, setSetupStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    // Check if admin already exists by trying to access admin page
    checkAdminStatus();
  }, []);

  async function checkAdminStatus() {
    try {
      const res = await fetch("/api/admin/staff/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: "admin@vaccinepanda.com", 
          password: "admin123" 
        }),
      });
      
      if (res.ok) {
        setSetupStatus("ready");
      } else {
        setSetupStatus("error");
      }
    } catch {
      setSetupStatus("error");
    }
  }

  async function handleCreateAdmin() {
    setSetupStatus("loading");
    
    try {
      // Try creating admin via create-admin endpoint
      const createRes = await fetch("/api/admin/create-admin", { method: "GET" });
      const createData = await createRes.json();
      
      if (createData.success) {
        setSetupStatus("ready");
      } else {
        setSetupStatus("error");
      }
    } catch {
      setSetupStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🐼 Admin Setup</h1>
          <p className="text-gray-500">The Vaccine Panda</p>
        </div>

        {setupStatus === "loading" && (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Checking admin status...</p>
          </div>
        )}

        {setupStatus === "error" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Not Found</h2>
            <p className="text-gray-600 mb-6">
              The admin account doesn't exist in the database. Click below to create it.
            </p>
            <button
              onClick={handleCreateAdmin}
              className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Create Admin Account
            </button>
          </div>
        )}

        {setupStatus === "ready" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Ready!</h2>
            <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600 mb-1">Email:</p>
              <p className="font-mono font-bold text-gray-900">admin@vaccinepanda.com</p>
              <p className="text-sm text-gray-600 mb-1 mt-3">Password:</p>
              <p className="font-mono font-bold text-gray-900">admin123</p>
            </div>
            <Link
              href="/admin/login"
              className="block w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Go to Admin Login
            </Link>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
}