"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Pipeline {
  id: number;
  name: string;
  description: string | null;
  isArchived: boolean;
  createdAt: string | null;
}

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true); // starts true; set false after first fetch
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);
  function reload() { setLoading(true); setRefreshKey(k => k + 1); }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/pipelines")
      .then(r => r.json())
      .then(data => { if (!cancelled) { setPipelines(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  async function createPipeline() {
    if (!newName.trim()) return;
    setSaving(true);
    await fetch("/api/pipelines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() || null }),
    });
    setNewName(""); setNewDesc(""); setShowCreate(false); setSaving(false);
    reload();
  }

  async function archivePipeline(id: number, isArchived: boolean) {
    await fetch(`/api/pipelines/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: !isArchived }),
    });
    reload();
  }

  const active = pipelines.filter(p => !p.isArchived);
  const archived = pipelines.filter(p => p.isArchived);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipelines</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your custom workflow pipelines</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + New Pipeline
        </button>
      </div>

      {showCreate && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Create Pipeline</h2>
          <div className="space-y-3">
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Pipeline name (e.g. Sales, Nurse Onboarding)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={createPipeline}
                disabled={saving || !newName.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Creating…" : "Create"}
              </button>
              <button
                onClick={() => { setShowCreate(false); setNewName(""); setNewDesc(""); }}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : (
        <>
          {active.length === 0 && !showCreate && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">🗂️</div>
              <p className="font-medium">No pipelines yet</p>
              <p className="text-sm mt-1">Create your first pipeline to get started</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map(p => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  <button
                    onClick={() => archivePipeline(p.id, p.isArchived)}
                    className="text-xs text-gray-400 hover:text-gray-600 ml-2"
                    title="Archive pipeline"
                  >
                    Archive
                  </button>
                </div>
                {p.description && <p className="text-sm text-gray-500 mb-3">{p.description}</p>}
                <div className="flex gap-2 mt-3">
                  <Link
                    href={`/admin/pipelines/${p.id}`}
                    className="flex-1 text-center bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-100"
                  >
                    Open Board
                  </Link>
                  <Link
                    href={`/admin/pipelines/${p.id}/settings`}
                    className="text-center border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50"
                  >
                    ⚙️
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {archived.length > 0 && (
            <details className="mt-8">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 font-medium">
                Archived pipelines ({archived.length})
              </summary>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {archived.map(p => (
                  <div key={p.id} className="bg-gray-50 border border-gray-200 rounded-xl p-5 opacity-70">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-700">{p.name}</h3>
                      <button
                        onClick={() => archivePipeline(p.id, p.isArchived)}
                        className="text-xs text-indigo-500 hover:text-indigo-700 ml-2"
                      >
                        Restore
                      </button>
                    </div>
                    {p.description && <p className="text-sm text-gray-400">{p.description}</p>}
                  </div>
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}
