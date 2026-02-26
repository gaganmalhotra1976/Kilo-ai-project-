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

export default function VaccineCategoriesAccordion({ categories }: VaccineCategoriesAccordionProps) {
  const [openId, setOpenId] = useState<number | null>(categories[0]?.id ?? null);

  if (!categories || categories.length === 0) return null;

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="max-w-5xl mx-auto px-4 py-12 sm:py-16 md:py-20">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Vaccine Categories
        </h2>
        <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
          Browse vaccines by category. Click a category to see the full list of available vaccines.
        </p>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => {
          const isOpen = openId === cat.id;
          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
            >
              {/* Header */}
              <button
                onClick={() => toggle(cat.id)}
                className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left hover:bg-gray-50 transition-colors"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  {cat.icon && (
                    <span className="text-2xl sm:text-3xl flex-shrink-0">{cat.icon}</span>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{cat.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                    {cat.items.length} vaccine{cat.items.length !== 1 ? "s" : ""}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expandable content */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {cat.items.length === 0 ? (
                  <div className="px-5 sm:px-6 pb-5 text-gray-400 text-sm">
                    No vaccines listed in this category yet.
                  </div>
                ) : (
                  <div className="px-5 sm:px-6 pb-5">
                    <div className="border-t border-gray-100 pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {cat.items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                              {item.dosesRequired && item.dosesRequired > 1 && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0">
                                  {item.dosesRequired} doses
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {item.ageGroup && (
                                <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                                  {item.ageGroup}
                                </span>
                              )}
                              {item.notes && (
                                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                                  {item.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
