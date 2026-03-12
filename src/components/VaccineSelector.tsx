"use client";

import { useState, useEffect } from "react";

type Vaccine = {
  id: number;
  name: string;
  brand: string;
  category: string;
  mrp: number;
  stockQuantity: number;
  lowStockThreshold: number;
  gstRate: number;
  isAvailable: boolean;
};

type Category = {
  id: number;
  name: string;
};

type LineItem = {
  vaccine: string;
  brand: string;
  patient: string;
  qty: number;
  unitPrice: number;
  gstPct: number;
  batch?: string;
  expiry?: string;
};

type Patient = {
  name: string;
};

interface VaccineSelectorProps {
  lineItems: LineItem[];
  setLineItems: React.Dispatch<React.SetStateAction<LineItem[]>>;
  patients: Patient[];
}

export default function VaccineSelector({ lineItems, setLineItems, patients }: VaccineSelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
  const [sortBy, setSortBy] = useState("availability");
  const [showVaccineDropdown, setShowVaccineDropdown] = useState(false);

  useEffect(() => {
    // Fetch categories
    fetch("/api/vaccine-categories")
      .then(res => res.json())
      .then(data => {
        if (data.success) setCategories(data.data);
      });
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      // Fetch vaccines for selected category
      fetch(`/api/vaccine-categories/${selectedCategory}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data?.items) {
            // Filter and sort vaccines
            let filteredVaccines = data.data.items;
            
            // Apply sorting
            if (sortBy === "price-low") {
              filteredVaccines.sort((a: Vaccine, b: Vaccine) => (a.mrp || 0) - (b.mrp || 0));
            } else if (sortBy === "price-high") {
              filteredVaccines.sort((a: Vaccine, b: Vaccine) => (b.mrp || 0) - (a.mrp || 0));
            } else if (sortBy === "availability") {
              filteredVaccines.sort((a: Vaccine, b: Vaccine) => {
                if (!a.isAvailable && b.isAvailable) return 1;
                if (a.isAvailable && !b.isAvailable) return -1;
                return (b.stockQuantity || 0) - (a.stockQuantity || 0);
              });
            }
            
            setVaccines(filteredVaccines);
          }
        });
    }
  }, [selectedCategory, sortBy]);

  function addLineItem() {
    const newItem: LineItem = {
      vaccine: selectedVaccine?.name || "",
      brand: selectedVaccine?.brand || "",
      patient: patients[0]?.name || "",
      qty: 1,
      unitPrice: selectedVaccine?.mrp || 0,
      gstPct: selectedVaccine?.gstRate || 18,
      batch: "",
      expiry: ""
    };
    setLineItems(prev => [...prev, newItem]);
    setSelectedVaccine(null);
    setShowVaccineDropdown(false);
  }

  function getStockStatus(vaccine: Vaccine) {
    if (!vaccine.isAvailable || vaccine.stockQuantity === 0) {
      return { status: "unavailable", label: "Out of Stock", color: "text-gray-400" };
    }
    if (vaccine.stockQuantity <= vaccine.lowStockThreshold) {
      return { status: "low-stock", label: "Low Stock", color: "text-orange-500" };
    }
    return { status: "available", label: "Available", color: "text-green-600" };
  }

  return (
    <div className="space-y-4">
      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Vaccine Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Sort Options */}
      {selectedCategory && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("availability")}
              className={`px-3 py-1.5 text-xs rounded-lg border ${
                sortBy === "availability" ? "bg-emerald-100 border-emerald-300 text-emerald-700" : "bg-white border-gray-300 text-gray-600"
              }`}
            >
              Availability
            </button>
            <button
              onClick={() => setSortBy("price-low")}
              className={`px-3 py-1.5 text-xs rounded-lg border ${
                sortBy === "price-low" ? "bg-emerald-100 border-emerald-300 text-emerald-700" : "bg-white border-gray-300 text-gray-600"
              }`}
            >
              Price: Low to High
            </button>
            <button
              onClick={() => setSortBy("price-high")}
              className={`px-3 py-1.5 text-xs rounded-lg border ${
                sortBy === "price-high" ? "bg-emerald-100 border-emerald-300 text-emerald-700" : "bg-white border-gray-300 text-gray-600"
              }`}
            >
              Price: High to Low
            </button>
          </div>
        </div>
      )}

      {/* Vaccine Selection */}
      {selectedCategory && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Vaccine Brand</label>
          <div className="relative">
            <button
              onClick={() => setShowVaccineDropdown(!showVaccineDropdown)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-left bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {selectedVaccine ? `${selectedVaccine.brand} - ₹${selectedVaccine.mrp}` : "Select a vaccine brand..."}
            </button>
            
            {showVaccineDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto">
                {vaccines.map((vaccine) => {
                  const stockStatus = getStockStatus(vaccine);
                  return (
                    <button
                      key={vaccine.id}
                      onClick={() => {
                        if (vaccine.isAvailable && vaccine.stockQuantity > 0) {
                          setSelectedVaccine(vaccine);
                          setShowVaccineDropdown(false);
                        }
                      }}
                      disabled={!vaccine.isAvailable || vaccine.stockQuantity === 0}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                        !vaccine.isAvailable || vaccine.stockQuantity === 0 ? "bg-gray-50" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{vaccine.brand}</p>
                          <p className="text-xs text-gray-500">{vaccine.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">₹{vaccine.mrp}</p>
                          <div className="flex items-center gap-1 justify-end">
                            {stockStatus.status === "low-stock" && (
                              <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                            )}
                            <span className={`text-xs ${stockStatus.color}`}>{stockStatus.label}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Button */}
      {selectedVaccine && (
        <button
          onClick={addLineItem}
          className="w-full bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors"
        >
          Add {selectedVaccine.brand} - ₹{selectedVaccine.mrp}
        </button>
      )}

      {/* Patient Assignment */}
      {patients.length > 1 && lineItems.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Patient(s)</label>
          <div className="space-y-2">
            {patients.map((patient, idx) => (
              <label key={idx} className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                <span className="text-sm">{patient.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
