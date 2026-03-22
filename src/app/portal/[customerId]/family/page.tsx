"use client";

import { useEffect, useState } from "react";

type FamilyMember = {
  id: number;
  name: string;
  dateOfBirth: string | null;
  gender: string | null;
  vaccineCardUrl: string | null;
};

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const customerId = typeof window !== "undefined" ? localStorage.getItem("portal_customerId") : null;

  useEffect(() => {
    if (!customerId) return;
    fetch(`/api/family-members/customer/${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        setMembers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [customerId]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Family Members</h2>
      </div>

      <p className="text-gray-600 text-sm">
        Family members you have added for booking vaccinations
      </p>

      {members.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
          <p className="text-gray-500 mb-4">No family members added</p>
          <p className="text-sm text-gray-400">
            Add family members when making a booking
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">
                    {member.gender === "female" ? "👩" : "👨"}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-500">
                    {member.gender ? member.gender.charAt(0).toUpperCase() + member.gender.slice(1) : "—"}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                {member.dateOfBirth && (
                  <p>
                    <span className="font-medium">DOB:</span>{" "}
                    {new Date(member.dateOfBirth).toLocaleDateString("en-IN")}
                  </p>
                )}
                {member.vaccineCardUrl && (
                  <a
                    href={member.vaccineCardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline"
                  >
                    View Vaccine Card →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
