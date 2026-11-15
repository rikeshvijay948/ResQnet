import { useState, useEffect } from "react";
import {
  FaTimes,
  FaSearch,
  FaUserPlus,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaCopy,
  FaCheck,
  FaUserFriends,
} from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export type PersonStatus = "Missing" | "Safe / Reunified" | "Hospitalized" | "In Relief Camp";

export interface MissingPerson {
  id: string;
  fullName: string;
  age: number | string;
  gender: string;
  status: PersonStatus;
  lastSeenLocation: string;
  lastSeenDate: string;
  description: string;
  reportedBy: string;
  contactPhone: string;
  notes?: string;
  photoUrl?: string;
}

const STORAGE_KEY = "resqnet_missing_persons_v1";

const INITIAL_RECORDS: MissingPerson[] = [
  {
    id: "mp_101",
    fullName: "Aarav Sharma",
    age: 9,
    gender: "Male",
    status: "Missing",
    lastSeenLocation: "Kurla West Flood Evacuation Depot, Gate 2",
    lastSeenDate: "Today, 14:30",
    description: "Wearing yellow rain jacket, blue denim shorts, navy backpack with cartoon patch. Speaks Hindi and English.",
    reportedBy: "Meera Sharma (Mother)",
    contactPhone: "+91 98201 44521",
    notes: "Was separated during crowd surge when relief boat arrived.",
  },
  {
    id: "mp_102",
    fullName: "Sunita Verma",
    age: 68,
    gender: "Female",
    status: "In Relief Camp",
    lastSeenLocation: "St. Xavier Community Shelter Camp B",
    lastSeenDate: "Yesterday, 19:15",
    description: "Wearing green saree, spectacles, mild hearing impairment in right ear. Requires blood pressure medication.",
    reportedBy: "NDRF Camp Volunteer Team Alpha",
    contactPhone: "+91 98332 10982",
    notes: "Safe and sheltered. Looking for son Rajesh Verma.",
  },
  {
    id: "mp_103",
    fullName: "Karan Johar Patel",
    age: 34,
    gender: "Male",
    status: "Hospitalized",
    lastSeenLocation: "Lilavati Trauma Triage Ward, Bed T-14",
    lastSeenDate: "Today, 08:20",
    description: "Minor concussion, non-ambulatory, stabilized. Left arm bandaged.",
    reportedBy: "Dr. Ananya Roy (ER Triage)",
    contactPhone: "+91 22 2675 1000",
    notes: "Admitted following building collapse in Bandra East.",
  },
  {
    id: "mp_104",
    fullName: "Ananya Desai",
    age: 22,
    gender: "Female",
    status: "Safe / Reunified",
    lastSeenLocation: "Dadar Relief Distribution Center",
    lastSeenDate: "Today, 11:00",
    description: "Reunited with family at Dadar Station assembly point.",
    reportedBy: "Rohan Desai (Brother)",
    contactPhone: "+91 98199 55432",
    notes: "Reunification confirmed by on-site civil defense coordinator.",
  },
];

