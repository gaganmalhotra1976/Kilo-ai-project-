"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type AuditLog = {
  id: number;
  staffId: number;
  staffName: string | null;
  action: string;
  module: string | null;
  recordId: number | null;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  createdAt: string;
};

const MODULES = [
  "All Modules",
  "bookings",
  "customers",
  "quotes",
  "pipelines",
  "settings",
  "staff",
  "invoices",
  "communications",
];

const ACTIONS = [
  "All Actions",
  "login",
  "logout",
  "create",
  "update",
  "delete",
  "view",
];

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    staffId: "",
    module: "",
    action: "",
    startDate: "",
    endDate: "",
  });

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.staffId) params.set("staffId", filters.staffId);
      if (filters.module && filters.module !== "All Modules") params.set("module", filters.module);
      if (filters.action && filters.action !== "All Actions") params.set("action", filters.action);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);

      const res = await fetch(`/api/audit-log?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchLogs();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "create": return "bg-emerald-100 text-emerald-700";
      case "update": return "bg-blue-100 text-blue-700";
      case "delete": return "bg-red-100 text-red-700";
      case "login": return "bg-purple-100 text-purple-700";
      case "logout": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings" className="text-gray-400 hover:text-gray-700 text-sm">
          ← Settings
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600 text-sm">Audit Log</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-gray-500 text-sm mt-1">
          Track all staff actions across the system
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Module</label>
            <select
              value={filters.module}
              onChange={(e) => handleFilterChange("module", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {MODULES.map((m) => (
                <option key={m} value={m === "All Modules" ? "" : m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Action</label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a === "All Actions" ? "" : a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={applyFilters}
              className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-gray-400">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-gray-400">No audit logs found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Timestamp</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Staff</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Module</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Record ID</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString("en-IN") : "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {log.staffName || `Staff #${log.staffId}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{log.module || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{log.recordId || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{log.ipAddress || "—"}</td>
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
