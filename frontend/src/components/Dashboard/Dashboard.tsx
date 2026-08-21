import { useEffect, useState } from "react";
import EmergencyMap from "./EmergencyMap";

interface Report {
  _id: string;
  fullName: string;
  phoneNumber: string;
  emergencyContact: string;
  location: string;
  disasterType: string;
  severity: string;
  peopleAffected: number;
  description: string;
  createdAt: string;

  status?: string;
  assignedTeam?: string;
}
function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedReport, setSelectedReport] =
    useState<Report | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [disasterFilter, setDisasterFilter] = useState("All");

  // ================= STATUS UPDATE =================

  const updateStatus = async (
    reportId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(
        `http://localhost:5000/reports/${reportId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        alert("❌ Failed to update status");
        return;
      }

      setReports((currentReports) =>
        currentReports.map((report) =>
          report._id === reportId
            ? {
                ...report,
                status: newStatus,
              }
            : report
        )
      );

      setSelectedReport((currentReport) =>
        currentReport &&
        currentReport._id === reportId
          ? {
              ...currentReport,
              status: newStatus,
            }
          : currentReport
      );

      console.log(
        `✅ Status updated to ${newStatus}`
      );
    } catch (error) {
      console.error(
        "❌ Status update error:",
        error
      );

      alert("❌ Could not connect to the server");
    }
  };

  // ================= FETCH REPORTS =================

  useEffect(() => {
    fetch("http://localhost:5000/reports")
      .then((response) => response.json())
      .then((data) => {
      if (data.success) {
 console.log(
  "REPORT LOCATIONS:",
  data.reports.map((report: any) => ({
    name: report.fullName,
    disaster: report.disasterType,
    severity: report.severity,
    latitude: report.latitude,
    longitude: report.longitude,
  }))
);
  setReports(data.reports);
}
      })
      .catch((error) => {
        console.error("Error fetching reports:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ================= STATISTICS =================

  const criticalCount = reports.filter(
    (report) =>
      report.severity?.toLowerCase() === "critical"
  ).length;

  const highCount = reports.filter(
    (report) =>
      report.severity?.toLowerCase() === "high"
  ).length;

  const mediumCount = reports.filter(
    (report) =>
      report.severity?.toLowerCase() === "medium"
  ).length;

  // ================= SEARCH + FILTER =================

  const filteredReports = reports.filter((report) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      report.fullName?.toLowerCase().includes(search) ||
      report.location?.toLowerCase().includes(search) ||
      report.disasterType?.toLowerCase().includes(search);

    const matchesSeverity =
      severityFilter === "All" ||
      report.severity?.toLowerCase() ===
        severityFilter.toLowerCase();

    const matchesDisaster =
      disasterFilter === "All" ||
      report.disasterType?.toLowerCase() ===
        disasterFilter.toLowerCase();

    return (
      matchesSearch &&
      matchesSeverity &&
      matchesDisaster
    );
  });

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🚨</div>

          <p className="text-xl font-semibold text-gray-700">
            Loading ResQNet...
          </p>

          <p className="text-gray-500 mt-2">
            Connecting to emergency monitoring system
          </p>
        </div>
      </div>
    );
  }

  // ================= MAIN =================

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ================= HEADER ================= */}

      <header className="bg-blue-700 text-white px-6 md:px-8 py-5 shadow-lg">

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-3">

          <div>
            <h1 className="text-2xl font-bold">
              🚨 ResQNet Emergency Dashboard
            </h1>

            <p className="text-blue-100 text-sm mt-1">
              Disaster response and emergency monitoring
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>

            <span>
              Live Emergency Monitoring
            </span>
          </div>

        </div>

      </header>

      {/* ================= MAIN CONTENT ================= */}

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">

        {/* ================= STATISTICS ================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {/* TOTAL */}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">

            <p className="text-gray-500 text-sm">
              Total Reports
            </p>

            <h2 className="text-4xl font-bold text-gray-800 mt-2">
              {reports.length}
            </h2>

            <p className="text-xs text-gray-400 mt-2">
              All emergency incidents
            </p>

          </div>

          {/* CRITICAL */}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">

            <p className="text-gray-500 text-sm">
              Critical
            </p>

            <h2 className="text-4xl font-bold text-red-600 mt-2">
              {criticalCount}
            </h2>

            <p className="text-xs text-red-400 mt-2">
              Immediate attention required
            </p>

          </div>

          {/* HIGH */}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">

            <p className="text-gray-500 text-sm">
              High
            </p>

            <h2 className="text-4xl font-bold text-orange-500 mt-2">
              {highCount}
            </h2>

            <p className="text-xs text-orange-400 mt-2">
              High priority incidents
            </p>

          </div>

          {/* MEDIUM */}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">

            <p className="text-gray-500 text-sm">
              Medium
            </p>

            <h2 className="text-4xl font-bold text-yellow-500 mt-2">
              {mediumCount}
            </h2>

            <p className="text-xs text-yellow-500 mt-2">
              Requires monitoring
            </p>

          </div>

        </div>

        {/* ================= LIVE EMERGENCY MAP ================= */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">

          <div className="mb-5">

            <h2 className="text-2xl font-bold text-gray-800">
              🗺️ Live Emergency Map
            </h2>

            <p className="text-gray-500 mt-1">
              Monitor emergency locations and reported
              incidents.
            </p>

          </div>

         <div className="rounded-xl overflow-hidden border border-gray-200">
  <EmergencyMap reports={reports} />
</div>
        </div>

        {/* ================= REPORTS ================= */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">

          {/* REPORT HEADER */}

          <div className="px-6 py-6 border-b border-gray-200">

            <h2 className="text-xl font-bold text-gray-800">
              Emergency Reports
            </h2>

            <p className="text-gray-500 mt-1">
              Reports received from citizens
            </p>

            {/* ================= SEARCH + FILTERS ================= */}

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* SEARCH */}

              <input
                type="text"
                placeholder="🔎 Search by name, location or disaster..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* SEVERITY */}

              <select
                value={severityFilter}
                onChange={(e) =>
                  setSeverityFilter(e.target.value)
                }
                className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >

                <option value="All">
                  All Severities
                </option>

                <option value="Critical">
                  Critical
                </option>

                <option value="High">
                  High
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="Low">
                  Low
                </option>

              </select>

              {/* DISASTER */}

              <select
                value={disasterFilter}
                onChange={(e) =>
                  setDisasterFilter(e.target.value)
                }
                className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >

                <option value="All">
                  All Disaster Types
                </option>

                <option value="Fire">
                  Fire
                </option>

                <option value="Flood">
                  Flood
                </option>

                <option value="Earthquake">
                  Earthquake
                </option>

                <option value="Cyclone">
                  Cyclone
                </option>

                <option value="Landslide">
                  Landslide
                </option>

              </select>

            </div>

            {/* RESULT COUNT */}

            <p className="text-sm text-gray-500 mt-4">
              Showing{" "}
              <span className="font-semibold">
                {filteredReports.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold">
                {reports.length}
              </span>{" "}
              reports
            </p>

          </div>

          {/* ================= REPORT LIST ================= */}

          <div className="p-6">

            {filteredReports.length === 0 ? (

              <div className="text-center py-12">

                <p className="text-5xl mb-4">
                  🔍
                </p>

                <p className="text-gray-500">
                  No reports match your search or filters.
                </p>

              </div>

            ) : (

              <div className="space-y-5">

                {filteredReports.map((report) => (

                  <div
                    key={report._id}
                    className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition bg-white"
                  >

                    {/* REPORT HEADER */}

                    <div className="flex justify-between items-start gap-4">

                      <div>

                        <h3 className="text-lg font-bold text-gray-800">

                          {report.disasterType === "Fire" &&
                            "🔥 "}

                          {report.disasterType === "Flood" &&
                            "🌊 "}

                          {report.disasterType === "Earthquake" &&
                            "🌍 "}

                          {report.disasterType === "Cyclone" &&
                            "🌪️ "}

                          {report.disasterType === "Landslide" &&
                            "⛰️ "}

                          {report.disasterType}

                        </h3>

                        <p className="text-gray-500 mt-1">
                          Reported by:{" "}
                          <span className="font-medium">
                            {report.fullName}
                          </span>
                        </p>

                      </div>

                      {/* SEVERITY */}

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          report.severity?.toLowerCase() ===
                          "critical"
                            ? "bg-red-100 text-red-700"
                            : report.severity?.toLowerCase() ===
                              "high"
                            ? "bg-orange-100 text-orange-700"
                            : report.severity?.toLowerCase() ===
                              "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {report.severity}
                      </span>

                    </div>

                    {/* BASIC INFORMATION */}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

                      {/* PEOPLE */}

                      <div className="bg-gray-50 rounded-xl p-4">

                        <p className="text-sm text-gray-500">
                          People Affected
                        </p>

                        <p className="font-bold text-gray-800 mt-1">
                          {report.peopleAffected}
                        </p>

                      </div>

                      {/* LOCATION */}

                      <div className="bg-gray-50 rounded-xl p-4">

                        <p className="text-sm text-gray-500">
                          Location
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          {report.location ||
                            "Not provided"}
                        </p>

                      </div>

                      {/* TIME */}

                      <div className="bg-gray-50 rounded-xl p-4">

                        <p className="text-sm text-gray-500">
                          Report Time
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          {new Date(
                            report.createdAt
                          ).toLocaleString()}
                        </p>

                      </div>

                    </div>

                    {/* DESCRIPTION */}

                    {report.description && (

                      <div className="mt-4">

                        <p className="text-sm text-gray-500">
                          Description
                        </p>

                        <p className="text-gray-700 mt-1">
                          {report.description}
                        </p>

                      </div>

                    )}

                  {/* ACTIONS */}

<div className="mt-5 flex flex-wrap gap-3">

  {/* VIEW DETAILS */}

  <button
    onClick={() => setSelectedReport(report)}
    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition"
  >
    View Details
  </button>

  {/* STATUS */}

  <select
    value={report.status || "Reported"}
    onChange={(e) =>
      updateStatus(report._id, e.target.value)
    }
    className="border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="Reported">
      🟠 Reported
    </option>

    <option value="Assigned">
      🔵 Assigned
    </option>

    <option value="In Progress">
      🟡 In Progress
    </option>

    <option value="Resolved">
      🟢 Resolved
    </option>
  </select>

</div>
                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      </main>

      {/* =====================================================
          EMERGENCY DETAILS POPUP
          ===================================================== */}

      {selectedReport && (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* POPUP HEADER */}

            <div className="flex justify-between items-center px-6 py-5 border-b">

              <div>

                <h2 className="text-2xl font-bold text-gray-800">
                  🚨 Emergency Details
                </h2>

                <p className="text-gray-500 mt-1">
                  Complete emergency report information
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedReport(null)
                }
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ✕
              </button>

            </div>

            {/* POPUP CONTENT */}

            <div className="p-6">

              {/* DISASTER + SEVERITY */}

              <div className="flex justify-between items-center mb-6">

                <h3 className="text-2xl font-bold text-gray-800">

                  {selectedReport.disasterType === "Fire" &&
                    "🔥 "}

                  {selectedReport.disasterType === "Flood" &&
                    "🌊 "}

                  {selectedReport.disasterType ===
                    "Earthquake" &&
                    "🌍 "}

                  {selectedReport.disasterType ===
                    "Cyclone" &&
                    "🌪️ "}

                  {selectedReport.disasterType ===
                    "Landslide" &&
                    "⛰️ "}

                  {selectedReport.disasterType}

                </h3>

                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold ${
                    selectedReport.severity?.toLowerCase() ===
                    "critical"
                      ? "bg-red-100 text-red-700"
                      : selectedReport.severity?.toLowerCase() ===
                        "high"
                      ? "bg-orange-100 text-orange-700"
                      : selectedReport.severity?.toLowerCase() ===
                        "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {selectedReport.severity}
                </span>

              </div>

              {/* DETAILS GRID */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="bg-gray-50 rounded-xl p-4">

                  <p className="text-sm text-gray-500">
                    Reported By
                  </p>

                  <p className="font-semibold mt-1">
                    {selectedReport.fullName}
                  </p>

                </div>

                <div className="bg-gray-50 rounded-xl p-4">

                  <p className="text-sm text-gray-500">
                    Phone Number
                  </p>

                  <p className="font-semibold mt-1">
                    {selectedReport.phoneNumber}
                  </p>

                </div>

                <div className="bg-gray-50 rounded-xl p-4">

                  <p className="text-sm text-gray-500">
                    Emergency Contact
                  </p>

                  <p className="font-semibold mt-1">
                    {selectedReport.emergencyContact}
                  </p>

                </div>

                <div className="bg-gray-50 rounded-xl p-4">

                  <p className="text-sm text-gray-500">
                    Location
                  </p>

                  <p className="font-semibold mt-1">
                    {selectedReport.location ||
                      "Not provided"}
                  </p>

                </div>

                <div className="bg-gray-50 rounded-xl p-4">

                  <p className="text-sm text-gray-500">
                    People Affected
                  </p>

                  <p className="font-semibold mt-1">
                    {selectedReport.peopleAffected}
                  </p>

                </div>

                <div className="bg-gray-50 rounded-xl p-4">

                  <p className="text-sm text-gray-500">
                    Report Time
                  </p>

                  <p className="font-semibold mt-1">
                    {new Date(
                      selectedReport.createdAt
                    ).toLocaleString()}
                  </p>

                </div>

              </div>

              {/* DESCRIPTION */}

              <div className="mt-6">

                <p className="text-sm text-gray-500">
                  Description
                </p>

                <div className="bg-gray-50 rounded-xl p-4 mt-2">

                  <p className="text-gray-700">
                    {selectedReport.description ||
                      "No description provided."}
                  </p>

                </div>

              </div>

              {/* CLOSE */}

              <div className="flex justify-end mt-6">

                <button
                  onClick={() =>
                    setSelectedReport(null)
                  }
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2.5 rounded-xl font-medium"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Dashboard;