export default function MissingPersonsModal({ isOpen, onClose }: Props) {
  const [records, setRecords] = useState<MissingPerson[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.error("Failed to load missing persons from localStorage:", e);
      }
    }
    return INITIAL_RECORDS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New report form state
  const [newPerson, setNewPerson] = useState({
    fullName: "",
    age: "",
    gender: "Male",
    lastSeenLocation: "",
    description: "",
    reportedBy: "",
    contactPhone: "",
    notes: "",
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const saveRecords = (newRecords: MissingPerson[]) => {
    setRecords(newRecords);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
      } catch (e) {
        console.error("Failed to save missing persons:", e);
      }
    }
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerson.fullName || !newPerson.lastSeenLocation || !newPerson.contactPhone) return;

    const created: MissingPerson = {
      id: "mp_" + Date.now().toString().slice(-5),
      fullName: newPerson.fullName,
      age: newPerson.age || "Unknown",
      gender: newPerson.gender,
      status: "Missing",
      lastSeenLocation: newPerson.lastSeenLocation,
      lastSeenDate: "Just now",
      description: newPerson.description || "No specific physical markers recorded.",
      reportedBy: newPerson.reportedBy || "Family / Next of Kin",
      contactPhone: newPerson.contactPhone,
      notes: newPerson.notes,
    };

    saveRecords([created, ...records]);
    setIsAdding(false);
    setNewPerson({
      fullName: "",
      age: "",
      gender: "Male",
      lastSeenLocation: "",
      description: "",
      reportedBy: "",
      contactPhone: "",
      notes: "",
    });
  };

  const handleMarkFound = (id: string) => {
    const updated = records.map((r) =>
      r.id === id ? { ...r, status: "Safe / Reunified" as PersonStatus } : r
    );
    saveRecords(updated);
  };

  const copyNotice = (person: MissingPerson) => {
    const text = `🚨 RESQNET DISASTER MISSING PERSON NOTICE
Name: ${person.fullName} (Age: ${person.age}, ${person.gender})
Status: ${person.status.toUpperCase()}
Last Seen: ${person.lastSeenLocation} (${person.lastSeenDate})
Description: ${person.description}
Contact / Report Sighting: ${person.reportedBy} - Tel: ${person.contactPhone}
Notice ID: ${person.id}
Broadcasted via ResQNet Emergency Family Reunification Desk`;

    navigator.clipboard.writeText(text);
    setCopiedId(person.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredRecords = records.filter((r) => {
    const matchSearch =
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.lastSeenLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === "all") return matchSearch;
    if (filterStatus === "missing") return matchSearch && r.status === "Missing";
    if (filterStatus === "safe") return matchSearch && (r.status === "Safe / Reunified" || r.status === "In Relief Camp");
    if (filterStatus === "hospital") return matchSearch && r.status === "Hospitalized";
    return matchSearch;
  });

  const missingCount = records.filter((r) => r.status === "Missing").length;
  const safeCount = records.filter((r) => r.status === "Safe / Reunified" || r.status === "In Relief Camp").length;

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="missing-persons-title"
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-black/[0.08] flex flex-col max-h-[92vh] overflow-hidden text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-gradient-to-r from-blue-50 via-indigo-50/40 to-emerald-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-lg shadow-sm">
              <FaUserFriends />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="missing-persons-title" className="text-base font-bold text-gray-900">
                  Missing Persons &amp; Family Reunification
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-wider">
                  Disaster Registry
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Community crisis registry to locate lost loved ones and register rescued family members
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

        {/* METRICS & SEARCH TOOLBAR */}
        <div className="px-6 py-3 border-b border-black/[0.04] bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, camp, location, clothing..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-black/[0.08] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
            {/* Status Filter Chips */}
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setFilterStatus("all")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  filterStatus === "all"
                    ? "bg-gray-900 text-white shadow-2xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All ({records.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("missing")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  filterStatus === "missing"
                    ? "bg-rose-600 text-white shadow-2xs"
                    : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                }`}
              >
                Missing ({missingCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("safe")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  filterStatus === "safe"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                Safe ({safeCount})
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 shrink-0"
            >
              <FaUserPlus className="text-xs" />
              <span>{isAdding ? "View Directory" : "Post Report"}</span>
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isAdding ? (
            /* CREATE MISSING PERSON FORM */
            <form onSubmit={handleCreateReport} className="space-y-4 bg-gray-50/70 p-5 rounded-3xl border border-black/[0.06]">
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <FaUserPlus className="text-indigo-600" />
                  <span>Register Missing Person or Separated Family Member</span>
                </span>
                <span className="text-[11px] text-gray-500 font-medium">Broadcasts to all rescue desks</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPerson.fullName}
                    onChange={(e) => setNewPerson({ ...newPerson, fullName: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Approx Age &amp; Gender
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newPerson.age}
                      onChange={(e) => setNewPerson({ ...newPerson, age: e.target.value })}
                      placeholder="Age"
                      className="w-16 px-2 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-semibold focus:outline-none"
                    />
                    <select
                      value={newPerson.gender}
                      onChange={(e) => setNewPerson({ ...newPerson, gender: e.target.value })}
                      className="flex-1 px-2 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Child">Child</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Last Known Location or Disaster Zone *
                </label>
                <input
                  type="text"
                  required
                  value={newPerson.lastSeenLocation}
                  onChange={(e) => setNewPerson({ ...newPerson, lastSeenLocation: e.target.value })}
                  placeholder="e.g. Near Western Express Highway flyover, Kurla rescue boat dock"
                  className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Physical Appearance, Clothing &amp; Identifiers
                </label>
                <textarea
                  rows={2}
                  value={newPerson.description}
                  onChange={(e) => setNewPerson({ ...newPerson, description: e.target.value })}
                  placeholder="Clothing worn (colors, footwear), scars, glasses, distinguishing bag, medical conditions..."
                  className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Reporter Name / Relationship
                  </label>
                  <input
                    type="text"
                    value={newPerson.reportedBy}
                    onChange={(e) => setNewPerson({ ...newPerson, reportedBy: e.target.value })}
                    placeholder="e.g. Rajesh Sharma (Father)"
                    className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Callback Telephone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newPerson.contactPhone}
                    onChange={(e) => setNewPerson({ ...newPerson, contactPhone: e.target.value })}
                    placeholder="e.g. +91 98200 12345"
                    className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-black/[0.08] text-gray-700 font-bold text-xs hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition active:scale-95"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          ) : (
            /* MISSING PERSONS DIRECTORY CARDS */
            <div className="space-y-3">
              {filteredRecords.length === 0 ? (
                <div className="text-center py-12 px-4 bg-gray-50/70 rounded-3xl border border-black/[0.04]">
                  <FaUserFriends className="text-3xl text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-700">No Registry Records Found</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Try searching another name or post a new missing person report.
                  </p>
                </div>
              ) : (
                filteredRecords.map((person) => {
                  const isMissing = person.status === "Missing";
                  const isSafe = person.status === "Safe / Reunified";
                  const isHospital = person.status === "Hospitalized";

                  return (
                    <div
                      key={person.id}
                      className={`p-4 rounded-2xl border transition shadow-2xs ${
                        isMissing
                          ? "bg-rose-50/40 border-rose-200"
                          : isSafe
                          ? "bg-emerald-50/40 border-emerald-200"
                          : isHospital
                          ? "bg-blue-50/40 border-blue-200"
                          : "bg-amber-50/40 border-amber-200"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                              isMissing
                                ? "bg-rose-600 text-white"
                                : isSafe
                                ? "bg-emerald-600 text-white"
                                : isHospital
                                ? "bg-blue-600 text-white"
                                : "bg-amber-600 text-white"
                            }`}
                          >
                            {person.fullName.charAt(0)}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-bold text-gray-900 leading-tight">
                                {person.fullName}
                              </h3>
                              <span className="text-xs text-gray-500 font-medium">
                                ({person.age} yrs • {person.gender})
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                  isMissing
                                    ? "bg-rose-100 text-rose-800 animate-pulse"
                                    : isSafe
                                    ? "bg-emerald-100 text-emerald-800"
                                    : isHospital
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {person.status}
                              </span>
                            </div>

                            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1.5">
                              <FaMapMarkerAlt className="text-red-500 text-[10px] shrink-0" />
                              <span className="font-semibold">{person.lastSeenLocation}</span>
                              <span className="text-gray-400">• {person.lastSeenDate}</span>
                            </p>

                            <p className="text-xs text-gray-700 mt-2 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-black/[0.04]">
                              {person.description}
                            </p>

                            <div className="mt-2.5 flex items-center gap-3 text-[11px] text-gray-500 flex-wrap">
                              <span>Reported by: <strong className="text-gray-800">{person.reportedBy}</strong></span>
                              <span>•</span>
                              <a
                                href={`tel:${person.contactPhone}`}
                                className="font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                              >
                                <FaPhoneAlt className="text-[9px]" />
                                <span>{person.contactPhone}</span>
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* CARD ACTIONS */}
                        <div className="flex sm:flex-col items-center sm:items-end gap-1.5 shrink-0 self-end sm:self-start">
                          <button
                            type="button"
                            onClick={() => copyNotice(person)}
                            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-black/[0.08] text-gray-700 text-[11px] font-bold flex items-center gap-1 transition shadow-2xs"
                            title="Copy alert notice to share on social media or WhatsApp"
                          >
                            {copiedId === person.id ? (
                              <FaCheck className="text-emerald-600 text-[10px]" />
                            ) : (
                              <FaCopy className="text-[10px]" />
                            )}
                            <span>{copiedId === person.id ? "Copied" : "Share"}</span>
                          </button>

                          {isMissing && (
                            <button
                              type="button"
                              onClick={() => handleMarkFound(person.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition shadow-2xs"
                              title="Mark this person as secured or reunited"
                            >
                              <FaCheckCircle className="text-[10px]" />
                              <span>Found Safe</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3.5 border-t border-black/[0.06] bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>Synced with Local Disaster Emergency Camps &amp; Police Desks</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-bold transition active:scale-95"
          >
            Close Registry
          </button>
        </div>
      </div>
    </div>
  );
}
