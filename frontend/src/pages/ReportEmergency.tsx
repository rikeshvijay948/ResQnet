import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar/Navbar";
import {
  apiAIClassifyText,
  apiGetReports,
  apiUploadImage,
  getFullImageUrl,
} from "../services/api";
import { getDistanceKm } from "../utils/geo";
import type { AIClassificationResult, Report } from "../types";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaCrosshairs,
  FaExclamationTriangle,
  FaUsers,
  FaPhoneAlt,
  FaUser,
  FaCheckCircle,
  FaCopy,
  FaArrowRight,
  FaImage,
  FaTrash,
  FaMagic,
  FaShieldAlt,
  FaCamera,
  FaTimes,
  FaSyncAlt,
  FaRedo,
} from "react-icons/fa";

function ReportEmergency() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [location, setLocation] = useState("");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const [disasterType, setDisasterType] = useState("");
  const [severity, setSeverity] = useState("");
  const [peopleAffected, setPeopleAffected] = useState("");
  const [description, setDescription] = useState("");

  // AI Assistant state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIClassificationResult | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<Report | null>(null);

  // Media / Photo state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Live Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<"environment" | "user">("user");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (user) {
      if (!fullName && user.name) setFullName(user.name);
      if (!phoneNumber && user.phone) setPhoneNumber(user.phone);
    }
  }, [user]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Ensure camera stream is attached as soon as video DOM element mounts
  useEffect(() => {
    if (isCameraOpen && cameraStream && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = cameraStream;
      video.onloadedmetadata = () => {
        video.play().catch((err) => console.warn("Video play error on metadata:", err));
      };
      video.play().catch((err) => console.warn("Direct video play error:", err));
    }
  }, [isCameraOpen, cameraStream]);

  // Check for nearby duplicates whenever location changes
  useEffect(() => {
    const checkDuplicates = async () => {
      if (!latitude || !longitude) return;

      try {
        const res = await apiGetReports();
        if (res.success && res.reports) {
          const matched = res.reports.find((r) => {
            if (r.status === "Resolved" || !r.latitude || !r.longitude) return false;
            const dist = getDistanceKm(latitude, longitude, r.latitude, r.longitude);
            return dist !== null && dist <= 1.2;
          });
          setDuplicateWarning(matched || null);
        }
      } catch (err) {
        // Silently fail duplicate check
      }
    };

    checkDuplicates();
  }, [latitude, longitude, disasterType]);

  // ==========================================
  // LIVE CAMERA CONTROLS
  // ==========================================

  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async (facing: "environment" | "user" = "user") => {
    stopCameraStream();
    setCameraLoading(true);
    setCameraError("");
    setIsCameraOpen(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported on this browser or device.");
      }

      let stream: MediaStream;
      try {
        // Try requested facing mode first
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (modeErr) {
        console.warn("FacingMode constraint failed, falling back to standard video query:", modeErr);
        // Fallback for laptop / desktop webcams
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setCameraStream(stream);
      setCameraFacingMode(facing);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera permission was denied. Please allow camera permissions in browser settings."
          : err.message || "Unable to access camera on this device."
      );
    } finally {
      setCameraLoading(false);
    }
  };

  const switchCamera = () => {
    const nextFacing = cameraFacingMode === "environment" ? "user" : "environment";
    startCamera(nextFacing);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flip horizontally if user-facing front camera
    if (cameraFacingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const filename = `camera-incident-${Date.now()}.jpg`;
          const file = new File([blob], filename, { type: "image/jpeg" });
          setImageFile(file);
          setImagePreview(URL.createObjectURL(blob));
          stopCameraStream();
          setIsCameraOpen(false);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  const closeCameraModal = () => {
    stopCameraStream();
    setIsCameraOpen(false);
    setCameraError("");
  };

  // ==========================================
  // AI ASSISTED AUTO-CLASSIFICATION
  // ==========================================

  const handleAIAutoClassify = async () => {
    if (!description.trim()) {
      alert("Please enter a brief description first to let the AI analyze the crisis details.");
      return;
    }

    setAiLoading(true);

    try {
      const res = await apiAIClassifyText(description, Number(peopleAffected) || 1);
      if (res.success && res.classification) {
        setAiResult(res.classification);
        if (res.classification.disasterType && res.classification.disasterType !== "Other") {
          setDisasterType(res.classification.disasterType);
        }
        if (res.classification.severity) {
          setSeverity(res.classification.severity);
        }
      }
    } catch (err) {
      console.error("AI Auto-Classify Error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  // ==========================================
  // IMAGE SELECTION & PREVIEW
  // ==========================================

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // ==========================================
  // LOCATION SEARCH & GPS
  // ==========================================

  const searchLocation = async () => {
    if (!location.trim()) {
      setLocationMessage("⚠️ Please enter a location keyword first.");
      return;
    }

    setLocationLoading(true);
    setLocationMessage("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          location
        )}&limit=1`
      );

      if (!response.ok) throw new Error("Location search failed");
      const data = await response.json();

      if (data.length === 0) {
        setLatitude(null);
        setLongitude(null);
        setLocationMessage("❌ Location not found. Try a broader city or landmark.");
        return;
      }

      const lat = Number(data[0].lat);
      const lng = Number(data[0].lon);

      setLatitude(lat);
      setLongitude(lng);
      setLocation(data[0].display_name);
      setLocationMessage("✅ Location pin successfully resolved!");
    } catch (error) {
      console.error("Location search error:", error);
      setLocationMessage("❌ Unable to geocode this location.");
    } finally {
      setLocationLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("❌ Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    setLocationMessage("🛰️ Acquiring high-accuracy GPS coordinates...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lng);
        setLocation(`GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setLocationMessage("✅ High-accuracy GPS coordinates secured!");
        setLocationLoading(false);
      },
      (error) => {
        console.error("Location error:", error);
        setLocationLoading(false);
        setLocationMessage("❌ Unable to pinpoint GPS position. Please type your city.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // ==========================================
  // SUBMIT REPORT
  // ==========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !fullName ||
      !phoneNumber ||
      !emergencyContact ||
      !location ||
      !disasterType ||
      !severity ||
      !peopleAffected
    ) {
      alert("⚠️ Please fill in all required fields marked with *");
      return;
    }

    setSubmitting(true);
    let uploadedImageUrl = "";

    if (imageFile) {
      setUploadingImage(true);
      try {
        const uploadRes = await apiUploadImage(imageFile);
        if (uploadRes.success && uploadRes.url) {
          uploadedImageUrl = uploadRes.url;
        }
      } catch (uploadErr) {
        console.warn("Image upload warning:", uploadErr);
      } finally {
        setUploadingImage(false);
      }
    }

    const reportData = {
      fullName,
      phoneNumber,
      emergencyContact,
      location,
      latitude,
      longitude,
      disasterType,
      severity,
      peopleAffected: Number(peopleAffected),
      description,
      userId: user?._id || null,
      imageUrl: uploadedImageUrl,
    };

    try {
      const response = await fetch("http://localhost:5000/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user ? { Authorization: `Bearer ${localStorage.getItem("resqnet_token")}` } : {}),
        },
        body: JSON.stringify(reportData),
      });

      const data = await response.json();

      if (data.success && data.report) {
        setSubmittedReport(data.report);
      } else {
        alert("❌ Failed to submit emergency report: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("❌ Could not connect to the ResQNet dispatch server.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyReportId = () => {
    if (submittedReport?._id) {
      navigator.clipboard.writeText(submittedReport._id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const resetForm = () => {
    setSubmittedReport(null);
    setFullName(user?.name || "");
    setPhoneNumber(user?.phone || "");
    setEmergencyContact("");
    setLocation("");
    setLatitude(null);
    setLongitude(null);
    setLocationMessage("");
    setDisasterType("");
    setSeverity("");
    setPeopleAffected("");
    setDescription("");
    setImageFile(null);
    setImagePreview(null);
    setAiResult(null);
    setDuplicateWarning(null);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10 w-full">
        {/* SUCCESS CONFIRMATION MODAL CARD */}
        {submittedReport ? (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 sm:p-12 shadow-2xl border border-black/[0.06] text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <FaCheckCircle className="text-3xl" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Emergency Report Dispatched
            </h1>
            <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">
              Your report has been broadcast to emergency dispatchers, nearby certified responders, and local authorities.
            </p>

            {submittedReport.priorityRank && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold shadow-xs">
                <span>Calculated Priority:</span>
                <span className="bg-red-600 text-white px-2 py-0.5 rounded-md">
                  {submittedReport.priorityRank}
                </span>
                <span>(Score: {submittedReport.priorityScore || 50}/100)</span>
              </div>
            )}

            {submittedReport.imageUrl && (
              <div className="mt-6 max-w-xs mx-auto rounded-2xl overflow-hidden border border-black/[0.08] shadow-sm">
                <img
                  src={getFullImageUrl(submittedReport.imageUrl)}
                  alt="Disaster evidence"
                  className="w-full h-40 object-cover"
                />
              </div>
            )}

            <div className="mt-6 p-5 bg-gray-50 rounded-2xl border border-black/[0.06] max-w-md mx-auto text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Incident Reference ID
              </p>
              <div className="flex items-center justify-between mt-2">
                <code className="text-base font-mono font-bold text-gray-900 truncate">
                  {submittedReport._id}
                </code>
                <button
                  type="button"
                  onClick={copyReportId}
                  className="ml-3 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-black/[0.08] text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition"
                >
                  <FaCopy className="text-xs" />
                  <span>{copiedId ? "Copied!" : "Copy"}</span>
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Save this Reference ID to track real-time rescue status.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <button
                onClick={() => navigate(`/track/${submittedReport._id}`)}
                className="w-full sm:w-auto flex-1 py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
              >
                <span>Track Live Progress</span>
                <FaArrowRight className="text-xs" />
              </button>

              <button
                onClick={resetForm}
                className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm transition"
              >
                Submit Another Report
              </button>
            </div>
          </div>
        ) : (
          /* EMERGENCY FORM */
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-xl border border-black/[0.06]">
            {/* Header */}
            <div className="border-b border-black/[0.06] pb-6 mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold mb-3 border border-red-200/60">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                Emergency Dispatch Portal
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Report an Emergency
              </h1>
              <p className="text-sm text-gray-500 mt-1.5">
                Submit disaster details to alert nearby certified rescue teams and dispatchers immediately.
              </p>
            </div>

            {/* LIVE DUPLICATE WARNING BANNER */}
            {duplicateWarning && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3 animate-in fade-in duration-200">
                <FaExclamationTriangle className="text-amber-600 text-base shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">
                    Similar Emergency Detected Nearby:
                  </p>
                  <p className="mt-0.5 text-amber-800">
                    A <strong>{duplicateWarning.disasterType}</strong> incident was recently logged at{" "}
                    <strong>{duplicateWarning.location}</strong> (~{duplicateWarning.peopleAffected} people impacted).
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/track/${duplicateWarning._id}`)}
                      className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition"
                    >
                      Track Existing Incident ↗
                    </button>
                    <span className="text-[11px] text-amber-700">Or continue submitting below if new</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SECTION 1: CITIZEN INFORMATION */}
              <div className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <FaUser className="text-[11px]" />
                  <span>Reporter Contact Information</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-50/70 border border-black/[0.08] rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-50/70 border border-black/[0.08] rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                    Emergency Alternate Contact Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <FaPhoneAlt className="text-xs" />
                    </div>
                    <input
                      type="tel"
                      placeholder="Secondary contact or family member phone"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      required
                      className="w-full pl-9 pr-4 py-3 bg-gray-50/70 border border-black/[0.08] rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: LOCATION & GPS */}
              <div className="space-y-3 pt-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-[11px]" />
                  <span>Incident Location & GPS Coordinates</span>
                </h2>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter city, district or landmark e.g. Dadar, Mumbai"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setLatitude(null);
                      setLongitude(null);
                      setLocationMessage("");
                    }}
                    required
                    className="flex-1 px-4 py-3 bg-gray-50/70 border border-black/[0.08] rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />

                  <button
                    type="button"
                    onClick={searchLocation}
                    disabled={locationLoading}
                    className="px-4 py-3 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-2xl transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <FaSearch className="text-xs" />
                    <span>{locationLoading ? "..." : "Search"}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <FaCrosshairs className="text-xs" />
                    <span>Auto-Detect My GPS Location</span>
                  </button>

                  {locationMessage && (
                    <span className="text-xs font-medium text-gray-600">
                      {locationMessage}
                    </span>
                  )}
                </div>

                {latitude !== null && longitude !== null && (
                  <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-semibold">GPS Coordinates Locked:</span>
                      <span className="font-mono">
                        {latitude.toFixed(5)}, {longitude.toFixed(5)}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600">Ready</span>
                  </div>
                )}
              </div>

              {/* SECTION 3: DESCRIPTION & AI ASSISTANT */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <FaExclamationTriangle className="text-[11px]" />
                    <span>Emergency Situation Description</span>
                  </h2>

                  {/* AI AUTO-CLASSIFY BUTTON */}
                  <button
                    type="button"
                    onClick={handleAIAutoClassify}
                    disabled={aiLoading}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 flex items-center gap-1.5 transition active:scale-95 shadow-2xs disabled:opacity-50"
                  >
                    <FaMagic className={`text-xs ${aiLoading ? "animate-spin" : "text-purple-600"}`} />
                    <span>{aiLoading ? "AI Analyzing Text..." : "✨ AI Auto-Classify"}</span>
                  </button>
                </div>

                <textarea
                  placeholder="Describe the crisis details: water rising, flames, trapped individuals, medical injuries, power outage, or special assistance needed..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50/70 border border-black/[0.08] rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition resize-y"
                />

                {/* AI Classification Insights Card */}
                {aiResult && (
                  <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200/80 text-xs space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-900 flex items-center gap-1.5">
                        <FaShieldAlt className="text-purple-600" />
                        <span>AI Triage Analysis ({aiResult.confidence}% confidence)</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-800 font-bold text-[10px]">
                        Auto-Filled Form
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {aiResult.hazards.map((h, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-800 font-semibold text-[11px]"
                        >
                          {h}
                        </span>
                      ))}
                    </div>

                    <p className="text-[11px] text-purple-700 pt-1">
                      <strong>Casualty Threat:</strong> {aiResult.casualtyRisk}
                    </p>
                  </div>
                )}

                {/* Classification Selectors Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Disaster Type */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                      Disaster Type *
                    </label>
                    <select
                      value={disasterType}
                      onChange={(e) => setDisasterType(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-50/70 border border-black/[0.08] rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    >
                      <option value="">Select Disaster Type</option>
                      <option value="Flood">🌊 Flood</option>
                      <option value="Fire">🔥 Fire</option>
                      <option value="Earthquake">🌍 Earthquake</option>
                      <option value="Cyclone">🌪️ Cyclone</option>
                      <option value="Landslide">⛰️ Landslide</option>
                      <option value="Other">⚠️ Other Emergency</option>
                    </select>
                  </div>

                  {/* Severity */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                      Severity Level *
                    </label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-50/70 border border-black/[0.08] rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    >
                      <option value="">Select Severity</option>
                      <option value="Low">🟢 Low (Monitoring)</option>
                      <option value="Medium">🟡 Medium (Assistance needed)</option>
                      <option value="High">🟠 High (Urgent attention)</option>
                      <option value="Critical">🔴 Critical (Immediate rescue)</option>
                    </select>
                  </div>

                  {/* People Affected */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 ml-1">
                      People Affected *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <FaUsers className="text-xs" />
                      </div>
                      <input
                        type="number"
                        min="1"
                        placeholder="Estimated count"
                        value={peopleAffected}
                        onChange={(e) => setPeopleAffected(e.target.value)}
                        required
                        className="w-full pl-9 pr-4 py-3 bg-gray-50/70 border border-black/[0.08] rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: CAMERA CAPTURE & IMAGE UPLOAD */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1 ml-1">
                    Disaster Photo Evidence (Live Camera or Upload)
                  </label>

                  {imagePreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-black/[0.08] bg-gray-50 p-2.5 flex items-center gap-4">
                      <img
                        src={imagePreview}
                        alt="Captured Scene"
                        className="w-20 h-20 object-cover rounded-xl border border-black/[0.06] shadow-xs"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {imageFile?.name || "Incident-Photo.jpg"}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {imageFile ? `${(imageFile.size / (1024 * 1024)).toFixed(2)} MB` : "Photo Ready"}
                        </p>
                        <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
                          <FaCheckCircle className="text-[10px]" />
                          Ready for dispatch attachment
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mr-1">
                        <button
                          type="button"
                          onClick={() => startCamera("user")}
                          className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          title="Retake Photo"
                        >
                          <FaRedo className="text-xs" />
                        </button>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                          title="Remove Photo"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* 1. LIVE CAMERA BUTTON */}
                      <button
                        type="button"
                        onClick={() => startCamera("user")}
                        className="flex flex-col items-center justify-center gap-2 p-5 bg-blue-50/60 hover:bg-blue-50 border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-2xl cursor-pointer transition text-center group"
                      >
                        <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg shadow-sm shadow-blue-500/30 group-hover:scale-105 transition">
                          <FaCamera />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-blue-900 block">
                            📸 Open Live Camera
                          </span>
                          <span className="text-[11px] text-blue-600">
                            Snap instant disaster photo
                          </span>
                        </div>
                      </button>

                      {/* 2. FILE CHOOSER BUTTON */}
                      <label className="flex flex-col items-center justify-center gap-2 p-5 bg-gray-50/70 hover:bg-gray-100/70 border-2 border-dashed border-black/[0.08] hover:border-black/20 rounded-2xl cursor-pointer transition text-center group">
                        <div className="w-11 h-11 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-lg group-hover:scale-105 transition">
                          <FaImage />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">
                            Upload File / Gallery
                          </span>
                          <span className="text-[11px] text-gray-500">
                            JPG, PNG, WEBP up to 10MB
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-red-500/25 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploadingImage
                  ? "Uploading Disaster Photo..."
                  : submitting
                  ? "Broadcasting Emergency..."
                  : "🚨 Dispatch Emergency Report"}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* =====================================================
          APPLE-INSPIRED LIVE CAMERA VIEWFINDER MODAL
          ===================================================== */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl w-full max-w-md border border-white/10 flex flex-col">
            {/* Camera Header */}
            <div className="p-4 bg-gray-900/90 text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Live Viewfinder
                </span>
              </div>
              <button
                type="button"
                onClick={closeCameraModal}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* Video Stream Container */}
            <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden min-h-[280px]">
              {cameraLoading ? (
                <div className="text-center text-white">
                  <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <span className="text-xs text-gray-300">Initializing camera sensor...</span>
                </div>
              ) : cameraError ? (
                <div className="p-6 text-center text-white space-y-3">
                  <FaExclamationTriangle className="text-3xl text-amber-400 mx-auto" />
                  <p className="text-xs text-gray-300">{cameraError}</p>
                  <label className="inline-block px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer transition">
                    Upload from Gallery Instead
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        handleImageChange(e);
                        closeCameraModal();
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="w-full h-full relative flex items-center justify-center bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${
                      cameraFacingMode === "user" ? "scale-x-[-1]" : ""
                    }`}
                    style={{ display: "block", minHeight: "280px" }}
                  />
                  {/* Framing Grid Overlay */}
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/10">
                    <div className="border-r border-b border-white/10"></div>
                    <div className="border-r border-b border-white/10"></div>
                    <div className="border-b border-white/10"></div>
                    <div className="border-r border-b border-white/10"></div>
                    <div className="border-r border-b border-white/10"></div>
                    <div className="border-b border-white/10"></div>
                    <div className="border-r border-white/10"></div>
                    <div className="border-r border-white/10"></div>
                    <div></div>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls Bar */}
            <div className="p-5 bg-gray-950 flex items-center justify-between">
              {/* Switch Camera Button */}
              <button
                type="button"
                onClick={switchCamera}
                disabled={cameraLoading || !!cameraError}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm transition disabled:opacity-30"
                title="Flip Camera"
              >
                <FaSyncAlt />
              </button>

              {/* Shutter Capture Button */}
              <button
                type="button"
                onClick={capturePhoto}
                disabled={cameraLoading || !!cameraError}
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center p-1 group transition active:scale-90 disabled:opacity-30"
                title="Capture Photo"
              >
                <div className="w-full h-full bg-white rounded-full group-hover:bg-red-500 transition"></div>
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={closeCameraModal}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="py-6 text-center text-xs text-gray-400">
        © 2026 ResQNet. Professional Disaster Coordination Platform.
      </footer>
    </div>
  );
}

export default ReportEmergency;