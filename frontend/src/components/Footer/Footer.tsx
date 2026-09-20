import { FaShieldAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-white border-t border-black/[0.06] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm shadow-xs">
              <FaShieldAlt />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">ResQNet Disaster Platform</p>
              <p className="text-xs text-gray-400">Next-gen emergency triage & response network</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-500 font-medium">
            <Link to="/" className="hover:text-gray-900 transition">
              Home
            </Link>
            <Link to="/report-emergency" className="hover:text-gray-900 transition">
              Report Emergency
            </Link>
            <Link to="/dashboard" className="hover:text-gray-900 transition">
              Command Map
            </Link>
            <Link to="/track" className="hover:text-gray-900 transition">
              Track Incident
            </Link>
            <Link to="/login" className="hover:text-gray-900 transition">
              Responder Portal
            </Link>
          </div>

          <p className="text-xs text-gray-400">
            © 2026 ResQNet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;