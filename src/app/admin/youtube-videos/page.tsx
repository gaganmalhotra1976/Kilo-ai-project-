"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface YouTubeVideo {
  id: number;
  title: string;
  videoId: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

const emptyForm = {
  title: "",
  videoId: "",
  description: "",
  sortOrder: 0,
  isActive: true,
};

function getThumbnail(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

export default function AdminYouTubeVideosPage() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchVideos() {
    setLoading(true);
    try {
      // Use admin endpoint to get all (including inactive)
      const res = await fetch("/api/youtube-videos");
      const data = await res.json();
      setVideos(data);
    } catch {
      setError("Failed to load videos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVideos();
  }, []);

  function startEdit(video: YouTubeVideo) {
    setEditId(video.id);
    setForm({
      title: video.title,
      videoId: video.videoId,
      description: video.description ?? "",
      sortOrder: video.sortOrder,
      isActive: video.isActive,
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
        videoId: form.videoId,
        description: form.description || null,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
      };
      if (editId) {
        await fetch(`/api/youtube-videos/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/youtube-videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      cancelEdit();
      await fetchVideos();
    } catch {
      setError("Failed to save video");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this video?")) return;
    try {
      await fetch(`/api/youtube-videos/${id}`, { method: "DELETE" });
      await fetchVideos();
    } catch {
      setError("Failed to delete video");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">YouTube Videos</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage the YouTube video section on the homepage. Add video IDs from YouTube URLs.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-4">{editId ? "Edit Video" : "Add New Video"}</h2>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Home Vaccination Guide"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YouTube Video ID *
                <span className="text-gray-400 font-normal ml-1">(e.g. dQw4w9WgXcQ from youtube.com/watch?v=dQw4w9WgXcQ)</span>
              </label>
              <input
                type="text"
                value={form.videoId}
                onChange={(e) => setForm({ ...form, videoId: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="dQw4w9WgXcQ"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Brief description of the video..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Active (visible on website)</span>
              </label>
            </div>
          </div>
          {/* Preview thumbnail */}
          {form.videoId && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="relative w-24 h-14 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={getThumbnail(form.videoId)}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <p className="text-xs text-gray-500">Thumbnail preview</p>
                <a
                  href={`https://www.youtube.com/watch?v=${form.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Open on YouTube ↗
                </a>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 text-white font-medium px-5 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : editId ? "Update Video" : "Add Video"}
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
          <h2 className="font-bold text-gray-900">All Videos ({videos.length})</h2>
        </div>
        {loading ? (
          <div className="px-6 py-10 text-center text-gray-400">Loading...</div>
        ) : videos.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400">No videos yet. Add one above.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {videos.map((video) => (
              <div key={video.id} className="flex items-center gap-4 px-6 py-4">
                <div className="relative w-20 h-12 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                  <Image
                    src={getThumbnail(video.videoId)}
                    alt={video.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-gray-900 text-sm truncate">{video.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${video.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {video.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs">ID: {video.videoId} · Order: {video.sortOrder}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => startEdit(video)}
                    className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
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
