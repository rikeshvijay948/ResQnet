import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import {
  FaSearch,
  FaCheckCircle,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaUserShield,
  FaPhoneAlt,
  FaSyncAlt,
  FaInfoCircle,
  FaImage,
  FaPrint,
} from "react-icons/fa";
import type { Report } from "../types";
import { apiGetReportById, getFullImageUrl } from "../services/api";
import { printTacticalDossier } from "../utils/printReport";

const STATUS_STEPS = [
  { key: "Reported", label: "Incident Reported", desc: "Emergency received in system" },
  { key: "Assigned", label: "Responder Assigned", desc: "Rescue team dispatched" },
  { key: "In Progress", label: "Rescue In Progress", desc: "Teams operating on-site" },
  { key: "Resolved", label: "Resolved & Secured", desc: "Area and citizens secured" },
];

export const TrackEmergency: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [searchId, setSearchId] = useState(id || "");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async (reportId: string) => {
    if (!reportId.trim()) return;

    setLoading(true);
    setError("");

    try {
      const data = await apiGetReportById(reportId.trim());
      if (data.success && data.report) {
        setReport(data.report);
      } else {
        setReport(null);
        setError(data.message || "No emergency report found with this Reference ID.");
      }
    } catch (err: any) {
      setReport(null);
      setError("Unable to connect to the tracking server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      setSearchId(id);
      fetchReport(id);
    }
  }, [id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/track/${searchId.trim()}`);
      fetchReport(searchId.trim());
    }
  };

  const getStepIndex = (currentStatus?: string) => {
    if (!currentStatus) return 0;
    const status = currentStatus.toLowerCase();
    if (status === "resolved") return 3;
    if (status === "in progress" || status === "responding") return 2;
    if (status === "assigned" || status === "acknowledged") return 1;
    return 0;
  };

  const currentStep = getStepIndex(report?.status);

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-10 w-full flex-1">
        {/* Header */}
        <div className="text-center max-w-lg mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-200/60">
            <FaShieldAlt />
            <span>Live Citizen Tracking Portal</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Track Rescue Progress
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Enter your emergency reference ID to view live mission status, dynamic priority score, and assigned responders.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-xl border border-black/[0.06] mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <FaSearch className="text-sm" />
              </div>
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Paste your 24-character Reference ID (e.g. 660f...)"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50/80 border border-black/[0.08] rounded-2xl text-sm font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-gray-900 hover:bg-black active:scale-95 text-white text-sm font-semibold rounded-2xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? "Searching..." : "Track Status"}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3.5 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-xs font-medium flex items-center gap-2">
              <FaInfoCircle className="text-sm shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Report Result */}
        {report && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* TIMELINE PROGRESS CARD */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-black/[0.06]">
              <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-8">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Incident Tracking Timeline
                  </span>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-900">
                      {report.disasterType} Emergency
                    </h2>
                    {report.priorityScore && (
                      <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white shadow-2xs">
                        Priority: {report.priorityScore}/100
                      </span>
                    )}
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                        report.severity?.toLowerCase() === "critical"
                          ? "bg-red-100 text-red-700"
                          : report.severity?.toLowerCase() === "high"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {report.severity} Priority
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => printTacticalDossier(report)}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-gray-100 border border-black/[0.08] text-gray-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition active:scale-95"
                    title="Print Tactical Incident Sheet for field rescue personnel"
                  >
                    <FaPrint className="text-xs text-blue-600" />
                    <span>Print Dossier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fetchReport(report._id)}
                    disabled={loading}
                    className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <FaSyncAlt className={`text-xs ${loading ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div
                      key={step.key}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrent
                          ? "bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20"
                          : isDone
                          ? "bg-green-50/50 border-green-200"
                          : "bg-gray-50/50 border-gray-100 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isDone
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {isDone ? <FaCheckCircle className="text-xs" /> : idx + 1}
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            isCurrent
                              ? "text-blue-900"
                              : isDone
                              ? "text-green-900"
                              : "text-gray-500"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Incident Details Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-black/[0.06] space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <FaShieldAlt className="text-blue-600" />
                  <span>Incident Details</span>
                </h3>

                {/* Attached Image Evidence */}
                {report.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-black/[0.08] shadow-sm">
                    <img
                      src={getFullImageUrl(report.imageUrl)}
                      alt="Disaster Scene"
                      className="w-full h-44 object-cover"
                    />
                    <div className="bg-gray-50 px-3 py-1.5 text-[11px] text-gray-500 flex items-center gap-1.5 font-medium">
                      <FaImage className="text-blue-600" />
                      <span>Attached Incident Photo</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-2xl">
                    <span className="text-gray-400 font-medium">Reported By</span>
                    <p className="font-semibold text-gray-900 mt-1">{report.fullName}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-2xl">
                    <span className="text-gray-400 font-medium">Contact Phone</span>
                    <p className="font-semibold text-gray-900 mt-1">{report.phoneNumber}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-2xl">
                    <span className="text-gray-400 font-medium">People Affected</span>
                    <p className="font-semibold text-gray-900 mt-1">
                      {report.peopleAffected} individuals
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-2xl">
                    <span className="text-gray-400 font-medium">Logged Time</span>
                    <p className="font-semibold text-gray-900 mt-1">
                      {new Date(report.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-1">
                    <FaMapMarkerAlt className="text-red-500" />
                    <span>Location Address</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-900">{report.location}</p>
                  {report.latitude && report.longitude && (
                    <p className="text-[11px] font-mono text-gray-400 mt-1">
                      GPS: {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                    </p>
                  )}
                </div>

                {report.description && (
                  <div className="p-3.5 bg-gray-50 rounded-2xl">
                    <span className="text-xs text-gray-400 font-medium block mb-1">
                      Reported Description
                    </span>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {report.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Responder & Assistance Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-black/[0.06] space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2 mb-4">
                    <FaUserShield className="text-emerald-600" />
                    <span>Assigned Rescue Team</span>
                  </h3>

                  {report.assignedVolunteerName || report.assignedTeam ? (
                    <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            {(report.assignedVolunteerName || "R").charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {report.assignedVolunteerName || "Rescue Taskforce"}
                            </p>
                            <p className="text-xs text-blue-700 font-medium">
                              {report.assignedTeam || "Rapid Response Unit"}
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-blue-200/80 text-blue-900 text-[10px] font-bold uppercase tracking-wider">
                          Active Responder
                        </span>
                      </div>

                      {report.assignedVolunteerPhone && (
                        <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between">
                          <span className="text-xs text-gray-600">Responder Hotline:</span>
                          <a
                            href={`tel:${report.assignedVolunteerPhone}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 bg-white px-3 py-1.5 rounded-xl border border-blue-200 hover:bg-blue-50 transition"
                          >
                            <FaPhoneAlt className="text-[10px]" />
                            <span>{report.assignedVolunteerPhone}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
                        <FaShieldAlt />
                      </div>
                      <p className="text-xs font-bold text-amber-900">
                        Dispatch Coordinator Reviewing
                      </p>
                      <p className="text-[11px] text-amber-700 mt-1">
                        Responders in your sector are being notified and assigned.
                      </p>
                    </div>
                  )}
                </div>

                {/* Emergency Hotlines Box */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-black/[0.04]">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    National Emergency Hotlines
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <a
                      href="tel:112"
                      className="p-2 rounded-xl bg-white border border-black/[0.06] hover:bg-gray-100 flex items-center justify-between font-semibold text-gray-800 transition"
                    >
                      <span>Emergency Helpline</span>
                      <span className="text-red-600 font-bold">112</span>
                    </a>
                    <a
                      href="tel:108"
                      className="p-2 rounded-xl bg-white border border-black/[0.06] hover:bg-gray-100 flex items-center justify-between font-semibold text-gray-800 transition"
                    >
                      <span>Ambulance</span>
                      <span className="text-blue-600 font-bold">108</span>
                    </a>
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

export default TrackEmergency;
