import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import CriticalAlertBanner from "../Common/CriticalAlertBanner";
import EmergencyHotlinesModal from "../Common/EmergencyHotlinesModal";
import DisasterGuideModal from "../Common/DisasterGuideModal";
import type { Notification } from "../../types";
import {
  apiGetNotifications,
  apiMarkAllNotificationsRead,
  apiMarkNotificationRead,
} from "../../services/api";
import {
  FaShieldAlt,
  FaSignOutAlt,
  FaHandsHelping,
  FaUser,
  FaSearchLocation,
  FaChevronDown,
  FaPlusCircle,
  FaMapMarkedAlt,
  FaBell,
  FaCheckDouble,
  FaExclamationTriangle,
  FaInfoCircle,
  FaChartPie,
  FaBoxes,
  FaHospital,
  FaPhoneAlt,
  FaBookOpen,
} from "react-icons/fa";

function Navbar() {
  const { user, logout, quickLoginAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hotlinesOpen, setHotlinesOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideTopic, setGuideTopic] = useState<string | undefined>(undefined);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    try {
      const data = await apiGetNotifications();
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      // Ignore background notification poll errors
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        demoRef.current &&
        !demoRef.current.contains(event.target as Node)
      ) {
        setDemoMenuOpen(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleOpenGuide = (e: any) => {
      if (e?.detail?.topicId) {
        setGuideTopic(e.detail.topicId);
      }
      setGuideOpen(true);
    };
    window.addEventListener("open-disaster-guide", handleOpenGuide);
    return () => window.removeEventListener("open-disaster-guide", handleOpenGuide);
  }, []);

  const handleQuickLogin = async (role: "citizen" | "volunteer" | "admin") => {
    setDemoMenuOpen(false);
    const success = await quickLoginAs(role);
    if (success) {
      if (role === "admin") navigate("/dashboard");
      else if (role === "volunteer") navigate("/volunteer/dashboard");
      else navigate("/citizen/dashboard");
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      await apiMarkNotificationRead(n._id);
      setNotifications((prev) =>
        prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setNotifOpen(false);

    if (n.relatedReportId) {
      if (user?.role === "volunteer") navigate("/volunteer/dashboard");
      else if (user?.role === "admin") navigate("/dashboard");
      else navigate(`/track/${n.relatedReportId}`);
    }
  };

  const handleMarkAllRead = async () => {
    await apiMarkAllNotificationsRead();
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Top Level Critical Emergency Broadcast */}
      <CriticalAlertBanner />

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                <FaShieldAlt className="text-xl" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-gray-900 leading-tight">
                  ResQNet
                </span>
                <span className="text-[11px] font-medium text-gray-600 tracking-wider uppercase">
                  Disaster Response
                </span>
              </div>
            </Link>

            {/* Central Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 bg-gray-100/80 p-1 rounded-full border border-black/[0.04]">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive("/")
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Home
              </Link>

              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive("/dashboard")
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FaMapMarkedAlt className="text-xs" />
                Live Map & Triage
              </Link>

              <Link
                to="/analytics"
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive("/analytics")
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FaChartPie className="text-xs text-blue-600" />
                Analytics
              </Link>

              <Link
                to="/resources"
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive("/resources")
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FaBoxes className="text-xs text-emerald-600" />
                Resources
              </Link>

              <Link
                to="/facilities"
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive("/facilities")
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FaHospital className="text-xs text-purple-600" />
                Shelters
              </Link>

              <Link
                to="/track"
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive("/track")
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FaSearchLocation className="text-xs" />
                Track
              </Link>

              {user?.role === "volunteer" && (
                <Link
                  to="/volunteer/dashboard"
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive("/volunteer/dashboard")
                      ? "bg-blue-50 text-blue-700 font-semibold shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <FaHandsHelping className="text-xs text-blue-600" />
                  Desk
                </Link>
              )}

              {user?.role === "citizen" && (
                <Link
                  to="/citizen/dashboard"
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive("/citizen/dashboard")
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <FaUser className="text-xs" />
                  My Reports
                </Link>
              )}
            </div>

            {/* Right Action Area */}
            <div className="flex items-center gap-2.5">
              {/* SOS Hotlines Modal Trigger */}
              <button
                type="button"
                onClick={() => setHotlinesOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold border border-red-200 transition active:scale-95 shadow-2xs"
                title="24/7 National Emergency & Disaster Helplines"
              >
                <FaPhoneAlt className="text-[10px] animate-pulse text-red-600" />
                <span>SOS Helplines</span>
              </button>

              {/* Disaster & First-Aid Survival Guide Trigger */}
              <button
                type="button"
                onClick={() => {
                  setGuideTopic(undefined);
                  setGuideOpen(true);
                }}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200/80 transition active:scale-95 shadow-2xs"
                title="Disaster Survival & First-Aid Protocols"
              >
                <FaBookOpen className="text-[10px] text-blue-600" />
                <span>First-Aid Guide</span>
              </button>

              {/* Report Emergency CTA */}
              <Link
                to="/report-emergency"
                className="hidden sm:inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-semibold px-3.5 py-2 rounded-full shadow-sm shadow-red-500/25 transition-all duration-150"
              >
                <FaPlusCircle className="text-xs" />
                <span>Report Emergency</span>
              </Link>

              {/* Notification Bell Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 border border-black/[0.06] text-gray-700 relative transition"
                  title="Notifications & Alerts"
                >
                  <FaBell className="text-sm" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popover */}
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-black/[0.08] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                      <div className="flex items-center gap-2">
                        <FaBell className="text-xs text-blue-600" />
                        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                          Incident Alert Center
                        </span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.2 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>

                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition"
                        >
                          <FaCheckDouble className="text-[10px]" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                      {notifications.length === 0 ? (
                        <div className="text-center py-10 px-4">
                          <FaInfoCircle className="text-2xl text-gray-300 mx-auto mb-2" />
                          <p className="text-xs font-semibold text-gray-700">No Notifications</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Real-time disaster dispatches will appear here.
                          </p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3.5 text-left cursor-pointer transition hover:bg-gray-50 ${
                              !n.isRead ? "bg-blue-50/40 font-medium" : "opacity-80"
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <span
                                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs shadow-2xs ${
                                  n.type === "alert"
                                    ? "bg-red-100 text-red-600"
                                    : n.type === "assignment"
                                    ? "bg-blue-100 text-blue-600"
                                    : n.type === "status"
                                    ? "bg-emerald-100 text-emerald-600"
                                    : "bg-purple-100 text-purple-600"
                                }`}
                              >
                                {n.type === "alert" ? (
                                  <FaExclamationTriangle />
                                ) : (
                                  <FaShieldAlt />
                                )}
                              </span>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <p className="text-xs font-bold text-gray-900 truncate">
                                    {n.title}
                                  </p>
                                  {!n.isRead && (
                                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">
                                  {n.message}
                                </p>
                                <span className="text-[10px] text-gray-400 mt-1 block">
                                  {new Date(n.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile / Auth Area */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200/80 border border-black/[0.06] transition-all text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <div className="hidden sm:flex flex-col">
                      <span className="text-xs font-semibold text-gray-900 max-w-[90px] truncate">
                        {user.name}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider ${
                          user.role === "admin"
                            ? "text-purple-600"
                            : user.role === "volunteer"
                            ? "text-blue-600"
                            : "text-gray-500"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <FaChevronDown className="text-[9px] text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-black/[0.08] py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        <div className="mt-1.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : user.role === "volunteer"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {user.role} Account
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                        >
                          <FaMapMarkedAlt className="text-blue-600" />
                          Live Map & Triage
                        </Link>

                        <Link
                          to="/analytics"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                        >
                          <FaChartPie className="text-blue-600" />
                          Disaster Analytics
                        </Link>

                        <Link
                          to="/resources"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                        >
                          <FaBoxes className="text-emerald-600" />
                          Relief Resources
                        </Link>

                        <Link
                          to="/facilities"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                        >
                          <FaHospital className="text-purple-600" />
                          Shelters & Hospitals
                        </Link>

                        {user.role === "volunteer" && (
                          <Link
                            to="/volunteer/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                          >
                            <FaHandsHelping className="text-blue-600" />
                            Responder Desk
                          </Link>
                        )}

                        <Link
                          to="/citizen/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                        >
                          <FaUser className="text-gray-500" />
                          Citizen Portal
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 pt-1 mt-1">
                        <button
                          onClick={() => {
                            logout();
                            setDropdownOpen(false);
                            navigate("/");
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left font-medium"
                        >
                          <FaSignOutAlt />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Demo Switcher */}
                  <div className="relative" ref={demoRef}>
                    <button
                      onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-black/[0.06] transition"
                    >
                      <span>⚡ Demo Login</span>
                      <FaChevronDown className="text-[9px]" />
                    </button>

                    {demoMenuOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-black/[0.08] py-2 z-50">
                        <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          One-Click Demo Roles
                        </div>
                        <button
                          onClick={() => handleQuickLogin("admin")}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          Admin / Dispatcher
                        </button>
                        <button
                          onClick={() => handleQuickLogin("volunteer")}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Volunteer / Responder
                        </button>
                        <button
                          onClick={() => handleQuickLogin("citizen")}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Citizen Account
                        </button>
                      </div>
                    )}
                  </div>

                  <Link
                    to="/login"
                    className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition"
                  >
                    Log In
                  </Link>

                  <Link
                    to="/register"
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gray-900 hover:bg-black text-white shadow-sm transition active:scale-95"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 24/7 Disaster Helplines Modal */}
      <EmergencyHotlinesModal
        isOpen={hotlinesOpen}
        onClose={() => setHotlinesOpen(false)}
      />

      {/* Disaster Survival & First-Aid Guide Modal */}
      <DisasterGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        defaultTopicId={guideTopic}
      />
    </>
  );
}

export default Navbar;