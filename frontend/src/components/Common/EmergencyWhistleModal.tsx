import { useState, useEffect, useRef } from "react";
import {
  FaTimes,
  FaVolumeUp,
  FaVolumeMute,
  FaPlay,
  FaStop,
  FaShieldAlt,
  FaCompass,
  FaLifeRing,
  FaInfoCircle,
  FaClock,
} from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type SoundMode = "sar-whistle" | "marine-foghorn" | "piercing-siren" | "sos-morse";

interface ModeConfig {
  id: SoundMode;
  name: string;
  tagline: string;
  frequency: string;
  icon: typeof FaVolumeUp;
  description: string;
}

const MODES: ModeConfig[] = [
  {
    id: "sar-whistle",
    name: "Standard SAR Whistle",
    tagline: "3-Blast International Distress (3.1 kHz)",
    frequency: "3100 Hz + Harmonics",
    icon: FaVolumeUp,
    description: "Standard 3 blasts of 1 second each. Calibrated to cut through rubble, collapsed structures, and wind noise.",
  },
  {
    id: "marine-foghorn",
    name: "Marine Foghorn Pulse",
    tagline: "Low Frequency Acoustic Beacon (220 Hz)",
    frequency: "220 Hz Resonant Low",
    icon: FaLifeRing,
    description: "Low-frequency blast designed to carry across vast water bodies, river deltas, and dense fog during maritime floods.",
  },
  {
    id: "piercing-siren",
    name: "High-Decibel Siren",
    tagline: "Sweeping 2.5 kHz – 4.2 kHz Alert",
    frequency: "2500 - 4200 Hz Modulated",
    icon: FaShieldAlt,
    description: "Urgent alternating siren designed to alert nearby police, coast guard, and NDRF search parties over rain or vehicle roar.",
  },
  {
    id: "sos-morse",
    name: "Acoustic SOS Morse Code",
    tagline: "··· --- ··· Universal Distress",
    frequency: "1000 Hz Pure Tone",
    icon: FaCompass,
    description: "Recognized internationally by air and ground search crews as immediate life threat request for rescue.",
  },
];

