import { useState, useEffect, useMemo } from "react";
import {
  FaTimes,
  FaCheck,
  FaTint,
  FaMedkit,
  FaTools,
  FaFileInvoice,
  FaShieldAlt,
  FaCopy,
  FaRedo,
  FaSuitcaseRolling,
} from "react-icons/fa";

interface KitItem {
  id: string;
  name: string;
  desc: string;
  category: "Water & Food" | "Medical" | "Tools & Light" | "Power & Docs";
  essential: boolean;
}

const DEFAULT_KIT_ITEMS: KitItem[] = [
  // Water & Food
  {
    id: "water_ration",
    name: "Drinking Water (4L per person/day)",
    desc: "At least 3-day supply for drinking and sanitation.",
    category: "Water & Food",
    essential: true,
  },
  {
    id: "purification_tabs",
    name: "Water Purification Tablets / Filter",
    desc: "Chlorine dioxide tabs or ceramic filter for floodwater.",
    category: "Water & Food",
    essential: true,
  },
  {
    id: "nonperishable_food",
    name: "72-Hour Non-Perishable Food",
    desc: "Nutrient-dense protein bars, dry fruits, and ready-to-eat pouches.",
    category: "Water & Food",
    essential: true,
  },
  {
    id: "manual_opener",
    name: "Manual Can Opener & Metal Utensil",
    desc: "Required for canned rations during blackout.",
    category: "Water & Food",
    essential: false,
  },

  // Medical
  {
    id: "rx_meds",
    name: "7-Day Prescription Medications",
    desc: "Insulin, inhalers, blood pressure tablets, or epipens.",
    category: "Medical",
    essential: true,
  },
  {
    id: "trauma_gauze",
    name: "Sterile Gauze & Pressure Bandages",
    desc: "For dressing severe wounds and lacerations.",
    category: "Medical",
    essential: true,
  },
  {
    id: "antiseptic",
    name: "Antiseptic Wipes & Burn Ointment",
    desc: "Prevent bacterial infection and soothe flash burns.",
    category: "Medical",
    essential: true,
  },
  {
    id: "tourniquet",
    name: "Arterial Tourniquet & Trauma Shears",
    desc: "Rapid response to life-threatening limb hemorrhages.",
    category: "Medical",
    essential: false,
  },

  // Tools & Light
  {
    id: "torch",
    name: "Waterproof LED Torch & Spare Batteries",
    desc: "High-lumen flashlight for night navigation.",
    category: "Tools & Light",
    essential: true,
  },
  {
    id: "whistle",
    name: "Loud Emergency Whistle (100+ dB)",
    desc: "Signaling search dogs and rescue crews without wasting breath.",
    category: "Tools & Light",
    essential: true,
  },
  {
    id: "multitool",
    name: "Heavy-Duty Multi-Tool / Pliers",
    desc: "For shutting off utility gas valves, cutting wires, and opening latches.",
    category: "Tools & Light",
    essential: true,
  },
  {
    id: "mylar_blanket",
    name: "Reflective Mylar Thermal Space Blankets",
    desc: "Prevents hypothermia during wet nights and flash floods.",
    category: "Tools & Light",
    essential: true,
  },
  {
    id: "n95_masks",
    name: "N95 Dust & Smoke Particle Masks",
    desc: "Filters toxic dust from rubble or wildfire smoke.",
    category: "Tools & Light",
    essential: false,
  },

  // Power & Documents
  {
    id: "power_bank",
    name: "Fully Charged High-Capacity Power Bank",
    desc: "Keep phone operable for GPS emergency broadcasts.",
    category: "Power & Docs",
    essential: true,
  },
  {
    id: "crank_radio",
    name: "Emergency AM/FM Hand-Crank Radio",
    desc: "Receive meteorological broadcasts when cellular towers fail.",
    category: "Power & Docs",
    essential: true,
  },
  {
    id: "vital_docs",
    name: "Waterproof Pouch with IDs & Policies",
    desc: "Aadhaar/National ID, health insurance, deed copies.",
    category: "Power & Docs",
    essential: true,
  },
  {
    id: "emergency_cash",
    name: "Emergency Cash in Small Banknotes",
    desc: "ATMs and digital payment networks will be offline during grid outages.",
    category: "Power & Docs",
    essential: true,
  },
];

