import { useState } from "react";
import {
  FaCloudRain,
  FaWind,
  FaThermometerHalf,
  FaEye,
  FaExclamationTriangle,
  FaSyncAlt,
} from "react-icons/fa";

interface WeatherRegion {
  id: string;
  name: string;
  temp: number;
  condition: string;
  windSpeed: number;
  windDirection: string;
  humidity: number;
  precipChance: number;
  visibility: number; // km
  hazardLevel: "Low" | "Moderate" | "Severe" | "Critical";
  advisory: string;
}

const REGION_DATA: WeatherRegion[] = [
  {
    id: "mumbai",
    name: "Mumbai Coastal Zone",
    temp: 29,
    condition: "Squally Winds & Rain",
    windSpeed: 48,
    windDirection: "WSW",
    humidity: 88,
    precipChance: 82,
    visibility: 4.5,
    hazardLevel: "Severe",
    advisory: "High tidal surge expected at 18:30 IST. Waterlogging risk along low-lying coastal arteries.",
  },
  {
    id: "pune",
    name: "Western Ghats / Pune",
    temp: 24,
    condition: "Heavy Mountain Downpour",
    windSpeed: 34,
    windDirection: "SW",
    humidity: 92,
    precipChance: 75,
    visibility: 3.2,
    hazardLevel: "Moderate",
    advisory: "Saturated soil layers. Landslide surveillance active across ghat corridors.",
  },
  {
    id: "konkan",
    name: "Konkan Marine Belt",
    temp: 27,
    condition: "Tropical Depression Bands",
    windSpeed: 62,
    windDirection: "W",
    humidity: 95,
    precipChance: 90,
    visibility: 2.8,
    hazardLevel: "Critical",
    advisory: "Gale-force gusts exceeding 60 km/h. Complete ban on coastal fishing and small boat operations.",
  },
  {
    id: "delhi",
    name: "Delhi NCR Northern Plains",
    temp: 31,
    condition: "Hazy & Dry Winds",
    windSpeed: 16,
    windDirection: "NW",
    humidity: 52,
    precipChance: 12,
    visibility: 6.0,
    hazardLevel: "Low",
    advisory: "Standard operational weather. Ambient heat precautions advised during afternoon rescue drills.",
  },
];

export default function WeatherHazardWidget() {
  const [selectedRegionId, setSelectedRegionId] = useState("mumbai");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const region = REGION_DATA.find((r) => r.id === selectedRegionId) || REGION_DATA[0];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const getHazardBadge = (level: WeatherRegion["hazardLevel"]) => {
    switch (level) {
      case "Critical":
        return "bg-red-600 text-white animate-pulse";
      case "Severe":
        return "bg-orange-500 text-white";
      case "Moderate":
        return "bg-amber-100 text-amber-800 border border-amber-300";
      default:
        return "bg-emerald-100 text-emerald-800 border border-emerald-300";
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-sm border border-black/[0.06] mb-8">
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-sm shadow-2xs">
            <FaCloudRain />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <span>Meteorological & Hazard Sentinel</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getHazardBadge(region.hazardLevel)}`}>
                {region.hazardLevel} Risk
              </span>
            </h3>
            <p className="text-[11px] text-gray-400">
              Real-time atmospheric telemetry for disaster dispatchers
            </p>
          </div>
        </div>

        {/* REGION PICKER & REFRESH */}
        <div className="flex items-center gap-2">
          <select
            value={selectedRegionId}
            onChange={(e) => setSelectedRegionId(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-gray-50 border border-black/[0.08] text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {REGION_DATA.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs transition"
            title="Refresh Meteorological Feed"
          >
            <FaSyncAlt className={isRefreshing ? "animate-spin text-blue-600" : ""} />
          </button>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        {/* TEMPERATURE */}
        <div className="p-3 rounded-2xl bg-gray-50/70 border border-black/[0.04]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <FaThermometerHalf className="text-orange-500" />
            <span>Temp</span>
          </span>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {region.temp}°C
          </p>
          <span className="text-[10px] text-gray-500 truncate block">
            {region.condition}
          </span>
        </div>

        {/* WIND SPEED */}
        <div className="p-3 rounded-2xl bg-gray-50/70 border border-black/[0.04]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <FaWind className="text-cyan-500" />
            <span>Wind Gusts</span>
          </span>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {region.windSpeed} <span className="text-xs font-normal text-gray-500">km/h</span>
          </p>
          <span className="text-[10px] text-gray-500">
            Bearing: <strong>{region.windDirection}</strong>
          </span>
        </div>

        {/* PRECIPITATION / FLOOD THREAT */}
        <div className="p-3 rounded-2xl bg-gray-50/70 border border-black/[0.04]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <FaCloudRain className="text-blue-500" />
            <span>Rain Risk</span>
          </span>
          <p className="text-xl font-bold text-blue-600 mt-1">
            {region.precipChance}%
          </p>
          <span className="text-[10px] text-gray-500">
            Humidity: {region.humidity}%
          </span>
        </div>

        {/* VISIBILITY */}
        <div className="p-3 rounded-2xl bg-gray-50/70 border border-black/[0.04]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <FaEye className="text-purple-500" />
            <span>SAR Visibility</span>
          </span>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {region.visibility} <span className="text-xs font-normal text-gray-500">km</span>
          </p>
          <span className="text-[10px] text-gray-500">
            {region.visibility < 3 ? "Restricted Aerial" : "Clear Flight Corridor"}
          </span>
        </div>
      </div>

      {/* ADVISORY BANNER */}
      <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
        <FaExclamationTriangle className="text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-bold">Active Sector Advisory:</strong> {region.advisory}
        </p>
      </div>
    </div>
  );
}
