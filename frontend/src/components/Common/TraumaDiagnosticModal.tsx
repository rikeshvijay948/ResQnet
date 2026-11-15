import { useState, useEffect } from "react";
import {
  FaTimes,
  FaFire,
  FaBrain,
  FaTint,
  FaCopy,
  FaCheck,
  FaRedo,
  FaInfoCircle,
  FaUserMd,
} from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface BurnZone {
  id: string;
  name: string;
  percentage: number;
}

const BURN_ZONES: BurnZone[] = [
  { id: "head", name: "Head & Neck", percentage: 9 },
  { id: "chest", name: "Anterior Chest", percentage: 9 },
  { id: "abdomen", name: "Anterior Abdomen", percentage: 9 },
  { id: "upper_back", name: "Upper Back", percentage: 9 },
  { id: "lower_back", name: "Lower Back / Buttocks", percentage: 9 },
  { id: "right_arm", name: "Right Arm (Whole)", percentage: 9 },
  { id: "left_arm", name: "Left Arm (Whole)", percentage: 9 },
  { id: "right_leg", name: "Right Leg (Whole)", percentage: 18 },
  { id: "left_leg", name: "Left Leg (Whole)", percentage: 18 },
  { id: "perineum", name: "Perineum / Genitalia", percentage: 1 },
];

