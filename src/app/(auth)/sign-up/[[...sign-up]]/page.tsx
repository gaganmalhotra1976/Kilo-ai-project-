"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-88px)] sm:min-h-[calc(100vh-100px)] bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <SignUp />
    </div>
  );
}