"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function GoogleSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const customerId = searchParams.get("customerId");
    const customerName = searchParams.get("customerName");
    const redirect = searchParams.get("redirect") || "/profile";

    if (token && customerId && customerName) {
      // Set localStorage (same as phone/password login)
      localStorage.setItem("authToken", token);
      localStorage.setItem("customerId", customerId);
      localStorage.setItem("customerName", customerName);
      // Dispatch storage event so Header updates immediately
      window.dispatchEvent(new Event("storage"));
    }

    router.replace(redirect);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 text-sm">Signing you in with Google…</p>
      </div>
    </div>
  );
}

export default function GoogleSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <GoogleSuccessContent />
    </Suspense>
  );
}
