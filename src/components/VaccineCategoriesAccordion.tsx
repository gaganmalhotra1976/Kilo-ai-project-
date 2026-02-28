"use client";

import { useState } from "react";

type BadgeColor = "blue" | "green" | "orange" | "purple" | "teal";

const BADGE_CLASSES: Record<BadgeColor, string> = {
  blue: "bg-[#eef4ff] text-[#3b6fd4]",
  green: "bg-[#e8f5f0] text-[#2e7d5e]",
  orange: "bg-[#fff4e5] text-[#d4813b]",
  purple: "bg-[#f0eeff] text-[#6b4fd4]",
  teal: "bg-[#e0f7fa] text-[#00796b]",
};

interface Vaccine {
  name: string;
  badge: string;
  badgeColor: BadgeColor;
}

interface AgeBand {
  id: string;
  emoji: string;
  label: string;
  subtitle: string;
  vaccines: Vaccine[];
}

const AGE_BANDS: AgeBand[] = [
  {
    id: "cat0",
    emoji: "🍼",
    label: "At Birth",
    subtitle: "Within 24 hours of birth",
    vaccines: [
      { name: "BCG", badge: "Birth dose", badgeColor: "green" },
      { name: "OPV-0 (Oral Polio)", badge: "Birth dose", badgeColor: "green" },
      { name: "Hepatitis B", badge: "1st dose", badgeColor: "green" },
    ],
  },
  {
    id: "cat1",
    emoji: "👶",
    label: "6 Weeks",
    subtitle: "Primary immunization begins",
    vaccines: [
      { name: "DPT + IPV + Hib + Hep B", badge: "Hexavalent – 1st dose", badgeColor: "blue" },
      { name: "OPV", badge: "1st dose", badgeColor: "blue" },
      { name: "Rotavirus", badge: "1st dose", badgeColor: "blue" },
      { name: "PCV (Pneumococcal)", badge: "1st dose", badgeColor: "blue" },
    ],
  },
  {
    id: "cat2",
    emoji: "🤱",
    label: "10 Weeks",
    subtitle: "Second round of primary doses",
    vaccines: [
      { name: "DPT + IPV + Hib + Hep B", badge: "Hexavalent – 2nd dose", badgeColor: "blue" },
      { name: "OPV", badge: "2nd dose", badgeColor: "blue" },
      { name: "Rotavirus", badge: "2nd dose", badgeColor: "blue" },
      { name: "PCV (Pneumococcal)", badge: "2nd dose", badgeColor: "blue" },
    ],
  },
  {
    id: "cat3",
    emoji: "😊",
    label: "14 Weeks",
    subtitle: "Third round of primary doses",
    vaccines: [
      { name: "DPT + IPV + Hib + Hep B", badge: "Hexavalent – 3rd dose", badgeColor: "blue" },
      { name: "OPV", badge: "3rd dose", badgeColor: "blue" },
      { name: "Rotavirus", badge: "3rd dose", badgeColor: "blue" },
      { name: "PCV (Pneumococcal)", badge: "3rd dose", badgeColor: "blue" },
    ],
  },
  {
    id: "cat4",
    emoji: "🍶",
    label: "6 Months",
    subtitle: "Half-year milestone",
    vaccines: [
      { name: "Typhoid Conjugate (TCV)", badge: "1st dose", badgeColor: "blue" },
      { name: "Flu (Influenza)", badge: "1st time: 2 doses, 1 month apart", badgeColor: "purple" },
    ],
  },
  {
    id: "cat5",
    emoji: "🎈",
    label: "9 Months",
    subtitle: "9 months",
    vaccines: [
      { name: "MMR", badge: "1st dose", badgeColor: "blue" },
      { name: "Meningococcal ACYW", badge: "Optional – 2 doses, 3 months apart", badgeColor: "orange" },
    ],
  },
  {
    id: "cat6",
    emoji: "🎂",
    label: "12 Months",
    subtitle: "1st birthday",
    vaccines: [
      { name: "Hepatitis A", badge: "1st dose", badgeColor: "blue" },
      { name: "Japanese Encephalitis (JE)", badge: "Endemic areas – 2 doses, 4 wks apart", badgeColor: "orange" },
      { name: "Flu (Influenza)", badge: "Annual booster", badgeColor: "purple" },
    ],
  },
  {
    id: "cat7",
    emoji: "🌟",
    label: "15 Months",
    subtitle: "15 months",
    vaccines: [
      { name: "MMR", badge: "2nd dose", badgeColor: "blue" },
      { name: "Varicella (Chickenpox)", badge: "1st dose – 2nd dose 3 months later", badgeColor: "blue" },
      { name: "PCV (Pneumococcal)", badge: "Booster", badgeColor: "green" },
    ],
  },
  {
    id: "cat8",
    emoji: "🧒",
    label: "18 Months",
    subtitle: "1.5 years",
    vaccines: [
      { name: "DPT Pentavalent + IPV", badge: "Booster 1", badgeColor: "green" },
      { name: "OPV", badge: "Booster 1", badgeColor: "green" },
      { name: "Varicella (Chickenpox)", badge: "2nd dose (3 months after 1st)", badgeColor: "blue" },
      { name: "Hepatitis A", badge: "2nd dose (6 months after 1st)", badgeColor: "blue" },
      { name: "Flu (Influenza)", badge: "Annual booster", badgeColor: "purple" },
    ],
  },
  {
    id: "cat9",
    emoji: "🎁",
    label: "2 Years",
    subtitle: "24 months",
    vaccines: [
      { name: "Typhoid Conjugate (TCV)", badge: "Booster – repeat every 3 yrs till 9 yrs", badgeColor: "green" },
      { name: "Meningococcal ACYW", badge: "Optional – single dose (if not given at 9 months)", badgeColor: "orange" },
      { name: "Flu (Influenza)", badge: "Annual", badgeColor: "purple" },
      { name: "Pneumo 23 (PPV23)", badge: "Optional", badgeColor: "orange" },
    ],
  },
  {
    id: "cat10",
    emoji: "🎒",
    label: "4–6 Years",
    subtitle: "School entry age",
    vaccines: [
      { name: "DPT Quadrivalent + IPV", badge: "Booster 2", badgeColor: "green" },
      { name: "MMR", badge: "3rd dose (catch-up if missed)", badgeColor: "blue" },
      { name: "Varicella", badge: "Catch-up (if missed)", badgeColor: "blue" },
      { name: "Flu (Influenza)", badge: "Annual", badgeColor: "purple" },
    ],
  },
  {
    id: "cat11",
    emoji: "🏫",
    label: "6–9 Years",
    subtitle: "Primary school age",
    vaccines: [
      { name: "Flu (Influenza)", badge: "Annual", badgeColor: "purple" },
      { name: "Typhoid Conjugate (TCV)", badge: "Booster every 3 yrs till 9 yrs", badgeColor: "green" },
    ],
  },
  {
    id: "cat12",
    emoji: "📚",
    label: "9–12 Years",
    subtitle: "Pre-teen / adolescent",
    vaccines: [
      { name: "Tdap", badge: "From 9 yrs onwards", badgeColor: "green" },
      { name: "HPV (9vHPV)", badge: "From 9 yrs – 2 doses, boys & girls", badgeColor: "blue" },
      { name: "Meningococcal ACYW", badge: "Optional booster", badgeColor: "orange" },
      { name: "Flu (Influenza)", badge: "Annual", badgeColor: "purple" },
    ],
  },
  {
    id: "cat13",
    emoji: "🧑",
    label: "13–18 Years",
    subtitle: "Adolescent / teen",
    vaccines: [
      { name: "HPV (9vHPV)", badge: "3 doses (if started ≥15 yrs)", badgeColor: "blue" },
      { name: "Td", badge: "Booster at 16–18 yrs", badgeColor: "green" },
      { name: "COVID-19", badge: "As recommended", badgeColor: "teal" },
      { name: "Flu (Influenza)", badge: "Annual", badgeColor: "purple" },
    ],
  },
  {
    id: "cat14",
    emoji: "🧑‍💼",
    label: "Adults 18–49",
    subtitle: "Working age adults",
    vaccines: [
      { name: "Td / Tdap", badge: "Every 10 years", badgeColor: "green" },
      { name: "Flu (Influenza)", badge: "Annual", badgeColor: "purple" },
      { name: "COVID-19", badge: "Booster as recommended", badgeColor: "teal" },
      { name: "Hepatitis B", badge: "Catch-up if missed", badgeColor: "blue" },
      { name: "HPV", badge: "Optional (up to 45 yrs)", badgeColor: "orange" },
    ],
  },
  {
    id: "cat15",
    emoji: "🧓",
    label: "50+ Years",
    subtitle: "Older adults & seniors",
    vaccines: [
      { name: "Flu (Influenza)", badge: "Annual", badgeColor: "purple" },
      { name: "Pneumococcal (PCV / PPV23)", badge: "1–2 doses", badgeColor: "blue" },
      { name: "Shingles / Zoster (Shingrix)", badge: "2 doses – from 50 yrs onwards", badgeColor: "blue" },
      { name: "COVID-19", badge: "Booster as recommended", badgeColor: "teal" },
      { name: "Td / Tdap", badge: "Every 10 years", badgeColor: "green" },
    ],
  },
];

