import { useState, useEffect } from "react";
import {
  FaTimes,
  FaRoute,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCompass,
  FaCopy,
  FaCheck,
  FaShieldAlt,
} from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface SectorInfo {
  id: string;
  name: string;
  riskLevel: "CRITICAL" | "HIGH" | "MODERATE";
  floodRisk: string;
}

interface DestinationShelter {
  id: string;
  name: string;
  elevation: string;
  distanceKm: number;
  bearingDeg: number;
  capacityStatus: string;
}

interface RouteHazard {
  id: string;
  status: "BLOCKED" | "CAUTION" | "CLEARED";
  location: string;
  hazardDescription: string;
  alternativeDirective: string;
}

interface WaypointStep {
  stepNumber: number;
  instruction: string;
  distance: string;
  warningNote?: string;
}

const SECTORS: SectorInfo[] = [
  { id: "coastal", name: "Sector 1 — Coastal Lowland Basin", riskLevel: "CRITICAL", floodRisk: "Storm surge > 2.5m" },
  { id: "riverfront", name: "Sector 2 — Riverbank Valley Corridor", riskLevel: "HIGH", floodRisk: "Rapid overflow & bridge closure" },
  { id: "downtown", name: "Sector 3 — Urban Dense Old City Block", riskLevel: "HIGH", floodRisk: "Drainage backflow & powerline hazard" },
  { id: "foothills", name: "Sector 4 — Western Hillside Flats", riskLevel: "MODERATE", floodRisk: "Runoff waters, structurally stable" },
];

const SHELTERS: DestinationShelter[] = [
  { id: "stadium", name: "Highland Sports Stadium Mega-Shelter", elevation: "+48m above sea level", distanceKm: 4.8, bearingDeg: 42, capacityStatus: "Open (1,450 beds remaining)" },
  { id: "school", name: "St. Xavier Central High School Camp B", elevation: "+34m above sea level", distanceKm: 3.2, bearingDeg: 315, capacityStatus: "Open (420 beds remaining)" },
  { id: "naval", name: "Naval Base Emergency Relief Center", elevation: "+52m above sea level", distanceKm: 7.1, bearingDeg: 120, capacityStatus: "Open (Field Hospital Operational)" },
];

const HAZARDS: RouteHazard[] = [
  {
    id: "h1",
    status: "BLOCKED",
    location: "Highway 4 Underpass & Tunnel",
    hazardDescription: "Water depth > 1.8m with submerged vehicles. Power lines damaged.",
    alternativeDirective: "STRICT DETOUR: Ascend via Eastern Ridge flyover ramp instead.",
  },
  {
    id: "h2",
    status: "BLOCKED",
    location: "Old Iron River Crossing Bridge",
    hazardDescription: "Structural abutment displacement detected by NDRF civil engineers.",
    alternativeDirective: "STRICT DETOUR: Use Metro Line Upper Concrete Viaduct walkway.",
  },
  {
    id: "h3",
    status: "CAUTION",
    location: "Market Square Roadway",
    hazardDescription: "Minor floating debris and single-lane mud accumulation.",
    alternativeDirective: "Slow down to 15 km/h. High-clearance vehicles and pedestrians only.",
  },
  {
    id: "h4",
    status: "CLEARED",
    location: "Highland Ring Road Bypass",
    hazardDescription: "Patrolled and cordoned by Civil Defense. Elevated and dry.",
    alternativeDirective: "Primary recommended evacuation corridor. Fully unobstructed.",
  },
];

const WAYPOINTS: WaypointStep[] = [
  {
    stepNumber: 1,
    instruction: "Exit residential block moving directly away from low-lying water channels.",
    distance: "600 meters",
    warningNote: "Do not attempt to cross alleyways with moving water > 15 cm deep.",
  },
  {
    stepNumber: 2,
    instruction: "Ascend the Eastern Flyover ramp towards Highland Ring Road Bypass.",
    distance: "1.4 km",
    warningNote: "Keep to elevated pedestrian walkway if traveling on foot.",
  },
  {
    stepNumber: 3,
    instruction: "Continue Northbound along Highland Ridge Corridor following NDRF signage.",
    distance: "2.1 km",
  },
  {
    stepNumber: 4,
    instruction: "Arrive at Destination Shelter Gate 3 for biometric registration and medical triage.",
    distance: "700 meters",
  },
];

