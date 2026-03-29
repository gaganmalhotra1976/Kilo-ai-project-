"use client";

import { useState } from "react";
import { CreateCustomerLogin } from "./CreateCustomerLogin";
import Link from "next/link";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string;
  notes: string | null;
  createdAt: Date | null;
}

interface FamilyMember {
  id: number;
  customerId: number;
  name: string;
  dateOfBirth: string | null;
  gender: string | null;
  vaccineCardUrl: string | null;
}

interface CustomerDetailClientProps {
  customer: Customer;
  familyMembers: FamilyMember[];
}

export function CustomerDetailClient({ customer, familyMembers }: CustomerDetailClientProps) {
  const [updatedFamilyMembers, setUpdatedFamilyMembers] = useState(familyMembers);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFamilyMemberUpdated = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6" key={refreshKey}>
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/patients"
            className="text-emerald-600 hover:underline text-sm mb-2 inline-block"
          >
            ← Back to patients
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Customer since{" "}
            {customer.createdAt
              ? new Date(customer.createdAt).toLocaleDateString("en-IN")
              : "Unknown"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Contact Information
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Phone</label>
              <p className="text-gray-900">
                <a href={`tel:${customer.phone}`} className="text-emerald-600 hover:underline">
                  {customer.phone}
                </a>
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="text-gray-900">
                {customer.email ? (
                  <a href={`mailto:${customer.email}`} className="text-emerald-600 hover:underline">
                    {customer.email}
                  </a>
                ) : (
                  <span className="text-gray-400">Not provided</span>
                )}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Address</label>
              <p className="text-gray-900">
                {customer.address || <span className="text-gray-400">Not provided</span>}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">City</label>
              <p className="text-gray-900">{customer.city}</p>
            </div>
            {customer.notes && (
              <div>
                <label className="text-sm text-gray-500">Notes</label>
                <p className="text-gray-900">{customer.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Family Members</h2>
          </div>
          <div className="space-y-3">
            {updatedFamilyMembers.length === 0 ? (
              <p className="text-gray-500 text-sm">No family members added yet.</p>
            ) : (
              updatedFamilyMembers.map((member) => (
                <div key={member.id} className="border rounded-lg p-3">
                  <p className="font-medium">{member.name}</p>
                  {member.dateOfBirth && (
                    <p className="text-sm text-gray-500">DOB: {member.dateOfBirth}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <CreateCustomerLogin
        customerId={customer.id}
        customerName={customer.name}
        customerPhone={customer.phone}
        customerEmail={customer.email}
        onCustomerUpdated={handleFamilyMemberUpdated}
      />
    </div>
  );
}