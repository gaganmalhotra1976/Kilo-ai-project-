"use client";

import { useState } from "react";
import { customers as customerSchema } from "@/db/schema";

interface CreateCustomerLoginProps {
  customerId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  onCustomerUpdated: () => void;
}

export function CreateCustomerLogin({
  customerId,
  customerName,
  customerPhone,
  customerEmail,
  onCustomerUpdated,
}: CreateCustomerLoginProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCreateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-token": localStorage.getItem("admin_token") || "",
        },
        body: JSON.stringify({
          password,
        }),
      });

      if (response.ok) {
        setSuccess("Customer login created successfully!");
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setSuccess("");
          onCustomerUpdated();
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create customer login");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-amber-900 mb-4">Create Customer Login</h3>
      
      <p className="text-sm text-amber-800 mb-4">
        Enable login for <span className="font-medium">{customerName}</span> with email/phone + password
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleCreateLogin} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-amber-800 mb-2">
            New Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-amber-800 mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !password || !confirmPassword}
          className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? "Creating..." : "Create Login"}
        </button>
      </form>
    </div>
  );
}
