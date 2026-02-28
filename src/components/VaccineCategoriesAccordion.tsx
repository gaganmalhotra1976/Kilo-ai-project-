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

type BadgeColor = "blue" | "green" | "orange" | "purple" | "teal" | "red";

interface AgeBandVaccine {
  name: string;
  badge?: string;
  badgeColor?: BadgeColor;
}

interface AgeBand {
  id: string;
  emoji: string;
  label: string;
  range: string;
  vaccines: AgeBandVaccine[];
}

const BADGE_CLASSES: Record<BadgeColor, string> = {
  blue:   "bg-blue-50 text-blue-700",
  green:  "bg-emerald-50 text-emerald-700",
  orange: "bg-orange-50 text-orange-600",
  purple: "bg-purple-50 text-purple-700",
  teal:   "bg-teal-50 text-teal-700",
  red:    "bg-red-50 text-red-600",
};

const AGE_BANDS: AgeBand[] = [
  {
    id: "0-6w",
    emoji: "🍼",
    label: "0–6 Weeks",
    range: "Birth to 6 weeks",
    vaccines: [
      { name: "BCG", badge: "Birth dose", badgeColor: "green" },
      { name: "Hepatitis B", badge: "Birth dose", badgeColor: "blue" },
    ],
  },
  {
    id: "6-14w",
    emoji: "👶",
    label: "6–14 Weeks",
    range: "6 weeks to 14 weeks",
    vaccines: [
      { name: "DPT Pentavalent (Hexaxim)", badge: "3 doses", badgeColor: "blue" },
      { name: "OPV (Oral Polio)", badge: "3 doses", badgeColor: "blue" },
      { name: "IPV (Injectable Polio)", badge: "2 doses", badgeColor: "blue" },
      { name: "PCV (Prevenar)", badge: "3 doses", badgeColor: "blue" },
      { name: "Rotavirus (Rotavac)", badge: "3 doses", badgeColor: "blue" },
      { name: "Hepatitis B", badge: "2nd & 3rd dose", badgeColor: "blue" },
      { name: "Meningococcal B", badge: "Optional", badgeColor: "orange" },
      { name: "Flu (Influenza)", badge: "From 6 weeks", badgeColor: "purple" },
    ],
  },
  {
    id: "6-7m",
    emoji: "😊",
    label: "6–7 Months",
    range: "6 to 7 months",
    vaccines: [
      { name: "Flu (Influenza)", badge: "2 doses (1 month apart)", badgeColor: "purple" },
      { name: "Hepatitis A", badge: "1st dose", badgeColor: "blue" },
      { name: "Japanese Encephalitis", badge: "1st dose", badgeColor: "blue" },
    ],
  },
  {
    id: "9-12m",
    emoji: "🎂",
    label: "9–12 Months",
    range: "9 months to 1 year",
    vaccines: [
      { name: "MMR", badge: "1st dose", badgeColor: "blue" },
      { name: "Typhoid Conjugate", badge: "1st dose (9 months)", badgeColor: "blue" },
      { name: "Chickenpox (Varicella)", badge: "1st dose (12 months)", badgeColor: "blue" },
      { name: "Hepatitis A", badge: "1st dose (12 months)", badgeColor: "blue" },
      { name: "Flu (Influenza)", badge: "Annual booster", badgeColor: "purple" },
    ],
  },
  {
    id: "1-2y",
    emoji: "🧒",
    label: "1–2 Years",
    range: "12 months to 2 years",
    vaccines: [
      { name: "Hepatitis A", badge: "2nd dose", badgeColor: "blue" },
      { name: "Japanese Encephalitis", badge: "2nd dose", badgeColor: "blue" },
      { name: "Chickenpox (Varicella)", badge: "2 doses", badgeColor: "blue" },
      { name: "DPT Pentavalent", badge: "Booster 1", badgeColor: "green" },
      { name: "OPV", badge: "Booster 1", badgeColor: "green" },
      { name: "PCV", badge: "Booster 1", badgeColor: "green" },
      { name: "Flu (Influenza)", badge: "Annual booster", badgeColor: "purple" },
      { name: "Typhoid Conjugate", badge: "At 2 yrs", badgeColor: "blue" },
      { name: "Pneumo 23", badge: "Optional", badgeColor: "orange" },
    ],
  },
  {
    id: "2-5y",
    emoji: "🌟",
    label: "2–5 Years",
    range: "2 years to 5 years",
    vaccines: [
      { name: "MMR", badge: "2nd dose", badgeColor: "blue" },
      { name: "Chickenpox (Varicella)", badge: "2nd dose (if missed)", badgeColor: "blue" },
      { name: "Typhoid Conjugate", badge: "Booster", badgeColor: "green" },
      { name: "Hepatitis A", badge: "Catch-up if missed", badgeColor: "blue" },
      { name: "Flu (Influenza)", badge: "Annual", badgeColor: "purple" },
      { name: "Pneumo 23", badge: "Optional", badgeColor: "orange" },
    ],
  },
  {
    id: "5-6y",
    emoji: "🎒",
    label: "5–6 Years",
    range: "School entry age",
    vaccines: [
      { name: "DPT", badge: "2nd Booster", badgeColor: "green" },
      { name: "OPV", badge: "2nd Booster", badgeColor: "green" },
      { name: "MMR", badge: "Booster (if not done)", badgeColor: "blue" },
      { name: "Typhoid Conjugate", badge: "Booster", badgeColor: "blue" },
      { name: "Flu (Influenza)", badge: "Annual", badgeColor: "purple" },
    ],
  },
  {
    id: "10-12y",
    emoji: "📚",
    label: "10–12 Years",
    range: "Pre-teen / adolescent",
    vaccines: [
      { name: "Tdap", badge: "Booster", badgeColor: "green" },
      { name: "HPV", badge: "2 doses (6 months apart)", badgeColor: "blue" },
      { name: "Meningococcal (MenACWY)", badge: "Optional", badgeColor: "orange" },
      { name: "Hepatitis B", badge: "Catch-up if missed", badgeColor: "blue" },
      { name: "Typhoid", badge: "Booster (every 3 yrs)", badgeColor: "green" },
      { name: "Flu (Influenza)", badge: "Annual", badgeColor: "purple" },
    ],
  },
  {
    id: "13-18y",
    emoji: "🧑",
    label: "13–18 Years",
    range: "Adolescent / teen",
    vaccines: [
      { name: "HPV", badge: "3rd dose (if started late)", badgeColor: "blue" },
      { name: "Tdap", badge: "Booster", badgeColor: "green" },
      { name: "Meningococcal", badge: "Booster", badgeColor: "green" },
      { name: "COVID-19", badge: "As recommended", badgeColor: "teal" },
      { name: "Flu (Influenza)", badge: "Annual", badgeColor: "purple" },
      { name: "Typhoid", badge: "Booster (every 3 yrs)", badgeColor: "green" },
    ],
  },
  {
    id: "18-45y",
    emoji: "🧑‍💼",
    label: "Adults 18–45",
    range: "Working age adults",
    vaccines: [
      { name: "Td / Tdap", badge: "Every 10 years", badgeColor: "green" },
      { name: "Flu (Influenza)", badge: "Annual", badgeColor: "purple" },
      { name: "COVID-19", badge: "Booster as recommended", badgeColor: "teal" },
      { name: "Hepatitis B", badge: "Catch-up if missed", badgeColor: "blue" },
      { name: "Typhoid", badge: "Booster every 3 yrs", badgeColor: "green" },
      { name: "HPV", badge: "Optional (up to 45 yrs)", badgeColor: "orange" },
      { name: "Meningococcal", badge: "If at risk", badgeColor: "orange" },
    ],
  },
  {
    id: "60plus",
    emoji: "👴",
    label: "60+ Years",
    range: "Senior / elderly",
    vaccines: [
      { name: "Flu (Influenza)", badge: "Annual", badgeColor: "purple" },
      { name: "Pneumococcal (PCV / Pneumo 23)", badge: "1–2 doses", badgeColor: "blue" },
      { name: "Shingles (Shingrix / Zoster)", badge: "2 doses", badgeColor: "blue" },
      { name: "COVID-19", badge: "Booster as recommended", badgeColor: "teal" },
      { name: "Td / Tdap", badge: "Every 10 years", badgeColor: "green" },
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
          💉 Vaccine Schedule by Age
        </h2>
        <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
          Select an age group to see recommended vaccines.
        </p>
      </div>

      {/* Tab bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 mb-8">
        {AGE_BANDS.map((band) => (
          <button
            key={band.id}
            onClick={() => setActiveTab(band.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-full text-sm font-medium border transition-all duration-200 ${
              activeTab === band.id
                ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                : "bg-white text-gray-700 border-gray-200 hover:border-emerald-500 hover:text-emerald-700"
            }`}
          >
            <span className="text-lg leading-none">{band.emoji}</span>
            <span>{band.label}</span>
          </button>
        ))}
      </div>

      {/* Active band content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Band header */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-5 flex items-center gap-4">
          <span className="text-4xl leading-none">{activeBand.emoji}</span>
          <div>
            <h3 className="font-bold text-gray-900 text-xl">{activeBand.label}</h3>
            <p className="text-emerald-700 text-sm mt-0.5">{activeBand.range}</p>
          </div>
          <span className="ml-auto bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0">
            {activeBand.vaccines.length} vaccine{activeBand.vaccines.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Vaccine list */}
        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeBand.vaccines.map((vaccine, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="font-medium text-gray-900 text-sm">{vaccine.name}</span>
                </div>
                {vaccine.badge && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                      BADGE_CLASSES[vaccine.badgeColor ?? "blue"]
                    }`}
                  >
                    {vaccine.badge}
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
