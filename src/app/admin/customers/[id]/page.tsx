import type { Metadata } from "next";
import { db } from "@/db";
import { patients, familyMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FamilyMembersList } from "./FamilyMembersList";
import { CreateCustomerLogin } from "./CreateCustomerLogin";

export const metadata: Metadata = { title: "Customer Details" };
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const customerId = parseInt(id);

  if (isNaN(customerId)) {
    notFound();
  }

  const customer = await db.query.patients.findFirst({
    where: eq(patients.id, customerId),
  });

  if (!customer) {
    notFound();
  }

  const customerFamilyMembers = await db.query.familyMembers.findMany({
    where: eq(familyMembers.customerId, customerId),
  });

  return (
    <div className="space-y-6">
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
          <FamilyMembersList
            customerId={customerId}
            initialFamilyMembers={customerFamilyMembers}
          />
        </div>
      </div>

      {/* Create Customer Login */}
      <CreateCustomerLogin
        customerId={customerId}
        customerName={customer.name}
        customerPhone={customer.phone}
        customerEmail={customer.email}
        onCustomerUpdated={() => {}}
      />
    </div>
  );
}
