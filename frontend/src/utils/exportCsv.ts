import type { Report } from "../types";

/**
 * Exports an array of disaster emergency reports to a formatted CSV file and triggers download.
 */
export function exportIncidentsToCSV(
  reports: Report[],
  filename: string = `resqnet-incident-report-${new Date().toISOString().slice(0, 10)}.csv`
) {
  if (!reports || reports.length === 0) {
    alert("No incident records available to export.");
    return;
  }

  const headers = [
    "Incident ID",
    "Timestamp",
    "Reporter Name",
    "Phone Number",
    "Emergency Contact",
    "Disaster Type",
    "Severity Level",
    "Priority Score",
    "Priority Rank",
    "Status",
    "Location",
    "Latitude",
    "Longitude",
    "People Affected",
    "Assigned Responder / Team",
    "Description",
  ];

  const escapeCSV = (field: any): string => {
    if (field === null || field === undefined) return '""';
    const stringField = String(field).replace(/"/g, '""');
    return `"${stringField}"`;
  };

  const rows = reports.map((r) => [
    escapeCSV(r._id),
    escapeCSV(new Date(r.createdAt).toLocaleString()),
    escapeCSV(r.fullName),
    escapeCSV(r.phoneNumber),
    escapeCSV(r.emergencyContact),
    escapeCSV(r.disasterType),
    escapeCSV(r.severity),
    escapeCSV(r.priorityScore ?? "N/A"),
    escapeCSV(r.priorityRank ?? "N/A"),
    escapeCSV(r.status),
    escapeCSV(r.location),
    escapeCSV(r.latitude ?? ""),
    escapeCSV(r.longitude ?? ""),
    escapeCSV(r.peopleAffected),
    escapeCSV(r.assignedVolunteerName || r.assignedTeam || "Unassigned"),
    escapeCSV(r.description),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
