import { useState, useEffect } from "react";
import {
  FaTimes,
  FaCompass,
  FaCrosshairs,
  FaShieldAlt,
  FaSyncAlt,
} from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function TacticalCompassModal({ isOpen, onClose }: Props) {
  const [heading, setHeading] = useState<number>(0);
  const [coords, setCoords] = useState<{ lat: number; lng: number; alt: number | null; accuracy: number | null } | null>(null);
  const [geoError, setGeoError] = useState("");
  const [hasCompassSupport, setHasCompassSupport] = useState(false);

  // Device orientation listener (Gyroscope / Magnetometer)
  useEffect(() => {
    if (!isOpen) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      let compassHeading: number | null = null;

      // iOS Safari webkitCompassHeading
      if ("webkitCompassHeading" in e && typeof (e as any).webkitCompassHeading === "number") {
        compassHeading = (e as any).webkitCompassHeading;
      } else if (e.alpha !== null) {
        // Standard Android / Chrome heading
        compassHeading = 360 - e.alpha;
      }

      if (compassHeading !== null) {
        setHasCompassSupport(true);
        setHeading(Math.round(compassHeading) % 360);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientationabsolute" as any, handleOrientation, true);
      window.addEventListener("deviceorientation", handleOrientation, true);
    }

    // Geolocation watch
    let watchId: number | null = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            alt: pos.coords.altitude,
            accuracy: pos.coords.accuracy,
          });
          if (pos.coords.heading !== null && !isNaN(pos.coords.heading)) {
            setHeading(Math.round(pos.coords.heading));
          }
        },
        (err) => {
          setGeoError(err.message || "Location telemetry unavailable");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 }
      );
    }

    return () => {
      window.removeEventListener("deviceorientationabsolute" as any, handleOrientation, true);
      window.removeEventListener("deviceorientation", handleOrientation, true);
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isOpen]);

  const getCardinal = (deg: number): string => {
    const directions = [
      "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
      "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
    ];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="compass-modal-title"
      className="fixed inset-0 z-[125] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-gray-950 text-white rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col items-center text-center p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="w-full flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm">
              <FaCompass />
            </div>
            <div className="text-left">
              <h3 id="compass-modal-title" className="text-xs font-bold uppercase tracking-wider text-white">
                Tactical Bearing HUD
              </h3>
              <p className="text-[10px] text-gray-400">
                SAR Field Orientation & Telemetry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white flex items-center justify-center transition"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* BEARING READOUT */}
        <div className="mb-2">
          <div className="text-5xl font-mono font-black text-white tracking-tight flex items-baseline justify-center gap-1">
            <span>{heading}°</span>
            <span className="text-2xl text-cyan-400 font-sans font-extrabold">
              {getCardinal(heading)}
            </span>
          </div>
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-0.5">
            Magnetic Heading
          </p>
        </div>

        {/* ROTATING COMPASS DIAL */}
        <div className="relative w-64 h-64 my-4 flex items-center justify-center select-none">
          {/* Static Crosshairs */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-px bg-cyan-500/20"></div>
            <div className="h-full w-px bg-cyan-500/20 absolute"></div>
            <FaCrosshairs className="text-cyan-400/40 text-lg absolute" />
          </div>

          {/* Heading Marker (Top Arrow) */}
          <div className="absolute top-0 flex flex-col items-center z-10">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-red-500"></div>
          </div>

          {/* Rotating Compass Ring */}
          <div
            className="w-56 h-56 rounded-full border-2 border-white/20 relative flex items-center justify-center transition-transform duration-100 ease-out shadow-inner"
            style={{ transform: `rotate(-${heading}deg)` }}
          >
            {/* Cardinal Markers */}
            <span className="absolute top-2 font-black text-red-500 text-sm">N</span>
            <span className="absolute right-3 font-bold text-gray-300 text-xs">E</span>
            <span className="absolute bottom-2 font-bold text-gray-300 text-xs">S</span>
            <span className="absolute left-3 font-bold text-gray-300 text-xs">W</span>

            {/* Minor Ticks */}
            <span className="absolute top-6 right-6 font-semibold text-[9px] text-gray-500">NE</span>
            <span className="absolute bottom-6 right-6 font-semibold text-[9px] text-gray-500">SE</span>
            <span className="absolute bottom-6 left-6 font-semibold text-[9px] text-gray-500">SW</span>
            <span className="absolute top-6 left-6 font-semibold text-[9px] text-gray-500">NW</span>

            {/* Inner Ring */}
            <div className="w-40 h-40 rounded-full border border-dashed border-white/15 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border border-white/10"></div>
            </div>
          </div>
        </div>

        {/* MANUAL ADJUST SLIDER (FOR DESKTOP / GYRO FALLBACK) */}
        {!hasCompassSupport && (
          <div className="w-full px-4 py-2 bg-white/5 rounded-2xl border border-white/10 mb-3 text-left">
            <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
              <span>Manual Bearing Calibrator:</span>
              <span className="font-mono text-cyan-400">{heading}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="359"
              value={heading}
              onChange={(e) => setHeading(Number(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        )}

        {/* GEODATA TELEMETRY BOX */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-left space-y-1 text-xs">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-gray-400">LAT / LNG:</span>
            <span className="text-white font-bold">
              {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : "Acquiring Fix..."}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-gray-400">GPS ACCURACY:</span>
            <span className="text-cyan-400">
              {coords?.accuracy ? `±${Math.round(coords.accuracy)}m` : "Standby"}
            </span>
          </div>
          {geoError && (
            <p className="text-[10px] text-amber-400 pt-1">{geoError}</p>
          )}
        </div>

        {/* FOOTER */}
        <div className="w-full mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <FaShieldAlt className="text-cyan-500" />
            Tactical HUD
          </span>
          <button
            type="button"
            onClick={() => setHeading((prev) => (prev + 45) % 360)}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold text-[10px]"
          >
            <FaSyncAlt /> Step +45°
          </button>
        </div>
      </div>
    </div>
  );
}
