import type { Metadata } from "next";
import { db } from "@/db";
import { customers, bookings } from "@/db/schema";
import { eq, count, desc } from "drizzle-orm";
import Link from "next/link";

export const metadata: Metadata = { title: "Customers" };
export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const allCustomers = await db
    .select()
    .from(customers)
    .orderBy(desc(customers.createdAt));

  // Get booking counts per customer
  const bookingCounts = await db
    .select({ customerId: bookings.customerId, count: count() })
    .from(bookings)
    .groupBy(bookings.customerId);

  const countMap = new Map(bookingCounts.map((b) => [b.customerId, b.count]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 text-sm mt-1">
          {allCustomers.length} customer{allCustomers.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {allCustomers.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            No customers yet. They&apos;ll appear here when bookings are submitted.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">#</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Name</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Phone</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Email</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">City</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Bookings</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Joined</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-gray-400">#{c.id}</td>
                    <td className="px-5 py-4 font-medium text-gray-900">{c.name}</td>
                    <td className="px-5 py-4">
                      <a href={`tel:${c.phone}`} className="text-emerald-600 hover:underline">
                        {c.phone}
                      </a>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {c.email ? (
                        <a href={`mailto:${c.email}`} className="hover:text-emerald-700">
                          {c.email}
                        </a>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{c.city}</td>
                    <td className="px-5 py-4">
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2 py-1 rounded-full">
                        {countMap.get(c.id) ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="text-emerald-600 font-medium hover:underline text-xs"
                      >
                        View details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
