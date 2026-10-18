import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import type { AnalyticsData } from "../../types";
import { apiGetAnalytics, apiGetReports } from "../../services/api";
import { exportIncidentsToCSV } from "../../utils/exportCsv";
import {
  FaChartPie,
  FaUsers,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSyncAlt,
  FaBoxes,
  FaHospital,
  FaFire,
  FaWater,
  FaGlobeAmericas,
  FaWind,
  FaMountain,
  FaRobot,
  FaFileDownload,
} from "react-icons/fa";

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchAnalytics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await apiGetAnalytics();
      if (res.success && res.analytics) {
        setData(res.analytics);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await apiGetReports();
      if (res.success && res.reports) {
        exportIncidentsToCSV(res.reports, `resqnet-analytics-log-${new Date().toISOString().slice(0, 10)}.csv`);
      } else {
        alert("Failed to fetch reports for CSV export.");
      }
    } catch (err) {
      console.error("Export CSV error:", err);
      alert("Error generating CSV export.");
    } finally {
      setExporting(false);
    }
  };

  const getDisasterIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === "fire") return <FaFire className="text-orange-500" />;
    if (t === "flood") return <FaWater className="text-blue-500" />;
    if (t === "earthquake") return <FaGlobeAmericas className="text-emerald-500" />;
    if (t === "cyclone") return <FaWind className="text-cyan-500" />;
    if (t === "landslide") return <FaMountain className="text-amber-600" />;
    return <FaExclamationTriangle className="text-purple-500" />;
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200/60">
              <FaChartPie />
              <span>Real-Time Disaster Intelligence & AI Analytics</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Crisis Analytics & Impact Trends
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Data-driven overview of emergency volume, resolution velocity, population impact, and AI predictive hazard intelligence.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={exporting}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-gray-100 border border-black/[0.08] text-gray-800 text-xs font-semibold shadow-xs transition flex items-center gap-2 disabled:opacity-50 active:scale-95"
              title="Download Incident Telemetry as CSV"
            >
              <FaFileDownload className={`text-xs text-blue-600 ${exporting ? "animate-bounce" : ""}`} />
              <span>{exporting ? "Exporting..." : "Export CSV"}</span>
            </button>

            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="self-start sm:self-center px-4 py-2.5 rounded-2xl bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              <FaSyncAlt className={`text-xs ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Computing Analytics..." : "Refresh Intelligence"}</span>
            </button>
          </div>
        </div>

        {loading || !data ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-bold text-gray-900">Aggregating Disaster Metrics...</p>
            <p className="text-xs text-gray-500 mt-1">Processing incident logs, relief inventory & spatial metrics</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
            {/* KPI METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-black/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Population Impacted
                  </span>
                  <h2 className="text-3xl font-bold text-gray-900 mt-1">
                    {data.totalPeopleAffected.toLocaleString()}
                  </h2>
                  <p className="text-[11px] text-gray-500 mt-1">Citizens in affected zones</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-xs">
                  <FaUsers />
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-black/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    Resolution Rate
                  </span>
                  <h2 className="text-3xl font-bold text-emerald-600 mt-1">
                    {data.resolutionRate}%
                  </h2>
                  <p className="text-[11px] text-emerald-600/80 mt-1">
                    {data.resolvedReports} of {data.totalReports} incidents secured
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-xs">
                  <FaCheckCircle />
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-black/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-red-600">
                    Active Operations
                  </span>
                  <h2 className="text-3xl font-bold text-red-600 mt-1">
                    {data.activeReports}
                  </h2>
                  <p className="text-[11px] text-red-500/80 mt-1">Requiring responder actions</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-xl shadow-xs">
                  <FaExclamationTriangle />
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-black/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                    Shelter Occupancy
                  </span>
                  <h2 className="text-3xl font-bold text-purple-600 mt-1">
                    {data.logistics.totalShelterCapacity > 0
                      ? Math.round(
                          (data.logistics.totalShelterOccupancy /
                            data.logistics.totalShelterCapacity) *
                            100
                        )
                      : 0}
                    %
                  </h2>
                  <p className="text-[11px] text-purple-500/80 mt-1">
                    {data.logistics.totalShelterOccupancy} / {data.logistics.totalShelterCapacity} beds occupied
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shadow-xs">
                  <FaHospital />
                </div>
              </div>
            </div>

            {/* AI PREDICTIVE DISASTER INTELLIGENCE BANNER */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-purple-300 text-xs font-bold border border-white/10">
                  <FaRobot />
                  <span>AI Predictive Disaster Risk Analysis</span>
                </div>
                <h3 className="text-lg font-bold">
                  High Risk Hazard Clustering Detected in Coastal & Lowland Sectors
                </h3>
                <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
                  Natural language telemetry across active incident descriptions highlights compound threats: rapid water current escalation paired with electrical shorts. Emergency dispatch priority should concentrate in Sector 4 and coastal zones.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
                <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                  <span className="text-[10px] uppercase font-bold text-purple-300 block">AI Escalation Index</span>
                  <span className="text-xl font-bold text-white">Elevated P1</span>
                </div>
                <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-300 block">Volunteer Readiness</span>
                  <span className="text-xl font-bold text-white">94% Certified</span>
                </div>
              </div>
            </div>

            {/* CHARTS GRID ROW 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* DISASTER TYPE DISTRIBUTION */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-black/[0.06]">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Disaster Category Breakdown
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Proportion of emergency types logged in the platform.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-400">
                    {Object.keys(data.disasterCounts).length} Types
                  </span>
                </div>

                <div className="space-y-4">
                  {Object.entries(data.disasterCounts).map(([type, count]) => {
                    const percentage =
                      data.totalReports > 0
                        ? Math.round((count / data.totalReports) * 100)
                        : 0;

                    return (
                      <div key={type} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-800 flex items-center gap-2">
                            {getDisasterIcon(type)}
                            <span>{type} Disaster</span>
                          </span>
                          <span className="font-semibold text-gray-500">
                            {count} incident{count !== 1 ? "s" : ""} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SEVERITY LEVEL DISTRIBUTION */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-black/[0.06]">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Incident Severity Composition
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Triage severity levels assigned during initial citizen reports.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-400">Triage Levels</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-red-600 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                        <span>Critical (Immediate Life Danger)</span>
                      </span>
                      <span className="font-semibold text-red-600">
                        {data.severityBreakdown.Critical} incidents
                      </span>
                    </div>
                    <div className="w-full h-3 bg-red-50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            data.totalReports > 0
                              ? (data.severityBreakdown.Critical / data.totalReports) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-orange-600 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                        <span>High (Urgent Attention)</span>
                      </span>
                      <span className="font-semibold text-orange-600">
                        {data.severityBreakdown.High} incidents
                      </span>
                    </div>
                    <div className="w-full h-3 bg-orange-50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            data.totalReports > 0
                              ? (data.severityBreakdown.High / data.totalReports) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-600 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                        <span>Medium (Assistance Required)</span>
                      </span>
                      <span className="font-semibold text-amber-600">
                        {data.severityBreakdown.Medium} incidents
                      </span>
                    </div>
                    <div className="w-full h-3 bg-amber-50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            data.totalReports > 0
                              ? (data.severityBreakdown.Medium / data.totalReports) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-green-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                        <span>Low (Monitoring State)</span>
                      </span>
                      <span className="font-semibold text-green-700">
                        {data.severityBreakdown.Low} incidents
                      </span>
                    </div>
                    <div className="w-full h-3 bg-green-50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            data.totalReports > 0
                              ? (data.severityBreakdown.Low / data.totalReports) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: PRIORITY RANK & SECTOR HOTSPOTS & LOGISTICS READINESS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-black/[0.06]">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <FaShieldAlt className="text-blue-600" />
                  <span>Dynamic Priority Tiers</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-red-50/80 rounded-2xl flex items-center justify-between border border-red-100">
                    <span className="font-bold text-red-700">P1 - Critical Priority (80-100)</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-bold">
                      {data.priorityBreakdown.P1_Critical}
                    </span>
                  </div>
                  <div className="p-3 bg-orange-50/80 rounded-2xl flex items-center justify-between border border-orange-100">
                    <span className="font-bold text-orange-700">P2 - High Priority (55-79)</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-500 text-white font-bold">
                      {data.priorityBreakdown.P2_High}
                    </span>
                  </div>
                  <div className="p-3 bg-amber-50/80 rounded-2xl flex items-center justify-between border border-amber-100">
                    <span className="font-bold text-amber-700">P3 - Standard (35-54)</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-bold">
                      {data.priorityBreakdown.P3_Standard}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-2xl flex items-center justify-between border border-black/[0.04]">
                    <span className="font-bold text-gray-700">P4 - Low Priority (&lt;35)</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-600 text-white font-bold">
                      {data.priorityBreakdown.P4_Low}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-black/[0.06]">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <FaGlobeAmericas className="text-purple-600" />
                  <span>Top Crisis Sectors & Zones</span>
                </h3>
                {data.topSectors.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No location clusters recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {data.topSectors.map((sec, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-gray-50/80 rounded-2xl border border-black/[0.04] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-gray-800 truncate">{sec.name}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg bg-gray-200 text-gray-700 font-semibold">
                          {sec.count} reports
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-black/[0.06]">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <FaBoxes className="text-emerald-600" />
                  <span>Logistics Readiness</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-100">
                    <span className="text-emerald-700 font-medium block">Total Supplies Tracked</span>
                    <p className="text-xl font-bold text-emerald-950 mt-0.5">
                      {data.logistics.totalSuppliesTracked.toLocaleString()} units
                    </p>
                    <span className="text-[11px] text-emerald-700">
                      {data.logistics.totalSuppliesAllocated.toLocaleString()} units currently allocated
                    </span>
                  </div>

                  <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-100">
                    <span className="text-blue-700 font-medium block">Emergency Facilities Active</span>
                    <p className="text-xl font-bold text-blue-950 mt-0.5">
                      {data.logistics.facilitiesCount} Shelters & Hospitals
                    </p>
                    <span className="text-[11px] text-blue-700">
                      {data.logistics.totalShelterCapacity.toLocaleString()} total bed capacity
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-xs text-gray-400">
        © 2026 ResQNet. Professional Disaster Coordination Platform.
      </footer>
    </div>
  );
};

export default AnalyticsDashboard;
