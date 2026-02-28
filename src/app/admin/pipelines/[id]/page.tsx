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

interface Card {
  id: number;
  stageId: number;
  title: string;
  customerName: string | null;
  assignedTo: string | null;
  dueDate: string | null;
  priority: string;
  notes: string | null;
  bookingId: number | null;
  quoteId: number | null;
}

interface Pipeline {
  id: number;
  name: string;
  description: string | null;
}

interface Staff {
  id: number;
  name: string;
  role: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Low", medium: "Medium", high: "High", urgent: "Urgent",
};

export default function PipelineBoardPage() {
  const params = useParams();
  const pipelineId = Number(params.id);

  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [loading, setLoading] = useState(true);

  // Card creation state
  const [addingToStage, setAddingToStage] = useState<number | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardPriority, setNewCardPriority] = useState("medium");
  const [newCardAssigned, setNewCardAssigned] = useState("");
  const [newCardDue, setNewCardDue] = useState("");
  const [savingCard, setSavingCard] = useState(false);

  // Card detail modal
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [editCard, setEditCard] = useState<Partial<Card>>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [cardHistory, setCardHistory] = useState<{ id: number; fromStageId: number | null; toStageId: number; movedBy: string | null; movedAt: number | null; note: string | null }[]>([]);

  const [refreshKey, setRefreshKey] = useState(0);
  function reload() { setLoading(true); setRefreshKey(k => k + 1); }

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`/api/pipelines/${pipelineId}`).then(r => r.json()),
      fetch(`/api/pipeline-stages?pipelineId=${pipelineId}`).then(r => r.json()),
      fetch(`/api/pipeline-cards?pipelineId=${pipelineId}`).then(r => r.json()),
      fetch(`/api/staff?role=Nurse,Operations`).then(r => r.json()),
    ]).then(([p, s, c, st]) => {
      if (!cancelled) { setPipeline(p); setStages(s); setCards(c); setStaff(st); setLoading(false); }
    }).catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pipelineId, refreshKey]);

  async function createCard(stageId: number) {
    if (!newCardTitle.trim()) return;
    setSavingCard(true);
    await fetch("/api/pipeline-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pipelineId, stageId, title: newCardTitle.trim(),
        priority: newCardPriority,
        assignedTo: newCardAssigned.trim() || null,
        dueDate: newCardDue || null,
      }),
    });
    setNewCardTitle(""); setNewCardPriority("medium"); setNewCardAssigned(""); setNewCardDue("");
    setAddingToStage(null); setSavingCard(false);
    reload();
  }

  async function moveCard(cardId: number, toStageId: number) {
    await fetch(`/api/pipeline-cards/${cardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stageId: toStageId, movedBy: "admin" }),
    });
    reload();
  }

  async function openCard(card: Card) {
    setSelectedCard(card);
    setEditCard({ ...card });
    const res = await fetch(`/api/pipeline-cards/${card.id}/history`);
    setCardHistory(await res.json());
  }

  async function saveCardEdit() {
    if (!selectedCard) return;
    setSavingEdit(true);
    await fetch(`/api/pipeline-cards/${selectedCard.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editCard, movedBy: "admin" }),
    });
    setSavingEdit(false);
    setSelectedCard(null);
    reload();
  }

  async function archiveCard(cardId: number) {
    await fetch(`/api/pipeline-cards/${cardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: true }),
    });
    setSelectedCard(null);
    reload();
  }

  const stageById = Object.fromEntries(stages.map(s => [s.id, s]));

  if (loading) return <div className="p-6 text-gray-400">Loading…</div>;
  if (!pipeline) return <div className="p-6 text-red-500">Pipeline not found</div>;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Link href="/admin/pipelines" className="text-gray-400 hover:text-gray-600 text-sm">← Pipelines</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-semibold text-gray-900">{pipeline.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden text-sm">
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 ${view === "kanban" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 ${view === "list" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              List
            </button>
          </div>
          <Link
            href={`/admin/pipelines/${pipelineId}/settings`}
            className="border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50"
          >
            ⚙️ Settings
          </Link>
        </div>
      </div>

      {/* Board */}
      {view === "kanban" ? (
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-4 h-full" style={{ minWidth: `${stages.length * 280}px` }}>
            {stages.map(stage => {
              const stageCards = cards.filter(c => c.stageId === stage.id);
              return (
                <div key={stage.id} className="flex flex-col w-64 flex-shrink-0">
                  {/* Stage header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
                    <span className="font-medium text-sm text-gray-800">{stage.name}</span>
                    <span className="ml-auto text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{stageCards.length}</span>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 space-y-2 min-h-[100px]">
                    {stageCards.map(card => (
                      <div
                        key={card.id}
                        onClick={() => openCard(card)}
                        className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all"
                      >
                        <p className="text-sm font-medium text-gray-900 mb-1">{card.title}</p>
                        {card.customerName && (
                          <p className="text-xs text-gray-500 mb-1">👤 {card.customerName}</p>
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap mt-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[card.priority] ?? "bg-gray-100 text-gray-600"}`}>
                            {PRIORITY_LABELS[card.priority] ?? card.priority}
                          </span>
                          {card.dueDate && (
                            <span className="text-xs text-gray-400">📅 {card.dueDate}</span>
                          )}
                          {card.assignedTo && (
                            <span className="text-xs text-gray-400">→ {card.assignedTo}</span>
                          )}
                        </div>
                        {(card.bookingId || card.quoteId) && (
                          <div className="flex gap-1 mt-2">
                            {card.bookingId && <span className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">Booking #{card.bookingId}</span>}
                            {card.quoteId && <span className="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">Quote #{card.quoteId}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add card */}
                  {addingToStage === stage.id ? (
                    <div className="mt-2 bg-white border border-indigo-300 rounded-lg p-3 shadow-sm">
                      <input
                        autoFocus
                        className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 mb-2 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        placeholder="Card title"
                        value={newCardTitle}
                        onChange={e => setNewCardTitle(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") createCard(stage.id); if (e.key === "Escape") setAddingToStage(null); }}
                      />
                      <select
                        className="w-full text-xs border border-gray-200 rounded px-2 py-1 mb-2 focus:outline-none"
                        value={newCardPriority}
                        onChange={e => setNewCardPriority(e.target.value)}
                      >
                        <option value="low">Low priority</option>
                        <option value="medium">Medium priority</option>
                        <option value="high">High priority</option>
                        <option value="urgent">Urgent</option>
                      </select>
                      <select
                        className="w-full text-xs border border-gray-200 rounded px-2 py-1 mb-2 focus:outline-none"
                        value={newCardAssigned}
                        onChange={e => setNewCardAssigned(e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {staff.map(s => (
                          <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
                        ))}
                      </select>
                      <input
                        type="date"
                        className="w-full text-xs border border-gray-200 rounded px-2 py-1 mb-2 focus:outline-none"
                        value={newCardDue}
                        onChange={e => setNewCardDue(e.target.value)}
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => createCard(stage.id)}
                          disabled={savingCard || !newCardTitle.trim()}
                          className="flex-1 bg-indigo-600 text-white text-xs py-1.5 rounded hover:bg-indigo-700 disabled:opacity-50"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => { setAddingToStage(null); setNewCardTitle(""); }}
                          className="flex-1 border border-gray-200 text-gray-600 text-xs py-1.5 rounded hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingToStage(stage.id)}
                      className="mt-2 w-full text-left text-xs text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      + Add card
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List view */
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Stage</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Priority</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Assigned</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Due</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cards.map(card => {
                  const stage = stageById[card.stageId];
                  return (
                    <tr key={card.id} onClick={() => openCard(card)} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{card.title}</p>
                        {card.customerName && <p className="text-xs text-gray-400">{card.customerName}</p>}
                      </td>
                      <td className="px-4 py-3">
                        {stage && (
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                            <span className="text-gray-700">{stage.name}</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[card.priority] ?? ""}`}>
                          {PRIORITY_LABELS[card.priority] ?? card.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{card.assignedTo ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{card.dueDate ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {card.bookingId && <span className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">B#{card.bookingId}</span>}
                          {card.quoteId && <span className="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">Q#{card.quoteId}</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {cards.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">No cards yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Card detail modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedCard(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Edit Card</h2>
                <button onClick={() => setSelectedCard(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editCard.title ?? ""}
                    onChange={e => setEditCard(p => ({ ...p, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Stage</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editCard.stageId ?? ""}
                    onChange={e => setEditCard(p => ({ ...p, stageId: Number(e.target.value) }))}
                  >
                    {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={editCard.priority ?? "medium"}
                      onChange={e => setEditCard(p => ({ ...p, priority: e.target.value }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={editCard.dueDate ?? ""}
                      onChange={e => setEditCard(p => ({ ...p, dueDate: e.target.value || null }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editCard.customerName ?? ""}
                    onChange={e => setEditCard(p => ({ ...p, customerName: e.target.value || null }))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Assigned To</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editCard.assignedTo ?? ""}
                    onChange={e => setEditCard(p => ({ ...p, assignedTo: e.target.value || null }))}
                  >
                    <option value="">Unassigned</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    value={editCard.notes ?? ""}
                    onChange={e => setEditCard(p => ({ ...p, notes: e.target.value || null }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Booking ID</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={editCard.bookingId ?? ""}
                      onChange={e => setEditCard(p => ({ ...p, bookingId: e.target.value ? Number(e.target.value) : null }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Quote ID</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={editCard.quoteId ?? ""}
                      onChange={e => setEditCard(p => ({ ...p, quoteId: e.target.value ? Number(e.target.value) : null }))}
                    />
                  </div>
                </div>
              </div>

              {/* Stage history */}
              {cardHistory.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Stage History</h3>
                  <div className="space-y-1.5">
                    {cardHistory.map(h => (
                      <div key={h.id} className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span className="text-gray-300">•</span>
                        {h.fromStageId ? (
                          <span>{stageById[h.fromStageId]?.name ?? `Stage ${h.fromStageId}`} → {stageById[h.toStageId]?.name ?? `Stage ${h.toStageId}`}</span>
                        ) : (
                          <span>Created in {stageById[h.toStageId]?.name ?? `Stage ${h.toStageId}`}</span>
                        )}
                        {h.movedBy && <span className="text-gray-400">by {h.movedBy}</span>}
                        {h.note && <span className="text-gray-400 italic">— {h.note}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Move to stage quick buttons */}
              <div className="mt-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Move to Stage</h3>
                <div className="flex flex-wrap gap-1.5">
                  {stages.filter(s => s.id !== selectedCard.stageId).map(s => (
                    <button
                      key={s.id}
                      onClick={() => { moveCard(selectedCard.id, s.id); setSelectedCard(null); }}
                      className="text-xs px-2.5 py-1 rounded-full border border-gray-200 hover:border-indigo-400 hover:text-indigo-700 transition-colors"
                      style={{ borderLeftColor: s.color, borderLeftWidth: 3 }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={saveCardEdit}
                  disabled={savingEdit}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingEdit ? "Saving…" : "Save Changes"}
                </button>
                <button
                  onClick={() => archiveCard(selectedCard.id)}
                  className="border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-50"
                >
                  Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