export default function VaccineCategoriesAccordion() {
  const [activeId, setActiveId] = useState<string>("cat0");

  const active = AGE_BANDS.find((b) => b.id === activeId) ?? AGE_BANDS[0];

  return (
    <section className="py-14 sm:py-20 bg-[#f5f5f5]">
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <h2 className="text-2xl font-extrabold text-center text-gray-900 mb-1">
          💉 Vaccine Schedule by Age
        </h2>
        <p className="text-sm text-gray-500 text-center mb-2">
          Select an age group to see recommended vaccines
        </p>
        <span className="block mx-auto w-fit text-xs font-semibold text-[#2e7d5e] bg-[#e8f5f0] rounded-full px-4 py-1 mb-6">
          ✅ As per IAP Schedule 2025
        </span>

        {/* Age buttons grid */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {AGE_BANDS.map((band) => (
            <button
              key={band.id}
              onClick={() => setActiveId(band.id)}
              className={`flex items-center gap-2 px-3 py-3 rounded-full border text-sm font-medium transition-all cursor-pointer ${
                activeId === band.id
                  ? "bg-[#2e7d5e] text-white border-[#2e7d5e]"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#2e7d5e] hover:text-[#2e7d5e]"
              }`}
            >
              <span className="text-lg">{band.emoji}</span>
              {band.label}
            </button>
          ))}
        </div>

        {/* Vaccine card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-md">
          {/* Card header */}
          <div className="bg-[#e8f5f0] px-4 py-4 flex items-center gap-3">
            <span className="text-4xl leading-none">{active.emoji}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900">{active.label}</h3>
              <p className="text-xs text-[#2e7d5e] font-medium mt-0.5">{active.subtitle}</p>
            </div>
            <span className="bg-white border border-gray-300 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 whitespace-nowrap flex-shrink-0">
              {active.vaccines.length} vaccine{active.vaccines.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Vaccine list */}
          <div className="px-3 pb-3 pt-1">
            {active.vaccines.map((v, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-[#fafafa] border border-[#f0f0f0] rounded-xl px-3 py-3 mt-2 gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-[#2e7d5e] flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900">{v.name}</span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap flex-shrink-0 ${BADGE_CLASSES[v.badgeColor]}`}
                >
                  {v.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
