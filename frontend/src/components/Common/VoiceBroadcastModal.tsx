import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTimes,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeUp,
  FaCopy,
  FaPaperPlane,
  FaRedo,
  FaCheck,
  FaRobot,
} from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptComplete?: (text: string) => void;
}

export default function VoiceBroadcastModal({
  isOpen,
  onClose,
  onTranscriptComplete,
}: Props) {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let currentInterim = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => (prev + " " + finalTranscript).trim());
        }
        setInterimText(currentInterim);
      };

      recognition.onerror = (err: any) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn("Could not initialize SpeechRecognition:", e);
      setSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop listening and speaking on modal close
  useEffect(() => {
    if (!isOpen) {
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        setIsListening(false);
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
      }
    }
  }, [isOpen, isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      setInterimText("");
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn("Start listening error:", e);
      }
    }
  };

  const handleClear = () => {
    setTranscript("");
    setInterimText("");
  };

  const handleCopy = () => {
    const fullText = (transcript + " " + interimText).trim();
    if (!fullText) return;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReadAloud = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const textToSpeak =
      (transcript + " " + interimText).trim() ||
      "Voice emergency assistant ready. Speak clearly to dictate crisis location, casualties, and hazards.";

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleDispatchReport = () => {
    const fullText = (transcript + " " + interimText).trim();
    if (onTranscriptComplete && fullText) {
      onTranscriptComplete(fullText);
    }
    onClose();
    // Navigate with pre-filled description state
    navigate("/report-emergency", {
      state: { prefilledDescription: fullText },
    });
  };

  // Keyword extraction for real-time hazard tags
  const detectedHazards = (() => {
    const full = (transcript + " " + interimText).toLowerCase();
    const tags: string[] = [];
    if (full.includes("fire") || full.includes("smoke") || full.includes("flame")) tags.push("🔥 Fire Hazard");
    if (full.includes("flood") || full.includes("water") || full.includes("drown")) tags.push("🌊 Flood / Water Surge");
    if (full.includes("trapped") || full.includes("rubble") || full.includes("collapsed")) tags.push("🚪 Trapped Citizens");
    if (full.includes("bleed") || full.includes("injured") || full.includes("unconscious") || full.includes("cpr")) tags.push("🩹 Medical Critical");
    if (full.includes("electric") || full.includes("wire") || full.includes("power")) tags.push("⚡ High Voltage");
    return tags;
  })();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-modal-title"
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-black/[0.08] flex flex-col overflow-hidden text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-gradient-to-r from-gray-50 to-rose-50/40">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg text-white shadow-sm transition-colors ${
              isListening ? "bg-rose-600 animate-pulse" : "bg-gray-900"
            }`}>
              <FaMicrophone />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="voice-modal-title" className="text-base font-bold text-gray-900">
                  Hands-Free Voice Dispatcher
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isListening
                    ? "bg-rose-100 text-rose-700 animate-pulse"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {isListening ? "Listening Active" : "Microphone Ready"}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Dictate crisis descriptions and location without touching your device
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

        {/* BODY */}
        <div className="p-6 space-y-5">
          {/* AUDIO WAVEFORM & MIC BUTTON */}
          <div className="flex flex-col items-center justify-center py-4 bg-gray-50/70 rounded-3xl border border-black/[0.04] text-center">
            <div className="relative mb-4">
              {isListening && (
                <>
                  <div className="absolute -inset-4 rounded-full bg-rose-400/20 animate-ping"></div>
                  <div className="absolute -inset-2 rounded-full bg-rose-500/30 animate-pulse"></div>
                </>
              )}

              <button
                type="button"
                onClick={toggleListening}
                className={`relative z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all duration-150 active:scale-95 ${
                  isListening
                    ? "bg-rose-600 ring-4 ring-rose-200 scale-105"
                    : "bg-gray-900 hover:bg-black"
                }`}
                title={isListening ? "Stop Voice Recording" : "Tap to Start Voice Dictation"}
              >
                {isListening ? (
                  <FaMicrophoneSlash className="text-2xl" />
                ) : (
                  <FaMicrophone className="text-2xl" />
                )}
                <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">
                  {isListening ? "Listening" : "Speak"}
                </span>
              </button>
            </div>

            {/* REAL-TIME SOUND WAVE ANIMATION */}
            {isListening ? (
              <div className="flex items-center gap-1.5 h-6">
                <span className="w-1 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s] h-4"></span>
                <span className="w-1 bg-rose-600 rounded-full animate-bounce [animation-delay:-0.15s] h-6"></span>
                <span className="w-1 bg-rose-500 rounded-full animate-bounce h-3"></span>
                <span className="w-1 bg-rose-600 rounded-full animate-bounce [animation-delay:-0.25s] h-5"></span>
                <span className="w-1 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.1s] h-6"></span>
                <span className="w-1 bg-rose-600 rounded-full animate-bounce [animation-delay:-0.35s] h-4"></span>
              </div>
            ) : (
              <p className="text-xs text-gray-500 font-medium">
                Tap microphone to begin emergency voice dictation
              </p>
            )}
          </div>

          {/* REAL-TIME TRANSCRIPT TEXTBOX */}
          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Transcribed Voice Memo
            </label>
            <div className="min-h-[110px] max-h-[180px] overflow-y-auto p-4 rounded-2xl bg-white border border-black/[0.08] shadow-inner text-sm leading-relaxed text-gray-900">
              {transcript || interimText ? (
                <>
                  <span>{transcript}</span>
                  {interimText && (
                    <span className="text-gray-400 italic"> {interimText}</span>
                  )}
                </>
              ) : (
                <span className="text-gray-400 italic text-xs">
                  Speak naturally into your device: e.g., &quot;Gas leak and heavy smoke on 2nd floor, 3 families trapped, need fire brigade and oxygen units immediately.&quot;
                </span>
              )}
            </div>

            {/* QUICK ACTIONS OVER TEXT */}
            <div className="flex items-center justify-between mt-2 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                {detectedHazards.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[10px] shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReadAloud}
                  className="px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-semibold flex items-center gap-1 transition"
                  title="Read transcript aloud"
                >
                  <FaVolumeUp className={speaking ? "text-rose-600 animate-pulse" : ""} />
                  <span>{speaking ? "Stop" : "Read Aloud"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 text-[11px] font-semibold flex items-center gap-1 transition"
                  title="Clear transcript"
                >
                  <FaRedo className="text-[9px]" />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </div>

          {!supported && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <FaRobot className="text-amber-600 shrink-0 text-sm" />
              <span>
                Browser speech recognition is in fallback mode. You can still type notes or use voice keyboard dictation.
              </span>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-black/[0.06] bg-gray-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-gray-100 border border-black/[0.08] text-gray-700 font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-2xs"
          >
            {copied ? <FaCheck className="text-emerald-600" /> : <FaCopy />}
            <span>{copied ? "Copied" : "Copy Memo"}</span>
          </button>

          <button
            type="button"
            onClick={handleDispatchReport}
            className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-red-500/20 transition active:scale-95"
          >
            <FaPaperPlane className="text-xs" />
            <span>Transfer to Incident Dispatch</span>
          </button>
        </div>
      </div>
    </div>
  );
}
