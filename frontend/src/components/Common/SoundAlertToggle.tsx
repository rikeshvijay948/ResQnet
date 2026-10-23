import { useState, useEffect } from "react";
import { FaVolumeUp, FaVolumeMute, FaBullhorn } from "react-icons/fa";
import { soundAlerts } from "../../utils/soundAlerts";

export default function SoundAlertToggle() {
  const [enabled, setEnabled] = useState(soundAlerts.isEnabled());
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      if (customEvent.detail) {
        setEnabled(customEvent.detail.enabled);
      } else {
        setEnabled(soundAlerts.isEnabled());
      }
    };

    window.addEventListener("resqnet_audio_alerts_changed", handleSync);
    return () => window.removeEventListener("resqnet_audio_alerts_changed", handleSync);
  }, []);

  const handleToggle = () => {
    const next = soundAlerts.toggle();
    setEnabled(next);
  };

  const handleTestSiren = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlayingTest(true);
    soundAlerts.playCriticalSiren();
    setTimeout(() => setIsPlayingTest(false), 1200);
  };

  return (
    <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-black/[0.08] shadow-xs">
      <button
        type="button"
        onClick={handleToggle}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition active:scale-95 ${
          enabled
            ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/60"
            : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent"
        }`}
        title={enabled ? "Audible dispatch alerts active. Click to mute." : "Enable live siren/chime alerts for incoming emergencies."}
      >
        {enabled ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <FaVolumeUp className="text-red-600 text-xs" />
            <span>Sirens ON</span>
          </>
        ) : (
          <>
            <FaVolumeMute className="text-gray-400 text-xs" />
            <span>Sirens Muted</span>
          </>
        )}
      </button>

      {enabled && (
        <button
          type="button"
          onClick={handleTestSiren}
          disabled={isPlayingTest}
          className="px-2 py-1.5 rounded-xl text-[10px] font-bold text-gray-500 hover:text-red-700 hover:bg-red-50 transition"
          title="Test Dispatch Siren"
        >
          <FaBullhorn className={`text-[10px] ${isPlayingTest ? "animate-bounce text-red-600" : ""}`} />
        </button>
      )}
    </div>
  );
}
