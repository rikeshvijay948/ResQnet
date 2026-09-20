import {
  FaExclamationTriangle,
  FaMapMarkedAlt,
  FaHandsHelping,
  FaRoute,
} from "react-icons/fa";

const FEATURES_DATA = [
  {
    icon: FaExclamationTriangle,
    iconBg: "bg-red-50 text-red-600",
    title: "Instant GPS Emergency Reporting",
    description:
      "Capture high-accuracy coordinates, disaster severity, people impacted, and description in seconds.",
  },
  {
    icon: FaMapMarkedAlt,
    iconBg: "bg-blue-50 text-blue-600",
    title: "Live Spatial Triage Map",
    description:
      "Visualize active emergency clusters across regions with interactive popups and status workflows.",
  },
  {
    icon: FaHandsHelping,
    iconBg: "bg-emerald-50 text-emerald-600",
    title: "Volunteer Responder Dispatch",
    description:
      "Mobilize certified volunteers based on availability, specialized skills, and proximity to crises.",
  },
  {
    icon: FaRoute,
    iconBg: "bg-purple-50 text-purple-600",
    title: "Real-Time Citizen Tracking",
    description:
      "Citizens follow full incident lifecycle from initial broadcast to responder dispatch and final resolution.",
  },
];

function Features() {
  return (
    <section className="py-16 sm:py-24 bg-white/50 border-t border-black/[0.04]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
            Engineered Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            A Unified Platform for Rapid Crisis Response
          </h2>
          <p className="text-sm text-gray-500 mt-3">
            Designed to eliminate coordination bottlenecks during critical disaster moments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES_DATA.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-black/[0.06] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${feat.iconBg} flex items-center justify-center text-xl mb-4 shadow-xs`}
                >
                  <Icon />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed flex-1">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Features;