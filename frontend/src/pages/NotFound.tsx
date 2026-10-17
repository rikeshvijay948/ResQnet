import { Link } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import {
  FaExclamationCircle,
  FaHome,
  FaAmbulance,
  FaChartPie,
  FaSearchLocation,
} from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 py-16 w-full flex-1 flex items-center justify-center">
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-8 sm:p-12 shadow-xl border border-black/[0.06] text-center w-full">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-6 text-2xl shadow-sm">
            <FaExclamationCircle />
          </div>

          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-wider">
            404 — Page Not Found
          </span>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mt-4">
            Lost in the Emergency Grid?
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed max-w-sm mx-auto">
            The destination you requested does not exist or may have been relocated. Use these quick shortcuts to access active emergency coordination services:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 text-left">
            <Link
              to="/report-emergency"
              className="p-3.5 bg-red-50/70 hover:bg-red-50 border border-red-200/80 rounded-2xl flex items-center gap-3 transition group"
            >
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center text-sm shadow-xs group-hover:scale-105 transition">
                <FaAmbulance />
              </div>
              <div>
                <p className="text-xs font-bold text-red-900">Report Crisis</p>
                <p className="text-[11px] text-red-700">Dispatch live alert</p>
              </div>
            </Link>

            <Link
              to="/dashboard"
              className="p-3.5 bg-blue-50/70 hover:bg-blue-50 border border-blue-200/80 rounded-2xl flex items-center gap-3 transition group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm shadow-xs group-hover:scale-105 transition">
                <FaSearchLocation />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-900">Command Center</p>
                <p className="text-[11px] text-blue-700">Interactive live map</p>
              </div>
            </Link>

            <Link
              to="/analytics"
              className="p-3.5 bg-purple-50/70 hover:bg-purple-50 border border-purple-200/80 rounded-2xl flex items-center gap-3 transition group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center text-sm shadow-xs group-hover:scale-105 transition">
                <FaChartPie />
              </div>
              <div>
                <p className="text-xs font-bold text-purple-900">Analytics Hub</p>
                <p className="text-[11px] text-purple-700">Disaster telemetry</p>
              </div>
            </Link>

            <Link
              to="/"
              className="p-3.5 bg-gray-50 hover:bg-gray-100 border border-black/[0.06] rounded-2xl flex items-center gap-3 transition group"
            >
              <div className="w-9 h-9 rounded-xl bg-gray-800 text-white flex items-center justify-center text-sm shadow-xs group-hover:scale-105 transition">
                <FaHome />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Return Home</p>
                <p className="text-[11px] text-gray-500">Platform overview</p>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400">
        © 2026 ResQNet. Professional Disaster Coordination Platform.
      </footer>
    </div>
  );
}
