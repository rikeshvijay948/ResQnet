import { useState, useMemo } from "react";
import {
  FaTimes,
  FaSearch,
  FaHeartbeat,
  FaFire,
  FaWater,
  FaWind,
  FaFirstAid,
  FaBookOpen,
  FaBolt,
  FaCheck,
  FaCopy,
  FaExclamationTriangle,
  FaShieldAlt,
} from "react-icons/fa";

interface GuideTopic {
  id: string;
  title: string;
  category: "Natural" | "Fire & Hazard" | "Medical & First-Aid";
  icon: any;
  color: string;
  badge: string;
  overview: string;
  dos: string[];
  donts: string[];
  criticalTip: string;
}

const GUIDE_TOPICS: GuideTopic[] = [
  {
    id: "earthquake",
    title: "Earthquake & Tremors",
    category: "Natural",
    icon: FaBolt,
    color: "from-amber-500 to-orange-600",
    badge: "Drop • Cover • Hold",
    overview:
      "Rapid ground shaking can cause structural collapses, falling debris, and shattered glass. Immediate instinctive reaction saves lives.",
    dos: [
      "DROP down onto your hands and knees immediately.",
      "COVER your head and neck under a sturdy table, desk, or against an interior wall.",
      "HOLD ON to your shelter until shaking completely stops.",
      "If in bed, stay there and protect your head with a pillow.",
      "Shut off domestic gas connections and main circuit breakers after tremors cease.",
    ],
    donts: [
      "Do NOT run outside during active shaking; falling facades and glass cause most casualties.",
      "Do NOT use elevators under any circumstances.",
      "Do NOT stand in doorways; modern doorways are not reinforced more than walls.",
      "Do NOT light matches or lighters until confirming zero gas leaks.",
    ],
    criticalTip:
      "Expect aftershocks. Each time you feel a tremor, DROP, COVER, and HOLD ON again.",
  },
  {
    id: "flood",
    title: "Floods & Flash Inundation",
    category: "Natural",
    icon: FaWater,
    color: "from-blue-500 to-cyan-600",
    badge: "Turn Around • Don't Drown",
    overview:
      "Floods and flash inundation present severe drowning, electrical electrocution, and waterborne pathogen hazards.",
    dos: [
      "Evacuate immediately to higher ground or upper storeys of reinforced structures.",
      "Disconnect main electrical circuit breakers before water enters living spaces.",
      "Store at least 3 days of clean drinking water and non-perishable food.",
      "Signal rescuers using a whistle, bright cloth, or flashlight from roofs or balconies.",
    ],
    donts: [
      "Do NOT attempt to walk, swim, or drive through moving water. Just 6 inches can knock down an adult.",
      "Do NOT touch submerged power lines, switchboards, or plugged-in appliances.",
      "Do NOT drink unboiled flood water or eat food that contacted water.",
      "Do NOT return to submerged structures until structural integrity is certified.",
    ],
    criticalTip:
      "Vehicles can float in as little as 12 inches of water. Abandon stalled vehicles in rising water immediately.",
  },
  {
    id: "fire",
    title: "Building Fire & Smoke",
    category: "Fire & Hazard",
    icon: FaFire,
    color: "from-red-500 to-rose-600",
    badge: "Crawl Low • Get Out",
    overview:
      "Toxic smoke and superheated air cause far more fatalities than actual flames. Fast, low evacuation is vital.",
    dos: [
      "Drop to your knees and crawl beneath smoke where air remains cooler and cleaner.",
      "Feel door handles with the back of your hand; if hot, do NOT open that door.",
      "Use stairs only; close fire doors behind you to slow flame and smoke propagation.",
      "If clothing catches fire: STOP immediately, DROP to the ground, and ROLL back and forth.",
      "Call emergency line 101 or 112 once you reach a safe outdoor muster point.",
    ],
    donts: [
      "Do NOT use elevators during a fire evacuation.",
      "Do NOT open hot doors or enter smoke-filled stairwells without checking alternate routes.",
      "Do NOT re-enter a burning structure for pets, phones, or valuables.",
      "Do NOT throw water on electrical fires or grease/oil fires in kitchens.",
    ],
    criticalTip:
      "For grease fires: smother with a metal lid or baking soda. Never pour water onto oil fires.",
  },
  {
    id: "cyclone",
    title: "Cyclone & Severe Storms",
    category: "Natural",
    icon: FaWind,
    color: "from-teal-500 to-emerald-600",
    badge: "Secure • Shelter In Place",
    overview:
      "Gale-force winds, flying debris, torrential precipitation, and tidal surges require fortified indoor shelter.",
    dos: [
      "Move to an interior windowless room, bathroom, or hallway on the lowest safe floor.",
      "Board up or firmly latch windows; secure exterior loose objects like tin sheets and pots.",
      "Keep battery-operated emergency radios, power banks, and torches fully charged.",
      "Stay sheltered until official meteorological agencies declare the cyclone eye has fully passed.",
    ],
    donts: [
      "Do NOT venture outdoors during the 'eye' (calm lull); winds will violently reverse in minutes.",
      "Do NOT shelter under large trees, billboards, or near overhead electrical lines.",
      "Do NOT touch dangling power lines downed by stormy winds.",
    ],
    criticalTip:
      "The eye of a cyclone is deceptively calm, followed rapidly by peak winds from the opposite direction. Remain inside.",
  },
  {
    id: "cpr",
    title: "Hands-Only CPR & Cardiac Arrest",
    category: "Medical & First-Aid",
    icon: FaHeartbeat,
    color: "from-rose-600 to-pink-600",
    badge: "100-120 BPM • Hard & Fast",
    overview:
      "When someone collapses, is unresponsive, and is not breathing normally, every single second counts before brain oxygen drops.",
    dos: [
      "Call 108 or 112 immediately and shout for an Automated External Defibrillator (AED).",
      "Place heel of one hand in center of patient's chest; place other hand on top and interlock fingers.",
      "Position shoulders directly over hands and keep elbows straight.",
      "Push hard and fast: compress 2 to 2.4 inches deep at 100 to 120 beats per minute.",
      "Allow chest to completely recoil between compressions without lifting hands.",
    ],
    donts: [
      "Do NOT pause compressions for more than 10 seconds until medical personnel take over.",
      "Do NOT bend elbows while pushing; utilize your upper body weight.",
      "Do NOT give up; even imperfect CPR dramatically increases survival odds.",
    ],
    criticalTip:
      "Compress to the beat of the song 'Stayin' Alive' (approx. 100-120 BPM).",
  },
  {
    id: "bleeding",
    title: "Severe Bleeding & Shock",
    category: "Medical & First-Aid",
    icon: FaFirstAid,
    color: "from-indigo-600 to-blue-600",
    badge: "Direct Pressure • Elevate",
    overview:
      "Uncontrolled arterial hemorrhaging can become fatal within 3-5 minutes. Firm, relentless pressure is essential.",
    dos: [
      "Apply firm, continuous direct pressure over the wound using sterile gauze or clean cloth.",
      "Elevate the injured limb above heart level if no fractures are suspected.",
      "Keep patient warm with a blanket or jacket to mitigate traumatic shock.",
      "If blood bleeds through, add additional cloth over the top; do NOT remove the base layer.",
      "Apply a commercial or improvised tourniquet 2-3 inches above bleeding limbs if life-threatening.",
    ],
    donts: [
      "Do NOT remove embedded objects (knife, glass, metal shrapnel) — stabilize around them.",
      "Do NOT release pressure to check if bleeding has stopped.",
      "Do NOT apply a tourniquet directly over a joint (elbow or knee).",
    ],
    criticalTip:
      "Never remove deeply impaled objects. Pack gauze firmly around them to stabilize, then call emergency services.",
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultTopicId?: string;
}

export default function DisasterGuideModal({ isOpen, onClose, defaultTopicId }: Props) {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    defaultTopicId || GUIDE_TOPICS[0].id
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copiedTopic, setCopiedTopic] = useState<string | null>(null);

  const categories = ["All", "Natural", "Fire & Hazard", "Medical & First-Aid"];

  const filteredTopics = useMemo(() => {
    return GUIDE_TOPICS.filter((t) => {
      const matchesCategory =
        selectedCategory === "All" || t.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        t.title.toLowerCase().includes(query) ||
        t.overview.toLowerCase().includes(query) ||
        t.badge.toLowerCase().includes(query) ||
        t.dos.some((d) => d.toLowerCase().includes(query)) ||
        t.donts.some((d) => d.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const activeTopic = useMemo(() => {
    const found = GUIDE_TOPICS.find((t) => t.id === selectedTopicId);
    return found || filteredTopics[0] || GUIDE_TOPICS[0];
  }, [selectedTopicId, filteredTopics]);

  const copyGuide = (topic: GuideTopic) => {
    const text = `🚨 RESQNET DISASTER SURVIVAL GUIDE: ${topic.title.toUpperCase()}\nKey Protocol: ${topic.badge}\n\n${topic.overview}\n\n✅ CRITICAL DO's:\n${topic.dos.map((d, i) => `${i + 1}. ${d}`).join("\n")}\n\n❌ CRITICAL DON'Ts:\n${topic.donts.map((d, i) => `${i + 1}. ${d}`).join("\n")}\n\n⚠️ LIFE SAFETY TIP:\n${topic.criticalTip}\n\nShared via ResQNet Emergency Network (https://resqnet.org)`;

    navigator.clipboard.writeText(text);
    setCopiedTopic(topic.id);
    setTimeout(() => setCopiedTopic(null), 2500);
  };

  if (!isOpen) return null;

  const TopicIcon = activeTopic.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disaster-guide-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-black/[0.08] flex flex-col overflow-hidden text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-sm">
              <FaBookOpen />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="disaster-guide-title"
                  className="text-lg font-bold tracking-tight text-gray-900"
                >
                  Disaster Survival & First-Aid Guide
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                  Offline Ready
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Actionable step-by-step protocols certified by emergency responders
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close guide modal"
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition active:scale-95"
          >
            <FaTimes />
          </button>
        </div>

        {/* CONTROLS (SEARCH & CATEGORIES) */}
        <div className="px-6 py-3 border-b border-black/[0.06] bg-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search protocols (e.g., CPR, flood, smoke, tourniquet)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-black/[0.08] text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN BODY: 2 COLUMN LAYOUT */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* SIDEBAR PROTOCOL SELECTOR */}
          <div className="md:col-span-4 border-r border-black/[0.06] overflow-y-auto p-3 space-y-2 bg-gray-50/50 max-h-[30vh] md:max-h-full">
            {filteredTopics.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                No matching survival protocols found.
              </div>
            ) : (
              filteredTopics.map((topic) => {
                const isSelected = activeTopic.id === topic.id;
                const Icon = topic.icon;
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={`w-full text-left p-3 rounded-2xl transition flex items-center gap-3 border ${
                      isSelected
                        ? "bg-white border-blue-500/30 shadow-md shadow-blue-500/5 ring-2 ring-blue-500/20"
                        : "bg-white/70 hover:bg-white border-black/[0.04] text-gray-700"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 bg-gradient-to-br ${topic.color} shadow-xs text-sm`}
                    >
                      <Icon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-xs font-bold truncate ${
                            isSelected ? "text-blue-700" : "text-gray-900"
                          }`}
                        >
                          {topic.title}
                        </p>
                      </div>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">
                        {topic.badge}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* ACTIVE PROTOCOL DETAILS */}
          <div className="md:col-span-8 overflow-y-auto p-5 sm:p-6 space-y-5 bg-white">
            {/* PROTOCOL BANNER */}
            <div
              className={`p-5 rounded-2xl bg-gradient-to-r ${activeTopic.color} text-white shadow-md relative overflow-hidden`}
            >
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl text-white">
                    <TopicIcon />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">
                      {activeTopic.category}
                    </span>
                    <h3 className="text-xl font-extrabold mt-1">
                      {activeTopic.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-white/25 backdrop-blur-md text-xs font-bold shadow-xs">
                    {activeTopic.badge}
                  </span>
                  <button
                    onClick={() => copyGuide(activeTopic)}
                    title="Copy guide to clipboard"
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition active:scale-95 text-xs flex items-center gap-1"
                  >
                    {copiedTopic === activeTopic.id ? (
                      <>
                        <FaCheck /> Copied
                      </>
                    ) : (
                      <>
                        <FaCopy /> Share
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="relative z-10 text-xs text-white/90 mt-3 max-w-xl leading-relaxed">
                {activeTopic.overview}
              </p>
            </div>

            {/* CPR RHYTHMIC HELPER (if topic is CPR) */}
            {activeTopic.id === "cpr" && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center animate-ping text-sm shrink-0">
                  <FaHeartbeat />
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-900">
                    CPR Metronome Rhythm: 100-120 Compressions / Minute
                  </p>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    Match the rhythmic tempo of &quot;Stayin&apos; Alive&quot; by the Bee Gees. Push down at least 2 inches into the sternum.
                  </p>
                </div>
              </div>
            )}

            {/* DO's & DON'Ts GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* DO's */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                    ✓
                  </span>
                  <span>DO&apos;S (MANDATORY ACTIONS)</span>
                </div>
                <ul className="space-y-2">
                  {activeTopic.dos.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-emerald-950 flex items-start gap-2 leading-relaxed"
                    >
                      <span className="font-bold text-emerald-600 shrink-0">
                        {idx + 1}.
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* DONT's */}
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/60">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-3">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">
                    ✕
                  </span>
                  <span>DON&apos;TS (DANGEROUS MISTAKES)</span>
                </div>
                <ul className="space-y-2">
                  {activeTopic.donts.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-rose-950 flex items-start gap-2 leading-relaxed"
                    >
                      <span className="font-bold text-rose-600 shrink-0">
                        {idx + 1}.
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CRITICAL LIFE SAFETY TIP */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <FaExclamationTriangle className="text-amber-600 text-sm shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900">
                  Critical Life Safety Rule
                </p>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  {activeTopic.criticalTip}
                </p>
              </div>
            </div>

            {/* QUICK LINK TO 112 / 108 */}
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-black/[0.06] flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-blue-600" />
                <span>Life-threatening medical or disaster situation?</span>
              </div>
              <a
                href="tel:112"
                className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition active:scale-95"
              >
                Call 112 Now
              </a>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 border-t border-black/[0.06] bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <p className="text-[11px]">
            Always prioritize personal safety before administering first-aid to others.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition active:scale-95"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
