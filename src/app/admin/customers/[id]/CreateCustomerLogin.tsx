"use client";

import { useState } from "react";

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
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState(customerEmail || "");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/patients/${customerId}/create-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Login created successfully!" });
        setPassword("");
        onCustomerUpdated();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to create login" });
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Customer Login</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-emerald-600 hover:underline"
          >
            + Create Login
          </button>
        )}
      </div>

      {customerEmail ? (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Customer has email login: {customerEmail}</span>
        </div>
      ) : (
        <p className="text-gray-500 text-sm">Customer has no email login yet.</p>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="customer@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Enter password"
              required
              minLength={6}
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Login"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setMessage(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}