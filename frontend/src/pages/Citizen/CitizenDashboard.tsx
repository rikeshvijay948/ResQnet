import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar/Navbar";
import {
  FaPlusCircle,
  FaSearchLocation,
  FaPhoneAlt,
  FaCheckCircle,
  FaSyncAlt,
  FaMapMarkerAlt,
  FaUserShield,
  FaExclamationTriangle,
  FaAmbulance,
  FaFireExtinguisher,
  FaImage,
} from "react-icons/fa";
import type { Report } from "../../types";
import { apiGetMyReports, getFullImageUrl } from "../../services/api";
import BatterySentinelBadge from "../../components/Common/BatterySentinelBadge";

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const data = await apiGetMyReports();
      if (data.success) {
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error("Error fetching citizen reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1">
        {/* WELCOME BANNER */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-black/[0.06] mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200/60">
                <span>Citizen SafeZone Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Welcome, {user?.name || "Citizen"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Monitor your reported emergencies, response team updates, and access national disaster hotlines.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <BatterySentinelBadge />
              <Link
                to="/report-emergency"
                className="py-3 px-5 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-red-500/20 transition flex items-center gap-2"
              >
                <FaPlusCircle />
                <span>Report Emergency</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLS: MY REPORTED EMERGENCIES */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-black/[0.06]">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    My Reported Incidents
                  </h2>
                  <p className="text-xs text-gray-500">
                    Real-time status updates on incidents you have submitted.
                  </p>
                </div>

                <button
                  onClick={fetchMyReports}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <FaSyncAlt className={`text-xs ${loading ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs text-gray-500">Loading your reports...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-black/[0.04] p-6">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                    <FaCheckCircle className="text-xl" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">
                    No Emergencies Reported
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                    You have not logged any emergency reports yet.
                  </p>
                  <Link
                    to="/report-emergency"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition"
                  >
                    <FaPlusCircle />
                    <span>Create Emergency Report</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report._id}
                      className="p-5 rounded-2xl bg-white border border-black/[0.08] shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-gray-900">
                              {report.disasterType} Incident
                            </h3>

                            {report.priorityScore !== undefined && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white shadow-2xs">
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
                              {report.status}
                            </span>
                          </div>

                          <p className="text-xs text-gray-400 mt-1">
                            Logged: {new Date(report.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <button
                          onClick={() => navigate(`/track/${report._id}`)}
                          className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          <FaSearchLocation />
                          <span>Track Live</span>
                        </button>
                      </div>

                      {report.imageUrl && (
                        <div className="mt-3 flex items-center gap-2">
                          <img
                            src={getFullImageUrl(report.imageUrl)}
                            alt="Incident Evidence"
                            className="w-12 h-12 rounded-lg object-cover border border-black/[0.06]"
                          />
                          <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                            <FaImage className="text-blue-600" />
                            <span>Photo Evidence Attached</span>
                          </span>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-1 truncate max-w-[70%]">
                          <FaMapMarkerAlt className="text-red-500 shrink-0" />
                          <span className="truncate">{report.location}</span>
                        </div>

                        {report.assignedVolunteerName ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <FaUserShield />
                            <span>Responder: {report.assignedVolunteerName}</span>
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium">
                            Awaiting Dispatch
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 1 COL: EMERGENCY DIRECTORY */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-black/[0.06]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                <FaPhoneAlt className="text-blue-600" />
                <span>Immediate Emergency Hotlines</span>
              </h3>

              <div className="space-y-3">
                <a
                  href="tel:112"
                  className="p-3.5 rounded-2xl bg-red-50/80 border border-red-200/60 hover:bg-red-100 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      <FaExclamationTriangle />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">National Disaster Helpline</p>
                      <p className="text-[11px] text-gray-500">24/7 Universal Emergency</p>
                    </div>
                  </div>
                  <span className="text-base font-bold text-red-600 group-hover:scale-105 transition-transform">
                    112
                  </span>
                </a>

                <a
                  href="tel:108"
                  className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/60 hover:bg-blue-100 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      <FaAmbulance />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Medical Ambulance</p>
                      <p className="text-[11px] text-gray-500">Emergency Medical Response</p>
                    </div>
                  </div>
                  <span className="text-base font-bold text-blue-600 group-hover:scale-105 transition-transform">
                    108
                  </span>
                </a>

                <a
                  href="tel:101"
                  className="p-3.5 rounded-2xl bg-orange-50/80 border border-orange-200/60 hover:bg-orange-100 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      <FaFireExtinguisher />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Fire & Rescue Service</p>
                      <p className="text-[11px] text-gray-500">Hazard & Fire Containment</p>
                    </div>
                  </div>
                  <span className="text-base font-bold text-orange-600 group-hover:scale-105 transition-transform">
                    101
                  </span>
                </a>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-gray-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl">
              <h4 className="text-sm font-bold mb-2">Emergency Preparedness</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Stay indoors during severe storms. Keep clean drinking water, non-perishable food, and battery torches ready. Avoid flooded underpasses.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400">
        © 2026 ResQNet. Professional Disaster Coordination Platform.
      </footer>
    </div>
  );
};

export default CitizenDashboard;