export default function EvacuationRouteModal({ isOpen, onClose }: Props) {
  const [selectedSector, setSelectedSector] = useState("coastal");
  const [selectedShelter, setSelectedShelter] = useState("stadium");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const activeSector = SECTORS.find((s) => s.id === selectedSector) || SECTORS[0];
  const activeShelter = SHELTERS.find((s) => s.id === selectedShelter) || SHELTERS[0];

  const copyBriefing = () => {
    const text = `🚨 RESQNET SAFE EVACUATION CORRIDOR BRIEFING
Departure Zone: ${activeSector.name} (Risk: ${activeSector.riskLevel})
Target Shelter: ${activeShelter.name}
Elevation: ${activeShelter.elevation} | Est Distance: ${activeShelter.distanceKm} km | Heading: ${activeShelter.bearingDeg}°
----------------------------------------
CRITICAL ROAD CLEARANCE STATUS:
🔴 BLOCKED: Highway 4 Underpass (Water > 1.8m, power lines)
🔴 BLOCKED: Old Iron Bridge (Structural failure risk)
🟢 CLEARED: Highland Ring Road Bypass (NDRF Patrolled)
----------------------------------------
KEY ROUTE DIRECTIVE:
Ascend Eastern Flyover ramp -> Connect to Highland Ring Road -> Arrive at Shelter Gate 3.
NEVER drive or walk into moving water. Turn around, don't drown!
Generated via ResQNet Evacuation Clearance Sentinel`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="evacuation-modal-title"
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-black/[0.08] flex flex-col max-h-[92vh] overflow-hidden text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50/40 to-blue-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-lg shadow-sm">
              <FaRoute />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="evacuation-modal-title" className="text-base font-bold text-gray-900">
                  Evacuation Route &amp; Hazard Clearance Navigator
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  Safe Corridors
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Verified clear egress waypoints bypassing flooded underpasses, collapsed bridges, and power lines
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition active:scale-95"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* SECTOR & DESTINATION SHELTER SELECTORS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-black/[0.06]">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Your Current Danger Zone / Sector:
              </label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SECTORS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.riskLevel})
                  </option>
                ))}
              </select>
              <p className="text-[11px] font-medium text-rose-700 mt-1">
                ⚠️ Hazard: {activeSector.floodRisk}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 border border-black/[0.06]">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Target Safe Haven / Relief Shelter:
              </label>
              <select
                value={selectedShelter}
                onChange={(e) => setSelectedShelter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SHELTERS.map((sh) => (
                  <option key={sh.id} value={sh.id}>
                    {sh.name}
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 mt-1">
                <span>Elevation: {activeShelter.elevation}</span>
                <span>{activeShelter.distanceKm} km direct</span>
              </div>
            </div>
          </div>

          {/* COMPASS BEARING & DISTANCE HERO STRIP */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-900 to-indigo-950 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg text-emerald-400">
                <FaCompass />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Target Bearing &amp; Direction
                </p>
                <p className="text-base font-black">
                  Heading: {activeShelter.bearingDeg}° (Northeast Corridor)
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xl font-black text-emerald-400">
                ~{Math.round(activeShelter.distanceKm * 1.25)} km
              </p>
              <p className="text-[10px] text-gray-400">Clear Route Distance</p>
            </div>
          </div>

          {/* ACTIVE HAZARDS & ROAD CLEARANCE STATUS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                Civil Defense Route Hazard Clearance Feed
              </span>
              <span className="text-[10px] text-gray-500 font-medium">Updated 4 mins ago</span>
            </div>

            <div className="space-y-2">
              {HAZARDS.map((h) => {
                const isBlocked = h.status === "BLOCKED";
                const isCaution = h.status === "CAUTION";

                return (
                  <div
                    key={h.id}
                    className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 transition ${
                      isBlocked
                        ? "bg-rose-50/70 border-rose-200"
                        : isCaution
                        ? "bg-amber-50/70 border-amber-200"
                        : "bg-emerald-50/70 border-emerald-200"
                    }`}
                  >
                    <div className="mt-0.5">
                      {isBlocked ? (
                        <FaExclamationTriangle className="text-rose-600 text-sm" />
                      ) : isCaution ? (
                        <FaExclamationTriangle className="text-amber-600 text-sm" />
                      ) : (
                        <FaCheckCircle className="text-emerald-600 text-sm" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-gray-900 font-bold">{h.location}</strong>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isBlocked
                              ? "bg-rose-100 text-rose-800"
                              : isCaution
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {h.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-[11px] mt-0.5">{h.hazardDescription}</p>
                      <p className="text-gray-900 font-semibold text-[11px] mt-1 flex items-center gap-1">
                        <span className="text-blue-600 font-bold">↳</span>
                        <span>{h.alternativeDirective}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TURN-BY-TURN WAYPOINT DIRECTIVES */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
              Recommended Turn-by-Turn Safe Waypoints
            </span>

            <div className="space-y-2 bg-gray-50/70 p-3.5 rounded-2xl border border-black/[0.04]">
              {WAYPOINTS.map((w) => (
                <div key={w.stepNumber} className="flex items-start gap-3 text-xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 shadow-2xs">
                    {w.stepNumber}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{w.instruction}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-0.5">
                      <span>Leg: {w.distance}</span>
                      {w.warningNote && (
                        <span className="text-amber-800 font-medium">⚠️ {w.warningNote}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SURVIVAL EVACUATION DIRECTIVE */}
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5">
            <FaShieldAlt className="text-blue-600 text-base shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold block">FEMA / NDRF Mandatory Evacuation Golden Rules:</span>
              1. Never attempt to drive through water of unknown depth — 30 cm of water can float small vehicles; 60 cm sweeps SUVs.
              2. Cut main electricity switch and LPG gas cylinder valve before walking out.
              3. Wear enclosed hard shoes, carry your 72-Hour Go-Bag and ICE ID.
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3.5 border-t border-black/[0.06] bg-gray-50 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={copyBriefing}
            className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 border border-black/[0.08] text-gray-800 font-bold flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
          >
            {copied ? <FaCheck className="text-emerald-600 text-xs" /> : <FaCopy className="text-xs" />}
            <span>{copied ? "Copied Evacuation Plan" : "Copy Evacuation Plan"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-bold transition active:scale-95"
          >
            Close Navigator
          </button>
        </div>
      </div>
    </div>
  );
}