const STORAGE_KEY = "resqnet_emergency_kit_checklist_v1";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyKitModal({ isOpen, onClose }: Props) {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copied, setCopied] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCheckedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not read kit checklist storage:", e);
    }
  }, []);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleReset = () => {
    if (confirm("Reset all checked items in your Go-Bag checklist?")) {
      setCheckedIds([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const categories = ["All", "Water & Food", "Medical", "Tools & Light", "Power & Docs"];

  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") return DEFAULT_KIT_ITEMS;
    return DEFAULT_KIT_ITEMS.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const score = useMemo(() => {
    const total = DEFAULT_KIT_ITEMS.length;
    const packed = checkedIds.filter((id) =>
      DEFAULT_KIT_ITEMS.some((k) => k.id === id)
    ).length;
    return Math.round((packed / total) * 100);
  }, [checkedIds]);

  const getReadinessTier = () => {
    if (score >= 85) return { label: "Fully Mission Ready", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (score >= 50) return { label: "Moderate Readiness", color: "text-blue-700 bg-blue-50 border-blue-200" };
    if (score >= 25) return { label: "Partial Preparedness", color: "text-amber-700 bg-amber-50 border-amber-200" };
    return { label: "Critical Shortage - Pack Now", color: "text-red-700 bg-red-50 border-red-200" };
  };

  const tier = getReadinessTier();

  const handleCopySummary = () => {
    const packed = DEFAULT_KIT_ITEMS.filter((i) => checkedIds.includes(i.id)).map((i) => `✓ ${i.name}`);
    const missing = DEFAULT_KIT_ITEMS.filter((i) => !checkedIds.includes(i.id)).map((i) => `✗ ${i.name}`);

    const text = `🎒 RESQNET 72-HOUR DISASTER GO-BAG AUDIT
Readiness Score: ${score}% (${tier.label})

PACKED ITEMS (${packed.length}/${DEFAULT_KIT_ITEMS.length}):
${packed.join("\n")}

MISSING ESSENTIALS:
${missing.join("\n")}

Audited via ResQNet Emergency Network (https://resqnet.org)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="kit-modal-title"
      className="fixed inset-0 z-[125] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-black/[0.08] flex flex-col overflow-hidden text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-gradient-to-r from-gray-50 to-emerald-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow-sm">
              <FaSuitcaseRolling />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="kit-modal-title" className="text-lg font-bold tracking-tight text-gray-900">
                  72-Hour Disaster Go-Bag Checklist
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Offline Saved
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Essential supplies certified by disaster relief agencies for rapid evacuation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition active:scale-95"
          >
            <FaTimes />
          </button>
        </div>

        {/* READINESS SCORE BANNER */}
        <div className="px-6 py-4 border-b border-black/[0.06] bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Bag Readiness Score
              </span>
              <div className="flex items-center gap-3 mt-1">
                <h3 className="text-2xl font-black text-gray-900">{score}%</h3>
                <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${tier.color}`}>
                  {tier.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySummary}
                className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
              >
                {copied ? <FaCheck className="text-emerald-600" /> : <FaCopy />}
                <span>{copied ? "Copied" : "Share Kit"}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-500 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                title="Reset all checkboxes"
              >
                <FaRedo className="text-[10px]" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full transition-all duration-300 ${
                score >= 75
                  ? "bg-emerald-500"
                  : score >= 40
                  ? "bg-blue-500"
                  : "bg-amber-500"
              }`}
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>

        {/* CATEGORY FILTER TABS */}
        <div className="px-6 py-2.5 border-b border-black/[0.06] bg-gray-50/50 flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-white hover:bg-gray-100 text-gray-600 border border-black/[0.04]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* CHECKLIST ITEMS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5">
          {filteredItems.map((item) => {
            const isChecked = checkedIds.includes(item.id);

            const getCategoryIcon = () => {
              switch (item.category) {
                case "Water & Food":
                  return <FaTint className="text-blue-500" />;
                case "Medical":
                  return <FaMedkit className="text-red-500" />;
                case "Tools & Light":
                  return <FaTools className="text-amber-500" />;
                case "Power & Docs":
                  return <FaFileInvoice className="text-emerald-500" />;
              }
            };

            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-3.5 rounded-2xl cursor-pointer border flex items-center justify-between gap-3 transition-colors ${
                  isChecked
                    ? "bg-emerald-50/60 border-emerald-200/80 text-gray-900"
                    : "bg-white hover:bg-gray-50 border-black/[0.06] text-gray-700"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                      isChecked
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isChecked && <FaCheck className="text-[10px]" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-xs font-bold ${
                          isChecked ? "line-through text-gray-500" : "text-gray-900"
                        }`}
                      >
                        {item.name}
                      </p>
                      {item.essential && (
                        <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-extrabold text-[9px] uppercase">
                          Vital
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="text-sm shrink-0 pl-2">
                  {getCategoryIcon()}
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 border-t border-black/[0.06] bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <FaShieldAlt className="text-emerald-600" />
            <span>Store bag in an accessible hallway or vehicle trunk.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
