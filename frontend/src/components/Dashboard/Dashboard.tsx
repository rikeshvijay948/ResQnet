import { useEffect, useState } from "react";
import EmergencyMap from "./EmergencyMap";
import Navbar from "../Navbar/Navbar";
import type { AIIncidentIntelligence, NearbyResponder, Report, User } from "../../types";
import {
  apiAssignReport,
  apiGetNearbyResponders,
  apiGetReportAIIntelligence,
  apiGetReports,
  apiGetVolunteers,
  apiUpdateReportStatus,
  getFullImageUrl,
} from "../../services/api";
import { formatDistance } from "../../utils/geo";
import { exportIncidentsToCSV } from "../../utils/exportCsv";
import {
  FaSearch,
  FaUserShield,
  FaHandsHelping,
  FaSyncAlt,
  FaTimes,
  FaRoute,
  FaRobot,
  FaExclamationTriangle,
  FaMagic,
  FaFileDownload,
} from "react-icons/fa";

function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [aiIntelligence, setAiIntelligence] = useState<AIIncidentIntelligence | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Assignment Modal & Proximity state
  const [assigningReport, setAssigningReport] = useState<Report | null>(null);
  const [nearbyResponders, setNearbyResponders] = useState<NearbyResponder[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState("");
  const [assignedTeamInput, setAssignedTeamInput] = useState("");
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [disasterFilter, setDisasterFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [reportsData, volunteersData] = await Promise.all([
        apiGetReports(),
        apiGetVolunteers(),
      ]);

      if (reportsData.success && reportsData.reports) {
        setReports(reportsData.reports);
      }
      if (volunteersData.success && volunteersData.volunteers) {
        setVolunteers(volunteersData.volunteers);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openReportDetails = async (report: Report) => {
    setSelectedReport(report);
    setAiLoading(true);
    setAiIntelligence(null);

    try {
      const res = await apiGetReportAIIntelligence(report._id);
      if (res.success && res.intelligence) {
        setAiIntelligence(res.intelligence);
      }
    } catch (err) {
      console.error("Failed to load AI intelligence:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const openAssignmentModal = async (report: Report) => {
    setAssigningReport(report);
    setSelectedVolunteerId("");
    setAssignedTeamInput(report.assignedTeam || "");
    setNearbyLoading(true);

    try {
      const [proxRes, aiRes] = await Promise.all([
        apiGetNearbyResponders(report._id),
        apiGetReportAIIntelligence(report._id),
      ]);

      if (proxRes.success && proxRes.responders) {
        setNearbyResponders(proxRes.responders);
      } else {
        setNearbyResponders([]);
      }

      if (aiRes.success && aiRes.intelligence) {
        setAiIntelligence(aiRes.intelligence);
        if (aiRes.intelligence.smartRecommendation?.recommendedVolunteer) {
          setSelectedVolunteerId(aiRes.intelligence.smartRecommendation.recommendedVolunteer._id);
        }
      }
    } catch (err) {
      console.error("Failed to load proximity & AI dispatch data:", err);
    } finally {
      setNearbyLoading(false);
    }
  };

  const updateStatus = async (reportId: string, newStatus: string) => {
    try {
      const data = await apiUpdateReportStatus(reportId, newStatus);
      if (!data.success) {
        alert("❌ Failed to update status");
        return;
      }

      setReports((currentReports) =>
        currentReports.map((report) =>
          report._id === reportId ? { ...report, status: newStatus } : report
        )
      );

      setSelectedReport((current) =>
        current && current._id === reportId ? { ...current, status: newStatus } : current
      );
    } catch (error) {
      console.error("❌ Status update error:", error);
      alert("❌ Could not connect to the server");
    }
  };

  const handleAssignVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningReport) return;

    if (!selectedVolunteerId && !assignedTeamInput.trim()) {
      alert("Please select a volunteer responder or enter a rescue team name.");
      return;
    }

    setAssignSubmitting(true);

    try {
      const res = await apiAssignReport(
        assigningReport._id,
        selectedVolunteerId,
        assignedTeamInput.trim()
      );

      if (res.success && res.report) {
        const assignedVol = volunteers.find((v) => v._id === selectedVolunteerId);
        const updatedReport: Report = {
          ...assigningReport,
          status: "Assigned",
          assignedVolunteerId: selectedVolunteerId,
          assignedVolunteerName: assignedVol?.name || "",
          assignedVolunteerPhone: assignedVol?.phone || "",
          assignedTeam: assignedTeamInput.trim(),
        };

        setReports((current) =>
          current.map((r) => (r._id === assigningReport._id ? updatedReport : r))
        );

        if (selectedReport?._id === assigningReport._id) {
          setSelectedReport(updatedReport);
        }

        setAssigningReport(null);
        setSelectedVolunteerId("");
        setAssignedTeamInput("");
      } else {
        alert("Failed to assign: " + (res.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Assignment error:", err);
      alert("Error assigning volunteer.");
    } finally {
      setAssignSubmitting(false);
    }
  };

  const criticalCount = reports.filter(
    (r) => r.severity?.toLowerCase() === "critical" || (r.priorityScore && r.priorityScore >= 75)
  ).length;

  const highCount = reports.filter(
    (r) => r.severity?.toLowerCase() === "high" && (!r.priorityScore || r.priorityScore < 75)
  ).length;

  const mediumCount = reports.filter(
    (r) => r.severity?.toLowerCase() === "medium"
  ).length;

  const resolvedCount = reports.filter(
    (r) => r.status?.toLowerCase() === "resolved"
  ).length;

  const activeVolunteersCount = volunteers.filter(
    (v) => v.availability === "Available" || v.availability === "On Duty"
  ).length;

  const filteredReports = reports.filter((report) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      report.fullName?.toLowerCase().includes(search) ||
      report.location?.toLowerCase().includes(search) ||
      report.disasterType?.toLowerCase().includes(search);

    const matchesSeverity =
      severityFilter === "All" ||
      report.severity?.toLowerCase() === severityFilter.toLowerCase();

    const matchesDisaster =
      disasterFilter === "All" ||
      report.disasterType?.toLowerCase() === disasterFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Unassigned" && !report.assignedVolunteerName && !report.assignedTeam) ||
      (statusFilter === "Assigned" && (report.assignedVolunteerName || report.assignedTeam)) ||
      report.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesSeverity && matchesDisaster && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-bold text-gray-900">Loading ResQNet Command Hub...</p>
            <p className="text-xs text-gray-500 mt-1">
              Synchronizing incident feeds, spatial geodata & AI dispatch matrix
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* TOP COMMAND HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-2 border border-purple-200/60">
              <FaRobot className="text-purple-600" />
              <span>AI-Assisted Dispatch & Coordination Command</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Emergency Command Center
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Real-time incident triage, automated AI priority ranking, responder matchmaking, and spatial crisis monitoring.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-black/[0.06] text-xs font-semibold text-gray-700 shadow-xs">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>{activeVolunteersCount} Responders Active</span>
            </div>

            <button
              type="button"
              onClick={() => exportIncidentsToCSV(filteredReports)}
              className="px-3.5 py-2 rounded-2xl bg-white hover:bg-gray-100 border border-black/[0.08] text-gray-700 text-xs font-semibold shadow-xs transition flex items-center gap-2 active:scale-95"
              title="Export filtered disaster records to CSV"
            >
              <FaFileDownload className="text-xs text-blue-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-2xl bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              <FaSyncAlt className={`text-xs ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Updating..." : "Refresh Feed"}</span>
            </button>
          </div>
        </div>

        {/* ================= STATISTICS METRICS ROW ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-black/[0.06]">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Incidents
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">
              {reports.length}
            </h2>
            <p className="text-[11px] text-gray-400 mt-1">All logged reports</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-black/[0.06]">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">
              Critical (P1)
            </p>
            <h2 className="text-3xl font-bold text-red-600 mt-2">
              {criticalCount}
            </h2>
            <p className="text-[11px] text-red-500/80 mt-1">Immediate dispatch</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-black/[0.06]">
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
              High Priority (P2)
            </p>
            <h2 className="text-3xl font-bold text-orange-600 mt-2">
              {highCount}
            </h2>
            <p className="text-[11px] text-orange-500/80 mt-1">Urgent response</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-black/[0.06]">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Medium (P3)
            </p>
            <h2 className="text-3xl font-bold text-amber-600 mt-2">
              {mediumCount}
            </h2>
            <p className="text-[11px] text-amber-500/80 mt-1">Under observation</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-black/[0.06] col-span-2 lg:col-span-1">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Resolved
            </p>
            <h2 className="text-3xl font-bold text-emerald-600 mt-2">
              {resolvedCount}
            </h2>
            <p className="text-[11px] text-emerald-500/80 mt-1">Area secured</p>
          </div>
        </div>

        {/* ================= LIVE EMERGENCY MAP ================= */}
        <div className="mb-8">
          <EmergencyMap reports={reports} />
        </div>

        {/* ================= INCIDENTS TRIAGE TABLE & CARDS ================= */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-black/[0.06] overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Incident Triage & AI Smart Prioritization
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Inspect dynamic risk intelligence, filter by severity, and dispatch AI-matched responders.
                </p>
              </div>

              <div className="text-xs text-gray-500 font-medium">
                Showing <span className="font-bold text-gray-900">{filteredReports.length}</span> of{" "}
                <span className="font-bold text-gray-900">{reports.length}</span> incidents
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FaSearch className="text-xs" />
                </div>
                <input
                  type="text"
                  placeholder="Search name, city or disaster..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50/80 border border-black/[0.08] rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-2.5 bg-gray-50/80 border border-black/[0.08] rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                <option value="All">All Severities</option>
                <option value="Critical">🔴 Critical</option>
                <option value="High">🟠 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>

              <select
                value={disasterFilter}
                onChange={(e) => setDisasterFilter(e.target.value)}
                className="px-3 py-2.5 bg-gray-50/80 border border-black/[0.08] rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                <option value="All">All Disaster Types</option>
                <option value="Flood">🌊 Flood</option>
                <option value="Fire">🔥 Fire</option>
                <option value="Earthquake">🌍 Earthquake</option>
                <option value="Cyclone">🌪️ Cyclone</option>
                <option value="Landslide">⛰️ Landslide</option>
                <option value="Other">⚠️ Other</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-gray-50/80 border border-black/[0.08] rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              >
                <option value="All">All Statuses & Allocations</option>
                <option value="Unassigned">⚠️ Unassigned (Pending Dispatch)</option>
                <option value="Assigned">🔵 Assigned to Team</option>
                <option value="In Progress">🟡 In Progress</option>
                <option value="Resolved">🟢 Resolved</option>
              </select>
            </div>
          </div>

          {/* Incidents List */}
          <div className="p-6">
            {filteredReports.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-sm font-semibold text-gray-900">No matching incidents found</p>
                <p className="text-xs text-gray-500 mt-1">Try adjusting your search criteria or resetting filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div
                    key={report._id}
                    className="p-5 rounded-2xl bg-white border border-black/[0.08] shadow-xs hover:shadow-md transition"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Left Header */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-gray-900">
                            {report.disasterType === "Fire" && "🔥 "}
                            {report.disasterType === "Flood" && "🌊 "}
                            {report.disasterType === "Earthquake" && "🌍 "}
                            {report.disasterType === "Cyclone" && "🌪️ "}
                            {report.disasterType === "Landslide" && "⛰️ "}
                            {report.disasterType} Incident
                          </h3>

                          {report.priorityScore !== undefined && (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                report.priorityScore >= 75
                                  ? "bg-red-600 text-white shadow-xs"
                                  : report.priorityScore >= 50
                                  ? "bg-orange-500 text-white shadow-xs"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              Priority: {report.priorityScore}/100
                            </span>
                          )}

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              report.severity?.toLowerCase() === "critical"
                                ? "bg-red-100 text-red-700"
                                : report.severity?.toLowerCase() === "high"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {report.severity}
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              report.status === "Resolved"
                                ? "bg-green-100 text-green-700"
                                : report.status === "In Progress" || report.status === "Responding"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {report.status || "Reported"}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          Reporter: <span className="font-semibold text-gray-800">{report.fullName}</span> •
                          Phone: <span className="font-semibold text-gray-800">{report.phoneNumber}</span> •
                          Logged: {new Date(report.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {/* Right Dispatch & AI Details */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {report.assignedVolunteerName || report.assignedTeam ? (
                          <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-semibold flex items-center gap-1.5">
                            <FaUserShield className="text-blue-600" />
                            <span>{report.assignedVolunteerName || report.assignedTeam}</span>
                          </div>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold">
                            ⚠️ Unassigned
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => openAssignmentModal(report)}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                        >
                          <FaHandsHelping />
                          <span>Dispatch</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openReportDetails(report)}
                          className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <FaMagic className="text-purple-600" />
                          <span>AI Intelligence</span>
                        </button>

                        <select
                          value={report.status || "Reported"}
                          onChange={(e) => updateStatus(report._id, e.target.value)}
                          className="px-3 py-1.5 bg-gray-50 border border-black/[0.08] rounded-xl text-xs text-gray-800 font-semibold focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Reported">🟠 Reported</option>
                          <option value="Acknowledged">🔵 Acknowledged</option>
                          <option value="Assigned">🟣 Assigned</option>
                          <option value="In Progress">🟡 In Progress</option>
                          <option value="Resolved">🟢 Resolved</option>
                        </select>
                      </div>
                    </div>

                    {/* Brief Info Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-400 font-medium">Location</span>
                        <p className="font-semibold text-gray-800 mt-0.5 truncate">{report.location}</p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-400 font-medium">People Affected</span>
                        <p className="font-semibold text-gray-800 mt-0.5">{report.peopleAffected} individuals</p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-400 font-medium">Coordinates</span>
                        <p className="font-mono text-gray-800 mt-0.5">
                          {report.latitude && report.longitude
                            ? `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`
                            : "No GPS"}
                        </p>
                      </div>
                    </div>

                    {report.description && (
                      <p className="text-xs text-gray-600 mt-3 p-3 bg-gray-50/60 rounded-xl">
                        {report.description}
                      </p>
                    )}

                    {report.imageUrl && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[11px] text-gray-400 font-medium">Photo Evidence:</span>
                        <a
                          href={getFullImageUrl(report.imageUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                        >
                          <span>View Uploaded Image ↗</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* =====================================================
          ASSIGN RESPONDER MODAL (WITH AI SMART MATCHMAKING)
          ===================================================== */}
      {assigningReport && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 border border-black/[0.08] animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FaRoute className="text-blue-600" />
                  <span>Proximity & AI Responder Dispatch</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Incident: <span className="font-bold">{assigningReport.disasterType}</span> at {assigningReport.location}
                </p>
              </div>
              <button
                onClick={() => setAssigningReport(null)}
                className="text-gray-400 hover:text-gray-700 text-lg"
              >
                <FaTimes />
              </button>
            </div>

            {/* AI SMART MATCH RECOMMENDATION CARD */}
            {aiIntelligence?.smartRecommendation?.recommendedVolunteer && (
              <div className="my-4 p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-purple-900 flex items-center gap-1.5">
                    <FaRobot className="text-purple-600" />
                    <span>AI Recommended Dispatch Match</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold text-[10px]">
                    Match Score: {aiIntelligence.smartRecommendation.matchScore}/100
                  </span>
                </div>
                <p className="text-gray-800 font-semibold">
                  {aiIntelligence.smartRecommendation.recommendedVolunteer.name} (
                  {aiIntelligence.smartRecommendation.recommendedVolunteer.availability})
                </p>
                <p className="text-[11px] text-purple-700 mt-1">
                  💡 <em>{aiIntelligence.smartRecommendation.rationale}</em>
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedVolunteerId(
                      aiIntelligence.smartRecommendation!.recommendedVolunteer._id
                    )
                  }
                  className="mt-2.5 px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition shadow-xs"
                >
                  Select AI Recommended Match
                </button>
              </div>
            )}

            <form onSubmit={handleAssignVolunteer} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-700">
                    Available Responders (Proximity & Skill Sorted)
                  </label>
                  {nearbyLoading && (
                    <span className="text-[10px] text-blue-600 font-semibold animate-pulse">
                      Computing distances...
                    </span>
                  )}
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {nearbyResponders.map((vol, index) => {
                    const isSelected = selectedVolunteerId === vol._id;
                    return (
                      <div
                        key={vol._id}
                        onClick={() => setSelectedVolunteerId(vol._id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                          isSelected
                            ? "bg-blue-50 border-blue-400 ring-2 ring-blue-500/20"
                            : "bg-gray-50/70 border-black/[0.06] hover:bg-gray-100/70"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                              index === 0 ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"
                            }`}
                          >
                            {vol.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-gray-900">{vol.name}</p>
                              {index === 0 && vol.distanceKm !== null && (
                                <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase">
                                  Closest
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 truncate max-w-[200px]">
                              {vol.skills?.slice(0, 2).join(", ") || "General Aid"} • {vol.availability}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          {vol.distanceKm !== null ? (
                            <>
                              <p className="text-xs font-bold text-blue-900">{formatDistance(vol.distanceKm)}</p>
                              <p className="text-[10px] text-gray-500">~{vol.etaMinutes || 5} mins ETA</p>
                            </>
                          ) : (
                            <span className="text-[10px] text-gray-400">Standby</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Or Allocate Dedicated Squad / Unit Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. NDRF Marine Unit 4 / Fire Station Sector 12"
                  value={assignedTeamInput}
                  onChange={(e) => setAssignedTeamInput(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 border border-black/[0.08] rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAssigningReport(null)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={assignSubmitting}
                  className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {assignSubmitting ? "Dispatching..." : "Confirm Dispatch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          EMERGENCY DETAILS MODAL (WITH COMPLETE AI DOSSIER)
          ===================================================== */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-black/[0.08] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaMagic className="text-purple-600" />
                  <span>AI Disaster Intelligence Briefing</span>
                </h2>
                <p className="text-xs text-gray-500">
                  Reference ID: <span className="font-mono font-semibold">{selectedReport._id}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-700 text-lg"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* AI TACTICAL EXECUTIVE SUMMARY BANNER */}
              {aiLoading ? (
                <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200/80 text-center animate-pulse">
                  <span className="text-xs text-purple-700 font-semibold">
                    🤖 AI Synthesizing Crisis Intelligence Briefing...
                  </span>
                </div>
              ) : aiIntelligence ? (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/80 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <FaRobot className="text-purple-600 text-sm" />
                      <span>Executive Tactical Intelligence Summary</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold text-[10px]">
                      AI Verified
                    </span>
                  </div>

                  <p className="text-gray-800 leading-relaxed font-medium">
                    {aiIntelligence.executiveSummary}
                  </p>

                  {/* Hazard Extraction Tags */}
                  <div className="pt-1">
                    <span className="text-gray-500 font-semibold block mb-1">Identified Hazards & Threats:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiIntelligence.riskAssessment.hazards.map((h, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-900 font-bold text-[11px] shadow-2xs"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Tactical Gear */}
                  <div className="pt-1 flex items-center gap-2 flex-wrap text-[11px]">
                    <span className="text-purple-900 font-bold">Recommended Gear:</span>
                    {aiIntelligence.riskAssessment.recommendedGear.map((g, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-purple-200/70 text-purple-800 font-semibold">
                        {g}
                      </span>
                    ))}
                  </div>

                  {/* Duplicate Alert if detected */}
                  {aiIntelligence.duplicateMatches.length > 0 && (
                    <div className="mt-2 p-3 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-900 text-xs">
                      <span className="font-bold flex items-center gap-1">
                        <FaExclamationTriangle className="text-amber-700" />
                        <span>Potential Duplicate Crisis Detected ({aiIntelligence.duplicateMatches[0].similarityScore}% Match):</span>
                      </span>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Matches Report #{aiIntelligence.duplicateMatches[0].reportId.slice(-6)} at{" "}
                        {aiIntelligence.duplicateMatches[0].location}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Photo Evidence if Present */}
              {selectedReport.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-black/[0.08] shadow-sm">
                  <div className="bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 border-b border-black/[0.06]">
                    📸 Citizen Uploaded Disaster Incident Photo
                  </div>
                  <img
                    src={getFullImageUrl(selectedReport.imageUrl)}
                    alt="Disaster Scene"
                    className="w-full max-h-72 object-cover"
                  />
                </div>
              )}

              {/* Grid Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-gray-50 rounded-2xl">
                  <span className="text-gray-400 font-medium">Citizen Name</span>
                  <p className="font-bold text-gray-900 mt-1">{selectedReport.fullName}</p>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-2xl">
                  <span className="text-gray-400 font-medium">Contact Phone</span>
                  <p className="font-bold text-gray-900 mt-1">{selectedReport.phoneNumber}</p>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-2xl">
                  <span className="text-gray-400 font-medium">Emergency Contact</span>
                  <p className="font-bold text-gray-900 mt-1">{selectedReport.emergencyContact}</p>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-2xl">
                  <span className="text-gray-400 font-medium">People Affected</span>
                  <p className="font-bold text-gray-900 mt-1">{selectedReport.peopleAffected} persons</p>
                </div>
              </div>

              {/* Location */}
              <div className="p-3.5 bg-gray-50 rounded-2xl text-xs">
                <span className="text-gray-400 font-medium">Location Address</span>
                <p className="font-bold text-gray-900 mt-1">{selectedReport.location}</p>
                {selectedReport.latitude && selectedReport.longitude && (
                  <p className="font-mono text-gray-500 mt-1">
                    Coordinates: {selectedReport.latitude.toFixed(5)}, {selectedReport.longitude.toFixed(5)}
                  </p>
                )}
              </div>

              {/* Assigned Responder Bar */}
              <div className="p-4 bg-blue-50/70 border border-blue-200/60 rounded-2xl text-xs flex items-center justify-between">
                <div>
                  <span className="text-blue-600 font-medium">Assigned Team / Responder:</span>
                  <p className="font-bold text-blue-950 mt-0.5">
                    {selectedReport.assignedVolunteerName || selectedReport.assignedTeam || "No responder assigned yet"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    openAssignmentModal(selectedReport);
                    setSelectedReport(null);
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  Dispatch Responder
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2.5 rounded-2xl bg-gray-900 hover:bg-black text-white text-xs font-semibold transition"
              >
                Close Briefing
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="py-6 text-center text-xs text-gray-400">
        © 2026 ResQNet. Professional Disaster Coordination Platform.
      </footer>
    </div>
  );
}

export default Dashboard;