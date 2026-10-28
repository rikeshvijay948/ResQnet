import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaTimes,
  FaMapMarkedAlt,
  FaPlusCircle,
  FaChartPie,
  FaHospital,
  FaBoxes,
  FaHandsHelping,
  FaUser,
  FaPhoneAlt,
  FaBookOpen,
  FaVolumeUp,
  FaCompass,
  FaLightbulb,
} from "react-icons/fa";
import { soundAlerts } from "../../utils/soundAlerts";

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Navigation" | "Emergency Action" | "Tools";
  icon: any;
  color: string;
  badge?: string;
  action: () => void;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPaletteModal({ isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: "report-emergency",
        title: "Report New Emergency",
        subtitle: "Dispatch new incident with geo-location, photo & AI classification",
        category: "Emergency Action",
        icon: FaPlusCircle,
        color: "bg-red-600 text-white",
        badge: "Alt + R",
        action: () => {
          navigate("/report-emergency");
          onClose();
        },
      },
      {
        id: "command-center",
        title: "Command Center Map",
        subtitle: "Live incident geodata, responder triage, and real-time dispatch",
        category: "Navigation",
        icon: FaMapMarkedAlt,
        color: "bg-blue-600 text-white",
        badge: "Alt + M",
        action: () => {
          navigate("/dashboard");
          onClose();
        },
      },
      {
        id: "sos-hotlines",
        title: "24/7 Emergency Helplines",
        subtitle: "One-tap direct dial for NDRF (1078), 112, 108, 101 & Coast Guard",
        category: "Emergency Action",
        icon: FaPhoneAlt,
        color: "bg-rose-600 text-white",
        badge: "Alt + H",
        action: () => {
          onClose();
          window.dispatchEvent(new CustomEvent("open-hotlines-modal"));
        },
      },
      {
        id: "sos-beacon",
        title: "SOS Flashlight & Strobe Beacon",
        subtitle: "Full-screen Morse code optical beacon and acoustic distress alarm for night rescue",
        category: "Emergency Action",
        icon: FaLightbulb,
        color: "bg-amber-500 text-black",
        badge: "Alt + B",
        action: () => {
          onClose();
          window.dispatchEvent(new CustomEvent("open-beacon-modal"));
        },
      },
      {
        id: "first-aid-guide",
        title: "Disaster Survival & CPR Guide",
        subtitle: "Step-by-step protocols for Earthquake, Flood, Fire & 100-120 BPM CPR",
        category: "Emergency Action",
        icon: FaBookOpen,
        color: "bg-teal-600 text-white",
        badge: "Alt + G",
        action: () => {
          onClose();
          window.dispatchEvent(new CustomEvent("open-disaster-guide"));
        },
      },
      {
        id: "toggle-sirens",
        title: "Toggle Audible Siren Alerts",
        subtitle: "Enable/disable acoustic Web Audio sirens for incoming P1 incidents",
        category: "Tools",
        icon: FaVolumeUp,
        color: "bg-purple-600 text-white",
        action: () => {
          soundAlerts.toggle();
          onClose();
        },
      },
      {
        id: "track-emergency",
        title: "Track Incident by Reference ID",
        subtitle: "Follow live rescue status, assigned units & timeline updates",
        category: "Navigation",
        icon: FaCompass,
        color: "bg-amber-600 text-white",
        action: () => {
          navigate("/track");
          onClose();
        },
      },
      {
        id: "analytics",
        title: "Disaster Intelligence & Analytics",
        subtitle: "Crisis trends, predictive clustering, and response metrics",
        category: "Navigation",
        icon: FaChartPie,
        color: "bg-indigo-600 text-white",
        action: () => {
          navigate("/analytics");
          onClose();
        },
      },
      {
        id: "facilities",
        title: "Shelters & Medical Facilities",
        subtitle: "Locate operating shelters, field hospitals, and relief centers",
        category: "Navigation",
        icon: FaHospital,
        color: "bg-emerald-600 text-white",
        action: () => {
          navigate("/facilities");
          onClose();
        },
      },
      {
        id: "resources",
        title: "Resource & Equipment Inventory",
        subtitle: "Track boats, rescue drones, blood banks, and food kits",
        category: "Navigation",
        icon: FaBoxes,
        color: "bg-orange-600 text-white",
        action: () => {
          navigate("/resources");
          onClose();
        },
      },
      {
        id: "volunteer-desk",
        title: "Volunteer Mission Desk",
        subtitle: "Tactical directives, safety checklists, and active assignments",
        category: "Navigation",
        icon: FaHandsHelping,
        color: "bg-cyan-600 text-white",
        action: () => {
          navigate("/volunteer/dashboard");
          onClose();
        },
      },
      {
        id: "citizen-hub",
        title: "Citizen Emergency Hub",
        subtitle: "Personal emergency logs, safety status, and family contacts",
        category: "Navigation",
        icon: FaUser,
        color: "bg-emerald-700 text-white",
        action: () => {
          navigate("/citizen/dashboard");
          onClose();
        },
      },
    ],
    [navigate, onClose]
  );

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase().trim();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input upon open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = filteredCommands[selectedIndex];
      if (current) current.action();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-palette-title"
      className="fixed inset-0 z-[120] flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-black/[0.08] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* SEARCH INPUT BAR */}
        <div className="relative border-b border-black/[0.06] flex items-center px-4 py-3 bg-gray-50/50">
          <FaSearch className="text-gray-400 text-sm ml-2 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page name, or action (e.g., 'map', 'siren', 'cpr')..."
            className="w-full bg-transparent text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <FaTimes className="text-xs" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-gray-400 bg-white border border-black/[0.08] rounded-md shadow-2xs">
              ESC
            </kbd>
          )}
        </div>

        {/* COMMAND LIST */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto p-2 space-y-1 divide-y divide-gray-50"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              No matching command or destination found for &quot;{query}&quot;.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = cmd.icon;

              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3.5 py-3 rounded-2xl cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                    isSelected
                      ? "bg-blue-50/80 text-blue-900 ring-1 ring-blue-500/20"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs text-sm ${cmd.color}`}
                    >
                      <Icon />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-xs font-bold truncate ${
                            isSelected ? "text-blue-900" : "text-gray-900"
                          }`}
                        >
                          {cmd.title}
                        </p>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {cmd.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {cmd.subtitle}
                      </p>
                    </div>
                  </div>

                  {cmd.badge && (
                    <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-gray-500 bg-gray-100 rounded-md border border-black/[0.06] shrink-0">
                      {cmd.badge}
                    </kbd>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER HELPER */}
        <div className="px-4 py-2.5 border-t border-black/[0.06] bg-gray-50 flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-black/[0.08] font-mono text-[9px] mr-1">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-black/[0.08] font-mono text-[9px] mr-1">
                ↵
              </kbd>
              Execute
            </span>
          </div>
          <span>Press <kbd className="px-1 py-0.5 rounded bg-white border border-black/[0.08] font-mono text-[9px]">Ctrl+K</kbd> anywhere</span>
        </div>
      </div>
    </div>
  );
}
