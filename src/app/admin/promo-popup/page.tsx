"use client";

import { useState, useEffect } from "react";

interface PromoPopupData {
  id: number;
  title: string;
  content: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  expiresAt: string | null;
  showOnce: boolean;
  isActive: boolean;
}

const emptyForm = {
  title: "",
  content: "",
  imageUrl: "",
  buttonText: "",
  buttonLink: "",
  expiresAt: "",
  showOnce: true,
  isActive: true,
};

export default function AdminPromoPopupPage() {
  const [popups, setPopups] = useState<PromoPopupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchPopups() {
    setLoading(true);
    try {
      // Fetch all popups (we'll use the admin endpoint)
      const res = await fetch("/api/admin/promo-popup");
      if (!res.ok) {
        // Fallback: try the public endpoint
        const res2 = await fetch("/api/promo-popup");
        const data = await res2.json();
        setPopups(data ? [data] : []);
      } else {
        const data = await res.json();
        setPopups(Array.isArray(data) ? data : data ? [data] : []);
      }
    } catch {
      setError("Failed to load promo popups");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPopups();
  }, []);

  function startEdit(popup: PromoPopupData) {
    setEditId(popup.id);
    setForm({
      title: popup.title,
      content: popup.content ?? "",
      imageUrl: popup.imageUrl ?? "",
      buttonText: popup.buttonText ?? "",
      buttonLink: popup.buttonLink ?? "",
      expiresAt: popup.expiresAt ?? "",
      showOnce: popup.showOnce,
      isActive: popup.isActive,
    });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        content: form.content || null,
        imageUrl: form.imageUrl || null,
        buttonText: form.buttonText || null,
        buttonLink: form.buttonLink || null,
        expiresAt: form.expiresAt || null,
        showOnce: form.showOnce,
        isActive: form.isActive,
      };
      if (editId) {
        await fetch(`/api/promo-popup/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/promo-popup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      cancelEdit();
      await fetchPopups();
    } catch {
      setError("Failed to save promo popup");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this promo popup?")) return;
    try {
      await fetch(`/api/promo-popup/${id}`, { method: "DELETE" });
      await fetchPopups();
    } catch {
      setError("Failed to delete promo popup");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Promo Popup</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage the promotional popup shown to visitors. Only the first active popup is shown.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-4">{editId ? "Edit Popup" : "Create New Popup"}</h2>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="🎉 Special Offer — 20% Off This Week!"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="https://example.com/promo.jpg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
              <span className="text-gray-400 font-normal ml-1">(HTML supported)</span>
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              placeholder="Book any 3 vaccines and get <strong>20% off</strong> your total bill. Use code PANDA20 at checkout."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
              <input
                type="text"
                value={form.buttonText}
                onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Book Now"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
              <input
                type="text"
                value={form.buttonLink}
                onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="/book"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.showOnce}
                onChange={(e) => setForm({ ...form, showOnce: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Show once per session</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Active (visible to visitors)</span>
            </label>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 text-white font-medium px-5 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : editId ? "Update Popup" : "Create Popup"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="border border-gray-300 text-gray-700 font-medium px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">All Popups ({popups.length})</h2>
        </div>
        {loading ? (
          <div className="px-6 py-10 text-center text-gray-400">Loading...</div>
        ) : popups.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400">No popups yet. Create one above.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {popups.map((popup) => (
              <div key={popup.id} className="flex items-start justify-between px-6 py-4 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 text-sm">{popup.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${popup.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {popup.isActive ? "Active" : "Inactive"}
                    </span>
                    {popup.showOnce && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex-shrink-0">
                        Once/session
                      </span>
                    )}
                  </div>
                  {popup.content && (
                    <p className="text-gray-500 text-xs truncate" dangerouslySetInnerHTML={{ __html: popup.content }} />
                  )}
                  {popup.expiresAt && (
                    <p className="text-amber-600 text-xs mt-0.5">
                      Expires: {new Date(popup.expiresAt).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => startEdit(popup)}
                    className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(popup.id)}
                    className="text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
