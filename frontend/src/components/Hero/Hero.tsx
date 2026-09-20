import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaShieldAlt,
  FaArrowRight,
  FaMapMarkedAlt,
  FaHandsHelping,
  FaExclamationCircle,
  FaSearchLocation,
} from "react-icons/fa";

function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-400/10 via-indigo-400/10 to-rose-400/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-black/[0.06] text-xs font-semibold text-gray-700 shadow-xs mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span>Next-Generation Disaster Response Network</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-950 leading-[1.1]">
          Disaster Management <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            Engineered with Precision.
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto font-normal leading-relaxed">
          ResQNet bridges affected citizens, emergency responders, and command dispatchers with live spatial tracking and rapid volunteer mobilization.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={() => navigate("/report-emergency")}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold text-sm shadow-md shadow-red-500/25 transition-all flex items-center justify-center gap-2"
          >
            <FaExclamationCircle className="text-base" />
            <span>Report an Emergency</span>
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/80 hover:bg-white active:scale-95 text-gray-900 border border-black/[0.08] font-semibold text-sm shadow-sm backdrop-blur-md transition-all flex items-center justify-center gap-2"
          >
            <FaMapMarkedAlt className="text-base text-blue-600" />
            <span>Open Command Map</span>
          </button>

          <button
            onClick={() => navigate("/track")}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <FaSearchLocation className="text-sm" />
            <span>Track Incident</span>
          </button>
        </div>

        {/* Quick Role Access Strip */}
        <div className="mt-14 pt-8 border-t border-black/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div
            onClick={() => navigate(user?.role === "volunteer" ? "/volunteer/dashboard" : "/register")}
            className="p-5 rounded-2xl bg-white/60 hover:bg-white/90 border border-black/[0.04] shadow-xs cursor-pointer transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform">
              <FaHandsHelping />
            </div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center justify-between">
              <span>Volunteer Responder</span>
              <FaArrowRight className="text-xs text-gray-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Join certified rescue teams and receive live dispatch missions.
            </p>
          </div>

          <div
            onClick={() => navigate("/citizen/dashboard")}
            className="p-5 rounded-2xl bg-white/60 hover:bg-white/90 border border-black/[0.04] shadow-xs cursor-pointer transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform">
              <FaShieldAlt />
            </div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center justify-between">
              <span>Citizen SafeZone</span>
              <FaArrowRight className="text-xs text-gray-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Log reports, monitor rescue status, and access emergency helplines.
            </p>
          </div>

          <div
            onClick={() => navigate("/dashboard")}
            className="p-5 rounded-2xl bg-white/60 hover:bg-white/90 border border-black/[0.04] shadow-xs cursor-pointer transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform">
              <FaMapMarkedAlt />
            </div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center justify-between">
              <span>Admin Triage Hub</span>
              <FaArrowRight className="text-xs text-gray-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Interactive map markers, multi-criteria filtering, and dispatch controls.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;