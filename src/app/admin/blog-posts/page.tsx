"use client";

import { useEffect, useState } from "react";

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  author: string;
  category: string | null;
  tags: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string | null;
};

const EMPTY_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  author: "The Vaccine Panda Team",
  category: "",
  tags: "",
  isPublished: false,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function AdminBlogPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchPosts() {
    setLoading(true);
    try {
      const res = await fetch("/api/blog-posts?published=false");
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError("");
  }

  function openEdit(post: BlogPost) {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content,
      coverImageUrl: post.coverImageUrl ?? "",
      metaTitle: post.metaTitle ?? "",
      metaDescription: post.metaDescription ?? "",
      metaKeywords: post.metaKeywords ?? "",
      author: post.author,
      category: post.category ?? "",
      tags: post.tags ? JSON.parse(post.tags).join(", ") : "",
      isPublished: post.isPublished,
    });
    setEditingId(post.id);
    setShowForm(true);
    setError("");
  }

  async function handleSave() {
    if (!form.title || !form.slug || !form.content) {
      setError("Title, slug, and content are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };
      const url = editingId
        ? `/api/blog-posts/${editingId}`
        : "/api/blog-posts";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Save failed");
      }
      setShowForm(false);
      fetchPosts();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this blog post?")) return;
    await fetch(`/api/blog-posts/${id}`, { method: "DELETE" });
    fetchPosts();
  }

  async function togglePublish(post: BlogPost) {
    await fetch(`/api/blog-posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !post.isPublished }),
    });
    fetchPosts();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
        <button
          onClick={openNew}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
        >
          + New Post
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold mb-4">
            {editingId ? "Edit Post" : "New Post"}
          </h2>
          {error && (
            <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.title}
                onChange={(e) => {
                  const t = e.target.value;
                  setForm((f) => ({
                    ...f,
                    title: t,
                    slug: f.slug === slugify(f.title) ? slugify(t) : f.slug,
                  }));
                }}
                placeholder="Post title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Slug *
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: slugify(e.target.value) }))
                }
                placeholder="url-friendly-slug"
              />
              <p className="text-xs text-gray-400 mt-1">
                URL: /blog/{form.slug || "your-slug"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                placeholder="e.g. Child Health, Travel Vaccines"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt (shown in cards & meta description fallback)
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                rows={2}
                value={form.excerpt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, excerpt: e.target.value }))
                }
                placeholder="Short summary of the post (1-2 sentences)"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content (HTML) *
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                rows={12}
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder="<p>Write your article content here. HTML is supported.</p>"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image URL
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.coverImageUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, coverImageUrl: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>

            {/* SEO section */}
            <div className="sm:col-span-2 border-t border-gray-100 pt-4 mt-2">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                🔍 SEO Settings
              </p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title{" "}
                <span className="text-gray-400 font-normal">
                  (overrides page title in Google)
                </span>
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.metaTitle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, metaTitle: e.target.value }))
                }
                placeholder="Leave blank to use post title"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description{" "}
                <span className="text-gray-400 font-normal">
                  (shown in Google search results, ~155 chars)
                </span>
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                rows={2}
                value={form.metaDescription}
                onChange={(e) =>
                  setForm((f) => ({ ...f, metaDescription: e.target.value }))
                }
                placeholder="Leave blank to use excerpt"
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.metaDescription.length}/155 characters
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Keywords{" "}
                <span className="text-gray-400 font-normal">
                  (comma-separated)
                </span>
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.metaKeywords}
                onChange={(e) =>
                  setForm((f) => ({ ...f, metaKeywords: e.target.value }))
                }
                placeholder="vaccine, home vaccination, Delhi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags{" "}
                <span className="text-gray-400 font-normal">
                  (comma-separated)
                </span>
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.tags}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tags: e.target.value }))
                }
                placeholder="flu vaccine, children, Delhi NCR"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.author}
                onChange={(e) =>
                  setForm((f) => ({ ...f, author: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="isPublished"
                checked={form.isPublished}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isPublished: e.target.checked }))
                }
                className="w-4 h-4 accent-emerald-600"
              />
              <label
                htmlFor="isPublished"
                className="text-sm font-medium text-gray-700"
              >
                Publish immediately
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : editingId ? "Update Post" : "Create Post"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-lg text-sm font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Posts list */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No blog posts yet.</p>
          <p className="text-sm mt-1">Click &ldquo;+ New Post&rdquo; to create your first article.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4 shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {post.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      post.isPublished
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {post.isPublished ? "Published" : "Draft"}
                  </span>
                  {post.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                      {post.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1 font-mono">
                  /blog/{post.slug}
                </p>
                {post.excerpt && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {post.excerpt}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePublish(post)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    post.isPublished
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {post.isPublished ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => openEdit(post)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
