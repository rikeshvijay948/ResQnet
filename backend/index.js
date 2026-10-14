require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

const JWT_SECRET = process.env.JWT_SECRET || "resqnet_super_secret_jwt_key_2026";
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ===============================
// Uploads Directory & Static Serving
// ===============================

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `incident-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

// ===============================
// Priority & Distance Helpers
// ===============================

function calculatePriorityScore(disasterType, severity, peopleAffected) {
  let severityScore = 10;
  const sevLower = (severity || "").toLowerCase();
  if (sevLower === "critical") severityScore = 40;
  else if (sevLower === "high") severityScore = 25;
  else if (sevLower === "medium") severityScore = 15;
  else severityScore = 5;

  let disasterMultiplier = 1.0;
  const disLower = (disasterType || "").toLowerCase();
  if (disLower === "fire" || disLower === "earthquake") disasterMultiplier = 1.25;
  else if (disLower === "flood" || disLower === "cyclone") disasterMultiplier = 1.15;
  else if (disLower === "landslide") disasterMultiplier = 1.1;

  const peopleScore = Math.min(Math.max((Number(peopleAffected) || 1) * 3, 5), 35);
  const rawScore = Math.round((severityScore + peopleScore) * disasterMultiplier);
  const finalScore = Math.min(Math.max(rawScore, 10), 100);

  let rank = "P3 - Standard";
  if (finalScore >= 80) rank = "P1 - Critical Priority";
  else if (finalScore >= 55) rank = "P2 - High Priority";
  else if (finalScore >= 35) rank = "P3 - Standard Priority";
  else rank = "P4 - Low Priority";

  return { priorityScore: finalScore, priorityRank: rank };
}

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (
    lat1 === null ||
    lon1 === null ||
    lat2 === null ||
    lon2 === null ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return null;
  }

  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  const etaMinutes = Math.max(Math.round((distanceKm / 35) * 60), 3);

  return {
    distanceKm: Number(distanceKm.toFixed(2)),
    etaMinutes,
  };
}

// ===============================
// PHASE 4: AI DISASTER INTELLIGENCE ENGINES
// ===============================

function classifyEmergencyNLP(text) {
  const lower = (text || "").toLowerCase();

  let disasterType = "Other";
  let confidence = 75;
  let detectedKeywords = [];

  const floodKeywords = ["flood", "water", "drowning", "river", "rain", "overflow", "submerged", "dam", "inundated", "drainage", "waterlogging"];
  const fireKeywords = ["fire", "smoke", "flames", "burning", "explosion", "blaze", "short circuit", "gas leak", "spark", "cylinder"];
  const earthquakeKeywords = ["earthquake", "shaking", "tremor", "building collapse", "rubble", "cracked wall", "structural damage", "quake"];
  const cycloneKeywords = ["cyclone", "storm", "hurricane", "typhoon", "high wind", "gale", "heavy winds", "tornado", "sea surge", "gusts"];
  const landslideKeywords = ["landslide", "mudslide", "rockfall", "debris flow", "hill collapse", "slope failure", "boulder"];

  const checkKeywords = (list) => list.filter((k) => lower.includes(k));

  const floodMatches = checkKeywords(floodKeywords);
  const fireMatches = checkKeywords(fireKeywords);
  const eqMatches = checkKeywords(earthquakeKeywords);
  const cycloneMatches = checkKeywords(cycloneKeywords);
  const landMatches = checkKeywords(landslideKeywords);

  const scores = [
    { type: "Flood", matches: floodMatches },
    { type: "Fire", matches: fireMatches },
    { type: "Earthquake", matches: eqMatches },
    { type: "Cyclone", matches: cycloneMatches },
    { type: "Landslide", matches: landMatches },
  ].sort((a, b) => b.matches.length - a.matches.length);

  if (scores[0].matches.length > 0) {
    disasterType = scores[0].type;
    detectedKeywords = scores[0].matches;
    confidence = Math.min(68 + scores[0].matches.length * 10, 98);
  }

  let severity = "Medium";
  const criticalKeywords = [
    "trapped", "unconscious", "elderly", "children", "baby", "infant",
    "cannot breathe", "dying", "rapidly rising", "critical", "severe burn",
    "crushed", "bleeding heavily", "immediate help", "urgent rescue", "drowning",
  ];
  const highKeywords = [
    "injured", "broken bone", "high water", "spreading fast", "no power",
    "cut off", "stranded", "isolated", "smoke inhalation", "electric shock",
  ];

  const critMatches = checkKeywords(criticalKeywords);
  const highMatches = checkKeywords(highKeywords);

  if (critMatches.length > 0) {
    severity = "Critical";
    detectedKeywords.push(...critMatches);
  } else if (highMatches.length > 0) {
    severity = "High";
    detectedKeywords.push(...highMatches);
  } else if (lower.includes("minor") || lower.includes("slight")) {
    severity = "Low";
  }

  return {
    disasterType,
    severity,
    confidence,
    detectedKeywords: [...new Set(detectedKeywords)],
  };
}

function extractHazardsAndRisk(text, disasterType, severity, peopleAffected) {
  const lower = (text || "").toLowerCase();
  const hazards = [];

  if (lower.includes("electric") || lower.includes("power") || lower.includes("wire") || lower.includes("short circuit")) {
    hazards.push("⚡ High Voltage / Electrical Hazard");
  }
  if (lower.includes("trapped") || lower.includes("stuck") || lower.includes("stranded") || lower.includes("locked")) {
    hazards.push("🚪 Trapped / Inaccessible Individuals");
  }
  if (lower.includes("water") || lower.includes("flood") || lower.includes("rising") || lower.includes("current")) {
    hazards.push("🌊 Submersion & Rapid Water Current Threat");
  }
  if (lower.includes("smoke") || lower.includes("toxic") || lower.includes("fumes") || lower.includes("gas") || lower.includes("flame")) {
    hazards.push("☣️ Toxic Smoke & Thermal Radiation Threat");
  }
  if (lower.includes("collapse") || lower.includes("crack") || lower.includes("rubble") || lower.includes("shake")) {
    hazards.push("🏚️ Structural Instability & Secondary Collapse Threat");
  }
  if (lower.includes("elderly") || lower.includes("child") || lower.includes("pregnant") || lower.includes("patient") || lower.includes("baby")) {
    hazards.push("👶 Vulnerable & Immobility Demographics Present");
  }
  if (hazards.length === 0) {
    hazards.push("⚠️ Active Crisis Environmental Threat");
  }

  const peopleCount = Number(peopleAffected) || 1;
  let casualtyRisk = "Moderate";
  if (severity === "Critical" || peopleCount >= 8 || hazards.length >= 3) {
    casualtyRisk = "Extremely High (Immediate Tactical Rescue Required)";
  } else if (severity === "High" || peopleCount >= 4) {
    casualtyRisk = "Elevated (Priority Evacuation Recommended)";
  }

  return {
    hazards,
    casualtyRisk,
    recommendedGear:
      disasterType === "Flood"
        ? ["Flotation Life Vests", "Water Rescue Ropes", "Inflatable Boat", "Dry Suits"]
        : disasterType === "Fire"
        ? ["Fire Resistant Gear", "Oxygen SCBA Tanks", "Thermal Imager", "Burn Care Kit"]
        : disasterType === "Earthquake"
        ? ["Heavy Duty Stretchers", "Hydraulic Cutters", "Search Cameras", "Hardhats"]
        : ["Standard Tactical First Aid Kit", "Heavy Duty Gloves", "Flashlights", "Radio"],
  };
}

function generateExecutiveSummary(report) {
  const people = report.peopleAffected || 1;
  const sev = report.severity || "Standard";
  const type = report.disasterType || "Incident";
  const loc = report.location || "the specified area";
  const desc = report.description ? ` Details: "${report.description.slice(0, 120)}..."` : "";

  return `Tactical Intelligence Briefing: A ${sev} priority ${type} disaster confirmed at ${loc} impacting ~${people} citizen(s). Current status is ${report.status}.${desc}`;
}

function findDuplicateIncidents(targetReport, allReports) {
  const duplicates = [];

  for (const other of allReports) {
    const targetId = (targetReport._id || "").toString();
    const otherId = (other._id || "").toString();
    if (targetId === otherId) continue;
    if (other.status === "Resolved") continue;

    let distanceKm = null;
    let similarityScore = 0;

    if (
      targetReport.latitude &&
      targetReport.longitude &&
      other.latitude &&
      other.longitude
    ) {
      const distInfo = calculateHaversineDistance(
        targetReport.latitude,
        targetReport.longitude,
        other.latitude,
        other.longitude
      );
      if (distInfo) {
        distanceKm = distInfo.distanceKm;
        if (distanceKm <= 1.2) {
          similarityScore += 50;
        } else if (distanceKm <= 2.5) {
          similarityScore += 25;
        }
      }
    }

    if (
      targetReport.disasterType &&
      other.disasterType &&
      targetReport.disasterType.toLowerCase() === other.disasterType.toLowerCase()
    ) {
      similarityScore += 35;
    }

    const timeDiffHours = Math.abs(
      new Date(targetReport.createdAt || Date.now()).getTime() -
        new Date(other.createdAt || Date.now()).getTime()
    ) / (1000 * 60 * 60);

    if (timeDiffHours <= 24) {
      similarityScore += 15;
    }

    if (similarityScore >= 60) {
      duplicates.push({
        reportId: other._id,
        disasterType: other.disasterType,
        location: other.location,
        status: other.status,
        similarityScore: Math.min(similarityScore, 98),
        distanceKm,
        createdAt: other.createdAt,
      });
    }
  }

  duplicates.sort((a, b) => b.similarityScore - a.similarityScore);
  return duplicates;
}

function matchSmartResponder(report, volunteers) {
  if (!volunteers || volunteers.length === 0) return null;

  const type = (report.disasterType || "").toLowerCase();

  const requiredSkillsMap = {
    flood: ["Water Rescue", "Search & Rescue", "First Aid & CPR"],
    fire: ["Fire Response", "Disaster Logistics", "First Aid & CPR"],
    earthquake: ["Search & Rescue", "Heavy Machinery", "Medical Paramedic"],
    cyclone: ["Search & Rescue", "Communication & Radio", "Water Rescue"],
    landslide: ["Search & Rescue", "Heavy Machinery", "Disaster Logistics"],
  };

  const relevantSkills = requiredSkillsMap[type] || ["First Aid & CPR", "Search & Rescue"];

  const scoredVolunteers = volunteers.map((vol) => {
    let score = 0;
    const matchReasons = [];

    const matchedSkills = (vol.skills || []).filter((s) =>
      relevantSkills.some((rs) => rs.toLowerCase() === s.toLowerCase())
    );
    if (matchedSkills.length > 0) {
      score += Math.min(matchedSkills.length * 20, 40);
      matchReasons.push(`Certified in ${matchedSkills.join(", ")}`);
    }

    let distInfo = null;
    if (
      report.latitude &&
      report.longitude &&
      vol.currentLocation &&
      vol.currentLocation.latitude &&
      vol.currentLocation.longitude
    ) {
      distInfo = calculateHaversineDistance(
        report.latitude,
        report.longitude,
        vol.currentLocation.latitude,
        vol.currentLocation.longitude
      );
      if (distInfo) {
        if (distInfo.distanceKm <= 5) score += 40;
        else if (distInfo.distanceKm <= 15) score += 30;
        else if (distInfo.distanceKm <= 35) score += 15;
        else score += 5;
        matchReasons.push(`${distInfo.distanceKm} km away (~${distInfo.etaMinutes} mins ETA)`);
      }
    }

    if (vol.availability === "Available") {
      score += 20;
      matchReasons.push("Active & Available");
    } else if (vol.availability === "On Duty") {
      score += 10;
      matchReasons.push("On Duty Standby");
    }

    return {
      volunteer: vol,
      score,
      distanceKm: distInfo ? distInfo.distanceKm : null,
      etaMinutes: distInfo ? distInfo.etaMinutes : null,
      matchReasons,
    };
  });

  scoredVolunteers.sort((a, b) => b.score - a.score);
  if (scoredVolunteers.length === 0) return null;

  const top = scoredVolunteers[0];
  return {
    recommendedVolunteer: top.volunteer,
    matchScore: Math.min(top.score, 100),
    distanceKm: top.distanceKm,
    etaMinutes: top.etaMinutes,
    rationale: top.matchReasons.join(" • "),
  };
}

// ===============================
// Schemas & Models
// ===============================

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["citizen", "volunteer", "admin"], default: "citizen" },
    skills: { type: [String], default: [] },
    availability: { type: String, enum: ["Available", "On Duty", "Offline"], default: "Available" },
    currentLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      address: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

const reportSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    emergencyContact: { type: String, required: true },
    location: { type: String, required: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    disasterType: { type: String, required: true },
    severity: { type: String, required: true },
    peopleAffected: { type: Number, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Reported", "Acknowledged", "Assigned", "In Progress", "Responding", "Resolved"],
      default: "Reported",
    },
    priorityScore: { type: Number, default: 50 },
    priorityRank: { type: String, default: "P2 - High Priority" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    assignedVolunteerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    assignedVolunteerName: { type: String, default: "" },
    assignedVolunteerPhone: { type: String, default: "" },
    assignedTeam: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    statusHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        updatedBy: String,
        note: String,
      },
    ],
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    targetRole: { type: String, enum: ["all", "admin", "volunteer", "citizen"], default: "all" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["emergency", "assignment", "status", "alert", "system"],
      default: "emergency",
    },
    relatedReportId: { type: mongoose.Schema.Types.ObjectId, ref: "Report", default: null },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["Medical", "Food & Water", "Rescue Equipment", "Vehicles", "Shelter"],
      default: "Rescue Equipment",
    },
    totalQuantity: { type: Number, required: true, default: 100 },
    allocatedQuantity: { type: Number, default: 0 },
    availableQuantity: { type: Number, default: 100 },
    unit: { type: String, required: true, default: "units" },
    location: { type: String, default: "Central Emergency Depot" },
    status: { type: String, enum: ["In Stock", "Low Stock", "Depleted"], default: "In Stock" },
    allocations: [
      {
        reportId: { type: mongoose.Schema.Types.ObjectId, ref: "Report" },
        incidentName: String,
        allocatedAmount: Number,
        allocatedAt: { type: Date, default: Date.now },
        notes: String,
      },
    ],
  },
  { timestamps: true }
);

const Resource = mongoose.model("Resource", resourceSchema);

const facilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["Hospital", "Shelter", "Relief Camp", "Fire Station", "Police Station"],
      default: "Shelter",
    },
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    capacity: { type: Number, required: true, default: 100 },
    currentOccupancy: { type: Number, default: 0 },
    availableCapacity: { type: Number, default: 100 },
    contactPhone: { type: String, default: "" },
    status: { type: String, enum: ["Operational", "Full", "Under Evacuation"], default: "Operational" },
    amenities: [String],
  },
  { timestamps: true }
);

const Facility = mongoose.model("Facility", facilitySchema);

// ===============================
// IN-MEMORY RESILIENT STORE FALLBACK
// (Ensures 100% continuous uptime if Atlas IP changes/reconnects)
// ===============================

let isAtlasConnected = false;

const memStore = {
  users: [],
  reports: [],
  notifications: [],
  resources: [],
  facilities: [],
};

function initInMemorySeeds() {
  const adminHashed = bcrypt.hashSync("admin123", 10);
  const volHashed = bcrypt.hashSync("volunteer123", 10);
  const citHashed = bcrypt.hashSync("citizen123", 10);

  memStore.users = [
    {
      _id: "660f00000000000000000001",
      name: "Admin Coordinator",
      email: "admin@resqnet.org",
      password: adminHashed,
      phone: "+91 98765 43210",
      role: "admin",
      skills: ["Disaster Logistics", "Triage Management"],
      availability: "Available",
      currentLocation: { latitude: 18.9388, longitude: 72.8354, address: "Mumbai HQ" },
      createdAt: new Date().toISOString(),
    },
    {
      _id: "660f00000000000000000002",
      name: "Aarav Sharma",
      email: "volunteer@resqnet.org",
      password: volHashed,
      phone: "+91 98123 45678",
      role: "volunteer",
      skills: ["Water Rescue", "First Aid & CPR", "Search & Rescue"],
      availability: "Available",
      currentLocation: { latitude: 18.9388, longitude: 72.8354, address: "Colaba / Fort Sector, Mumbai" },
      createdAt: new Date().toISOString(),
    },
    {
      _id: "660f00000000000000000003",
      name: "Priya Patel",
      email: "volunteer2@resqnet.org",
      password: volHashed,
      phone: "+91 98234 56789",
      role: "volunteer",
      skills: ["Medical Paramedic", "Disaster Logistics", "Fire Response"],
      availability: "Available",
      currentLocation: { latitude: 19.0178, longitude: 72.8478, address: "Dadar / Central, Mumbai" },
      createdAt: new Date().toISOString(),
    },
    {
      _id: "660f00000000000000000004",
      name: "Vikram Singh",
      email: "volunteer3@resqnet.org",
      password: volHashed,
      phone: "+91 98345 67890",
      role: "volunteer",
      skills: ["Heavy Machinery", "Communication & Radio", "First Aid"],
      availability: "On Duty",
      currentLocation: { latitude: 19.076, longitude: 72.8777, address: "BKC / Bandra East, Mumbai" },
      createdAt: new Date().toISOString(),
    },
    {
      _id: "660f00000000000000000005",
      name: "Rahul Verma",
      email: "citizen@resqnet.org",
      password: citHashed,
      phone: "+91 99887 76655",
      role: "citizen",
      createdAt: new Date().toISOString(),
    },
  ];

  memStore.reports = [
    {
      _id: "660f10000000000000000001",
      fullName: "Arun Joshi",
      phoneNumber: "9876500000",
      emergencyContact: "9876511111",
      location: "Marine Drive, Mumbai",
      latitude: 18.9438,
      longitude: 72.8234,
      disasterType: "Flood",
      severity: "Critical",
      peopleAffected: 4,
      description: "Water level rising rapidly, elderly trapped on ground floor",
      status: "In Progress",
      priorityScore: 88,
      priorityRank: "P1 - Critical Priority",
      assignedVolunteerId: "660f00000000000000000002",
      assignedVolunteerName: "Aarav Sharma",
      assignedVolunteerPhone: "+91 98123 45678",
      assignedTeam: "Marine Rescue Unit",
      imageUrl: "",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      _id: "660f10000000000000000002",
      fullName: "Pooja Sharma",
      phoneNumber: "9876543210",
      emergencyContact: "9876500000",
      location: "Gateway of India, Mumbai",
      latitude: 18.9220,
      longitude: 72.8347,
      disasterType: "Cyclone",
      severity: "Critical",
      peopleAffected: 15,
      description: "High storm surge and sea waves approaching shore, immediate evacuation needed",
      status: "Assigned",
      priorityScore: 86,
      priorityRank: "P1 - Critical Priority",
      assignedVolunteerId: "660f00000000000000000002",
      assignedVolunteerName: "Aarav Sharma",
      assignedVolunteerPhone: "+91 98123 45678",
      assignedTeam: "Mumbai Marine Squad",
      imageUrl: "",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
  ];

  memStore.resources = [
    {
      _id: "660f20000000000000000001",
      name: "Trauma & First Aid Field Kits",
      category: "Medical",
      totalQuantity: 250,
      allocatedQuantity: 65,
      availableQuantity: 185,
      unit: "kits",
      location: "Central Relief Depot, Mumbai",
      status: "In Stock",
    },
    {
      _id: "660f20000000000000000002",
      name: "Inflatable Motorized Rescue Boats",
      category: "Rescue Equipment",
      totalQuantity: 30,
      allocatedQuantity: 18,
      availableQuantity: 12,
      unit: "boats",
      location: "Marine Sector 4, Colaba",
      status: "Low Stock",
    },
    {
      _id: "660f20000000000000000003",
      name: "Clean Potable Drinking Water",
      category: "Food & Water",
      totalQuantity: 15000,
      allocatedQuantity: 4200,
      availableQuantity: 10800,
      unit: "liters",
      location: "Dadar Logistics Warehouse",
      status: "In Stock",
    },
    {
      _id: "660f20000000000000000004",
      name: "High-Calorie Ready-to-Eat Ration Packs",
      category: "Food & Water",
      totalQuantity: 3000,
      allocatedQuantity: 850,
      availableQuantity: 2150,
      unit: "ration packs",
      location: "Bandra East Supply Depot",
      status: "In Stock",
    },
  ];

  memStore.facilities = [
    {
      _id: "660f30000000000000000001",
      name: "King Edward Memorial (KEM) Hospital",
      type: "Hospital",
      address: "Parel, Mumbai, Maharashtra 400012",
      latitude: 19.0028,
      longitude: 72.8427,
      capacity: 450,
      currentOccupancy: 280,
      availableCapacity: 170,
      contactPhone: "+91 22 2410 7000",
      status: "Operational",
      amenities: ["24/7 Trauma ICU", "Blood Bank", "Emergency Helipad", "Burn Care Unit"],
    },
    {
      _id: "660f30000000000000000002",
      name: "Dadar Community Relief Shelter & Camp",
      type: "Shelter",
      address: "Dadar West, Mumbai, Maharashtra 400028",
      latitude: 19.0178,
      longitude: 72.8478,
      capacity: 350,
      currentOccupancy: 120,
      availableCapacity: 230,
      contactPhone: "+91 22 2430 5500",
      status: "Operational",
      amenities: ["Clean Water Station", "Family Bedding", "Community Kitchen", "Baby Care"],
    },
    {
      _id: "660f30000000000000000003",
      name: "Colaba Fire & Sea Rescue Station",
      type: "Fire Station",
      address: "Shahid Bhagat Singh Rd, Colaba, Mumbai 400005",
      latitude: 18.9186,
      longitude: 72.8295,
      capacity: 80,
      currentOccupancy: 35,
      availableCapacity: 45,
      contactPhone: "+91 22 2284 3333",
      status: "Operational",
      amenities: ["Fire Tenders", "Inflatable Dinghies", "Diver Squad", "High-Pressure Pumps"],
    },
  ];

  memStore.notifications = [
    {
      _id: "660f40000000000000000001",
      targetRole: "all",
      title: "🚨 CRITICAL ALERT: Cyclone Threat",
      message: "High storm surge confirmed near Marine Sector. Coastal evacuation protocols active.",
      type: "alert",
      read: false,
      createdAt: new Date().toISOString(),
    },
  ];
}

initInMemorySeeds();

// MongoDB Connection attempt with 3s timeout fallback
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI, { serverSelectionTimeoutMS: 4000 })
    .then(async () => {
      isAtlasConnected = true;
      console.log("✅ MongoDB Atlas Connected Successfully");
    })
    .catch((error) => {
      isAtlasConnected = false;
      console.warn("⚠️ MongoDB Atlas offline or IP not whitelisted. ResQNet operational in Resilient Memory Store.");
    });
}

// ===============================
// Auth Middleware
// ===============================

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized. Token missing." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (isAtlasConnected) {
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) return res.status(401).json({ success: false, message: "User not found." });
      req.user = user;
    } else {
      const user = memStore.users.find((u) => u._id.toString() === decoded.userId.toString());
      if (!user) return res.status(401).json({ success: false, message: "User not found." });
      const userCopy = { ...user };
      delete userCopy.password;
      req.user = userCopy;
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      if (isAtlasConnected) {
        const user = await User.findById(decoded.userId).select("-password");
        if (user) req.user = user;
      } else {
        const user = memStore.users.find((u) => u._id.toString() === decoded.userId.toString());
        if (user) {
          const userCopy = { ...user };
          delete userCopy.password;
          req.user = userCopy;
        }
      }
    }
  } catch (err) {}
  next();
};

// ===============================
// Test & Health
// ===============================


app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ResQNet API is healthy",
    backend: "running",
    database: mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected",
    timestamp: new Date().toISOString()
  });
});


// ===============================
// FILE UPLOAD
// ===============================

app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided." });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: "Image uploaded successfully",
      url: fileUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to upload image", error: error.message });
  }
});

// ===============================
// PHASE 4: AI INTELLIGENCE API ENDPOINTS
// ===============================

app.post("/api/ai/classify", (req, res) => {
  try {
    const { text, peopleAffected } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Description text is required." });
    }

    const classification = classifyEmergencyNLP(text);
    const riskData = extractHazardsAndRisk(
      text,
      classification.disasterType,
      classification.severity,
      peopleAffected || 1
    );

    res.json({
      success: true,
      classification: {
        ...classification,
        ...riskData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "AI classification failed", error: error.message });
  }
});

app.get("/reports/:id/ai-intelligence", async (req, res) => {
  try {
    let report = null;
    let allReports = [];
    let volunteers = [];

    if (isAtlasConnected) {
      report = await Report.findById(req.params.id).lean();
      allReports = await Report.find().lean();
      volunteers = await User.find({ role: "volunteer" }).select("-password").lean();
    } else {
      report = memStore.reports.find((r) => r._id.toString() === req.params.id.toString());
      allReports = memStore.reports;
      volunteers = memStore.users.filter((u) => u.role === "volunteer");
    }

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    const executiveSummary = generateExecutiveSummary(report);
    const riskAssessment = extractHazardsAndRisk(
      report.description,
      report.disasterType,
      report.severity,
      report.peopleAffected
    );
    const duplicateMatches = findDuplicateIncidents(report, allReports);
    const smartRecommendation = matchSmartResponder(report, volunteers);

    res.json({
      success: true,
      intelligence: {
        reportId: report._id,
        executiveSummary,
        riskAssessment,
        duplicateMatches,
        smartRecommendation,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to generate AI intelligence", error: error.message });
  }
});

// ===============================
// AUTH ENDPOINTS
// ===============================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone, role, skills } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || "",
      role: role || "citizen",
      skills: Array.isArray(skills) ? skills : [],
      availability: "Available",
      currentLocation: {
        latitude: 19.076 + (Math.random() - 0.5) * 0.1,
        longitude: 72.8777 + (Math.random() - 0.5) * 0.1,
        address: "Mumbai Metro Area",
      },
      createdAt: new Date().toISOString(),
    };

    if (isAtlasConnected) {
      const doc = new User(newUser);
      await doc.save();
    } else {
      memStore.users.push(newUser);
    }

    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });
    const userRes = { ...newUser };
    delete userRes.password;

    res.status(201).json({ success: true, message: "Registration successful!", token, user: userRes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Registration failed", error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password." });
    }

    let user = null;
    if (isAtlasConnected) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      user = memStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    const userRes = isAtlasConnected ? user.toObject() : { ...user };
    delete userRes.password;

    res.json({ success: true, message: "Login successful!", token, user: userRes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ===============================
// NOTIFICATIONS
// ===============================

app.get("/api/notifications", optionalAuthMiddleware, async (req, res) => {
  try {
    let list = [];
    if (isAtlasConnected) {
      list = await Notification.find().sort({ createdAt: -1 }).limit(30).lean();
    } else {
      list = [...memStore.notifications].reverse().slice(0, 30);
    }

    const formatted = list.map((n) => ({
      ...n,
      isRead: !!n.read,
    }));

    res.json({
      success: true,
      notifications: formatted,
      unreadCount: formatted.filter((n) => !n.isRead).length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
});

app.put("/api/notifications/:id/read", (req, res) => {
  const item = memStore.notifications.find((n) => n._id.toString() === req.params.id.toString());
  if (item) item.read = true;
  res.json({ success: true, message: "Marked as read" });
});

app.put("/api/notifications/read-all", (req, res) => {
  memStore.notifications.forEach((n) => (n.read = true));
  res.json({ success: true, message: "All notifications marked as read" });
});

// ===============================
// VOLUNTEERS & PROXIMITY
// ===============================

app.get("/api/volunteers", async (req, res) => {
  try {
    let volunteers = [];
    if (isAtlasConnected) {
      volunteers = await User.find({ role: "volunteer" }).select("-password").lean();
    } else {
      volunteers = memStore.users.filter((u) => u.role === "volunteer").map((u) => {
        const c = { ...u };
        delete c.password;
        return c;
      });
    }
    res.json({ success: true, volunteers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch volunteers" });
  }
});

app.put("/api/volunteers/availability", authMiddleware, async (req, res) => {
  const { availability, currentLocation } = req.body;
  const user = memStore.users.find((u) => u._id.toString() === req.user._id.toString());
  if (user) {
    if (availability) user.availability = availability;
    if (currentLocation) user.currentLocation = currentLocation;
  }
  res.json({ success: true, message: "Availability updated", user });
});

app.get("/reports/:id/nearby-responders", async (req, res) => {
  try {
    let report = null;
    let volunteers = [];

    if (isAtlasConnected) {
      report = await Report.findById(req.params.id).lean();
      volunteers = await User.find({ role: "volunteer" }).select("-password").lean();
    } else {
      report = memStore.reports.find((r) => r._id.toString() === req.params.id.toString());
      volunteers = memStore.users.filter((u) => u.role === "volunteer");
    }

    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    const respondersWithDist = volunteers.map((vol) => {
      let distInfo = null;
      if (
        report.latitude &&
        report.longitude &&
        vol.currentLocation &&
        vol.currentLocation.latitude &&
        vol.currentLocation.longitude
      ) {
        distInfo = calculateHaversineDistance(
          report.latitude,
          report.longitude,
          vol.currentLocation.latitude,
          vol.currentLocation.longitude
        );
      }
      return {
        ...vol,
        distanceKm: distInfo ? distInfo.distanceKm : null,
        etaMinutes: distInfo ? distInfo.etaMinutes : null,
      };
    });

    respondersWithDist.sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      if (a.distanceKm !== null) return -1;
      return 1;
    });

    res.json({
      success: true,
      reportLocation: { location: report.location, latitude: report.latitude, longitude: report.longitude },
      responders: respondersWithDist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to compute nearby responders" });
  }
});

// ===============================
// ANALYTICS
// ===============================

app.get("/api/analytics", async (req, res) => {
  try {
    const reports = isAtlasConnected ? await Report.find().lean() : memStore.reports;
    const resources = isAtlasConnected ? await Resource.find().lean() : memStore.resources;
    const facilities = isAtlasConnected ? await Facility.find().lean() : memStore.facilities;

    const totalReports = reports.length;
    const resolvedReports = reports.filter((r) => r.status?.toLowerCase() === "resolved").length;
    const activeReports = totalReports - resolvedReports;
    const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

    const totalPeopleAffected = reports.reduce((acc, curr) => acc + (Number(curr.peopleAffected) || 0), 0);

    const severityBreakdown = {
      Critical: reports.filter((r) => r.severity?.toLowerCase() === "critical").length,
      High: reports.filter((r) => r.severity?.toLowerCase() === "high").length,
      Medium: reports.filter((r) => r.severity?.toLowerCase() === "medium").length,
      Low: reports.filter((r) => r.severity?.toLowerCase() === "low").length,
    };

    const disasterCounts = {};
    reports.forEach((r) => {
      const type = r.disasterType || "Other";
      disasterCounts[type] = (disasterCounts[type] || 0) + 1;
    });

    const priorityBreakdown = {
      P1_Critical: reports.filter((r) => (r.priorityScore || 0) >= 80).length,
      P2_High: reports.filter((r) => (r.priorityScore || 0) >= 55 && (r.priorityScore || 0) < 80).length,
      P3_Standard: reports.filter((r) => (r.priorityScore || 0) >= 35 && (r.priorityScore || 0) < 55).length,
      P4_Low: reports.filter((r) => (r.priorityScore || 0) < 35).length,
    };

    const topSectors = [
      { name: "Marine Sector 4", count: 2 },
      { name: "Gateway Coastal Zone", count: 1 },
      { name: "Dadar Central", count: 1 },
    ];

    const totalSuppliesTracked = resources.reduce((acc, r) => acc + r.totalQuantity, 0);
    const totalSuppliesAllocated = resources.reduce((acc, r) => acc + r.allocatedQuantity, 0);
    const totalShelterCapacity = facilities.reduce((acc, f) => acc + f.capacity, 0);
    const totalShelterOccupancy = facilities.reduce((acc, f) => acc + f.currentOccupancy, 0);

    res.json({
      success: true,
      analytics: {
        totalReports,
        activeReports,
        resolvedReports,
        resolutionRate,
        totalPeopleAffected,
        severityBreakdown,
        disasterCounts,
        priorityBreakdown,
        topSectors,
        logistics: {
          totalSuppliesTracked,
          totalSuppliesAllocated,
          totalShelterCapacity,
          totalShelterOccupancy,
          facilitiesCount: facilities.length,
          resourcesCount: resources.length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to generate analytics" });
  }
});

// ===============================
// RESOURCES
// ===============================

app.get("/api/resources", (req, res) => {
  res.json({ success: true, resources: memStore.resources });
});

app.post("/api/resources", (req, res) => {
  const { name, category, totalQuantity, unit, location } = req.body;
  const newRes = {
    _id: new mongoose.Types.ObjectId().toString(),
    name,
    category: category || "Rescue Equipment",
    totalQuantity: Number(totalQuantity),
    allocatedQuantity: 0,
    availableQuantity: Number(totalQuantity),
    unit: unit || "units",
    location: location || "Central Reserve",
    status: "In Stock",
  };
  memStore.resources.push(newRes);
  res.status(201).json({ success: true, message: "Resource added", resource: newRes });
});

app.put("/api/resources/:id/allocate", (req, res) => {
  const { amount, incidentName, notes } = req.body;
  const resItem = memStore.resources.find((r) => r._id.toString() === req.params.id.toString());
  if (!resItem) return res.status(404).json({ success: false, message: "Resource not found" });

  const alloc = Number(amount);
  resItem.allocatedQuantity += alloc;
  resItem.availableQuantity = Math.max(resItem.totalQuantity - resItem.allocatedQuantity, 0);
  resItem.status = resItem.availableQuantity <= 0 ? "Depleted" : resItem.availableQuantity < 25 ? "Low Stock" : "In Stock";

  res.json({ success: true, message: `Allocated ${alloc} ${resItem.unit}`, resource: resItem });
});

// ===============================
// FACILITIES
// ===============================

app.get("/api/facilities", (req, res) => {
  res.json({ success: true, facilities: memStore.facilities });
});

app.post("/api/facilities", (req, res) => {
  const { name, type, address, latitude, longitude, capacity, currentOccupancy, contactPhone, amenities } = req.body;
  const newFac = {
    _id: new mongoose.Types.ObjectId().toString(),
    name,
    type: type || "Shelter",
    address,
    latitude: Number(latitude),
    longitude: Number(longitude),
    capacity: Number(capacity),
    currentOccupancy: Number(currentOccupancy) || 0,
    availableCapacity: Math.max(Number(capacity) - (Number(currentOccupancy) || 0), 0),
    contactPhone: contactPhone || "",
    status: "Operational",
    amenities: Array.isArray(amenities) ? amenities : [],
  };
  memStore.facilities.push(newFac);
  res.status(201).json({ success: true, message: "Facility registered", facility: newFac });
});

// ===============================
// EMERGENCY REPORTS
// ===============================

app.post("/report", optionalAuthMiddleware, (req, res) => {
  try {
    const { disasterType, severity, peopleAffected } = req.body;
    const { priorityScore, priorityRank } = calculatePriorityScore(
      disasterType,
      severity,
      peopleAffected
    );

    const newRep = {
      _id: new mongoose.Types.ObjectId().toString(),
      fullName: req.body.fullName,
      phoneNumber: req.body.phoneNumber,
      emergencyContact: req.body.emergencyContact,
      location: req.body.location,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      disasterType,
      severity,
      peopleAffected: Number(peopleAffected) || 1,
      description: req.body.description || "",
      status: "Reported",
      priorityScore,
      priorityRank,
      userId: req.user ? req.user._id : req.body.userId || null,
      imageUrl: req.body.imageUrl || "",
      statusHistory: [
        {
          status: "Reported",
          updatedAt: new Date(),
          updatedBy: req.user ? req.user.name : req.body.fullName || "Citizen",
          note: `Emergency reported. Priority Score: ${priorityScore} (${priorityRank})`,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    memStore.reports.unshift(newRep);

    // Trigger Notification
    memStore.notifications.unshift({
      _id: new mongoose.Types.ObjectId().toString(),
      targetRole: "admin",
      title: `🚨 Alert: ${disasterType} at ${req.body.location}`,
      message: `${req.body.fullName} reported ${severity} ${disasterType} affecting ~${peopleAffected} people.`,
      type: "emergency",
      relatedReportId: newRep._id,
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, message: "Emergency report saved successfully!", report: newRep });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to save report" });
  }
});

app.get("/reports", (req, res) => {
  res.json({ success: true, reports: memStore.reports });
});

app.get("/reports/my", authMiddleware, (req, res) => {
  const myReports = memStore.reports.filter(
    (r) =>
      (r.userId && r.userId.toString() === req.user._id.toString()) ||
      r.phoneNumber === req.user.phone
  );
  res.json({ success: true, reports: myReports });
});

app.get("/reports/assigned", authMiddleware, (req, res) => {
  const assigned = memStore.reports.filter(
    (r) =>
      r.assignedVolunteerId &&
      r.assignedVolunteerId.toString() === req.user._id.toString()
  );
  res.json({ success: true, reports: assigned });
});

app.get("/reports/:id", (req, res) => {
  const report = memStore.reports.find((r) => r._id.toString() === req.params.id.toString());
  if (!report) return res.status(404).json({ success: false, message: "Report not found" });
  res.json({ success: true, report });
});

app.put("/reports/:id/assign", optionalAuthMiddleware, (req, res) => {
  const { volunteerId, assignedTeam } = req.body;
  const report = memStore.reports.find((r) => r._id.toString() === req.params.id.toString());
  if (!report) return res.status(404).json({ success: false, message: "Report not found" });

  let vol = null;
  if (volunteerId) {
    vol = memStore.users.find((u) => u._id.toString() === volunteerId.toString());
    if (vol) {
      report.assignedVolunteerId = vol._id;
      report.assignedVolunteerName = vol.name;
      report.assignedVolunteerPhone = vol.phone || "";
    }
  }

  if (assignedTeam) report.assignedTeam = assignedTeam;
  report.status = "Assigned";

  res.json({ success: true, message: "Emergency assigned successfully!", report });
});

app.put("/reports/:id/status", optionalAuthMiddleware, (req, res) => {
  const { status } = req.body;
  const report = memStore.reports.find((r) => r._id.toString() === req.params.id.toString());
  if (!report) return res.status(404).json({ success: false, message: "Report not found" });

  report.status = status;
  res.json({ success: true, message: "Status updated", report });
});

// ===============================
// Start Server
// ===============================

app.listen(PORT, () => {
  console.log(`🚀 ResQNet Server is running on http://localhost:${PORT}`);
});