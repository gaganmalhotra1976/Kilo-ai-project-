import type { Metadata } from "next";
import { db } from "@/db";
import { patients, familyMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CustomerDetailClient } from "./CustomerDetailClient";

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

  // Convert to plain objects for client component
  const customerData = {
    id: customer.id,
    name: customer.name,
    phone: customer.phone || "",
    email: customer.email,
    address: customer.address,
    city: customer.city,
    notes: customer.notes,
    createdAt: customer.createdAt,
  };

  return (
    <CustomerDetailClient
      customer={customerData}
      familyMembers={customerFamilyMembers}
    />
  );
}