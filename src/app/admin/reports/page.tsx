"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Simple date picker component
function DateRangePicker({ 
  startDate, 
  endDate, 
  onChange 
}: { 
  startDate: string; 
  endDate: string; 
  onChange: (start: string, end: string) => void;
}) {
  return (
    <div className="flex gap-2 items-center">
      <input 
        type="date" 
        value={startDate}
        onChange={(e) => onChange(e.target.value, endDate)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
      />
      <span className="text-gray-500">to</span>
      <input 
        type="date" 
        value={endDate}
        onChange={(e) => onChange(startDate, e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
      />
    </div>
  );
}

// Export button component
function ExportButton({ onClick, label = "Export CSV" }: { onClick: () => void; label?: string }) {
  return (
    <button 
      onClick={onClick}
      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
    >
      📥 {label}
    </button>
  );
}

// CSV Export utility
function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? "")).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [overviewData, setOverviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Date range state - default to current month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [dateRange, setDateRange] = useState({
    start: monthStart.toISOString().split("T")[0],
    end: now.toISOString().split("T")[0]
  });

  const reportTypes = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "bookings", label: "Bookings", icon: "📋" },
    { id: "revenue", label: "Revenue", icon: "💰" },
    { id: "pipeline", label: "Sales Pipeline", icon: "🎯" },
    { id: "operations", label: "Operations", icon: "🏥" },
    { id: "support", label: "Support", icon: "🎫" },
  ];

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      const response = await fetch("/api/reports/overview");
      const result = await response.json();
      if (result.success) {
        setOverviewData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch overview:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => {
    if (loading) return <div className="text-center py-8">Loading...</div>;
    
    const stats = overviewData || {
      totalBookings: { thisMonth: 0, lastMonth: 0, change: 0 },
      totalRevenue: 0,
      conversionRate: 0,
      pendingBookings: 0,
      cancelledBookings: 0,
      averageBookingValue: 0
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Overview Dashboard</h2>
        
        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Bookings */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings.thisMonth}</p>
                <p className={`text-sm ${stats.totalBookings.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.totalBookings.change >= 0 ? '↑' : '↓'} {Math.abs(stats.totalBookings.change)}% vs last month
                </p>
              </div>
              <span className="text-4xl">📋</span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500">This month</p>
              </div>
              <span className="text-4xl">💰</span>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</p>
                <p className="text-sm text-gray-500">Leads → Bookings</p>
              </div>
              <span className="text-4xl">🎯</span>
            </div>
          </div>

          {/* Average Booking Value */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Booking Value</p>
                <p className="text-3xl font-bold text-gray-900">₹{stats.averageBookingValue.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Per booking</p>
              </div>
              <span className="text-4xl">📈</span>
            </div>
          </div>

          {/* Pending Bookings */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Bookings</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
                <p className="text-sm text-gray-500">Awaiting confirmation</p>
              </div>
              <span className="text-4xl">⏳</span>
            </div>
          </div>

          {/* Cancelled Bookings */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelled Bookings</p>
                <p className="text-3xl font-bold text-red-600">{stats.cancelledBookings}</p>
                <p className="text-sm text-gray-500">This period</p>
              </div>
              <span className="text-4xl">❌</span>
            </div>
          </div>
        </div>

        {/* Quick Links to Other Reports */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {reportTypes.filter(r => r.id !== 'overview').map(report => (
              <Link 
                key={report.id} 
                href={`/admin/reports/${report.id}`}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                <span className="text-2xl block mb-1">{report.icon}</span>
                <span className="text-sm font-medium text-gray-700">{report.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "bookings":
        return <BookingsReport dateRange={dateRange} />;
      case "revenue":
        return <RevenueReport dateRange={dateRange} />;
      case "pipeline":
        return <PipelineReport dateRange={dateRange} />;
      case "operations":
        return <OperationsReport dateRange={dateRange} />;
      case "support":
        return <SupportReport dateRange={dateRange} />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">📈 Reports & Analytics</h1>
        <DateRangePicker 
          startDate={dateRange.start} 
          endDate={dateRange.end}
          onChange={(start, end) => setDateRange({ start, end })}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {reportTypes.map((report) => (
            <button
              key={report.id}
              onClick={() => setActiveTab(report.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === report.id
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {report.icon} {report.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {renderContent()}
      </div>
    </div>
  );
}

// Individual Report Components (simplified versions for now)
function BookingsReport({ dateRange }: { dateRange: { start: string; end: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [dateRange]);

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      const response = await fetch(`/api/reports/bookings?${params}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (data?.bookings) {
      exportToCSV(data.bookings, "bookings_report");
    }
  };

  if (loading) return <div className="text-center py-8">Loading bookings data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">📋 Bookings Report</h2>
        <ExportButton onClick={handleExport} />
      </div>

      {data?.bookings && data.bookings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vaccine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.bookings.slice(0, 20).map((booking: any) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">#{booking.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{booking.customerName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{booking.customerPhone}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{booking.vaccinesRequested}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{booking.preferredDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{booking.city}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No bookings found for this period</div>
      )}

      {data?.pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of {data.pagination.total} bookings
          </p>
          <div className="flex gap-2">
            <button 
              disabled={data.pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              disabled={data.pagination.page >= data.pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RevenueReport({ dateRange }: { dateRange: { start: string; end: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, [dateRange]);

  const fetchRevenue = async () => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      const response = await fetch(`/api/reports/revenue?${params}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch revenue:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (data?.revenueByPeriod) {
      exportToCSV(data.revenueByPeriod, "revenue_report");
    }
  };

  if (loading) return <div className="text-center py-8">Loading revenue data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">💰 Revenue Report</h2>
        <ExportButton onClick={handleExport} />
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
          <p className="text-sm text-emerald-700">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-900">
            ₹{data?.revenueByPeriod?.reduce((sum: number, r: any) => sum + (r.total || 0), 0).toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">Outstanding Payments</p>
          <p className="text-2xl font-bold text-yellow-900">₹{(data?.outstandingPayments || 0).toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">Payment Methods Used</p>
          <p className="text-2xl font-bold text-blue-900">{data?.paymentMethods?.length || 0}</p>
        </div>
      </div>

      {/* Revenue by Period Table */}
      {data?.revenueByPeriod && data.revenueByPeriod.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Revenue by Date</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.revenueByPeriod.slice(0, 15).map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{item.date}</td>
                    <td className="px-4 py-3 text-sm font-medium text-emerald-600">₹{(item.total || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(!data?.revenueByPeriod || data.revenueByPeriod.length === 0) && (
        <div className="text-center py-8 text-gray-500">No revenue data for this period</div>
      )}
    </div>
  );
}

function PipelineReport({ dateRange }: { dateRange: { start: string; end: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipeline();
  }, [dateRange]);

  const fetchPipeline = async () => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      const response = await fetch(`/api/reports/pipeline?${params}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch pipeline:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading pipeline data...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">🎯 Sales Pipeline Report</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-700">Average Conversion Time</p>
          <p className="text-2xl font-bold text-purple-900">{data?.averageConversionDays || 0} days</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">Total Leads This Period</p>
          <p className="text-2xl font-bold text-blue-900">
            {data?.leadsBySource?.reduce((sum: number, l: any) => sum + l.count, 0) || 0}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">Leads by Source</p>
          <p className="text-2xl font-bold text-green-900">{data?.leadsBySource?.length || 0}</p>
        </div>
      </div>

      {/* Funnel Chart (Simplified) */}
      {data?.leadsByStage && data.leadsByStage.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Pipeline Funnel</h3>
          <div className="space-y-2">
            {data.leadsByStage.map((stage: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3">
                <div 
                  className="px-3 py-2 rounded text-white font-medium text-sm"
                  style={{ backgroundColor: stage.stageColor || '#6366f1', minWidth: '120px' }}
                >
                  {stage.stageName}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div 
                    className="bg-emerald-500 h-6 rounded-full transition-all"
                    style={{ width: `${(stage.count / Math.max(...data.leadsByStage.map((s: any) => s.count))) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-16 text-right">{stage.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staff Performance */}
      {data?.staffPerformance && data.staffPerformance.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Staff Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Leads</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Converted</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lost</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.staffPerformance.map((staff: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{staff.staff || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{staff.totalLeads}</td>
                    <td className="px-4 py-3 text-sm text-green-600 font-medium">{staff.converted || 0}</td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">{staff.lost || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function OperationsReport({ dateRange }: { dateRange: { start: string; end: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOperations();
  }, [dateRange]);

  const fetchOperations = async () => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      const response = await fetch(`/api/reports/operations?${params}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch operations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading operations data...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">🏥 Operations Report</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">Visits This Week</p>
          <p className="text-2xl font-bold text-blue-900">{data?.visitsThisWeek || 0}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">Visits This Month</p>
          <p className="text-2xl font-bold text-green-900">{data?.visitsThisMonth || 0}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">Pending Assignments</p>
          <p className="text-2xl font-bold text-yellow-900">{data?.pendingAssignments || 0}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-700">Avg Completion Time</p>
          <p className="text-2xl font-bold text-purple-900">{data?.averageCompletionDays || 0} days</p>
        </div>
      </div>

      {/* Staff Performance */}
      {data?.bookingsByNurse && data.bookingsByNurse.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Staff Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Member</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Assigned</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confirmed</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.bookingsByNurse.map((nurse: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{nurse.nurse}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{nurse.count}</td>
                    <td className="px-4 py-3 text-sm text-green-600 font-medium">{nurse.completed || 0}</td>
                    <td className="px-4 py-3 text-sm text-blue-600 font-medium">{nurse.confirmed || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SupportReport({ dateRange }: { dateRange: { start: string; end: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  function getStatusColor(status: string): string {
    switch (status) {
      case "open": return "bg-red-100 text-red-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  useEffect(() => {
    fetchSupport();
  }, [dateRange]);

  const fetchSupport = async () => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      const response = await fetch(`/api/reports/support?${params}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch support:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading support data...</div>;

  const statusData = data?.statusBreakdown || { open: 0, in_progress: 0, resolved: 0, closed: 0 };
  const priorityData = data?.priorityBreakdown || { low: 0, medium: 0, high: 0, urgent: 0 };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">🎫 Support Report</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">Tickets This Month</p>
          <p className="text-2xl font-bold text-blue-900">{data?.totalTicketsThisMonth || 0}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">Resolved</p>
          <p className="text-2xl font-bold text-green-900">{statusData.resolved}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">In Progress</p>
          <p className="text-2xl font-bold text-yellow-900">{statusData.in_progress}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-700">Avg Resolution Time</p>
          <p className="text-2xl font-bold text-purple-900">{data?.averageResolutionHours || 0} hrs</p>
        </div>
      </div>

      {/* Status & Priority Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Status Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(statusData).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                <span className="font-medium text-gray-900">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Support Tickets */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Tickets</h3>
        {data?.recentTickets && data.recentTickets.length > 0 ? (
          <div className="space-y-2">
            {data.recentTickets.slice(0, 5).map((ticket: any) => (
              <div key={ticket.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-gray-900">{ticket.subject}</p>
                  <p className="text-sm text-gray-500">#{ticket.id}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No recent tickets</p>
        )}
      </div>
    </div>
  );
}
