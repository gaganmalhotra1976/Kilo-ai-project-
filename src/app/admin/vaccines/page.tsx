import type { Metadata } from "next";
import { db } from "@/db";
import { vaccines } from "@/db/schema";
import { desc } from "drizzle-orm";

export const metadata: Metadata = { title: "Vaccines" };
export const dynamic = "force-dynamic";

export default async function AdminVaccinesPage() {
  const allVaccines = await db
    .select()
    .from(vaccines)
    .orderBy(desc(vaccines.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vaccines</h1>
          <p className="text-gray-500 text-sm mt-1">
            {allVaccines.length} vaccine{allVaccines.length !== 1 ? "s" : ""} in catalogue
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {allVaccines.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-lg mb-2">No vaccines in the database yet.</p>
            <p className="text-sm">
              The public vaccine catalogue page uses static data. Add vaccines here to manage them dynamically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">#</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Name</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Brand</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Category</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Doses</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Age Group</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allVaccines.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-gray-400">#{v.id}</td>
                    <td className="px-5 py-4 font-medium text-gray-900">{v.name}</td>
                    <td className="px-5 py-4 text-gray-600">{v.brand ?? "—"}</td>
                    <td className="px-5 py-4">
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2 py-1 rounded-full">
                        {v.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{v.dosesRequired}</td>
                    <td className="px-5 py-4 text-gray-600">{v.ageGroup ?? "—"}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${v.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"}`}>
                        {v.isActive ? "Active" : "Inactive"}
                      </span>
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
