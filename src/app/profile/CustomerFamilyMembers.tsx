"use client";

import { useState } from "react";
import { ProfilePictureUpload } from "./ProfilePictureUpload";

interface FamilyMember {
  id: number;
  customerId: number;
  name: string;
  dateOfBirth: string | null;
  gender: string | null;
  vaccineCardUrl: string | null;
  pictureUrl: string | null;
}

interface CustomerFamilyMembersProps {
  customerId: number;
  initialFamilyMembers: FamilyMember[];
}

export function CustomerFamilyMembers({
  customerId,
  initialFamilyMembers,
}: CustomerFamilyMembersProps) {
  const [familyMembersList, setFamilyMembersList] =
    useState<FamilyMember[]>(initialFamilyMembers);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    vaccineCardUrl: "",
    pictureUrl: "",
  });

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
          vaccineCardUrl: formData.vaccineCardUrl || null,
          pictureUrl: formData.pictureUrl || null,
        }),
      });

      if (response.ok) {
        const newFamilyMember = await response.json();
        setFamilyMembersList([...familyMembersList, newFamilyMember]);
        setFormData({ name: "", dateOfBirth: "", gender: "", vaccineCardUrl: "", pictureUrl: "" });
        setIsAdding(false);
      } else {
        alert("Failed to add family member");
      }
    } catch (error) {
      console.error("Error adding family member:", error);
      alert("Failed to add family member");
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
          vaccineCardUrl: formData.vaccineCardUrl || null,
          pictureUrl: formData.pictureUrl || null,
        }),
      });

      if (response.ok) {
        const updatedFamilyMember = await response.json();
        setFamilyMembersList(
          familyMembersList.map((fm) =>
            fm.id === id ? updatedFamilyMember : fm
          )
        );
        setFormData({ name: "", dateOfBirth: "", gender: "", vaccineCardUrl: "", pictureUrl: "" });
        setEditingId(null);
      } else {
        alert("Failed to update family member");
      }
    } catch (error) {
      console.error("Error updating family member:", error);
      alert("Failed to update family member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this family member?")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/family-members/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFamilyMembersList(
          familyMembersList.filter((fm) => fm.id !== id)
        );
      } else {
        alert("Failed to delete family member");
      }
    } catch (error) {
      console.error("Error deleting family member:", error);
      alert("Failed to delete family member");
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (member: FamilyMember) => {
    setFormData({
      name: member.name,
      dateOfBirth: member.dateOfBirth || "",
      gender: member.gender || "",
      vaccineCardUrl: member.vaccineCardUrl || "",
      pictureUrl: member.pictureUrl || "",
    });
    setEditingId(member.id);
    setIsAdding(false);
  };

  const cancelForm = () => {
    setFormData({ name: "", dateOfBirth: "", gender: "", vaccineCardUrl: "", pictureUrl: "" });
    setIsAdding(false);
    setEditingId(null);
  };

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
        <div
          key={member.id}
          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          {editingId === member.id ? (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <ProfilePictureUpload
                  currentImage={formData.pictureUrl}
                  onImageChange={(url) => setFormData({ ...formData, pictureUrl: url })}
                  label="Family Member Photo"
                  size="md"
                />
              </div>
              <input
                type="text"
                placeholder="Name *"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <input
                type="date"
                placeholder="Date of Birth"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input
                type="text"
                placeholder="Vaccine Card URL"
                value={formData.vaccineCardUrl}
                onChange={(e) =>
                  setFormData({ ...formData, vaccineCardUrl: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(member.id)}
                  disabled={isLoading}
                  className="bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={cancelForm}
                  disabled={isLoading}
                  className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {member.pictureUrl ? (
                    <img
                      src={member.pictureUrl}
                      alt={member.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-xl font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <div className="text-sm text-gray-500 space-y-1 mt-2">
                      {member.dateOfBirth && (
                        <p>
                          DOB:{" "}
                          {new Date(member.dateOfBirth).toLocaleDateString("en-IN")}
                        </p>
                      )}
                      {member.gender && <p>Gender: {member.gender}</p>}
                      {member.vaccineCardUrl && (
                        <p>
                          Vaccine Card:{" "}
                          <a
                            href={member.vaccineCardUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:underline"
                          >
                            View
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(member)}
                    className="text-emerald-600 hover:text-emerald-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {isAdding && (
        <div className="border border-emerald-300 rounded-lg p-4 bg-emerald-50 space-y-4">
          <h3 className="font-semibold text-gray-900">Add New Family Member</h3>
          <div className="flex justify-center mb-4">
            <ProfilePictureUpload
              currentImage={formData.pictureUrl}
              onImageChange={(url) => setFormData({ ...formData, pictureUrl: url })}
              label="Family Member Photo"
              size="md"
            />
          </div>
          <input
            type="text"
            placeholder="Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <input
            type="date"
            placeholder="Date of Birth"
            value={formData.dateOfBirth}
            onChange={(e) =>
              setFormData({ ...formData, dateOfBirth: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input
            type="text"
            placeholder="Vaccine Card URL"
            value={formData.vaccineCardUrl}
            onChange={(e) =>
              setFormData({ ...formData, vaccineCardUrl: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={isLoading}
              className="bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              Add Family Member
            </button>
            <button
              onClick={cancelForm}
              disabled={isLoading}
              className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
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
