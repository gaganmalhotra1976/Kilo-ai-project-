"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Stage {
  id: number;
  name: string;
  color: string;
  sortOrder: number;
}

interface CustomField {
  id: number;
  name: string;
  fieldType: string;
  options: string | null;
  sortOrder: number;
}

interface Pipeline {
  id: number;
  name: string;
  description: string | null;
  isArchived: boolean;
}

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#64748b",
];

export default function PipelineSettingsPage() {
  const params = useParams();
  const pipelineId = Number(params.id);

  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);

  // Pipeline edit
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [savingPipeline, setSavingPipeline] = useState(false);

  // Stage creation
  const [newStageName, setNewStageName] = useState("");
  const [newStageColor, setNewStageColor] = useState("#6366f1");
  const [savingStage, setSavingStage] = useState(false);

  // Stage editing
  const [editingStage, setEditingStage] = useState<Stage | null>(null);

  // Custom field creation
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newFieldOptions, setNewFieldOptions] = useState("");
  const [savingField, setSavingField] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);
  function reload() { setLoading(true); setRefreshKey(k => k + 1); }

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`/api/pipelines/${pipelineId}`).then(r => r.json()),
      fetch(`/api/pipeline-stages?pipelineId=${pipelineId}`).then(r => r.json()),
      fetch(`/api/pipeline-custom-fields?pipelineId=${pipelineId}`).then(r => r.json()),
    ]).then(([p, s, f]) => {
      if (!cancelled) {
        setPipeline(p); setEditName(p.name ?? ""); setEditDesc(p.description ?? "");
        setStages(s); setCustomFields(f); setLoading(false);
      }
    }).catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pipelineId, refreshKey]);

  async function savePipeline() {
    setSavingPipeline(true);
    await fetch(`/api/pipelines/${pipelineId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDesc || null }),
    });
    setSavingPipeline(false);
    reload();
  }

  async function addStage() {
    if (!newStageName.trim()) return;
    setSavingStage(true);
    await fetch("/api/pipeline-stages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pipelineId, name: newStageName.trim(), color: newStageColor, sortOrder: stages.length }),
    });
    setNewStageName(""); setNewStageColor("#6366f1"); setSavingStage(false);
    reload();
  }

  async function saveStage(stage: Stage) {
    await fetch(`/api/pipeline-stages/${stage.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: stage.name, color: stage.color, sortOrder: stage.sortOrder }),
    });
    setEditingStage(null);
    reload();
  }

  async function deleteStage(id: number) {
    if (!confirm("Delete this stage? Cards in this stage will need to be moved first.")) return;
    await fetch(`/api/pipeline-stages/${id}`, { method: "DELETE" });
    reload();
  }

  async function addCustomField() {
    if (!newFieldName.trim()) return;
    setSavingField(true);
    const options = newFieldType === "dropdown" && newFieldOptions.trim()
      ? newFieldOptions.split(",").map(s => s.trim()).filter(Boolean)
      : null;
    await fetch("/api/pipeline-custom-fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pipelineId, name: newFieldName.trim(), fieldType: newFieldType, options, sortOrder: customFields.length }),
    });
    setNewFieldName(""); setNewFieldType("text"); setNewFieldOptions(""); setSavingField(false);
    reload();
  }

  async function deleteCustomField(id: number) {
    if (!confirm("Delete this custom field?")) return;
    await fetch(`/api/pipeline-custom-fields/${id}`, { method: "DELETE" });
    reload();
  }

  async function archivePipeline() {
    if (!pipeline) return;
    if (!confirm(pipeline.isArchived ? "Restore this pipeline?" : "Archive this pipeline? It will be hidden from the main list.")) return;
    await fetch(`/api/pipelines/${pipelineId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: !pipeline.isArchived }),
    });
    reload();
  }

  if (loading) return <div className="p-6 text-gray-400">Loading…</div>;
  if (!pipeline) return <div className="p-6 text-red-500">Pipeline not found</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/pipelines" className="hover:text-gray-700">Pipelines</Link>
        <span>/</span>
        <Link href={`/admin/pipelines/${pipelineId}`} className="hover:text-gray-700">{pipeline.name}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Settings</span>
      </div>

      {/* Pipeline details */}
      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Pipeline Details</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={editName}
              onChange={e => setEditName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          <button
            onClick={savePipeline}
            disabled={savingPipeline}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {savingPipeline ? "Saving…" : "Save"}
          </button>
        </div>
      </section>

      {/* Stages */}
      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Stages</h2>

        <div className="space-y-2 mb-4">
          {stages.map(stage => (
            <div key={stage.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
              {editingStage?.id === stage.id ? (
                <>
                  <input
                    className="w-4 h-4 rounded cursor-pointer border border-gray-300"
                    type="color"
                    value={editingStage.color}
                    onChange={e => setEditingStage(s => s ? { ...s, color: e.target.value } : s)}
                  />
                  <input
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    value={editingStage.name}
                    onChange={e => setEditingStage(s => s ? { ...s, name: e.target.value } : s)}
                  />
                  <button onClick={() => saveStage(editingStage)} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700">Save</button>
                  <button onClick={() => setEditingStage(null)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
                  <span className="flex-1 text-sm text-gray-800">{stage.name}</span>
                  <span className="text-xs text-gray-400">Order: {stage.sortOrder}</span>
                  <button onClick={() => setEditingStage({ ...stage })} className="text-xs text-indigo-600 hover:text-indigo-800">Edit</button>
                  <button onClick={() => deleteStage(stage.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                </>
              )}
            </div>
          ))}
          {stages.length === 0 && <p className="text-sm text-gray-400">No stages yet. Add your first stage below.</p>}
        </div>

        {/* Add stage */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Add Stage</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              className="flex-1 min-w-[160px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Stage name"
              value={newStageName}
              onChange={e => setNewStageName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addStage(); }}
            />
            <div className="flex gap-1.5 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewStageColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${newStageColor === c ? "border-gray-800 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input type="color" value={newStageColor} onChange={e => setNewStageColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border border-gray-300" title="Custom color" />
            </div>
            <button
              onClick={addStage}
              disabled={savingStage || !newStageName.trim()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {savingStage ? "Adding…" : "Add Stage"}
            </button>
          </div>
        </div>
      </section>

      {/* Custom Fields */}
      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Custom Fields</h2>

        <div className="space-y-2 mb-4">
          {customFields.map(field => (
            <div key={field.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
              <span className="text-sm text-gray-800 flex-1">{field.name}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{field.fieldType}</span>
              {field.options && (
                <span className="text-xs text-gray-400 max-w-[120px] truncate" title={field.options}>
                  {field.options}
                </span>
              )}
              <button onClick={() => deleteCustomField(field.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
            </div>
          ))}
          {customFields.length === 0 && <p className="text-sm text-gray-400">No custom fields yet.</p>}
        </div>

        {/* Add custom field */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Add Custom Field</h3>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Field name"
                value={newFieldName}
                onChange={e => setNewFieldName(e.target.value)}
              />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newFieldType}
                onChange={e => setNewFieldType(e.target.value)}
              >
                <option value="text">Text</option>
                <option value="date">Date</option>
                <option value="dropdown">Dropdown</option>
                <option value="checkbox">Checkbox</option>
              </select>
            </div>
            {newFieldType === "dropdown" && (
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Options (comma-separated, e.g. Option A, Option B)"
                value={newFieldOptions}
                onChange={e => setNewFieldOptions(e.target.value)}
              />
            )}
            <button
              onClick={addCustomField}
              disabled={savingField || !newFieldName.trim()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {savingField ? "Adding…" : "Add Field"}
            </button>
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section className="bg-white border border-red-100 rounded-xl p-5">
        <h2 className="font-semibold text-red-700 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-3">
          {pipeline.isArchived
            ? "This pipeline is archived. Restore it to make it active again."
            : "Archiving hides this pipeline from the main list but preserves all historical data."}
        </p>
        <button
          onClick={archivePipeline}
          className={`px-4 py-2 rounded-lg text-sm font-medium border ${pipeline.isArchived ? "border-indigo-300 text-indigo-700 hover:bg-indigo-50" : "border-red-300 text-red-700 hover:bg-red-50"}`}
        >
          {pipeline.isArchived ? "Restore Pipeline" : "Archive Pipeline"}
        </button>
      </section>
    </div>
  );
}
