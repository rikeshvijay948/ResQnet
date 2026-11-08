import { useState, useEffect } from "react";
import {
  FaTimes,
  FaHeartbeat,
  FaWalking,
  FaLungs,
  FaBrain,
  FaRedo,
  FaCopy,
  FaCheck,
  FaPlus,
  FaMinus,
  FaClipboardList,
} from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type TriageCategory = "IMMEDIATE" | "DELAYED" | "MINOR" | "EXPECTANT" | null;

interface TriageResult {
  category: TriageCategory;
  priority: string;
  colorName: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  summary: string;
  treatmentNotes: string[];
}

export default function STARTTriageModal({ isOpen, onClose }: Props) {
  const [mode, setMode] = useState<"adult" | "pediatric">("adult");
  const [activeTab, setActiveTab] = useState<"calculator" | "guide" | "counter">("calculator");

  // Assessment inputs
  const [isAmbulatory, setIsAmbulatory] = useState<boolean | null>(null);
  const [isBreathing, setIsBreathing] = useState<boolean | null>(null);
  const [airwayRepositionedBreathing, setAirwayRepositionedBreathing] = useState<boolean | null>(null);
  const [hasPulsePediatricApnea, setHasPulsePediatricApnea] = useState<boolean | null>(null);
  const [breathingRateAbnormal, setBreathingRateAbnormal] = useState<boolean | null>(null);
  const [perfusionCompromised, setPerfusionCompromised] = useState<boolean | null>(null);
  const [mentalStatusImpaired, setMentalStatusImpaired] = useState<boolean | null>(null);

  // Casualty tally counter state
  const [sectorName, setSectorName] = useState("Sector 1 (Disaster Ground Zero)");
  const [tally, setTally] = useState({
    red: 0,
    yellow: 0,
    green: 0,
    black: 0,
  });
  const [tallyCopied, setTallyCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const resetCalculator = () => {
    setIsAmbulatory(null);
    setIsBreathing(null);
    setAirwayRepositionedBreathing(null);
    setHasPulsePediatricApnea(null);
    setBreathingRateAbnormal(null);
    setPerfusionCompromised(null);
    setMentalStatusImpaired(null);
  };

  // Algorithmic determination of category
  const getTriageResult = (): TriageResult | null => {
    // 1. Ambulatory
    if (isAmbulatory === true) {
      return {
        category: "MINOR",
        priority: "Priority 3 (P3)",
        colorName: "GREEN",
        badgeBg: "bg-emerald-500",
        badgeText: "text-white",
        borderColor: "border-emerald-500",
        summary: "Walking wounded. Minor injuries, alert, mobile.",
        treatmentNotes: [
          "Direct patient to designated secondary triage / assembly point.",
          "Re-evaluate if condition deteriorates or pain escalates.",
          "Apply basic wound dressing or splinting as resources allow.",
        ],
      };
    }

    if (isAmbulatory === false) {
      // 2. Respiration presence
      if (isBreathing === false) {
        if (mode === "adult") {
          if (airwayRepositionedBreathing === false) {
            return {
              category: "EXPECTANT",
              priority: "Priority 4 (P4)",
              colorName: "BLACK",
              badgeBg: "bg-gray-900",
              badgeText: "text-white",
              borderColor: "border-gray-900",
              summary: "Deceased or non-salvageable in mass casualty incident.",
              treatmentNotes: [
                "Apneic despite airway repositioning.",
                "Provide palliative comfort if signs of life emerge.",
                "Conserve active medical resources for immediate salvageable victims.",
              ],
            };
          }
          if (airwayRepositionedBreathing === true) {
            return {
              category: "IMMEDIATE",
              priority: "Priority 1 (P1)",
              colorName: "RED",
              badgeBg: "bg-red-600",
              badgeText: "text-white",
              borderColor: "border-red-600",
              summary: "Critical life threat. Airway requires ongoing maintenance.",
              treatmentNotes: [
                "Position recovery angle or insert nasopharyngeal/oropharyngeal airway.",
                "Immediate MEDEVAC or field surgical triage priority.",
              ],
            };
          }
        } else {
          // Pediatric JumpSTART protocol
          if (hasPulsePediatricApnea === false) {
            return {
              category: "EXPECTANT",
              priority: "Priority 4 (P4)",
              colorName: "BLACK",
              badgeBg: "bg-gray-900",
              badgeText: "text-white",
              borderColor: "border-gray-900",
              summary: "Pediatric deceased/expectant. No breathing & no pulse.",
              treatmentNotes: ["Conserve pediatric resuscitation capacity for salvageable victims."],
            };
          }
          if (hasPulsePediatricApnea === true) {
            return {
              category: "IMMEDIATE",
              priority: "Priority 1 (P1)",
              colorName: "RED",
              badgeBg: "bg-red-600",
              badgeText: "text-white",
              borderColor: "border-red-600",
              summary: "Pediatric respiratory arrest with palpable pulse.",
              treatmentNotes: [
                "Administer 5 rescue ventilations immediately.",
                "If breathing resumes, maintain airway; if not, re-evaluate.",
                "Immediate pediatric trauma transfer.",
              ],
            };
          }
        }
      }

      if (isBreathing === true) {
        // Respiratory Rate
        if (breathingRateAbnormal === true) {
          return {
            category: "IMMEDIATE",
            priority: "Priority 1 (P1)",
            colorName: "RED",
            badgeBg: "bg-red-600",
            badgeText: "text-white",
            borderColor: "border-red-600",
            summary: mode === "adult"
              ? "Tachypnea (>30 bpm) or Bradypnea (<10 bpm). Severe respiratory distress."
              : "Pediatric respiratory rate abnormal (<15 or >45 bpm).",
            treatmentNotes: [
              "Immediate supplemental high-flow oxygen if available.",
              "Inspect for tension pneumothorax, flail chest, or inhalation injury.",
              "Top priority for evacuation transport.",
            ],
          };
        }

        if (breathingRateAbnormal === false) {
          // Perfusion
          if (perfusionCompromised === true) {
            return {
              category: "IMMEDIATE",
              priority: "Priority 1 (P1)",
              colorName: "RED",
              badgeBg: "bg-red-600",
              badgeText: "text-white",
              borderColor: "border-red-600",
              summary: "Poor perfusion (Radial pulse absent or Capillary Refill > 2 seconds).",
              treatmentNotes: [
                "Control catastrophic external hemorrhage immediately with tourniquet / pressure packing.",
                "Maintain core body temperature and elevate lower extremities if non-spinal.",
                "Urgent surgical stabilization required.",
              ],
            };
          }

          if (perfusionCompromised === false) {
            // Mental Status
            if (mentalStatusImpaired === true) {
              return {
                category: "IMMEDIATE",
                priority: "Priority 1 (P1)",
                colorName: "RED",
                badgeBg: "bg-red-600",
                badgeText: "text-white",
                borderColor: "border-red-600",
                summary: "Neurologically impaired. Inability to follow simple commands.",
                treatmentNotes: [
                  "Suspect traumatic brain injury (TBI), severe hypoxia, or internal shock.",
                  "C-spine precaution if trauma etiology suspected.",
                  "Immediate transport priority.",
                ],
              };
            }

            if (mentalStatusImpaired === false) {
              return {
                category: "DELAYED",
                priority: "Priority 2 (P2)",
                colorName: "YELLOW",
                badgeBg: "bg-amber-400",
                badgeText: "text-gray-900",
                borderColor: "border-amber-400",
                summary: "Serious injury but vital functions stable. Non-ambulatory.",
                treatmentNotes: [
                  "Requires secondary hospital care but stable for 1-2 hour transport delay.",
                  "Re-assess vitals every 15-30 minutes for deterioration.",
                  "Splint fractures and maintain spinal immobilization if indicated.",
                ],
              };
            }
          }
        }
      }
    }

    return null;
  };

  const triageResult = getTriageResult();

  // Add casualty to current sector tally
  const addToTally = (color: "red" | "yellow" | "green" | "black") => {
    setTally((prev) => ({ ...prev, [color]: prev[color] + 1 }));
  };

  const adjustTally = (color: "red" | "yellow" | "green" | "black", delta: number) => {
    setTally((prev) => ({ ...prev, [color]: Math.max(0, prev[color] + delta) }));
  };

  const copyTallyReport = () => {
    const total = tally.red + tally.yellow + tally.green + tally.black;
    const text = `🚨 RESQNET MASS-CASUALTY TRIAGE REPORT
Location / Sector: ${sectorName}
Timestamp: ${new Date().toLocaleString()}
------------------------------------
🔴 RED (Immediate / P1):    ${tally.red}
🟡 YELLOW (Delayed / P2):   ${tally.yellow}
🟢 GREEN (Minor / P3):      ${tally.green}
⚫ BLACK (Expectant / P4):   ${tally.black}
------------------------------------
TOTAL CASUALTIES ASSESSED:  ${total}
Generated via ResQNet START Field Triage Sentinel`;

    navigator.clipboard.writeText(text);
    setTallyCopied(true);
    setTimeout(() => setTallyCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="triage-modal-title"
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-black/[0.08] flex flex-col max-h-[90vh] overflow-hidden text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-gradient-to-r from-gray-50 to-amber-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white text-lg shadow-sm">
              <FaHeartbeat />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="triage-modal-title" className="text-base font-bold text-gray-900">
                  START Disaster Mass-Casualty Triage
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider">
                  MCI Protocol
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Simple Triage and Rapid Treatment for rapid field casualty prioritization
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

        {/* TABS & MODE TOGGLE */}
        <div className="px-6 py-3 border-b border-black/[0.04] bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab("calculator")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "calculator"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Step-by-Step Triage
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("counter")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "counter"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Sector Tally & Handover ({tally.red + tally.yellow + tally.green + tally.black})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("guide")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "guide"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Color Matrix Guide
            </button>
          </div>

          {activeTab === "calculator" && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-400 font-semibold text-[11px] uppercase tracking-wider">
                Patient:
              </span>
              <button
                type="button"
                onClick={() => {
                  setMode("adult");
                  resetCalculator();
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                  mode === "adult"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Adult (START)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("pediatric");
                  resetCalculator();
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                  mode === "pediatric"
                    ? "bg-purple-600 text-white shadow-2xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Child (JumpSTART)
              </button>
            </div>
          )}
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: STEP-BY-STEP CALCULATOR */}
          {activeTab === "calculator" && (
            <div className="space-y-4">
              {/* STEP 1: AMBULATORY */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-black/[0.04]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                    <FaWalking className="text-sm text-emerald-600" />
                    <span>Step 1: Can the patient walk? (Ambulatory status)</span>
                  </span>
                  {isAmbulatory !== null && (
                    <span className="text-[11px] font-bold text-gray-700">
                      Answered: {isAmbulatory ? "Yes (Walking)" : "No (Non-ambulatory)"}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAmbulatory(true);
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      isAmbulatory === true
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-white text-gray-700 border-black/[0.08] hover:bg-emerald-50 hover:border-emerald-300"
                    }`}
                  >
                    <span>Yes - Ambulatory</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAmbulatory(false);
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      isAmbulatory === false
                        ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                        : "bg-white text-gray-700 border-black/[0.08] hover:bg-gray-100"
                    }`}
                  >
                    <span>No - Cannot Walk</span>
                  </button>
                </div>
              </div>

              {/* STEP 2: RESPIRATION (If not ambulatory) */}
              {isAmbulatory === false && (
                <div className="p-4 rounded-2xl bg-gray-50 border border-black/[0.04] animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                      <FaLungs className="text-sm text-blue-600" />
                      <span>Step 2: Respiration Assessment</span>
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mb-2">
                    Is the patient breathing spontaneously?
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => setIsBreathing(true)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                        isBreathing === true
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-gray-700 border-black/[0.08] hover:bg-blue-50"
                      }`}
                    >
                      Yes - Breathing
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsBreathing(false)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                        isBreathing === false
                          ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                          : "bg-white text-gray-700 border-black/[0.08] hover:bg-rose-50"
                      }`}
                    >
                      No - Apneic (Not Breathing)
                    </button>
                  </div>

                  {/* If NOT breathing -> Airway maneuver / Pulse */}
                  {isBreathing === false && mode === "adult" && (
                    <div className="p-3 bg-white rounded-xl border border-black/[0.06] mt-2">
                      <p className="text-xs font-bold text-gray-800 mb-2">
                        Perform Airway Opening (Head-tilt chin-lift / Jaw-thrust):
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setAirwayRepositionedBreathing(true)}
                          className={`p-2 rounded-lg text-xs font-bold border transition ${
                            airwayRepositionedBreathing === true
                              ? "bg-red-600 text-white border-red-600"
                              : "bg-gray-50 text-gray-700 border-black/[0.06] hover:bg-red-50"
                          }`}
                        >
                          Breathing Resumed
                        </button>
                        <button
                          type="button"
                          onClick={() => setAirwayRepositionedBreathing(false)}
                          className={`p-2 rounded-lg text-xs font-bold border transition ${
                            airwayRepositionedBreathing === false
                              ? "bg-gray-900 text-white border-gray-900"
                              : "bg-gray-50 text-gray-700 border-black/[0.06] hover:bg-gray-200"
                          }`}
                        >
                          Still No Breathing
                        </button>
                      </div>
                    </div>
                  )}

                  {isBreathing === false && mode === "pediatric" && (
                    <div className="p-3 bg-white rounded-xl border border-black/[0.06] mt-2">
                      <p className="text-xs font-bold text-gray-800 mb-2">
                        Check Peripheral Pulse (JumpSTART Protocol):
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setHasPulsePediatricApnea(true)}
                          className={`p-2 rounded-lg text-xs font-bold border transition ${
                            hasPulsePediatricApnea === true
                              ? "bg-red-600 text-white border-red-600"
                              : "bg-gray-50 text-gray-700 border-black/[0.06] hover:bg-red-50"
                          }`}
                        >
                          Pulse Present (Give 5 breaths)
                        </button>
                        <button
                          type="button"
                          onClick={() => setHasPulsePediatricApnea(false)}
                          className={`p-2 rounded-lg text-xs font-bold border transition ${
                            hasPulsePediatricApnea === false
                              ? "bg-gray-900 text-white border-gray-900"
                              : "bg-gray-50 text-gray-700 border-black/[0.06] hover:bg-gray-200"
                          }`}
                        >
                          No Pulse Present
                        </button>
                      </div>
                    </div>
                  )}

                  {/* If breathing is present -> check rate */}
                  {isBreathing === true && (
                    <div className="p-3 bg-white rounded-xl border border-black/[0.06] mt-2">
                      <p className="text-xs font-bold text-gray-800 mb-2">
                        {mode === "adult"
                          ? "Adult Respiratory Rate (>30 or <10 breaths/min?)"
                          : "Pediatric Respiratory Rate (<15 or >45 breaths/min?)"}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setBreathingRateAbnormal(true)}
                          className={`p-2 rounded-lg text-xs font-bold border transition ${
                            breathingRateAbnormal === true
                              ? "bg-red-600 text-white border-red-600"
                              : "bg-gray-50 text-gray-700 border-black/[0.06] hover:bg-red-50"
                          }`}
                        >
                          Abnormal (Rapid / Very Slow)
                        </button>
                        <button
                          type="button"
                          onClick={() => setBreathingRateAbnormal(false)}
                          className={`p-2 rounded-lg text-xs font-bold border transition ${
                            breathingRateAbnormal === false
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-gray-50 text-gray-700 border-black/[0.06] hover:bg-blue-50"
                          }`}
                        >
                          Normal Rate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: PERFUSION (If breathing normal) */}
              {isAmbulatory === false && isBreathing === true && breathingRateAbnormal === false && (
                <div className="p-4 rounded-2xl bg-gray-50 border border-black/[0.04] animate-in fade-in duration-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 mb-2">
                    <FaHeartbeat className="text-sm text-rose-600" />
                    <span>Step 3: Perfusion & Radial Pulse</span>
                  </span>
                  <p className="text-xs text-gray-600 mb-2">
                    Radial pulse absent OR Capillary Refill Time &gt; 2 seconds?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPerfusionCompromised(true)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                        perfusionCompromised === true
                          ? "bg-red-600 text-white border-red-600 shadow-sm"
                          : "bg-white text-gray-700 border-black/[0.08] hover:bg-red-50"
                      }`}
                    >
                      Pulse Absent / CRT &gt; 2s
                    </button>
                    <button
                      type="button"
                      onClick={() => setPerfusionCompromised(false)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                        perfusionCompromised === false
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-gray-700 border-black/[0.08] hover:bg-blue-50"
                      }`}
                    >
                      Pulse Present / CRT &le; 2s
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: MENTAL STATUS (If perfusion normal) */}
              {isAmbulatory === false &&
                isBreathing === true &&
                breathingRateAbnormal === false &&
                perfusionCompromised === false && (
                  <div className="p-4 rounded-2xl bg-gray-50 border border-black/[0.04] animate-in fade-in duration-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 mb-2">
                      <FaBrain className="text-sm text-indigo-600" />
                      <span>Step 4: Mental Status (Follows Commands)</span>
                    </span>
                    <p className="text-xs text-gray-600 mb-2">
                      Can the patient obey simple verbal commands? (e.g. &quot;Open your eyes&quot; or &quot;Squeeze my hand&quot;)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setMentalStatusImpaired(true)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                          mentalStatusImpaired === true
                            ? "bg-red-600 text-white border-red-600 shadow-sm"
                            : "bg-white text-gray-700 border-black/[0.08] hover:bg-red-50"
                        }`}
                      >
                        Cannot Follow Commands
                      </button>
                      <button
                        type="button"
                        onClick={() => setMentalStatusImpaired(false)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                          mentalStatusImpaired === false
                            ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                            : "bg-white text-gray-700 border-black/[0.08] hover:bg-amber-50"
                        }`}
                      >
                        Follows Commands
                      </button>
                    </div>
                  </div>
                )}

              {/* TRIAGE RESULT CARD */}
              {triageResult && (
                <div
                  className={`p-5 rounded-3xl border-2 ${triageResult.borderColor} bg-gray-50/70 shadow-lg animate-in zoom-in-95 duration-200 space-y-3`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-sm ${triageResult.badgeBg} ${triageResult.badgeText}`}
                      >
                        {triageResult.category} ({triageResult.colorName})
                      </span>
                      <span className="text-xs font-bold text-gray-600">
                        {triageResult.priority}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (triageResult.category === "IMMEDIATE") addToTally("red");
                        if (triageResult.category === "DELAYED") addToTally("yellow");
                        if (triageResult.category === "MINOR") addToTally("green");
                        if (triageResult.category === "EXPECTANT") addToTally("black");
                        resetCalculator();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
                    >
                      <FaPlus className="text-[10px]" />
                      <span>Log to Sector Tally</span>
                    </button>
                  </div>

                  <p className="text-sm font-bold text-gray-900">{triageResult.summary}</p>

                  <div className="bg-white p-3.5 rounded-2xl border border-black/[0.06] text-xs space-y-1.5 text-gray-700">
                    <span className="font-bold text-gray-900 block">
                      Field Directive & Immediate Action:
                    </span>
                    {triageResult.treatmentNotes.map((note, idx) => (
                      <p key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{note}</span>
                      </p>
                    ))}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={resetCalculator}
                      className="text-xs text-gray-500 hover:text-gray-900 font-bold flex items-center gap-1.5 transition"
                    >
                      <FaRedo className="text-[10px]" />
                      <span>Assess Next Patient</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SECTOR CASUALTY TALLY & HANDOVER REPORT */}
          {activeTab === "counter" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-black/[0.04]">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Active Disaster Sector / Area
                </label>
                <input
                  type="text"
                  value={sectorName}
                  onChange={(e) => setSectorName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* RED TALLY */}
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-center flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700 block">
                      🔴 IMMEDIATE (P1)
                    </span>
                    <span className="text-3xl font-black text-red-600 my-2 block">
                      {tally.red}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => adjustTally("red", -1)}
                      className="w-7 h-7 rounded-lg bg-white border border-red-200 text-red-700 flex items-center justify-center font-bold hover:bg-red-100 transition"
                    >
                      <FaMinus className="text-[9px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustTally("red", 1)}
                      className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold hover:bg-red-700 transition"
                    >
                      <FaPlus className="text-[9px]" />
                    </button>
                  </div>
                </div>

                {/* YELLOW TALLY */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block">
                      🟡 DELAYED (P2)
                    </span>
                    <span className="text-3xl font-black text-amber-600 my-2 block">
                      {tally.yellow}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => adjustTally("yellow", -1)}
                      className="w-7 h-7 rounded-lg bg-white border border-amber-200 text-amber-700 flex items-center justify-center font-bold hover:bg-amber-100 transition"
                    >
                      <FaMinus className="text-[9px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustTally("yellow", 1)}
                      className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold hover:bg-amber-600 transition"
                    >
                      <FaPlus className="text-[9px]" />
                    </button>
                  </div>
                </div>

                {/* GREEN TALLY */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                      🟢 MINOR (P3)
                    </span>
                    <span className="text-3xl font-black text-emerald-600 my-2 block">
                      {tally.green}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => adjustTally("green", -1)}
                      className="w-7 h-7 rounded-lg bg-white border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold hover:bg-emerald-100 transition"
                    >
                      <FaMinus className="text-[9px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustTally("green", 1)}
                      className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold hover:bg-emerald-700 transition"
                    >
                      <FaPlus className="text-[9px]" />
                    </button>
                  </div>
                </div>

                {/* BLACK TALLY */}
                <div className="p-4 rounded-2xl bg-gray-100 border border-gray-300 text-center flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 block">
                      ⚫ EXPECTANT (P4)
                    </span>
                    <span className="text-3xl font-black text-gray-900 my-2 block">
                      {tally.black}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => adjustTally("black", -1)}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-300 text-gray-700 flex items-center justify-center font-bold hover:bg-gray-200 transition"
                    >
                      <FaMinus className="text-[9px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustTally("black", 1)}
                      className="w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold hover:bg-black transition"
                    >
                      <FaPlus className="text-[9px]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* HANDOVER ACTIONS */}
              <div className="p-4 rounded-2xl bg-white border border-black/[0.08] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-900 block">
                    Total Sector Casualties: {tally.red + tally.yellow + tally.green + tally.black}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Export handover data for Incident Commander & Hospital Dispatch
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTally({ red: 0, yellow: 0, green: 0, black: 0 })}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold transition"
                  >
                    Reset Tally
                  </button>
                  <button
                    type="button"
                    onClick={copyTallyReport}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                  >
                    {tallyCopied ? <FaCheck className="text-xs" /> : <FaCopy className="text-xs" />}
                    <span>{tallyCopied ? "Copied Report" : "Copy Handover Summary"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COLOR MATRIX REFERENCE GUIDE */}
          {activeTab === "guide" && (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-red-600"></span>
                  <span className="font-bold text-red-900 uppercase">
                    RED — Immediate (Priority 1)
                  </span>
                </div>
                <p className="text-red-800 leading-relaxed">
                  Critically injured patients whose survival depends on immediate intervention (within 1 hour / Golden Hour). Includes tension pneumothorax, severe respiratory compromise, uncontrolled arterial bleeding, or shock.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="font-bold text-amber-900 uppercase">
                    YELLOW — Delayed (Priority 2)
                  </span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  Seriously injured but stable vital functions. Evacuation and treatment can be safely delayed for 1 to 2 hours without imminent threat to life or limb. Includes open compound fractures, controlled abdominal trauma, stable burns.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                  <span className="font-bold text-emerald-900 uppercase">
                    GREEN — Minor (Priority 3)
                  </span>
                </div>
                <p className="text-emerald-800 leading-relaxed">
                  &quot;Walking Wounded&quot;. Patients with non-life-threatening lacerations, abrasions, sprains, or minor contusions. Able to self-evacuate to secondary triage centers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-100 border border-gray-300">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-gray-900"></span>
                  <span className="font-bold text-gray-900 uppercase">
                    BLACK — Expectant / Deceased (Priority 4)
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Deceased casualties or those with fatal injuries where survival is impossible given available field resources during a mass-casualty surge. Comfort/palliative care provided if signs of life persist.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3.5 border-t border-black/[0.06] bg-gray-50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-500">
            <FaClipboardList className="text-blue-600" />
            <span>WHO &amp; FEMA Field Disaster Triage Standard (START / JumpSTART)</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-bold transition active:scale-95"
          >
            Close Triage Sentinel
          </button>
        </div>
      </div>
    </div>
  );
}
