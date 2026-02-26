"use client";

import { useState, useEffect } from "react";

interface VaccineCategoryItem {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  ageGroup: string | null;
  dosesRequired: number | null;
  notes: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface VaccineCategory {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  items: VaccineCategoryItem[];
}

const emptyCatForm = {
  name: "",
  description: "",
  icon: "",
  sortOrder: 0,
  isActive: true,
};

const emptyItemForm = {
  name: "",
  description: "",
  ageGroup: "",
  dosesRequired: 1,
  notes: "",
  sortOrder: 0,
  isActive: true,
};

export default function AdminVaccineCategoriesPage() {
  const [categories, setCategories] = useState<VaccineCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [catForm, setCatForm] = useState(emptyCatForm);
  const [editCatId, setEditCatId] = useState<number | null>(null);
  const [savingCat, setSavingCat] = useState(false);
  const [error, setError] = useState("");

  // Item form state
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [savingItem, setSavingItem] = useState(false);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/vaccine-categories");
      const data = await res.json();
      setCategories(data);
    } catch {
      setError("Failed to load vaccine categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  // ── Category CRUD ──────────────────────────────────────────────────────────

  function startEditCat(cat: VaccineCategory) {
    setEditCatId(cat.id);
    setCatForm({
      name: cat.name,
      description: cat.description ?? "",
      icon: cat.icon ?? "",
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
  }

  function cancelEditCat() {
    setEditCatId(null);
    setCatForm(emptyCatForm);
    setError("");
  }

  async function handleCatSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingCat(true);
    setError("");
    try {
      const payload = {
        name: catForm.name,
        description: catForm.description || null,
        icon: catForm.icon || null,
        sortOrder: catForm.sortOrder,
        isActive: catForm.isActive,
      };
      if (editCatId) {
        await fetch(`/api/vaccine-categories/${editCatId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/vaccine-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      cancelEditCat();
      await fetchCategories();
    } catch {
      setError("Failed to save category");
    } finally {
      setSavingCat(false);
    }
  }

  async function handleDeleteCat(id: number) {
    if (!confirm("Delete this category and all its vaccines?")) return;
    try {
      await fetch(`/api/vaccine-categories/${id}`, { method: "DELETE" });
      await fetchCategories();
    } catch {
      setError("Failed to delete category");
    }
  }

  // ── Item CRUD ──────────────────────────────────────────────────────────────

  function startAddItem(catId: number) {
    setSelectedCatId(catId);
    setEditItemId(null);
    setItemForm(emptyItemForm);
  }

  function startEditItem(item: VaccineCategoryItem) {
    setSelectedCatId(item.categoryId);
    setEditItemId(item.id);
    setItemForm({
      name: item.name,
      description: item.description ?? "",
      ageGroup: item.ageGroup ?? "",
      dosesRequired: item.dosesRequired ?? 1,
      notes: item.notes ?? "",
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
  }

  function cancelEditItem() {
    setSelectedCatId(null);
    setEditItemId(null);
    setItemForm(emptyItemForm);
  }

  async function handleItemSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCatId) return;
    setSavingItem(true);
    setError("");
    try {
      const payload = {
        categoryId: selectedCatId,
        name: itemForm.name,
        description: itemForm.description || null,
        ageGroup: itemForm.ageGroup || null,
        dosesRequired: itemForm.dosesRequired,
        notes: itemForm.notes || null,
        sortOrder: itemForm.sortOrder,
        isActive: itemForm.isActive,
      };
      if (editItemId) {
        await fetch(`/api/vaccine-category-items/${editItemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/vaccine-category-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      cancelEditItem();
      await fetchCategories();
    } catch {
      setError("Failed to save vaccine item");
    } finally {
      setSavingItem(false);
    }
  }

  async function handleDeleteItem(id: number) {
    if (!confirm("Delete this vaccine?")) return;
    try {
      await fetch(`/api/vaccine-category-items/${id}`, { method: "DELETE" });
      await fetchCategories();
    } catch {
      setError("Failed to delete vaccine");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vaccine Categories</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage vaccine categories and their vaccines. These appear as an accordion on the homepage.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Add/Edit Category Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-4">{editCatId ? "Edit Category" : "Add New Category"}</h2>
        <form onSubmit={handleCatSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
              <input
                type="text"
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Travel Vaccines"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
              <input
                type="text"
                value={catForm.icon}
                onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="✈️"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={catForm.sortOrder}
                onChange={(e) => setCatForm({ ...catForm, sortOrder: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={catForm.description}
              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Vaccines recommended for international travel"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="catActive"
              checked={catForm.isActive}
              onChange={(e) => setCatForm({ ...catForm, isActive: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="catActive" className="text-sm text-gray-700">Active (visible on website)</label>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={savingCat}
              className="bg-emerald-600 text-white font-medium px-5 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50"
            >
              {savingCat ? "Saving..." : editCatId ? "Update Category" : "Add Category"}
            </button>
            {editCatId && (
              <button
                type="button"
                onClick={cancelEditCat}
                className="border border-gray-300 text-gray-700 font-medium px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Add/Edit Item Form (shown when a category is selected) */}
      {selectedCatId && (
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
          <h2 className="font-bold text-blue-900 mb-1">
            {editItemId ? "Edit Vaccine" : "Add Vaccine"} to{" "}
            <span className="text-emerald-700">
              {categories.find((c) => c.id === selectedCatId)?.name}
            </span>
          </h2>
          <form onSubmit={handleItemSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vaccine Name *</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Hepatitis A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                <input
                  type="text"
                  value={itemForm.ageGroup}
                  onChange={(e) => setItemForm({ ...itemForm, ageGroup: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="All ages"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Protection against Hepatitis A virus"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doses Required</label>
                <input
                  type="number"
                  min={1}
                  value={itemForm.dosesRequired}
                  onChange={(e) => setItemForm({ ...itemForm, dosesRequired: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={itemForm.notes}
                  onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Booster after 6 months"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={itemForm.sortOrder}
                  onChange={(e) => setItemForm({ ...itemForm, sortOrder: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={savingItem}
                className="bg-blue-600 text-white font-medium px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
              >
                {savingItem ? "Saving..." : editItemId ? "Update Vaccine" : "Add Vaccine"}
              </button>
              <button
                type="button"
                onClick={cancelEditItem}
                className="border border-gray-300 text-gray-700 font-medium px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 px-6 py-10 text-center text-gray-400">
          Loading...
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 px-6 py-10 text-center text-gray-400">
          No categories yet. Add one above.
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Category header */}
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  {cat.icon && <span className="text-2xl">{cat.icon}</span>}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{cat.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${cat.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {cat.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {cat.description && <p className="text-gray-500 text-xs">{cat.description}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startAddItem(cat.id)}
                    className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    + Add Vaccine
                  </button>
                  <button
                    onClick={() => startEditCat(cat)}
                    className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCat(cat.id)}
                    className="text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Vaccines list */}
              {cat.items.length === 0 ? (
                <div className="px-6 py-4 text-gray-400 text-sm">
                  No vaccines in this category.{" "}
                  <button
                    onClick={() => startAddItem(cat.id)}
                    className="text-emerald-600 hover:underline"
                  >
                    Add one →
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {cat.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                          {item.dosesRequired && item.dosesRequired > 1 && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              {item.dosesRequired} doses
                            </span>
                          )}
                          {!item.isActive && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 mt-0.5">
                          {item.ageGroup && <span className="text-xs text-gray-400">{item.ageGroup}</span>}
                          {item.description && <span className="text-xs text-gray-400 truncate">{item.description}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0 ml-3">
                        <button
                          onClick={() => startEditItem(item)}
                          className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
