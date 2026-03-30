"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-88px)] sm:min-h-[calc(100vh-100px)] bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-6">
          <span className="text-4xl">🐼</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join Vaccine Panda for home vaccination in Delhi NCR</p>
        </div>

        <SignUp
          appearance={{
            variables: {
              colorPrimary: "#059669",
              colorBackground: "#ffffff",
              colorText: "#1f2937",
              colorInputBackground: "#f9fafb",
              colorInputBorder: "#d1d5db",
              fontFamily: "inherit",
              borderRadius: "12px",
            },
            elements: {
              card: "shadow-xl",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton:
                "border border-gray-200 hover:bg-gray-50 transition-colors font-medium",
              socialButtonsBlockButtonText: "font-medium",
              dividerLine: "bg-gray-200",
              dividerText: "text-gray-400 text-sm",
              formButtonPrimary:
                "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold",
              footerActionLink: "text-emerald-600 hover:text-emerald-700 font-medium",
            },
            layout: {
              socialButtonsPlacement: "top",
              socialButtonsVariant: "blockButton",
            },
          }}
        />
      </div>
    </div>
  );
}
