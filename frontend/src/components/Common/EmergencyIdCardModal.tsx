import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  FaTimes,
  FaIdCard,
  FaTint,
  FaPhoneAlt,
  FaUser,
  FaCopy,
  FaCheck,
  FaEdit,
  FaPrint,
  FaHeartbeat,
  FaSave,
  FaShieldAlt,
} from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export interface IceProfile {
  fullName: string;
  dob: string;
  bloodType: string;
  allergies: string;
  medications: string;
  conditions: string;
  iceContactName: string;
  iceContactPhone: string;
  iceContactRelation: string;
  organDonor: boolean;
  notes: string;
}

const STORAGE_KEY = "resqnet_ice_profile_v1";

const BLOOD_TYPES = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-", "Unknown"];

export default function EmergencyIdCardModal({ isOpen, onClose }: Props) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const [profile, setProfile] = useState<IceProfile>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved ICE profile:", e);
      }
    }
    return {
      fullName: "",
      dob: "",
      bloodType: "O+",
      allergies: "None known",
      medications: "None",
      conditions: "None",
      iceContactName: "",
      iceContactPhone: "",
      iceContactRelation: "Family",
      organDonor: false,
      notes: "",
    };
  });

  // Pre-fill user information if empty
  useEffect(() => {
    if (user && !profile.fullName) {
      setProfile((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        iceContactPhone: prev.iceContactPhone || user.phone || "",
      }));
    }
  }, [user]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } catch (err) {
        console.error("Failed to save ICE profile to localStorage:", err);
      }
    }
    setIsEditing(false);
  };

  const copyIceSummary = () => {
    const text = `🚨 RESQNET EMERGENCY MEDICAL ICE CARD
Name: ${profile.fullName || "Unspecified"}
Blood Type: ${profile.bloodType}
Severe Allergies: ${profile.allergies || "None reported"}
Chronic Conditions: ${profile.conditions || "None reported"}
Medications: ${profile.medications || "None"}
Organ Donor: ${profile.organDonor ? "YES" : "NO"}
ICE Contact: ${profile.iceContactName || "Not set"} (${profile.iceContactRelation}) - Tel: ${profile.iceContactPhone || "N/A"}
Notes: ${profile.notes || "None"}
-- Verified ResQNet Paramedic Handover --`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ice-modal-title"
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-black/[0.08] flex flex-col max-h-[92vh] overflow-hidden text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-gradient-to-r from-red-50 to-blue-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white text-lg shadow-sm">
              <FaIdCard />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="ice-modal-title" className="text-base font-bold text-gray-900">
                  Emergency Medical ICE Card
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-wider">
                  Paramedic Ready
                </span>
              </div>
              <p className="text-xs text-gray-500">
                In Case of Emergency identity, blood type, and critical allergies for field first responders
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

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {!isEditing ? (
            /* BADGE PREVIEW VIEW */
            <div className="space-y-4">
              {/* MEDICAL ID BADGE */}
              <div className="rounded-3xl border-2 border-red-500 bg-white shadow-xl overflow-hidden relative">
                {/* Red Emergency Header Bar */}
                <div className="bg-red-600 px-5 py-3 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaHeartbeat className="text-white text-base animate-pulse" />
                    <span className="text-xs font-black tracking-widest uppercase">
                      EMERGENCY MEDICAL ID • IN CASE OF EMERGENCY
                    </span>
                  </div>
                  <FaShieldAlt className="text-red-200 text-sm" />
                </div>

                <div className="p-5 space-y-4">
                  {/* Top info & Blood group pill */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                        Full Legal Name
                      </span>
                      <h3 className="text-xl font-black text-gray-900 leading-tight">
                        {profile.fullName || user?.name || "Citizen Name Not Set"}
                      </h3>
                      {profile.dob && (
                        <p className="text-xs text-gray-500 mt-0.5">DOB: {profile.dob}</p>
                      )}
                    </div>

                    {/* Blood Group Plaque */}
                    <div className="px-3.5 py-2 rounded-2xl bg-red-50 border-2 border-red-500/80 text-center shrink-0">
                      <span className="text-[9px] font-black uppercase text-red-700 tracking-wider flex items-center justify-center gap-1">
                        <FaTint className="text-[10px]" /> Blood
                      </span>
                      <span className="text-2xl font-black text-red-600 leading-none block mt-0.5">
                        {profile.bloodType}
                      </span>
                    </div>
                  </div>

                  {/* Severe Allergies Warning */}
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">
                      ⚠️ Critical Allergies &amp; Drug Sensitivities:
                    </span>
                    <p className="text-xs font-bold text-amber-950 mt-0.5">
                      {profile.allergies || "None reported"}
                    </p>
                  </div>

                  {/* Medical Conditions & Medications Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-gray-50 border border-black/[0.04]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                        Medical Conditions
                      </span>
                      <p className="font-semibold text-gray-800">
                        {profile.conditions || "None reported"}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-black/[0.04]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                        Current Medications
                      </span>
                      <p className="font-semibold text-gray-800">
                        {profile.medications || "None"}
                      </p>
                    </div>
                  </div>

                  {/* ICE Emergency Contact */}
                  <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                        Primary ICE Emergency Contact
                      </span>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">
                        {profile.iceContactName || "Not Provided"}{" "}
                        {profile.iceContactRelation && (
                          <span className="text-xs font-normal text-gray-500">
                            ({profile.iceContactRelation})
                          </span>
                        )}
                      </p>
                      <p className="text-xs font-mono font-bold text-blue-800 mt-0.5">
                        {profile.iceContactPhone || "No telephone provided"}
                      </p>
                    </div>

                    {profile.iceContactPhone && (
                      <a
                        href={`tel:${profile.iceContactPhone}`}
                        className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 shrink-0"
                      >
                        <FaPhoneAlt className="text-[10px]" />
                        <span>Call ICE</span>
                      </a>
                    )}
                  </div>

                  {/* Organ Donor & Notes */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${profile.organDonor ? "bg-emerald-500" : "bg-gray-300"}`}></span>
                      <span className="font-semibold">
                        Organ Donor: {profile.organDonor ? "Registered Donor" : "Unspecified"}
                      </span>
                    </span>
                    <span className="text-[11px] text-gray-400">
                      ID: RESQ-{profile.bloodType.replace(/[^A-Z0-9]/g, "")}-{Date.now().toString().slice(-4)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS ROW */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-2 transition active:scale-95"
                >
                  <FaEdit className="text-xs text-gray-600" />
                  <span>Edit Medical Profile</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyIceSummary}
                    className="px-3.5 py-2.5 rounded-2xl bg-white hover:bg-gray-100 border border-black/[0.08] text-gray-700 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
                  >
                    {copied ? <FaCheck className="text-emerald-600" /> : <FaCopy />}
                    <span>{copied ? "Copied" : "Copy ICE Text"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
                  >
                    <FaPrint className="text-xs" />
                    <span>Print ID Badge</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT FORM VIEW */
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-3 text-gray-400 text-xs" />
                    <input
                      type="text"
                      required
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      placeholder="e.g. Johnathan Doe"
                      className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-black/[0.08] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Date of Birth (Optional)
                  </label>
                  <input
                    type="text"
                    value={profile.dob}
                    onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 bg-gray-50 border border-black/[0.08] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* BLOOD TYPE SELECTOR */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Blood Group &amp; Rh Factor
                </label>
                <div className="flex flex-wrap gap-2">
                  {BLOOD_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setProfile({ ...profile, bloodType: type })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        profile.bloodType === type
                          ? "bg-red-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* ALLERGIES */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                  Severe Allergies (Penicillin, Latex, NSAIDs, Nuts, Insect Stings...)
                </label>
                <input
                  type="text"
                  value={profile.allergies}
                  onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Aspirin, Latex, Peanuts"
                  className="w-full px-3 py-2 bg-gray-50 border border-black/[0.08] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* CONDITIONS & MEDICATIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Chronic Medical Conditions
                  </label>
                  <input
                    type="text"
                    value={profile.conditions}
                    onChange={(e) => setProfile({ ...profile, conditions: e.target.value })}
                    placeholder="e.g. Type 1 Diabetes, Asthma, Epilepsy"
                    className="w-full px-3 py-2 bg-gray-50 border border-black/[0.08] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Current Medications
                  </label>
                  <input
                    type="text"
                    value={profile.medications}
                    onChange={(e) => setProfile({ ...profile, medications: e.target.value })}
                    placeholder="e.g. Insulin, Albuterol, Warfarin"
                    className="w-full px-3 py-2 bg-gray-50 border border-black/[0.08] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* EMERGENCY CONTACT (ICE) */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block">
                  Primary In Case of Emergency (ICE) Contact
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-1">
                    <input
                      type="text"
                      required
                      value={profile.iceContactName}
                      onChange={(e) => setProfile({ ...profile, iceContactName: e.target.value })}
                      placeholder="Contact Name"
                      className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <input
                      type="text"
                      value={profile.iceContactRelation}
                      onChange={(e) => setProfile({ ...profile, iceContactRelation: e.target.value })}
                      placeholder="Relation (e.g. Spouse)"
                      className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <input
                      type="tel"
                      required
                      value={profile.iceContactPhone}
                      onChange={(e) => setProfile({ ...profile, iceContactPhone: e.target.value })}
                      placeholder="Phone (+91 / Mobile)"
                      className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ORGAN DONOR CHECKBOX */}
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.organDonor}
                  onChange={(e) => setProfile({ ...profile, organDonor: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span>Designate as Registered Organ Donor in emergency rescue records</span>
              </label>

              {/* FORM ACTIONS */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
                >
                  <FaSave className="text-xs" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3.5 border-t border-black/[0.06] bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>Encrypted on-device storage • Paramedic ICE Standard</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-bold transition active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
