
import type {
  AIClassifyResponse,
  AIIntelligenceResponse,
  AnalyticsResponse,
  AuthResponse,
  FacilitiesResponse,
  Facility,
  NearbyRespondersResponse,
  NotificationsResponse,
  Report,
  ReportsResponse,
  Resource,
  ResourcesResponse,
  SingleReportResponse,
  User,
  VolunteersResponse,
} from "../types";

// Production uses VITE_API_URL from Vercel.
// Local development falls back to localhost:5000.
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export const getAuthToken = (): string | null => {
  return localStorage.getItem("resqnet_token");
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem("resqnet_token", token);
  } else {
    localStorage.removeItem("resqnet_token");
  }
};

export const getFullImageUrl = (path?: string): string => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const getHeaders = (includeAuth = true): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

// Shared request helper.
// Keeps existing endpoints and returns parsed JSON.
const request = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw new Error(
      `Cannot connect to the ResQNet backend at ${API_BASE_URL}. Check the backend deployment and VITE_API_URL.`
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(data.message)
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
};

// AUTH APIS

export const apiLogin = (
  email: string,
  password: string
): Promise<AuthResponse> =>
  request("/api/auth/login", {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify({ email, password }),
  });

export const apiRegister = (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  skills?: string[];
}): Promise<AuthResponse> =>
  request("/api/auth/register", {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify(data),
  });

export const apiGetMe = (): Promise<AuthResponse> =>
  request("/api/auth/me", { headers: getHeaders() });

// FILE UPLOAD

export const apiUploadImage = async (
  file: File
): Promise<{ success: boolean; url?: string; message?: string }> => {
  const formData = new FormData();
  formData.append("file", file);

  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  return request("/api/upload", {
    method: "POST",
    headers,
    body: formData,
  });
};

// NOTIFICATIONS

export const apiGetNotifications = (): Promise<NotificationsResponse> =>
  request("/api/notifications", { headers: getHeaders() });

export const apiMarkNotificationRead = (
  id: string
): Promise<{ success: boolean }> =>
  request(`/api/notifications/${id}/read`, {
    method: "PUT",
    headers: getHeaders(),
  });

export const apiMarkAllNotificationsRead = (): Promise<{
  success: boolean;
}> =>
  request("/api/notifications/read-all", {
    method: "PUT",
    headers: getHeaders(),
  });

// EMERGENCY REPORTS

export const apiGetReports = (): Promise<ReportsResponse> =>
  request("/reports");

export const apiGetReportById = (id: string): Promise<SingleReportResponse> =>
  request(`/reports/${id}`);

export const apiGetMyReports = (): Promise<ReportsResponse> =>
  request("/reports/my", { headers: getHeaders() });

export const apiGetAssignedReports = (): Promise<ReportsResponse> =>
  request("/reports/assigned", { headers: getHeaders() });

export const apiCreateReport = (
  reportData: Partial<Report>
): Promise<SingleReportResponse> =>
  request("/report", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(reportData),
  });

export const apiUpdateReportStatus = (
  reportId: string,
  status: string
): Promise<SingleReportResponse> =>
  request(`/reports/${reportId}/status`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });

export const apiAssignReport = (
  reportId: string,
  volunteerId: string,
  assignedTeam?: string
): Promise<SingleReportResponse> =>
  request(`/reports/${reportId}/assign`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ volunteerId, assignedTeam }),
  });

// VOLUNTEERS & RESPONDERS

export const apiGetVolunteers = (): Promise<VolunteersResponse> =>
  request("/api/volunteers", { headers: getHeaders() });

export const apiGetNearbyResponders = (
  reportId: string
): Promise<NearbyRespondersResponse> =>
  request(`/reports/${reportId}/nearby-responders`);

export const apiUpdateVolunteerAvailability = (
  availability: string,
  currentLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  }
): Promise<{ success: boolean; user: User }> =>
  request("/api/volunteers/availability", {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ availability, currentLocation }),
  });

// ANALYTICS

export const apiGetAnalytics = (): Promise<AnalyticsResponse> =>
  request("/api/analytics");

// RESOURCE LOGISTICS

export const apiGetResources = (): Promise<ResourcesResponse> =>
  request("/api/resources");

export const apiAddResource = (
  data: Partial<Resource>
): Promise<{ success: boolean; resource?: Resource; message?: string }> =>
  request("/api/resources", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

export const apiAllocateResource = (
  resourceId: string,
  data: {
    reportId?: string;
    incidentName?: string;
    amount: number;
    notes?: string;
  }
): Promise<{ success: boolean; resource?: Resource; message?: string }> =>
  request(`/api/resources/${resourceId}/allocate`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

// FACILITIES & SHELTERS

export const apiGetFacilities = (): Promise<FacilitiesResponse> =>
  request("/api/facilities");

export const apiAddFacility = (
  data: Partial<Facility>
): Promise<{ success: boolean; facility?: Facility; message?: string }> =>
  request("/api/facilities", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

// AI INTELLIGENCE

export const apiAIClassifyText = (
  text: string,
  peopleAffected?: number
): Promise<AIClassifyResponse> =>
  request("/api/ai/classify", {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify({ text, peopleAffected }),
  });

export const apiGetReportAIIntelligence = (
  reportId: string
): Promise<AIIntelligenceResponse> =>
  request(`/reports/${reportId}/ai-intelligence`, {
    headers: getHeaders(),
  });
