import { useState, useEffect, useRef } from "react";
import {
  FaTimes,
  FaLightbulb,
  FaExpand,
  FaCompress,
  FaVolumeUp,
  FaVolumeMute,
  FaExclamationTriangle,
  FaShieldAlt,
} from "react-icons/fa";
import { beaconController } from "../../utils/torchBeacon";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyBeaconModal({ isOpen, onClose }: Props) {
  const [isActive, setIsActive] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const stopFnRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (stopFnRef.current) {
        stopFnRef.current();
      }
      beaconController.stop();
    };
  }, []);

  // When modal is closed, ensure beacon is turned off
  useEffect(() => {
    if (!isOpen) {
      if (stopFnRef.current) {
        stopFnRef.current();
        stopFnRef.current = null;
      }
      beaconController.stop();
      setIsActive(false);
      setIsFlashOn(false);
      setFullscreenMode(false);
    }
  }, [isOpen]);

  const handleToggleBeacon = async () => {
    if (isActive) {
      if (stopFnRef.current) {
        stopFnRef.current();
        stopFnRef.current = null;
      }
      beaconController.stop();
      setIsActive(false);
      setIsFlashOn(false);
    } else {
      setIsActive(true);
      // Attempt device hardware torch activation
      beaconController.enableTorch().catch(() => {});

      const stop = await beaconController.startSOSLoop(
        (flash) => setIsFlashOn(flash),
        soundEnabled
      );
      stopFnRef.current = stop;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="beacon-modal-title"
      className={`fixed inset-0 z-[130] flex items-center justify-center p-4 transition-colors duration-100 ${
        fullscreenMode && isFlashOn
          ? "bg-white"
          : fullscreenMode && !isFlashOn
          ? "bg-black"
          : "bg-black/75 backdrop-blur-md"
      }`}
      onClick={(e) => {
        if (fullscreenMode) {
          setFullscreenMode(false);
        } else if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* FULLSCREEN FLASHING VIEW */}
      {fullscreenMode ? (
        <div className="absolute inset-0 flex flex-col items-center justify-between p-8 select-none pointer-events-auto">
          <div className="w-full flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                isFlashOn ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              🚨 RESQNET SOS OPTICAL BEACON
            </span>
            <button
              onClick={() => setFullscreenMode(false)}
              className={`p-3 rounded-full text-base font-bold shadow-lg ${
                isFlashOn ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              <FaCompress />
            </button>
          </div>

          <div className="text-center">
            <h1
              className={`text-7xl sm:text-9xl font-black tracking-tighter ${
                isFlashOn ? "text-black" : "text-white"
              }`}
            >
              SOS
            </h1>
            <p
              className={`text-sm sm:text-base font-extrabold uppercase tracking-widest mt-4 ${
                isFlashOn ? "text-black/80" : "text-white/80"
              }`}
            >
              • • • — — — • • •
            </p>
          </div>

          <div
            className={`text-xs font-semibold px-4 py-2 rounded-xl text-center max-w-sm ${
              isFlashOn ? "bg-black/10 text-black" : "bg-white/10 text-white"
            }`}
          >
            Hold phone screen towards sky, window, or rescue opening. Tap anywhere to exit fullscreen.
          </div>
        </div>
      ) : (
        /* STANDARD MODAL CARD */
        <div
          className="relative w-full max-w-md bg-gray-900 text-white rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold text-sm">
                <FaLightbulb />
              </div>
              <div className="text-left">
                <h3 id="beacon-modal-title" className="text-sm font-bold text-white">
                  SOS Optical & Acoustic Beacon
                </h3>
                <p className="text-[11px] text-gray-400">
                  Rescue Locator & Emergency Strobe
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white flex items-center justify-center transition active:scale-95"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>

          {/* MAIN STROBE CONTROLLER */}
          <div className="p-8 space-y-6">
            {/* PULSE BEACON BUTTON */}
            <div className="relative flex items-center justify-center py-4">
              {isActive && isFlashOn && (
                <div className="absolute w-44 h-44 rounded-full bg-amber-400/30 animate-ping"></div>
              )}
              {isActive && (
                <div className="absolute w-36 h-36 rounded-full bg-amber-500/20 animate-pulse"></div>
              )}

              <button
                type="button"
                onClick={handleToggleBeacon}
                className={`relative z-10 w-28 h-28 rounded-full font-black text-base flex flex-col items-center justify-center gap-1 shadow-2xl transition-all duration-100 active:scale-95 border-4 ${
                  isActive
                    ? isFlashOn
                      ? "bg-amber-400 text-black border-white shadow-amber-400/50 scale-105"
                      : "bg-red-700 text-white border-red-500 shadow-red-900/40"
                    : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-750"
                }`}
              >
                <span className="text-2xl">
                  {isActive ? "⚡" : "🚨"}
                </span>
                <span className="text-xs uppercase tracking-wider font-extrabold">
                  {isActive ? "BEACON ON" : "START SOS"}
                </span>
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-extrabold text-white">
                {isActive ? "Broadcasting Distress Signal" : "Distress Beacon Ready"}
              </p>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                {isActive
                  ? "Emitting international SOS Morse sequence (3 short, 3 long, 3 short) via screen & device torch."
                  : "Activates high-intensity visual flashes and acoustic alarm to guide search & rescue parties."}
              </p>
            </div>

            {/* CONTROLS ROW */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 ${
                  soundEnabled
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-white/5 border-white/10 text-gray-500"
                }`}
              >
                {soundEnabled ? (
                  <>
                    <FaVolumeUp className="text-amber-400" />
                    <span>Alarm Sound ON</span>
                  </>
                ) : (
                  <>
                    <FaVolumeMute />
                    <span>Alarm Muted</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFullscreenMode(true);
                  if (!isActive) handleToggleBeacon();
                }}
                className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
              >
                <FaExpand />
                <span>Full-Screen Strobe</span>
              </button>
            </div>

            {/* LIFE SAFETY NOTICE */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-gray-400 flex items-start gap-2.5 text-left">
              <FaExclamationTriangle className="text-amber-400 shrink-0 mt-0.5 text-xs" />
              <span>
                Night aerial search teams and K9 search units look for periodic light pulses. Conserve battery once rescuers acknowledge contact.
              </span>
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-6 py-3 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5 text-[11px]">
              <FaShieldAlt className="text-blue-400" />
              Emergency Triage Tool
            </span>
            <button
              onClick={onClose}
              className="text-xs text-gray-300 hover:text-white font-medium"
            >
              Close Beacon
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
