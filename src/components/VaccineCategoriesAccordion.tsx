"use client";

import { useState } from "react";

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

interface VaccineCategoriesAccordionProps {
  categories: VaccineCategory[];
}

interface AgeBandVaccine {
  name: string;
  doses?: string;
}

interface AgeBand {
  id: string;
  emoji: string;
  label: string;
  range: string;
  vaccines: AgeBandVaccine[];
}

const AGE_BANDS: AgeBand[] = [
  {
    id: "0-6w",
    emoji: "🍼",
    label: "0–6 Weeks",
    range: "Birth to 6 weeks",
    vaccines: [
      { name: "BCG" },
      { name: "Hep B", doses: "Birth dose" },
    ],
  },
  {
    id: "6-14w",
    emoji: "👶",
    label: "6–14 Weeks",
    range: "6 weeks to 14 weeks",
    vaccines: [
      { name: "Hexavalent DPT with IPV combo", doses: "3 shots" },
      { name: "PCV", doses: "3 shots" },
      { name: "Rotavirus", doses: "3 shots" },
      { name: "OPV", doses: "3 shots" },
    ],
  },
  {
    id: "6-7m",
    emoji: "🧒",
    label: "6–7 Months",
    range: "6 to 7 months",
    vaccines: [
      { name: "Flu", doses: "2 shots" },
    ],
  },
  {
    id: "9-12m",
    emoji: "🎂",
    label: "9–12 Months",
    range: "9 to 12 months",
    vaccines: [
      { name: "MMR" },
      { name: "Typhoid" },
      { name: "Hep A", doses: "1st shot" },
      { name: "JE", doses: "2 shots" },
      { name: "Meningococcal", doses: "2 shots" },
    ],
  },
];

export default function VaccineCategoriesAccordion({ categories: _categories }: VaccineCategoriesAccordionProps) {
  const [activeTab, setActiveTab] = useState<string>(AGE_BANDS[0].id);

  const activeBand = AGE_BANDS.find((b) => b.id === activeTab) ?? AGE_BANDS[0];

  return (
    <section className="max-w-5xl mx-auto px-4 py-12 sm:py-16 md:py-20">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Vaccine Schedule by Age
        </h2>
        <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
          Select an age group to see recommended vaccines.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-8">
        {AGE_BANDS.map((band) => (
          <button
            key={band.id}
            onClick={() => setActiveTab(band.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
              activeTab === band.id
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                : "bg-white text-gray-700 border-gray-200 hover:border-emerald-400 hover:text-emerald-700"
            }`}
          >
            <span className="text-base">{band.emoji}</span>
            <span>{band.label}</span>
          </button>
        ))}
      </div>

      {/* Active band content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Band header */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex items-center gap-3">
          <span className="text-3xl">{activeBand.emoji}</span>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{activeBand.label}</h3>
            <p className="text-emerald-700 text-sm">{activeBand.range}</p>
          </div>
          <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
            {activeBand.vaccines.length} vaccine{activeBand.vaccines.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Vaccine list */}
        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeBand.vaccines.map((vaccine, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="font-semibold text-gray-900 text-sm">{vaccine.name}</span>
                </div>
                {vaccine.doses && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-medium flex-shrink-0 ml-2">
                    {vaccine.doses}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
