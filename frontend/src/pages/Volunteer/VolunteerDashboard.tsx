import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar/Navbar";
import {
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUser,
  FaSyncAlt,
  FaUsers,
  FaTasks,
  FaRoute,
  FaImage,
  FaRobot,
  FaShieldAlt,
} from "react-icons/fa";
import type { AvailabilityStatus, Report } from "../../types";
import {
  apiGetAssignedReports,
  apiUpdateReportStatus,
  apiUpdateVolunteerAvailability,
  getFullImageUrl,
} from "../../services/api";
import { formatDistance, getDistanceKm, getEstimatedEtaMinutes } from "../../utils/geo";
import BatterySentinelBadge from "../../components/Common/BatterySentinelBadge";

export const VolunteerDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [assignedReports, setAssignedReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilityStatus>(
    (user?.availability as AvailabilityStatus) || "Available"
  );
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await apiGetAssignedReports();
      if (data.success) {
        setAssignedReports(data.reports || []);
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleAvailabilityChange = async (newStatus: AvailabilityStatus) => {
    setStatusUpdating(true);
    try {
      const res = await apiUpdateVolunteerAvailability(newStatus);
      if (res.success) {
        setAvailability(newStatus);
        await refreshUser();
      }
    } catch (err) {
      console.error("Error updating availability:", err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    setUpdatingId(reportId);
    try {
      const res = await apiUpdateReportStatus(reportId, newStatus);
      if (res.success) {
        setAssignedReports((prev) =>
          prev.map((rep) =>
            rep._id === reportId ? { ...rep, status: newStatus } : rep
          )
        );
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const activeReports = assignedReports.filter((r) => r.status !== "Resolved");
  const resolvedReports = assignedReports.filter((r) => r.status === "Resolved");

  const getRecommendedGear = (disasterType: string) => {
    const t = (disasterType || "").toLowerCase();
    if (t === "flood") return ["Flotation Life Vest", "Water Ropes", "Dry Suit", "Throw Bag"];
    if (t === "fire") return ["SCBA Oxygen Mask", "Fire Retardant Suit", "Thermal Blanket", "Burn Gel"];
    if (t === "earthquake") return ["Hard Hat", "Heavy Duty Gloves", "Hydraulic Stretcher", "Flashlight"];
    return ["Standard First Aid Kit", "Flashlight", "VHF Radio", "Heavy Gloves"];
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1">
        {/* TOP VOLUNTEER PROFILE CARD */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-black/[0.06] mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-blue-500/25">
                {user?.name?.charAt(0) || "V"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user?.name || "Responder"}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
                    Certified Responder
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                  <span>📧 {user?.email}</span>
                  {user?.phone && <span>📞 {user?.phone}</span>}
                  {user?.currentLocation?.address && (
                    <span>📍 Base: {user.currentLocation.address}</span>
                  )}
                </p>
                {user?.skills && user.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {user.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-[11px] font-medium border border-black/[0.04]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Duty Status Toggle */}
            <div className="bg-gray-50/80 p-3 rounded-2xl border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">
                Duty Status:
              </span>
              <div className="flex gap-1.5 p-1 bg-white rounded-xl shadow-xs border border-black/[0.04]">
                <button
                  type="button"
                  disabled={statusUpdating}
                  onClick={() => handleAvailabilityChange("Available")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    availability === "Available"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                  <span>Available</span>
                </button>

                <button
                  type="button"
                  disabled={statusUpdating}
                  onClick={() => handleAvailabilityChange("On Duty")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    availability === "On Duty"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-200"></span>
                  <span>On Duty</span>
                </button>

                <button
                  type="button"
                  disabled={statusUpdating}
                  onClick={() => handleAvailabilityChange("Offline")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    availability === "Offline"
                      ? "bg-gray-700 text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  <span>Offline</span>
                </button>
              </div>

              {/* Field Device Battery Sentinel */}
              <BatterySentinelBadge />

              {/* Tactical Compass HUD Trigger */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open-compass-modal"))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-semibold border border-cyan-200/80 transition active:scale-95 shadow-2xs"
                title="Open SAR Tactical Compass & Bearing HUD"
              >
                <span>🧭</span>
                <span>Compass</span>
              </button>
            </div>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-black/[0.06]">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Missions
            </span>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {assignedReports.length}
            </p>
            <p className="text-xs text-gray-400 mt-1">Dispatched to your unit</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-black/[0.06]">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Active Missions
            </span>
            <p className="text-3xl font-bold text-amber-600 mt-2">
              {activeReports.length}
            </p>
            <p className="text-xs text-amber-500/80 mt-1">Requires active intervention</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-black/[0.06]">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Resolved Operations
            </span>
            <p className="text-3xl font-bold text-emerald-600 mt-2">
              {resolvedReports.length}
            </p>
            <p className="text-xs text-emerald-500/80 mt-1">Citizens secured</p>
          </div>
        </div>

        {/* ASSIGNED MISSIONS LIST */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-black/[0.06]">
          <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaTasks className="text-blue-600" />
                <span>Assigned Emergency Missions</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Incidents allocated to your responder profile with AI tactical action checklists and GPS transit routes.
              </p>
            </div>

            <button
              onClick={fetchAssignments}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FaSyncAlt className={`text-xs ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-500">Loading missions...</p>
            </div>
          ) : assignedReports.length === 0 ? (
            <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-black/[0.04]">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-2xl" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No Active Missions Assigned</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                You are currently in standing reserve. Once a coordinator dispatches an incident to your profile, it will appear here immediately.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {assignedReports.map((report) => {
                const distance = getDistanceKm(
                  user?.currentLocation?.latitude,
                  user?.currentLocation?.longitude,
                  report.latitude,
                  report.longitude
                );
                const eta = getEstimatedEtaMinutes(distance);
                const gear = getRecommendedGear(report.disasterType);

                return (
                  <div
                    key={report._id}
                    className={`p-6 rounded-3xl border transition-all ${
                      report.status === "Resolved"
                        ? "bg-gray-50/70 border-gray-200 opacity-75"
                        : "bg-white border-black/[0.08] shadow-sm hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-bold text-gray-900">
                            {report.disasterType === "Fire" && "🔥 "}
                            {report.disasterType === "Flood" && "🌊 "}
                            {report.disasterType === "Earthquake" && "🌍 "}
                            {report.disasterType === "Cyclone" && "🌪️ "}
                            {report.disasterType === "Landslide" && "⛰️ "}
                            {report.disasterType} Emergency
                          </span>

                          {report.priorityScore !== undefined && (
                            <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-xs font-bold shadow-2xs">
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
                            Status: {report.status}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          Report ID: <span className="font-mono">{report._id}</span> • Logged:{" "}
                          {new Date(report.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {/* Operational Action Buttons */}
                      <div className="flex items-center gap-2">
                        {report.status !== "In Progress" && report.status !== "Resolved" && (
                          <button
                            type="button"
                            disabled={updatingId === report._id}
                            onClick={() => handleStatusChange(report._id, "In Progress")}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition"
                          >
                            {updatingId === report._id ? "Updating..." : "En Route / In Progress"}
                          </button>
                        )}

                        {report.status !== "Resolved" && (
                          <button
                            type="button"
                            disabled={updatingId === report._id}
                            onClick={() => handleStatusChange(report._id, "Resolved")}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition"
                          >
                            {updatingId === report._id ? "Updating..." : "Mark Resolved"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* AI TACTICAL ACTION BRIEFING */}
                    <div className="mt-4 p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-purple-900 flex items-center gap-1.5">
                          <FaRobot className="text-purple-600" />
                          <span>AI Responder Tactical Action Checklist</span>
                        </span>
                        <span className="text-[10px] text-purple-700 font-semibold uppercase">
                          Mission Directives
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {gear.map((item, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-800 font-semibold text-[11px] flex items-center gap-1"
                          >
                            <FaShieldAlt className="text-[10px] text-purple-500" />
                            <span>{item}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Proximity & Distance Bar */}
                    {distance !== null && (
                      <div className="mt-3 p-3 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex items-center justify-between text-xs text-blue-900">
                        <div className="flex items-center gap-2">
                          <FaRoute className="text-blue-600" />
                          <span className="font-bold">Estimated Transit:</span>
                          <span>{formatDistance(distance)}</span>
                          <span className="text-blue-700 font-semibold">(~{eta} mins ETA)</span>
                        </div>

                        {report.latitude && report.longitude && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[11px] font-bold hover:bg-blue-700 transition"
                          >
                            Open Turn-by-Turn GPS ↗
                          </a>
                        )}
                      </div>
                    )}

                    {/* Incident Grid Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-400 font-medium flex items-center gap-1">
                          <FaUser className="text-[10px]" />
                          Reporter
                        </span>
                        <p className="font-semibold text-gray-800 mt-0.5">{report.fullName}</p>
                        <a
                          href={`tel:${report.phoneNumber}`}
                          className="text-blue-600 font-semibold inline-flex items-center gap-1 mt-1 hover:underline"
                        >
                          <FaPhoneAlt className="text-[10px]" />
                          {report.phoneNumber}
                        </a>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-400 font-medium flex items-center gap-1">
                          <FaMapMarkerAlt className="text-[10px] text-red-500" />
                          Location
                        </span>
                        <p className="font-semibold text-gray-800 mt-0.5 truncate">{report.location}</p>
                        {report.latitude && report.longitude && (
                          <p className="text-[11px] font-mono text-gray-400 mt-1">
                            GPS: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                          </p>
                        )}
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-400 font-medium flex items-center gap-1">
                          <FaUsers className="text-[10px]" />
                          People Impacted
                        </span>
                        <p className="font-semibold text-gray-800 mt-0.5">
                          {report.peopleAffected} individuals
                        </p>
                        <p className="text-gray-400 text-[11px] mt-1">
                          Emergency: {report.emergencyContact}
                        </p>
                      </div>
                    </div>

                    {report.description && (
                      <div className="p-3 bg-gray-50/70 rounded-xl mt-3 text-xs text-gray-700">
                        <span className="text-gray-400 font-semibold block mb-0.5">
                          Report Description:
                        </span>
                        {report.description}
                      </div>
                    )}

                    {report.imageUrl && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-2xl flex items-center gap-3">
                        <img
                          src={getFullImageUrl(report.imageUrl)}
                          alt="Evidence"
                          className="w-14 h-14 rounded-xl object-cover border border-black/[0.06]"
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                            <FaImage className="text-blue-600" />
                            <span>Citizen Incident Photo Attached</span>
                          </p>
                          <a
                            href={getFullImageUrl(report.imageUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-blue-600 font-semibold hover:underline mt-0.5 block"
                          >
                            View Full Resolution Image ↗
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400">
        © 2026 ResQNet. Professional Disaster Coordination Platform.
      </footer>
    </div>
  );
};

export default VolunteerDashboard;
