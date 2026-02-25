"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const NEXT_STATUS: Record<string, { label: string; next: string; color: string }> = {
  draft: { label: "Mark Sent", next: "sent", color: "bg-blue-600 hover:bg-blue-700" },
  sent: { label: "Mark Approved", next: "approved", color: "bg-emerald-600 hover:bg-emerald-700" },
};

export default function QuoteStatusButton({
  quoteId,
  currentStatus,
}: {
  quoteId: number;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const action = NEXT_STATUS[currentStatus];
  if (!action) return <span className="text-gray-300 text-xs">—</span>;

  async function handleClick() {
    setLoading(true);
    await fetch(`/api/quotes/${quoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action.next }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`text-xs text-white font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 ${action.color}`}
    >
      {loading ? "…" : action.label}
    </button>
  );
}
