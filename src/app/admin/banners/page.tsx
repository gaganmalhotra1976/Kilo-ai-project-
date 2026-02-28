"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface Banner {
  id: number;
  headline: string;
  subtext: string | null;
  imageUrl: string | null;
  desktopImageUrl: string | null;
  mobileImageUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  sortOrder: number;
  isActive: boolean;
}

const emptyForm = {
  headline: "",
  subtext: "",
  imageUrl: "",
  desktopImageUrl: "",
  mobileImageUrl: "",
  buttonText: "",
  buttonLink: "",
  sortOrder: 0,
  isActive: true,
};

// ─── Image Upload Field ──────────────────────────────────────────────────────

interface ImageUploadFieldProps {
  label: string;
  variant: "desktop" | "mobile";
  value: string; // current URL (uploaded or pasted)
  onChange: (url: string) => void;
  hint: string;
  idealSize: string;
  maxMB: number;
}

function ImageUploadField({ label, variant, value, onChange, hint, idealSize, maxMB }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [aspectWarning, setAspectWarning] = useState("");
  const [showUrlField, setShowUrlField] = useState(false);

  // Detect aspect ratio mismatch after image loads
  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    const ratio = img.naturalWidth / img.naturalHeight;
    if (variant === "desktop" && (ratio < 1.5 || ratio > 2.0)) {
      setAspectWarning("⚠️ Recommended ratio 16:9 (1440×500px). Your image may look cropped.");
    } else if (variant === "mobile" && ratio > 0.85) {
      setAspectWarning("⚠️ Recommended ratio 4:5 or 9:16 (600×750px). Your image may look cropped.");
    } else {
      setAspectWarning("");
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setAspectWarning("");

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setUploadError("Only JPEG and PNG files are allowed.");
      return;
    }
    const maxBytes = maxMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(`File too large. Max ${maxMB} MB allowed.`);
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("variant", variant);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected after clearing
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <p className="text-xs text-gray-500">{hint} — Ideal size: {idealSize} — Max: {maxMB} MB</p>

      {/* Upload button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Uploading…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload {label}
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handleFileChange}
        />
        {value && (
          <button
            type="button"
            onClick={() => { onChange(""); setAspectWarning(""); setUploadError(""); }}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        )}
      </div>

      {/* Preview */}
      {value && (
        <div className={`relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 ${variant === "desktop" ? "h-32 w-full" : "h-40 w-28"}`}>
          <Image
            src={value}
            alt={`${label} preview`}
            fill
            className="object-cover"
            onLoad={handleImageLoad}
            unoptimized
          />
        </div>
      )}

      {/* Warnings / errors */}
      {aspectWarning && <p className="text-xs text-amber-600">{aspectWarning}</p>}
      {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}

      {/* Fallback URL field */}
      <button
        type="button"
        onClick={() => setShowUrlField((v) => !v)}
        className="text-xs text-gray-400 hover:text-gray-600 underline"
      >
        {showUrlField ? "Hide URL field" : "Or paste image URL instead"}
      </button>
      {showUrlField && (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchBanners() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      const data = await res.json();
      setBanners(data);
    } catch {
      setError("Failed to load banners");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBanners(); }, []);

  function startEdit(banner: Banner) {
    setEditId(banner.id);
    setForm({
      headline: banner.headline,
      subtext: banner.subtext ?? "",
      imageUrl: banner.imageUrl ?? "",
      desktopImageUrl: banner.desktopImageUrl ?? "",
      mobileImageUrl: banner.mobileImageUrl ?? "",
      buttonText: banner.buttonText ?? "",
      buttonLink: banner.buttonLink ?? "",
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
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
        headline: form.headline,
        subtext: form.subtext || null,
        imageUrl: form.imageUrl || null,
        desktopImageUrl: form.desktopImageUrl || null,
        mobileImageUrl: form.mobileImageUrl || null,
        buttonText: form.buttonText || null,
        buttonLink: form.buttonLink || null,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
      };
      if (editId) {
        await fetch(`/api/banners/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      cancelEdit();
      await fetchBanners();
    } catch {
      setError("Failed to save banner");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this banner?")) return;
    try {
      await fetch(`/api/banners/${id}`, { method: "DELETE" });
      await fetchBanners();
    } catch {
      setError("Failed to delete banner");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hero Banners</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage the homepage carousel slides. Upload separate images for desktop and mobile.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-4">{editId ? "Edit Banner" : "Add New Banner"}</h2>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Headline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Headline *</label>
            <input
              type="text"
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Vaccines Delivered To Your Home"
            />
          </div>

          {/* Subtext */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtext</label>
            <textarea
              value={form.subtext}
              onChange={(e) => setForm({ ...form, subtext: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Certified nurses bring vaccines to your doorstep..."
            />
          </div>

          {/* Dual image upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <ImageUploadField
              label="Desktop Banner Image"
              variant="desktop"
              value={form.desktopImageUrl}
              onChange={(url) => setForm({ ...form, desktopImageUrl: url })}
              hint="JPEG / PNG · Aspect ratio 16:9"
              idealSize="1440×500 px"
              maxMB={2}
            />
            <ImageUploadField
              label="Mobile Banner Image"
              variant="mobile"
              value={form.mobileImageUrl}
              onChange={(url) => setForm({ ...form, mobileImageUrl: url })}
              hint="JPEG / PNG · Aspect ratio 4:5 or 9:16"
              idealSize="600×750 px"
              maxMB={1}
            />
          </div>

          {/* CTA buttons */}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">Active (visible on website)</label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 text-white font-medium px-5 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : editId ? "Update Banner" : "Add Banner"}
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
          <h2 className="font-bold text-gray-900">All Banners ({banners.length})</h2>
        </div>
        {loading ? (
          <div className="px-6 py-10 text-center text-gray-400">Loading...</div>
        ) : banners.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400">No banners yet. Add one above.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {banners.map((banner) => (
              <div key={banner.id} className="flex items-start justify-between px-6 py-4 gap-4">
                {/* Thumbnail preview */}
                {(banner.desktopImageUrl || banner.mobileImageUrl || banner.imageUrl) && (
                  <div className="relative w-20 h-12 flex-shrink-0 rounded overflow-hidden bg-gray-100 border border-gray-200">
                    <Image
                      src={(banner.desktopImageUrl ?? banner.mobileImageUrl ?? banner.imageUrl)!}
                      alt={banner.headline}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 text-sm truncate">{banner.headline}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${banner.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {banner.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {banner.subtext && <p className="text-gray-500 text-xs truncate">{banner.subtext}</p>}
                  <div className="flex gap-3 mt-0.5">
                    {banner.desktopImageUrl && <span className="text-xs text-emerald-600">🖥 Desktop image</span>}
                    {banner.mobileImageUrl && <span className="text-xs text-blue-600">📱 Mobile image</span>}
                    {!banner.desktopImageUrl && !banner.mobileImageUrl && banner.imageUrl && (
                      <p className="text-blue-500 text-xs truncate">{banner.imageUrl}</p>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">Order: {banner.sortOrder}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => startEdit(banner)}
                    className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
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
