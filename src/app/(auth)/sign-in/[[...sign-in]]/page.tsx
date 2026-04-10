"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-88px)] sm:min-h-[calc(100vh-100px)] bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <SignIn
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
            headerTitle: "text-emerald-700",
            footerAction: "text-emerald-600",
          },
        }}
      />
    </div>
  );
}