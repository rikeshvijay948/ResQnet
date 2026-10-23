import type { Report } from "../types";

/**
 * Generates an official, print-formatted tactical emergency incident sheet
 * designed for physical handover to NDRF, police, ambulance EMS, or command posts.
 */
export function printTacticalDossier(report: Report): void {
  const printWindow = window.open("", "_blank", "width=850,height=950");
  if (!printWindow) {
    alert("Please allow popups to generate the printable tactical dossier.");
    return;
  }

  const createdDate = report.createdAt
    ? new Date(report.createdAt).toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "medium",
      })
    : "Timestamp Recorded";

  const priorityBadgeColor =
    report.severity?.toLowerCase() === "critical"
      ? "#dc2626"
      : report.severity?.toLowerCase() === "high"
      ? "#ea580c"
      : "#ca8a04";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Tactical Incident Dossier - ${report._id}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.45;
      font-size: 13px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #111827;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .brand h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #1d4ed8;
    }
    .brand p {
      margin: 2px 0 0 0;
      font-size: 11px;
      color: #4b5563;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-box {
      text-align: right;
    }
    .priority-badge {
      display: inline-block;
      background: ${priorityBadgeColor};
      color: #ffffff;
      font-weight: 800;
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .id-code {
      font-family: monospace;
      font-weight: 700;
      font-size: 13px;
      margin-top: 4px;
      color: #111827;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }
    .card {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 10px 14px;
      background: #f9fafb;
    }
    .card-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .card-value {
      font-size: 14px;
      font-weight: 700;
      color: #111827;
    }
    .card-sub {
      font-size: 11px;
      color: #4b5563;
      margin-top: 2px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
      margin: 16px 0 8px 0;
      color: #374151;
    }
    .description-box {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
      background: #ffffff;
      font-size: 12px;
      color: #1f2937;
      white-space: pre-wrap;
      min-height: 50px;
    }
    .checklist-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 11px;
    }
    .checklist-table th, .checklist-table td {
      border: 1px solid #d1d5db;
      padding: 6px 8px;
      text-align: left;
    }
    .checklist-table th {
      background: #f3f4f6;
      font-weight: 700;
    }
    .footer {
      margin-top: 24px;
      border-top: 1px dashed #9ca3af;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #6b7280;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 16px; text-align: right;">
    <button onclick="window.print()" style="padding: 8px 16px; background: #2563eb; color: #fff; font-weight: bold; border: none; border-radius: 6px; cursor: pointer;">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <div class="header">
    <div class="brand">
      <h1>ResQNet Tactical Incident Dossier</h1>
      <p>National Emergency Triage & Field Rescue Dispatch Network</p>
    </div>
    <div class="meta-box">
      <span class="priority-badge">${report.priorityRank || report.severity || "P2"} • ${report.severity || "Standard"} Priority</span>
      <div class="id-code">REF: ${report._id}</div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Disaster Classification</div>
      <div class="card-value">${report.disasterType} Incident</div>
      <div class="card-sub">Estimated Casualties: <strong>${report.peopleAffected || 1} people</strong></div>
    </div>

    <div class="card">
      <div class="card-title">Operational Status</div>
      <div class="card-value">${report.status || "Reported"}</div>
      <div class="card-sub">Assigned Unit: <strong>${report.assignedTeam || report.assignedVolunteerName || "Immediate Dispatch Pending"}</strong></div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Reported Location & Geodata</div>
      <div class="card-value" style="font-size: 12px;">${report.location}</div>
      <div class="card-sub">Coordinates: <code>${report.latitude?.toFixed(5) || "N/A"}, ${report.longitude?.toFixed(5) || "N/A"}</code></div>
    </div>

    <div class="card">
      <div class="card-title">Citizen / Reporter Information</div>
      <div class="card-value" style="font-size: 13px;">${report.fullName}</div>
      <div class="card-sub">Primary Contact: <strong>${report.phoneNumber}</strong> | Alternate: ${report.emergencyContact || "None"}</div>
    </div>
  </div>

  <div class="section-title">Incident Description & Field Observations</div>
  <div class="description-box">
    ${report.description || "No additional text description provided."}
  </div>

  <div class="section-title">Tactical Field Handover Checklist (Physical On-Site Sign-Off)</div>
  <table class="checklist-table">
    <thead>
      <tr>
        <th style="width: 25%;">Field Check Item</th>
        <th style="width: 35%;">Status / Notes</th>
        <th style="width: 20%;">Officer In-Charge</th>
        <th style="width: 20%;">Time Completed</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Perimeter & Gas/Power Safety</strong></td>
        <td>[ ] Secure  [ ] Leaks Isolated  [ ] Hazard Active</td>
        <td>____________________</td>
        <td>____:____</td>
      </tr>
      <tr>
        <td><strong>2. Casualty Extraction / Triage</strong></td>
        <td>[ ] Immediate (Red)  [ ] Delayed (Yellow)  [ ] Minor (Green)</td>
        <td>____________________</td>
        <td>____:____</td>
      </tr>
      <tr>
        <td><strong>3. Medical Evacuation (EMS)</strong></td>
        <td>Ambulance Unit #: ________________________</td>
        <td>____________________</td>
        <td>____:____</td>
      </tr>
      <tr>
        <td><strong>4. Area Clear & Secondary Search</strong></td>
        <td>[ ] Certified Clear  [ ] Follow-up Required</td>
        <td>____________________</td>
        <td>____:____</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <div>Generated: ${createdDate} via ResQNet Emergency Platform</div>
    <div>Live Verification URL: https://resqnet.org/track/${report._id}</div>
  </div>

  <script>
    window.onload = function() {
      // Auto-trigger print dialog after render
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>
`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
