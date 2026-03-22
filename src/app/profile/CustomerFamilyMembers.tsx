"use client";

import { useState } from "react";

interface FamilyMember {
  id: number;
  customerId: number;
  name: string;
  dateOfBirth: string | null;
  gender: string | null;
  vaccineCardUrl: string | null;
}

interface CustomerFamilyMembersProps {
  customerId: number;
  initialFamilyMembers: FamilyMember[];
}

const emptyForm = {
  name: "",
  dateOfBirth: "",
  gender: "",
};

export function CustomerFamilyMembers({
  customerId,
  initialFamilyMembers,
}: CustomerFamilyMembersProps) {
  const [familyMembersList, setFamilyMembersList] = useState<FamilyMember[]>(initialFamilyMembers);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ ...emptyForm });

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      alert("Please enter a name");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/family-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          name: formData.name,
          dateOfBirth: formData.dateOfBirth || null,
          gender: formData.gender || null,
        }),
      });
      if (response.ok) {
        const newMember = await response.json();
        setFamilyMembersList([...familyMembersList, newMember]);
        setFormData({ ...emptyForm });
        setIsAdding(false);
      } else {
        const err = await response.json().catch(() => ({ error: "Unknown error" }));
        alert(err.error || "Failed to add family member");
      }
    } catch {
      alert("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    if (!formData.name.trim()) {
      alert("Please enter a name");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/family-members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          dateOfBirth: formData.dateOfBirth || null,
          gender: formData.gender || null,
        }),
      });
      if (response.ok) {
        const updated = await response.json();
        setFamilyMembersList(familyMembersList.map((fm) => (fm.id === id ? updated : fm)));
        setFormData({ ...emptyForm });
        setEditingId(null);
      } else {
        const err = await response.json().catch(() => ({ error: "Unknown error" }));
        alert(err.error || "Failed to update family member");
      }
    } catch {
      alert("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this family member?")) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/family-members/${id}`, { method: "DELETE" });
      if (response.ok) {
        setFamilyMembersList(familyMembersList.filter((fm) => fm.id !== id));
      } else {
        const err = await response.json().catch(() => ({ error: "Unknown error" }));
        alert(err.error || "Failed to delete family member");
      }
    } catch {
      alert("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (member: FamilyMember) => {
    setFormData({
      name: member.name,
      dateOfBirth: member.dateOfBirth || "",
      gender: member.gender || "",
    });
    setEditingId(member.id);
    setIsAdding(false);
  };

  const cancelForm = () => {
    setFormData({ ...emptyForm });
    setIsAdding(false);
    setEditingId(null);
  };

  const MemberForm = ({ onSave }: { onSave: () => void }) => (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Full Name *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
        />
        <select
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white"
        >
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onSave}
          disabled={isLoading}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={cancelForm}
          disabled={isLoading}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  if (familyMembersList.length === 0 && !isAdding) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 mb-4">No family members added yet</p>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Add Family Member
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {familyMembersList.map((member) => (
        <div key={member.id} className="border border-gray-200 rounded-xl p-4">
          {editingId === member.id ? (
            <div>
              <p className="font-semibold text-gray-700 mb-3">Editing: {member.name}</p>
              <MemberForm onSave={() => handleEdit(member.id)} />
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 text-xl font-bold">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <div className="text-sm text-gray-500 space-y-0.5 mt-1">
                    {member.dateOfBirth && (
                      <p>DOB: {new Date(member.dateOfBirth).toLocaleDateString("en-IN")}</p>
                    )}
                    {member.gender && <p>Gender: {member.gender}</p>}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <button onClick={() => startEdit(member)} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                  Edit
                </button>
                <button onClick={() => handleDelete(member.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {isAdding && (
        <div className="border border-emerald-300 rounded-xl p-4 bg-emerald-50">
          <p className="font-semibold text-gray-700 mb-3">Add New Family Member</p>
          <MemberForm onSave={handleAdd} />
        </div>
      )}

      {!isAdding && familyMembersList.length > 0 && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
        >
          + Add Another Family Member
        </button>
      )}
    </div>
  );
}
