import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Debug - Database Status" };
export const dynamic = "force-dynamic";

export default async function DebugPage() {
  let debugData = null;
  let error = null;

  try {
    const res = await fetch("/api/debug/database");
    if (res.ok) {
      debugData = await res.json();
    } else {
      error = `HTTP ${res.status}: ${res.statusText}`;
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-gray-600 hover:text-gray-900">
          ← Home
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">Debug</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Debug Information</h1>

      <div className="grid gap-6">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-emerald-900 mb-4">
                Database Status
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-emerald-700 font-medium">Staff Count</p>
                  <p className="text-2xl font-bold text-emerald-900">{debugData.staffCount}</p>
                </div>
                <div>
                  <p className="text-sm text-emerald-700 font-medium">Settings Count</p>
                  <p className="text-2xl font-bold text-emerald-900">{debugData.settingsCount}</p>
                </div>
              </div>
            </div>

            {debugData.admin ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">
                  Admin User
                </h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-sm text-blue-700">ID:</span>
                    <span className="font-mono">{debugData.admin.id}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-sm text-blue-700">Email:</span>
                    <span className="font-mono">{debugData.admin.email}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-sm text-blue-700">Name:</span>
                    <span>{debugData.admin.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-sm text-blue-700">Role:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      debugData.admin.role === "admin" 
                        ? "bg-red-100 text-red-700" 
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {debugData.admin.role}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-sm text-blue-700">Active:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      debugData.admin.isActive 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {debugData.admin.isActive ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-sm text-blue-700">Password Set:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      debugData.admin.hasPassword 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {debugData.admin.hasPassword ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-sm text-blue-700">Created At:</span>
                    <span className="text-sm text-blue-600">
                      {debugData.admin.createdAt
                        ? new Date(debugData.admin.createdAt).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-amber-900 mb-2">
                  Admin User Not Found
                </h2>
                <p className="text-amber-700 mb-4">
                  The admin user <code className="bg-amber-200 px-1 rounded">admin@vaccinepanda.com</code>
                  does not exist in the database.
                </p>
                <div className="flex gap-2">
                  <form 
                    action="/api/seed/staff" 
                    method="GET"
                    className="flex items-center gap-2"
                  >
                    <button
                      type="submit"
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                    >
                      Create Admin User
                    </button>
                  </form>
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Raw Data
              </h2>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify(debugData, null, 2)}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
