export type UserRole = "citizen" | "volunteer" | "admin";

export type AvailabilityStatus = "Available" | "On Duty" | "Offline";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  skills?: string[];
  availability?: AvailabilityStatus;
  currentLocation?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  createdAt?: string;
}

export type DisasterType =
  | "Flood"
  | "Fire"
  | "Earthquake"
  | "Cyclone"
  | "Landslide"
  | "Other";

export type SeverityLevel = "Low" | "Medium" | "High" | "Critical";

export type EmergencyStatus =
  | "Reported"
  | "Acknowledged"
  | "Assigned"
  | "In Progress"
  | "Responding"
  | "Resolved";

export interface Report {
  _id: string;
  fullName: string;
  phoneNumber: string;
  emergencyContact: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  disasterType: string;
  severity: string;
  peopleAffected: number;
  description: string;
  status: EmergencyStatus | string;
  priorityScore?: number;
  priorityRank?: string;
  userId?: string | { _id: string; name: string; email: string };
  assignedVolunteerId?: string | User;
  assignedVolunteerName?: string;
  assignedVolunteerPhone?: string;
  assignedTeam?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Notification {
  _id: string;
  userId?: string | null;
  targetRole: "all" | "admin" | "volunteer" | "citizen";
  title: string;
  message: string;
  type: "emergency" | "assignment" | "status" | "alert" | "system";
  relatedReportId?: string | null;
  read: boolean;
  isRead?: boolean;
  createdAt: string;
}

export interface NearbyResponder extends User {
  distanceKm: number | null;
  etaMinutes: number | null;
}

export interface NearbyRespondersResponse {
  success: boolean;
  reportLocation: {
    location: string;
    latitude: number | null;
    longitude: number | null;
  };
  responders: NearbyResponder[];
}

// ==========================================
// PHASE 3: RESOURCES & LOGISTICS TYPES
// ==========================================

export type ResourceCategory =
  | "Medical"
  | "Food & Water"
  | "Rescue Equipment"
  | "Vehicles"
  | "Shelter";

export interface ResourceAllocation {
  reportId?: string;
  incidentName: string;
  allocatedAmount: number;
  allocatedAt: string;
  notes?: string;
}

export interface Resource {
  _id: string;
  name: string;
  category: ResourceCategory;
  totalQuantity: number;
  allocatedQuantity: number;
  availableQuantity: number;
  unit: string;
  location: string;
  status: "In Stock" | "Low Stock" | "Depleted";
  allocations?: ResourceAllocation[];
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// PHASE 3: FACILITIES & SHELTERS TYPES
// ==========================================

export type FacilityType =
  | "Hospital"
  | "Shelter"
  | "Relief Camp"
  | "Fire Station"
  | "Police Station";

export type FacilityStatus = "Operational" | "Full" | "Under Evacuation";

export interface Facility {
  _id: string;
  name: string;
  type: FacilityType;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number;
  availableCapacity: number;
  contactPhone?: string;
  status: FacilityStatus;
  amenities?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// PHASE 3: ANALYTICS TYPES
// ==========================================

export interface AnalyticsData {
  totalReports: number;
  activeReports: number;
  resolvedReports: number;
  resolutionRate: number;
  totalPeopleAffected: number;
  severityBreakdown: {
    Critical: number;
    High: number;
    Medium: number;
    Low: number;
  };
  disasterCounts: Record<string, number>;
  priorityBreakdown: {
    P1_Critical: number;
    P2_High: number;
    P3_Standard: number;
    P4_Low: number;
  };
  topSectors: Array<{ name: string; count: number }>;
  logistics: {
    totalSuppliesTracked: number;
    totalSuppliesAllocated: number;
    totalShelterCapacity: number;
    totalShelterOccupancy: number;
    facilitiesCount: number;
    resourcesCount: number;
  };
}

// ==========================================
// PHASE 4: AI INTELLIGENCE TYPES
// ==========================================

export interface AIClassificationResult {
  disasterType: string;
  severity: string;
  confidence: number;
  detectedKeywords: string[];
  hazards: string[];
  casualtyRisk: string;
  recommendedGear?: string[];
}

export interface DuplicateMatch {
  reportId: string;
  disasterType: string;
  location: string;
  status: string;
  similarityScore: number;
  distanceKm: number | null;
  createdAt: string;
}

export interface AIDispatchRecommendation {
  recommendedVolunteer: User;
  matchScore: number;
  distanceKm: number | null;
  etaMinutes: number | null;
  rationale: string;
}

export interface AIIncidentIntelligence {
  reportId: string;
  executiveSummary: string;
  riskAssessment: {
    hazards: string[];
    casualtyRisk: string;
    recommendedGear: string[];
  };
  duplicateMatches: DuplicateMatch[];
  smartRecommendation: AIDispatchRecommendation | null;
}

// ==========================================
// API RESPONSES
// ==========================================

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface ReportsResponse {
  success: boolean;
  reports: Report[];
  message?: string;
}

export interface SingleReportResponse {
  success: boolean;
  report: Report;
  message?: string;
}

export interface VolunteersResponse {
  success: boolean;
  volunteers: User[];
  message?: string;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
}

export interface AnalyticsResponse {
  success: boolean;
  analytics: AnalyticsData;
  message?: string;
}

export interface ResourcesResponse {
  success: boolean;
  resources: Resource[];
  message?: string;
}

export interface FacilitiesResponse {
  success: boolean;
  facilities: Facility[];
  message?: string;
}

export interface AIClassifyResponse {
  success: boolean;
  classification: AIClassificationResult;
  message?: string;
}

export interface AIIntelligenceResponse {
  success: boolean;
  intelligence: AIIncidentIntelligence;
  message?: string;
}