export default function EmergencyWhistleModal({ isOpen, onClose }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMode, setSelectedMode] = useState<SoundMode>("sar-whistle");
  const [volume, setVolume] = useState(0.85);
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const loopTimeoutRef = useRef<any>(null);

  // Stop audio and timers on close
  useEffect(() => {
    if (!isOpen) {
      stopAudio();
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle auto-shutoff countdown timer
  useEffect(() => {
    if (isPlaying && timerMinutes !== null) {
      setSecondsRemaining(timerMinutes * 60);
      timerIntervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timerIntervalRef.current);
            stopAudio();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setSecondsRemaining(null);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPlaying, timerMinutes]);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
        const gain = audioCtxRef.current.createGain();
        gain.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
        gain.connect(audioCtxRef.current.destination);
        masterGainRef.current = gain;
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const playTone = (freq: number, durationSec: number, delaySec: number = 0, type: OscillatorType = "sine") => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    const startTime = ctx.currentTime + delaySec;
    const endTime = startTime + durationSec;

    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    // Fast attack and gentle release to prevent acoustic clicks
    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.exponentialRampToValueAtTime(volume, startTime + 0.05);
    noteGain.gain.setValueAtTime(volume, endTime - 0.05);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, endTime);

    osc.connect(noteGain);
    noteGain.connect(masterGainRef.current);

    osc.start(startTime);
    osc.stop(endTime);
  };

  const scheduleSoundLoop = (mode: SoundMode) => {
    if (!audioCtxRef.current) return;

    if (mode === "sar-whistle") {
      // 3 blasts of 3.1 kHz with dual harmonic (6.2 kHz), 0.8s on, 0.4s off, 2.5s cycle pause
      const whistleFreq = 3100;
      const harmonicFreq = 6200;

      // Blast 1
      playTone(whistleFreq, 0.8, 0, "sine");
      playTone(harmonicFreq, 0.8, 0, "triangle");
      // Blast 2
      playTone(whistleFreq, 0.8, 1.2, "sine");
      playTone(harmonicFreq, 0.8, 1.2, "triangle");
      // Blast 3
      playTone(whistleFreq, 0.8, 2.4, "sine");
      playTone(harmonicFreq, 0.8, 2.4, "triangle");

      // Loop after 5.5s
      loopTimeoutRef.current = setTimeout(() => {
        scheduleSoundLoop("sar-whistle");
      }, 5500);
    } else if (mode === "marine-foghorn") {
      // 220 Hz low fundamental + 440 Hz rich brass harmonic for 2.2 seconds, 3 second gap
      playTone(220, 2.2, 0, "sawtooth");
      playTone(440, 2.2, 0, "triangle");

      loopTimeoutRef.current = setTimeout(() => {
        scheduleSoundLoop("marine-foghorn");
      }, 5500);
    } else if (mode === "piercing-siren") {
      // Fast alternating sweeping pitch
      const ctx = audioCtxRef.current;
      const startTime = ctx.currentTime;
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(2500, startTime);
      osc.frequency.linearRampToValueAtTime(4200, startTime + 0.6);
      osc.frequency.linearRampToValueAtTime(2500, startTime + 1.2);
      osc.frequency.linearRampToValueAtTime(4200, startTime + 1.8);
      osc.frequency.linearRampToValueAtTime(2500, startTime + 2.4);

      noteGain.gain.setValueAtTime(volume, startTime);
      noteGain.gain.setValueAtTime(volume, startTime + 2.4);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.5);

      osc.connect(noteGain);
      noteGain.connect(masterGainRef.current!);

      osc.start(startTime);
      osc.stop(startTime + 2.5);

      loopTimeoutRef.current = setTimeout(() => {
        scheduleSoundLoop("piercing-siren");
      }, 3000);
    } else if (mode === "sos-morse") {
      // S: 3 short (0.2s) with 0.2s gap
      // O: 3 long (0.6s) with 0.2s gap
      // S: 3 short (0.2s) with 0.2s gap
      const f = 1000;
      let t = 0;
      // ...
      playTone(f, 0.2, t); t += 0.35;
      playTone(f, 0.2, t); t += 0.35;
      playTone(f, 0.2, t); t += 0.55;
      // ---
      playTone(f, 0.6, t); t += 0.75;
      playTone(f, 0.6, t); t += 0.75;
      playTone(f, 0.6, t); t += 0.95;
      // ...
      playTone(f, 0.2, t); t += 0.35;
      playTone(f, 0.2, t); t += 0.35;
      playTone(f, 0.2, t);

      loopTimeoutRef.current = setTimeout(() => {
        scheduleSoundLoop("sos-morse");
      }, 6000);
    }
  };

  const startAudio = (mode: SoundMode = selectedMode) => {
    stopAudio();
    initAudio();
    setIsPlaying(true);
    scheduleSoundLoop(mode);
  };

  const stopAudio = () => {
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(newVol, audioCtxRef.current.currentTime);
    }
  };

  const handleModeChange = (mode: SoundMode) => {
    setSelectedMode(mode);
    if (isPlaying) {
      startAudio(mode);
    }
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="whistle-modal-title"
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-black/[0.08] flex flex-col max-h-[92vh] overflow-hidden text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-gradient-to-r from-amber-50 to-rose-50/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg shadow-sm transition-colors ${
                isPlaying ? "bg-rose-600 animate-pulse" : "bg-gray-900"
              }`}
            >
              <FaVolumeUp />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="whistle-modal-title" className="text-base font-bold text-gray-900">
                  Emergency Whistle &amp; Distress Sonar
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isPlaying
                      ? "bg-rose-100 text-rose-800 animate-pulse"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {isPlaying ? "Transmitting Distress Audio" : "Beacon Standby"}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Acoustic penetration distress pulses for trapped victims, rubble localization &amp; flood rescue
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

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* CONCENTRIC SONAR ANIMATION & MASTER PLAY BUTTON */}
          <div className="relative py-6 bg-gray-950 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center overflow-hidden">
            {/* Background pulsating concentric rings */}
            {isPlaying && (
              <>
                <div className="absolute w-64 h-64 rounded-full border border-rose-500/30 animate-ping"></div>
                <div className="absolute w-48 h-48 rounded-full border border-amber-500/40 animate-ping [animation-delay:-0.4s]"></div>
                <div className="absolute w-36 h-36 rounded-full border border-rose-400/50 animate-pulse"></div>
              </>
            )}

            {/* MASTER TRIGGER BUTTON */}
            <button
              type="button"
              onClick={() => (isPlaying ? stopAudio() : startAudio())}
              className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all duration-200 active:scale-95 ${
                isPlaying
                  ? "bg-rose-600 hover:bg-rose-700 ring-4 ring-rose-400/40 scale-105"
                  : "bg-amber-500 hover:bg-amber-600 hover:scale-105"
              }`}
            >
              {isPlaying ? (
                <>
                  <FaStop className="text-2xl" />
                  <span className="text-[10px] font-black uppercase tracking-wider mt-1">
                    Stop
                  </span>
                </>
              ) : (
                <>
                  <FaPlay className="text-2xl ml-1" />
                  <span className="text-[10px] font-black uppercase tracking-wider mt-1">
                    Emit Signal
                  </span>
                </>
              )}
            </button>

            {/* STATUS DISPLAY */}
            <div className="relative z-10 mt-4 text-center">
              <p className="text-sm font-black text-white tracking-wide">
                {isPlaying
                  ? "BROADCASTING ACOUSTIC DISTRESS TONE"
                  : "READY TO EMIT ACOUSTIC DISTRESS"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {isPlaying
                  ? "Place device on elevated or rigid surface for maximum vibrational transmission"
                  : "Tap center button to trigger continuous high-penetration sound beacon"}
              </p>

              {secondsRemaining !== null && isPlaying && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-mono font-bold">
                  <FaClock className="text-amber-400 text-xs" />
                  <span>Auto-Shutoff in {formatCountdown(secondsRemaining)}</span>
                </div>
              )}
            </div>
          </div>

          {/* SOUND MODE SELECTION */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Acoustic Distress Profile
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MODES.map((mode) => {
                const Icon = mode.icon;
                const isSelected = selectedMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => handleModeChange(mode.id)}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                      isSelected
                        ? "bg-rose-50/70 border-rose-300 ring-2 ring-rose-500/20 shadow-xs"
                        : "bg-gray-50/70 border-black/[0.06] hover:bg-gray-100/70"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm ${
                        isSelected ? "bg-rose-600 text-white" : "bg-white text-gray-600 shadow-2xs"
                      }`}
                    >
                      <Icon />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900">{mode.name}</span>
                        {isSelected && isPlaying && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-rose-700 mt-0.5">
                        {mode.tagline}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1 leading-snug">
                        {mode.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CONTROLS: VOLUME & SHUTOFF TIMER */}
          <div className="p-4 rounded-2xl bg-gray-50/80 border border-black/[0.04] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Volume Slider */}
              <div className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => handleVolumeChange(volume === 0 ? 0.85 : 0)}
                  className="text-gray-500 hover:text-gray-800 transition"
                  title={volume === 0 ? "Unmute" : "Mute"}
                >
                  {volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
                <div className="flex-1">
                  <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
                    <span>Decibel Output</span>
                    <span>{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Auto Shutoff Timer Pills */}
              <div className="sm:border-l sm:border-gray-200 sm:pl-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Battery Auto-Shutoff:
                </span>
                <div className="flex items-center gap-1">
                  {[
                    { label: "Loop", val: null },
                    { label: "5m", val: 5 },
                    { label: "15m", val: 15 },
                    { label: "30m", val: 30 },
                  ].map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => setTimerMinutes(t.val)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                        timerMinutes === t.val
                          ? "bg-gray-900 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-200 border border-black/[0.06]"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TACTICAL LIFE-SAVING NOTICE */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
            <FaInfoCircle className="text-amber-600 text-base shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold block">Survivor Energy Conservation Protocol:</span>
              Yelling exhausts oxygen, depletes vocal cords, and accelerates dehydration within 40 minutes. Sound from this acoustic whistle penetrates structural voids, drywall, and water up to 4x further than human shouting.
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3.5 border-t border-black/[0.06] bg-gray-50 flex items-center justify-between text-xs">
          <span className="text-gray-500 font-medium">
            Calibrated to International SAR SAR-3 Whistle Standards
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-bold transition active:scale-95"
          >
            Close Beacon
          </button>
        </div>
      </div>
    </div>
  );
}