export default function TraumaDiagnosticModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"burn" | "gcs">("burn");

  // Burn state
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [patientWeightKg, setPatientWeightKg] = useState<number>(70);
  const [hoursPostBurn, setHoursPostBurn] = useState<number>(1);

  // GCS state
  const [eyeScore, setEyeScore] = useState<number>(4);
  const [verbalScore, setVerbalScore] = useState<number>(5);
  const [motorScore, setMotorScore] = useState<number>(6);

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

  // Burn computations
  const toggleZone = (id: string) => {
    setSelectedZones((prev) =>
      prev.includes(id) ? prev.filter((z) => z !== id) : [...prev, id]
    );
  };

  const totalTbsa = selectedZones.reduce((acc, zoneId) => {
    const zone = BURN_ZONES.find((z) => z.id === zoneId);
    return acc + (zone?.percentage || 0);
  }, 0);

  // Parkland Formula: 4 mL * Weight (kg) * % TBSA
  const parklandTotalMl = Math.round(4 * patientWeightKg * totalTbsa);
  const first8HoursTotalMl = Math.round(parklandTotalMl / 2);
  const remainingHoursInFirstWindow = Math.max(1, 8 - hoursPostBurn);
  const first8HoursHourlyRateMl = Math.round(first8HoursTotalMl / remainingHoursInFirstWindow);
  const next16HoursTotalMl = Math.round(parklandTotalMl / 2);
  const next16HoursHourlyRateMl = Math.round(next16HoursTotalMl / 16);

  // GCS computations
  const totalGcs = eyeScore + verbalScore + motorScore;
  const gcsClassification = (() => {
    if (totalGcs <= 8) {
      return {
        level: "Severe TBI (Coma / Critical)",
        badgeBg: "bg-red-600",
        badgeText: "text-white",
        directive: "High risk of airway compromise. Immediate endotracheal intubation / MEDEVAC mandatory.",
      };
    }
    if (totalGcs <= 12) {
      return {
        level: "Moderate TBI (Urgent)",
        badgeBg: "bg-amber-500",
        badgeText: "text-white",
        directive: "Urgent neurosurgical consultation & CT head scan required. Guard against hypoxic secondary injury.",
      };
    }
    return {
      level: "Mild TBI / Concussion",
      badgeBg: "bg-emerald-600",
      badgeText: "text-white",
      directive: "Neurological observation. Re-evaluate score every 30 minutes for deterioration.",
    };
  })();

  const resetAssessments = () => {
    setSelectedZones([]);
    setPatientWeightKg(70);
    setHoursPostBurn(1);
    setEyeScore(4);
    setVerbalScore(5);
    setMotorScore(6);
  };

  const copyClinicalHandover = () => {
    const text = `🚨 RESQNET CLINICAL TRAUMA & BURN DOSSIER
Assessment Timestamp: ${new Date().toLocaleString()}
------------------------------------------
🔥 BURN RESUSCITATION (Rule of Nines & Parkland):
Total Burn Surface Area (% TBSA): ${totalTbsa}%
Patient Weight: ${patientWeightKg} kg (Hours Elapsed: ${hoursPostBurn}h)
Calculated 24h Lactated Ringer's Fluid: ${parklandTotalMl} mL
- First 8 Hours (${remainingHoursInFirstWindow}h remaining): ${first8HoursTotalMl} mL (~${first8HoursHourlyRateMl} mL/hr)
- Next 16 Hours: ${next16HoursTotalMl} mL (~${next16HoursHourlyRateMl} mL/hr)
Burn Zones: ${selectedZones.join(", ") || "None"}

🧠 GLASGOW COMA SCALE (GCS):
Total GCS Score: ${totalGcs}/15 (E${eyeScore} V${verbalScore} M${motorScore})
Classification: ${gcsClassification.level}
Clinical Directive: ${gcsClassification.directive}
------------------------------------------
Generated via ResQNet Paramedic Trauma Sentinel`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trauma-modal-title"
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-black/[0.08] flex flex-col max-h-[92vh] overflow-hidden text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white text-lg shadow-sm">
              <FaUserMd />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="trauma-modal-title" className="text-base font-bold text-gray-900">
                  Field Trauma &amp; Burn Resuscitation Sentinel
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-wider">
                  Paramedic Tools
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Rule of Nines burn surface area, Parkland fluid infusion, and Glasgow Coma Scale (GCS)
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

        {/* TABS */}
        <div className="px-6 py-3 border-b border-black/[0.04] bg-white flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab("burn")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "burn"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <FaFire className={activeTab === "burn" ? "text-orange-600" : ""} />
              <span>Rule of Nines &amp; Parkland ({totalTbsa}%)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("gcs")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "gcs"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <FaBrain className={activeTab === "gcs" ? "text-purple-600" : ""} />
              <span>Glasgow Coma Scale (GCS {totalGcs}/15)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={resetAssessments}
            className="text-xs text-gray-400 hover:text-gray-700 font-bold flex items-center gap-1"
          >
            <FaRedo className="text-[10px]" />
            <span>Reset</span>
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: RULE OF NINES & PARKLAND FORMULA */}
          {activeTab === "burn" && (
            <div className="space-y-4">
              {/* Weight & Time Elapsed Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 border border-black/[0.04]">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Patient Estimated Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="250"
                    value={patientWeightKg}
                    onChange={(e) => setPatientWeightKg(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Hours Elapsed Since Burn Event
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="8"
                    value={hoursPostBurn}
                    onChange={(e) => setHoursPostBurn(Math.min(7, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    First half of fluid must complete within 8 hours of injury
                  </span>
                </div>
              </div>

              {/* Anatomical Burn Zones Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                    Select Burned Anatomical Regions (Rule of Nines)
                  </span>
                  <span className="text-xs font-extrabold text-orange-600">
                    Total: {totalTbsa}% TBSA
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BURN_ZONES.map((zone) => {
                    const isSelected = selectedZones.includes(zone.id);
                    return (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => toggleZone(zone.id)}
                        className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                          isSelected
                            ? "bg-orange-500 text-white border-orange-600 shadow-sm"
                            : "bg-gray-50/80 text-gray-800 border-black/[0.06] hover:bg-gray-100"
                        }`}
                      >
                        <span className="text-xs font-bold leading-tight">{zone.name}</span>
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                            isSelected ? "bg-black/20 text-white" : "bg-white text-gray-700"
                          }`}
                        >
                          {zone.percentage}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PARKLAND INFUSION CALCULATOR RESULT CARD */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50/60 border border-orange-200 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-orange-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <FaTint className="text-orange-600 text-lg" />
                    <div>
                      <h4 className="text-sm font-black text-gray-900">
                        Parkland IV Fluid Resuscitation Volume
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        4 mL × {patientWeightKg} kg × {totalTbsa}% TBSA (Lactated Ringer&apos;s)
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-orange-600">
                      {parklandTotalMl.toLocaleString()} mL
                    </span>
                    <span className="text-[10px] text-gray-400 block">Total 24-Hour Requirement</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* First 8 Hours */}
                  <div className="p-3.5 rounded-2xl bg-white border border-orange-200 shadow-2xs">
                    <span className="text-[10px] font-black uppercase text-orange-700 tracking-wider block">
                      First 8 Hours (50% Volume)
                    </span>
                    <p className="text-xl font-black text-gray-900 mt-1">
                      {first8HoursTotalMl.toLocaleString()} mL
                    </p>
                    <p className="text-xs font-bold text-orange-600 mt-1">
                      Infusion Rate: ~{first8HoursHourlyRateMl} mL/hour
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Time remaining in 8h window: {remainingHoursInFirstWindow} hour(s)
                    </p>
                  </div>

                  {/* Next 16 Hours */}
                  <div className="p-3.5 rounded-2xl bg-white border border-orange-200 shadow-2xs">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block">
                      Subsequent 16 Hours (50% Volume)
                    </span>
                    <p className="text-xl font-black text-gray-900 mt-1">
                      {next16HoursTotalMl.toLocaleString()} mL
                    </p>
                    <p className="text-xs font-bold text-gray-700 mt-1">
                      Infusion Rate: ~{next16HoursHourlyRateMl} mL/hour
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Maintain target urine output: 0.5 – 1.0 mL/kg/hr
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GLASGOW COMA SCALE (GCS) */}
          {activeTab === "gcs" && (
            <div className="space-y-4">
              {/* GCS Result Summary Banner */}
              <div className="p-4 rounded-3xl bg-gray-900 text-white flex items-center justify-between shadow-md">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Calculated Glasgow Coma Scale
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-2xl font-black">Score: {totalGcs} / 15</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${gcsClassification.badgeBg} ${gcsClassification.badgeText}`}
                    >
                      {gcsClassification.level}
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs font-mono text-gray-400">
                  E{eyeScore} V{verbalScore} M{motorScore}
                </div>
              </div>

              {/* Eye Opening (1-4) */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-black/[0.04]">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  1. Eye Opening Response (E: 1 - 4)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { score: 4, label: "Spontaneous (4)" },
                    { score: 3, label: "To Verbal Call (3)" },
                    { score: 2, label: "To Pain / Pressure (2)" },
                    { score: 1, label: "None (1)" },
                  ].map((opt) => (
                    <button
                      key={opt.score}
                      type="button"
                      onClick={() => setEyeScore(opt.score)}
                      className={`p-2.5 rounded-xl border font-bold transition text-center ${
                        eyeScore === opt.score
                          ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                          : "bg-white text-gray-700 border-black/[0.06] hover:bg-gray-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verbal Response (1-5) */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-black/[0.04]">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  2. Verbal Response (V: 1 - 5)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {[
                    { score: 5, label: "Oriented (5)" },
                    { score: 4, label: "Confused (4)" },
                    { score: 3, label: "Inappropriate Words (3)" },
                    { score: 2, label: "Incomprehensible Sounds (2)" },
                    { score: 1, label: "None (1)" },
                  ].map((opt) => (
                    <button
                      key={opt.score}
                      type="button"
                      onClick={() => setVerbalScore(opt.score)}
                      className={`p-2.5 rounded-xl border font-bold transition text-center ${
                        verbalScore === opt.score
                          ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                          : "bg-white text-gray-700 border-black/[0.06] hover:bg-gray-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Motor Response (1-6) */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-black/[0.04]">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  3. Best Motor Response (M: 1 - 6)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { score: 6, label: "Obeys Commands (6)" },
                    { score: 5, label: "Localizes Pain (5)" },
                    { score: 4, label: "Normal Flexion Withdrawal (4)" },
                    { score: 3, label: "Abnormal Flexion Decorticate (3)" },
                    { score: 2, label: "Extensor Posturing Decerebrate (2)" },
                    { score: 1, label: "None / Flaccid (1)" },
                  ].map((opt) => (
                    <button
                      key={opt.score}
                      type="button"
                      onClick={() => setMotorScore(opt.score)}
                      className={`p-2.5 rounded-xl border font-bold transition text-center ${
                        motorScore === opt.score
                          ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                          : "bg-white text-gray-700 border-black/[0.06] hover:bg-gray-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clinical Directive Card */}
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-950 flex items-start gap-2.5">
                <FaInfoCircle className="text-purple-600 text-base shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold block">Trauma Clinical Protocol Directive:</span>
                  {gcsClassification.directive}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3.5 border-t border-black/[0.06] bg-gray-50 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={copyClinicalHandover}
            className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 border border-black/[0.08] text-gray-800 font-bold flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
          >
            {copied ? <FaCheck className="text-emerald-600 text-xs" /> : <FaCopy className="text-xs" />}
            <span>{copied ? "Copied Handover Dossier" : "Copy Paramedic Handover"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-bold transition active:scale-95"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}
