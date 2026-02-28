"use client";

import { useState, useEffect } from "react";

interface WebhookLog {
  id: number;
  event: string;
  payload: string;
  response_code: number | null;
  response_body: string | null;
  success: boolean;
  error_message: string | null;
  triggered_by: string | null;
  retry_count: number;
  created_at: string;
}

interface Setting {
  key: string;
  value: string;
  description: string;
}

export default function WebhooksPage() {
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "success" | "failed">("all");
  const [editingSetting, setEditingSetting] = useState<string | null>(null);
  const [settingValue, setSettingValue] = useState("");

  async function fetchData() {
    setLoading(true);
    try {
      const [logsRes, settingsRes] = await Promise.all([
        fetch("/api/webhook-logs"),
        fetch("/api/settings")
      ]);
      
      const logsData = await logsRes.json();
      const settingsData = await settingsRes.json();
      
      setWebhookLogs(logsData);
      setSettings(settingsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    // Fetch data on mount
    const loadData = async () => {
      setLoading(true);
      try {
        const [logsRes, settingsRes] = await Promise.all([
          fetch("/api/webhook-logs"),
          fetch("/api/settings")
        ]);
        
        const logsData = await logsRes.json();
        const settingsData = await settingsRes.json();
        
        setWebhookLogs(logsData);
        setSettings(settingsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
      setLoading(false);
    };
    
    loadData();
  }, []);

  async function updateSetting(key: string, value: string) {
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      });
      await fetchData();
      setEditingSetting(null);
    } catch (error) {
      console.error("Failed to update setting:", error);
    }
  }

  async function retryWebhook(webhookLogId: number) {
    try {
      await fetch("/api/webhook-logs/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookLogId })
      });
      await fetchData();
    } catch (error) {
      console.error("Failed to retry webhook:", error);
    }
  }

  const filteredLogs = webhookLogs.filter(log => {
    if (filter === "all") return true;
    if (filter === "success") return log.success;
    if (filter === "failed") return !log.success;
    return true;
  });

  const webhookUrl = settings.find(s => s.key === "webhook_url")?.value || "";
  const webhookSecret = settings.find(s => s.key === "webhook_secret")?.value || "";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Webhook Management</h1>

        {/* Webhook Configuration */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Webhook Configuration</h2>
          <div className="space-y-4">
            {settings.filter(s => s.key.startsWith("webhook_")).map(setting => (
              <div key={setting.key} className="flex items-center gap-4">
                <label className="w-48 font-medium">{setting.description}</label>
                {editingSetting === setting.key ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      type="text"
                      value={settingValue}
                      onChange={(e) => setSettingValue(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder={setting.description}
                    />
                    <button
                      onClick={() => updateSetting(setting.key, settingValue)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingSetting(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 flex-1">
                    <span className="flex-1 px-3 py-2 bg-gray-100 rounded-md font-mono text-sm truncate">
                      {setting.key === "webhook_secret" && setting.value 
                        ? "••••••••" 
                        : setting.value || "(not set)"}
                    </span>
                    <button
                      onClick={() => {
                        setEditingSetting(setting.key);
                        setSettingValue(setting.value);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Webhook Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Webhook Logs</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-md ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("success")}
                className={`px-4 py-2 rounded-md ${filter === "success" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                Success
              </button>
              <button
                onClick={() => setFilter("failed")}
                className={`px-4 py-2 rounded-md ${filter === "failed" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                Failed
              </button>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Refresh
              </button>
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No webhook logs found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-semibold">Event</th>
                    <th className="text-left py-3 px-2 font-semibold">Status</th>
                    <th className="text-left py-3 px-2 font-semibold">Response</th>
                    <th className="text-left py-3 px-2 font-semibold">Retries</th>
                    <th className="text-left py-3 px-2 font-semibold">Triggered By</th>
                    <th className="text-left py-3 px-2 font-semibold">Time</th>
                    <th className="text-left py-3 px-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <span className="font-mono text-sm">{log.event}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          log.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {log.success ? "SUCCESS" : "FAILED"}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-sm">
                          {log.response_code && <span className="mr-2">Code: {log.response_code}</span>}
                          {log.error_message && (
                            <span className="text-red-600 text-xs" title={log.error_message}>
                              {log.error_message.substring(0, 50)}...
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm">{log.retry_count}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm">{log.triggered_by || "system"}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-gray-600">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        {!log.success && (
                          <button
                            onClick={() => retryWebhook(log.id)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Available Events */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Available Webhook Events</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "booking.created",
              "booking.updated", 
              "booking.cancelled",
              "quote.sent",
              "support.ticket.created",
              "support.ticket.resolved",
              "pipeline.stage.changed",
              "payment.received"
            ].map(event => (
              <div key={event} className="bg-blue-50 border border-blue-200 rounded p-3">
                <code className="text-blue-800 text-sm">{event}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
