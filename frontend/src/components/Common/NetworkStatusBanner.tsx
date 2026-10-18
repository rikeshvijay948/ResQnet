import { useState, useEffect } from "react";
import { FaWifi, FaExclamationTriangle, FaCheckCircle, FaTimes } from "react-icons/fa";

export default function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showRestored, setShowRestored] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setDismissed(false);
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
      setDismissed(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (dismissed) return null;

  if (!isOnline) {
    return (
      <div className="bg-amber-600 text-white px-4 py-2 text-xs font-semibold shadow-md flex items-center justify-between sticky top-0 z-50 animate-in fade-in duration-200">
        <div className="flex items-center gap-2 max-w-7xl mx-auto flex-1 justify-center">
          <FaExclamationTriangle className="text-sm shrink-0 animate-pulse" />
          <span>
            <strong>Offline Mode Detected:</strong> Network connectivity lost in your area. ResQNet local cache active — forms and GPS coordinates will sync once connectivity returns.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-white/80 hover:text-white p-1 rounded-md transition ml-2"
          title="Dismiss warning"
        >
          <FaTimes className="text-xs" />
        </button>
      </div>
    );
  }

  if (showRestored) {
    return (
      <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold shadow-md flex items-center justify-between sticky top-0 z-50 animate-in fade-in duration-200">
        <div className="flex items-center gap-2 max-w-7xl mx-auto flex-1 justify-center">
          <FaCheckCircle className="text-sm shrink-0" />
          <FaWifi className="text-sm shrink-0" />
          <span>
            <strong>Connection Restored:</strong> ResQNet network telemetry and incident queues are re-synchronized.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowRestored(false)}
          className="text-white/80 hover:text-white p-1 rounded-md transition ml-2"
          title="Dismiss notice"
        >
          <FaTimes className="text-xs" />
        </button>
      </div>
    );
  }

  return null;
}
