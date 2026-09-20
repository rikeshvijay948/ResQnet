import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Report } from "../../types";
import { apiGetReports } from "../../services/api";
import { FaExclamationTriangle, FaArrowRight, FaTimes } from "react-icons/fa";

export const CriticalAlertBanner: React.FC = () => {
  const [criticalReports, setCriticalReports] = useState<Report[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCritical = async () => {
      try {
        const data = await apiGetReports();
        if (data.success && data.reports) {
          const activeCritical = data.reports.filter(
            (r) =>
              (r.severity?.toLowerCase() === "critical" || (r.priorityScore && r.priorityScore >= 75)) &&
              r.status !== "Resolved"
          );
          setCriticalReports(activeCritical);
        }
      } catch (err) {
        // Silently fail if server unreachable
      }
    };

    fetchCritical();
    const interval = setInterval(fetchCritical, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  if (dismissed || criticalReports.length === 0) return null;

  const topReport = criticalReports[0];

  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 py-2.5 shadow-md relative z-40 animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5 truncate">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>

          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-md shrink-0">
            <FaExclamationTriangle className="text-amber-300" />
            <span>Critical Emergency Alert</span>
          </div>

          <span className="truncate font-medium">
            <strong className="font-bold">{topReport.disasterType}</strong> at {topReport.location} (~{topReport.peopleAffected} persons impacted)
            {criticalReports.length > 1 && (
              <span className="ml-1.5 opacity-80">
                (+{criticalReports.length - 1} more active critical incidents)
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate(`/dashboard`)}
            className="px-3 py-1 bg-white text-red-700 font-bold rounded-lg hover:bg-white/90 active:scale-95 transition flex items-center gap-1.5 shadow-xs"
          >
            <span>Coordinate Response</span>
            <FaArrowRight className="text-[10px]" />
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-white/80 hover:text-white transition rounded-md"
            title="Dismiss alert"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CriticalAlertBanner;
