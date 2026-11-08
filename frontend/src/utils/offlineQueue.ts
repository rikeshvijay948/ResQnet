/**
 * ResQNet Offline Incident Queue & Auto-Synchronization Utility
 *
 * Persists distress reports to local device storage during network blackouts
 * and automatically drains & broadcasts them to dispatch upon network restoration.
 */

const STORAGE_KEY = "resqnet_offline_reports_v1";

export interface QueuedReportPayload {
  fullName: string;
  phoneNumber: string;
  emergencyContact?: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  disasterType: string;
  severity: string;
  peopleAffected: number;
  description: string;
  userId?: string;
  imageUrl?: string;
}

export interface QueuedOfflineReport {
  id: string;
  createdAt: number;
  attempts: number;
  payload: QueuedReportPayload;
  lastError?: string;
}

/**
 * Retrieve all pending offline reports stored in localStorage
 */
export function getOfflineReports(): QueuedOfflineReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse offline reports from localStorage:", e);
    return [];
  }
}

/**
 * Store an emergency report into the offline queue
 */
export function enqueueOfflineReport(payload: QueuedReportPayload): QueuedOfflineReport {
  const reports = getOfflineReports();
  const newReport: QueuedOfflineReport = {
    id: "offline_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
    createdAt: Date.now(),
    attempts: 0,
    payload,
  };

  reports.push(newReport);
  saveOfflineReports(reports);
  notifyQueueChanged(reports.length);
  return newReport;
}

/**
 * Remove a specific report from the queue once successfully synced
 */
export function removeQueuedReport(id: string): void {
  const reports = getOfflineReports();
  const filtered = reports.filter((r) => r.id !== id);
  saveOfflineReports(filtered);
  notifyQueueChanged(filtered.length);
}

/**
 * Clear the entire offline queue
 */
export function clearOfflineQueue(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  notifyQueueChanged(0);
}

function saveOfflineReports(reports: QueuedOfflineReport[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error("Failed to save offline reports to localStorage:", e);
  }
}

function notifyQueueChanged(count: number): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("resqnet-offline-queue-changed", {
      detail: { count },
    })
  );
}

/**
 * Attempt to sync all pending offline reports with the central backend
 */
let isSyncing = false;

export async function syncQueuedReports(
  apiCreateReportFn: (data: QueuedReportPayload) => Promise<any>
): Promise<{ synced: number; failed: number }> {
  if (isSyncing) return { synced: 0, failed: 0 };
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  const reports = getOfflineReports();
  if (reports.length === 0) return { synced: 0, failed: 0 };

  isSyncing = true;
  let synced = 0;
  let failed = 0;

  const remaining: QueuedOfflineReport[] = [];

  for (const report of reports) {
    try {
      const response = await apiCreateReportFn(report.payload);
      if (response && (response.success || response.report)) {
        synced++;
      } else {
        report.attempts += 1;
        report.lastError = response?.message || "Server rejected report submission";
        failed++;
        remaining.push(report);
      }
    } catch (err: any) {
      report.attempts += 1;
      report.lastError = err?.message || "Network transmission failure";
      failed++;
      remaining.push(report);
    }
  }

  saveOfflineReports(remaining);
  notifyQueueChanged(remaining.length);

  if (synced > 0 && typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("resqnet-offline-reports-synced", {
        detail: { count: synced, remaining: remaining.length },
      })
    );
  }

  isSyncing = false;
  return { synced, failed };
}

/**
 * Set up global listener for auto-sync on browser reconnection
 */
export function setupOfflineAutoSync(
  apiCreateReportFn: (data: QueuedReportPayload) => Promise<any>
): () => void {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => {
    // Small delay to allow cellular / network connection to stabilize
    setTimeout(() => {
      syncQueuedReports(apiCreateReportFn);
    }, 1500);
  };

  window.addEventListener("online", handleOnline);

  // Initial check on load
  if (navigator.onLine && getOfflineReports().length > 0) {
    setTimeout(() => {
      syncQueuedReports(apiCreateReportFn);
    }, 2000);
  }

  return () => {
    window.removeEventListener("online", handleOnline);
  };
}
