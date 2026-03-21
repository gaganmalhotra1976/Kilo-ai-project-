"use client";

import { useState, useRef } from "react";

interface FamilyMember {
  id: number;
  customerId: number;
  registrationNumber: string | null;
  name: string;
  dateOfBirth: string | null;
  gender: string | null;
  pictureData: string | null;
  vaccineCardData: string | null;
}

interface CustomerFamilyMembersProps {
  customerId: number;
  initialFamilyMembers: FamilyMember[];
}

const emptyForm = {
  registrationNumber: "",
  name: "",
  dateOfBirth: "",
  gender: "",
  vaccineCardData: "",
  pictureData: "",
};

function ImageUpload({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (base64: string) => void;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onloadend = () => {
      // Strip the data URL prefix and keep only the base64 string
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      onChange(base64);
    };
    reader.readAsDataURL(file);
  };

  const imgSrc = value ? `data:image/jpeg;base64,${value}` : null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        onClick={() => inputRef.current?.click()}
        className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors overflow-hidden"
      >
        {imgSrc ? (
          <img src={imgSrc} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-gray-400">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Upload</span>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
      {error && <p className="text-red-500 text-xs">{error}</p>}
      {value && (
        <button type="button" onClick={() => onChange("")} className="text-red-500 text-xs hover:text-red-700">
          Remove
        </button>
      )}
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

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
          registrationNumber: formData.registrationNumber || null,
          name: formData.name,
          dateOfBirth: formData.dateOfBirth || null,
          gender: formData.gender || null,
          vaccineCardData: formData.vaccineCardData || null,
          pictureData: formData.pictureData || null,
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
          registrationNumber: formData.registrationNumber || null,
          name: formData.name,
          dateOfBirth: formData.dateOfBirth || null,
          gender: formData.gender || null,
          vaccineCardData: formData.vaccineCardData || null,
          pictureData: formData.pictureData || null,
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
      registrationNumber: member.registrationNumber || "",
      name: member.name,
      dateOfBirth: member.dateOfBirth || "",
      gender: member.gender || "",
      vaccineCardData: member.vaccineCardData || "",
      pictureData: member.pictureData || "",
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
      <div className="flex justify-center mb-4">
        <ImageUpload
          value={formData.pictureData}
          onChange={(base64) => setFormData({ ...formData, pictureData: base64 })}
          label="Photo (JPEG)"
        />
      </div>
      <input
        type="text"
        placeholder="Registration Number (Aadhaar / PAN / Passport)"
        value={formData.registrationNumber}
        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
      />
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
      <div>
        <p className="text-xs text-gray-500 mb-1">Vaccine Card (JPEG upload)</p>
        <ImageUpload
          value={formData.vaccineCardData}
          onChange={(base64) => setFormData({ ...formData, vaccineCardData: base64 })}
          label="Vaccine Card"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onSave}
          disabled={isLoading}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {isLoading ? "Saving…" : "Save"}
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
                {member.pictureData ? (
                  <img
                    src={`data:image/jpeg;base64,${member.pictureData}`}
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-600 text-xl font-bold">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <div className="text-sm text-gray-500 space-y-0.5 mt-1">
                    {member.registrationNumber && (
                      <p>Reg No: <span className="font-medium text-gray-700">{member.registrationNumber}</span></p>
                    )}
                    {member.dateOfBirth && (
                      <p>DOB: {new Date(member.dateOfBirth).toLocaleDateString("en-IN")}</p>
                    )}
                    {member.gender && <p>Gender: {member.gender}</p>}
                    {member.vaccineCardData && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-400 mb-1">Vaccine Card:</p>
                        <img
                          src={`data:image/jpeg;base64,${member.vaccineCardData}`}
                          alt="Vaccine Card"
                          className="w-32 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer"
                          onClick={() => window.open(`data:image/jpeg;base64,${member.vaccineCardData}`, "_blank")}
                        />
                      </div>
                    )}
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
          <h3 className="font-semibold text-gray-900 mb-4">Add New Family Member</h3>
          <MemberForm onSave={handleAdd} />
        </div>
      )}

      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          + Add Family Member
        </button>
      )}
    </div>
  );
}
