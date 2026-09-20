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

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

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
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const getHeaders = (includeAuth: boolean = true) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

// ==========================================
// AUTH APIS
// ==========================================

export const apiLogin = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export const apiRegister = async (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  skills?: string[];
}): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const apiGetMe = async (): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: getHeaders(true),
  });
  return res.json();
};

// ==========================================
// FILE UPLOAD (Image / Evidence)
// ==========================================

export const apiUploadImage = async (
  file: File
): Promise<{ success: boolean; url?: string; message?: string }> => {
  const formData = new FormData();
  formData.append("file", file);

  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/api/upload`, {
    method: "POST",
    headers,
    body: formData,
  });
  return res.json();
};

// ==========================================
// NOTIFICATIONS APIS
// ==========================================

export const apiGetNotifications = async (): Promise<NotificationsResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/notifications`, {
    headers: getHeaders(true),
  });
  return res.json();
};

export const apiMarkNotificationRead = async (
  id: string
): Promise<{ success: boolean }> => {
  const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
    method: "PUT",
    headers: getHeaders(true),
  });
  return res.json();
};

export const apiMarkAllNotificationsRead = async (): Promise<{
  success: boolean;
}> => {
  const res = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
    method: "PUT",
    headers: getHeaders(true),
  });
  return res.json();
};

// ==========================================
// EMERGENCY REPORT APIS
// ==========================================

export const apiGetReports = async (): Promise<ReportsResponse> => {
  const res = await fetch(`${API_BASE_URL}/reports`);
  return res.json();
};

export const apiGetReportById = async (
  id: string
): Promise<SingleReportResponse> => {
  const res = await fetch(`${API_BASE_URL}/reports/${id}`);
  return res.json();
};

export const apiGetMyReports = async (): Promise<ReportsResponse> => {
  const res = await fetch(`${API_BASE_URL}/reports/my`, {
    headers: getHeaders(true),
  });
  return res.json();
};

export const apiGetAssignedReports = async (): Promise<ReportsResponse> => {
  const res = await fetch(`${API_BASE_URL}/reports/assigned`, {
    headers: getHeaders(true),
  });
  return res.json();
};

export const apiCreateReport = async (
  reportData: Partial<Report>
): Promise<SingleReportResponse> => {
  const res = await fetch(`${API_BASE_URL}/report`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(reportData),
  });
  return res.json();
};

export const apiUpdateReportStatus = async (
  reportId: string,
  status: string
): Promise<SingleReportResponse> => {
  const res = await fetch(`${API_BASE_URL}/reports/${reportId}/status`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify({ status }),
  });
  return res.json();
};

export const apiAssignReport = async (
  reportId: string,
  volunteerId: string,
  assignedTeam?: string
): Promise<SingleReportResponse> => {
  const res = await fetch(`${API_BASE_URL}/reports/${reportId}/assign`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify({ volunteerId, assignedTeam }),
  });
  return res.json();
};

// ===============================
// VOLUNTEER & PROXIMITY APIS
// ===============================

export const apiGetVolunteers = async (): Promise<VolunteersResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/volunteers`, {
    headers: getHeaders(true),
  });
  return res.json();
};

export const apiGetNearbyResponders = async (
  reportId: string
): Promise<NearbyRespondersResponse> => {
  const res = await fetch(
    `${API_BASE_URL}/reports/${reportId}/nearby-responders`
  );
  return res.json();
};

export const apiUpdateVolunteerAvailability = async (
  availability: string,
  currentLocation?: { latitude: number; longitude: number; address?: string }
): Promise<{ success: boolean; user: User }> => {
  const res = await fetch(`${API_BASE_URL}/api/volunteers/availability`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify({ availability, currentLocation }),
  });
  return res.json();
};

// ===============================
// PHASE 3: ANALYTICS APIS
// ===============================

export const apiGetAnalytics = async (): Promise<AnalyticsResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/analytics`);
  return res.json();
};

// ===============================
// PHASE 3: RESOURCE LOGISTICS APIS
// ===============================

export const apiGetResources = async (): Promise<ResourcesResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/resources`);
  return res.json();
};

export const apiAddResource = async (
  data: Partial<Resource>
): Promise<{ success: boolean; resource?: Resource; message?: string }> => {
  const res = await fetch(`${API_BASE_URL}/api/resources`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const apiAllocateResource = async (
  resourceId: string,
  data: { reportId?: string; incidentName?: string; amount: number; notes?: string }
): Promise<{ success: boolean; resource?: Resource; message?: string }> => {
  const res = await fetch(`${API_BASE_URL}/api/resources/${resourceId}/allocate`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  return res.json();
};

// ===============================
// PHASE 3: FACILITIES & SHELTERS APIS
// ===============================

export const apiGetFacilities = async (): Promise<FacilitiesResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/facilities`);
  return res.json();
};

export const apiAddFacility = async (
  data: Partial<Facility>
): Promise<{ success: boolean; facility?: Facility; message?: string }> => {
  const res = await fetch(`${API_BASE_URL}/api/facilities`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });
  return res.json();
};

// ===============================
// PHASE 4: AI INTELLIGENCE APIS
// ===============================

export const apiAIClassifyText = async (
  text: string,
  peopleAffected?: number
): Promise<AIClassifyResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/ai/classify`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify({ text, peopleAffected }),
  });
  return res.json();
};

export const apiGetReportAIIntelligence = async (
  reportId: string
): Promise<AIIntelligenceResponse> => {
  const res = await fetch(
    `${API_BASE_URL}/reports/${reportId}/ai-intelligence`,
    {
      headers: getHeaders(true),
    }
  );
  return res.json();
};
