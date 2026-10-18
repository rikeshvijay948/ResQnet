import { useState } from "react";
import {
  FaTimes,
  FaPhoneAlt,
  FaCopy,
  FaSearch,
  FaAmbulance,
  FaFireExtinguisher,
  FaShieldAlt,
  FaShip,
  FaHandsHelping,
  FaCheck,
} from "react-icons/fa";

interface Hotline {
  name: string;
  category: "National" | "Medical" | "Fire" | "Disaster" | "Marine" | "Protection";
  number: string;
  description: string;
  icon: any;
  color: string;
}

const EMERGENCY_HOTLINES: Hotline[] = [
  {
    name: "National Emergency Helpline (All-in-One)",
    category: "National",
    number: "112",
    description: "Unified pan-India emergency number for Police, Fire, and Ambulance.",
    icon: FaShieldAlt,
    color: "bg-red-600 text-white",
  },
  {
    name: "NDRF National Disaster Helpline",
    category: "Disaster",
    number: "1078",
    description: "National Disaster Response Force control room for flood, cyclone & earthquake aid.",
    icon: FaHandsHelping,
    color: "bg-blue-600 text-white",
  },
  {
    name: "Ambulance & Emergency Medical Service",
    category: "Medical",
    number: "108",
    description: "Immediate trauma response, ambulance dispatch, and critical medical assistance.",
    icon: FaAmbulance,
    color: "bg-emerald-600 text-white",
  },
  {
    name: "Fire & Rescue Brigade",
    category: "Fire",
    number: "101",
    description: "Fire control room, trapped citizen extraction, and hazardous gas mitigation.",
    icon: FaFireExtinguisher,
    color: "bg-orange-600 text-white",
  },
  {
    name: "Police Emergency Assistance",
    category: "National",
    number: "100",
    description: "Immediate civil assistance, evacuation coordination, and security containment.",
    icon: FaShieldAlt,
    color: "bg-indigo-600 text-white",
  },
  {
    name: "Indian Coast Guard (Sea & Marine Rescue)",
    category: "Marine",
    number: "1554",
    description: "Maritime distress, storm surge evacuations, and deep-water search & rescue.",
    icon: FaShip,
    color: "bg-cyan-600 text-white",
  },
  {
    name: "State Disaster Management Authority (SDMA)",
    category: "Disaster",
    number: "1070",
    description: "State-level emergency operations center and relief camp allocations.",
    icon: FaHandsHelping,
    color: "bg-purple-600 text-white",
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyHotlinesModal({ isOpen, onClose }: Props) {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  if (!isOpen) return null;

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const filteredHotlines = EMERGENCY_HOTLINES.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.number.includes(search) ||
      h.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || h.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-black/[0.08] overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
              <span className="text-xs uppercase tracking-wider font-bold text-red-100">
                Direct Emergency Dispatch
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
              National Emergency & Disaster Hotlines
            </h2>
            <p className="text-xs text-red-100 mt-0.5">
              Toll-free 24/7 direct dialers for national rescue forces and critical emergency services.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
            title="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/70 space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <FaSearch className="text-xs" />
            </div>
            <input
              type="text"
              placeholder="Search helpline name, number or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-black/[0.08] rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {["All", "National", "Disaster", "Medical", "Fire", "Marine"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-white text-gray-600 border border-black/[0.06] hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Hotlines Directory List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 divide-y divide-gray-100 flex-1">
          {filteredHotlines.map((hotline, idx) => {
            const Icon = hotline.icon;
            const isCopied = copiedNumber === hotline.number;

            return (
              <div
                key={idx}
                className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${hotline.color}`}
                  >
                    <Icon className="text-lg" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-gray-900">{hotline.name}</h3>
                      <span className="px-2 py-0.2 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase">
                        {hotline.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 max-w-md">{hotline.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center ml-14 sm:ml-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(hotline.number)}
                    className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                    title="Copy Number"
                  >
                    {isCopied ? (
                      <>
                        <FaCheck className="text-emerald-600 text-[10px]" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <FaCopy className="text-[10px]" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`tel:${hotline.number}`}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
                  >
                    <FaPhoneAlt className="text-[10px]" />
                    <span>Call {hotline.number}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>All emergency hotlines are free of charge & accessible 24/7.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
